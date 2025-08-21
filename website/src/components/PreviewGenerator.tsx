import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Globe, Server, ExternalLink, Settings, AlertTriangle, ChevronDown, List, Download, Terminal, Code, FileCode, Braces } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { validateIPAddress, validateDomain, validateDomainIPPair } from "@/lib/validation";
import TurnstileWidget from "./TurnstileWidget";
import { PrivacyDialog } from "./PrivacyDialog";

const PreviewGenerator = () => {
  // Single domain state
  const [serverIp, setServerIp] = useState("");
  const [domain, setDomain] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Batch domain state
  const [batchInput, setBatchInput] = useState("");
  const [batchPreviewUrls, setBatchPreviewUrls] = useState<Array<{
    domain: string, 
    ip: string, 
    url: string, 
    protocol: string, 
    port?: string, 
    username?: string, 
    password?: string
  }>>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchDomainSettings, setBatchDomainSettings] = useState<Record<string, {
    protocol: string;
    port: string;
    username: string;
    password: string;
    passwordProtected: boolean;
    useHttps: boolean;
    disableHtmlJsInjection: boolean;
  }>>({});
  
  // Advanced options state (shared between both modes)
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useHttps, setUseHttps] = useState(true);
  const [customPort, setCustomPort] = useState("");
  const [disableHtmlJsInjection, setDisableHtmlJsInjection] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  
  // Turnstile state
  const [singleTurnstileToken, setSingleTurnstileToken] = useState("");
  const [batchTurnstileToken, setBatchTurnstileToken] = useState("");
  const [singleCaptchaKey, setSingleCaptchaKey] = useState(0);
  const [batchCaptchaKey, setBatchCaptchaKey] = useState(0);
  
  // Validation state
  const [serverIpError, setServerIpError] = useState("");
  const [domainError, setDomainError] = useState("");
  
  const { toast } = useToast();

  const generatePreviewUrl = async () => {
    setServerIpError("");
    setDomainError("");

    if (!serverIp || !domain) {
      toast({
        title: "Missing Information",
        description: "Please enter both server IP and domain name.",
        variant: "destructive",
      });
      return;
    }

    // Validate IP address
    const ipValidation = validateIPAddress(serverIp);
    if (!ipValidation.isValid) {
      setServerIpError(ipValidation.message || "Invalid IP address");
      return;
    }

    // Validate domain
    const domainValidation = validateDomain(domain);
    if (!domainValidation.isValid) {
      setDomainError(domainValidation.message || "Invalid domain name");
      return;
    }

    if (!singleTurnstileToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    // Check if advanced options need confirmation
    if ((passwordProtected || !useHttps || customPort) && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsGenerating(true);
    setShowConfirmation(false);

    const payloadSingle = {
      domain,
      ip: serverIp,
      protocol: useHttps ? 'https' : 'http',
      port: customPort || null,
      passwordProtected,
      username: passwordProtected ? username : null,
      password: passwordProtected ? password : null,
      disableHtmlJsInjection,
      turnstileToken: singleTurnstileToken,
    };
    try {
      await fetch(`https://${import.meta.env.VITE_API_URL}/bypassdns/createlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadSingle)
      }).then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || "Unknown error");
        }
        return response.json();
      })
      .then(data => {
        setPreviewUrl(`https://${data.link}`)
        setIsGenerating(false);
        toast({
          title: "Preview Link Generated!",
          description: "Your temporary preview link is ready to use.",
        });
      })
      .catch(error => {
        setIsGenerating(false);
        toast({
          title: "Error!",
          description: error.message,
          variant: "destructive"
        });
      });
    } catch (e) {
      setIsGenerating(false);
      toast({
        title: "Error!",
        description: "There was an error trying to generate your link.",
        variant: "destructive"
      });
    }

  };

  const generateBatchPreviewUrls = async () => {
    const entries = batchInput.trim().split(',').filter(entry => entry.trim());
    const parsedEntries: Array<{
      domain: string, 
      ip: string, 
      protocol: string, 
      port?: string, 
      username?: string, 
      password?: string
    }> = [];
    
    if (!batchTurnstileToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate all entries first
    for (const entry of entries) {
      const validation = validateDomainIPPair(entry);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: `Line "${entry}": ${validation.message}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Parse initial domain:ip pairs and use settings from batchDomainSettings
    for (const entry of entries) {
      const validation = validateDomainIPPair(entry);
      if (!validation.isValid || !validation.domain || !validation.ip) {
        continue; // This shouldn't happen since we validated above, but safety check
      }
      
      const { domain, ip } = validation;
      
      // Get settings for this domain or use defaults
      const settings = batchDomainSettings[domain] || {
        protocol: 'https',
        port: '',
        username: '',
        password: '',
        passwordProtected: false,
        useHttps: true,
        disableHtmlJsInjection: false
      };
      
      parsedEntries.push({ 
        domain, 
        ip, 
        protocol: settings.useHttps ? 'https' : 'http',
        port: settings.port || undefined,
        username: settings.passwordProtected ? settings.username : undefined,
        password: settings.passwordProtected ? settings.password : undefined
      });
    }
    
    if (parsedEntries.length === 0) {
      toast({
        title: "No Valid Entries",
        description: "Please enter at least one domain:ip pair.",
        variant: "destructive",
      });
      return;
    }

    setIsBatchGenerating(true);
        
    // Simulate API call for batch generation (send JSON to external endpoint, ignore response)
    const payloadBatch = {
      entries: parsedEntries.map(({ domain, ip, protocol, port, username, password }) => ({
        domain,
        ip,
        protocol,
        port: port || null,
        username: username || null,
        password: password || null,
        disableHtmlJsInjection: (batchDomainSettings[domain]?.disableHtmlJsInjection ?? false),
        passwordProtected: (batchDomainSettings[domain]?.passwordProtected ?? false),
      })),
      turnstileToken: batchTurnstileToken,
    };
    try {
      await fetch(`https://${import.meta.env.VITE_API_URL}/bypassdns/createbatchlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadBatch),
      }).then(response => {
        return response.json();
      })
      .then(data => {

        const generatedUrls = data.map(response => {
          return {
            domain: response.domain, 
            ip: response.ip, 
            url: response.link, 
            protocol: response.protocol, 
            port: response.port, 
            username: response.username, 
            password: response.password
          }
        });
        console.log(generatedUrls)
        setBatchPreviewUrls(generatedUrls);
        setIsBatchGenerating(false);
        toast({
          title: "Preview Link Generated!",
          description: "Your temporary preview link is ready to use.",
        });
      })
    } catch (e) {
        toast({
          title: "Error!",
          description: "There was an error trying to generate your link.",
        });
    }
  };

  // Parse current batch input to show individual domain entries
  const parsedBatchEntries = batchInput.trim().split(',').filter(entry => entry.trim()).map(entry => {
    const trimmedEntry = entry.trim();
    const parts = trimmedEntry.split(':').map(part => part.trim());
    if (parts.length >= 2) {
      const [domain, ip] = parts;
      return { domain, ip, raw: trimmedEntry };
    }
    return null;
  }).filter(Boolean) as Array<{domain: string, ip: string, raw: string}>;

  // Update domain settings
  const updateDomainSetting = (domain: string, key: string, value: any) => {
    setBatchDomainSettings(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain] || {
          protocol: 'https',
          port: '',
          username: '',
          password: '',
          passwordProtected: false,
          useHttps: true,
          disableHtmlJsInjection: false
        },
        [key]: value
      }
    }));
  };

  const resetSingleGenerator = () => {
    setPreviewUrl("");
    setServerIp("");
    setDomain("");
    setSingleTurnstileToken("");
    setShowConfirmation(false);
    setPasswordProtected(false);
    setUsername("");
    setPassword("");
    setUseHttps(true);
    setCustomPort("");
    setDisableHtmlJsInjection(false);
    setAdvancedOptionsOpen(false);
    setSingleCaptchaKey(prev => prev + 1); // Force CAPTCHA reload
    
    toast({
      title: "Reset Complete",
      description: "Ready to generate a new preview link.",
    });
  };

  const resetBatchGenerator = () => {
    setBatchPreviewUrls([]);
    setBatchInput("");
    setBatchTurnstileToken("");
    setBatchDomainSettings({});
    setBatchCaptchaKey(prev => prev + 1); // Force CAPTCHA reload
    
    toast({
      title: "Reset Complete", 
      description: "Ready to generate new batch preview links.",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast({
        title: "Copied!",
        description: "Preview URL copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const copyBatchToClipboard = async () => {
    const batchText = batchPreviewUrls.map(({domain, url}) => `${domain}: ${url}`).join('\n');
    try {
      await navigator.clipboard.writeText(batchText);
      toast({
        title: "Copied!",
        description: "All batch URLs copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const saveBatchToFile = () => {
    const formattedText = batchPreviewUrls.map(({domain, url, username, password}) => {
      let entry = `Domain: ${domain}\nTemp link: https://${url}`;
      
      if (username && password) {
        entry += `\nUser: ${username}\nPassword: ${password}`;
      }
      
      entry += '\n-=-=-=-=-=-=-=-=-=-=-=-=-';
      return entry;
    }).join('\n\n');
    
    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-preview-links.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Saved!",
      description: "Batch links exported to file.",
    });
  };

  return (
    <section className="py-20 bg-background" id="create-link">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Generate Your Preview Link</h2>
            <p className="text-xl text-muted-foreground">
              Enter your server details to create an instant preview of your website
            </p>
          </div>

          <Card className="border-border/50 shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                DNS Preview Generator
              </CardTitle>
              <CardDescription>
                Create a temporary link to preview your website before DNS propagation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Single Domain
                  </TabsTrigger>
                  <TabsTrigger value="batch" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Batch Creation
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="domain" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Domain Name
                    </Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        if (domainError) setDomainError("");
                      }}
                      className={cn("font-mono", domainError && "border-destructive")}
                      disabled={!!previewUrl}
                    />
                    {domainError && (
                      <p className="text-sm text-destructive">{domainError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-ip" className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Server IP Address
                    </Label>
                    <Input
                      id="server-ip"
                      placeholder="192.168.1.100"
                      value={serverIp}
                      onChange={(e) => {
                        setServerIp(e.target.value);
                        if (serverIpError) setServerIpError("");
                      }}
                      className={cn("font-mono", serverIpError && "border-destructive")}
                      disabled={!!previewUrl}
                    />
                    {serverIpError && (
                      <p className="text-sm text-destructive">{serverIpError}</p>
                    )}
                  </div>
                  </div>

                  {/* Privacy Policy & Terms */}
                  <div className="flex flex-col items-center space-y-2 py-2">
                    <p className="text-sm text-muted-foreground text-center">
                      By creating a temporary link here <strong>YOU AGREE WITH</strong> the following terms and policies.
                    </p>
                    <PrivacyDialog />
                  </div>

                  {/* Advanced Options */}
                  <Collapsible open={advancedOptionsOpen} onOpenChange={setAdvancedOptionsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button disabled={!!previewUrl} variant="outline" className="w-full gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced Options
                        <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOptionsOpen && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-6">
                      {/* HTML/JS Injection Toggle */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="disable-html-js-injection">Disable HTML/JS injection</Label>
                          <Switch
                            id="disable-html-js-injection"
                            checked={disableHtmlJsInjection}
                            onCheckedChange={setDisableHtmlJsInjection}
                            disabled={!!previewUrl || !!batchPreviewUrls.length}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This will disable the countdown on the website for how long the link will last
                        </p>
                      </div>
                      
                      {/* Password Protection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password-protection">Password Protection</Label>
                          <Switch
                            id="password-protection"
                            checked={passwordProtected}
                            onCheckedChange={setPasswordProtected}
                            disabled={!!previewUrl || !!batchPreviewUrls.length}
                          />
                        </div>
                        
                        {passwordProtected && (
                          <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input
                                id="username"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={!!previewUrl || !!batchPreviewUrls.length}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!!previewUrl || !!batchPreviewUrls.length}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* HTTPS/HTTP Toggle */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="https-toggle">Use HTTPS</Label>
                          <Switch
                            id="https-toggle"
                            checked={useHttps}
                            onCheckedChange={setUseHttps}
                            disabled={!!previewUrl || !!batchPreviewUrls.length}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Controls the connection from BypassDNS server to your destination server. Keep enabled even with self-signed SSL certificates.
                        </p>
                      </div>
                      
                      {/* Custom Port */}
                      <div className="space-y-2">
                        <Label htmlFor="custom-port">Custom Port (optional)</Label>
                        <Input
                          id="custom-port"
                          placeholder="443 (default)"
                          value={customPort}
                          onChange={(e) => setCustomPort(e.target.value)}
                          className="font-mono"
                          disabled={!!previewUrl || !!batchPreviewUrls.length}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Confirmation Dialog */}
                  {showConfirmation && (
                    <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Please Review Your Configuration</h4>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <p><strong>Server:</strong> {serverIp}</p>
                            <p><strong>Domain:</strong> {domain}</p>
                            <p><strong>Protocol:</strong> {useHttps ? 'HTTPS' : 'HTTP'}</p>
                            {customPort && <p><strong>Port:</strong> {customPort}</p>}
                            {passwordProtected && <p><strong>Password Protected:</strong> Yes ({username})</p>}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={generatePreviewUrl}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              Confirm & Generate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setShowConfirmation(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Turnstile CAPTCHA */}
                  <div className="space-y-2">
                    <Label>Security Verification</Label>
                    <TurnstileWidget
                      key={singleCaptchaKey}
                      onVerify={(token) => setSingleTurnstileToken(token)}
                      onError={() => {
                        setSingleTurnstileToken("");
                        toast({
                          title: "CAPTCHA Error",
                          description: "Please try again.",
                          variant: "destructive",
                        });
                      }}
                      onExpire={() => setSingleTurnstileToken("")}
                      className="flex justify-center"
                    />
                  </div>

                  <Button
                    onClick={generatePreviewUrl}
                    disabled={isGenerating || showConfirmation || !singleTurnstileToken || !!previewUrl}
                    className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300"
                    size="lg"
                  >
                    {isGenerating ? "Generating Preview..." : showConfirmation ? "Please confirm settings above" : "Generate Preview Link"}
                  </Button>

                  {previewUrl && (
                    <div className="space-y-4 p-6 bg-accent/50 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-primary">Your Preview Link</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-background rounded border font-mono text-sm break-all">
                        {previewUrl}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>✅ This link will show your website at <strong>{domain}</strong> using server <strong>{serverIp}</strong></p>
                        {passwordProtected && (
                          <p>🔐 <strong>Authentication required:</strong> Username: <code className="bg-muted px-1 rounded">{username}</code> | Password: <code className="bg-muted px-1 rounded">{password}</code></p>
                        )}
                        <p>🔗 Share this link with your team or clients for instant preview</p>
                        <p>⏱️ Link expires in 24 hours</p>
                      </div>
                      
                      <div className="flex justify-center pt-4">
                        <Button 
                          onClick={resetSingleGenerator}
                          variant="outline"
                          className="gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Generate Another Link
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="batch" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="batch-input">Domain:IP Pairs</Label>
                    <Textarea
                      id="batch-input"
                      placeholder="example.com:192.168.1.100, another.com:192.168.1.101, test.org:192.168.1.102"
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      className="font-mono min-h-[120px]"
                      disabled={!!batchPreviewUrls.length}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter comma-separated domain:ip pairs. Each entry will have its own configurable options below.
                    </p>
                  </div>

                  {/* Individual Domain Configuration */}
                  {parsedBatchEntries.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                          <Settings className="h-4 w-4" />
                          Custom configuration per domain
                          <ChevronDown className="h-4 w-4 ml-auto" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <h3 className="font-medium text-foreground">Configure Individual Domains</h3>
                        <div className="space-y-3">
                          {parsedBatchEntries.map(({domain, ip}, index) => {
                            const settings = batchDomainSettings[domain] || {
                              protocol: 'https',
                              port: '',
                              username: '',
                              password: '',
                              passwordProtected: false,
                              useHttps: true,
                              disableHtmlJsInjection: false
                            };
                            
                            return (
                              <Card key={index} className="border-border/30">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-medium">{domain}</h4>
                                      <p className="text-sm text-muted-foreground font-mono">{ip}</p>
                                    </div>
                                  </div>
                                  
                                  <Collapsible>
                                    <CollapsibleTrigger asChild>
                                      <Button variant="outline" size="sm" className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Advanced Options
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="space-y-4 pt-4">
                                       {/* HTML/JS Injection Toggle */}
                                       <div className="space-y-2">
                                         <div className="flex items-center justify-between">
                                           <Label>Disable HTML/JS injection</Label>
                                           <Switch
                                             checked={settings.disableHtmlJsInjection}
                                             onCheckedChange={(value) => updateDomainSetting(domain, 'disableHtmlJsInjection', value)}
                                             disabled={!!batchPreviewUrls.length}
                                           />
                                         </div>
                                         <p className="text-xs text-muted-foreground">
                                           This will disable the countdown on the website for how long the link will last
                                         </p>
                                       </div>
                                       
                                       {/* Password Protection */}
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Label>Password Protection</Label>
                                          <Switch
                                            checked={settings.passwordProtected}
                                            onCheckedChange={(value) => updateDomainSetting(domain, 'passwordProtected', value)}
                                            disabled={!!batchPreviewUrls.length}
                                          />
                                        </div>
                                        
                                        {settings.passwordProtected && (
                                          <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-primary/20">
                                            <div className="space-y-2">
                                              <Label>Username</Label>
                                              <Input
                                                placeholder="admin"
                                                value={settings.username}
                                                onChange={(e) => updateDomainSetting(domain, 'username', e.target.value)}
                                                disabled={!!batchPreviewUrls.length}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Password</Label>
                                              <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={settings.password}
                                                onChange={(e) => updateDomainSetting(domain, 'password', e.target.value)}
                                                disabled={!!batchPreviewUrls.length}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* HTTPS/HTTP Toggle */}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <Label>Use HTTPS</Label>
                                          <Switch
                                            checked={settings.useHttps}
                                            onCheckedChange={(value) => updateDomainSetting(domain, 'useHttps', value)}
                                            disabled={!!batchPreviewUrls.length}
                                          />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Controls the connection protocol to your server.
                                        </p>
                                      </div>
                                      
                                       {/* Custom Port */}
                                       <div className="space-y-2">
                                         <Label>Custom Port (optional)</Label>
                                         <Input
                                           placeholder="443 (default)"
                                           value={settings.port}
                                           onChange={(e) => updateDomainSetting(domain, 'port', e.target.value)}
                                           className="font-mono"
                                           disabled={!!batchPreviewUrls.length}
                                         />
                                       </div>
                                     </CollapsibleContent>
                                  </Collapsible>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Privacy Policy & Terms */}
                  <div className="flex flex-col items-center space-y-2 py-2">
                    <p className="text-sm text-muted-foreground text-center">
                      By creating a temporary link here <strong>YOU AGREE WITH</strong> the following terms and policies.
                    </p>
                    <PrivacyDialog />
                  </div>

                  {/* Turnstile CAPTCHA for Batch */}
                  <div className="space-y-2">
                    <Label>Security Verification</Label>
                    <TurnstileWidget
                      key={batchCaptchaKey}
                      onVerify={(token) => setBatchTurnstileToken(token)}
                      onError={() => {
                        setBatchTurnstileToken("");
                        toast({
                          title: "CAPTCHA Error",
                          description: "Please try again.",
                          variant: "destructive",
                        });
                      }}
                      onExpire={() => setBatchTurnstileToken("")}
                      className="flex justify-center"
                    />
                  </div>

                  <Button
                    onClick={generateBatchPreviewUrls}
                    disabled={isBatchGenerating || parsedBatchEntries.length === 0 || !batchTurnstileToken ||  !!batchPreviewUrls.length}
                    className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300"
                    size="lg"
                  >
                    {isBatchGenerating ? "Generating Batch Preview..." : `Generate ${parsedBatchEntries.length} Preview Links`}
                  </Button>

                  {batchPreviewUrls.length > 0 && (
                    <div className="space-y-4 p-6 bg-accent/50 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-primary">Your Batch Preview Links ({batchPreviewUrls.length})</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyBatchToClipboard}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={saveBatchToFile}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {batchPreviewUrls.map(({domain, ip, url, protocol, port, username, password}, index) => (
                          <div key={index} className="p-3 bg-background rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{domain}</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(url)}
                                  className="gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="gap-1"
                                >
                                  <a href={"https://" + url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <div className="font-mono text-xs text-muted-foreground break-all">
                              https://{url}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              <div>Server: <b>{ip}</b> | Protocol: <b>{protocol.toUpperCase()}</b>{port && ` | Port: ${port}`}</div>
                              {username && password && (
                                <div>🔐 Auth: {username}:{password}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>✅ All links will show their respective domains using the specified servers and settings</p>
                        <p>🔗 Share these links with your team or clients for instant preview</p>
                        <p>⏱️ Links expire in 24 hours</p>
                      </div>
                      
                      <div className="flex justify-center pt-4">
                        <Button 
                          onClick={resetBatchGenerator}
                          variant="outline"
                          className="gap-2"
                        >
                          <List className="h-4 w-4" />
                          Generate New Batch
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PreviewGenerator;