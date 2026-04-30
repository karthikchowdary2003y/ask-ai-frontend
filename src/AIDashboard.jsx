import { useState, useRef, useEffect } from "react";

// ─── Inline styles as a style tag injected once ───────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #0d0809;
    --surface: rgba(255,255,255,0.04);
    --surface-hover: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --accent: #e03a3a;
    --accent-dim: rgba(224,58,58,0.18);
    --text: #f0ece8;
    --muted: rgba(240,236,232,0.45);
    --glow: rgba(180,30,30,0.35);
    --sidebar-w: 56px;
  }

  .aid-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* ambient glow blobs */
  .aid-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
  }
  .aid-blob-1 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(160,20,20,0.55) 0%, transparent 70%);
    bottom: -120px; left: -60px;
  }
  .aid-blob-2 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(200,50,20,0.3) 0%, transparent 70%);
    top: 40px; right: 80px;
  }

  /* ── Sidebar ── */
  .aid-sidebar {
    position: fixed;
    top: 0; left: 0;
    width: var(--sidebar-w);
    height: 100vh;
    background: rgba(15,9,9,0.85);
    backdrop-filter: blur(12px);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0;
    gap: 6px;
    z-index: 10;
  }
  .aid-logo {
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px;
    margin-bottom: 10px;
    box-shadow: 0 0 18px rgba(224,58,58,0.5);
  }
  .aid-sb-btn {
    width: 36px; height: 36px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: background 0.2s, color 0.2s;
  }
  .aid-sb-btn:hover, .aid-sb-btn.active {
    background: var(--surface-hover);
    color: var(--text);
  }
  .aid-sb-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e03a3a, #7b1e1e);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    margin-top: auto;
  }
  .aid-sb-divider {
    width: 28px; height: 1px;
    background: var(--border);
    margin: 4px 0;
  }

  /* ── Topbar ── */
  .aid-topbar {
    position: fixed;
    top: 0; left: var(--sidebar-w); right: 0;
    height: 48px;
    background: rgba(15,9,9,0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 10px;
    z-index: 10;
  }
  .aid-topbar-icon {
    width: 22px; height: 22px;
    border-radius: 5px;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
  }
  .aid-topbar-name {
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.02em;
  }
  .aid-topbar-actions {
    margin-left: auto;
    display: flex; align-items: center; gap: 8px;
  }
  .aid-share-btn {
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; gap-4px;
    transition: background 0.2s;
  }
  .aid-share-btn:hover { background: var(--surface-hover); }

  /* ── Main ── */
  .aid-main {
    margin-left: var(--sidebar-w);
    padding-top: 48px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    position: relative;
    z-index: 1;
    padding-bottom: 80px;
  }

  /* ── Hero ── */
  .aid-hero {
    text-align: center;
    margin-bottom: 32px;
    animation: aid-fadein 0.7s ease both;
  }
  @keyframes aid-fadein {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aid-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #f5ece8 30%, #c47c7c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .aid-hero p {
    font-size: 15px;
    color: var(--muted);
    margin: 0;
    letter-spacing: 0.01em;
  }

  /* ── Input card ── */
  .aid-card {
    width: min(620px, calc(100vw - 80px));
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
    overflow: hidden;
    animation: aid-fadein 0.7s 0.15s ease both;
  }
  .aid-textarea-wrap {
    padding: 18px 18px 10px;
  }
  .aid-textarea {
    width: 100%;
    min-height: 80px;
    max-height: 200px;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    caret-color: var(--accent);
    box-sizing: border-box;
  }
  .aid-textarea::placeholder { color: var(--muted); }

  .aid-card-footer {
    display: flex;
    align-items: center;
    padding: 10px 14px 12px;
    gap: 8px;
    border-top: 1px solid var(--border);
  }
  .aid-badge {
    font-size: 11px;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 3px 8px;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .aid-badge:hover { background: var(--surface-hover); color: var(--text); }
  .aid-send-btn {
    margin-left: auto;
    width: 34px; height: 34px;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(224,58,58,0.5);
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .aid-send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 0 24px rgba(224,58,58,0.7); }
  .aid-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Filter tabs ── */
  .aid-tabs {
    display: flex;
    gap: 8px;
    margin-top: 18px;
    animation: aid-fadein 0.7s 0.3s ease both;
  }
  .aid-tab {
    font-size: 12px;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 12px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    display: flex; align-items: center; gap: 5px;
    font-family: 'DM Sans', sans-serif;
  }
  .aid-tab:hover, .aid-tab.active {
    background: var(--surface-hover);
    color: var(--text);
    border-color: rgba(255,255,255,0.15);
  }

  /* ── Response area ── */
  .aid-response {
    width: min(620px, calc(100vw - 80px));
    margin-top: 16px;
    animation: aid-fadein 0.4s ease both;
  }
  .aid-response-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px 18px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }
  .aid-response-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }

  /* ── History ── */
  .aid-history {
    width: min(620px, calc(100vw - 80px));
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 340px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .aid-history::-webkit-scrollbar { width: 4px; }
  .aid-history::-webkit-scrollbar-track { background: transparent; }
  .aid-history::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .aid-msg {
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13.5px;
    line-height: 1.65;
  }
  .aid-msg-user {
    background: var(--accent-dim);
    border: 1px solid rgba(224,58,58,0.25);
    color: #f5dada;
    align-self: flex-end;
    max-width: 90%;
  }
  .aid-msg-ai {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    align-self: flex-start;
    max-width: 95%;
  }
  .aid-msg-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 5px;
    opacity: 0.55;
  }

  /* spinner */
  .aid-spin {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: aid-rotate 0.7s linear infinite;
  }
  @keyframes aid-rotate { to { transform: rotate(360deg); } }
`;

// ─── Sidebar icon helper ──────────────────────────────────────────────────────
const SvgIcons = {
  search:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>,
  clock:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  people:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M12 5v14M5 12h14"/></svg>,
  star:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bolt:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chat:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  history:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>,
  web: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  flow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="2" y="3" width="6" height="5" rx="1"/><rect x="16" y="3" width="6" height="5" rx="1"/><rect x="9" y="16" width="6" height="5" rx="1"/><path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M12 12v4"/></svg>,
  dash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIPromptDashboard = ({
  
  apiBase = "https://ask-ai-project-clean.onrender.com/api/ai",
  appName = "ASK AI",
  heroTitle = "ASK AI",
  heroSubtitle = "AI Agricultural Assistant",
}) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Websites");
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const historyEndRef = useRef(null);

  // inject styles once
  useEffect(() => {
    if (document.getElementById("aid-styles")) return;
    const tag = document.createElement("style");
    tag.id = "aid-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${apiBase}/ask?prompt=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const text = await res.text();
      setMessages((prev) => [...prev, { role: "ai", text }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const tabs = [
    { label: "Websites", icon: SvgIcons.web },
    { label: "Workflows", icon: SvgIcons.flow },
    { label: "Dashboards", icon: SvgIcons.dash },
  ];

  const sidebarTop = [
    { icon: SvgIcons.search, key: "search" },
    { icon: SvgIcons.clock, key: "clock" },
    { icon: SvgIcons.people, key: "people" },
  ];
  const sidebarMid = [
    { icon: SvgIcons.plus, key: "plus" },
    { icon: SvgIcons.star, key: "star" },
    { icon: SvgIcons.bolt, key: "bolt" },
  ];
  const sidebarBot = [
    { icon: SvgIcons.chat, key: "chat" },
    { icon: SvgIcons.history, key: "history" },
    { icon: SvgIcons.settings, key: "settings" },
  ];

  const showHistory = messages.length > 0;

  return (
    <div className="aid-root">
      {/* Ambient blobs */}
      <div className="aid-blob aid-blob-1" />
      <div className="aid-blob aid-blob-2" />

      {/* Sidebar */}
      <aside className="aid-sidebar">
        <div className="aid-logo">AA</div>
        {sidebarTop.map(({ icon, key }) => (
          <button key={key} className="aid-sb-btn">{icon}</button>
        ))}
        <div className="aid-sb-divider" />
        {sidebarMid.map(({ icon, key }) => (
          <button key={key} className="aid-sb-btn">{icon}</button>
        ))}
        <div className="aid-sb-divider" />
        {sidebarBot.map(({ icon, key }) => (
          <button key={key} className="aid-sb-btn">{icon}</button>
        ))}
        <div className="aid-sb-avatar">U</div>
      </aside>

      {/* Topbar */}
      <header className="aid-topbar">
        <div className="aid-topbar-icon">AA</div>
        <span className="aid-topbar-name">{appName}</span>
        <div className="aid-topbar-actions">
          <button className="aid-share-btn">⇗ Share</button>
          <button className="aid-sb-btn" style={{ width: 28, height: 28 }}>···</button>
          <button className="aid-sb-btn" style={{ width: 28, height: 28 }}>🔔</button>
          <div className="aid-sb-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>U</div>
        </div>
      </header>

      {/* Main content */}
      <main className="aid-main">
        {/* Hero */}
        {!showHistory && (
          <div className="aid-hero">
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </div>
        )}

        {/* Chat history */}
        {showHistory && (
          <div className="aid-history">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`aid-msg ${msg.role === "user" ? "aid-msg-user" : "aid-msg-ai"}`}
              >
                <div className="aid-msg-label">
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="aid-msg aid-msg-ai">
                <div className="aid-msg-label">AI</div>
                <span className="aid-spin" />
              </div>
            )}
            <div ref={historyEndRef} />
          </div>
        )}

        {/* Input card */}
        <div className="aid-card" style={{ marginTop: showHistory ? 12 : 0 }}>
          <div className="aid-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="aid-textarea"
              placeholder="Ask About Soil,Crops,weather....."
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              rows={3}
            />
          </div>
          <div className="aid-card-footer">
            <span className="aid-badge">⚡ Auto</span>
            <span className="aid-badge">⊞</span>
            <span className="aid-badge">✦</span>
            <button
              className="aid-send-btn"
              onClick={handleSend}
              disabled={loading || !prompt.trim()}
              title="Send (Enter)"
            >
              {loading ? <span className="aid-spin" /> : SvgIcons.send}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="aid-tabs">
          {tabs.map(({ label, icon }) => (
            <button
              key={label}
              className={`aid-tab ${activeTab === label ? "active" : ""}`}
              onClick={() => setActiveTab(label)}
            >
              {icon} {label} ▾
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AIPromptDashboard;
