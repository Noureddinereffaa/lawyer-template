import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/tickets/from-appointment
 * Finds an existing ticket by client email/phone, or creates a new one.
 * Returns the ticket ID so the admin can navigate to the messages page.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, clientName, clientPhone, clientEmail, appointmentType, appointmentDate } = body;

    if (!clientName || !clientPhone) {
      return NextResponse.json({ error: "بيانات العميل ناقصة." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Look for an existing ticket by email or phone
    let existingTicket: any = null;

    if (clientEmail) {
      const { data } = await supabase
        .from("support_tickets")
        .select("id, ticket_code, status")
        .eq("client_email", clientEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      existingTicket = data;
    }

    // Fall back to phone number search if no email match
    if (!existingTicket) {
      const { data } = await supabase
        .from("support_tickets")
        .select("id, ticket_code, status")
        .eq("client_phone", clientPhone)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      existingTicket = data;
    }

    if (existingTicket) {
      // Return existing ticket
      return NextResponse.json({
        ticketId: existingTicket.id,
        ticketCode: existingTicket.ticket_code,
        isNew: false,
      });
    }

    // 2. Create a new ticket for this client (admin-initiated)
    const ticketCode = `TKT-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const subject = `موعد: ${appointmentType || "استشارة قانونية"} — ${appointmentDate ? new Date(appointmentDate).toLocaleDateString("ar-DZ") : ""}`.trim();

    const { data: newTicket, error: insertError } = await supabase
      .from("support_tickets")
      .insert([{
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || null,
        subject,
        ticket_code: ticketCode,
        status: "open",
        is_archived: false,
        appointment_id: appointmentId || null, // Link to appointment if column exists
      }])
      .select("id, ticket_code")
      .single();

    if (insertError) {
      // Try without appointment_id if the column doesn't exist
      const { data: newTicketFallback, error: fallbackError } = await supabase
        .from("support_tickets")
        .insert([{
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail || null,
          subject,
          ticket_code: ticketCode,
          status: "open",
          is_archived: false,
        }])
        .select("id, ticket_code")
        .single();

      if (fallbackError) {
        console.error("Create ticket error:", fallbackError);
        return NextResponse.json({ error: "فشل إنشاء المذكرة." }, { status: 500 });
      }

      // Add an initial message from the lawyer
      await supabase.from("ticket_messages").insert([{
        ticket_id: newTicketFallback!.id,
        sender: "lawyer",
        message: `مرحباً ${clientName}،\n\nتواصل معكم مكتبنا بخصوص موعد ${subject}. يسعدنا الإجابة على أي استفسار.`,
      }]);

      return NextResponse.json({
        ticketId: newTicketFallback!.id,
        ticketCode: newTicketFallback!.ticket_code,
        isNew: true,
      });
    }

    // Add an initial welcome message from the lawyer
    await supabase.from("ticket_messages").insert([{
      ticket_id: newTicket.id,
      sender: "lawyer",
      message: `مرحباً ${clientName}،\n\nتواصل معكم مكتبنا بخصوص موعد ${subject}. يسعدنا الإجابة على أي استفسار.`,
    }]);

    return NextResponse.json({
      ticketId: newTicket.id,
      ticketCode: newTicket.ticket_code,
      isNew: true,
    });

  } catch (error: any) {
    console.error("POST /api/admin/tickets/from-appointment", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
