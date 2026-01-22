import { NextResponse } from "next/server";
import { getCreemClient } from "@/lib/creem/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageNumber = parseInt(searchParams.get("pageNumber") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const creem = getCreemClient();
    
    // First, get the customer by email
    let customer;
    try {
      customer = await creem.customers.retrieve(undefined, user.email);
    } catch (error) {
      // Customer might not exist yet, return empty results
      return NextResponse.json({
        data: [],
        pageNumber: 1,
        pageSize: pageSize,
        totalPages: 0,
        totalItems: 0,
      });
    }

    if (!customer || !customer.id) {
      return NextResponse.json({
        data: [],
        pageNumber: 1,
        pageSize: pageSize,
        totalPages: 0,
        totalItems: 0,
      });
    }

    // Get transactions for this customer
    const transactions = await creem.transactions.search(customer.id);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
