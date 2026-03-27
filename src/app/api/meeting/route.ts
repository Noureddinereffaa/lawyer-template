import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// GET: Check meeting status by code
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "رمز غير صالح" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, client_name, type, date, time_slot, meeting_mode, meeting_status, status")
    .eq("meeting_code", code)
    .eq("meeting_mode", "online")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "رمز الاجتماع غير صحيح أو غير موجود" }, { status: 404 });
  }

  if (data.status === "cancelled") {
    return NextResponse.json({ error: "تم إلغاء هذا الموعد" }, { status: 400 });
  }

  return NextResponse.json({
    id: data.id,
    clientName: data.client_name,
    type: data.type,
    date: data.date,
    timeSlot: data.time_slot,
    meetingStatus: data.meeting_status,  // 'idle' | 'waiting' | 'live' | 'ended'
    appointmentStatus: data.status,
  });
}

// POST: Update meeting status (lawyer starts/ends session)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, action } = body; // action: 'start' | 'end' | 'client_waiting'

    if (!appointmentId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    let newMeetingStatus: string;
    let newAppointmentStatus: string | undefined;

    switch (action) {
      case "client_waiting":
        newMeetingStatus = "waiting";
        break;
      case "start":
        newMeetingStatus = "live";
        newAppointmentStatus = "confirmed";

        // Try to create a Daily.co room for this meeting
        const dailyApiKey = process.env.DAILY_API_KEY;
        if (dailyApiKey) {
          try {
            // First fetch the meeting code
            const { data: mtgData } = await supabase
              .from("appointments")
              .select("meeting_code")
              .eq("id", appointmentId)
              .single();

            if (mtgData?.meeting_code) {
              const roomName = `meet-${mtgData.meeting_code}`;
              await fetch("https://api.daily.co/v1/rooms", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${dailyApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: roomName,
                  properties: {
                    exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours expiry
                    enable_prejoin_ui: false, // Bypass prejoin since we have custom waiting room
                    enable_screenshare: true,
                    enable_chat: true,
                  },
                }),
              });
              console.log(`[Daily.co] Created/Prepared room: ${roomName}`);
            }
          } catch (err) {
            console.error("[Daily.co] Failed to create room:", err);
            // Non-fatal, let the DB update proceed
          }
        }
        break;
      case "end":
        newMeetingStatus = "ended";
        newAppointmentStatus = "completed";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updateData: any = { meeting_status: newMeetingStatus };
    if (newAppointmentStatus) updateData.status = newAppointmentStatus;

    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, meetingStatus: newMeetingStatus });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
