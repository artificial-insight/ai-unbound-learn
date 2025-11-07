-- Create contact form submissions table
CREATE TABLE public.contact_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_form_submissions
FOR INSERT
WITH CHECK (true);

-- Only educators and institutions can view submissions
CREATE POLICY "Educators can view all contact submissions"
ON public.contact_form_submissions
FOR SELECT
USING (has_role(auth.uid(), 'educator'::app_role));

CREATE POLICY "Institutions can view all contact submissions"
ON public.contact_form_submissions
FOR SELECT
USING (has_role(auth.uid(), 'institution'::app_role));

-- Create newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (true);

-- Only educators and institutions can view subscriptions
CREATE POLICY "Educators can view all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'educator'::app_role));

CREATE POLICY "Institutions can view all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'institution'::app_role));

-- Create affiliate applications table
CREATE TABLE public.affiliate_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  website TEXT,
  audience_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  referral_code TEXT UNIQUE
);

ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

-- Users can submit their own affiliate applications
CREATE POLICY "Users can create affiliate applications"
ON public.affiliate_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own applications
CREATE POLICY "Users can view their own affiliate applications"
ON public.affiliate_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Educators can view and update all applications
CREATE POLICY "Educators can view all affiliate applications"
ON public.affiliate_applications
FOR SELECT
USING (has_role(auth.uid(), 'educator'::app_role));

CREATE POLICY "Educators can update affiliate applications"
ON public.affiliate_applications
FOR UPDATE
USING (has_role(auth.uid(), 'educator'::app_role));

-- Create affiliate referrals tracking table
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- System can create referrals
CREATE POLICY "System can create referrals"
ON public.affiliate_referrals
FOR INSERT
WITH CHECK (true);

-- Users can view their own referrals
CREATE POLICY "Users can view their own referrals"
ON public.affiliate_referrals
FOR SELECT
USING (auth.uid() = affiliate_user_id);

-- Educators can view all referrals
CREATE POLICY "Educators can view all referrals"
ON public.affiliate_referrals
FOR SELECT
USING (has_role(auth.uid(), 'educator'::app_role));

-- Create affiliate earnings table
CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- System can create earnings
CREATE POLICY "System can create earnings"
ON public.affiliate_earnings
FOR INSERT
WITH CHECK (true);

-- Users can view their own earnings
CREATE POLICY "Users can view their own earnings"
ON public.affiliate_earnings
FOR SELECT
USING (auth.uid() = affiliate_user_id);

-- Educators can view and update all earnings
CREATE POLICY "Educators can view all earnings"
ON public.affiliate_earnings
FOR SELECT
USING (has_role(auth.uid(), 'educator'::app_role));

CREATE POLICY "Educators can update earnings"
ON public.affiliate_earnings
FOR UPDATE
USING (has_role(auth.uid(), 'educator'::app_role));

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM affiliate_applications WHERE referral_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;