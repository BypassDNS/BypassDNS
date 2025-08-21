import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Code, Users, Globe, Scale } from "lucide-react";
import MitLicenseDialog from "./MitLicenseDialog";

const AboutMe = () => {
  return (
    <section id="about-me" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">About Me</h2>
            <p className="text-xl text-muted-foreground">
              Why I created BypassDNS and made it open source
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  As a System Administrator, I constantly faced the frustrating wait for DNS propagation when launching new websites or making domain changes, or needing to rely on paid websites to just simply preview a domain on a new server, which quickly expired on free plans. 
                </p>
                <p className="text-muted-foreground">
                  Existing solutions were either expensive, complex to set up, or limited in functionality. I needed something simple, fast, and accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  The Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  BypassDNS.link was born from this need. It's a simple tool that creates temporary preview links for your websites, 
                  bypassing DNS propagation delays entirely. No more waiting, no more "Did it work?" uncertainty. Want to check a website? Just grab the domain name, IP and fill the form and you're good to go.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">Flask</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-glow md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Why Open Source?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Community Impact
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      I believe tools that solve common developer/admins problems should be accessible to everyone. In that way you can benefit your customer by showing them how the website looks fine on the new server, or test new features. 
                      By making BypassDNS open source, the entire community can benefit, contribute, and improve it.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Transparency & Trust
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Open source means transparency. You can see exactly how your data is handled, 
                      verify the security, and even self-host if needed. No black boxes, no hidden agendas, no stored data.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Contribute:</strong> Found a bug? Have a feature idea? Feel free to contribute on GitHub! 
                    This project grows stronger with community input.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Built with ❤️ for the developer community
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              - bnt0p
            </p>
            <div className="mt-4">
              <MitLicenseDialog />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;