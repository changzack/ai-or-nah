import { NextResponse } from "next/server";
import { getProducts, formatProductForClient } from "@/lib/db/products";
import { errorResponse } from "@/lib/api/responses";

/**
 * GET /api/products
 * Returns all active products for display in UI
 */
export async function GET() {
  try {
    const products = await getProducts();
    const formattedProducts = products.map(formatProductForClient);

    return NextResponse.json({
      status: "success",
      products: formattedProducts,
    });
  } catch (error) {
    console.error("[products-api] Error:", error);
    return errorResponse("internal_error", "Failed to fetch products", 500);
  }
}
