import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Clock, Award, ArrowRight, Building } from "lucide-react";

const caseStudies = [
  {
    company: "TechCorp Solutions",
    industry: "Software Development",
    size: "500+ employees",
    challenge: "Needed to upskill engineering team on modern cloud technologies",
    solution: "Deployed custom learning paths for AWS and Azure certifications",
    results: {
      skillIncrease: "85%",
      timeReduction: "40%",
      certifications: "250+",
      satisfaction: "96%"
    },
    testimonial: {
      quote: "AI UnboundEd transformed our team's capabilities. We saw immediate improvements in code quality and deployment speed.",
      author: "Jennifer Martinez",
      role: "VP of Engineering"
    },
    icon: "💻"
  },
  {
    company: "DataFlow Analytics",
    industry: "Data Science",
    size: "150+ employees",
    challenge: "Data scientists needed to transition from traditional methods to ML/AI",
    solution: "Implemented AI-powered ML curriculum with hands-on projects",
    results: {
      skillIncrease: "92%",
      timeReduction: "50%",
      certifications: "120+",
      satisfaction: "98%"
    },
    testimonial: {
      quote: "The personalized learning paths helped our team master TensorFlow and PyTorch in half the expected time.",
      author: "Dr. Michael Chen",
      role: "Chief Data Scientist"
    },
    icon: "📊"
  },
  {
    company: "StartupHub Inc",
    industry: "Technology Startup",
    size: "50+ employees",
    challenge: "Junior developers needed rapid onboarding and full-stack training",
    solution: "Created bootcamp-style intensive programs with mentorship",
    results: {
      skillIncrease: "150%",
      timeReduction: "60%",
      certifications: "85+",
      satisfaction: "94%"
    },
    testimonial: {
      quote: "Our junior devs became productive contributors in just 3 months instead of the usual 6-9 months.",
      author: "Sarah Williams",
      role: "CTO & Co-founder"
    },
    icon: "🚀"
  },
  {
    company: "Global Finance Corp",
    industry: "Financial Services",
    size: "2000+ employees",
    challenge: "Compliance team needed cybersecurity and data privacy training",
    solution: "Enterprise-wide security certification program with compliance tracking",
    results: {
      skillIncrease: "78%",
      timeReduction: "35%",
      certifications: "450+",
      satisfaction: "91%"
    },
    testimonial: {
      quote: "The platform's compliance tracking features helped us meet regulatory requirements while upskilling our team.",
      author: "Robert Thompson",
      role: "Head of Compliance"
    },
    icon: "🏦"
  }
];

const CaseStudies = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative py-20 bg-gradient-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-gradient-hero text-white border-0">Case Studies</Badge>
              <h1 className="font-display font-bold text-4xl lg:text-6xl">
                Real Results from <span className="bg-gradient-hero bg-clip-text text-transparent">Real Companies</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                See how organizations are transforming their teams with AI-powered learning.
              </p>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8 space-y-20">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="max-w-6xl mx-auto animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <Card className="overflow-hidden border-2 border-border hover:border-primary/50 transition-all">
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2 bg-gradient-card p-8 space-y-6">
                      <div className="text-6xl mb-4">{study.icon}</div>
                      <div>
                        <h2 className="font-display font-bold text-3xl mb-2">{study.company}</h2>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {study.industry}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {study.size}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <div>
                          <h3 className="font-semibold mb-2">Challenge</h3>
                          <p className="text-sm text-muted-foreground">{study.challenge}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Solution</h3>
                          <p className="text-sm text-muted-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3 p-8 space-y-8">
                      <div>
                        <h3 className="font-display font-bold text-2xl mb-6">Key Results</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <Card className="bg-gradient-hero/5 border-primary/20">
                            <CardContent className="p-6 text-center">
                              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                              <div className="font-display font-bold text-4xl text-primary mb-1">
                                {study.results.skillIncrease}
                              </div>
                              <div className="text-sm text-muted-foreground">Skill Increase</div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-accent/5 border-accent/20">
                            <CardContent className="p-6 text-center">
                              <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                              <div className="font-display font-bold text-4xl text-accent mb-1">
                                {study.results.timeReduction}
                              </div>
                              <div className="text-sm text-muted-foreground">Time Saved</div>
                            </CardContent>
                          </Card>

                          <Card className="bg-success/5 border-success/20">
                            <CardContent className="p-6 text-center">
                              <Award className="w-8 h-8 text-success mx-auto mb-2" />
                              <div className="font-display font-bold text-4xl text-success mb-1">
                                {study.results.certifications}
                              </div>
                              <div className="text-sm text-muted-foreground">Certifications</div>
                            </CardContent>
                          </Card>

                          <Card className="bg-warning/5 border-warning/20">
                            <CardContent className="p-6 text-center">
                              <Users className="w-8 h-8 text-warning mx-auto mb-2" />
                              <div className="font-display font-bold text-4xl text-warning mb-1">
                                {study.results.satisfaction}
                              </div>
                              <div className="text-sm text-muted-foreground">Satisfaction</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Testimonial */}
                      <Card className="bg-gradient-card border-primary/30">
                        <CardContent className="p-6">
                          <p className="text-foreground italic leading-relaxed mb-4">
                            "{study.testimonial.quote}"
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-hero"></div>
                            <div>
                              <div className="font-semibold">{study.testimonial.author}</div>
                              <div className="text-sm text-muted-foreground">{study.testimonial.role}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-premium text-white border-0 max-w-4xl mx-auto">
              <CardContent className="p-12 text-center space-y-6">
                <h2 className="font-display font-bold text-4xl">
                  Ready to Transform Your Team?
                </h2>
                <p className="text-lg text-white/90">
                  Join hundreds of companies already seeing amazing results with AI-powered learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10"
                  >
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default CaseStudies;
