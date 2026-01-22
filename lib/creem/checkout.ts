import { getCreemClient } from "./client";

interface CreateCheckoutParams {
  productId: string;
  successUrl: string;
}

/**
 * Creates a Creem checkout session for a product
 */
export async function createCheckoutSession({
  productId,
  successUrl,
}: CreateCheckoutParams) {
  const creem = getCreemClient();
  
  try {
    const checkout = await creem.checkouts.create({
      productId,
      successUrl,
    });

    return checkout;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Gets a checkout session by ID
 */
export async function getCheckoutSession(checkoutId: string) {
  const creem = getCreemClient();
  
  try {
    const checkout = await creem.checkouts.retrieve(checkoutId);
    return checkout;
  } catch (error) {
    console.error("Error fetching checkout session:", error);
    throw error;
  }
}
