import { NextResponse } from "next/server";
import { refreshCollect } from "@/lib/collect";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await refreshCollect();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await refreshCollect();
  return NextResponse.json(result);
}
