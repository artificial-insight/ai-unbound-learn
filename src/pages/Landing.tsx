import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Brain, LineChart, Sparkles, Users, Code, GraduationCap, Zap, ArrowRight, Check, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              AI UnboundEd
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Learn Smarter
                </span>
                <br />
                <span className="text-foreground">Not Harder</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Experience personalized AI education with intelligent tutors, real-time analytics, 
                and adaptive learning paths designed just for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 hover-scale">
                    Start Learning Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-lg px-8 h-14 hover-scale group"
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>50K+ active learners</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="mt-20 relative animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-3xl" />
              <Card className="relative overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/10 to-background p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-20 h-20 mx-auto mb-4 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Interactive Dashboard Preview</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose AI UnboundEd?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge AI technology meets personalized education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI-Powered Tutors"
              description="Get instant help from intelligent AI teachers that adapt to your learning style"
              delay="0"
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8" />}
              title="Smart Analytics"
              description="Track progress with detailed insights that drive measurable improvement"
              delay="100"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Interactive Coding"
              description="Practice with live coding environments and instant AI feedback"
              delay="200"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Personalized Paths"
              description="AI-generated learning journeys customized to your goals"
              delay="300"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Community Learning"
              description="Connect with peers and grow together in study groups"
              delay="400"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="24/7 Support"
              description="AI assistant ready anytime to answer questions and review code"
              delay="500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <StatCard number="50K+" label="Active Learners" />
            <StatCard number="95%" label="Completion Rate" />
            <StatCard number="4.9/5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold">
                Learn at Your Own Pace
              </h2>
              <p className="text-xl text-muted-foreground">
                Our AI adapts to your schedule and learning speed, ensuring you master each concept before moving forward.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time progress tracking",
                  "Personalized course recommendations",
                  "Interactive quizzes and exercises",
                  "Live coding sessions with AI",
                  "Achievement badges and certifications"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="relative overflow-hidden shadow-xl hover-scale">
              <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/20 to-background p-12 flex items-center justify-center">
                <BookOpen className="w-32 h-32 text-primary animate-pulse" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <GraduationCap className="w-20 h-20 mx-auto mb-8 text-white animate-scale-in" />
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
            Join thousands of learners already experiencing the future of AI-powered education
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-10 h-14 hover-scale shadow-2xl"
            >
              Start Learning for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-semibold">AI UnboundEd</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AI UnboundEd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: string;
}) => (
  <Card 
    className="p-8 hover-scale cursor-pointer group transition-all duration-300 border-2 hover:border-primary/50 hover:shadow-xl animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </Card>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center animate-scale-in">
    <div className="text-5xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-3">
      {number}
    </div>
    <div className="text-xl text-muted-foreground">{label}</div>
  </div>
);

export default Landing;
