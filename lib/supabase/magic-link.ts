import { createClient } from "@supabase/supabase-js";

/**
 * Generates a magic link for a guest user after purchase.
 * Creates the user if they don't exist, then generates a magic link.
 * Returns the magic link URL or null if generation fails.
 */
export async function generateMagicLinkForGuest(
  email: string
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || !supabaseUrl) {
    return null;
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists, create if not
    const { data: { users } } = await adminClient.auth.admin.listUsers();
    const existingUser = users.find((u) => u.email === email);

    if (!existingUser) {
      await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {},
      });
    }

    // Generate magic link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${siteUrl}/auth/confirm?next=/`,
        },
      });

    if (linkError || !linkData) {
      return null;
    }

    // Extract token from action_link URL or use hashed_token from response
    const actionLink =
      linkData.properties?.action_link ||
      (linkData as any).action_link ||
      (linkData as any).properties?.actionLink;

    if (!actionLink) {
      return null;
    }

    try {
      const url = new URL(actionLink);
      const token = url.searchParams.get("token") || url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") || "magiclink";

      if (token) {
        // Build direct confirm URL with token (works better for localhost)
        return `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}&next=/`;
      }
    } catch {
      // If parsing fails, try hashed_token from response
    }

    // Fallback: use hashed_token from response if we don't have a token from URL
    const hashedToken =
      linkData.properties?.hashed_token ||
      (linkData as any).hashed_token;

    if (hashedToken) {
      return `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=/`;
    }

    // Final fallback: use action_link as-is
    return actionLink;
  } catch (error) {
    return null;
  }
}
