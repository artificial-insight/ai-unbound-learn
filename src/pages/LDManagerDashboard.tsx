import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Send,
  Filter
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { formatDistanceToNow } from "date-fns";

interface Cohort {
  id: string;
  name: string;
  description: string;
  course_ids: string[];
  user_ids: string[];
  deadline: string;
  created_at: string;
}

const LDManagerDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    employeesTrained: 0,
    completionRate: 0,
    avgTimeToCompetency: 8,
    onTrackLearners: 0,
    strugglingLearners: 0,
    aheadLearners: 0
  });

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [newCohortOpen, setNewCohortOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedCohort]);

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [usersResult, enrollmentsResult, completedResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null)
      ]);

      const totalUsers = usersResult.count || 0;
      const totalEnrollments = enrollmentsResult.count || 0;
      const completedEnrollments = completedResult.count || 0;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      // Load employees with their progress
      if (usersResult.data) {
        const employeesWithProgress = await Promise.all(
          usersResult.data.map(async (user) => {
            const { data: enrollments } = await supabase
              .from('course_enrollments')
              .select('*, courses(title)')
              .eq('user_id', user.id);

            const avgProgress = enrollments && enrollments.length > 0
              ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length
              : 0;

            let status = 'on-track';
            if (avgProgress < 30) status = 'struggling';
            else if (avgProgress > 70) status = 'ahead';

            return {
              ...user,
              enrollments: enrollments || [],
              avgProgress,
              status
            };
          })
        );

        setEmployees(employeesWithProgress);

        const onTrack = employeesWithProgress.filter(e => e.status === 'on-track').length;
        const struggling = employeesWithProgress.filter(e => e.status === 'struggling').length;
        const ahead = employeesWithProgress.filter(e => e.status === 'ahead').length;

        setStats({
          employeesTrained: totalUsers,
          completionRate,
          avgTimeToCompetency: 8,
          onTrackLearners: onTrack,
          strugglingLearners: struggling,
          aheadLearners: ahead
        });
      }

      // Load available courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      
      if (coursesData) setCourses(coursesData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const handleBulkAssign = async (courseIds: string[], userIds: string[]) => {
    try {
      const enrollments = userIds.flatMap(userId =>
        courseIds.map(courseId => ({
          user_id: userId,
          course_id: courseId
        }))
      );

      const { error } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assigned ${courseIds.length} course(s) to ${userIds.length} employee(s)`
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const exportReport = () => {
    const csvData = employees.map(emp => ({
      Name: emp.full_name || emp.email,
      Email: emp.email,
      Status: emp.status,
      'Average Progress': `${emp.avgProgress.toFixed(0)}%`,
      'Courses Enrolled': emp.enrollments.length,
      'Completed': emp.enrollments.filter((e: any) => e.completed_at).length
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export Complete",
      description: "Training report downloaded successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'outline';
      case 'on-track': return 'default';
      case 'struggling': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'ahead': return 'border-success text-success';
      case 'on-track': return '';
      case 'struggling': return '';
      default: return '';
    }
  };

  const completionTrend = [
    { week: 'Week 1', completed: 12, target: 15 },
    { week: 'Week 2', completed: 28, target: 30 },
    { week: 'Week 3', completed: 45, target: 45 },
    { week: 'Week 4', completed: 67, target: 60 },
    { week: 'Week 5', completed: 82, target: 75 },
    { week: 'Week 6', completed: 95, target: 90 }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              L&D Manager Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Corporate training management & analytics
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={newCohortOpen} onOpenChange={setNewCohortOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero">
                  <Send className="w-4 h-4 mr-2" />
                  Assign Training
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Training to Employees</DialogTitle>
                  <DialogDescription>
                    Select courses and employees to create a training assignment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Courses</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose courses..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Select Employees</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      {employees.slice(0, 10).map(emp => (
                        <div key={emp.id} className="flex items-center gap-2 py-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{emp.full_name || emp.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-hero">
                    Assign Training
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Employees Trained</CardDescription>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.employeesTrained}</div>
              <p className="text-sm text-muted-foreground mt-1">This quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Completion Rate</CardDescription>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.completionRate.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground mt-1">On assigned training</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Avg Time to Competency</CardDescription>
                <Clock className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.avgTimeToCompetency}w</div>
              <p className="text-sm text-muted-foreground mt-1">50% faster than traditional</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Need Attention</CardDescription>
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.strugglingLearners}</div>
              <p className="text-sm text-muted-foreground mt-1">Employees struggling</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            {/* Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Training Completion Trend</CardTitle>
                <CardDescription>
                  Weekly progress vs. target completion goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="hsl(262 70% 55%)" name="Completed" />
                    <Bar dataKey="target" fill="hsl(220 20% 80%)" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cohort Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cohort Progress Overview</CardTitle>
                    <CardDescription>
                      Track completion rates by department or team
                    </CardDescription>
                  </div>
                  <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 border-2 border-success rounded-lg bg-success/5">
                    <div className="text-4xl font-bold text-success mb-2">{stats.aheadLearners}</div>
                    <p className="text-sm font-medium">Ahead of Schedule</p>
                    <p className="text-xs text-muted-foreground mt-1">&gt;70% progress</p>
                  </div>
                  <div className="text-center p-6 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="text-4xl font-bold text-primary mb-2">{stats.onTrackLearners}</div>
                    <p className="text-sm font-medium">On Track</p>
                    <p className="text-xs text-muted-foreground mt-1">30-70% progress</p>
                  </div>
                  <div className="text-center p-6 border-2 border-destructive rounded-lg bg-destructive/5">
                    <div className="text-4xl font-bold text-destructive mb-2">{stats.strugglingLearners}</div>
                    <p className="text-sm font-medium">Need Support</p>
                    <p className="text-xs text-muted-foreground mt-1">&lt;30% progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Training Status</CardTitle>
                <CardDescription>
                  Individual progress and intervention recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Avg Progress</TableHead>
                      <TableHead>Courses Enrolled</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.slice(0, 10).map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{emp.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{emp.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(emp.status)} className={getStatusClassName(emp.status)}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${emp.avgProgress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{emp.avgProgress.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{emp.enrollments.length}</TableCell>
                        <TableCell>
                          {emp.enrollments.filter((e: any) => e.completed_at).length}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(emp.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Audit Reports</CardTitle>
                <CardDescription>
                  Generate reports for training compliance and regulatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Training Hours Report</p>
                        <p className="text-sm text-muted-foreground">Total hours logged per employee</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Completion Certificates</p>
                        <p className="text-sm text-muted-foreground">Export all earned certificates</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">ROI Analysis</p>
                        <p className="text-sm text-muted-foreground">Cost savings & productivity gains</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Audit Trail</p>
                        <p className="text-sm text-muted-foreground">Who trained on what, when, scores</p>
                      </div>
                    </Button>
                  </div>

                  <div className="p-6 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-4">SCORM Export</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export training data in SCORM format for integration with your LMS or compliance system
                    </p>
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Export SCORM Package
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default LDManagerDashboard;
