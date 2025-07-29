import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Share2 } from "lucide-react";
import timetablePreview from "@/assets/timetable-preview.jpg";

const PreviewSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a preview of how your timetables will look - clean, organized, and perfectly balanced
            </p>
          </div>
          
          <Card className="border-border shadow-strong overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={timetablePreview} 
                  alt="Timetable Preview - IBDP Weekly Schedule" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="lg" className="flex-1 sm:flex-none">
                    <Play className="mr-2 h-5 w-5" />
                    Try Demo
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="academic" size="lg">
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button variant="academic" size="lg">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Color-Coded Subjects</h3>
              <p className="text-muted-foreground text-sm">
                Each subject has its own color for easy identification and visual clarity
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Optimized Layout</h3>
              <p className="text-muted-foreground text-sm">
                Clean grid design shows all information clearly without clutter
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Export Ready</h3>
              <p className="text-muted-foreground text-sm">
                Download as PDF or share digitally with students and teachers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;