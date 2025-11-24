import { AppLayout } from "@/components/AppLayout";
import { Leaderboard } from "@/components/Leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Zap, Award } from "lucide-react";

const LeaderboardPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete with peers and celebrate learning achievements
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>

          {/* Stats and Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Points Work</CardTitle>
                <CardDescription>Earn points through learning activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Complete a Course</p>
                    <p className="text-xs text-muted-foreground">+100 points per course</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Study Time</p>
                    <p className="text-xs text-muted-foreground">+1 point per 10 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                    <Zap className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Learning Streak</p>
                    <p className="text-xs text-muted-foreground">Study daily for bonus multipliers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Perfect Scores</p>
                    <p className="text-xs text-muted-foreground">+50 bonus points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-2">
              <CardHeader>
                <CardTitle className="text-lg">Leaderboard Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Track your progress against peers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Stay motivated with friendly competition</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Celebrate learning achievements together</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Build consistent study habits</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-warning mx-auto mb-3" />
                  <p className="font-semibold text-sm mb-1">Top 3 This Month</p>
                  <p className="text-xs text-muted-foreground">
                    Earn special recognition and exclusive badges
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
