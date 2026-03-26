import { Resend } from "resend";
import { clientConfig } from "../../config/client.config";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_123");
const siteUrl = clientConfig.seo.siteUrl;
const fromEmail = `${clientConfig.officeName} <noreply@${siteUrl.replace("https://", "")}>`;

// ── Email template wrapper ────────────────────────────────────────────────────
function emailTemplate(content: string): string {
  return `
    <div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;max-width:600px;margin:auto;">
      <div style="background:linear-gradient(135deg,#1a3c5e,#2a5c8e);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">⚖️</div>
        <h2 style="color:#fff;margin:0;font-size:18px;">${clientConfig.officeName}</h2>
        <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px;">${clientConfig.lawyerName}</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;">
        ${content}
      </div>
      <div style="background:#f8f9fa;padding:16px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;text-align:center;font-size:12px;color:#888;">
        <p style="margin:0;">${clientConfig.contact.address} | ${clientConfig.contact.phoneDisplay}</p>
        <p style="margin:4px 0 0;">${clientConfig.contact.email}</p>
      </div>
    </div>
  `;
}

// ── 1. Booking confirmation (in-person) ───────────────────────────────────────
export async function sendBookingConfirmation(data: {
  clientName: string;
  clientEmail: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  bookingId: string;
}) {
  if (!data.clientEmail) return;
  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `✅ تأكيد موعدك – ${clientConfig.officeName}`,
    html: emailTemplate(`
      <p>السيد/ة <strong>${data.clientName}</strong>،</p>
      <p>تم تأكيد موعد استشارتك القانونية <strong>الحضورية</strong> بنجاح.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;width:40%;">📅 التاريخ</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.date}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">🕐 الوقت</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.timeSlot}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">⚖️ الاستشارة</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.consultationType}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">📋 رقم الحجز</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.bookingId}</td></tr>
      </table>
      <p>📍 <strong>العنوان:</strong> ${clientConfig.contact.address}</p>
      <p style="color:#c9a84c;font-weight:600;">⏰ يرجى الحضور قبل الموعد بـ 10 دقائق.</p>
      <p style="color:#888;font-size:12px;">لإلغاء الموعد، يرجى الاتصال بنا قبل 24 ساعة.</p>
    `),
  });
}

// ── 2. Online meeting confirmation with code ──────────────────────────────────
export async function sendOnlineMeetingConfirmation(data: {
  clientName: string;
  clientEmail: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  meetingCode: string;
  bookingId: string;
}) {
  if (!data.clientEmail) return;
  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `💻 تأكيد موعدك أونلاين + رمز الاجتماع – ${clientConfig.officeName}`,
    html: emailTemplate(`
      <p>السيد/ة <strong>${data.clientName}</strong>،</p>
      <p>تم تأكيد موعد استشارتك القانونية <strong style="color:#3182ce;">أونلاين بالفيديو</strong> بنجاح.</p>
      
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;width:40%;">📅 التاريخ</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.date}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">🕐 الوقت</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.timeSlot}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">⚖️ الاستشارة</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.consultationType}</td></tr>
      </table>

      <div style="background:linear-gradient(135deg,#1a3c5e,#2a5c8e);border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
        <p style="color:rgba(255,255,255,.8);margin:0 0 8px;font-size:14px;">🔐 رمز الاجتماع الخاص بك</p>
        <div style="display:inline-block;">
          ${data.meetingCode.split("").map(d => `<span style="display:inline-block;width:40px;height:48px;line-height:48px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:8px;margin:0 3px;font-size:22px;font-weight:800;color:#fff;text-align:center;">${d}</span>`).join("")}
        </div>
        <p style="color:rgba(255,255,255,.7);margin:12px 0 0;font-size:12px;">احفظ هذا الرمز — ستحتاجه للدخول لغرفة الاجتماع</p>
      </div>

      <div style="background:#f0f7ff;border:1px solid #3182ce33;border-radius:10px;padding:16px;margin:16px 0;">
        <h4 style="color:#1a3c5e;margin:0 0 8px;">📋 كيف تدخل للاجتماع؟</h4>
        <ol style="margin:0;padding-right:20px;line-height:2;">
          <li>يوم الموعد، ادخل لصفحة <a href="${siteUrl}/meeting" style="color:#3182ce;font-weight:700;">غرفة الاجتماعات</a></li>
          <li>أدخل الرمز السري <strong>${data.meetingCode}</strong></li>
          <li>انتظر في قاعة الانتظار حتى ينضم المحامي</li>
          <li>ستبدأ المقابلة بالفيديو تلقائياً</li>
        </ol>
      </div>

      <p style="color:#c9a84c;font-weight:600;">💡 تأكد من أن الكاميرا والميكروفون يعملان قبل الموعد.</p>
      <p style="color:#888;font-size:12px;">لإلغاء الموعد، يرجى الاتصال بنا قبل 24 ساعة.</p>
    `),
  });
}

// ── 3. Meeting reminder (sent before the appointment) ─────────────────────────
export async function sendMeetingReminder(data: {
  clientName: string;
  clientEmail: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  meetingCode: string;
  reminderType: "24h" | "1h";
}) {
  if (!data.clientEmail) return;

  const urgency = data.reminderType === "1h"
    ? { subject: "⏰ موعدك أونلاين بعد ساعة واحدة!", color: "#e53e3e", text: "بعد ساعة واحدة فقط" }
    : { subject: "📅 تذكير: موعدك أونلاين غداً", color: "#c9a84c", text: "غداً" };

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `${urgency.subject} – ${clientConfig.officeName}`,
    html: emailTemplate(`
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background:${urgency.color}15;border:2px solid ${urgency.color}33;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">⏰</div>
      </div>
      <h3 style="text-align:center;color:#1a3c5e;margin:0 0 8px;">تذكير بموعدك</h3>
      <p style="text-align:center;color:${urgency.color};font-weight:700;font-size:16px;">موعدك ${urgency.text}!</p>
      
      <p>السيد/ة <strong>${data.clientName}</strong>،</p>
      <p>نذكّرك بموعد استشارتك القانونية أونلاين:</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;width:40%;">📅 التاريخ</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.date}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">🕐 الوقت</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.timeSlot}</td></tr>
        <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">⚖️ الاستشارة</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${data.consultationType}</td></tr>
      </table>

      <div style="background:#1a3c5e;border-radius:10px;padding:16px;text-align:center;margin:16px 0;">
        <p style="color:rgba(255,255,255,.8);margin:0 0 6px;font-size:13px;">رمز الاجتماع:</p>
        <p style="color:#fff;font-size:28px;font-weight:800;letter-spacing:6px;margin:0;">${data.meetingCode}</p>
      </div>

      <div style="text-align:center;margin:20px 0;">
        <a href="${siteUrl}/meeting" style="display:inline-block;background:linear-gradient(135deg,#1a3c5e,#2a5c8e);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
          الدخول لغرفة الاجتماعات
        </a>
      </div>

      <p style="color:#888;font-size:12px;text-align:center;">تأكد من أن الكاميرا والميكروفون جاهزان قبل وقت الموعد.</p>
    `),
  });
}

// ── 4. Notify lawyer of new booking ───────────────────────────────────────────
export async function notifyLawyerNewBooking(data: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  wilaya: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  notes?: string;
  meetingMode?: string;
  meetingCode?: string;
}) {
  await resend.emails.send({
    from: `نظام المواعيد <noreply@${siteUrl.replace("https://", "")}>`,
    to: clientConfig.contact.email,
    subject: `📅 موعد جديد ${data.meetingMode === "online" ? "💻 أونلاين" : "🏛️ حضوري"} – ${data.clientName}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin:0 0 16px;">
        ${data.meetingMode === "online" ? "💻" : "🏛️"} موعد ${data.meetingMode === "online" ? "أونلاين" : "حضوري"} جديد
      </h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">العميل</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.clientName}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">الهاتف</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.clientPhone}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">البريد</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.clientEmail || "—"}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">الولاية</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.wilaya}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">التاريخ</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.date}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">الوقت</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.timeSlot}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">الاستشارة</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.consultationType}</td></tr>
        ${data.meetingCode ? `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">رمز الاجتماع</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;font-weight:800;letter-spacing:3px;font-size:16px;">${data.meetingCode}</td></tr>` : ""}
        <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f0f4f8;font-weight:600;">ملاحظات</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${data.notes || "—"}</td></tr>
      </table>
      ${data.meetingMode === "online" ? `<p style="margin-top:16px;color:#3182ce;font-weight:600;">💻 لبدء الجلسة، اذهب إلى لوحة التحكم واضغط "بدء الجلسة" عندما يكون العميل في قاعة الانتظار.</p>` : ""}
    `),
  });
}

// ── 5. Contact form notification ──────────────────────────────────────────────
export async function notifyLawyerContactForm(data: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}) {
  await resend.emails.send({
    from: `نموذج التواصل <noreply@${siteUrl.replace("https://", "")}>`,
    to: clientConfig.contact.email,
    subject: `📬 رسالة جديدة من ${data.name}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;">رسالة جديدة عبر الموقع</h3>
      <p><strong>الاسم:</strong> ${data.name}</p>
      <p><strong>الهاتف:</strong> ${data.phone}</p>
      <p><strong>البريد:</strong> ${data.email || "—"}</p>
      <p><strong>الموضوع:</strong> ${data.subject || "—"}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;"/>
      <p>${data.message}</p>
    `),
  });
}
