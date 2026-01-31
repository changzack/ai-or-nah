import { createServerClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id_test: string | null;
  stripe_price_id_live: string | null;
  active: boolean;
  display_order: number;
};

export type CreditPackId = "small" | "medium" | "large";

/**
 * Get all active products
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[products] Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }

  return data || [];
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .single();

  if (error) {
    console.error(`[products] Error fetching product ${productId}:`, error);
    return null;
  }

  return data;
}

/**
 * Get the appropriate Stripe price ID based on environment
 */
export function getStripePriceId(product: Product): string | null {
  const isProduction = process.env.NODE_ENV === "production" &&
                       process.env.NEXT_PUBLIC_SITE_URL?.includes("aiornah.xyz");

  const priceId = isProduction
    ? product.stripe_price_id_live
    : product.stripe_price_id_test;

  if (!priceId) {
    console.error("[products] No price ID for product:", product.id);
  }

  return priceId;
}

/**
 * Get product for display in UI (client-safe format)
 */
export function formatProductForClient(product: Product) {
  return {
    id: product.id,
    name: product.name,
    credits: product.credits,
    price: product.price_cents / 100,
    pricePerCheck: (product.price_cents / product.credits / 100).toFixed(2),
  };
}
