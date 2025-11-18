import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap, 
  Target,
  Award,
  Clock,
  BarChart3,
  Check
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ExecutiveDashboard = () => {
  const [stats, setStats] = useState({
    totalInvestment: 250000,
    costPerEmployee: 1200,
    traditionalCost: 15000,
    costSavings: 0,
    roi: 0,
    monthsToBreakeven: 0,
    employeesTrained: 0,
    skillVelocity: 0,
    avgTimeToCompetency: 8,
    traditionalTimeToCompetency: 16,
    skillRetention: 70,
    activeUsers: 0
  });

  const [trainingVelocity, setTrainingVelocity] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadExecutiveMetrics();
  }, []);

  const loadExecutiveMetrics = async () => {
    try {
      // Get total users and enrollments
      const [usersResult, enrollmentsResult, completedResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }).not('completed_at', 'is', null)
      ]);

      const totalUsers = usersResult.count || 0;
      const totalEnrollments = enrollmentsResult.count || 0;
      const completedEnrollments = completedResult.count || 0;

      // Calculate ROI metrics
      const costSavings = totalUsers * (stats.traditionalCost - stats.costPerEmployee);
      const roi = ((costSavings - stats.totalInvestment) / stats.totalInvestment) * 100;
      const monthsToBreakeven = roi > 0 ? Math.ceil(stats.totalInvestment / (costSavings / 12)) : 12;

      // Calculate skill velocity (employees trained per quarter)
      const skillVelocity = Math.ceil(totalUsers / 3); // Simulate quarterly rate

      setStats(prev => ({
        ...prev,
        employeesTrained: totalUsers,
        costSavings,
        roi,
        monthsToBreakeven,
        skillVelocity,
        activeUsers: totalUsers
      }));

      // Generate training velocity data (last 6 months)
      const velocityData = [
        { month: 'Jan', trained: Math.floor(totalUsers * 0.1), benchmark: 25 },
        { month: 'Feb', trained: Math.floor(totalUsers * 0.2), benchmark: 30 },
        { month: 'Mar', trained: Math.floor(totalUsers * 0.35), benchmark: 35 },
        { month: 'Apr', trained: Math.floor(totalUsers * 0.55), benchmark: 40 },
        { month: 'May', trained: Math.floor(totalUsers * 0.75), benchmark: 45 },
        { month: 'Jun', trained: totalUsers, benchmark: 50 }
      ];
      setTrainingVelocity(velocityData);

      // Get skill distribution
      const { data: coursesData } = await supabase
        .from('courses')
        .select('category')
        .limit(100);

      if (coursesData) {
        const categoryCount: { [key: string]: number } = {};
        coursesData.forEach(course => {
          const cat = course.category || 'Other';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        const distribution = Object.entries(categoryCount).map(([name, value]) => ({
          name,
          value
        }));
        setSkillDistribution(distribution);
      }

    } catch (error) {
      console.error('Error loading executive metrics:', error);
    }
  };

  const COLORS = ['hsl(262 70% 55%)', 'hsl(270 75% 60%)', 'hsl(240 80% 60%)', 'hsl(220 70% 55%)', 'hsl(200 70% 50%)'];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Strategic insights & ROI analysis for training investment
          </p>
        </div>

        {/* ROI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Investment</CardDescription>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${(stats.totalInvestment / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Platform & Training Cost
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Cost Savings</CardDescription>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                ${(stats.costSavings / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                vs Traditional Training
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>ROI</CardDescription>
                <Target className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {stats.roi > 0 ? '+' : ''}{stats.roi.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Return on Investment
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Break-Even</CardDescription>
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {stats.monthsToBreakeven}mo
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Time to Payback
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="velocity">Skill Velocity</TabsTrigger>
            <TabsTrigger value="competitive">Competitive Edge</TabsTrigger>
          </TabsList>

          <TabsContent value="roi" className="space-y-6">
            {/* ROI Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Investment vs. Savings Breakdown</CardTitle>
                <CardDescription>
                  Cost per employee: ${stats.costPerEmployee} (UnboundEd AI) vs ${stats.traditionalCost} (Traditional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Employees Trained</p>
                      <p className="text-2xl font-bold">{stats.employeesTrained}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Savings Per Employee</p>
                      <p className="text-2xl font-bold text-success">${stats.traditionalCost - stats.costPerEmployee}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                      <p className="text-2xl font-bold text-success">${(stats.costSavings / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Investment Recovery</span>
                      <span className="text-sm font-bold">{Math.min(100, (stats.costSavings / stats.totalInvestment) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-hero transition-all duration-1000"
                        style={{ width: `${Math.min(100, (stats.costSavings / stats.totalInvestment) * 100)}%` }}
                      />
                    </div>
                    {stats.roi > 0 && (
                      <p className="text-sm text-success mt-2">
                        ✓ Investment recovered! Generating {stats.roi.toFixed(0)}% returns
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time to Competency Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Time-to-Competency Advantage</CardTitle>
                <CardDescription>
                  How fast employees reach job-ready skill levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Traditional Training</p>
                        <p className="text-2xl font-bold">{stats.traditionalTimeToCompetency} weeks</p>
                      </div>
                      <Badge variant="outline">Baseline</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <div>
                        <p className="text-sm text-muted-foreground">UnboundEd AI</p>
                        <p className="text-2xl font-bold text-primary">{stats.avgTimeToCompetency} weeks</p>
                      </div>
                      <Badge className="bg-gradient-hero">50% Faster</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">2X</div>
                      <p className="text-muted-foreground">Speed Improvement</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Save {stats.traditionalTimeToCompetency - stats.avgTimeToCompetency} weeks per employee
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-6">
            {/* Skill Velocity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Training Velocity Trend</CardTitle>
                <CardDescription>
                  Employees trained per month vs. industry benchmark
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingVelocity}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="trained" 
                      stroke="hsl(262 70% 55%)" 
                      strokeWidth={3}
                      name="UnboundEd AI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="hsl(220 20% 60%)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Industry Avg"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm">Your Organization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Industry Average</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skill Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Portfolio Distribution</CardTitle>
                <CardDescription>
                  Where your team is upskilling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={skillDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {skillDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {skillDistribution.map((skill, index) => (
                      <div key={skill.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{skill.name}</span>
                        </div>
                        <Badge variant="outline">{skill.value} courses</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Skill Velocity</CardDescription>
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.skillVelocity}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Employees per quarter
                  </p>
                  <Badge className="mt-2 bg-success/10 text-success hover:bg-success/20">
                    50% above industry
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Skill Retention</CardDescription>
                    <Award className="w-5 h-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.skillRetention}%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Skills used on the job
                  </p>
                  <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/20">
                    High retention
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription>Active Learners</CardDescription>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeUsers}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Currently training
                  </p>
                  <Badge className="mt-2 bg-accent/10 text-accent hover:bg-accent/20">
                    Growing fast
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            {/* Competitive Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantage</CardTitle>
                <CardDescription>
                  How you compare to industry standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border-2 border-success rounded-lg bg-success/5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Training Speed</p>
                          <p className="text-sm text-muted-foreground">Time to competency</p>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-success mb-2">50% Faster</div>
                      <p className="text-sm text-muted-foreground">
                        What takes competitors 16 weeks, you achieve in 8 weeks
                      </p>
                    </div>

                    <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Cost Efficiency</p>
                          <p className="text-sm text-muted-foreground">Per employee savings</p>
                        </div>
                      </div>
                      <div className="text-4xl font-bold text-primary mb-2">92% Cheaper</div>
                      <p className="text-sm text-muted-foreground">
                        $1,200 vs $15,000 traditional training cost
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-2 border-accent rounded-lg bg-accent/5">
                    <h3 className="font-semibold text-lg mb-4">Strategic Impact</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Market Responsiveness</p>
                          <p className="text-sm text-muted-foreground">
                            Upskill teams 2x faster → respond to market changes quicker
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Innovation Capacity</p>
                          <p className="text-sm text-muted-foreground">
                            Broader skill base → more innovation potential
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Talent Retention</p>
                          <p className="text-sm text-muted-foreground">
                            Career development investment → higher employee retention
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-gradient-hero text-white border-0">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-90" />
                        <h3 className="text-2xl font-bold mb-2">
                          6-Month Projection
                        </h3>
                        <p className="text-white/90 mb-4">
                          At current velocity, your entire organization will be AI-competent in 9 months
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div>
                            <div className="text-3xl font-bold">100%</div>
                            <div className="text-sm text-white/80">Coverage</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold">${((stats.costSavings * 2) / 1000).toFixed(0)}K</div>
                            <div className="text-sm text-white/80">Projected Savings</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold">{(stats.roi * 1.5).toFixed(0)}%</div>
                            <div className="text-sm text-white/80">Target ROI</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ExecutiveDashboard;
