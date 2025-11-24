import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  email: string;
  coursesCompleted: number;
  totalPoints: number;
  streak: number;
}

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "allTime">("month");

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    try {
      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .limit(50);

      if (!profiles) return;

      // Get enrollment data for each profile
      const leaderboardData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: enrollments } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("user_id", profile.id)
            .not("completed_at", "is", null);

          const { data: sessions } = await supabase
            .from("learning_sessions")
            .select("duration_minutes")
            .eq("user_id", profile.id);

          const coursesCompleted = enrollments?.length || 0;
          const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
          const totalPoints = coursesCompleted * 100 + Math.floor(totalMinutes / 10);

          // Calculate streak (simplified - based on recent activity)
          const { data: recentSessions } = await supabase
            .from("learning_sessions")
            .select("session_date")
            .eq("user_id", profile.id)
            .order("session_date", { ascending: false })
            .limit(7);

          let streak = 0;
          if (recentSessions && recentSessions.length > 0) {
            const dates = recentSessions.map((s) => new Date(s.session_date));
            const today = new Date();
            let currentDate = today;
            
            for (let i = 0; i < dates.length; i++) {
              const sessionDate = new Date(dates[i]);
              const diffDays = Math.floor(
                (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              
              if (diffDays <= 1) {
                streak++;
                currentDate = sessionDate;
              } else {
                break;
              }
            }
          }

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            coursesCompleted,
            totalPoints,
            streak,
          };
        })
      );

      // Sort by points and take top 10
      const sortedLeaders = leaderboardData
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);

      setLeaders(sortedLeaders);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-warning" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Award className="w-6 h-6 text-accent" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {(["week", "month", "allTime"] as const).map((tf) => (
              <Badge
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeframe(tf)}
              >
                {tf === "allTime" ? "All Time" : tf === "week" ? "Week" : "Month"}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaders.map((leader, idx) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                idx === 0
                  ? "bg-warning/5 border-warning/20"
                  : idx === 1
                  ? "bg-muted/50 border-muted"
                  : idx === 2
                  ? "bg-accent/5 border-accent/20"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex-shrink-0 w-10 flex items-center justify-center">
                {getRankIcon(idx + 1)}
              </div>

              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-hero text-primary-foreground">
                  {getInitials(leader.full_name, leader.email)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {leader.full_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{leader.email}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="font-bold text-lg">{leader.totalPoints}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{leader.coursesCompleted} courses</span>
                  {leader.streak > 0 && (
                    <Badge variant="outline" className="text-xs">
                      🔥 {leader.streak} day streak
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {leaders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No leaderboard data yet</p>
            <p className="text-sm mt-1">Complete courses to appear on the leaderboard!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
