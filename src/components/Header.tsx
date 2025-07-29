import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-hero rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Christ Timetable Hub</h1>
            <p className="text-sm text-muted-foreground">IBDP Scheduling Made Simple</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            About
          </Button>
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button variant="hero" size="sm">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;