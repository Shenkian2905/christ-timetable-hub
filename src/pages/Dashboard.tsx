import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BookOpen, Clock, Download, Eye, Settings, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTimetableGeneration } from "@/hooks/useTimetableGeneration";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateTimetable, isGenerating } = useTimetableGeneration();
  
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTeachers: 0,
    totalHours: 0,
    totalStudents: 0
  });
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [selectedWeekType, setSelectedWeekType] = useState<'odd' | 'even'>('odd');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [subjectsResult, teachersResult, roomsResult, classGroupsResult] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('class_groups').select('*')
      ]);

      if (subjectsResult.data) {
        setSubjects(subjectsResult.data);
        setStats(prev => ({ ...prev, totalSubjects: subjectsResult.data.length }));
      }
      
      if (teachersResult.data) {
        setTeachers(teachersResult.data);
        setStats(prev => ({ ...prev, totalTeachers: teachersResult.data.length }));
      }
      
      if (roomsResult.data) {
        setRooms(roomsResult.data);
      }
      
      if (classGroupsResult.data) {
        setClassGroups(classGroupsResult.data);
        // Calculate total teaching hours (each class group needs 5 hours per subject per week)
        const totalHours = classGroupsResult.data.reduce((total, group) => {
          return total + (group.subject_codes.length * 5);
        }, 0);
        // Calculate total students
        const totalStudents = classGroupsResult.data.reduce((total, group) => total + group.student_count, 0);
        setStats(prev => ({ ...prev, totalHours, totalStudents }));
      }
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTimetable = async () => {
    const result = await generateTimetable({
      academic_year: selectedYear,
      week_type: selectedWeekType
    });

    if (result.success) {
      navigate("/timetable");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-hero rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage IBDP Timetables</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/timetable">
                <Eye className="h-4 w-4 mr-2" />
                View Timetable
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Logout</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subjects</p>
                  <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teaching Hours/Week</p>
                  <p className="text-2xl font-bold">{stats.totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Data Management
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage subjects, teachers, rooms, and class groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="subjects" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="groups">Groups</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="subjects" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Group</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjects.slice(0, 5).map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.name}</TableCell>
                              <TableCell>{subject.code}</TableCell>
                              <TableCell>
                                <Badge variant={subject.level === "HL" ? "default" : "secondary"}>
                                  {subject.level}
                                </Badge>
                              </TableCell>
                              <TableCell>Year {subject.year_group}</TableCell>
                              <TableCell className="text-sm">{subject.subject_group}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="teachers" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Both Years</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teachers.slice(0, 5).map((teacher) => (
                            <TableRow key={teacher.id}>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.email}</TableCell>
                              <TableCell className="text-sm">
                                {teacher.subjects.length} subjects
                              </TableCell>
                              <TableCell>
                                <Badge variant={teacher.teaches_both_years ? "default" : "secondary"}>
                                  {teacher.teaches_both_years ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="rooms" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Room Number</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Notice Board</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rooms.slice(0, 5).map((room) => (
                            <TableRow key={room.id}>
                              <TableCell className="font-medium">{room.room_number}</TableCell>
                              <TableCell>{room.capacity}</TableCell>
                              <TableCell className="capitalize">{room.room_type.replace('_', ' ')}</TableCell>
                              <TableCell>
                                <Badge variant={room.has_notice_board ? "default" : "secondary"}>
                                  {room.has_notice_board ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="groups" className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Subjects</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classGroups.slice(0, 5).map((group) => (
                            <TableRow key={group.id}>
                              <TableCell className="font-medium">{group.group_name}</TableCell>
                              <TableCell>Year {group.year_group}</TableCell>
                              <TableCell>{group.student_count}</TableCell>
                              <TableCell>{group.subject_codes.length} subjects</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Timetable</CardTitle>
                <CardDescription>
                  Create optimized schedules following IBDP constraints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="week">Week Type</Label>
                  <Select value={selectedWeekType} onValueChange={(value: 'odd' | 'even') => setSelectedWeekType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="odd">Odd Week (includes Saturday)</SelectItem>
                      <SelectItem value="even">Even Week (no Saturday)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  variant="hero"
                  onClick={handleGenerateTimetable}
                  disabled={isGenerating}
                >
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isGenerating ? 'Generating...' : 'Generate Timetable'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/timetable">
                    <Eye className="h-4 w-4 mr-2" />
                    View Current Timetable
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;