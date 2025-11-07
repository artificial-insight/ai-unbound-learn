import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AffiliateApplicationRequest {
  name: string;
  email: string;
  website?: string;
  audienceDescription?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, website, audienceDescription }: AffiliateApplicationRequest = await req.json();

    // Validate inputs
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to applicant
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AI UnboundEd <onboarding@resend.dev>",
        to: [email],
        subject: "Your Affiliate Application is Being Reviewed",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none; }
                .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🎉 Thank You for Applying!</h1>
                </div>
                <div class="content">
                  <p>Hi ${name},</p>
                  <p>Thank you for applying to the AI UnboundEd Affiliate Program!</p>
                  
                  <p>We've received your application and our team is currently reviewing it. Here's what happens next:</p>
                  <ul>
                    <li>✅ We'll review your application within 3-5 business days</li>
                    <li>📧 You'll receive an email with our decision</li>
                    <li>🚀 If approved, you'll get your unique referral code and access to marketing materials</li>
                  </ul>
                  
                  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>💰 Earn up to 30% commission</strong></p>
                    <p style="margin: 5px 0 0 0;">Join 500+ affiliates earning passive income by referring learners to our platform.</p>
                  </div>
                  
                  <p>Questions? Feel free to reply to this email.</p>
                  <p>Best regards,<br>The AI UnboundEd Team</p>
                </div>
                <div class="footer">
                  <p>AI UnboundEd School • Empowering learners worldwide</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send confirmation email");
    }

    const userData = await userEmailResponse.json();
    console.log("Affiliate application confirmation email sent:", userData);

    // Send notification email to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AI UnboundEd <onboarding@resend.dev>",
        to: ["admin@yourdomain.com"], // Replace with actual admin email
        subject: "New Affiliate Application",
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <h2>New Affiliate Program Application</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${website ? `<p><strong>Website:</strong> ${website}</p>` : ''}
              ${audienceDescription ? `
                <p><strong>Audience Description:</strong></p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${audienceDescription}
                </div>
              ` : ''}
            </body>
          </html>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification email");
    }

    return new Response(
      JSON.stringify({ success: true, id: userData.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-affiliate-application function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
