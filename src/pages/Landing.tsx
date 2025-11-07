import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newsletter } from "@/components/Newsletter";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Rocket, 
  Users, 
  Target, 
  Award,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Check,
  ArrowRight,
  Play,
  Star
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized course recommendations and real-time guidance from our intelligent tutoring system."
    },
    {
      icon: Target,
      title: "Skill-Based Paths",
      description: "Follow curated learning paths designed by experts to master specific skills and technologies."
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Join study groups, participate in forums, and learn together with peers worldwide."
    },
    {
      icon: Award,
      title: "Industry Certifications",
      description: "Earn recognized certificates upon course completion to showcase your achievements."
    },
    {
      icon: Clock,
      title: "Learn at Your Pace",
      description: "Access courses anytime, anywhere. Progress tracking keeps you motivated and on track."
    },
    {
      icon: Sparkles,
      title: "Interactive Content",
      description: "Engage with hands-on exercises, quizzes, and real-world projects to reinforce learning."
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "1,200+", label: "Courses" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "AI Support" }
  ];

  const benefits = [
    "Learn from industry experts",
    "Hands-on projects and exercises",
    "Personalized learning paths",
    "Real-time progress tracking",
    "Community support & forums",
    "Career advancement resources"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl">AI UnboundEd</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <button onClick={() => navigate("/pricing")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => navigate("/blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-hero hover:opacity-90 transition-opacity shadow-glow">
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-accent opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-gradient-hero text-white border-0 shadow-glow">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Education
              </Badge>
              <h1 className="font-display font-bold text-5xl lg:text-7xl leading-tight">
                Master Skills with{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience personalized education with intelligent course recommendations, 
                real-time AI tutoring, and interactive learning paths designed for your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="bg-gradient-hero hover:opacity-90 transition-opacity shadow-glow text-lg h-14 px-8"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 text-lg h-14 px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-accent border-2 border-background"></div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Trusted by <span className="font-semibold text-foreground">50,000+</span> learners
                  </p>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="relative z-10">
                <Card className="overflow-hidden shadow-xl border-0 bg-gradient-card">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg backdrop-blur">
                        <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Web Development</h3>
                          <p className="text-sm text-muted-foreground">Complete Bootcamp</p>
                        </div>
                        <Badge className="bg-success text-success-foreground">95%</Badge>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg backdrop-blur">
                        <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">AI & Machine Learning</h3>
                          <p className="text-sm text-muted-foreground">Advanced Track</p>
                        </div>
                        <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg backdrop-blur">
                        <div className="w-12 h-12 rounded-lg bg-gradient-premium flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Data Science</h3>
                          <p className="text-sm text-muted-foreground">Professional Path</p>
                        </div>
                        <Badge variant="outline">Start</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-accent opacity-30 blur-2xl rounded-full"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-hero opacity-30 blur-2xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-card border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="font-display font-bold text-4xl lg:text-5xl bg-gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our platform combines cutting-edge AI technology with proven learning methodologies 
              to deliver an unmatched educational experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 lg:py-32 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">Platform Demo</Badge>
              <h2 className="font-display font-bold text-4xl lg:text-5xl mb-4">
                Experience the{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">Future</span>{" "}
                of Learning
              </h2>
              <p className="text-lg text-muted-foreground">
                See how our AI-powered platform adapts to your learning style in real-time
              </p>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl border-0">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/10 to-background relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 shadow-xl group"
                    >
                      <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                      Watch Interactive Demo
                    </Button>
                  </div>
                  
                  {/* Animated Elements */}
                  <div className="absolute top-8 left-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <Card className="p-4 bg-background/95 backdrop-blur border-primary/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-hero"></div>
                        <div>
                          <div className="font-semibold text-sm">AI Tutor</div>
                          <div className="text-xs text-muted-foreground">Ready to help</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="absolute top-8 right-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <Card className="p-4 bg-background/95 backdrop-blur border-success/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-success" />
                        <div>
                          <div className="font-semibold text-sm">Progress: 87%</div>
                          <div className="text-xs text-muted-foreground">Keep it up!</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="absolute bottom-8 left-8 animate-fade-in" style={{ animationDelay: "600ms" }}>
                    <Card className="p-4 bg-background/95 backdrop-blur border-accent/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-accent" />
                        <div>
                          <div className="font-semibold text-sm">Live Study Group</div>
                          <div className="text-xs text-muted-foreground">12 members online</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="absolute bottom-8 right-8 animate-fade-in" style={{ animationDelay: "800ms" }}>
                    <Card className="p-4 bg-background/95 backdrop-blur border-warning/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-warning" />
                        <div>
                          <div className="font-semibold text-sm">New Achievement</div>
                          <div className="text-xs text-muted-foreground">Course Master 🎓</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-gradient-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="font-display font-bold text-4xl lg:text-5xl mb-4">
              Loved by <span className="bg-gradient-hero bg-clip-text text-transparent">50,000+</span> Learners
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our community has to say about their learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Alex Chen",
                role: "Software Engineer",
                company: "Google",
                image: "👨‍💻",
                quote: "This platform helped me transition from junior to senior engineer in just 6 months. The AI tutor was like having a personal mentor available 24/7.",
                rating: 5
              },
              {
                name: "Maria Rodriguez",
                role: "Data Scientist",
                company: "Microsoft",
                image: "👩‍🔬",
                quote: "The personalized learning paths are incredible. I learned Python, ML, and landed my dream job. Best investment I've ever made!",
                rating: 5
              },
              {
                name: "James Wilson",
                role: "Full Stack Developer",
                company: "Startup",
                image: "👨‍💼",
                quote: "Going from zero coding knowledge to building full-stack apps in 4 months seemed impossible. This platform made it happen.",
                rating: 5
              },
              {
                name: "Sarah Kim",
                role: "UX Designer",
                company: "Apple",
                image: "👩‍🎨",
                quote: "The interactive projects and real-world examples helped me build a portfolio that got me hired at my dream company.",
                rating: 5
              },
              {
                name: "David Thompson",
                role: "Product Manager",
                company: "Amazon",
                image: "👨‍💻",
                quote: "I needed to learn technical skills to better communicate with my dev team. The AI tutor explained complex concepts in simple terms.",
                rating: 5
              },
              {
                name: "Emma Davis",
                role: "Blockchain Developer",
                company: "Web3 Startup",
                image: "👩‍💻",
                quote: "The cutting-edge content on emerging technologies like blockchain and AI is what sets this platform apart. Always up to date!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge>Why Choose Us</Badge>
              <h2 className="font-display font-bold text-4xl lg:text-5xl">
                Accelerate Your{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Career Growth
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join thousands of professionals who have transformed their careers through 
                our comprehensive learning platform. Get access to expert-led courses, 
                personalized guidance, and a supportive community.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-hero hover:opacity-90 transition-opacity shadow-glow"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <Card className="overflow-hidden shadow-2xl border-0">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-hero rounded-lg text-white">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">Your Progress</div>
                        <div className="text-sm opacity-90">This Week</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">+45%</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Completion</span>
                      <span className="text-sm text-muted-foreground">8/10</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-hero"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Skill Level</span>
                      <span className="text-sm text-muted-foreground">Advanced</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-accent"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="font-bold text-xl">24</div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="font-bold text-xl">12</div>
                      <div className="text-xs text-muted-foreground">Courses</div>
                    </div>
                    <div className="text-center p-3 bg-secondary rounded-lg">
                      <div className="font-bold text-xl">8</div>
                      <div className="text-xs text-muted-foreground">Certificates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-premium text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
            <CardContent className="p-12 lg:p-16 relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <Rocket className="w-16 h-16 mx-auto" />
                <h2 className="font-display font-bold text-4xl lg:text-5xl">
                  Ready to Start Your Learning Journey?
                </h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  Join our community of learners and get access to thousands of courses, 
                  expert instructors, and personalized AI guidance. Start learning today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg h-14 px-8"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8"
                  >
                    Contact Sales
                  </Button>
                </div>
                <p className="text-sm text-white/70">
                  No credit card required • Free trial • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-bold text-xl">AI UnboundEd</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with AI-powered education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/courses")} className="hover:text-foreground transition-colors">Courses</button></li>
                <li><button onClick={() => navigate("/blog")} className="hover:text-foreground transition-colors">Blog</button></li>
                <li><button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/partners")} className="hover:text-foreground transition-colors">Integrations</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/case-studies")} className="hover:text-foreground transition-colors">Case Studies</button></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <Newsletter />
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AI UnboundEd School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
