import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, ArrowRight, TrendingUp, BookOpen, Code, Brain } from "lucide-react";

const blogPosts = [
  {
    id: "1",
    title: "Getting Started with AI-Powered Learning",
    excerpt: "Discover how artificial intelligence is revolutionizing the way we learn and master new skills.",
    category: "AI Learning",
    author: "Sarah Johnson",
    date: "2025-01-15",
    readTime: "5 min read",
    image: Brain,
    featured: true
  },
  {
    id: "2",
    title: "10 Tips for Effective Online Learning",
    excerpt: "Master the art of online education with these proven strategies for success.",
    category: "Study Tips",
    author: "Michael Chen",
    date: "2025-01-12",
    readTime: "7 min read",
    image: BookOpen,
    featured: true
  },
  {
    id: "3",
    title: "Building Your First Web Application",
    excerpt: "A comprehensive guide to creating your first full-stack web application from scratch.",
    category: "Tutorials",
    author: "Emma Davis",
    date: "2025-01-10",
    readTime: "12 min read",
    image: Code,
    featured: false
  },
  {
    id: "4",
    title: "The Future of Education Technology",
    excerpt: "Exploring emerging trends in EdTech and how they're shaping the learning landscape.",
    category: "Industry Insights",
    author: "David Wilson",
    date: "2025-01-08",
    readTime: "6 min read",
    image: TrendingUp,
    featured: false
  },
  {
    id: "5",
    title: "Mastering JavaScript ES6+ Features",
    excerpt: "Deep dive into modern JavaScript features that every developer should know.",
    category: "Tutorials",
    author: "Alex Rodriguez",
    date: "2025-01-05",
    readTime: "10 min read",
    image: Code,
    featured: false
  },
  {
    id: "6",
    title: "How AI Tutors Personalize Your Learning",
    excerpt: "Understanding the technology behind personalized AI-driven education.",
    category: "AI Learning",
    author: "Sarah Johnson",
    date: "2025-01-03",
    readTime: "8 min read",
    image: Brain,
    featured: false
  }
];

const categories = ["All", "AI Learning", "Tutorials", "Study Tips", "Industry Insights"];

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative py-20 bg-gradient-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-gradient-hero text-white border-0">Blog</Badge>
              <h1 className="font-display font-bold text-4xl lg:text-6xl">
                Learn, Grow, <span className="bg-gradient-hero bg-clip-text text-transparent">Succeed</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Tutorials, insights, and tips to help you master new skills and advance your career.
              </p>
              
              {/* Search */}
              <div className="relative max-w-xl mx-auto pt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-gradient-hero" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="font-display font-bold text-3xl mb-8">Featured Articles</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    <div className="aspect-video bg-gradient-hero p-12 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                      <post.image className="w-24 h-24 text-white relative z-10" />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline">{post.category}</Badge>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-2xl group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm font-medium">{post.author}</span>
                        <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-3xl mb-8">All Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${(featuredPosts.length + index) * 100}ms` }}
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    <div className="aspect-video bg-gradient-accent/10 p-8 flex items-center justify-center relative overflow-hidden">
                      <post.image className="w-16 h-16 text-primary relative z-10" />
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        <span className="text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h3 className="font-display font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-3 text-sm">
                        <span className="text-muted-foreground">{post.author}</span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Blog;
