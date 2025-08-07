import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Printer, Share, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Timetable = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "8:00 - 8:45",
    "8:45 - 9:30",
    "9:30 - 10:15",
    "10:15 - 11:00", // Break
    "11:00 - 11:45",
    "11:45 - 12:30",
    "12:30 - 1:15", // Lunch
    "1:15 - 2:00",
    "2:00 - 2:45",
    "2:45 - 3:30"
  ];

  // Sample timetable data
  const timetableData = {
    "Monday": {
      "8:00 - 8:45": { subject: "Physics HL", teacher: "Dr. Smith", room: "Lab 1", type: "regular" },
      "8:45 - 9:30": { subject: "Mathematics HL", teacher: "Mr. Brown", room: "Room 101", type: "regular" },
      "9:30 - 10:15": { subject: "English A", teacher: "Ms. Davis", room: "Room 203", type: "regular" },
      "10:15 - 11:00": { subject: "Break", teacher: "", room: "", type: "break" },
      "11:00 - 11:45": { subject: "Chemistry SL", teacher: "Ms. Johnson", room: "Lab 2", type: "regular" },
      "11:45 - 12:30": { subject: "Physics HL", teacher: "Dr. Smith", room: "Lab 1", type: "block", span: 2 },
      "12:30 - 1:15": { subject: "Lunch Break", teacher: "", room: "", type: "lunch" },
      "1:15 - 2:00": { subject: "TOK", teacher: "Mr. Wilson", room: "Room 105", type: "regular" },
      "2:00 - 2:45": { subject: "History", teacher: "Ms. Taylor", room: "Room 204", type: "regular" },
    },
    // Add more days...
  };

  const getClassType = (type: string) => {
    switch (type) {
      case "break":
        return "bg-muted text-muted-foreground";
      case "lunch":
        return "bg-muted text-muted-foreground";
      case "block":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-card text-card-foreground border";
    }
  };

  const subjectColors = {
    "Physics HL": "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100",
    "Mathematics HL": "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-100",
    "Chemistry SL": "bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-100",
    "English A": "bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-100",
    "TOK": "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-100",
    "History": "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100",
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="p-2 bg-gradient-hero rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">IBDP Timetable</h1>
                <p className="text-sm text-muted-foreground">Academic Year 2024-25</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select defaultValue="year1">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year1">Year 1</SelectItem>
                  <SelectItem value="year2">Year 2</SelectItem>
                  <SelectItem value="both">Both Years</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="hero" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Timetable Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours/Week</p>
                  <p className="text-2xl font-bold">30</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School Days</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">Today, 2:30 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule - Year 1</CardTitle>
            <CardDescription>
              Color-coded subjects with teacher and room information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  <div className="p-3 text-center font-semibold bg-muted rounded-lg">
                    Time
                  </div>
                  {days.map((day) => (
                    <div key={day} className="p-3 text-center font-semibold bg-muted rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-7 gap-2 mb-2">
                    <div className="p-3 text-center font-medium bg-muted/50 rounded-lg text-sm">
                      {time}
                    </div>
                    {days.map((day) => {
                      const classInfo = timetableData[day]?.[time];
                      
                      if (!classInfo) {
                        return (
                          <div key={`${day}-${time}`} className="p-3 rounded-lg border-2 border-dashed border-muted">
                            <div className="text-xs text-muted-foreground text-center">Free</div>
                          </div>
                        );
                      }

                      if (classInfo.type === "break" || classInfo.type === "lunch") {
                        return (
                          <div key={`${day}-${time}`} className={`p-3 rounded-lg text-center ${getClassType(classInfo.type)}`}>
                            <div className="text-sm font-medium">{classInfo.subject}</div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={`${day}-${time}`} 
                          className={`p-3 rounded-lg border ${subjectColors[classInfo.subject as keyof typeof subjectColors] || "bg-card"}`}
                        >
                          <div className="text-sm font-semibold mb-1">{classInfo.subject}</div>
                          <div className="text-xs text-muted-foreground">{classInfo.teacher}</div>
                          <div className="text-xs text-muted-foreground">{classInfo.room}</div>
                          {classInfo.type === "block" && (
                            <div className="text-xs font-medium text-primary mt-1">Block Period</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Color Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {Object.entries(subjectColors).map(([subject, className]) => (
                  <div key={subject} className={`p-2 rounded border ${className}`}>
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;