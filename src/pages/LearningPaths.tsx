import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, Loader2, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function LearningPaths() {
  const [careerGoal, setCareerGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [timeCommitment, setTimeCommitment] = useState("5");
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!careerGoal.trim()) {
      toast({
        title: "Career goal required",
        description: "Please enter your career goal",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-learning-path', {
        body: { 
          careerGoal,
          currentLevel,
          timeCommitment: parseInt(timeCommitment)
        }
      });

      if (error) throw error;

      setLearningPath(data.learningPath);
      
      toast({
        title: "Learning Path Generated!",
        description: "Your personalized curriculum is ready",
      });
    } catch (error: any) {
      console.error('Error generating learning path:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate learning path",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Learning Path Generator
            </h1>
            <p className="text-muted-foreground">
              Get a personalized, AI-generated curriculum based on your career goals
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Define Your Goals</CardTitle>
              <CardDescription>
                Tell us about your career aspirations and we'll create a customized learning path
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="careerGoal">Career Goal</Label>
                <Input
                  id="careerGoal"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g., Full Stack Developer, ML Engineer, Data Scientist"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentLevel">Current Level</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeCommitment">Time Commitment (hours/week)</Label>
                  <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3-5 hours</SelectItem>
                      <SelectItem value="5">5-10 hours</SelectItem>
                      <SelectItem value="10">10-15 hours</SelectItem>
                      <SelectItem value="15">15+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Your Path...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate Learning Path
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {learningPath && (
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{learningPath.pathTitle}</CardTitle>
                  <CardDescription>{learningPath.pathDescription}</CardDescription>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {learningPath.estimatedWeeks} weeks
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {learningPath.courses?.length || 0} courses
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningPath.courses?.map((course: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                            Week {course.weekNumber}
                          </span>
                          {course.level && (
                            <Badge variant="outline" className="capitalize">
                              {course.level}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{course.reason}</p>
                        {course.duration && (
                          <p className="text-xs text-muted-foreground">{course.duration}h duration</p>
                        )}
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
          )}
        </div>
      </div>
    </AppLayout>
  );
}
