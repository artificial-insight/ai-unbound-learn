import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, TrendingUp, Award, Activity, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Educator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor student performance and manage your courses
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminMetricCard
            title="Active Students"
            value="247"
            change="+12% this month"
            icon={<Users className="w-5 h-5" />}
            trend="up"
          />
          <AdminMetricCard
            title="Course Completion"
            value="82%"
            change="+5% vs last month"
            icon={<Award className="w-5 h-5" />}
            trend="up"
          />
          <AdminMetricCard
            title="Active Courses"
            value="12"
            change="2 new this week"
            icon={<BookOpen className="w-5 h-5" />}
            trend="stable"
          />
          <AdminMetricCard
            title="Avg. Engagement"
            value="8.5/10"
            change="+0.3 improvement"
            icon={<Activity className="w-5 h-5" />}
            trend="up"
          />
        </div>

        {/* Course Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Based on completion rate and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CoursePerformanceItem
                title="React Fundamentals"
                students={124}
                completion={94}
                rating={4.9}
              />
              <CoursePerformanceItem
                title="JavaScript ES6+"
                students={98}
                completion={89}
                rating={4.8}
              />
              <CoursePerformanceItem
                title="Full-Stack Development"
                students={87}
                completion={78}
                rating={4.7}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Trends</CardTitle>
              <CardDescription>Activity over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DayEngagement day="Monday" sessions={45} hours={89} />
              <DayEngagement day="Tuesday" sessions={52} hours={102} />
              <DayEngagement day="Wednesday" sessions={48} hours={95} />
              <DayEngagement day="Thursday" sessions={55} hours={108} />
              <DayEngagement day="Friday" sessions={42} hours={85} />
              <DayEngagement day="Saturday" sessions={38} hours={76} />
              <DayEngagement day="Sunday" sessions={25} hours={48} />
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Action Required
            </CardTitle>
            <CardDescription>Students needing attention or course updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertItem
              title="5 students at risk of dropping out"
              description="Low engagement in React Advanced course"
              action="Review Students"
              priority="high"
            />
            <AlertItem
              title="Course content update recommended"
              description="JavaScript ES6+ module needs refresh"
              action="Update Content"
              priority="medium"
            />
            <AlertItem
              title="Quiz scores below average"
              description="Database Design module - 65% avg score"
              action="Review Quiz"
              priority="medium"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const AdminMetricCard = ({ title, value, change, icon, trend }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <Badge variant={trend === "up" ? "default" : "secondary"} className="text-xs">
          {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
          {change}
        </Badge>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </CardContent>
  </Card>
);

const CoursePerformanceItem = ({ title, students, completion, rating }: any) => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{students} students enrolled</p>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-primary">{completion}%</div>
      <div className="text-xs text-muted-foreground">★ {rating}/5</div>
    </div>
  </div>
);

const DayEngagement = ({ day, sessions, hours }: any) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
    <span className="font-medium">{day}</span>
    <div className="flex items-center gap-6 text-sm">
      <span className="text-muted-foreground">{sessions} sessions</span>
      <span className="text-primary font-medium">{hours} hours</span>
    </div>
  </div>
);

const AlertItem = ({ title, description, action, priority }: any) => (
  <div className="flex items-start justify-between p-4 rounded-lg border border-border">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-semibold">{title}</h4>
        <Badge variant={priority === "high" ? "destructive" : "secondary"} className="text-xs">
          {priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Button variant="outline" size="sm">
      {action}
    </Button>
  </div>
);

export default AdminDashboard;
