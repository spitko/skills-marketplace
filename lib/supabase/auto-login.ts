import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { cookies } from "next/headers";

/**
 * Automatically logs in a user by email after purchase
 * Creates account if it doesn't exist, or logs in if it does
 */
export async function autoLoginAfterPurchase(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If we have admin access, use it to create/login and generate session
  if (serviceRoleKey && supabaseUrl) {
    try {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Check if user exists
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        console.error("[auto-login] Error listing users:", listError);
        return false;
      }

      let user = users.find((u) => u.email === email);

      // Create user if they don't exist
      if (!user) {
        const { data: newUser, error: createError } =
          await adminClient.auth.admin.createUser({
            email,
            email_confirm: true, // Auto-confirm email
            user_metadata: {},
          });

        if (createError || !newUser.user) {
          console.error("[auto-login] Error creating user:", createError);
          return false;
        }

        user = newUser.user;
      }

      // Use generateLink to get the magic link, then extract and verify the token
      const { data: linkData, error: linkError } =
        await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/`,
          },
        });

      if (linkError || !linkData) {
        console.error("[auto-login] Error generating login link:", linkError);
        return false;
      }

      // Log the full response to debug
      console.log("[auto-login] generateLink response:", JSON.stringify(linkData, null, 2));

      // Extract the action_link URL
      const actionLink = 
        linkData.properties?.action_link || 
        (linkData as any).action_link ||
        (linkData as any).properties?.actionLink;

      if (!actionLink) {
        console.error("[auto-login] No action_link found in response");
        return false;
      }

      console.log("[auto-login] Action link:", actionLink);

      // Parse the URL to extract token_hash and type
      let tokenHash: string | null = null;
      let type: string | null = "magiclink";

      try {
        const magicLinkUrl = new URL(actionLink);
        tokenHash = magicLinkUrl.searchParams.get("token_hash");
        const extractedType = magicLinkUrl.searchParams.get("type");
        if (extractedType) {
          type = extractedType;
        }
        
        console.log("[auto-login] Extracted - tokenHash exists:", !!tokenHash, "type:", type);
        
        // If token_hash not found, try alternative parameter names
        if (!tokenHash) {
          tokenHash = magicLinkUrl.searchParams.get("token") || 
                     magicLinkUrl.searchParams.get("hash");
          console.log("[auto-login] Trying alternative params - tokenHash exists:", !!tokenHash);
        }
      } catch (urlError) {
        console.error("[auto-login] Error parsing URL:", urlError);
        return false;
      }

      if (!tokenHash) {
        console.error("[auto-login] Failed to extract token_hash from URL:", actionLink);
        // Try to get hashed_token directly from response
        const hashedToken = 
          linkData.properties?.hashed_token ||
          (linkData as any).hashed_token;
        
        if (hashedToken) {
          console.log("[auto-login] Found hashed_token in response, using that");
          tokenHash = hashedToken;
        } else {
          console.error("[auto-login] No token found anywhere in response");
          return false;
        }
      }

      if (!tokenHash) {
        console.error("[auto-login] Token hash is still null after all attempts");
        return false;
      }

      console.log("[auto-login] Using tokenHash (first 20 chars):", tokenHash.substring(0, 20) + "...");

      // Verify the token to create a session
      const supabase = await createClient();
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          type: type as any,
          token_hash: tokenHash as string,
        });

      if (verifyError) {
        console.error("[auto-login] Error verifying OTP:", verifyError);
        return false;
      }

      if (!verifyData.session) {
        console.error("[auto-login] No session created after verification");
        return false;
      }

      console.log("[auto-login] Successfully created session for user:", email);
      return true;
    } catch (error) {
      console.error("[auto-login] Unexpected error in auto-login:", error);
      if (error instanceof Error) {
        console.error("[auto-login] Error message:", error.message);
        console.error("[auto-login] Error stack:", error.stack);
      }
      return false;
    }
  }

  // Fallback: Send magic link via email (user will need to click it)
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      return false;
    }

    // Return false because user needs to click email link
    return false;
  } catch (error) {
    console.error("Error in fallback auto-login:", error);
    return false;
  }
}
