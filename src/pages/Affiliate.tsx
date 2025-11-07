import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { DollarSign, Users, TrendingUp, Gift, Link as LinkIcon, Share2, Award, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn 20% Commission',
    description: 'Receive recurring commissions for every paying customer you refer',
  },
  {
    icon: Users,
    title: 'No Limit on Earnings',
    description: 'The more you refer, the more you earn. Sky\'s the limit!',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Performance',
    description: 'Real-time dashboard to monitor clicks, conversions, and earnings',
  },
  {
    icon: Gift,
    title: 'Exclusive Resources',
    description: 'Access marketing materials, banners, and promotional content',
  },
];

const tiers = [
  {
    name: 'Starter',
    referrals: '0-10 referrals',
    commission: '20%',
    bonus: 'Welcome kit',
    color: 'bg-blue-500',
  },
  {
    name: 'Growth',
    referrals: '11-50 referrals',
    commission: '25%',
    bonus: '$500 bonus',
    color: 'bg-purple-500',
  },
  {
    name: 'Pro',
    referrals: '51-100 referrals',
    commission: '30%',
    bonus: '$2000 bonus',
    color: 'bg-orange-500',
  },
  {
    name: 'Elite',
    referrals: '100+ referrals',
    commission: '35%',
    bonus: '$5000 bonus + perks',
    color: 'bg-emerald-500',
  },
];

const steps = [
  {
    step: 1,
    title: 'Sign Up',
    description: 'Create your free affiliate account in minutes',
    icon: Users,
  },
  {
    step: 2,
    title: 'Get Your Link',
    description: 'Receive your unique referral link and tracking code',
    icon: LinkIcon,
  },
  {
    step: 3,
    title: 'Share & Promote',
    description: 'Share with your audience using our marketing materials',
    icon: Share2,
  },
  {
    step: 4,
    title: 'Earn Rewards',
    description: 'Get paid monthly for every successful referral',
    icon: Award,
  },
];

const Affiliate = () => {
  const [email, setEmail] = useState('');

  const handleJoin = () => {
    console.log('Joining affiliate program with email:', email);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Gift className="w-4 h-4 mr-2" />
              Affiliate & Referral Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Earn Money by Sharing Education
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our affiliate program and earn up to 35% recurring commission for every learner you refer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button size="lg" onClick={handleJoin}>
                Join Now
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">$500k+</p>
                <p className="text-sm text-muted-foreground">Paid to Affiliates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">2,500+</p>
                <p className="text-sm text-muted-foreground">Active Affiliates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">35%</p>
                <p className="text-sm text-muted-foreground">Max Commission</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Gift className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">$1,200</p>
                <p className="text-sm text-muted-foreground">Avg. Monthly Earning</p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Why Join Our Program?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <benefit.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Commission Tiers */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Commission Tiers</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${tier.color}`} />
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.referrals}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary mb-2">{tier.commission}</p>
                    <p className="text-sm text-muted-foreground mb-4">Commission Rate</p>
                    <Badge variant="secondary" className="w-full justify-center">
                      {tier.bonus}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="payment">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      When do I get paid?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Commissions are paid monthly via PayPal or bank transfer, 30 days after the referral converts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      What's the minimum payout?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      The minimum payout threshold is $50. Earnings below this amount roll over to the next month.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Are commissions recurring?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! You earn recurring commissions for as long as your referral remains a paying customer.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      How is tracking done?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We use cookie-based tracking with a 60-day attribution window to ensure you get credit for referrals.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Can I see my stats?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Access your real-time dashboard to see clicks, conversions, and earnings anytime.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="support" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Do you provide marketing materials?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! We provide banners, email templates, social media assets, and more to help you promote.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Is there affiliate support?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Absolutely! Our dedicated affiliate team is here to help you succeed with tips and strategies.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="text-center bg-primary text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-3xl font-bold mb-4">Ready to Start Earning?</h3>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of affiliates earning passive income by sharing quality education
              </p>
              <Button size="lg" variant="secondary">
                Create Your Affiliate Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Affiliate;
