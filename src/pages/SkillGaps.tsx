import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2, CheckCircle2, AlertTriangle, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SkillGaps() {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      toast({
        title: "Target role required",
        description: "Please enter your target role",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-skill-gaps', {
        body: { targetRole }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete!",
        description: "Your skill gap analysis is ready",
      });
    } catch (error: any) {
      console.error('Error analyzing skill gaps:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze skill gaps",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Skill Gap Analysis
            </h1>
            <p className="text-muted-foreground">
              Discover what skills you need to achieve your career goals
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Define Your Target Role</CardTitle>
              <CardDescription>
                Enter the role you're aiming for and we'll analyze your skill gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer, AI/ML Engineer"
                />
              </div>

              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Your Skills...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Skill Gaps
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <div className="space-y-6">
              {/* Overall Readiness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Role Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Readiness</span>
                      <span className="font-semibold">{analysis.overallReadiness}%</span>
                    </div>
                    <Progress value={analysis.overallReadiness} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimated time to ready: {analysis.estimatedTimeToReady}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Current Skills
                  </CardTitle>
                  <CardDescription>Skills you've already acquired</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.currentSkills?.map((skill: any, index: number) => (
                    <div key={index} className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{skill.skill}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {skill.level} • {skill.source}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Skill Gaps
                  </CardTitle>
                  <CardDescription>Areas that need development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.skillGaps?.map((gap: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">{gap.skill}</p>
                            <Badge variant={getPriorityColor(gap.priority)}>
                              {gap.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Recommended Courses
                  </CardTitle>
                  <CardDescription>Courses to bridge your skill gaps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.recommendedCourses?.map((course: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getPriorityColor(course.priority)}>
                              {course.priority} priority
                            </Badge>
                            {course.level && (
                              <Badge variant="outline" className="capitalize">
                                {course.level}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.reason}</p>
                        </div>
                        {course.courseId && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/course/${course.courseId}`)}
                          >
                            View Course
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
