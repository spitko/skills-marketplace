import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();
  
  // Check if there's already a session
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect(next);
  }

  // Verify OTP if token_hash and type are present
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error && data.session) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error?.message || "Verification failed")}`);
    }
  }

  // Exchange code for session if code is present
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error?.message || "Code exchange failed")}`);
    }
  }
  
  // No valid auth parameters found
  redirect(`/auth/error?error=${encodeURIComponent("No token hash, type, or code found in the URL")}`);
}
