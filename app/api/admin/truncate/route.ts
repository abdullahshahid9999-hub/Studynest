import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Delete in order to respect foreign keys
    await supabase.from("papers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("contributors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("subjects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("teachers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Delete storage files
    const { data: pendingFiles } = await supabase.storage.from("papers").list("pending");
    if (pendingFiles && pendingFiles.length > 0) {
      await supabase.storage.from("papers").remove(pendingFiles.map((f: any) => "pending/" + f.name));
    }
    const { data: approvedFiles } = await supabase.storage.from("papers").list("approved");
    if (approvedFiles && approvedFiles.length > 0) {
      await supabase.storage.from("papers").remove(approvedFiles.map((f: any) => "approved/" + f.name));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
