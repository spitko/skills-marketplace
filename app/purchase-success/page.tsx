import { getSkillById } from "@/lib/supabase/skills";
import { createPurchase } from "@/lib/supabase/purchases";
import { getCheckoutSession } from "@/lib/creem/checkout";
import { createClient } from "@/lib/supabase/server";
import { getCreemClient } from "@/lib/creem/client";
import { generateMagicLinkForGuest } from "@/lib/supabase/magic-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ skillId?: string; checkout_id?: string }>;
}) {
  const { skillId, checkout_id } = await searchParams;

  if (!skillId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Purchase Status</CardTitle>
            <CardDescription>No skill ID provided</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Return to Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skill = await getSkillById(skillId);

  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Skill Not Found</CardTitle>
            <CardDescription>The requested skill could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Return to Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Save purchase to Supabase if checkout_id is provided
  let customerEmail: string | null = user?.email || null;
  let magicLinkUrl: string | null = null;

  if (checkout_id) {
    try {
      // Get checkout details from Creem
      const checkout = await getCheckoutSession(checkout_id);
      
      // Get customer email from checkout
      if (!customerEmail && checkout.customer) {
        if (typeof checkout.customer === "string") {
          // Customer is just an ID, fetch customer details
          try {
            const creem = getCreemClient();
            const customer = await creem.customers.retrieve(undefined, checkout.customer);
            customerEmail = customer.email || null;
          } catch (error) {
            // Silently fail - we'll just use the email if available
          }
        } else {
          customerEmail = checkout.customer.email || null;
        }
      }

      // If user is not logged in but we have an email, generate magic link
      if (!user && customerEmail) {
        magicLinkUrl = await generateMagicLinkForGuest(customerEmail);
      }

      // Create purchase record
      await createPurchase({
        user_id: user?.id || null,
        skill_id: skillId,
        creem_product_id: process.env.CREEM_PRODUCT_ID!,
        creem_checkout_id: checkout_id,
        customer_email: customerEmail,
        status: "completed",
      });
    } catch (error) {
      // Silently fail - don't block the success page
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Purchase Successful!</CardTitle>
          <CardDescription>You now have access to this skill.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{skill.name}</h3>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
          </div>
          <Button asChild className="w-full">
            <a href={skill.url} target="_blank" rel="noopener noreferrer">
              Access Skill
            </a>
          </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={magicLinkUrl ?? "/"}>Return to Marketplace</a>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
