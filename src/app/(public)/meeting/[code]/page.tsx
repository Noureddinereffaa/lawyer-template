"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type MeetingData = {
  id: string;
  clientName: string;
  type: string;
  date: string;
  timeSlot: string;
  meetingStatus: "idle" | "waiting" | "live" | "ended";
  appointmentStatus: string;
};

export default function MeetingRoomPage() {
  const params = useParams();
  const code = params.code as string;

  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch meeting info and notify server client is waiting
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/meeting?code=${code}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "رمز غير صالح");
          setLoading(false);
          return;
        }
        setMeetingData(data);
        setLoading(false);

        // Mark client as waiting
        if (data.meetingStatus === "idle") {
          await fetch("/api/meeting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: data.id, action: "client_waiting" }),
          });
          setMeetingData(prev => prev ? { ...prev, meetingStatus: "waiting" } : null);
        }
      } catch {
        setError("حدث خطأ في الاتصال");
        setLoading(false);
      }
    }
    init();
  }, [code]);

  // Poll for meeting status changes (waiting → live)
  useEffect(() => {
    if (!meetingData || meetingData.meetingStatus === "live" || meetingData.meetingStatus === "ended") return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/meeting?code=${code}`);
        const data = await res.json();
        if (res.ok) {
          setMeetingData(data);
          if (data.meetingStatus === "live" || data.meetingStatus === "ended") {
            clearInterval(pollRef.current!);
          }
        }
      } catch { /* ignore polling errors */ }
    }, 3000); // Check every 3 seconds

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [meetingData?.meetingStatus, code]);

  // Load Jitsi when meeting goes live
  useEffect(() => {
    if (meetingData?.meetingStatus === "live" && !jitsiLoaded) {
      setJitsiLoaded(true);
    }
  }, [meetingData?.meetingStatus, jitsiLoaded]);

  if (loading) {
    return (
      <div style={fullCenter}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>جاري تحميل بيانات الاجتماع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={fullCenter}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "3rem", maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <h2 style={{ color: "#e53e3e", marginBottom: "1rem" }}>خطأ</h2>
          <p style={{ color: "#555", marginBottom: "2rem" }}>{error}</p>
          <Link href="/meeting" className="btn btn-primary">العودة لإدخال الرمز</Link>
        </div>
      </div>
    );
  }

  if (meetingData?.meetingStatus === "ended") {
    return (
      <div style={fullCenter}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "3rem", maxWidth: 450, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#1a3c5e", marginBottom: "1rem" }}>انتهت الجلسة</h2>
          <p style={{ color: "#555", marginBottom: "2rem" }}>شكراً لك. نأمل أن نكون قد أفدناك.</p>
          <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // ── WAITING ROOM ──
  if (meetingData?.meetingStatus !== "live") {
    return (
      <>
        <style>{`
          .waiting-room { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, #0d2340 0%, #1a3c5e 50%, #2a5c8e 100%); padding: 2rem; }
          .waiting-card { background: #fff; border-radius: 20px; padding: 3rem 2.5rem; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
          .pulse-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #1a3c5e; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; animation: pulseRing 2s ease-in-out infinite; }
          @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(26,60,94,.3); } 50% { box-shadow: 0 0 0 15px rgba(26,60,94,0); } }
          .info-row { display: flex; justify-content: space-between; padding: .75rem 0; border-bottom: 1px solid #f0f0f0; font-size: .92rem; }
          .info-row:last-child { border: none; }
          .info-label { color: #888; }
          .info-value { font-weight: 700; color: #1a3c5e; }
        `}</style>
        <div className="waiting-room">
          <div className="waiting-card">
            <div className="pulse-ring">
              <span style={{ fontSize: "2rem" }}>⏳</span>
            </div>
            <h2 style={{ color: "#1a3c5e", marginBottom: ".5rem" }}>قاعة الانتظار</h2>
            <p style={{ color: "#888", fontSize: ".9rem", marginBottom: "2rem" }}>
              يرجى الانتظار، سيبدأ الاجتماع فور انضمام المحامي...
            </p>

            <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "1.25rem", textAlign: "right", marginBottom: "1.5rem" }}>
              <div className="info-row">
                <span className="info-label">الاسم</span>
                <span className="info-value">{meetingData?.clientName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">نوع الاستشارة</span>
                <span className="info-value">{meetingData?.type}</span>
              </div>
              <div className="info-row">
                <span className="info-label">التاريخ</span>
                <span className="info-value">{meetingData?.date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">الوقت</span>
                <span className="info-value">{meetingData?.timeSlot}</span>
              </div>
              <div className="info-row">
                <span className="info-label">الحالة</span>
                <span style={{ color: "#c9a84c", fontWeight: 700 }}>● في انتظار المحامي</span>
              </div>
            </div>

            <div style={{ padding: "1rem", background: "rgba(201,168,76,.1)", borderRadius: 10, border: "1px solid rgba(201,168,76,.2)", fontSize: ".85rem", color: "#555" }}>
              💡 نصيحة: تأكد من أن الكاميرا والميكروفون يعملان بشكل صحيح قبل بدء الجلسة.
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── VIDEO ROOM (Jitsi Meet) ──
  const roomName = `lawyer-meet-${code}`;
  const jitsiDomain = "meet.jit.si";

  return (
    <>
      <style>{`
        .video-room { height: 100vh; display: flex; flex-direction: column; background: #0d2340; }
        .video-header { display: flex; align-items: center; justify-content: space-between; padding: .75rem 1.5rem; background: rgba(0,0,0,.3); color: #fff; }
        .video-header .live-badge { display: flex; align-items: center; gap: .5rem; background: #e53e3e; padding: .35rem .8rem; border-radius: 20px; font-size: .82rem; font-weight: 700; }
        .video-header .live-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: blink 1.5s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .jitsi-frame { flex: 1; border: none; width: 100%; }
      `}</style>
      <div className="video-room">
        <div className="video-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "1.2rem" }}>⚖️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: ".95rem" }}>استشارة قانونية — {meetingData?.type}</div>
              <div style={{ fontSize: ".78rem", opacity: .7 }}>{meetingData?.clientName}</div>
            </div>
          </div>
          <div className="live-badge">
            <div className="live-dot" />
            مباشر
          </div>
        </div>
        <iframe
          className="jitsi-frame"
          src={`https://${jitsiDomain}/${roomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false&config.startWithAudioMuted=false&config.disableDeepLinking=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          allowFullScreen
        />
      </div>
    </>
  );
}

const fullCenter: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(160deg, #0d2340 0%, #1a3c5e 50%, #2a5c8e 100%)", padding: "2rem",
};
