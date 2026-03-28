import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendTicketReplyAlertEmail } from "@/lib/notifications";

// GET: Fetch all tickets or messages for a specific ticket
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    
    const supabase = createAdminSupabaseClient();

    if (ticketId) {
      // Fetch messages for a specific ticket
      const { data: messages, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      return NextResponse.json({ messages }, { status: 200 });
    } else {
      // Fetch all tickets
      const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return NextResponse.json({ tickets }, { status: 200 });
    }
  } catch (error) {
    console.error("GET /api/tickets/admin", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST: Reply to a ticket as a lawyer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, message } = body;

    const supabase = createAdminSupabaseClient();

    // 1. Insert Lawyer message
    const { data: newMessage, error: insertError } = await supabase
      .from("ticket_messages")
      .insert([{
        ticket_id: ticketId,
        sender: "lawyer",
        message: message
      }])
      .select("*")
      .single();

    if (insertError) throw insertError;

    // 2. Update Ticket status to 'replied'
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .update({ status: "replied", updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select("*")
      .single();

    // 3. Send email to client
    if (ticket && !ticketError) {
      sendTicketReplyAlertEmail({
        clientName: ticket.client_name,
        clientEmail: ticket.client_email,
        ticketCode: ticket.ticket_code
      }).catch((e: any) => console.error("Reply alert email failed:", e));
    }

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets/admin", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH: Close a ticket
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status } = body;

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("support_tickets")
      .update({ status: status })
      .eq("id", ticketId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/tickets/admin", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
