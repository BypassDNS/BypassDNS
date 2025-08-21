import { Button } from "@/components/ui/button";
import { Globe, Github, ChevronsLeftRightEllipsis } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    const headerOffset = 80;
    const targetPosition = element.offsetTop - headerOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // 1 second
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutQuart = (t: number): number => 
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      
      const easedProgress = easeInOutQuart(progress);
      const currentPosition = startPosition + distance * easedProgress;
      
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <a href="/"><span className="text-xl font-bold">BypassDNS</span></a>
            <ThemeToggle/>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('generator')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Create your link
            </button>
            <button 
              onClick={() => scrollToSection('use-cases')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Use Cases
            </button>
            <button 
              onClick={() => scrollToSection('about-me')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              About Me
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5" asChild>
              <a href="https://discord.gg/fwjtsMKMqC" target="_blank" rel="noopener noreferrer">
                <ChevronsLeftRightEllipsis className="h-4 w-4 mr-2" />
                Discord
              </a>
            </Button>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5" asChild>
              <a href="https://github.com/bnt0p/BypassDNS" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;