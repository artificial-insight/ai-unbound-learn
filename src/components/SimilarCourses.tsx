import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SimilarCourse {
  title: string;
  reason: string;
  courseId?: string;
  level?: string;
  duration?: number;
}

interface SimilarCoursesProps {
  courseId: string;
}

export const SimilarCourses = ({ courseId }: SimilarCoursesProps) => {
  const [recommendations, setRecommendations] = useState<SimilarCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchSimilarCourses();
    }
  }, [courseId]);

  const fetchSimilarCourses = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('suggest-similar-courses', {
        body: { courseId }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      console.error('Error fetching similar courses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch similar courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Similar Courses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>You Might Also Like</CardTitle>
        </div>
        <CardDescription>
          Courses that complement what you're learning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((course, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{course.reason}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {course.level && (
                    <span className="capitalize">{course.level}</span>
                  )}
                  {course.duration && (
                    <span>{course.duration}h</span>
                  )}
                </div>
              </div>
              {course.courseId && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/course/${course.courseId}`)}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
