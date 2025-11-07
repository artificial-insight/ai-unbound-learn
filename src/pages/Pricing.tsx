import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Users, Building, Crown } from "lucide-react";

const pricingPlans = [
  {
    name: "Free",
    icon: Sparkles,
    price: { monthly: 0, annual: 0 },
    description: "Perfect for getting started",
    features: [
      "Access to 100+ free courses",
      "Basic AI tutor assistance",
      "Community forum access",
      "Progress tracking",
      "Email support"
    ],
    limitations: [
      "Limited to 5 hours per month",
      "No certificates"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    icon: Crown,
    price: { monthly: 29, annual: 290 },
    description: "For serious learners",
    features: [
      "Unlimited access to all courses",
      "Advanced AI tutor with priority",
      "Personalized learning paths",
      "All course certificates",
      "Priority email & chat support",
      "Downloadable resources",
      "Study groups access",
      "Live coding sessions"
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Team",
    icon: Users,
    price: { monthly: 99, annual: 990 },
    description: "For teams of 5-20 members",
    features: [
      "Everything in Pro",
      "Team analytics dashboard",
      "Centralized billing",
      "Team progress tracking",
      "Dedicated account manager",
      "Custom learning paths",
      "API access",
      "SSO integration",
      "Priority support"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false
  },
  {
    name: "Enterprise",
    icon: Building,
    price: { monthly: null, annual: null },
    description: "For organizations 20+ members",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "Custom integrations",
      "Advanced security & compliance",
      "Dedicated success manager",
      "Custom content creation",
      "White-label options",
      "SLA guarantee",
      "24/7 phone support"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const formatPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.price.monthly === null) return "Custom";
    const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.annual;
    return `$${price}`;
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative py-20 bg-gradient-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-gradient-hero text-white border-0">Pricing</Badge>
              <h1 className="font-display font-bold text-4xl lg:text-6xl">
                Choose Your <span className="bg-gradient-hero bg-clip-text text-transparent">Plan</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade as you grow. All plans include access to our AI-powered learning platform.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-background shadow-md text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                    billingCycle === "annual"
                      ? "bg-background shadow-md text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Annual
                  <Badge className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs">
                    Save 17%
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden transition-all duration-300 animate-fade-in ${
                    plan.popular
                      ? "border-2 border-primary shadow-glow scale-105 lg:scale-110"
                      : "border-border hover:border-primary/50 hover:shadow-xl"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-hero text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <CardHeader className="p-8 pb-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      plan.popular ? "bg-gradient-hero" : "bg-gradient-accent/10"
                    }`}>
                      <plan.icon className={`w-6 h-6 ${plan.popular ? "text-white" : "text-primary"}`} />
                    </div>
                    <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-bold text-4xl">
                        {formatPrice(plan)}
                      </span>
                      {plan.price.monthly !== null && (
                        <span className="text-muted-foreground">
                          /{billingCycle === "monthly" ? "mo" : "year"}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 pt-6">
                    <Button
                      onClick={() => navigate("/auth")}
                      className={`w-full mb-6 ${
                        plan.popular
                          ? "bg-gradient-hero hover:opacity-90 shadow-glow"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-3 opacity-50">
                          <span className="text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-card border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-3xl text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Can I switch plans anytime?</h3>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected
                      in your next billing cycle.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                    <p className="text-muted-foreground">
                      We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied,
                      contact us for a full refund.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground">
                      We accept all major credit cards, PayPal, and offer invoicing for Enterprise customers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Pricing;
