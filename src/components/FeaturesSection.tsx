import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, Shield, Settings, Calendar, Users2 } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Auto-Generation",
      description: "Intelligent algorithms create optimal timetables instantly, considering all constraints and preferences."
    },
    {
      icon: BarChart3,
      title: "HL/SL Hour Management",
      description: "Automatically balance Higher Level and Standard Level subject hours according to IB requirements."
    },
    {
      icon: Shield,
      title: "Secure Login System",
      description: "Role-based access for coordinators and students with secure authentication and data protection."
    },
    {
      icon: Settings,
      title: "Flexible Configuration",
      description: "Customize time slots, subjects, teachers, and rooms to match your school's specific needs."
    },
    {
      icon: Calendar,
      title: "Conflict Resolution",
      description: "Smart detection and resolution of scheduling conflicts before they become problems."
    },
    {
      icon: Users2,
      title: "Collaborative Planning",
      description: "Multiple coordinators can work together to plan and review timetables efficiently."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Perfect Schedules
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, manage, and optimize IBDP timetables at Christ College
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-border shadow-soft hover:shadow-strong transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="p-3 bg-primary-light rounded-lg w-fit mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;