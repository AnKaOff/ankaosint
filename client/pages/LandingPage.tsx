import { useState, useEffect, useRef } from "react";
import {
  useUser,
  useClerk,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/clerk-react";

// ── Theme (same as Index.tsx) ─────────────────────────────────────
const G = {
  bg:      "#000000",
  surface: "#0a0a0a",
  surf2:   "#111111",
  surf3:   "#161616",
  border:  "rgba(255,255,255,0.07)",
  bord2:   "rgba(255,255,255,0.12)",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.35)",
  dim:     "rgba(255,255,255,0.15)",
  glow:    "0 0 20px rgba(255,255,255,0.06)",
  glowHot: "0 0 24px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.06)",
};

// ── Icons ─────────────────────────────────────────────────────────
const IconSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconArrow   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconChevron = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconShield  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconUser    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSettings= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconZap     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconLock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconGlobe   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconDb      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;

// ── Platform logos (SVG inline) ───────────────────────────────────
const platforms = [
  { name: "FiveM",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { name: "Xbox",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.03 3.4C7.5 2.5 9.19 2 11 2c1.92 0 3.7.56 5.2 1.52C14.1 5.2 12.1 7.5 12 7.5c-.1 0-2.1-2.3-4.2-4.1zm-.9.8C3.3 5.8 2 8.25 2 11c0 2.3.79 4.4 2.1 6.1C5.3 14.6 7.4 12.3 9.5 10.2 8 8.4 6.4 6.7 5.13 4.2zM19.87 4.2C18.6 6.7 17 8.4 15.5 10.2c2.1 2.1 4.2 4.4 5.4 6.9C22.21 15.4 23 13.3 23 11c0-2.75-1.3-5.2-3.13-6.8zm-3.57 7.3C14.2 13.5 12.1 15.7 12 15.8c-.1-.1-2.2-2.3-4.3-4.3C9.6 9.4 11.1 7.7 12 6.8c.9.9 2.4 2.6 4.3 4.7zm-8.1 4.9C9.4 18.4 11.5 20.7 12 21.2c.5-.5 2.6-2.8 3.8-4.8-1.3-1.4-2.7-2.8-3.8-3.9-1.1 1.1-2.5 2.5-3.8 3.9z"/></svg> },
  { name: "Steam",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg> },
  { name: "Discord",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
  { name: "Microsoft", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg> },
  { name: "Minecraft", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h2V6H6zm4 0v2h2V6h-2zm4 0v2h2V6h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/></svg> },
];

// ── Account dropdown (top-right) ──────────────────────────────────
function AccountButton({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initial = isLoaded
    ? (user?.username?.[0] ?? user?.firstName?.[0] ?? "A").toUpperCase()
    : "A";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: G.surf2, border: `1px solid ${G.bord2}`,
          borderRadius: 10, padding: "7px 12px",
          cursor: "pointer", color: G.text,
          transition: "all .15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.bord2; }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: "rgba(255,255,255,0.12)",
          border: `1px solid ${G.bord2}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: G.text,
        }}>
          {initial}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {isLoaded ? (user?.username ? `@${user.username}` : user?.firstName ?? "Account") : "…"}
        </span>
        <span style={{
          color: G.dim, display: "flex",
          transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s",
        }}>
          <IconChevron />
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 46, right: 0,
          background: G.surf2, border: `1px solid ${G.bord2}`,
          borderRadius: 12, zIndex: 300, minWidth: 200, overflow: "hidden",
          boxShadow: `${G.glow}, 0 8px 32px rgba(0,0,0,.8)`,
          animation: "fadeUp .15s ease",
        }}>
          {/* User info */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${G.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: G.text }}>
              {isLoaded ? (user?.username ? `@${user.username}` : user?.fullName ?? "User") : "…"}
            </div>
            <div style={{ fontSize: 11, color: G.dim, marginTop: 2 }}>
              {isLoaded ? user?.primaryEmailAddress?.emailAddress ?? "" : ""}
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon: <IconUser />, label: "Profile", action: () => { openUserProfile(); setOpen(false); } },
            { icon: <IconSettings />, label: "Settings", action: () => setOpen(false) },
            { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: "Dashboard", action: () => { onGoToDashboard(); setOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "none", border: "none",
              color: G.muted, cursor: "pointer", fontSize: 13,
              transition: "all .1s", textAlign: "left",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = G.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = G.muted; }}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div style={{ margin: "4px 0", height: 1, background: G.border }} />

          <button onClick={() => { signOut(); setOpen(false); }} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", background: "none", border: "none",
            color: "rgba(239,68,68,0.7)", cursor: "pointer", fontSize: 13, marginBottom: 4,
            transition: "all .1s", textAlign: "left",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,1)"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <IconLogout /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: G.surface, border: `1px solid ${G.border}`,
      borderRadius: 14, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ color: G.dim, display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: G.text }}>
        {value}
      </div>
    </div>
  );
}

// ── Feature row ───────────────────────────────────────────────────
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 16,
      padding: "20px 24px",
      background: G.surface, border: `1px solid ${G.border}`,
      borderRadius: 14, transition: "border-color .2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = G.bord2)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = G.border)}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "rgba(255,255,255,0.05)", border: `1px solid ${G.bord2}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: G.muted, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: G.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: G.dim, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════════
interface LandingPageProps {
  onSearch?: (query: string) => void;
  onGoToDashboard?: () => void;
}

export default function LandingPage({ onSearch, onGoToDashboard }: LandingPageProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [query, setQuery] = useState("");
  const [placeholder] = useState("try: jordan_skywalker92");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    if (onSearch) onSearch(query.trim());
    else if (onGoToDashboard) onGoToDashboard();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{
      minHeight: "100vh", background: G.bg, color: G.text,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        *{box-sizing:border-box}
        ::placeholder{color:rgba(255,255,255,0.2)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes scrollX{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 60,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${G.border}`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.03em" }}>
            leak<span style={{ color: G.dim }}>.</span>fun
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {["Dashboard", "Documentation", "Contact"].map(link => (
            <button key={link} onClick={link === "Dashboard" ? onGoToDashboard : undefined} style={{
              background: "none", border: "none", color: G.muted,
              padding: "6px 14px", cursor: "pointer", fontSize: 14,
              borderRadius: 8, transition: "all .15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G.text; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = G.muted; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >{link}</button>
          ))}
        </div>

        {/* Account / Sign in */}
        <div>
          <SignedIn>
            <AccountButton onGoToDashboard={onGoToDashboard ?? (() => {})} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                background: G.surf2, border: `1px solid ${G.bord2}`,
                borderRadius: 10, padding: "7px 18px",
                color: G.text, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all .15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.bord2; }}
              >Sign in</button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "140px 24px 80px",
        textAlign: "center",
        animation: "fadeUp .5s ease",
      }}>

        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`,
          borderRadius: 99, padding: "5px 14px", marginBottom: 40,
          fontSize: 12, color: G.muted,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#22c55e",
            animation: "pulse 2s ease infinite",
            display: "inline-block",
          }} />
          running · 24/7
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: "clamp(48px, 7vw, 88px)",
          fontWeight: 800, letterSpacing: "-0.04em",
          lineHeight: 1.05, margin: "0 0 20px",
          maxWidth: 800,
        }}>
          Public data,{" "}
          <span style={{ color: "rgba(255,255,255,0.35)" }}>private search.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 16, color: G.dim, lineHeight: 1.7,
          maxWidth: 480, margin: "0 0 48px",
        }}>
          Start with an email, username, phone or platform ID —{" "}
          <strong style={{ color: G.muted, fontWeight: 600 }}>leak.fun</strong>{" "}
          routes it to the right search.
        </p>

        {/* Search bar */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 560,
          marginBottom: 20,
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            background: G.surf2, border: `1px solid ${G.bord2}`,
            borderRadius: 14, overflow: "hidden",
            boxShadow: `0 0 0 1px rgba(255,255,255,0.02), ${G.glow}`,
            transition: "border-color .2s, box-shadow .2s",
          }}
            onFocus={() => {}}
          >
            <span style={{ paddingLeft: 18, color: G.dim, display: "flex", flexShrink: 0 }}>
              <IconSearch />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: G.text, fontSize: 15, padding: "17px 16px",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: query.trim() ? "#fff" : "rgba(255,255,255,0.07)",
                border: "none", borderRadius: 10, margin: 6,
                width: 38, height: 38, cursor: query.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: query.trim() ? "#000" : G.dim,
                transition: "all .2s",
                flexShrink: 0,
              }}
            >
              <IconArrow />
            </button>
          </div>
        </div>

        {/* Platform scrolling strip */}
        <div style={{
          width: "100%", maxWidth: 560,
          overflow: "hidden", position: "relative",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}>
          <div style={{
            display: "flex", gap: 32, alignItems: "center",
            animation: "scrollX 18s linear infinite",
            width: "max-content",
          }}>
            {[...platforms, ...platforms].map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                color: G.dim, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              }}>
                <span style={{ opacity: 0.6 }}>{p.icon}</span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "0 48px 72px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard icon={<IconDb />} value="12B+" label="Records indexed" />
          <StatCard icon={<IconGlobe />} value="340+" label="Breach sources" />
          <StatCard icon={<IconZap />} value="<200ms" label="Avg. response time" />
          <StatCard icon={<IconShield />} value="99.9%" label="Uptime" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: G.dim, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>
            Why leak.fun
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            One query. Every source.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          <Feature
            icon={<IconZap />}
            title="Smart routing"
            desc="leak.fun detects whether your input is an email, username, phone number or platform ID and sends it to the right index automatically."
          />
          <Feature
            icon={<IconLock />}
            title="Private by design"
            desc="Searches are never logged against your identity. You see the data — the data doesn't see you."
          />
          <Feature
            icon={<IconDb />}
            title="Multi-source indexing"
            desc="Breach data, Discord, FiveM, Steam, Xbox and more — all searchable from a single interface with cross-reference support."
          />
          <Feature
            icon={<IconShield />}
            title="Credential exposure"
            desc="Surface leaked passwords, hashes, and salts across datasets so you know exactly where an account was compromised."
          />
          <Feature
            icon={<IconGlobe />}
            title="Identity graph"
            desc="Chain together email, username, IP and address fields to build a full profile from fragmented records."
          />
          <Feature
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
            title="API access"
            desc="Integrate leak.fun into your own tools via the REST API. Structured JSON, rate-limited per key, with full docs."
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "0 48px 100px", maxWidth: 1100, margin: "0 auto", width: "100%",
      }}>
        <div style={{
          background: G.surface, border: `1px solid ${G.border}`,
          borderRadius: 20, padding: "52px 56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, flexWrap: "wrap",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.02), ${G.glow}`,
        }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              Ready to search?
            </h2>
            <p style={{ color: G.dim, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Sign in and run your first lookup in under 30 seconds.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button style={{
                  background: "#fff", border: "none", borderRadius: 10,
                  color: "#000", padding: "12px 24px", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", boxShadow: G.glowHot, transition: "opacity .2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = ".85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  Get started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button onClick={onGoToDashboard} style={{
                background: "#fff", border: "none", borderRadius: 10,
                color: "#000", padding: "12px 24px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", boxShadow: G.glowHot, transition: "opacity .2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = ".85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Open dashboard →
              </button>
            </SignedIn>
            <button style={{
              background: "none", border: `1px solid ${G.bord2}`,
              borderRadius: 10, color: G.muted, padding: "12px 24px",
              fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLElement).style.color = G.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.bord2; (e.currentTarget as HTMLElement).style.color = G.muted; }}
            >
              Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${G.border}`,
        padding: "28px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>
          leak<span style={{ color: G.dim }}>.</span>fun
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Terms", "Privacy", "Status", "API"].map(l => (
            <span key={l} style={{ fontSize: 12, color: G.dim, cursor: "pointer", transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = G.muted)}
              onMouseLeave={e => (e.currentTarget.style.color = G.dim)}
            >{l}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: G.dim }}>© 2025 leak.fun</span>
      </footer>
    </div>
  );
}
