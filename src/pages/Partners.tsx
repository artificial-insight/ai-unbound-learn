import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Cloud, 
  Database, 
  Shield, 
  Zap, 
  Video,
  MessageSquare,
  GitBranch,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const integrations = [
  {
    name: "GitHub",
    icon: GitBranch,
    category: "Development",
    description: "Sync your learning progress with GitHub commits and showcase your projects.",
    features: ["Repository integration", "Commit tracking", "Portfolio showcase"],
    status: "active"
  },
  {
    name: "Slack",
    icon: MessageSquare,
    category: "Communication",
    description: "Get real-time notifications and collaborate with study groups directly in Slack.",
    features: ["Real-time alerts", "Study group chat", "Assignment reminders"],
    status: "active"
  },
  {
    name: "Zoom",
    icon: Video,
    category: "Video",
    description: "Seamlessly join live sessions and webinars directly from the platform.",
    features: ["One-click joining", "Recording access", "Breakout rooms"],
    status: "active"
  },
  {
    name: "AWS",
    icon: Cloud,
    category: "Cloud",
    description: "Deploy your projects to AWS with integrated cloud learning paths.",
    features: ["Direct deployment", "Cost tracking", "Service tutorials"],
    status: "active"
  },
  {
    name: "VS Code",
    icon: Code,
    category: "Development",
    description: "Code directly in your browser with VS Code integration and AI assistance.",
    features: ["Browser IDE", "AI code completion", "Extensions support"],
    status: "active"
  },
  {
    name: "PostgreSQL",
    icon: Database,
    category: "Database",
    description: "Learn and practice database skills with real PostgreSQL instances.",
    features: ["Live databases", "Query practice", "Performance tuning"],
    status: "active"
  },
  {
    name: "Stripe",
    icon: Zap,
    category: "Payments",
    description: "Manage subscriptions and payments securely through Stripe integration.",
    features: ["Secure payments", "Subscription management", "Invoice generation"],
    status: "active"
  },
  {
    name: "Auth0",
    icon: Shield,
    category: "Security",
    description: "Enterprise-grade authentication and single sign-on capabilities.",
    features: ["SSO support", "MFA enabled", "Role management"],
    status: "active"
  },
  {
    name: "OpenAI",
    icon: Sparkles,
    category: "AI",
    description: "Powered by advanced AI models for personalized learning experiences.",
    features: ["GPT-4 tutoring", "Code generation", "Content creation"],
    status: "active"
  }
];

const categories = ["All", "Development", "Communication", "Cloud", "AI", "Security", "Database", "Video", "Payments"];

const Partners = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative py-20 bg-gradient-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-gradient-hero text-white border-0">Integrations</Badge>
              <h1 className="font-display font-bold text-4xl lg:text-6xl">
                Connect Your <span className="bg-gradient-hero bg-clip-text text-transparent">Favorite Tools</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Seamlessly integrate with the tools and platforms you already use every day.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="font-display font-bold text-4xl text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Integrations</div>
              </div>
              <div>
                <div className="font-display font-bold text-4xl text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="font-display font-bold text-4xl text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="font-display font-bold text-4xl text-primary mb-2">API</div>
                <div className="text-sm text-muted-foreground">Access</div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {integrations.map((integration, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center group-hover:scale-110 transition-transform">
                        <integration.icon className="w-6 h-6 text-white" />
                      </div>
                      {integration.status === "active" && (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-1">{integration.name}</h3>
                      <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {integration.description}
                    </p>
                    <ul className="space-y-2">
                      {integration.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="py-20 bg-gradient-card border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge>API Access</Badge>
              <h2 className="font-display font-bold text-4xl lg:text-5xl">
                Build Custom <span className="bg-gradient-hero bg-clip-text text-transparent">Integrations</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Use our REST API to create custom integrations and automate your learning workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-hero hover:opacity-90 shadow-glow">
                  View API Docs
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Request Integration
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Partners;
