import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendMeetingReminder } from "@/lib/notifications";
import { clientConfig } from "../../../../config/client.config";

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron)
// It checks for upcoming online appointments and sends reminders.
// Recommended schedule: every hour

export async function GET(req: Request) {
  // Simple API key protection for cron
  const { searchParams } = new URL(req.url);
  const cronSecret = searchParams.get("secret");
  if (cronSecret !== (process.env.CRON_SECRET || "cron-secret-key")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const now = new Date();
    const sent: string[] = [];

    // ── 24-hour reminders ─────────────────────────────────────────
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // yyyy-mm-dd

    const { data: tomorrowAppts } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", tomorrowStr)
      .eq("meeting_mode", "online")
      .neq("status", "cancelled")
      .not("client_email", "is", null);

    if (tomorrowAppts) {
      for (const appt of tomorrowAppts) {
        const consultationLabel = clientConfig.booking.consultationTypes
          .find(c => c.id === appt.type)?.label || appt.type;

        await sendMeetingReminder({
          clientName: appt.client_name,
          clientEmail: appt.client_email,
          date: appt.date,
          timeSlot: appt.time_slot,
          consultationType: consultationLabel,
          meetingCode: appt.meeting_code,
          reminderType: "24h",
        });
        sent.push(`24h: ${appt.client_name} (${appt.date})`);
      }
    }

    // ── 1-hour reminders ──────────────────────────────────────────
    const todayStr = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const targetHour = currentHour + 1; // appointments starting in ~1 hour

    const { data: soonAppts } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", todayStr)
      .eq("meeting_mode", "online")
      .neq("status", "cancelled")
      .not("client_email", "is", null);

    if (soonAppts) {
      for (const appt of soonAppts) {
        // Parse time_slot like "10:00" and check if it's ~1 hour away
        const slotHour = parseInt(appt.time_slot?.split(":")[0] || "0");
        if (slotHour === targetHour) {
          const consultationLabel = clientConfig.booking.consultationTypes
            .find(c => c.id === appt.type)?.label || appt.type;

          await sendMeetingReminder({
            clientName: appt.client_name,
            clientEmail: appt.client_email,
            date: appt.date,
            timeSlot: appt.time_slot,
            consultationType: consultationLabel,
            meetingCode: appt.meeting_code,
            reminderType: "1h",
          });
          sent.push(`1h: ${appt.client_name} (${appt.time_slot})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      remindersCount: sent.length,
      details: sent,
      timestamp: now.toISOString(),
    });

  } catch (error: any) {
    console.error("Reminder cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
