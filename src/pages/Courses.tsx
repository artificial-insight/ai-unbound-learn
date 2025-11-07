import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, Clock, Users, Star, TrendingUp, Code, Palette, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Courses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time enrollment updates
    const channel = supabase
      .channel('course-enrollment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_enrollments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadEnrollments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCourses(data);
    setLoading(false);
  };

  const loadEnrollments = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('course_enrollments')
      .select('*, courses(*)')
      .eq('user_id', user.id);
    
    if (data) setEnrollments(data);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnrolling(courseId);
      
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        });

      if (error) throw error;

      toast({
        title: "Enrolled Successfully",
        description: "You're now enrolled in this course!",
      });

      loadEnrollments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress_percentage || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Course Catalog
          </h1>
          <p className="text-muted-foreground">
            Explore our AI-curated courses and find your next learning adventure
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10" />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    courseId={course.id}
                    icon={<Code className="w-6 h-6" />}
                    title={course.title}
                    description={course.description}
                    level={course.level}
                    duration={`${course.duration_hours} hours`}
                    students={0}
                    rating={0}
                    progress={getEnrollmentProgress(course.id)}
                    enrolled={isEnrolled(course.id)}
                    onEnroll={handleEnroll}
                    enrolling={enrolling === course.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CourseCard
                icon={<Code className="w-6 h-6" />}
                title="Advanced React Patterns"
                description="Master advanced React concepts including hooks, context, and performance optimization"
                level="Intermediate"
                duration="6 hours"
                students={1247}
                rating={4.8}
                progress={0}
                recommended
              />
              <CourseCard
                icon={<Database className="w-6 h-6" />}
                title="RESTful API Design"
                description="Learn to design and build scalable RESTful APIs with best practices"
                level="Intermediate"
                duration="4 hours"
                students={892}
                rating={4.7}
                progress={0}
                recommended
              />
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-6">
            {enrollments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't enrolled in any courses yet
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    courseId={enrollment.course_id}
                    icon={<Code className="w-6 h-6" />}
                    title={enrollment.courses.title}
                    description={enrollment.courses.description}
                    level={enrollment.courses.level}
                    duration={`${enrollment.courses.duration_hours} hours`}
                    students={0}
                    rating={0}
                    progress={enrollment.progress_percentage}
                    enrolled={true}
                    onEnroll={handleEnroll}
                    enrolling={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const CourseCard = ({ courseId, icon, title, description, level, duration, students, rating, progress, recommended, enrolled, onEnroll, enrolling }: any) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <CardHeader>
      <div className="flex items-start justify-between mb-2">
        <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center text-white">
          {icon}
        </div>
        {recommended && (
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            AI Pick
          </Badge>
        )}
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {duration}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline">{level}</Badge>
        {progress > 0 && (
          <span className="text-sm text-primary font-medium">{progress}% Complete</span>
        )}
      </div>

      {progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Button 
        className="w-full" 
        onClick={() => {
          if (!enrolled) {
            onEnroll(courseId);
          } else {
            window.location.href = `/course/${courseId}`;
          }
        }}
        disabled={enrolling}
      >
        {enrolling ? "Enrolling..." : progress > 0 ? "Continue Learning" : enrolled ? "View Course" : "Enroll Now"}
      </Button>
    </CardContent>
  </Card>
);

export default Courses;
