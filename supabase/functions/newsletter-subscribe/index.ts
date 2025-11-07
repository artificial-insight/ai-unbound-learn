import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterRequest = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Store subscription in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email });

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB insert fails - still send welcome email
    }

    // Send welcome email via Resend
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AI UnboundEd <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to AI UnboundEd Newsletter!",
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
                  <h1 style="margin: 0;">🎓 Welcome to AI UnboundEd!</h1>
                </div>
                <div class="content">
                  <h2>Thank you for subscribing!</h2>
                  <p>You're now part of our community of 50,000+ learners who are mastering new skills with AI-powered education.</p>
                  
                  <p>Here's what you'll receive:</p>
                  <ul>
                    <li>📚 Weekly learning tips and tutorials</li>
                    <li>🚀 New course announcements</li>
                    <li>💡 Industry insights and trends</li>
                    <li>🎁 Exclusive offers and early access</li>
                  </ul>
                  
                  <a href="https://yourdomain.com" class="button">Explore Courses</a>
                  
                  <p>Ready to start learning? Browse our catalog of 1,200+ courses and begin your journey today.</p>
                </div>
                <div class="footer">
                  <p>AI UnboundEd School • Empowering learners worldwide</p>
                  <p style="font-size: 12px; color: #9ca3af;">
                    You received this email because you subscribed to our newsletter.<br>
                    <a href="#" style="color: #7c3aed;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error("Failed to send email");
    }

    const data = await emailResponse.json();
    console.log("Newsletter subscription email sent:", data);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
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
