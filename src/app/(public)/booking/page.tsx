import BookingWizard from "@/components/booking/BookingWizard";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "حجز استشارة قانونية",
  description: "احجز موعداً لاستشارة قانونية مع المحامي بكل سهولة وسرعة.",
};

export default function BookingPage() {
  return (
    <>
      <div style={{ paddingTop: "80px" }} />
      <section className="section" style={{ background: "var(--bg)", minHeight: "calc(100vh - 80px)" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge">📅 حجز موعد</span>
            <h1 style={{ marginBottom: "1rem" }}>حدد موعد استشارتك</h1>
            <p style={{ maxWidth: 600, margin: "0 auto" }}>الرجاء اختيار نوع الاستشارة والموعد المناسب لك، وسنقوم بتأكيد موعدك في أقرب وقت.</p>
          </div>
          
          <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem" }}><div className="spinner"></div><p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>جاري تحميل نظام الحجز...</p></div>}>
            <BookingWizard />
          </Suspense>

          <div style={{ marginTop: "3rem", textAlign: "center", fontSize: ".9rem", color: "var(--text-secondary)" }}>
            لديك استفسار سريع قبل الحجز؟ <Link href="/contact" style={{ color: "var(--secondary)", fontWeight: 700 }}>تواصل معنا هنا</Link>
          </div>
        </div>
      </section>
    </>
  );
}
