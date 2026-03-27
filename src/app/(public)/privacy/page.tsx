import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: `سياسة الخصوصية | ${config.officeName}`,
    description: "سياسة الخصوصية وحماية البيانات الشخصية وفقاً للقانون الجزائري.",
  };
}

export default async function PrivacyPage() {
  const config = await getSettings();

  return (
    <div style={{ padding: "4rem 0", background: "var(--bg)", minHeight: "80vh" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ background: "var(--surface)", padding: "3rem", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
            سياسة الخصوصية وحماية البيانات
          </h1>
          
          <div className="prose" style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <p>
              تلتزم <strong>{config.officeName}</strong> بضمان حماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية، وذلك توافقاً مع <strong>القانون رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي</strong> في الجمهورية الجزائرية الديمقراطية الشعبية.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>1. جمع المعلومات الشخصية</h3>
            <p>
              نقوم بجمع البيانات الشخصية (مثل الاسم، رقم الهاتف، البريد الإلكتروني، وتفاصيل القضية) فقط عندما تقوم بتقديمها طواعية عند حجز موعد، أو تعبئة نموذج الاتصال.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>2. استخدام المعلومات</h3>
            <p>
              تُستخدم المعلومات التي نجمعها للأغراض التالية فقط:
            </p>
            <ul style={{ paddingRight: "1.5rem", marginTop: ".5rem" }}>
              <li>تأكيد وجدولة المواعيد (حضورياً أو عبر الإنترنت).</li>
              <li>التواصل معك بخصوص استشاراتك القانونية.</li>
              <li>تحسين جودة الخدمات المقدمة.</li>
            </ul>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>3. حماية البيانات (السر المهني)</h3>
            <p>
              بصفتنا هيئة قانونية، تخضع جميع معلوماتك للسر المهني المطلق. يتم تخزين بياناتك في بيئة آمنة ولا يتم مشاركتها، بيعها، أو تأجيرها لأي طرف ثالث بأي حال من الأحوال، باستثناء ما تفرضه السلطات القضائية بموجب القوانين النافذة.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>4. حقوق المستخدم</h3>
            <p>
              وفقاً للقانون الجزائري للمقاول الذاتي ولحماية البيانات، لديك الحق الكامل في:
            </p>
            <ul style={{ paddingRight: "1.5rem", marginTop: ".5rem" }}>
              <li>الوصول إلى بياناتك الشخصية المحفوظة لدينا.</li>
              <li>طلب تصحيح أو تحديث بياناتك.</li>
              <li>طلب حذف بياناتك من سجلاتنا بشكل نهائي.</li>
            </ul>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>5. ملفات تعريف الارتباط (Cookies)</h3>
            <p>
              قد نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل الموقع بشكل سليم ولتحسين تجربة المستخدم. لا نستخدم ملفات تعريف الارتباط لأغراض تتبع إعلانية خارجية.
            </p>

            <h3 style={{ color: "var(--primary)", marginTop: "2rem", marginBottom: "1rem" }}>6. التواصل</h3>
            <p>
              إذا كانت لديك أي استفسارات بخصوص سياسة الخصوصية الخاصة بنا، يمكنك التواصل معنا عبر:
              <br/>
              <strong>البريد الإلكتروني:</strong> <span dir="ltr">{config.contact.email}</span>
              <br/>
              <strong>الهاتف:</strong> <span dir="ltr">{config.contact.phoneDisplay}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
