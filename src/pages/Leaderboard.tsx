import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Flame, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  completed_courses: number;
  achievements_count: number;
  current_streak: number;
  total_score: number;
}

const Leaderboard = () => {
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      // Get all profiles with their stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email');

      if (profilesError) throw profilesError;

      const leaderboardData = await Promise.all(
        profiles.map(async (profile) => {
          // Count completed courses
          const { count: completedCourses } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('progress_percentage', 100);

          // Count achievements
          const { count: achievementsCount } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Get current streak
          const { data: streakData } = await supabase
            .from('learning_streaks')
            .select('current_streak')
            .eq('user_id', profile.id)
            .single();

          const currentStreak = streakData?.current_streak || 0;
          
          // Calculate total score (weighted: courses=100, achievements=50, streak days=10)
          const totalScore = 
            (completedCourses || 0) * 100 + 
            (achievementsCount || 0) * 50 + 
            currentStreak * 10;

          return {
            user_id: profile.id,
            full_name: profile.full_name || 'Anonymous',
            avatar_url: profile.avatar_url,
            email: profile.email,
            completed_courses: completedCourses || 0,
            achievements_count: achievementsCount || 0,
            current_streak: currentStreak,
            total_score: totalScore,
          };
        })
      );

      // Sort by total score
      const sorted = leaderboardData.sort((a, b) => b.total_score - a.total_score);
      setLeaderboard(sorted);
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 1st</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">🥈 2nd</Badge>;
    if (index === 2) return <Badge className="bg-amber-600">🥉 3rd</Badge>;
    return <Badge variant="outline">#{index + 1}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top learners ranked by completed courses, achievements, and learning streaks
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard.reduce((sum, entry) => sum + entry.achievements_count, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard.reduce((sum, entry) => sum + entry.completed_courses, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Ranked by total score (Courses × 100 + Achievements × 50 + Streak Days × 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No data yet. Start learning to appear on the leaderboard!</div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getRankBadge(index)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>{entry.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{entry.full_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{entry.email}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{entry.completed_courses}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="font-medium">{entry.achievements_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{entry.current_streak}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{entry.total_score}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;