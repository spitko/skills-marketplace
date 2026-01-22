import { createClient } from "@/lib/supabase/server";

export interface Purchase {
  id: string;
  user_id: string | null;
  skill_id: string;
  creem_product_id: string;
  creem_checkout_id: string | null;
  creem_transaction_id: string | null;
  customer_email: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

/**
 * Creates a purchase record
 */
export async function createPurchase(data: {
  user_id?: string | null;
  skill_id: string;
  creem_product_id: string;
  creem_checkout_id?: string;
  customer_email?: string | null;
  status?: Purchase["status"];
}) {
  const supabase = await createClient();
  
  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({
      user_id: data.user_id || null,
      skill_id: data.skill_id,
      creem_product_id: data.creem_product_id,
      creem_checkout_id: data.creem_checkout_id || null,
      customer_email: data.customer_email || null,
      status: data.status || "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase:", error);
    throw error;
  }

  return purchase as Purchase;
}

/**
 * Updates a purchase record
 */
export async function updatePurchase(
  id: string,
  updates: Partial<Purchase>
) {
  const supabase = await createClient();
  
  const { data: purchase, error } = await supabase
    .from("purchases")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating purchase:", error);
    throw error;
  }

  return purchase as Purchase;
}

/**
 * Links guest purchases to a user account after login
 */
export async function linkPurchasesToUser(userId: string, email: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("purchases")
    .update({
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_email", email)
    .is("user_id", null)
    .select();

  if (error) {
    console.error("Error linking purchases to user:", error);
    throw error;
  }

  return (data as Purchase[]) || [];
}

/**
 * Gets purchases by customer email (for guest purchases)
 */
export async function getPurchasesByEmail(email: string): Promise<Purchase[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchases by email:", error);
    throw error;
  }

  return (data as Purchase[]) || [];
}

/**
 * Gets a purchase by transaction ID
 */
export async function getPurchaseByTransactionId(
  creem_transaction_id: string
): Promise<Purchase | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("creem_transaction_id", creem_transaction_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching purchase:", error);
    throw error;
  }

  return data as Purchase;
}

/**
 * Gets all purchases for a user
 */
export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user purchases:", error);
    throw error;
  }

  return (data as Purchase[]) || [];
}

/**
 * Checks if a user has purchased a skill
 */
export async function hasUserPurchasedSkill(
  userId: string,
  skillId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .eq("status", "completed")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false; // Not found
    }
    console.error("Error checking purchase:", error);
    return false;
  }

  return !!data;
}

/**
 * Gets the Creem product ID for a skill
 */
export async function getSkillCreemProductId(skillId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("skills")
    .select("creem_product_id")
    .eq("id", skillId)
    .single();

  if (error) {
    console.error("Error fetching skill Creem product ID:", error);
    return null;
  }

  return data?.creem_product_id || null;
}

/**
 * Updates a skill with its Creem product ID
 */
export async function updateSkillCreemProductId(
  skillId: string,
  creemProductId: string
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("skills")
    .update({ creem_product_id: creemProductId })
    .eq("id", skillId)
    .select()
    .single();

  if (error) {
    console.error("Error updating skill Creem product ID:", error);
    throw error;
  }

  return data;
}
