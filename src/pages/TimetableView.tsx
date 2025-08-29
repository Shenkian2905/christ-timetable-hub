import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Share2, Printer, ArrowLeft, Clock, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TimetableView = () => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [selectedWeekType, setSelectedWeekType] = useState<'odd' | 'even'>('odd');
  const [timetableData, setTimetableData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:15-12:15',
    '12:15-13:15',
    '14:15-15:15',
    '15:15-16:15'
  ];

  useEffect(() => {
    fetchTimetableData();
    fetchReferenceData();
  }, [selectedYear, selectedWeekType]);

  const fetchReferenceData = async () => {
    try {
      const [subjectsResult, teachersResult, roomsResult, classGroupsResult] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('class_groups').select('*')
      ]);

      if (subjectsResult.data) setSubjects(subjectsResult.data);
      if (teachersResult.data) setTeachers(teachersResult.data);
      if (roomsResult.data) setRooms(roomsResult.data);
      if (classGroupsResult.data) setClassGroups(classGroupsResult.data);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchTimetableData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('academic_year', selectedYear)
        .eq('week_type', selectedWeekType);

      if (error) throw error;
      
      setTimetableData(data || []);
    } catch (error) {
      toast({
        title: "Error fetching timetable",
        description: "Failed to load timetable data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEntryForSlot = (dayIndex: number, timeSlot: string) => {
    return timetableData.find(entry => 
      entry.day_of_week === dayIndex + 1 && 
      (entry.time_slot === timeSlot || 
       (entry.is_block_hour && timeSlot.startsWith(entry.time_slot.split('-')[0])))
    );
  };

  const getSubjectDetails = (entry: any) => {
    const subject = subjects.find(s => s.code === entry.subject_code);
    const teacher = teachers.find(t => t.id === entry.teacher_id);
    const room = rooms.find(r => r.id === entry.room_id);
    const classGroup = classGroups.find(g => g.id === entry.class_group_id);
    
    return { subject, teacher, room, classGroup };
  };

  const getSubjectColor = (subjectCode: string) => {
    const colors = {
      'PHY': 'bg-blue-100 text-blue-800 border-blue-300',
      'PSY': 'bg-purple-100 text-purple-800 border-purple-300',
      'BM': 'bg-green-100 text-green-800 border-green-300',
      'BIO': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'CS': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'ESS': 'bg-teal-100 text-teal-800 border-teal-300',
      'HIS': 'bg-amber-100 text-amber-800 border-amber-300',
      'ECO': 'bg-orange-100 text-orange-800 border-orange-300',
      'CHEM': 'bg-red-100 text-red-800 border-red-300',
    };

    const prefix = subjectCode?.split('_')[0] || '';
    return colors[prefix] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderTimeSlot = (dayIndex: number, timeSlot: string) => {
    const entry = getEntryForSlot(dayIndex, timeSlot);
    
    if (!entry) {
      // Skip Saturday for even weeks
      if (dayIndex === 5 && selectedWeekType === 'even') {
        return <div className="p-2 text-center text-muted-foreground text-sm bg-muted/50">No Classes</div>;
      }
      return <div className="p-2 text-center text-muted-foreground text-sm">Free</div>;
    }

    const { subject, teacher, room, classGroup } = getSubjectDetails(entry);
    
    // Skip if this is part of a block that starts earlier
    if (entry.is_block_hour && !timeSlot.startsWith(entry.time_slot.split('-')[0])) {
      return null;
    }

    return (
      <div 
        className={`p-3 rounded-lg border ${getSubjectColor(entry.subject_code)} ${
          entry.is_block_hour ? 'row-span-2' : ''
        }`}
      >
        <div className="font-medium text-sm">{subject?.name || entry.subject_code}</div>
        <div className="text-xs opacity-90 mt-1">
          {teacher?.name || 'TBD'}
        </div>
        <div className="text-xs opacity-90">
          {room?.room_number || 'TBD'}
        </div>
        {entry.is_block_hour && (
          <Badge variant="secondary" className="text-xs mt-1">Block</Badge>
        )}
      </div>
    );
  };

  const calculateStats = () => {
    const totalEntries = timetableData.length;
    const blockHours = timetableData.filter(entry => entry.is_block_hour).length;
    const singleHours = totalEntries - blockHours;
    const uniqueSubjects = new Set(timetableData.map(entry => entry.subject_code)).size;
    
    return { totalEntries, blockHours, singleHours, uniqueSubjects };
  };

  const stats = calculateStats();

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
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">IBDP Timetable</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2025-26">2025-26</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedWeekType} onValueChange={(value: 'odd' | 'even') => setSelectedWeekType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="odd">Odd Week (includes Saturday)</SelectItem>
                <SelectItem value="even">Even Week (no Saturday)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-xl font-bold">{stats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-xl font-bold">{stats.uniqueSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Block Hours</p>
                  <p className="text-xl font-bold">{stats.blockHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Single Hours</p>
                  <p className="text-xl font-bold">{stats.singleHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule - {selectedYear} ({selectedWeekType} week)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading timetable...</p>
              </div>
            ) : timetableData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No timetable generated for this configuration.</p>
                <Button className="mt-4" asChild>
                  <Link to="/dashboard">Generate Timetable</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 min-w-max">
                  {/* Header */}
                  <div className="p-3 font-semibold bg-muted rounded-lg text-center">Time</div>
                  {days.map((day, index) => (
                    <div 
                      key={day} 
                      className={`p-3 font-semibold bg-muted rounded-lg text-center ${
                        index === 5 && selectedWeekType === 'even' ? 'opacity-50' : ''
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                  
                  {/* Time slots */}
                  {timeSlots.map((timeSlot) => (
                    <div key={timeSlot} className="contents">
                      <div className="p-3 text-sm font-medium text-center bg-muted/50 rounded-lg">
                        {timeSlot}
                      </div>
                      {days.map((_, dayIndex) => (
                        <div key={`${dayIndex}-${timeSlot}`} className="min-h-[80px]">
                          {renderTimeSlot(dayIndex, timeSlot)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableView;