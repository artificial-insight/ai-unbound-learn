import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, TrendingUp, Copy, CheckCircle, Clock, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AffiliateApplication {
  id: string;
  status: string;
  referral_code: string | null;
  created_at: string;
  approved_at: string | null;
}

interface Referral {
  id: string;
  status: string;
  created_at: string;
  converted_at: string | null;
  commission_earned: number;
}

interface Earning {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [application, setApplication] = useState<AffiliateApplication | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadAffiliateData();
  }, [user, navigate]);

  const loadAffiliateData = async () => {
    if (!user) return;

    try {
      // Load application
      const { data: appData } = await supabase
        .from('affiliate_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setApplication(appData);

      if (appData && appData.status === 'approved') {
        // Load referrals
        const { data: refData } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('affiliate_user_id', user.id)
          .order('created_at', { ascending: false });

        setReferrals(refData || []);

        // Load earnings
        const { data: earnData } = await supabase
          .from('affiliate_earnings')
          .select('*')
          .eq('affiliate_user_id', user.id)
          .order('created_at', { ascending: false });

        setEarnings(earnData || []);
      }
    } catch (error: any) {
      console.error('Error loading affiliate data:', error);
      toast({
        title: "Error",
        description: "Failed to load affiliate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (application?.referral_code) {
      const link = `${window.location.origin}?ref=${application.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Affiliate Program</CardTitle>
              <CardDescription>
                You haven't applied to the affiliate program yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/affiliate')}>
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (application.status === 'pending') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Application Under Review
              </CardTitle>
              <CardDescription>
                Your affiliate application is being reviewed by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Applied on {new Date(application.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm mt-2">
                  We typically review applications within 3-5 business days. You'll receive an email once your application has been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (application.status === 'rejected') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Unfortunately, your affiliate application was not approved at this time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can reapply after 30 days or contact our support team for more information.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Approved status - show dashboard
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingEarnings = totalEarnings - paidEarnings;
  const convertedReferrals = referrals.filter(r => r.status === 'converted').length;
  const conversionRate = referrals.length > 0 ? (convertedReferrals / referrals.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and earnings</p>
        </div>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted px-4 py-2 rounded-lg font-mono text-sm overflow-x-auto">
                {window.location.origin}?ref={application.referral_code}
              </div>
              <Button onClick={copyReferralLink} variant="outline">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ${paidEarnings.toFixed(2)} paid, ${pendingEarnings.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals.length}</div>
              <p className="text-xs text-muted-foreground">
                {convertedReferrals} converted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <Progress value={conversionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
              <Badge variant="secondary">{application.referral_code}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Approved on {new Date(application.approved_at || '').toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="w-full">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>Track the status of your referrals</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No referrals yet. Start sharing your link to earn commissions!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {referral.status === 'converted' && referral.converted_at
                              ? `Converted on ${new Date(referral.converted_at).toLocaleDateString()}`
                              : 'Pending conversion'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={referral.status === 'converted' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                          {referral.status === 'converted' && (
                            <span className="font-semibold text-green-600">
                              +${Number(referral.commission_earned).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>View your commission payments</CardDescription>
              </CardHeader>
              <CardContent>
                {earnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No earnings yet. Once your referrals convert, you'll see your commissions here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {earnings.map((earning) => (
                      <div
                        key={earning.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">${Number(earning.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(earning.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant={earning.status === 'paid' ? 'default' : 'secondary'}
                          >
                            {earning.status}
                          </Badge>
                          {earning.status === 'paid' && earning.paid_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Paid on {new Date(earning.paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
