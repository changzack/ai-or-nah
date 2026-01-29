import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to reset credits to 0
 * POST /api/debug/reset-credits
 */
export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        status: "error",
        message: "No authenticated session found",
      }, { status: 401 });
    }

    const supabase = createServerClient();

    // Reset credits to 0
    const { error: updateError } = await supabase
      .from("customers")
      .update({ credits: 0 })
      .eq("id", session.customerId);

    if (updateError) {
      return NextResponse.json({
        status: "error",
        message: updateError.message,
      }, { status: 500 });
    }

    // Clear all purchases
    const { error: purchasesError } = await supabase
      .from("purchases")
      .delete()
      .eq("customer_id", session.customerId);

    // Clear all transactions
    const { error: transactionsError } = await supabase
      .from("credit_transactions")
      .delete()
      .eq("customer_id", session.customerId);

    return NextResponse.json({
      status: "success",
      message: "Credits reset to 0, purchases and transactions cleared",
    });
  } catch (error) {
    console.error("[debug/reset-credits] Error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
