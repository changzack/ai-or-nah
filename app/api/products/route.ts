import { NextResponse } from "next/server";
import { getProducts, formatProductForClient } from "@/lib/db/products";

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
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
