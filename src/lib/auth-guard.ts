import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * ── Admin API Auth Guard ──────────────────────────────────────────────────────
 *
 * يتحقق من أن الطلب الوارد صادر من مستخدم مُصادَق عليه عبر Supabase Auth.
 * يُستخدَم في بداية كل Admin API Route Handler لضمان عدم الوصول بدون جلسة.
 *
 * الاستخدام:
 *   const authError = await requireAuth();
 *   if (authError) return authError;
 *
 * @returns null إذا كان المستخدم مصرّحاً له
 * @returns NextResponse(401) إذا لم يكن مصادَقاً عليه
 */
export async function requireAuth(): Promise<NextResponse | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Check if global Demo Mode is enabled (using Admin client to bypass RLS)
      const adminClient = createAdminSupabaseClient();
      const { data: settingsData } = await adminClient.from('settings').select('config_data').single();
      const isDemoMode = settingsData?.config_data?.isDemoMode === true;
      
      if (!isDemoMode) {
        return NextResponse.json(
          { error: "Unauthorized — يجب تسجيل الدخول للوصول لهذه الوظيفة" },
          { status: 401 }
        );
      }
    }

    return null; // ✅ مصرَّح — يُكمَل تنفيذ الـ handler
  } catch (err) {
    console.error("[requireAuth] Auth check failed:", err);
    return NextResponse.json(
      { error: "Auth check failed" },
      { status: 500 }
    );
  }
}
