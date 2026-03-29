import { Resend } from "resend";
import { clientConfig } from "../../config/client.config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_123");

// Resend strict policy: You can only send from a verified domain.
const fallbackEmail = "onboarding@resend.dev";
const senderEmail = process.env.RESEND_FROM_EMAIL || fallbackEmail;

/**
 * ── Dynamic Settings Helper ──────────────────────────────────────────────────
 * Fetches the latest office and lawyer names from the Supabase 'settings' table.
 * Falls back to static clientConfig if fetching fails or data is missing.
 */
async function getLiveSettings() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from("settings").select("config_data").single();
    
    if (error) {
      console.warn("[Notifications] Using fallback settings due to DB lookup:", error.message);
    } else if (data?.config_data) {
      const live = data.config_data;
      return {
        officeName: live.officeName || clientConfig.officeName,
        lawyerName: live.lawyerName || clientConfig.lawyerName,
        siteUrl: live.seo?.siteUrl || clientConfig.seo.siteUrl,
        contact: {
          address: live.contact?.address || clientConfig.contact.address,
          phoneDisplay: live.contact?.phoneDisplay || clientConfig.contact.phoneDisplay,
          email: live.contact?.email || clientConfig.contact.email,
        }
      };
    }
  } catch (e) {
    console.error("[Notifications] Critical error fetching live settings:", e);
  }
  
  // Final Fallback
  return {
    officeName: clientConfig.officeName,
    lawyerName: clientConfig.lawyerName,
    siteUrl: clientConfig.seo.siteUrl,
    contact: clientConfig.contact
  };
}

/**
 * ── Email template wrapper ────────────────────────────────────────────────────
 * Generates the HTML shell for emails using valid dynamic settings.
 */
function emailTemplate(content: string, settings: any): string {
  return `
    <div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;max-width:600px;margin:auto;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1a3c5e,#2a5c8e);padding:32px 24px;text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;">⚖️</div>
        <h2 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px;">${settings.officeName}</h2>
        <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:14px;font-weight:600;">${settings.lawyerName}</p>
      </div>
      <div style="background:#fff;padding:40px 32px;border:1px solid #e2e8f0;border-top:none;line-height:1.7;color:#2d3748;">
        ${content}
      </div>
      <div style="background:#f8f9fa;padding:24px;border:1px solid #e2e8f0;border-top:none;text-align:center;font-size:13px;color:#718096;">
        <p style="margin:0;font-weight:700;">${settings.contact.address}</p>
        <p style="margin:8px 0 0;">📞 ${settings.contact.phoneDisplay} | 📧 ${settings.contact.email}</p>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;opacity:0.7;">
          © ${new Date().getFullYear()} ${settings.officeName}. جميع الحقوق محفوظة.
        </div>
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
  const settings = await getLiveSettings();
  const fromEmail = `${settings.officeName} <${senderEmail}>`;

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `✅ تأكيد موعدك – ${settings.officeName}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">مرحباً ${data.clientName}،</h3>
      <p>تم تأكيد موعد استشارتك القانونية <strong>الحضورية</strong> بنجاح في مكتبنا.</p>
      <div style="background:#f0f4f8;border-radius:12px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;width:100px;">📅 التاريخ:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.date}</td></tr>
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;">🕐 الوقت:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.timeSlot}</td></tr>
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;">⚖️ التخصص:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.consultationType}</td></tr>
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;">📋 المرجع:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.bookingId}</td></tr>
        </table>
      </div>
      <p>📍 <strong>موقع المكتب:</strong> ${settings.contact.address}</p>
      <div style="background:#fffaf0;border-right:4px solid #c9a84c;padding:12px;margin:20px 0;font-size:14px;">
        ⚠️ <strong>تذكير هام:</strong> يرجى الحضور قبل الموعد بـ 10 دقائق لضمان جودة الخدمة.
      </div>
      <p style="color:#718096;font-size:12px;">إذا كنت ترغب في إلغاء أو تغيير الموعد، يرجى التواصل معنا هاتفياً قبل 24 ساعة.</p>
    `, settings),
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
  const settings = await getLiveSettings();
  const fromEmail = `${settings.officeName} <${senderEmail}>`;

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `💻 تأكيد موعدك أونلاين + رمز الاجتماع – ${settings.officeName}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">مرحباً ${data.clientName}،</h3>
      <p>تم تأكيد موعد استشارتك القانونية <strong style="color:#3182ce;">أونلاين (بالفيديو)</strong> بنجاح.</p>
      
      <div style="background:#f0f4f8;border-radius:12px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;width:100px;">📅 التاريخ:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.date}</td></tr>
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;">🕐 الوقت:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.timeSlot}</td></tr>
          <tr><td style="padding:8px 0;color:#718096;font-size:14px;">⚖️ التخصص:</td><td style="padding:8px 0;font-weight:700;color:#1a3c5e;">${data.consultationType}</td></tr>
        </table>
      </div>

      <div style="background:linear-gradient(135deg,#1a3c5e,#2a5c8e);border-radius:16px;padding:32px 24px;text-align:center;margin:24px 0;color:#fff;">
        <p style="margin:0 0 12px;font-size:14px;opacity:0.9;">🔐 رمز الدخول للاجتماع السري</p>
        <div style="display:inline-block;" dir="ltr">
          ${data.meetingCode.split("").map(d => `<span style="display:inline-block;width:44px;height:52px;line-height:52px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:10px;margin:0 4px;font-size:24px;font-weight:800;text-align:center;">${d}</span>`).join("")}
        </div>
        <p style="margin:16px 0 0;font-size:12px;opacity:0.8;">احفظ هذا الرمز جيداً، ستحتاجه لبدء الاستشارة.</p>
      </div>

      <div style="background:#ebf8ff;border-radius:12px;padding:20px;margin:24px 0;">
        <h4 style="color:#2b6cb0;margin:0 0 12px;">🚀 كيف تشارك في الاستشارة؟</h4>
        <ol style="margin:0;padding-right:20px;line-height:1.8;color:#2c5282;font-size:14px;">
          <li>في وقت الموعد، ادخل إلى <a href="${settings.siteUrl}/meeting" style="color:#2b6cb0;text-decoration:underline;font-weight:700;">غرفة الاجتماعات</a>.</li>
          <li>أدخل الرمز السري الموضح أعلاه.</li>
          <li>تأكد من تفعيل الكاميرا والمايكروفون.</li>
          <li>سيقوم المحامي ببدء الجلسة فوراً.</li>
        </ol>
      </div>

      <p style="color:#718096;font-size:12px;">نوصي باستخدام متصفح Chrome أو Safari للحصول على أفضل جودة فيديو.</p>
    `, settings),
  });
}

// ── 3. Meeting reminder (sent before the appointment) ─────────────────────────
export async function sendMeetingReminder(data: {
  clientName: string;
  clientEmail: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  reminderType: "24h" | "1h";
  meetingMode: string;
  meetingCode?: string;
}) {
  if (!data.clientEmail) return;
  const settings = await getLiveSettings();
  const fromEmail = `${settings.officeName} <${senderEmail}>`;

  const modeText = data.meetingMode === "online" ? "أونلاين" : "حضوري";
  const urgency = data.reminderType === "1h"
    ? { subject: `⏰ موعدك ال${modeText} يبدأ بعد ساعة واحدة!`, color: "#e53e3e", text: "بعد ساعة واحدة فقط" }
    : { subject: `📅 تذكير: موعدك ال${modeText} غداً`, color: "#c9a84c", text: "غداً" };

  const meetingDetailsBlock = data.meetingMode === "online" 
    ? `
      <div style="background:#1a3c5e;border-radius:12px;padding:24px;text-align:center;margin:24px 0;color:#fff;">
        <p style="margin:0 0 8px;font-size:13px;opacity:0.9;">رمز الاجتماع الخاص بك:</p>
        <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:0;font-family:monospace;">${data.meetingCode}</p>
        <div style="margin-top:20px;">
          <a href="${settings.siteUrl}/meeting" style="display:inline-block;background:#fff;color:#1a3c5e;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">
            اضغط هنا للانضمام الآن
          </a>
        </div>
      </div>
    `
    : `
      <div style="background:#f7fafc;border-radius:12px;padding:20px;text-align:center;margin:24px 0;border:1px solid #e2e8f0;">
        <p style="color:#4a5568;margin:0 0 6px;font-size:14px;font-weight:600;">📍 عنوان المكتب للمراجعة:</p>
        <p style="color:#1a3c5e;font-size:16px;font-weight:700;margin:0;">${settings.contact.address}</p>
      </div>
    `;

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `${urgency.subject} – ${settings.officeName}`,
    html: emailTemplate(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:${urgency.color}15;border:2px solid ${urgency.color}33;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:32px;">⏰</div>
      </div>
      <h3 style="text-align:center;color:#1a3c5e;margin:0 0 8px;">نحن بانتظارك!</h3>
      <p style="text-align:center;color:${urgency.color};font-weight:800;font-size:18px;margin-top:0;">موعدك ${urgency.text}</p>
      
      <p>عزيزي ${data.clientName}،</p>
      <p>نذكرك بموعد استشارتك القانونية ال${modeText} المجدولة مسبقاً:</p>

      <table style="width:100%;margin:20px 0;background:#f8f9fa;border-radius:8px;padding:16px;">
        <tr><td style="padding:6px 0;color:#718096;width:100px;">📅 التاريخ:</td><td style="padding:6px 0;font-weight:700;">${data.date}</td></tr>
        <tr><td style="padding:6px 0;color:#718096;">🕐 الوقت:</td><td style="padding:6px 0;font-weight:700;">${data.timeSlot}</td></tr>
        <tr><td style="padding:6px 0;color:#718096;">⚖️ التخصص:</td><td style="padding:6px 0;font-weight:700;">${data.consultationType}</td></tr>
      </table>

      ${meetingDetailsBlock}
      
      <p style="color:#718096;font-size:12px;text-align:center;margin-top:24px;">نتمنى لك استشارة مفيدة ومثمرة.</p>
    `, settings),
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
  const settings = await getLiveSettings();
  await resend.emails.send({
    from: `نظام المواعيد <noreply@${(settings.siteUrl || "").replace(/^https?:\/\//, "")}>`,
    to: settings.contact.email,
    subject: `📅 موعد جديد ${data.meetingMode === "online" ? "💻 أونلاين" : "🏛️ حضوري"} – ${data.clientName}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">وصلك حجز جديد 🚀</h3>
      <p>قام أحد الموكلين بحجز استشارة جديدة عبر الموقع، تفاصيل الحجز:</p>
      
      <div style="background:#f0f4f8;border-radius:12px;padding:24px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:10px 0;color:#718096;border-bottom:1px solid #e2e8f0;width:120px;">العميل:</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #e2e8f0;">${data.clientName}</td></tr>
          <tr><td style="padding:10px 0;color:#718096;border-bottom:1px solid #e2e8f0;">الهاتف:</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #e2e8f0;" dir="ltr">${data.clientPhone}</td></tr>
          <tr><td style="padding:10px 0;color:#718096;border-bottom:1px solid #e2e8f0;">البريد:</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #e2e8f0;">${data.clientEmail || "—"}</td></tr>
          <tr><td style="padding:10px 0;color:#718096;border-bottom:1px solid #e2e8f0;">التاريخ والوقت:</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #e2e8f0;">${data.date} في ${data.timeSlot}</td></tr>
          <tr><td style="padding:10px 0;color:#718096;border-bottom:1px solid #e2e8f0;">النوع:</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #e2e8f0;color:#c9a84c;">${data.meetingMode === "online" ? "💻 أونلاين" : "🏢 حضوري"}</td></tr>
          <tr><td style="padding:10px 0;color:#718096;">الملاحظات:</td><td style="padding:10px 0;font-weight:700;">${data.notes || "—"}</td></tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="${settings.siteUrl}/admin/appointments" style="display:inline-block;background:#1a3c5e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;">
          إدارة الموعد من لوحة التحكم
        </a>
      </div>
    `, settings),
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
  const settings = await getLiveSettings();
  await resend.emails.send({
    from: `نموذج التواصل <noreply@${(settings.siteUrl || "").replace(/^https?:\/\//, "")}>`,
    to: settings.contact.email,
    subject: `📬 رسالة جديدة من ${data.name}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">رسالة جديدة عبر الموقع</h3>
      <p>لقد استلمت رسالة تواصل جديدة من أحد الزوار:</p>
      <div style="background:#f7fafc;padding:20px;border-radius:12px;margin:20px 0;font-size:14px;">
        <p><strong>الاسم:</strong> ${data.name}</p>
        <p><strong>الهاتف:</strong> ${data.phone}</p>
        <p><strong>البريد:</strong> ${data.email || "—"}</p>
        <p><strong>الموضوع:</strong> ${data.subject || "—"}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;"/>
        <p style="white-space:pre-wrap;color:#4a5568;">${data.message}</p>
      </div>
      <div style="text-align:center;">
        <a href="${settings.siteUrl}/admin/messages" style="display:inline-block;background:#1a3c5e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;">
          الرد عبر نظام المذكرات
        </a>
      </div>
    `, settings),
  });
}

// ── 6. Ticketing System Notifications ─────────────────────────────────────────
export async function sendTicketCreatedEmail(data: {
  clientName: string;
  clientEmail: string;
  ticketCode: string;
  subject: string;
}) {
  if (!data.clientEmail) return;
  const settings = await getLiveSettings();
  const fromEmail = `${settings.officeName} <${senderEmail}>`;

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `📨 إشعار استلام رسالتك: ${data.subject}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">مرحباً ${data.clientName}،</h3>
      <p>لقد استلمنا رسالتك بنجاح. لضمان أفضل خدمة ومتابعة احترافية، تم فتح **مذكرة تواصل** خاصة بك.</p>
      
      <div style="background:#f0f7ff;border-right:6px solid #3182ce;padding:24px;margin:24px 0;border-radius:4px 12px 12px 4px;">
        <p style="margin:0 0 10px;color:#2c5282;font-size:14px;font-weight:700;">كود المتابعة السري الخاص بك:</p>
        <div style="font-size:32px;font-weight:900;letter-spacing:4px;color:#1a3c5e;font-family:monospace;">${data.ticketCode}</div>
        <p style="margin:16px 0 0;color:#2c5282;font-size:13px;line-height:1.6;">
          يمكنك استخدام هذا الكود في أي وقت عبر موقعنا لمتابعة الردود، إرسال ملفات إضافية، أو التواصل المباشر مع مكتبنا.
        </p>
      </div>

      <div style="margin:30px 0;text-align:center;">
        <a href="${settings.siteUrl}/track" style="display:inline-block;background:#3182ce;color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:800;box-shadow:0 4px 12px rgba(49,130,206,0.3);">
          دخول المذكرة للمتابعة
        </a>
      </div>
      
      <p style="color:#718096;font-size:12px;text-align:center;">يرجى عدم الرد المباشر على هذا الإيميل، استخدم رابط المتابعة أعلاه للتواصل.</p>
    `, settings),
  });
}

export async function sendTicketReplyAlertEmail(data: {
  clientName: string;
  clientEmail: string;
  ticketCode: string;
}) {
  if (!data.clientEmail) return;
  const settings = await getLiveSettings();
  const fromEmail = `${settings.officeName} <${senderEmail}>`;

  await resend.emails.send({
    from: fromEmail,
    to: data.clientEmail,
    subject: `🔔 تحديث جديد على مذكرتكم رقم ${data.ticketCode}`,
    html: emailTemplate(`
      <h3 style="color:#1a3c5e;margin-top:0;">مرحباً ${data.clientName}،</h3>
      <p>نحيطكم علماً بأن مكتب المحاماة قد أضاف **رداً جديداً** أو مرفقات على مذكرتكم المفتوحة لدينا.</p>
      
      <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
        <p style="color:#4a5568;margin-bottom:12px;">كود المتابعة الخاص بك:</p>
        <strong style="font-size:24px;color:#1a3c5e;font-family:monospace;letter-spacing:2px;">${data.ticketCode}</strong>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${settings.siteUrl}/track" style="display:inline-block;background:linear-gradient(135deg,#1a3c5e,#2a5c8e);color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:800;">
          قراءة الرد الآن
        </a>
      </div>

      <p style="color:#718096;font-size:12px;text-align:center;">شكراً لثقتكم بمكتبنا.</p>
    `, settings),
  });
}
