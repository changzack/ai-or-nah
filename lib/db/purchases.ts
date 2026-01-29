import { createServerClient } from "../supabase/server";
import type { PurchaseRow } from "../types";

/**
 * Database operations for purchases table
 */

/**
 * Record a purchase (with idempotency check)
 * Returns true if purchase was recorded, false if it already existed
 */
export async function recordPurchase(params: {
  customerId: string;
  stripeSessionId: string;
  creditsPurchased: number;
  amountCents: number;
}): Promise<boolean> {
  const supabase = createServerClient();

  // Check if purchase already exists (idempotency)
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", params.stripeSessionId)
    .maybeSingle();

  if (existing) {
    console.log("[purchases] Purchase already recorded:", params.stripeSessionId);
    return false;
  }

  // Insert new purchase
  const { error } = await supabase
    .from("purchases")
    .insert({
      customer_id: params.customerId,
      stripe_session_id: params.stripeSessionId,
      credits_purchased: params.creditsPurchased,
      amount_cents: params.amountCents,
    });

  if (error) {
    console.error("[purchases] Error recording purchase:", error);
    return false;
  }

  return true;
}

/**
 * Get purchase by Stripe session ID
 */
export async function getPurchaseBySessionId(
  stripeSessionId: string
): Promise<PurchaseRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("stripe_session_id", stripeSessionId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PurchaseRow;
}

/**
 * Get purchase history for a customer
 */
export async function getPurchaseHistory(
  customerId: string
): Promise<PurchaseRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PurchaseRow[];
}

/**
 * Get total credits purchased by a customer
 */
export async function getTotalCreditsPurchased(
  customerId: string
): Promise<number> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("credits_purchased")
    .eq("customer_id", customerId);

  if (error || !data) {
    return 0;
  }

  return data.reduce((sum, purchase) => sum + purchase.credits_purchased, 0);
}

/**
 * Get total amount spent by a customer (in cents)
 */
export async function getTotalAmountSpent(
  customerId: string
): Promise<number> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("amount_cents")
    .eq("customer_id", customerId);

  if (error || !data) {
    return 0;
  }

  return data.reduce((sum, purchase) => sum + purchase.amount_cents, 0);
}
