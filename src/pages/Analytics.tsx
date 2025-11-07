import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target, Award, Brain } from "lucide-react";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your progress and discover insights powered by AI
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Learning Velocity"
            value="8.5 hrs/week"
            change="+12%"
            trend="up"
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            title="Completion Rate"
            value="87%"
            change="+5%"
            trend="up"
            icon={<Target className="w-5 h-5" />}
          />
          <MetricCard
            title="Avg. Quiz Score"
            value="92%"
            change="+3%"
            trend="up"
            icon={<Award className="w-5 h-5" />}
          />
          <MetricCard
            title="Engagement Score"
            value="A+"
            change="Maintained"
            trend="stable"
            icon={<Brain className="w-5 h-5" />}
          />
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">Progress Overview</TabsTrigger>
            <TabsTrigger value="skills">Skill Development</TabsTrigger>
            <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            {/* Learning Path Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Current Learning Path Progress</CardTitle>
                <CardDescription>Full-Stack Web Development Track</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ModuleProgress
                  title="Frontend Fundamentals"
                  completed={8}
                  total={8}
                  status="completed"
                />
                <ModuleProgress
                  title="React & Modern JavaScript"
                  completed={6}
                  total={8}
                  status="in-progress"
                />
                <ModuleProgress
                  title="Backend Development"
                  completed={0}
                  total={10}
                  status="upcoming"
                />
                <ModuleProgress
                  title="Database Design"
                  completed={0}
                  total={6}
                  status="upcoming"
                />
              </CardContent>
            </Card>

            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Learning hours by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DayActivity day="Monday" hours={2.5} max={4} />
                  <DayActivity day="Tuesday" hours={1.5} max={4} />
                  <DayActivity day="Wednesday" hours={3} max={4} />
                  <DayActivity day="Thursday" hours={2} max={4} />
                  <DayActivity day="Friday" hours={3.5} max={4} />
                  <DayActivity day="Saturday" hours={4} max={4} />
                  <DayActivity day="Sunday" hours={1} max={4} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Proficiency Map</CardTitle>
                <CardDescription>AI-assessed skill levels based on your performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SkillBar skill="React & Components" level={85} color="primary" />
                <SkillBar skill="JavaScript ES6+" level={78} color="primary" />
                <SkillBar skill="HTML & CSS" level={92} color="success" />
                <SkillBar skill="Problem Solving" level={88} color="success" />
                <SkillBar skill="API Integration" level={65} color="warning" />
                <SkillBar skill="State Management" level={58} color="warning" />
                <SkillBar skill="Testing & QA" level={42} color="destructive" />
                <SkillBar skill="Database Design" level={35} color="destructive" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Focus Areas</CardTitle>
                <CardDescription>AI-generated suggestions to accelerate your learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FocusRecommendation
                  title="State Management Patterns"
                  reason="Critical for advanced React development"
                  impact="high"
                />
                <FocusRecommendation
                  title="Testing Best Practices"
                  reason="Essential for professional development"
                  impact="high"
                />
                <FocusRecommendation
                  title="Performance Optimization"
                  reason="Enhance your existing React skills"
                  impact="medium"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Timeline</CardTitle>
                <CardDescription>Your learning journey over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <TimelineItem
                    date="Today, 10:15 AM"
                    title="Completed Module: React Hooks Deep Dive"
                    description="Score: 95% • Time: 45 minutes"
                    type="completion"
                  />
                  <TimelineItem
                    date="Yesterday, 3:30 PM"
                    title="Attended Live Session: State Management"
                    description="AI Instructor Sarah • 24 participants"
                    type="session"
                  />
                  <TimelineItem
                    date="2 days ago"
                    title="Achievement Unlocked: React Master"
                    description="Completed all React fundamentals modules"
                    type="achievement"
                  />
                  <TimelineItem
                    date="3 days ago"
                    title="Started New Course: Advanced React Patterns"
                    description="Estimated completion: 6 hours"
                    type="enrollment"
                  />
                  <TimelineItem
                    date="4 days ago"
                    title="Quiz Completed: JavaScript ES6+"
                    description="Score: 88% • Attempted: 2nd time"
                    type="quiz"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const MetricCard = ({ title, value, change, trend, icon }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <Badge variant={trend === "up" ? "default" : "secondary"} className="text-xs">
          {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : trend === "down" ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
          {change}
        </Badge>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </CardContent>
  </Card>
);

const ModuleProgress = ({ title, completed, total, status }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-medium">{title}</span>
        <Badge variant={status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"}>
          {status === "completed" ? "Completed" : status === "in-progress" ? "In Progress" : "Upcoming"}
        </Badge>
      </div>
      <span className="text-sm text-muted-foreground">{completed}/{total} modules</span>
    </div>
    <Progress value={(completed / total) * 100} className="h-2" />
  </div>
);

const DayActivity = ({ day, hours, max }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{day}</span>
      <span className="text-muted-foreground">{hours} hrs</span>
    </div>
    <Progress value={(hours / max) * 100} className="h-2" />
  </div>
);

const SkillBar = ({ skill, level, color }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{skill}</span>
      <span className="text-muted-foreground">{level}%</span>
    </div>
    <Progress value={level} className="h-2" />
  </div>
);

const FocusRecommendation = ({ title, reason, impact }: any) => (
  <div className="p-4 rounded-lg border border-border bg-muted/20">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold">{title}</h4>
      <Badge variant={impact === "high" ? "destructive" : "secondary"}>
        {impact} impact
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground">{reason}</p>
  </div>
);

const TimelineItem = ({ date, title, description, type }: any) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ${
        type === "completion" ? "bg-success" :
        type === "session" ? "bg-primary" :
        type === "achievement" ? "bg-warning" :
        "bg-muted-foreground"
      }`} />
      <div className="w-px h-full bg-border mt-2" />
    </div>
    <div className="flex-1 pb-8">
      <div className="text-xs text-muted-foreground mb-1">{date}</div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  </div>
);

export default Analytics;
