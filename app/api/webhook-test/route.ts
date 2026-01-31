import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "GET works" });
}

export async function POST(request: Request) {
  const body = await request.text();
  return NextResponse.json({
    message: "POST works",
    bodyLength: body.length
  });
}
