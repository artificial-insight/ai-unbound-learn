import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Recommendation {
  title: string;
  reason: string;
  courseId?: string;
  level?: string;
  duration?: number;
}

export const CourseRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('recommend-courses');

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch course recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading && recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Course Recommendations</CardTitle>
          </div>
          <CardDescription>
            Personalized suggestions based on your learning journey
          </CardDescription>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Course Recommendations</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        <CardDescription>
          Personalized suggestions based on your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {rec.level && (
                    <span className="capitalize">{rec.level}</span>
                  )}
                  {rec.duration && (
                    <span>{rec.duration}h</span>
                  )}
                </div>
              </div>
              {rec.courseId && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/course/${rec.courseId}`)}
                >
                  View Course
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
