import { Button } from "@/components/ui/button";
import { Calendar, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Christ Timetable Hub</h3>
                <p className="text-sm text-background/70">IBDP Scheduling Made Simple</p>
              </div>
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              Streamlining timetable generation for Christ College, Bangalore. 
              Built specifically for IBDP coordinators and students to create 
              perfect schedules with ease.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="bg-transparent border-background/30 text-background hover:bg-background/10">
                Documentation
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-background/30 text-background hover:bg-background/10">
                Support <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-background/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">timetable@christcollege.edu</span>
              </div>
              <div className="flex items-center gap-2 text-background/80">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 80 4012 9000</span>
              </div>
              <div className="flex items-center gap-2 text-background/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Hosur Road, Bangalore</span>
              </div>
            </div>
          </div>
          
          {/* About Links */}
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-background/80 hover:text-background transition-colors">
                Christ College
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-background transition-colors">
                IBDP Program
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-background transition-colors">
                Academic Calendar
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-background transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-background/80 hover:text-background transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-sm text-background/60">
            © 2024 Christ College, Bangalore. All rights reserved. 
            Built with ❤️ for the IBDP community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;