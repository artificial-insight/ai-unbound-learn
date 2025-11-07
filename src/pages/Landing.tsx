import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Brain, LineChart, Sparkles, Users, Code, GraduationCap, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">AI-Powered Personalized Learning</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Learn Smarter with <br />
              <span className="text-accent">AI UnboundEd</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Experience the future of education with AI teachers, real-time personalization, 
              and intelligent learning paths tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose AI UnboundEd?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge AI technology meets personalized education for unmatched learning outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Teachers"
              description="Live sessions with intelligent AI instructors that adapt to your learning style and pace"
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8" />}
              title="Smart Analytics"
              description="Track your progress with detailed insights and performance metrics that drive improvement"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Live Coding"
              description="Interactive coding environment with real-time feedback and AI-powered assistance"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Personalized Paths"
              description="AI-generated learning journeys customized to your goals, skills, and interests"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Collaborative Learning"
              description="Connect with peers, share knowledge, and grow together in a supportive community"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Instant Support"
              description="24/7 AI assistant ready to answer questions, review code, and provide guidance"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <StatCard number="50K+" label="Active Learners" />
            <StatCard number="95%" label="Completion Rate" />
            <StatCard number="4.9/5" label="Student Rating" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of learners already experiencing personalized AI-powered education
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Learning Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="w-14 h-14 rounded-lg bg-gradient-hero flex items-center justify-center text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div>
    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{number}</div>
    <div className="text-lg text-muted-foreground">{label}</div>
  </div>
);

export default Landing;
