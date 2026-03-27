import { getSettings } from "@/lib/settings";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: `شروط الاستخدام | ${config.officeName}`,
    description: "شروط الاستخدام والأحكام العامة للخدمات القانونية.",
  };
}

export default async function TermsPage() {
  const config = await getSettings();

  return (
    <div style={{ padding: "4rem 0", background: "var(--bg)", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
            شروط وأحكام الاستخدام
          </h1>
          
          <div className="prose" style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <p>
              مرحباً بك في موقع <strong>{config.officeName}</strong>. بمجرد دخولك إلى هذا الموقع واستخدامك لخدماته (بما في ذلك حجز المواعيد والاستشارات عبر الإنترنت)، فإنك توافق على الالتزام بالشروط والأحكام التالية، المستندة إلى <strong>القانون رقم 18-05 المتعلق بالتجارة الإلكترونية والخدمات الرقمية</strong> في الجزائر.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>1. طبيعة الخدمات</h3>
            <p>
              يقدم هذا الموقع معلومات وخدمات قانونية إلكترونية وحضورية. المعلومات الواردة في الموقع (مثل المقالات والمنشورات) هي لأغراض تثقيفية عامة ولا تعتبر بحد ذاتها استشارة قانونية مُلزمة ما لم يتم التعاقد رسمياً أو حجز استشارة خاصة.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>2. حجز المواعيد والاستشارات</h3>
            <ul style={{ paddingRight: "1.5rem", marginTop: ".5rem" }}>
              <li>يحق للعميل حجز موعد حضوري أو عبر الإنترنت.</li>
              <li>الاستشارات التي تتم عبر الإنترنت (Online) تتطلب التزام العميل بالحضور في الوقت المحدد للغرفة الافتراضية.</li>
              <li>يحتفظ المكتب بالحق في إعادة جدولة أو إلغاء أي موعد لأسباب مهنية مع إخطار العميل مسبقاً.</li>
            </ul>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>3. الرسوم والدفع (TVA غير مطبقة)</h3>
            <p>
              وفقاً لقانون المقاول الذاتي والتشريعات الضريبية المعمول بها في الحالات المحددة، فإن الفواتير الصادرة عبر الموقع تكون <strong>معفاة من الرسوم على القيمة المضافة (TVA non applicable)</strong>. جميع أسعار الاستشارات المحددة نهائية وتُدفع بالطرق المعتمدة (الدفع نقداً، CIB/Edahabia، أو التحويل البنكي).
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>4. إخلاء المسؤولية التقنية</h3>
            <p>
              رغم أننا نبذل قصارى جهدنا لضمان استمرارية عمل الموقع وأنظمة الاجتماعات الافتراضية بشكل آمن وخالٍ من الأخطاء، إلا أننا لا نتحمل المسؤولية عن أي انقطاعات تقنية خارجة عن إرادتنا (مثل مشاكل سرعة الإنترنت لدى العميل).
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>5. الملكية الفكرية</h3>
            <p>
              جميع المحتويات المنشورة على هذا الموقع (مثل المقالات القانونية، التصميمات، الشعار) هي ملكية حصرية لـ <strong>{config.officeName}</strong> ويُمنع نسخها أو إعادة نشرها دون إذن كتابي مسبق.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>6. التعديلات والقانون الحاكم</h3>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يخضع هذا الموقع وتستند جميع شروطه إلى قوانين <strong>الجمهورية الجزائرية الديمقراطية الشعبية</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
