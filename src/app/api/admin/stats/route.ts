import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-guard";
import { format } from "date-fns";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = createAdminSupabaseClient();
    const today = format(new Date(), "yyyy-MM-dd");

    // 1. Fetch Appointments Stats
    const { data: appointments } = await supabase
      .from("appointments")
      .select("status, date");

    const appStats = {
      today: appointments?.filter(a => a.date === today && a.status !== "cancelled").length || 0,
      upcoming: appointments?.filter(a => a.date >= today && a.status === "confirmed").length || 0,
      completed: appointments?.filter(a => a.status === "completed").length || 0,
    };

    // 2. Fetch Tickets Stats
    const { data: tickets } = await supabase
      .from("support_tickets")
      .select("status, is_archived");

    const ticketStats = {
      open: tickets?.filter(t => t.status === "open" && !t.is_archived).length || 0,
      replied: tickets?.filter(t => t.status === "replied" && !t.is_archived).length || 0,
      totalActive: tickets?.filter(t => !t.is_archived).length || 0,
      responseRate: 0,
    };
    
    if (ticketStats.totalActive > 0) {
      ticketStats.responseRate = Math.round((ticketStats.replied / ticketStats.totalActive) * 100);
    } else {
      ticketStats.responseRate = 100; // Default to 100% if no tickets exist yet
    }

    // 3. Fetch Content Stats
    const { count: articlesTotal } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true });

    const { count: articlesPublished } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("published", true);

    // 4. Fetch Recent Activity (Combined Feed)
    // Recent Tickets
    const { data: recentTickets } = await supabase
      .from("support_tickets")
      .select("id, client_name, subject, created_at, ticket_code")
      .order("created_at", { ascending: false })
      .limit(3);

    // Recent Appointments
    const { data: recentApps } = await supabase
      .from("appointments")
      .select("id, client_name, type, created_at, date, time_slot")
      .order("created_at", { ascending: false })
      .limit(3);

    const activity = [
      ...(recentTickets || []).map(t => ({ 
        id: t.id, 
        type: "ticket", 
        title: `مذكرة جديدة: ${t.subject}`, 
        user: t.client_name, 
        date: t.created_at,
        code: t.ticket_code
      })),
      ...(recentApps || []).map(a => ({ 
        id: a.id, 
        type: "appointment", 
        title: `موعد جديد: ${a.type}`, 
        user: a.client_name, 
        date: a.created_at,
        time: `${a.date} ${a.time_slot}`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return NextResponse.json({
      appointments: appStats,
      tickets: ticketStats,
      content: {
        total: articlesTotal || 0,
        published: articlesPublished || 0
      },
      activity
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
