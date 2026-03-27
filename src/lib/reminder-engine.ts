/**
 * Lazy Reminder Engine
 * 
 * Architecture: Instead of cron jobs, reminders are triggered lazily via
 * site traffic. Every incoming request has a chance to trigger a reminder
 * check, throttled to at most once every 10 minutes via in-memory timestamp.
 * 
 * Duplicate prevention:
 * 1. In-memory throttle — prevents excessive DB queries
 * 2. DB-level `reminder_24h_sent` / `reminder_1h_sent` flags — prevents duplicate emails
 * 
 * This works on Vercel Hobby plan with zero cron dependency.
 */

import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { sendMeetingReminder } from "@/lib/notifications";
import { clientConfig } from "../../config/client.config";

// ── In-memory throttle ────────────────────────────────────────────────────────
// Prevents checking the DB more than once every THROTTLE_MS across all requests.
// On Vercel serverless, each cold start resets this — that's fine, the DB flags
// are the real duplicate guard.
const THROTTLE_MS = 10 * 60 * 1000; // 10 minutes
let lastCheckTimestamp = 0;

/**
 * Called from middleware on every request.
 * Non-blocking: fires and forgets, never delays the user's response.
 */
export function triggerReminderCheck(): void {
  const now = Date.now();
  if (now - lastCheckTimestamp < THROTTLE_MS) return; // throttled
  lastCheckTimestamp = now;

  // Fire and forget — don't await
  processReminders().catch((err) =>
    console.error("[Reminder Engine] Error:", err)
  );
}

/**
 * Core logic: check for appointments needing reminders and send them.
 */
async function processReminders(): Promise<{ sent: number }> {
  const supabase = createAdminSupabaseClient();
  const now = new Date();
  let sentCount = 0;

  // ── 24-hour reminders ─────────────────────────────────────────────────────
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appts24h } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", tomorrowStr)
    .eq("meeting_mode", "online")
    .neq("status", "cancelled")
    .not("client_email", "is", null)
    .or("reminder_24h_sent.is.null,reminder_24h_sent.eq.false");

  if (appts24h) {
    for (const appt of appts24h) {
      try {
        const label = clientConfig.booking.consultationTypes
          .find((c) => c.id === appt.type)?.label || appt.type;

        await sendMeetingReminder({
          clientName: appt.client_name,
          clientEmail: appt.client_email,
          date: appt.date,
          timeSlot: appt.time_slot,
          consultationType: label,
          meetingCode: appt.meeting_code,
          reminderType: "24h",
        });

        // Mark as sent — prevents duplicate on next check
        await supabase
          .from("appointments")
          .update({ reminder_24h_sent: true })
          .eq("id", appt.id);

        sentCount++;
      } catch (err) {
        console.error(`[Reminder] 24h failed for ${appt.id}:`, err);
      }
    }
  }

  // ── 1-hour reminders ──────────────────────────────────────────────────────
  const todayStr = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const targetHour = currentHour + 1;

  const { data: appts1h } = await supabase
    .from("appointments")
    .select("*")
    .eq("date", todayStr)
    .eq("meeting_mode", "online")
    .neq("status", "cancelled")
    .not("client_email", "is", null)
    .or("reminder_1h_sent.is.null,reminder_1h_sent.eq.false");

  if (appts1h) {
    for (const appt of appts1h) {
      const slotHour = parseInt(appt.time_slot?.split(":")[0] || "0");
      if (slotHour !== targetHour) continue;

      try {
        const label = clientConfig.booking.consultationTypes
          .find((c) => c.id === appt.type)?.label || appt.type;

        await sendMeetingReminder({
          clientName: appt.client_name,
          clientEmail: appt.client_email,
          date: appt.date,
          timeSlot: appt.time_slot,
          consultationType: label,
          meetingCode: appt.meeting_code,
          reminderType: "1h",
        });

        await supabase
          .from("appointments")
          .update({ reminder_1h_sent: true })
          .eq("id", appt.id);

        sentCount++;
      } catch (err) {
        console.error(`[Reminder] 1h failed for ${appt.id}:`, err);
      }
    }
  }

  if (sentCount > 0) {
    console.log(`[Reminder Engine] Sent ${sentCount} reminders`);
  }

  return { sent: sentCount };
}

// Export for the API route (manual trigger / debugging)
export { processReminders };
