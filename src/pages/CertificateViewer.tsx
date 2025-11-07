import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Certificate } from "@/components/Certificate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CertificateViewer = () => {
  const { enrollmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enrollmentId && user) {
      loadCertificateData();
    }
  }, [enrollmentId, user]);

  const loadCertificateData = async () => {
    try {
      // Load enrollment with course data
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("id", enrollmentId)
        .eq("user_id", user!.id)
        .single();

      if (enrollmentError) throw enrollmentError;

      // Check if course is completed
      if (!enrollment.completed_at || enrollment.progress_percentage !== 100) {
        toast({
          title: "Certificate Not Available",
          description: "You must complete the course to view the certificate.",
          variant: "destructive",
        });
        navigate("/courses");
        return;
      }

      // Load course details
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", enrollment.course_id)
        .single();

      if (courseError) throw courseError;

      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (profileError) throw profileError;

      setCertificateData({
        courseTitle: course.title,
        userName: profile.full_name || profile.email,
        completedAt: enrollment.completed_at,
        courseLevel: course.level,
        durationHours: course.duration_hours,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !certificateData) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading certificate...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 print:hidden">
          <Button variant="ghost" onClick={() => navigate("/courses")}>
            ← Back to Courses
          </Button>
        </div>

        <Certificate {...certificateData} />
      </div>
    </AppLayout>
  );
};

export default CertificateViewer;
