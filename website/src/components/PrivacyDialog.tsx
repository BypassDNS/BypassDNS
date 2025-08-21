import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Github, Cloud } from "lucide-react";

export const PrivacyDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-muted-foreground underline p-0 h-auto">
          Privacy Policy & Terms of Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy Policy & Terms of Service
          </DialogTitle>
          <DialogDescription>
            Your privacy and security are our top priorities
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Data Privacy Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold">Data Protection</h3>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-green-700 dark:text-green-300">WE DON'T STORE YOUR DATA *</strong> - All preview links are temporary and automatically expire after 24 hours. No domain configurations, IP addresses, or personal information is permanently stored on our servers. The only information stored, are default nginx logs, and also when you create the link, so we have a track in case of abuse. We don't store username or password, so if you lost it, just create a new one.</p>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-green-700 dark:text-green-300">WE DON'T SELL YOUR DATA</strong> - We have no business model based on data monetization. Your information is never shared, sold, or distributed to third parties for any commercial purposes.</p>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p><strong className="text-blue-700 dark:text-blue-300">WE DON'T MONITOR YOUR USAGE</strong> - As long as you don't abuse this tool with excessive requests or malicious activities, we don't track or analyze your usage patterns. This service is provided for legitimate website preview purposes.</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Open Source Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Transparency & Open Source</h3>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                  <Github className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p><strong className="text-foreground">THIS CODE IS OPEN SOURCE</strong> - You can inspect the complete codebase, including all server-side operations and data handling procedures.</p>
                    <p className="mt-2">
                      <strong>Repository:</strong>{" "}
                      <a 
                        href="https://github.com/BypassDNS/BypassDNS" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://github.com/BypassDNS/BypassDNS
                      </a>
                    </p>
                    <p className="mt-1 text-xs">Feel free to review the source code to verify our privacy claims and understand exactly how your data is handled.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Security Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-orange-500" />
                <h3 className="text-lg font-semibold">Security & Anti-Abuse</h3>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Cloud className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p><strong className="text-orange-700 dark:text-orange-300">CLOUDFLARE TURNSTILE PROTECTION</strong> - This website uses Cloudflare Turnstile to verify that you're a real user and prevent automated abuse.</p>
                    <p className="mt-2 text-xs">Turnstile helps us maintain service quality without compromising your privacy. It doesn't track your browsing behavior across other websites.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Terms of Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Terms of Service</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Acceptable Use</h4>
                  <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>This service is intended for legitimate website preview purposes only</li>
                    <li>Do not use this service for malicious activities, illegal content, or to bypass security measures</li>
                    <li>Excessive or automated requests may result in temporary or permanent service restrictions</li>
                    <li>Preview links are temporary and expire after 24 hours</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Service Availability</h4>
                  <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>This service is provided "as-is" without warranties of uptime or availability</li>
                    <li>We reserve the right to modify or discontinue the service at any time</li>
                    <li>Preview links are not guaranteed to work indefinitely and may be removed earlier than 24 hours if necessary</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Liability</h4>
                  <p>You are responsible for ensuring that any content accessed through this service complies with applicable laws and regulations. We are not liable for any damages resulting from the use of this service.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};