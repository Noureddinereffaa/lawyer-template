"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "var(--primary)", fontWeight: 800 }}>جاري التحميل...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "closed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, open: 0, replied: 0 });

  const searchParams = useSearchParams();
  const router = useRouter();
  const deepLinkHandled = useRef(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/tickets/admin?`;
      if (activeTab === "archived") url += "archived=true";
      else if (activeTab === "closed") url += "status=closed&archived=false";
      else url += "archived=false&status=open,replied"; // Custom logic handled by API if we update it, or just fetch all and filter client side
      
      // Let's use specific filters supported by our new API
      const params = new URLSearchParams();
      if (activeTab === "archived") params.append("archived", "true");
      else {
        params.append("archived", "false");
        if (activeTab === "closed") params.append("status", "closed");
      }
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/tickets/admin?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let filteredTickets = data.tickets;
        
        // Final client-side filter for "Active" (not closed)
        if (activeTab === "active") {
          filteredTickets = filteredTickets.filter((t: any) => t.status !== "closed");
        }

        setTickets(filteredTickets);
        
        // Simple stats calculation
        if (activeTab === "active") {
          setStats({
            total: data.tickets.length,
            open: filteredTickets.filter((t: any) => t.status === "open").length,
            replied: filteredTickets.filter((t: any) => t.status === "replied").length
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  // Auto-open a ticket when navigated from appointments page (?ticket=ID)
  useEffect(() => {
    const ticketId = searchParams.get("ticket");
    if (!ticketId || deepLinkHandled.current) return;
    deepLinkHandled.current = true;

    // Fetch and open this specific ticket
    (async () => {
      // Fetch ticket details
      const res = await fetch(`/api/tickets/admin?ticketId=${ticketId}`);
      if (!res.ok) return;
      const data = await res.json();

      // Also fetch ticket metadata (name, code, etc.)
      const metaRes = await fetch(`/api/admin/tickets/meta?ticketId=${ticketId}`);
      if (metaRes.ok) {
        const meta = await metaRes.json();
        if (meta.ticket) {
          setSelectedTicket(meta.ticket);
          setMessages(data.messages || []);
          // Clear the URL param without reload
          router.replace("/admin/messages", { scroll: false });
        }
      } else {
        // Fallback: open from tickets list after load
        setMessages(data.messages || []);
      }
    })();
  }, [searchParams, router]);

  const openTicket = async (t: any) => {
    setSelectedTicket(t);
    setMessages([]);
    try {
      const res = await fetch(`/api/tickets/admin?ticketId=${t.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !selectedFile) || !selectedTicket) return;
    
    setReplyLoading(true);
    let attachmentUrl = null;

    try {
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.url;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/tickets/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyText, attachmentUrl })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setReplyText("");
        setSelectedFile(null);
        setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: "replied" } : t));
        setSelectedTicket({ ...selectedTicket, status: "replied" });
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
    setReplyLoading(true);
    setReplyLoading(false);
  };

  const handleUpdateStatus = async (ticketId: string, updates: any) => {
    try {
      const res = await fetch(`/api/tickets/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, ...updates })
      });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== ticketId)); // Remove from current view
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذه المذكرة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    try {
      const res = await fetch(`/api/tickets/admin?ticketId=${ticketId}`, { method: "DELETE" });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="admin-title">📨 رسائل المكتب ومذكرات الدعم</h1>
        <p style={{ color: "var(--text-secondary)" }}>إدارة التواصل المباشر مع الموكلين وتتبع طلبات الخدمات القانونية.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card glass" style={{ padding: "1.5rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>إجمالي المذكرات النشطة</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }}>{stats.total}</div>
        </div>
        <div className="card glass" style={{ padding: "1.5rem", textAlign: "center", border: "1px solid rgba(201,168,76,0.2)" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>بانتظار الرد (جديد)</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--secondary)" }}>{stats.open}</div>
        </div>
        <div className="card glass" style={{ padding: "1.5rem", textAlign: "center", border: "1px solid rgba(72,187,120,0.2)" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>تمت معالجتها</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#2f855a" }}>{stats.replied}</div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="card glass" style={{ padding: "1rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setActiveTab("active")} className={`btn btn-sm ${activeTab === "active" ? "btn-primary" : "btn-outline"}`}>🟢 النشطة</button>
          <button onClick={() => setActiveTab("archived")} className={`btn btn-sm ${activeTab === "archived" ? "btn-primary" : "btn-outline"}`}>📥 مؤرشفة</button>
          <button onClick={() => setActiveTab("closed")} className={`btn btn-sm ${activeTab === "closed" ? "btn-primary" : "btn-outline"}`}>🚫 مغلقة</button>
        </div>
        
        <div style={{ position: "relative", minWidth: "300px" }}>
          <input 
            type="text" 
            placeholder="البحث بالاسم أو رمز التذكرة..." 
            className="form-control"
            style={{ paddingRight: "2.5rem", borderRadius: "50px", height: "40px" }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="card glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم العميل</th>
                <th>الموضوع</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th style={{ textAlign: "left" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem" }}><div className="animate-pulse">جاري جلب البيانات...</div></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>لا توجد بيانات تطابق الفلترة الحالية.</td></tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover-lift">
                    <td style={{ fontWeight: 800, color: "var(--primary)" }}>{t.ticket_code}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.client_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.client_email}</div>
                    </td>
                    <td>{t.subject}</td>
                    <td>{format(new Date(t.created_at), "dd/MM/yyyy", { locale: ar })}</td>
                    <td>
                      <span className="badge" style={{ 
                        background: t.status === "open" ? "var(--secondary-light)" : t.status === "replied" ? "rgba(72,187,120,0.1)" : "rgba(0,0,0,0.05)",
                        color: t.status === "open" ? "var(--primary)" : t.status === "replied" ? "#2f855a" : "var(--text-secondary)"
                      }}>
                        {t.status === "open" ? "جديد" : t.status === "replied" ? "تم الرد" : "مغلق"}
                      </span>
                    </td>
                    <td style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openTicket(t)}>👁️ عرض</button>
                      <button className="btn btn-outline btn-sm" title="أرشفة" onClick={() => handleUpdateStatus(t.id, { isArchived: !t.is_archived })}>
                        {t.is_archived ? "📂 استعادة" : "📥 أرشفة"}
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: "#e53e3e", borderColor: "rgba(229,62,62,0.2)" }} title="حذف" onClick={() => handleDeleteTicket(t.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-styled Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)} style={{ backdropFilter: "blur(12px)" }}>
          <div className="modal-content glass animate-slide-up" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: "900px", width: "100%", padding: 0, borderRadius: "24px", overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "90vh"
          }}>
            
            <div style={{ background: "var(--primary)", color: "#fff", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#fff" }}>مذكرة #{selectedTicket.ticket_code}</h2>
                <div style={{ opacity: 0.8, fontSize: "0.9rem", marginTop: "0.2rem" }}>{selectedTicket.subject} - {selectedTicket.client_name}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer", lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "2rem", background: "rgba(248, 250, 252, 0.4)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {messages.map((msg, i) => (
                <div key={msg.id} style={{ alignSelf: msg.sender === "lawyer" ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                  <div style={{ 
                    padding: "1rem 1.5rem", 
                    borderRadius: msg.sender === "lawyer" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
                    background: msg.sender === "lawyer" ? "var(--primary)" : "#fff",
                    color: msg.sender === "lawyer" ? "#fff" : "var(--text-primary)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.6 }}>{msg.message}</div>
                    {msg.attachment_url && (
                      <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem" }}>
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" style={{ color: msg.sender === "lawyer" ? "#fff" : "var(--secondary)", fontSize: "0.9rem", textDecoration: "underline" }}>📎 تحميل المرفق</a>
                      </div>
                    )}
                    <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.5rem", textAlign: msg.sender === "lawyer" ? "right" : "left" }}>
                       {format(new Date(msg.created_at), "HH:mm - dd MMM", { locale: ar })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
              {selectedTicket.status === "closed" ? (
                <div style={{ textAlign: "center", color: "#e53e3e", fontWeight: "bold" }}>هذه المذكرة مغلقة.</div>
              ) : (
                <form onSubmit={handleReply}>
                  <textarea 
                    className="form-control" 
                    placeholder="اكتب ردك هنا..." 
                    rows={3} 
                    style={{ marginBottom: "1rem", borderRadius: "12px", minHeight: "80px", resize: "none" }}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  ></textarea>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                      <input type="file" style={{ display: "none" }} id="modal-file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                      <label htmlFor="modal-file" className="btn btn-outline btn-sm" style={{ cursor: "pointer", background: "var(--surface)" }}>
                        📎 {selectedFile ? selectedFile.name : "إرفاق ملف"}
                      </label>
                      <button type="button" className="btn btn-outline btn-sm" style={{ color: "#e53e3e" }} onClick={() => handleUpdateStatus(selectedTicket.id, { status: "closed" })}>إغلاق نهائي</button>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={replyLoading || uploading}>{replyLoading || uploading ? "جاري الإرسال..." : "إرسال الرد"}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
