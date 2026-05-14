import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("review_summaries").select("product_id").limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "ok", supabase: "connected" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
