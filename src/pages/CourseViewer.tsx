import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import AITutor from "@/components/AITutor";
import { SimilarCourses } from "@/components/SimilarCourses";
import { EnhancedAITeacher } from "@/components/EnhancedAITeacher";
import { AdaptiveDifficultyIndicator } from "@/components/AdaptiveDifficultyIndicator";
import { TimeToCompetency } from "@/components/TimeToCompetency";
import { GamificationEffects } from "@/components/GamificationEffects";
import { InteractiveAssessment } from "@/components/InteractiveAssessment";
import { AIChat } from "@/components/AIChat";
import { Leaderboard } from "@/components/Leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, PlayCircle, BookOpen, MessageSquare, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CourseViewer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [exerciseAnswer, setExerciseAnswer] = useState("");

  useEffect(() => {
    if (courseId && user) {
      loadCourseData();
    }
  }, [courseId, user]);

  useEffect(() => {
    if (!courseId || !user) return;

    // Subscribe to real-time updates for module progress
    const channel = supabase
      .channel('module-progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, user]);

  const loadCourseData = async () => {
    // Load course
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseData) setCourse(courseData);

    // Load modules
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (modulesData) {
      setModules(modulesData);
      if (modulesData.length > 0) setCurrentModule(modulesData[0]);
    }

    // Load enrollment
    const { data: enrollmentData } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user!.id)
      .single();

    if (enrollmentData) setEnrollment(enrollmentData);

    loadProgress();
  };

  const loadProgress = async () => {
    const { data: progressData } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', user!.id);

    if (progressData) setModuleProgress(progressData);
  };

  const isModuleCompleted = (moduleId: string) => {
    return moduleProgress.some(p => p.module_id === moduleId && p.completed);
  };

  const handleCompleteModule = async (moduleId: string) => {
    if (!enrollment) return;

    try {
      // Check if progress exists
      const existingProgress = moduleProgress.find(p => p.module_id === moduleId);

      if (existingProgress) {
        await supabase
          .from('module_progress')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('module_progress')
          .insert({
            user_id: user!.id,
            module_id: moduleId,
            enrollment_id: enrollment.id,
            completed: true,
            completed_at: new Date().toISOString(),
          });
      }

      // Update enrollment progress
      const completedCount = moduleProgress.filter(p => p.completed).length + 1;
      const progressPercentage = Math.round((completedCount / modules.length) * 100);

      await supabase
        .from('course_enrollments')
        .update({ progress_percentage: progressPercentage })
        .eq('id', enrollment.id);

      // Check for achievements and update enrollment completion
      if (progressPercentage === 100) {
        await supabase.from('achievements').insert({
          user_id: user!.id,
          title: 'Course Completed',
          description: `Completed ${course.title}`,
          category: 'completion',
          badge_icon: '🎓',
        });

        // Mark enrollment as completed
        await supabase
          .from('course_enrollments')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', enrollment.id);
      }

      toast({
        title: "Module Completed!",
        description: "Great job! Keep learning.",
      });

      loadProgress();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!course || !enrollment) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading course...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            ← Back to Courses
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  <Badge>{course.level}</Badge>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <Progress value={enrollment.progress_percentage} />
                  {enrollment.progress_percentage === 100 && enrollment.completed_at && (
                    <Button
                      onClick={() => navigate(`/certificate/${enrollment.id}`)}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {currentModule && (
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  <TabsTrigger value="exercise">Exercise</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  {/* Enhanced AI Teacher */}
                  {course && currentModule && (
                    <EnhancedAITeacher 
                      courseTitle={course.title}
                      topicTitle={currentModule.title}
                    />
                  )}

                  {/* Gamification Effects */}
                  <GamificationEffects />

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        {currentModule.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground ml-2">Video Player</p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p>{currentModule.content || "Module content goes here..."}</p>
                      </div>
                      <Button
                        onClick={() => handleCompleteModule(currentModule.id)}
                        disabled={isModuleCompleted(currentModule.id)}
                        className="w-full"
                      >
                        {isModuleCompleted(currentModule.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          "Mark as Complete"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quiz">
                  {course && currentModule && (
                    <InteractiveAssessment 
                      courseTitle={course.title}
                      moduleTitle={currentModule.title}
                    />
                  )}
                </TabsContent>

                <TabsContent value="exercise">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hands-on Exercise</CardTitle>
                      <CardDescription>Practice what you've learned</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Write a function that solves the given problem:</Label>
                        <Textarea
                          value={exerciseAnswer}
                          onChange={(e) => setExerciseAnswer(e.target.value)}
                          placeholder="// Your code here..."
                          className="font-mono min-h-[200px]"
                        />
                      </div>
                      <Button>Submit Exercise</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Modules List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  Course Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setCurrentModule(module)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentModule?.id === module.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isModuleCompleted(module.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{module.title}</p>
                        {module.duration_minutes && (
                          <p className="text-xs text-muted-foreground">
                            {module.duration_minutes} mins
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Time to Competency */}
            {course && enrollment && (
              <TimeToCompetency 
                currentProgress={enrollment.progress_percentage || 0}
                hoursPerWeek={10}
                totalHoursNeeded={course.duration_hours || 40}
                skillName={course.title}
                targetRole="certified"
              />
            )}

            {/* Adaptive Difficulty Indicator */}
            <AdaptiveDifficultyIndicator 
              currentDifficulty="just-right"
              userPerformance={enrollment?.progress_percentage || 0}
            />

            {/* Similar Courses */}
            <SimilarCourses courseId={courseId!} />

            {/* Leaderboard */}
            <Leaderboard />

            {/* AI Tutor (Legacy) */}
            <AITutor courseId={courseId} />
          </div>
        </div>

        {/* Floating AI Chat */}
        {course && currentModule && (
          <AIChat 
            courseTitle={course.title}
            topicTitle={currentModule.title}
            variant="floating"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CourseViewer;
