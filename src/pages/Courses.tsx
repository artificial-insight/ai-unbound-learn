import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, Users, Star, TrendingUp, Code, Palette, Database } from "lucide-react";

const Courses = () => {
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
              />
              <CourseCard
                icon={<Code className="w-6 h-6" />}
                title="TypeScript Fundamentals"
                description="Build type-safe applications with TypeScript from the ground up"
                level="Beginner"
                duration="5 hours"
                students={2134}
                rating={4.9}
                progress={0}
              />
              <CourseCard
                icon={<Palette className="w-6 h-6" />}
                title="Modern CSS & Tailwind"
                description="Create beautiful, responsive designs with modern CSS and Tailwind"
                level="Beginner"
                duration="4 hours"
                students={1567}
                rating={4.6}
                progress={0}
              />
              <CourseCard
                icon={<Database className="w-6 h-6" />}
                title="Database Design & SQL"
                description="Master relational database design and advanced SQL queries"
                level="Intermediate"
                duration="7 hours"
                students={945}
                rating={4.8}
                progress={0}
              />
              <CourseCard
                icon={<Code className="w-6 h-6" />}
                title="Full-Stack JavaScript"
                description="Build complete web applications with Node.js, Express, and React"
                level="Advanced"
                duration="12 hours"
                students={3421}
                rating={4.9}
                progress={0}
              />
            </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CourseCard
                icon={<Code className="w-6 h-6" />}
                title="React Fundamentals"
                description="Learn React from scratch and build your first applications"
                level="Beginner"
                duration="8 hours"
                students={4521}
                rating={4.9}
                progress={68}
              />
              <CourseCard
                icon={<Code className="w-6 h-6" />}
                title="JavaScript ES6+"
                description="Modern JavaScript features and best practices"
                level="Intermediate"
                duration="5 hours"
                students={3215}
                rating={4.8}
                progress={92}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const CourseCard = ({ icon, title, description, level, duration, students, rating, progress, recommended }: any) => (
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
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {students.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-warning text-warning" />
          {rating}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline">{level}</Badge>
        {progress > 0 && (
          <span className="text-sm text-primary font-medium">{progress}% Complete</span>
        )}
      </div>

      <Button className="w-full">
        {progress > 0 ? "Continue Learning" : "Enroll Now"}
      </Button>
    </CardContent>
  </Card>
);

export default Courses;
