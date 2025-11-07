import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Brain, BookOpen, TrendingUp, Clock, Award, Sparkles, Play, Code } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
      
      loadRecommendations();
      loadAchievements();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates for enrollments
    const enrollmentChannel = supabase
      .channel('enrollment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_enrollments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadRecommendations();
        }
      )
      .subscribe();

    // Subscribe to achievements
    const achievementChannel = supabase
      .channel('achievement-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          toast({
            title: "Achievement Unlocked! 🎉",
            description: payload.new.title,
          });
          loadAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(enrollmentChannel);
      supabase.removeChannel(achievementChannel);
    };
  }, [user]);

  const [achievements, setAchievements] = useState<any[]>([]);

  const loadAchievements = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(3);
    
    if (data) setAchievements(data);
  };

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const { data, error } = await supabase.functions.invoke('recommend-courses');
      
      if (error) throw error;
      
      if (data?.recommendations) {
        setRecommendations(data.recommendations.slice(0, 2));
      }
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load AI recommendations",
        variant: "destructive",
      });
    } finally {
      setLoadingRecs(false);
    }
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Let's make today count.
          </p>
        </div>

        {/* Current Learning Path */}
        <Card className="mb-8 border-primary/20 bg-gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Current Learning Path
                </CardTitle>
                <CardDescription>Full-Stack Web Development</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-success text-success-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                On Track
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">68% Complete</span>
              </div>
              <Progress value={68} className="h-3" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <StatCard icon={<BookOpen className="w-5 h-5" />} label="Modules Completed" value="12/18" />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Learning Hours" value="45.5" />
              <StatCard icon={<Award className="w-5 h-5" />} label="Achievements" value={achievements.length.toString()} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 rounded-lg bg-gradient-card border border-border">
                    <div className="text-4xl mb-2">{achievement.badge_icon}</div>
                    <h4 className="font-semibold mb-1">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Recommended & Live Sessions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Recommended for You
              </CardTitle>
              <CardDescription>Personalized based on your progress and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRecs ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading AI recommendations...
                </div>
              ) : recommendations.length > 0 ? (
                <>
                  {recommendations.map((rec, idx) => (
                    <RecommendedCourse
                      key={idx}
                      title={rec.title}
                      reason={rec.reason}
                      difficulty={rec.level || "Intermediate"}
                      duration={`${rec.duration || 6} hours`}
                    />
                  ))}
                  <Link to="/courses">
                    <Button variant="outline" className="w-full">
                      View All Recommendations
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recommendations available yet. Enroll in courses to get personalized suggestions!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Upcoming Live Sessions
              </CardTitle>
              <CardDescription>Join AI-powered interactive classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LiveSessionCard
                title="React State Management Deep Dive"
                instructor="AI Instructor: Sarah"
                time="Today, 2:00 PM"
                participants={24}
              />
              <LiveSessionCard
                title="Building RESTful APIs with Node.js"
                instructor="AI Instructor: Marcus"
                time="Tomorrow, 10:00 AM"
                participants={18}
              />
              <Link to="/session">
                <Button className="w-full">
                  View All Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Your Performance Insights</CardTitle>
            <CardDescription>Track your progress and identify areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="focus">Focus Areas</TabsTrigger>
              </TabsList>
              <TabsContent value="progress" className="space-y-4 pt-4">
                <ProgressItem subject="React & Components" progress={85} trend="up" />
                <ProgressItem subject="JavaScript ES6+" progress={78} trend="up" />
                <ProgressItem subject="CSS & Styling" progress={72} trend="stable" />
                <ProgressItem subject="Backend Development" progress={45} trend="up" />
              </TabsContent>
              <TabsContent value="strengths" className="pt-4">
                <div className="grid gap-3">
                  <StrengthBadge skill="Component Architecture" level="Advanced" />
                  <StrengthBadge skill="Problem Solving" level="Advanced" />
                  <StrengthBadge skill="Responsive Design" level="Intermediate" />
                  <StrengthBadge skill="API Integration" level="Intermediate" />
                </div>
              </TabsContent>
              <TabsContent value="focus" className="pt-4 space-y-3">
                <FocusArea
                  area="State Management"
                  description="Practice advanced React state patterns and Context API"
                  priority="high"
                />
                <FocusArea
                  area="Testing & QA"
                  description="Build stronger testing habits with Jest and React Testing Library"
                  priority="medium"
                />
                <FocusArea
                  area="Performance Optimization"
                  description="Learn to optimize bundle size and rendering performance"
                  priority="medium"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
    <div className="text-primary">{icon}</div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);

const RecommendedCourse = ({ title, reason, difficulty, duration }: any) => (
  <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground mb-3">{reason}</p>
    <div className="flex items-center gap-3 text-xs">
      <Badge variant="outline">{difficulty}</Badge>
      <span className="text-muted-foreground">{duration}</span>
    </div>
  </div>
);

const LiveSessionCard = ({ title, instructor, time, participants }: any) => (
  <div className="p-4 rounded-lg bg-muted/30 border border-border">
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground mb-2">{instructor}</p>
    <div className="flex items-center justify-between text-xs">
      <span className="text-primary font-medium">{time}</span>
      <span className="text-muted-foreground">{participants} enrolled</span>
    </div>
  </div>
);

const ProgressItem = ({ subject, progress, trend }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{subject}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{progress}%</span>
        <Badge variant={trend === "up" ? "default" : "secondary"} className="text-xs">
          {trend === "up" ? "↑" : "→"}
        </Badge>
      </div>
    </div>
    <Progress value={progress} className="h-2" />
  </div>
);

const StrengthBadge = ({ skill, level }: any) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
    <span className="font-medium">{skill}</span>
    <Badge variant={level === "Advanced" ? "default" : "secondary"}>{level}</Badge>
  </div>
);

const FocusArea = ({ area, description, priority }: any) => (
  <div className="p-4 rounded-lg border border-border">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold">{area}</h4>
      <Badge variant={priority === "high" ? "destructive" : "secondary"}>
        {priority} priority
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Dashboard;
