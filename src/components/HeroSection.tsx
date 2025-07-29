import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, BookOpen } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-subtle py-16 lg:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Simplify <span className="bg-gradient-hero bg-clip-text text-transparent">Scheduling</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate perfect IBDP timetables for Christ College, Bangalore. 
            Automatically balance HL/SL hours and manage complex scheduling constraints with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="academic" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary-light rounded-full mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Save Hours</h3>
              <p className="text-muted-foreground text-sm">
                Automated scheduling reduces manual work from days to minutes
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary-light rounded-full mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">IBDP Optimized</h3>
              <p className="text-muted-foreground text-sm">
                Built specifically for IB Higher and Standard Level requirements
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary-light rounded-full mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Multi-User</h3>
              <p className="text-muted-foreground text-sm">
                Coordinators and students can access and manage schedules together
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;