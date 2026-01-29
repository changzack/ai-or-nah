import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCustomerById } from "@/lib/db/customers";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to check customer state
 * GET /api/debug/customer
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        status: "no_session",
        message: "No authenticated session found",
      });
    }

    const customer = await getCustomerById(session.customerId);

    if (!customer) {
      return NextResponse.json({
        status: "no_customer",
        message: "Customer not found",
        sessionData: {
          email: session.email,
          customerId: session.customerId,
        },
      });
    }

    // Check purchases table
    const supabase = createServerClient();
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    // Check credit transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      status: "success",
      session: {
        email: session.email,
        customerId: session.customerId,
      },
      customer: {
        id: customer.id,
        email: customer.email,
        credits: customer.credits,
        stripeCustomerId: customer.stripeCustomerId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      purchases: purchases || [],
      purchasesError: purchasesError?.message,
      transactions: transactions || [],
      transactionsError: transactionsError?.message,
    });
  } catch (error) {
    console.error("[debug/customer] Error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
