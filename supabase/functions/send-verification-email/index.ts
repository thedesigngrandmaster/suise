import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  name: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verificationUrl }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Suise <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email - Suise",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 2px solid #1a1a1a;">
              <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Welcome to Suise, ${name}!</h1>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Thank you for signing up! Please verify your email address to get started with preserving your memories.
              </p>
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FFE566, #FFD700); color: #1a1a1a; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; border: 2px solid #1a1a1a;">
                Verify Email
              </a>
              <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Verification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
