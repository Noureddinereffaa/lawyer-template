import { NextResponse } from "next/server";
import { processReminders } from "@/lib/reminder-engine";

/**
 * Manual trigger endpoint for reminders.
 * 
 * Usage:
 *   GET /api/reminders?secret=your_secret
 * 
 * This is a fallback for manual/debugging use. In production,
 * reminders are triggered automatically by site traffic via middleware.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== (process.env.CRON_SECRET || "cron-secret-key")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processReminders();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Manual reminder error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
