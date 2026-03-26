"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MeetingEntryPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1); // single digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("يرجى إدخال الرمز المكون من 6 أرقام");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/meeting?code=${fullCode}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "رمز غير صالح");
        setLoading(false);
        return;
      }
      // Navigate to waiting room
      router.push(`/meeting/${fullCode}`);
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .meeting-entry { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, #0d2340 0%, #1a3c5e 50%, #2a5c8e 100%); padding: 2rem; }
        .meeting-entry-card { background: #fff; border-radius: 20px; padding: 3rem 2.5rem; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        .code-inputs { display: flex; justify-content: center; gap: .6rem; margin: 2rem 0; direction: ltr; }
        .code-input {
          width: 52px; height: 62px; text-align: center; font-size: 1.5rem; font-weight: 800;
          border: 2px solid #e2e8f0; border-radius: 12px; outline: none;
          transition: all .2s; color: #1a3c5e; background: #f8f9fa;
        }
        .code-input:focus { border-color: #1a3c5e; background: #fff; box-shadow: 0 0 0 3px rgba(26,60,94,.15); }
        @media(max-width:480px) { .code-input { width: 44px; height: 54px; font-size: 1.3rem; } .meeting-entry-card { padding: 2rem 1.5rem; } }
      `}</style>

      <div className="meeting-entry">
        <div className="meeting-entry-card">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚖️</div>
          <h1 style={{ fontSize: "1.5rem", color: "#1a3c5e", marginBottom: ".5rem" }}>غرفة الاستشارات</h1>
          <p style={{ color: "#555", fontSize: ".95rem", marginBottom: ".5rem" }}>أدخل رمز الاجتماع الخاص بك للدخول</p>

          {error && (
            <div style={{ background: "#fff5f5", color: "#e53e3e", padding: ".75rem 1rem", borderRadius: 10, fontSize: ".9rem", marginTop: "1rem" }}>
              {error}
            </div>
          )}

          <div className="code-inputs" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="code-input"
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || code.join("").length !== 6}
            style={{
              width: "100%", padding: "1rem", borderRadius: 12,
              background: code.join("").length === 6 ? "linear-gradient(135deg, #1a3c5e, #2a5c8e)" : "#e2e8f0",
              color: code.join("").length === 6 ? "#fff" : "#aaa",
              border: "none", fontSize: "1.05rem", fontWeight: 700,
              cursor: code.join("").length === 6 ? "pointer" : "not-allowed",
              transition: "all .3s",
            }}
          >
            {loading ? "⏳ جاري التحقق..." : "الدخول لقاعة الانتظار"}
          </button>

          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: ".82rem", color: "#888" }}>
              ليس لديك رمز؟ <Link href="/booking" style={{ color: "#1a3c5e", fontWeight: 700 }}>احجز موعداً أولاً</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
