import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendTicketReplyAlertEmail } from "@/lib/notifications";

// GET: Fetch tickets with filtering or messages for a specific ticket
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    const status = searchParams.get("status");
    const isArchived = searchParams.get("archived");
    const search = searchParams.get("search");
    
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
      // Fetch tickets with filters
      let query = supabase.from("support_tickets").select("*");
      
      if (status) query = query.eq("status", status);
      if (isArchived !== null) query = query.eq("is_archived", isArchived === "true");
      if (search) {
        query = query.or(`client_name.ilike.%${search}%,ticket_code.ilike.%${search}%,subject.ilike.%${search}%`);
      }
      
      const { data: tickets, error } = await query.order("created_at", { ascending: false });
        
      if (error) throw error;
      return NextResponse.json({ tickets }, { status: 200 });
    }
  } catch (error: any) {
    console.error("GET /api/tickets/admin", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// POST: Reply to a ticket as a lawyer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, message, attachmentUrl } = body;

    const supabase = createAdminSupabaseClient();

    // 1. Insert Lawyer message
    const { data: newMessage, error: insertError } = await supabase
      .from("ticket_messages")
      .insert([{
        ticket_id: ticketId,
        sender: "lawyer",
        message: message || "📎 مرفق",
        attachment_url: attachmentUrl || null
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
  } catch (error: any) {
    console.error("POST /api/tickets/admin", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// PATCH: Update ticket status or archive status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, status, isArchived } = body;

    const supabase = createAdminSupabaseClient();
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (status !== undefined) updates.status = status;
    if (isArchived !== undefined) updates.is_archived = isArchived;

    const { error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", ticketId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/tickets/admin", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// DELETE: Permanent deletion of a ticket
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    if (!ticketId) return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });

    const supabase = createAdminSupabaseClient();

    // Cascade delete is handled by DB if configured, otherwise we do it here
    // First delete messages
    await supabase.from("ticket_messages").delete().eq("ticket_id", ticketId);
    
    // Then delete ticket
    const { error } = await supabase.from("support_tickets").delete().eq("id", ticketId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/tickets/admin", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
