import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

// All public pages that use settings data — must all be revalidated
const PUBLIC_PAGES = ["/", "/services", "/about", "/blog", "/booking", "/contact"];

export async function POST(req: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const config = await req.json();

    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Use upsert so it works whether row exists or not
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          id: SETTINGS_ID,
          config_data: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("[POST /api/settings] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Revalidate all pages that depend on settings ──────────────
    for (const path of PUBLIC_PAGES) {
      revalidatePath(path);
    }

    return NextResponse.json({ ok: true, message: "تم الحفظ وتحديث الكاش بنجاح" });

  } catch (err: any) {
    console.error("[POST /api/settings] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// GET: Return current settings (for debugging)
export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .select("config_data, updated_at")
    .eq("id", SETTINGS_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
