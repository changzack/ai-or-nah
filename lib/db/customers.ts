import { createServerClient } from "../supabase/server";
import type { CustomerRow, Customer, CreditTransactionReason } from "../types";
import { querySingle, insertSingle, executeUpdate } from "./utils";

/**
 * Database operations for customers table
 */

/**
 * Convert database row to domain type
 */
function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    email: row.email,
    credits: row.credits,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const supabase = createServerClient();

  return querySingle<CustomerRow, Customer>(
    supabase.from("customers").select("*").eq("email", email.toLowerCase()),
    toCustomer,
    "[customers]"
  );
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const supabase = createServerClient();

  return querySingle<CustomerRow, Customer>(
    supabase.from("customers").select("*").eq("id", customerId),
    toCustomer,
    "[customers]"
  );
}

/**
 * Create a new customer
 */
export async function createCustomer(params: {
  email: string;
  stripeCustomerId?: string;
  credits?: number;
}): Promise<Customer | null> {
  const supabase = createServerClient();

  return insertSingle<CustomerRow, Customer>(
    supabase.from("customers").insert({
      email: params.email.toLowerCase(),
      stripe_customer_id: params.stripeCustomerId || null,
      credits: params.credits || 0,
    }),
    toCustomer,
    "[customers]"
  );
}

/**
 * Get or create customer by email
 */
export async function getOrCreateCustomer(email: string): Promise<Customer | null> {
  const existing = await getCustomerByEmail(email);
  if (existing) {
    return existing;
  }
  return createCustomer({ email });
}

/**
 * Update customer's Stripe customer ID
 */
export async function updateStripeCustomerId(
  customerId: string,
  stripeCustomerId: string
): Promise<boolean> {
  const supabase = createServerClient();

  return executeUpdate(
    supabase.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId),
    "[customers]"
  );
}

/**
 * Add credits to a customer and log the transaction
 */
export async function addCredits(
  customerId: string,
  amount: number,
  reason: CreditTransactionReason,
  resultId?: string
): Promise<boolean> {
  const supabase = createServerClient();

  // Get current credits
  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("credits")
    .eq("id", customerId)
    .single();

  if (fetchError || !customer) {
    console.error("[customers] Error fetching customer for credit add:", fetchError);
    return false;
  }

  const newCredits = customer.credits + amount;

  // Update credits
  const { error: updateError } = await supabase
    .from("customers")
    .update({ credits: newCredits })
    .eq("id", customerId);

  if (updateError) {
    console.error("[customers] Error adding credits:", updateError);
    return false;
  }

  // Log transaction
  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      customer_id: customerId,
      amount: amount,
      reason: reason,
      result_id: resultId || null,
    });

  if (txError) {
    console.error("[customers] Error logging credit transaction:", txError);
    // Don't fail the operation, credits were already added
  }

  return true;
}

/**
 * Deduct one credit from a customer atomically
 * Returns true if credit was deducted, false if insufficient credits
 */
export async function deductCredit(
  customerId: string,
  resultId?: string
): Promise<boolean> {
  const supabase = createServerClient();

  console.log("[customers] Attempting to deduct credit for customer:", customerId);

  // Get current credits first
  const { data: currentCustomer, error: fetchError } = await supabase
    .from("customers")
    .select("credits")
    .eq("id", customerId)
    .single();

  if (fetchError || !currentCustomer) {
    console.error("[customers] Error fetching customer:", fetchError);
    return false;
  }

  console.log("[customers] Current credits:", currentCustomer.credits);

  if (currentCustomer.credits <= 0) {
    console.log("[customers] Insufficient credits");
    return false;
  }

  // Atomic update: decrement credits only if credits > 0
  const { data, error } = await supabase
    .from("customers")
    .update({ credits: currentCustomer.credits - 1 })
    .eq("id", customerId)
    .gt("credits", 0)
    .select("credits")
    .single();

  if (error || !data) {
    console.error("[customers] Error deducting credit:", error);
    return false;
  }

  console.log("[customers] ✓ Credit deducted. New balance:", data.credits);

  // Log transaction
  const { error: txError } = await supabase
    .from("credit_transactions")
    .insert({
      customer_id: customerId,
      amount: -1,
      reason: "analysis" as CreditTransactionReason,
      result_id: resultId || null,
    });

  if (txError) {
    console.error("[customers] Error logging debit transaction:", txError);
    // Don't fail the operation, credit was already deducted
  }

  return true;
}

/**
 * Get customer's credit balance
 */
export async function getCreditsBalance(customerId: string): Promise<number> {
  const supabase = createServerClient();

  const result = await querySingle<{ credits: number }>(
    supabase.from("customers").select("credits").eq("id", customerId),
    undefined,
    "[customers]"
  );

  return result?.credits ?? 0;
}
