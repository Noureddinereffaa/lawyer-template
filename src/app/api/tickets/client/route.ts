import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendTicketReplyAlertEmail } from "@/lib/notifications";

// GET: Lookup ticket and its messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Verify ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("ticket_code", code.toUpperCase())
      .ilike("client_email", email)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

    return NextResponse.json({ ticket, messages }, { status: 200 });

  } catch (error) {
    console.error("GET /api/tickets/client", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST: Add a new client message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, message, attachmentUrl } = body;

    // Must have at least a message or an attachment
    if (!ticketId || (!message && !attachmentUrl)) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: newMessage, error: insertError } = await supabase
      .from("ticket_messages")
      .insert([{
        ticket_id: ticketId,
        sender: "client",
        message: message || "📎 مرفق",
        attachment_url: attachmentUrl || null
      }])
      .select("*")
      .single();

    if (insertError) throw insertError;

    // Optional: Send email to lawyer that a client replied? 
    // Usually the lawyer checks the dashboard, but we can do it if needed.

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });

  } catch (error) {
    console.error("POST /api/tickets/client", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
