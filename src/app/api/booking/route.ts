import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { clientConfig } from "../../../../config/client.config";
import { sendBookingConfirmation, sendOnlineMeetingConfirmation, notifyLawyerNewBooking } from "@/lib/notifications";

function generateMeetingCode(): string {
  // Generate a 6-digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, date, timeSlot, clientName, clientPhone, clientEmail, wilaya, notes, meetingMode } = body;

    if (!type || !date || !timeSlot || !clientName || !clientPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For online meetings, email is required
    if (meetingMode === "online" && !clientEmail) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب للمقابلة أونلاين" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Check if the slot is blocked (optional table — skip if not present)
    try {
      const { data: blocked } = await supabase
        .from("blocked_slots")
        .select("date")
        .eq("date", date)
        .eq("time_slot", timeSlot)
        .single();

      if (blocked) {
        return NextResponse.json({ error: "هذا الوقت غير متاح حالياً" }, { status: 400 });
      }
    } catch {
      // blocked_slots table may not exist — skip check
    }

    // 2. Check if an appointment already exists for this exact time and date
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("date", date)
      .eq("time_slot", timeSlot)
      .neq("status", "cancelled")
      .single();

    if (existing) {
      return NextResponse.json({ error: "هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر" }, { status: 400 });
    }

    // 3. Generate meeting code for online meetings
    let meetingCode: string | null = null;
    if (meetingMode === "online") {
      // Keep generating until we get a unique one
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateMeetingCode();
        const { data: codeExists } = await supabase
          .from("appointments")
          .select("id")
          .eq("meeting_code", code)
          .single();
        if (!codeExists) {
          meetingCode = code;
          break;
        }
      }
      if (!meetingCode) {
        return NextResponse.json({ error: "خطأ في توليد الرمز، يرجى المحاولة مجدداً" }, { status: 500 });
      }
    }

    // 4. Insert the appointment
    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert([
        {
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail || null,
          wilaya: wilaya || null,
          type,
          date,
          time_slot: timeSlot,
          status: "pending",
          case_notes: notes || null,
          meeting_mode: meetingMode || "in_person",
          meeting_code: meetingCode,
          meeting_status: meetingMode === "online" ? "idle" : null,
        }
      ])
      .select("id, meeting_code")
      .single();

    if (insertError) {
      console.error("Booking Error:", insertError);
      return NextResponse.json({ 
        error: "حدث خطأ في النظام، يرجى المحاولة لاحقاً",
        debug: { message: insertError.message, code: insertError.code, details: insertError.details, hint: insertError.hint }
      }, { status: 500 });
    }

    const consultationLabel = clientConfig.booking.consultationTypes.find(c => c.id === type)?.label || type;
    const bookingRef = appointment.id.split("-")[0].toUpperCase();

    // 5. Send emails based on meeting mode
    if (meetingMode === "online" && clientEmail && meetingCode) {
      sendOnlineMeetingConfirmation({
        clientName, clientEmail, date, timeSlot,
        consultationType: consultationLabel,
        meetingCode,
        bookingId: bookingRef,
      }).catch(e => console.error("Online email failed:", e));
    } else if (clientEmail) {
      sendBookingConfirmation({
        clientName, clientEmail, date, timeSlot,
        consultationType: consultationLabel,
        bookingId: bookingRef,
      }).catch(e => console.error("Email failed:", e));
    }

    // 6. Notify lawyer
    notifyLawyerNewBooking({
      clientName, clientPhone, clientEmail, wilaya, date, timeSlot,
      consultationType: consultationLabel,
      notes, meetingMode,
      meetingCode: meetingCode || undefined,
    }).catch(e => console.error("Lawyer email failed:", e));

    return NextResponse.json({
      success: true,
      id: appointment.id,
      meetingCode: appointment.meeting_code,
    }, { status: 201 });

  } catch (error: any) {
    console.error("API POST /api/booking", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
