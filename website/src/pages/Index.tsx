import Header from "@/components/Header";
import UseCases from "@/components/UseCases";
import PreviewGenerator from "@/components/PreviewGenerator";
import AboutMe from "@/components/AboutMe";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <div id="generator">
        <PreviewGenerator />
      </div>
      <div id="use-cases">
        <UseCases />
      </div>
      <div id="about-me">
        <AboutMe />
      </div>
    </div>
  );
};

export default Index;
