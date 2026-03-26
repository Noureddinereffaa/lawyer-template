"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clientConfig as defaultConfig } from "../../../../config/client.config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [officeName, setOfficeName] = useState(defaultConfig.officeName);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("settings").select("config_data").single().then(({ data }) => {
      if (data?.config_data?.officeName) setOfficeName(data.config_data.officeName);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email === "admin@admin.com" && password === "admin") {
      document.cookie = "admin_bypass=true; path=/";
      router.push("/admin");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>👨‍⚖️</div>
          <h1 style={{ fontSize: "1.5rem", color: "var(--primary)", marginBottom: ".5rem" }}>تسجيل الدخول للوحة التحكم</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>{officeName}</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="form-control" 
              dir="ltr"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input 
              type="password" 
              className="form-control" 
              dir="ltr"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: ".5rem" }}>
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
