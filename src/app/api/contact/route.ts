import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendTicketCreatedEmail } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

function generateTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let code = 'TKT-';
  for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += nums.charAt(Math.floor(Math.random() * nums.length));
  return code;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(ip, 3, 60000); // 3 requests per minute

    if (!success) {
      return NextResponse.json(
        { error: "لقد تجاوزت الحد المسموح. يرجى الانتظار دقيقة والمحاولة مجدداً." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const ticketCode = generateTicketCode();

    // 1. Create the Ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert([{
        ticket_code: ticketCode,
        client_name: name,
        client_email: email,
        client_phone: phone,
        subject: subject || "استفسار عام",
        status: "open"
      }])
      .select("id")
      .single();

    if (ticketError || !ticket) {
      console.error("Ticket Creation Error:", ticketError);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    // 2. Add the Initial Message
    const { error: msgError } = await supabase
      .from("ticket_messages")
      .insert([{
        ticket_id: ticket.id,
        sender: "client",
        message: message
      }]);

    if (msgError) console.error("Message Insert Error:", msgError);

    // 3. Send Notification Email
    sendTicketCreatedEmail({
      clientName: name,
      clientEmail: email,
      ticketCode: ticketCode,
      subject: subject || "استفسار عام"
    }).catch((e: any) => console.error("Ticket email failed:", e));

    return NextResponse.json({ success: true, ticketCode: ticketCode }, { status: 201 });

  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
