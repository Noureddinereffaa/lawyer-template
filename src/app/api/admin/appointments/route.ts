import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { clientConfig } from "../../../../../config/client.config";
import { sendBookingConfirmation, sendOnlineMeetingConfirmation } from "@/lib/notifications";

function generateMeetingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/admin/appointments
 * Allows the lawyer to create an appointment manually from the dashboard.
 * Sends a confirmation email to the client if an email is provided.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, date, timeSlot, clientName, clientPhone, clientEmail, wilaya, notes, meetingMode } = body;

    if (!type || !date || !timeSlot || !clientName || !clientPhone) {
      return NextResponse.json({ error: "الحقول الأساسية مطلوبة: نوع الاستشارة، التاريخ، الوقت، الاسم، والهاتف." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Generate meeting code for online sessions
    let meetingCode: string | null = null;
    if (meetingMode === "online") {
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateMeetingCode();
        const { data: codeExists } = await supabase
          .from("appointments")
          .select("id")
          .eq("meeting_code", code)
          .single();
        if (!codeExists) { meetingCode = code; break; }
      }
      if (!meetingCode) {
        return NextResponse.json({ error: "خطأ في توليد رمز الاجتماع." }, { status: 500 });
      }
    }

    // Insert the appointment — admin-created appointments are confirmed immediately
    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert([{
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || null,
        wilaya: wilaya || null,
        type,
        date,
        time_slot: timeSlot,
        status: "confirmed", // Admin-created = auto-confirmed
        case_notes: notes || null,
        meeting_mode: meetingMode || "in_person",
        meeting_code: meetingCode,
        meeting_status: meetingMode === "online" ? "idle" : null,
      }])
      .select("id, meeting_code")
      .single();

    if (insertError) {
      console.error("Admin Appointment Insert Error:", insertError);
      return NextResponse.json({ error: "حدث خطأ في حفظ الموعد.", debug: insertError.message }, { status: 500 });
    }

    const consultationLabel = clientConfig.booking.consultationTypes.find(c => c.id === type)?.label || type;
    const bookingRef = appointment.id.split("-")[0].toUpperCase();

    // Send email to client if email was provided
    if (clientEmail) {
      if (meetingMode === "online" && meetingCode) {
        sendOnlineMeetingConfirmation({
          clientName, clientEmail, date, timeSlot,
          consultationType: consultationLabel,
          meetingCode,
          bookingId: bookingRef,
        }).catch(e => console.error("Admin online email failed:", e));
      } else {
        sendBookingConfirmation({
          clientName, clientEmail, date, timeSlot,
          consultationType: consultationLabel,
          bookingId: bookingRef,
        }).catch(e => console.error("Admin booking email failed:", e));
      }
    }

    return NextResponse.json({
      success: true,
      id: appointment.id,
      meetingCode: appointment.meeting_code,
      emailSent: !!clientEmail,
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/admin/appointments", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
