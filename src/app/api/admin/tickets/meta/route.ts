import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/tickets/meta?ticketId=xxx
 * Returns ticket metadata (name, code, phone, etc.) for the admin messages page
 * to pre-load the selected ticket when deep-linked from appointments.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("GET /api/admin/tickets/meta", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
