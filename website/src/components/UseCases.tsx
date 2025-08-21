import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UseCases = () => {
  const useCases = [
    {
      title: "Website Migration",
      description: "Test your migrated site before switching DNS to ensure everything works perfectly.",
      tags: ["Migration", "Testing", "DevOps"],
      scenario: "Moving from old hosting to new hosting provider",
    },
    {
      title: "Client Previews",
      description: "Show clients exactly how their website will look on their domain before going live.",
      tags: ["Agencies", "Client Work", "Preview"],
      scenario: "Web agency presenting new website to client",
    },
    {
      title: "Staging Environment",
      description: "Share staging environments with team members using the actual production domain.",
      tags: ["Development", "Staging", "Team"],
      scenario: "QA testing before production deployment",
    },
    {
      title: "Domain Changes",
      description: "Preview how your existing site will look on a new domain before making the switch.",
      tags: ["Rebranding", "Domain", "Preview"],
      scenario: "Company rebranding with new domain name",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Perfect For Every Use Case</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From solo developers to large agencies, BypassDNS adapts to your workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <Card 
              key={index}
              className="border-border/50 hover:shadow-glow transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription className="text-base">{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {useCase.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground">
                    <strong>Example:</strong> {useCase.scenario}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;