import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp, Calendar } from "lucide-react";

interface TimeToCompetencyProps {
  currentProgress: number; // 0-100
  hoursPerWeek: number;
  totalHoursNeeded: number;
  skillName: string;
  targetRole?: string;
}

export const TimeToCompetency = ({
  currentProgress,
  hoursPerWeek,
  totalHoursNeeded,
  skillName,
  targetRole = "job-ready"
}: TimeToCompetencyProps) => {
  // Calculate time remaining
  const hoursCompleted = (currentProgress / 100) * totalHoursNeeded;
  const hoursRemaining = totalHoursNeeded - hoursCompleted;
  const weeksRemaining = Math.ceil(hoursRemaining / hoursPerWeek);
  const daysRemaining = weeksRemaining * 7;

  // Calculate projected completion date
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);

  // Determine pace status
  const getPaceStatus = () => {
    if (hoursPerWeek >= 15) return { label: 'Fast Track', color: 'success' };
    if (hoursPerWeek >= 10) return { label: 'On Track', color: 'primary' };
    if (hoursPerWeek >= 5) return { label: 'Steady Pace', color: 'warning' };
    return { label: 'Light Pace', color: 'muted-foreground' };
  };

  const pace = getPaceStatus();

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Time to Competency</CardTitle>
          <Badge variant="outline" className={`text-${pace.color}`}>
            {pace.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Time Estimate */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border-2 border-primary/20">
          <Clock className="w-12 h-12 mx-auto mb-3 text-primary" />
          <div className="text-4xl font-bold text-primary mb-2">
            {weeksRemaining} weeks
          </div>
          <p className="text-sm text-muted-foreground">
            Until you're {targetRole} in <span className="font-semibold">{skillName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            At your current pace of {hoursPerWeek} hours/week
          </p>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {hoursCompleted.toFixed(0)} of {totalHoursNeeded} hours completed
            </p>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{hoursCompleted.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Hours Done</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{hoursRemaining.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Hours Left</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
          </div>
        </div>

        {/* Projected Completion */}
        <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <Calendar className="w-8 h-8 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium">Estimated Completion</p>
            <p className="text-lg font-bold text-accent">
              {completionDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Speed Up Options */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium">Want to finish faster?</p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span>Study 15 hrs/week:</span>
              <span className="font-bold text-success">
                {Math.ceil(hoursRemaining / 15)} weeks
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span>Study 20 hrs/week:</span>
              <span className="font-bold text-success">
                {Math.ceil(hoursRemaining / 20)} weeks
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span>Full-time (40 hrs/week):</span>
              <span className="font-bold text-success">
                {Math.ceil(hoursRemaining / 40)} weeks
              </span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="p-4 bg-gradient-hero text-white rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5" />
            <p className="font-semibold">Traditional Training</p>
          </div>
          <p className="text-sm opacity-90">
            Would take <span className="font-bold">{weeksRemaining * 2} weeks</span> to reach the same level
          </p>
          <Badge className="mt-2 bg-white/20 hover:bg-white/30">
            You're learning 2x faster with AI
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
