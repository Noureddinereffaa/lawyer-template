"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clientConfig } from "../../../config/client.config";
import { format, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";

type Step = 1 | 2 | 3;

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || clientConfig.booking.consultationTypes[0].id;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Meeting mode
  const [meetingMode, setMeetingMode] = useState<"in_person" | "online">("in_person");

  // Form Data
  const [type, setType] = useState(initialType);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [notes, setNotes] = useState("");

  // Result
  const [meetingCode, setMeetingCode] = useState<string | null>(null);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const dates: Date[] = [];
    let d = new Date();
    d.setDate(d.getDate() + 1);
    while (dates.length < 7 && dates.length < clientConfig.booking.maxAdvanceDays) {
      if (clientConfig.booking.workDays.includes(d.getDay())) {
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const slots = [];
      const start = parseInt(clientConfig.booking.workHours.start.split(":")[0]);
      const end = parseInt(clientConfig.booking.workHours.end.split(":")[0]);
      for (let i = start; i < end; i++) {
        slots.push(`${i}:00`);
      }
      setAvailableTimes(slots);
      setSelectedTime(null);
    }
  }, [selectedDate]);

  const handleNext = () => {
    if (step === 1) {
      if (!selectedDate || !selectedTime) {
        setError("يرجى اختيار التاريخ والوقت");
        return;
      }
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (meetingMode === "in_person" && !wilaya) {
      setError("يرجى اختيار الولاية");
      return;
    }
    if (meetingMode === "online" && !clientEmail) {
      setError("البريد الإلكتروني مطلوب للمقابلة أونلاين");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date: format(selectedDate!, "yyyy-MM-dd"),
          timeSlot: selectedTime,
          clientName,
          clientPhone,
          clientEmail,
          wilaya: meetingMode === "in_person" ? wilaya : "أونلاين",
          notes,
          meetingMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ أثناء الحجز");

      if (data.meetingCode) {
        setMeetingCode(data.meetingCode);
      }
      setStep(3);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-wrapper">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .mode-selector { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .mode-card {
          flex: 1; padding: 1.5rem; border-radius: 12px; cursor: pointer;
          border: 2px solid var(--border); text-align: center;
          transition: all .25s ease; background: var(--surface);
        }
        .mode-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,.08); }
        .mode-card.active { border-color: var(--primary); background: rgba(26,60,94,.06); }
        .mode-card .mode-icon { font-size: 2.5rem; margin-bottom: .75rem; }
        .mode-card .mode-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: .25rem; }
        .mode-card .mode-desc { font-size: .82rem; color: var(--text-secondary); }
        .meeting-code-box {
          background: linear-gradient(135deg, #1a3c5e 0%, #2a5c8e 100%);
          color: #fff; border-radius: 16px; padding: 2rem; text-align: center;
          margin: 1.5rem 0;
        }
        .meeting-code-digits {
          display: flex; justify-content: center; gap: .6rem; margin: 1.25rem 0;
        }
        .meeting-code-digit {
          width: 48px; height: 56px; border-radius: 10px;
          background: rgba(255,255,255,.15); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 800; letter-spacing: 1px;
          border: 1px solid rgba(255,255,255,.2);
        }
        .time-slots { display: flex; flex-wrap: wrap; gap: .5rem; }
        .time-slot-btn {
          padding: .5rem 1rem; border: 1.5px solid var(--border); border-radius: 8px;
          background: var(--surface); cursor: pointer; font-size: .9rem;
          transition: all .2s;
        }
        .time-slot-btn:hover { border-color: var(--primary); }
        .time-slot-btn.selected { background: var(--primary); color: #fff; border-color: var(--primary); }
      `}</style>

      <div className="booking-header">
        <h2>حجز موعد استشارة</h2>
        <p>3 خطوات بسيطة لحجز موعدك مع المحامي</p>
        <div className="booking-steps">
          <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>1</div>
          <div className="step-connector" />
          <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>2</div>
          <div className="step-connector" />
          <div className={`step-dot ${step === 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      <div className="booking-body">
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── STEP 1: Service, Mode & Time ─────────── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "var(--primary)" }}>
              الخطوة 1: نوع الاستشارة والموعد
            </h3>

            {/* Meeting Mode Selector */}
            <div className="mode-selector">
              <div className={`mode-card${meetingMode === "in_person" ? " active" : ""}`}
                onClick={() => setMeetingMode("in_person")}>
                <div className="mode-icon">🏛️</div>
                <div className="mode-title">حضوري</div>
                <div className="mode-desc">زيارة المكتب شخصياً</div>
              </div>
              <div className={`mode-card${meetingMode === "online" ? " active" : ""}`}
                onClick={() => setMeetingMode("online")}>
                <div className="mode-icon">💻</div>
                <div className="mode-title">أونلاين</div>
                <div className="mode-desc">مقابلة بالفيديو من أي مكان</div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">اختر نوع الاستشارة <span>*</span></label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                {clientConfig.booking.consultationTypes.map(c => (
                  <option key={c.id} value={c.id}>{c.label} - {c.price} دج</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">اختر التاريخ المناسب <span>*</span></label>
              <div style={{ display: "flex", gap: ".5rem", overflowX: "auto", paddingBottom: "1rem" }}>
                {availableDates.map((d, i) => {
                  const isSelected = selectedDate && isSameDay(d, selectedDate);
                  return (
                    <button key={i} type="button" onClick={() => setSelectedDate(d)}
                      style={{
                        flexShrink: 0, width: 80, padding: ".75rem .25rem",
                        borderRadius: "var(--radius)", border: "1.5px solid",
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        background: isSelected ? "var(--primary)" : "var(--surface)",
                        color: isSelected ? "#fff" : "var(--text-primary)",
                        transition: "all var(--transition)", textAlign: "center", cursor: "pointer"
                      }}>
                      <div style={{ fontSize: ".8rem", marginBottom: ".2rem", opacity: .8 }}>{format(d, "EEEE", { locale: ar })}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{format(d, "dd")}</div>
                      <div style={{ fontSize: ".8rem", opacity: .8 }}>{format(d, "MMM", { locale: ar })}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label">اختر التوقيت المتاح <span>*</span></label>
                <div className="time-slots">
                  {availableTimes.map((t, i) => (
                    <button key={i} type="button"
                      className={`time-slot-btn ${selectedTime === t ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="button" className="btn btn-primary btn-full" onClick={handleNext}>
              المتابعة للخطوة التالية ←
            </button>
          </div>
        )}

        {/* ── STEP 2: Client Details ─────────── */}
        {step === 2 && (
          <form className="animate-fade-in" onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "var(--primary)" }}>
              الخطوة 2: بياناتك الشخصية
            </h3>

            <div style={{ background: "rgba(26,60,94,.05)", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: ".9rem" }}>
              <strong>الملخص:</strong>{" "}
              {meetingMode === "online" ? "💻 مقابلة أونلاين" : "🏛️ مقابلة حضورية"} — يوم{" "}
              {format(selectedDate!, "do MMMM yyyy", { locale: ar })} على الساعة {selectedTime}
              <button type="button" onClick={() => setStep(1)}
                style={{ color: "var(--secondary)", fontWeight: 700, marginInlineStart: 10, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                تعديل
              </button>
            </div>

            <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">الاسم الكامل <span>*</span></label>
                <input type="text" className="form-control" required
                  value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الهاتف <span>*</span></label>
                <input type="tel" className="form-control" required dir="ltr" placeholder="0550 00 00 00"
                  value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">
                  البريد الإلكتروني <span>*</span>
                </label>
                <input type="email" className="form-control" dir="ltr"
                  required
                  placeholder="مطلوب لإرسال تفاصيل الموعد وتأكيده"
                  value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
              </div>
              {meetingMode === "in_person" ? (
                <div className="form-group">
                  <label className="form-label">الولاية <span>*</span></label>
                  <select className="form-control" required value={wilaya} onChange={e => setWilaya(e.target.value)}>
                    <option value="">-- اختر ولايتك --</option>
                    <option value="الجزائر العاصمة">الجزائر العاصمة</option>
                    <option value="وهران">وهران</option>
                    <option value="قسنطينة">قسنطينة</option>
                    <option value="عنابة">عنابة</option>
                    <option value="بجاية">بجاية</option>
                    <option value="باتنة">باتنة</option>
                    <option value="سطيف">سطيف</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" style={{ color: "var(--text-secondary)" }}>نوع المقابلة</label>
                  <div style={{ padding: ".65rem 1rem", background: "rgba(26,60,94,.05)", borderRadius: 8, color: "var(--primary)", fontWeight: 600 }}>
                    💻 مقابلة أونلاين بالفيديو
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label">ملاحظات حول القضية (اختياري)</label>
              <textarea className="form-control" style={{ minHeight: 80 }}
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} disabled={loading} onClick={() => setStep(1)}>
                رجوع
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 3 }} disabled={loading}>
                {loading ? "جاري تأكيد الموعد..." : "تأكيد الموعد"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Success ─────────── */}
        {step === 3 && (
          <div className="booking-success animate-fade-in">
            <div className="success-icon">✓</div>
            <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>تم تأكيد حجزك بنجاح!</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
              شكراً لك {clientName}. لقد تم حجز موعدك يوم{" "}
              <strong>{format(selectedDate!, "do MMMM yyyy", { locale: ar })}</strong> على الساعة{" "}
              <strong>{selectedTime}</strong>.
            </p>

            {/* Meeting Code for Online */}
            {meetingMode === "online" && meetingCode && (
              <div className="meeting-code-box">
                <div style={{ fontSize: ".9rem", opacity: .8, marginBottom: ".5rem" }}>🔐 رمز الاجتماع الخاص بك</div>
                <div className="meeting-code-digits" dir="ltr">
                  {meetingCode.split("").map((d, i) => (
                    <div key={i} className="meeting-code-digit">{d}</div>
                  ))}
                </div>
                <p style={{ fontSize: ".85rem", opacity: .85, marginTop: "1rem" }}>
                  احفظ هذا الرمز! ستحتاجه للدخول إلى قاعة الاجتماع يوم الموعد.
                </p>
              </div>
            )}

            <div style={{ background: "rgba(201,168,76,.1)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(201,168,76,.3)", textAlign: "right" }}>
              <h4 style={{ color: "var(--secondary)", marginBottom: ".5rem" }}>الخطوات القادمة:</h4>
              <ul style={{ paddingRight: "1.5rem", listStyleType: "disc", lineHeight: 1.8 }}>
                {meetingMode === "online" ? (
                  <>
                    <li>يوم الموعد، ادخل إلى صفحة <Link href="/meeting" style={{ color: "var(--primary)", fontWeight: 700 }}>غرفة الاجتماعات</Link></li>
                    <li>أدخل الرمز السري <strong>{meetingCode}</strong> للدخول لقاعة الانتظار</li>
                    <li>عند انضمام المحامي، ستبدأ المقابلة بالفيديو تلقائياً</li>
                  </>
                ) : (
                  <>
                    <li>سنتصل بك قريباً على الرقم <strong>{clientPhone}</strong> لتأكيد الموعد</li>
                    <li>يُرجى إحضار أي وثائق تخص القضية</li>
                    <li>الرجاء الحضور قبل الموعد بـ 10 دقائق</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/" className="btn btn-outline">العودة للرئيسية</Link>
              {meetingMode === "online" && <Link href="/meeting" className="btn btn-primary">الذهاب لغرفة الاجتماعات</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
