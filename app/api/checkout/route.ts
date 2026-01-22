import { NextRequest, NextResponse } from "next/server";
import { getSkillById } from "@/lib/supabase/skills";
import { createCheckoutSession } from "@/lib/creem/checkout";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: "skillId is required" },
        { status: 400 }
      );
    }

    // Get the skill
    const skill = await getSkillById(skillId);
    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    // Create checkout session first to get checkout ID
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    
    // Create checkout session
    const checkout = await createCheckoutSession({
      productId: process.env.CREEM_PRODUCT_ID!,
      successUrl: `${origin}/purchase-success?skillId=${skillId}`,
    });

    // Return checkout URL
    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
