import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useUser,
  useClerk,
  SignedIn,
  SignInButton,
} from "@clerk/clerk-react";

// ── Data ─────────────────────────────────────────────────────────
const TABS = ["Identity","Contact","Address","Birth","Financial","Credentials","Identifiers"];

const TAB_FIELDS: Record<string, { label: string; placeholder: string; key: string; col: number }[]> = {
  Identity: [
    { label:"FIRST NAME",   placeholder:"Jane",        key:"firstName",  col:1 },
    { label:"LAST NAME",    placeholder:"Doe",          key:"lastName",   col:2 },
    { label:"BIRTH NAME",   placeholder:"Maiden name",  key:"birthName",  col:1 },
    { label:"DISPLAY NAME", placeholder:"janedoe",      key:"displayName",col:2 },
    { label:"USERNAME",     placeholder:"jdoe92",       key:"username",   col:1 },
    { label:"GENDER",       placeholder:"F / M",        key:"gender",     col:2 },
  ],
  Contact: [
    { label:"EMAIL",      placeholder:"jane@example.com", key:"email",  col:1 },
    { label:"PHONE",      placeholder:"+1 555 000 0000",  key:"phone",  col:2 },
    { label:"IP ADDRESS", placeholder:"192.168.x.x",      key:"ip",     col:1 },
    { label:"DOMAIN",     placeholder:"example.com",      key:"domain", col:2 },
  ],
  Address: [
    { label:"STREET",   placeholder:"123 Main St", key:"street",  col:1 },
    { label:"CITY",     placeholder:"New York",    key:"city",    col:2 },
    { label:"STATE",    placeholder:"NY",          key:"state",   col:1 },
    { label:"ZIP CODE", placeholder:"10001",       key:"zip",     col:2 },
    { label:"COUNTRY",  placeholder:"US",          key:"country", col:1 },
  ],
  Birth: [
    { label:"DATE OF BIRTH", placeholder:"YYYY-MM-DD",  key:"dob",         col:1 },
    { label:"AGE",           placeholder:"25",           key:"age",         col:2 },
    { label:"BIRTH CITY",    placeholder:"Los Angeles",  key:"birthCity",   col:1 },
    { label:"BIRTH COUNTRY", placeholder:"US",           key:"birthCountry",col:2 },
  ],
  Financial: [
    { label:"CREDIT CARD", placeholder:"4111 1111 1111 1111", key:"cc",   col:1 },
    { label:"IBAN",        placeholder:"FR76 3000...",         key:"iban", col:2 },
    { label:"BANK NAME",   placeholder:"BNP Paribas",          key:"bank", col:1 },
  ],
  Credentials: [
    { label:"PASSWORD",      placeholder:"••••••••",  key:"password", col:1 },
    { label:"PASSWORD HASH", placeholder:"md5, sha1", key:"hash",     col:2 },
    { label:"SALT",          placeholder:"abc123",    key:"salt",     col:1 },
  ],
  Identifiers: [
    { label:"USER ID",        placeholder:"123456789",   key:"userId",  col:1 },
    { label:"SSN",            placeholder:"XXX-XX-XXXX", key:"ssn",     col:2 },
    { label:"PASSPORT",       placeholder:"AB123456",    key:"passport",col:1 },
    { label:"DRIVER LICENSE", placeholder:"D12345678",   key:"license", col:2 },
  ],
};

const CONT_OPTIONS = ["CONT","EQ","START","END"];

// ── Discord link storage key ──────────────────────────────────────
const DISCORD_LINK_KEY = "anka_discord_link";
const DEFAULT_DISCORD_LINK = "https://discord.gg/pmVz9HBMMM";

function getDiscordLink(): string {
  try {
    return localStorage.getItem(DISCORD_LINK_KEY) || DEFAULT_DISCORD_LINK;
  } catch { return DEFAULT_DISCORD_LINK; }
}
function setDiscordLink(url: string): void {
  try { localStorage.setItem(DISCORD_LINK_KEY, url); } catch {}
}

// ── Support webhook storage ────────────────────────────────────────
const SUPPORT_WEBHOOK_KEY = "anka_support_webhook";
const DEFAULT_SUPPORT_WEBHOOK = "";

function getSupportWebhook(): string {
  try { return localStorage.getItem(SUPPORT_WEBHOOK_KEY) || DEFAULT_SUPPORT_WEBHOOK; } catch { return DEFAULT_SUPPORT_WEBHOOK; }
}
function setSupportWebhook(url: string): void {
  try { localStorage.setItem(SUPPORT_WEBHOOK_KEY, url); } catch {}
}

// ── Theme ─────────────────────────────────────────────────────────
const G = {
  bg:        "#000000",
  surface:   "#0a0a0a",
  surf2:     "#111111",
  surf3:     "#161616",
  surf4:     "#1c1c1c",
  border:    "rgba(255,255,255,0.07)",
  bord2:     "rgba(255,255,255,0.12)",
  bord3:     "rgba(255,255,255,0.18)",
  text:      "#ffffff",
  muted:     "rgba(255,255,255,0.45)",
  dim:       "rgba(255,255,255,0.2)",
  glow:      "0 0 20px rgba(255,255,255,0.06)",
  glowHot:   "0 0 24px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.06)",
  danger:    "rgba(239,68,68,0.9)",
  dangerBg:  "rgba(239,68,68,0.08)",
  dangerBd:  "rgba(239,68,68,0.2)",
  success:   "rgba(34,197,94,0.9)",
  successBg: "rgba(34,197,94,0.08)",
  successBd: "rgba(34,197,94,0.2)",
  warn:      "rgba(234,179,8,0.9)",
  warnBg:    "rgba(234,179,8,0.08)",
  warnBd:    "rgba(234,179,8,0.2)",
  accent:    "rgba(139,92,246,0.9)",
  accentBg:  "rgba(139,92,246,0.08)",
  accentBd:  "rgba(139,92,246,0.2)",
  discord:   "#5865F2",
  discordBg: "rgba(88,101,242,0.08)",
  discordBd: "rgba(88,101,242,0.25)",
};

// ── Icons ─────────────────────────────────────────────────────────
const IconShield    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconDiscord   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const IconFiveM     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconDashboard = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconBell      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconBook      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconCode      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IconSupport   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconSearch    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconChevron   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconArrow     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconX         = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPanel     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
const IconInfo      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconUser      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSwitch    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l5.1 5.1"/><path d="M4 4l5 5"/></svg>;
const IconLogout    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSettings  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconUsers     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconActivity  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconDatabase  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconTrend     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconCrown     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>;
const IconKey       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const IconEye       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconPlus      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconCheck     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconEdit      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconLink      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconCopy      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconExport    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconHash      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;

// ── Spinner ───────────────────────────────────────────────────────
const Spinner = ({ size = 16 }: { size?: number }) => (
  <div style={{ width:size, height:size, border:`2px solid rgba(255,255,255,0.15)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />
);

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ label, color = G.dim, bg = "rgba(255,255,255,0.06)", border = G.border }: {
  label: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", background:bg, border:`1px solid ${border}`, color, padding:"2px 8px", borderRadius:4 }}>
      {label}
    </span>
  );
}

// ── Toast notification ────────────────────────────────────────────
function Toast({ message, type = "success", onDone }: { message: string; type?: "success"|"error"|"info"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  const colors = {
    success: { bg: G.successBg, border: G.successBd, color: G.success },
    error:   { bg: G.dangerBg,  border: G.dangerBd,  color: G.danger },
    info:    { bg: G.accentBg,  border: G.accentBd,  color: G.accent },
  }[type];
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:colors.bg, border:`1px solid ${colors.border}`, color:colors.color, borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 32px rgba(0,0,0,0.6)", animation:"slideIn .2s ease", maxWidth:320 }}>
      {type === "success" && <IconCheck />}
      {type === "error"   && <IconX />}
      {type === "info"    && <IconInfo />}
      {message}
    </div>
  );
}

// ── Admin check helper ────────────────────────────────────────────
function useIsAdmin() {
  const { user } = useUser();
  return (user?.publicMetadata as any)?.role === "admin";
}

// ── Toast state hook ─────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success"|"error"|"info" } | null>(null);
  const show = useCallback((message: string, type: "success"|"error"|"info" = "success") => {
    setToast({ message, type });
  }, []);
  const hide = useCallback(() => setToast(null), []);
  return { toast, show, hide };
}

// ── NAV ──────────────────────────────────────────────────────────
const NAV_SEARCHES = [
  { path:"breach",  label:"Breach Data", icon:<IconShield /> },
  { path:"discord", label:"Discord",     icon:<IconDiscord /> },
  { path:"fivem",   label:"FiveM",       icon:<IconFiveM /> },
];

// ═══════════════════════════════════════════════════════
// AUTH GUARD
// ═══════════════════════════════════════════════════════
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (isLoaded && !isSignedIn) openSignIn();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div style={{ display:"flex", height:"100vh", background:G.bg, alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize:18, fontWeight:800, color:G.text, letterSpacing:"-0.02em" }}>AnKa OSINT</span>
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{ display:"flex", height:"100vh", background:G.bg, color:G.text, alignItems:"center", justifyContent:"center", flexDirection:"column", gap:32, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
        <style>{`*{box-sizing:border-box} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:20, padding:"48px 48px", display:"flex", flexDirection:"column", alignItems:"center", gap:24, width:"100%", maxWidth:380, boxShadow:`0 0 0 1px rgba(255,255,255,0.02), ${G.glow}`, animation:"fadeUp .35s ease" }}>
          <div style={{ textAlign:"center", marginBottom:4 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>AnKa OSINT</div>
            <div style={{ fontSize:12, color:G.dim, marginTop:6 }}>Access restricted — sign in to continue</div>
          </div>
          <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.05)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.muted }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <SignInButton mode="modal">
            <button style={{ width:"100%", background:"#fff", border:"none", borderRadius:10, color:"#000", padding:"13px 24px", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:G.glowHot, transition:"opacity .2s" }}
              onMouseEnter={e=>(e.currentTarget.style.opacity=".85")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
            >Sign in to continue</button>
          </SignInButton>
          <div style={{ fontSize:11, color:G.dim, textAlign:"center", lineHeight:1.6 }}>You need an account to access this platform.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── EmptyState ────────────────────────────────────────────────────
function EmptyState({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"56px 40px", animation:"fadeUp .3s ease" }}>
      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.04)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.dim }}>
        {icon}
      </div>
      <div style={{ color:G.text, fontSize:14, fontWeight:600 }}>{title}</div>
      <div style={{ color:G.dim, fontSize:12, textAlign:"center", maxWidth:360, lineHeight:1.7 }}>{desc}</div>
    </div>
  );
}

// ── ResultZone ────────────────────────────────────────────────────
function ResultZone({ state, results }: { state: string; results?: any[] }) {
  const { show } = useToast();
  const hasResults = state === "results" && results && results.length > 0;

  const copyRow = (row: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(row, null, 2));
      show("Row copied to clipboard", "success");
    } catch {}
  };

  const exportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "results.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop:20, background:G.surf2, borderRadius:12, border:`1px solid ${G.border}`, minHeight:200, display:"flex", flexDirection:"column", alignItems:hasResults?"flex-start":"center", justifyContent:hasResults?"flex-start":"center", padding:hasResults?"16px":0, overflowX:"auto" }}>
      {state === "loading" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"40px 0", width:"100%" }}>
          <Spinner />
          <span style={{ color:G.dim, fontSize:12, animation:"pulse 1.4s ease infinite" }}>Scanning records…</span>
        </div>
      )}
      {state === "empty" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, animation:"fadeUp .3s ease", padding:"40px 0" }}>
          <div style={{ fontSize:24, opacity:.2 }}>◎</div>
          <div style={{ color:G.muted, fontSize:14, fontWeight:500 }}>No results found</div>
          <div style={{ color:G.dim, fontSize:12 }}>Try different or broader terms</div>
        </div>
      )}
      {state === "idle" && (
        <EmptyState icon={<IconSearch />} title="Run a lookup" desc="Fill at least one field. Multiple fields are combined with AND — every record must match all of them." />
      )}
      {hasResults && (
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10, animation:"fadeUp .3s ease" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ fontSize:11, color:G.dim, letterSpacing:"0.08em", fontWeight:700 }}>
              {results!.length} RESULT{results!.length > 1 ? "S" : ""}
            </div>
            <button onClick={exportJSON} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${G.border}`, color:G.muted, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all .15s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.bord2; (e.currentTarget as HTMLElement).style.color=G.text; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.color=G.muted; }}
            ><IconExport /> Export JSON</button>
          </div>
          {results!.map((row, idx) => (
            <div key={idx} style={{ background:G.surf3, border:`1px solid ${G.border}`, borderRadius:10, padding:"12px 16px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"6px 16px", position:"relative" }}
              onMouseEnter={e=>{ const btn = (e.currentTarget as HTMLElement).querySelector(".copy-btn") as HTMLElement; if(btn) btn.style.opacity="1"; }}
              onMouseLeave={e=>{ const btn = (e.currentTarget as HTMLElement).querySelector(".copy-btn") as HTMLElement; if(btn) btn.style.opacity="0"; }}
            >
              {Object.entries(row).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize:9, letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize:13, color:G.text, wordBreak:"break-all" }}>{String(v ?? "")}</div>
                </div>
              ))}
              <button className="copy-btn" onClick={() => copyRow(row)} style={{ position:"absolute", top:10, right:10, background:G.surf4, border:`1px solid ${G.border}`, borderRadius:6, color:G.dim, padding:"4px 8px", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:4, opacity:0, transition:"opacity .15s" }}>
                <IconCopy /> Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ContDropdown ──────────────────────────────────────────────────
function ContDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position:"relative", flexShrink:0 }}>
      <button onClick={() => setOpen(!open)} style={{ background:G.surf2, border:`1px solid ${G.bord2}`, color:G.muted, padding:"0 10px", height:40, borderRadius:8, cursor:"pointer", fontSize:10, fontWeight:600, letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
        {value} <span style={{ opacity:.5, fontSize:8 }}>▼</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:46, left:0, background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:10, zIndex:200, minWidth:88, overflow:"hidden", boxShadow:`${G.glow},0 8px 32px rgba(0,0,0,.8)` }}>
          {CONT_OPTIONS.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{ padding:"9px 14px", color:opt===value?G.text:G.muted, cursor:"pointer", fontSize:11, fontWeight:opt===value?600:400, background:opt===value?"rgba(255,255,255,0.06)":"transparent", transition:"background .1s", letterSpacing:"0.06em" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}
              onMouseLeave={e=>(e.currentTarget.style.background=opt===value?"rgba(255,255,255,0.06)":"transparent")}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────
const FIELD_INPUT_STYLE: React.CSSProperties = { flex:1, background:G.surf2, border:`1px solid ${G.border}`, borderRadius:8, color:G.text, padding:"0 14px", height:40, fontSize:13, outline:"none", transition:"border .15s,box-shadow .15s", fontFamily:"inherit" };
type FieldDef = { label: string; placeholder: string; key: string; col: number };

function Field({ f, value, cont, onValueChange, onContChange }: { f?: FieldDef; value: string; cont: string; onValueChange: (v: string) => void; onContChange: (v: string) => void; }) {
  if (!f) return <div />;
  return (
    <div>
      <label style={{ display:"block", fontSize:9, letterSpacing:"0.14em", color:G.dim, marginBottom:7, fontWeight:700 }}>{f.label}</label>
      <div style={{ display:"flex", gap:6 }}>
        <input placeholder={f.placeholder} value={value} onChange={e=>onValueChange(e.target.value)} style={FIELD_INPUT_STYLE}
          onFocus={e=>{ e.target.style.border=`1px solid ${G.bord2}`; e.target.style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)"; }}
          onBlur={e=>{ e.target.style.border=`1px solid ${G.border}`; e.target.style.boxShadow="none"; }}
        />
        <ContDropdown value={cont} onChange={onContChange} />
      </div>
    </div>
  );
}

// ── Table mapping ─────────────────────────────────────────────────
const TAB_TABLE: Record<string,string> = {
  Identity:"identity", Contact:"contact", Address:"address", Birth:"birth",
  Financial:"financial", Credentials:"credentials", Identifiers:"identifiers",
};

// ── Shared sub-components ──────────────────────────────────────────
function PageHeader({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge?: { label: string; color?: string; bg?: string; border?: string } }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.06)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.muted }}>
          {icon}
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>{title}</h1>
        {badge && <Badge label={badge.label} color={badge.color} bg={badge.bg} border={badge.border} />}
      </div>
      <p style={{ fontSize:13, color:G.dim, margin:0, lineHeight:1.6, paddingLeft:46 }}>{desc}</p>
    </div>
  );
}

function SearchBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ background:"#fff", border:"none", borderRadius:9, color:"#000", padding:"0 22px", height:44, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:loading?"none":G.glowHot, transition:"all .2s", opacity:loading?.8:1, flexShrink:0 }}>
      {loading ? <Spinner /> : <><span>Search</span><IconArrow /></>}
    </button>
  );
}

function SideNavItem({ icon, label, active, sub, badge, onClick, adminOnly, external }: {
  icon: React.ReactNode; label: string; active: boolean;
  sub?: boolean; badge?: string; onClick: () => void; adminOnly?: boolean; external?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:sub?"8px 16px 8px 28px":"8px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:9,
        background:active?"rgba(255,255,255,0.06)":hov?"rgba(255,255,255,0.03)":"transparent",
        borderLeft:active?"1.5px solid #fff":"1.5px solid transparent",
        transition:"all .15s", borderRadius:"0 8px 8px 0", marginRight:8 }}>
      <span style={{ color:active?G.text:G.dim, display:"flex", alignItems:"center" }}>{icon}</span>
      <span style={{ fontSize:13, color:active?G.text:hov?G.muted:G.dim, fontWeight:active?600:400, flex:1 }}>{label}</span>
      {adminOnly && <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.1em", background:G.accentBg, border:`1px solid ${G.accentBd}`, color:G.accent, padding:"2px 6px", borderRadius:4 }}>ADMIN</span>}
      {badge && !adminOnly && <Badge label={badge} />}
      {external && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color:G.dim, flexShrink:0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>}
      {active && !external && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fff", boxShadow:"0 0 8px #fff", flexShrink:0 }} />}
    </div>
  );
}

// ── Discord sidebar button ────────────────────────────────────────
function DiscordSidebarBtn() {
  const [hov, setHov] = useState(false);
  const link = getDiscordLink();
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginRight:8 }}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ padding:"8px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:9,
          background:hov?"rgba(88,101,242,0.08)":"transparent",
          borderLeft:`1.5px solid ${hov?"rgba(88,101,242,0.5)":"transparent"}`,
          transition:"all .15s", borderRadius:"0 8px 8px 0" }}>
        <span style={{ color:hov?"#5865F2":G.dim, display:"flex", alignItems:"center", transition:"color .15s" }}><IconDiscord /></span>
        <span style={{ fontSize:13, color:hov?"#5865F2":G.dim, fontWeight:400, flex:1, transition:"color .15s" }}>Discord</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color:hov?"#5865F2":G.dim, flexShrink:0, transition:"color .15s" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════════════════
// SidebarUser
// ═══════════════════════════════════════════════════════
function SidebarUser({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { isLoaded, user } = useUser();
  const { signOut, openUserProfile, openSignIn } = useClerk();
  const isAdmin = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItem = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
    <button onClick={() => { onClick(); setMenuOpen(false); }}
      style={{ width:"100%", background:"none", border:"none", display:"flex", alignItems:"center", gap:9, padding:"9px 14px", cursor:"pointer", color:danger?G.danger:G.muted, fontSize:13, textAlign:"left", borderRadius:8, transition:"all .15s" }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=danger?G.dangerBg:"rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color=danger?G.danger:G.text; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background="none"; (e.currentTarget as HTMLElement).style.color=danger?G.danger:G.muted; }}
    >
      <span style={{ display:"flex", flexShrink:0, opacity:danger?1:.7 }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{ padding:"12px 10px", borderTop:`1px solid ${G.border}`, position:"relative" }} ref={menuRef}>
      {menuOpen && (
        <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:10, right:10, background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:12, overflow:"hidden", zIndex:300, boxShadow:"0 -8px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)", animation:"fadeUp .15s ease" }}>
          <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${G.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ fontSize:12, fontWeight:600, color:G.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1 }}>
                {isLoaded ? (user?.username ? `@${user.username}` : user?.fullName ?? "User") : "…"}
              </div>
              {isAdmin && <Badge label="ADMIN" color={G.accent} bg={G.accentBg} border={G.accentBd} />}
            </div>
            <div style={{ fontSize:11, color:G.dim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>
              {isLoaded ? (user?.primaryEmailAddress?.emailAddress ?? "") : ""}
            </div>
          </div>
          <div style={{ padding:"6px 6px" }}>
            {menuItem(<IconUser />, "Manage account", () => openUserProfile())}
            {isAdmin && menuItem(<IconCrown />, "Admin dashboard", () => onNavigate("admin"))}
            {menuItem(<IconSwitch />, "Switch account", () => openSignIn())}
          </div>
          <div style={{ borderTop:`1px solid ${G.border}`, padding:"6px 6px" }}>
            {menuItem(<IconLogout />, "Sign out", () => signOut({ redirectUrl:"/" }), true)}
          </div>
        </div>
      )}
      <SignedIn>
        <button onClick={() => setMenuOpen(o => !o)}
          style={{ width:"100%", background:menuOpen?"rgba(255,255,255,0.05)":"none", border:`1px solid ${menuOpen?G.bord2:"transparent"}`, borderRadius:9, padding:"6px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all .15s" }}
          onMouseEnter={e=>{ if(!menuOpen){ (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor=G.border; } }}
          onMouseLeave={e=>{ if(!menuOpen){ (e.currentTarget as HTMLElement).style.background="none"; (e.currentTarget as HTMLElement).style.borderColor="transparent"; } }}
        >
          {isLoaded && user?.imageUrl ? (
            <img src={user.imageUrl} alt="" style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:`1px solid ${G.bord2}` }} />
          ) : (
            <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:G.text, flexShrink:0 }}>
              {(user?.fullName || user?.username || "?").slice(0,2).toUpperCase()}
            </div>
          )}
          <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
            <div style={{ fontSize:12, fontWeight:600, color:G.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isLoaded ? (user?.username ? `@${user.username}` : user?.fullName ?? "User") : "…"}
            </div>
            <div style={{ fontSize:10, color:G.dim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {isLoaded ? (user?.primaryEmailAddress?.emailAddress ?? "") : ""}
            </div>
          </div>
          <span style={{ color:G.dim, flexShrink:0, display:"flex", transform:menuOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s" }}>
            <IconChevron />
          </span>
        </button>
      </SignedIn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Breach Data
// ═══════════════════════════════════════════════════════
function BreachPage() {
  const [activeTab, setActiveTab] = useState("Identity");
  return (
    <>
      <PageHeader icon={<IconShield />} title="Breach Data" desc="Cross-reference identity, addresses, contact and credentials across every leak we index." />
      <div style={{ background:G.surface, borderRadius:16, border:`1px solid ${G.border}`, padding:28, boxShadow:`0 0 0 1px rgba(255,255,255,0.02),${G.glow}` }}>
        <div style={{ display:"flex", marginBottom:28, borderBottom:`1px solid ${G.border}`, overflowX:"auto", gap:0 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:"none", border:"none", borderBottom:activeTab===tab?"1.5px solid #fff":"1.5px solid transparent", color:activeTab===tab?G.text:G.dim, padding:"9px 16px", cursor:"pointer", fontSize:13, fontWeight:activeTab===tab?600:400, marginBottom:-1, transition:"all .15s", letterSpacing:"-0.01em", textShadow:activeTab===tab?"0 0 20px rgba(255,255,255,.5)":"none", whiteSpace:"nowrap" }}
              onMouseEnter={e=>{ if(activeTab!==tab) (e.currentTarget as HTMLElement).style.color=G.muted; }}
              onMouseLeave={e=>{ if(activeTab!==tab) (e.currentTarget as HTMLElement).style.color=G.dim; }}
            >{tab}</button>
          ))}
        </div>
        <BreachSearchForm tab={activeTab} key={activeTab} />
      </div>
    </>
  );
}

function BreachSearchForm({ tab }: { tab: string }) {
  const fields = TAB_FIELDS[tab] || [];
  const [values, setValues] = useState<Record<string,string>>({});
  const [conts, setConts] = useState<Record<string,string>>({});
  const [state, setState] = useState("idle");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const col1 = fields.filter(f => f.col === 1);
  const col2 = fields.filter(f => f.col === 2);
  const rows = Math.max(col1.length, col2.length);

  const handleSearch = async () => {
    const hasAtLeastOne = Object.values(values).some(v => v && v.trim() !== "");
    if (!hasAtLeastOne) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/breach/search", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ table:TAB_TABLE[tab], values, conts }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Error ${res.status}`);
      }
      const data = await res.json();
      const r = data.results || [];
      setResults(r);
      setState(r.length > 0 ? "results" : "empty");
    } catch (err: any) {
      setError(err?.message || "Search error");
      setResults([]);
      setState("empty");
    }
  };

  const handleClear = () => { setValues({}); setConts({}); setResults([]); setError(null); setState("idle"); };

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"18px 28px" }}>
        {Array.from({ length:rows }).map((_, i) => {
          const f1 = col1[i], f2 = col2[i];
          return (
            <React.Fragment key={i}>
              <Field f={f1} value={f1?(values[f1.key]||""):""} cont={f1?(conts[f1.key]||"CONT"):"CONT"} onValueChange={v=>f1&&setValues(p=>({...p,[f1.key]:v}))} onContChange={v=>f1&&setConts(p=>({...p,[f1.key]:v}))} />
              <Field f={f2} value={f2?(values[f2.key]||""):""} cont={f2?(conts[f2.key]||"CONT"):"CONT"} onValueChange={v=>f2&&setValues(p=>({...p,[f2.key]:v}))} onContChange={v=>f2&&setConts(p=>({...p,[f2.key]:v}))} />
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, marginTop:24 }}>
        <button onClick={handleClear} style={{ background:"none", border:"none", color:G.dim, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:5, padding:"0 8px", height:40, borderRadius:8 }}
          onMouseEnter={e=>(e.currentTarget.style.color=G.muted)} onMouseLeave={e=>(e.currentTarget.style.color=G.dim)}>
          <IconX /> Clear all
        </button>
        <SearchBtn loading={state==="loading"} onClick={handleSearch} />
      </div>
      {error && <div style={{ marginTop:14, color:G.danger, background:G.dangerBg, border:`1px solid ${G.dangerBd}`, borderRadius:8, padding:"10px 14px", fontSize:12 }}>{error}</div>}
      <ResultZone state={state} results={results} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Discord Search
// ═══════════════════════════════════════════════════════
function DiscordPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("idle");

  const handleSearch = () => {
    if (!query.trim()) return;
    setState("loading");
    setTimeout(() => setState("empty"), 900);
  };

  const discordLink = getDiscordLink();

  return (
    <>
      <PageHeader icon={<IconDiscord />} title="Discord lookup" desc="Pull a full Discord profile from a userId, or filter messages with the search DSL." />

      {/* Community banner */}
      <a href={discordLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:20 }}>
        <div style={{ background:G.discordBg, border:`1px solid ${G.discordBd}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(88,101,242,0.14)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(88,101,242,0.4)"; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=G.discordBg; (e.currentTarget as HTMLElement).style.borderColor=G.discordBd; }}
        >
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(88,101,242,0.15)", border:`1px solid rgba(88,101,242,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#5865F2", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#5865F2" }}>Join our Discord community</div>
            <div style={{ fontSize:11, color:"rgba(88,101,242,0.65)", marginTop:1 }}>Get support, updates and connect with the team →</div>
          </div>
          <span style={{ marginLeft:"auto", color:"#5865F2", opacity:.7, display:"flex" }}><IconArrow /></span>
        </div>
      </a>

      <div style={{ background:G.surface, borderRadius:16, border:`1px solid ${G.border}`, padding:28, boxShadow:`0 0 0 1px rgba(255,255,255,0.02),${G.glow}` }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:10, padding:"0 14px", height:44, gap:10 }}>
            <span style={{ color:G.dim, display:"flex", alignItems:"center", flexShrink:0 }}><IconSearch /></span>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Discord userId, or DSL query — e.g. content:hello has:image"
              style={{ flex:1, background:"none", border:"none", outline:"none", color:G.text, fontSize:13, fontFamily:"'JetBrains Mono','Fira Code',monospace", letterSpacing:"-0.01em" }} />
            <span style={{ background:G.surf3, border:`1px solid ${G.border}`, color:G.dim, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.1em", flexShrink:0 }}>DSL</span>
          </div>
          <button style={{ background:G.surf2, border:`1px solid ${G.border}`, color:G.muted, height:44, padding:"0 14px", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
            <IconInfo /> Syntax
          </button>
          <SearchBtn loading={state==="loading"} onClick={handleSearch} />
        </div>
        <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
          {["content:hello","has:image","from:userId","in:channelId","guild:guildId"].map(chip=>(
            <button key={chip} onClick={()=>setQuery(q=>q?q+" "+chip:chip)}
              style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${G.border}`, color:G.dim, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"monospace", transition:"all .15s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=G.muted; (e.currentTarget as HTMLElement).style.borderColor=G.bord2; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=G.dim; (e.currentTarget as HTMLElement).style.borderColor=G.border; }}
            >{chip}</button>
          ))}
        </div>
        <ResultZone state={state} />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: FiveM
// ═══════════════════════════════════════════════════════
function FiveMPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("idle");
  const [filterType, setFilterType] = useState<string | null>(null);

  const FILTER_TYPES = ["Discord ID","FiveM ID","Steam ID","Xbox ID","License","IP Address"];

  const handleSearch = () => {
    if (!query.trim()) return;
    setState("loading");
    setTimeout(() => setState("empty"), 900);
  };

  return (
    <>
      <PageHeader icon={<IconFiveM />} title="FiveM lookup" desc="Cross-reference FiveM, Discord, Steam, Xbox and license identifiers across the indexed databases." />
      <div style={{ background:G.surface, borderRadius:16, border:`1px solid ${G.border}`, padding:28, boxShadow:`0 0 0 1px rgba(255,255,255,0.02),${G.glow}` }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:10, padding:"0 14px", height:44, gap:10 }}>
            <span style={{ color:G.dim, display:"flex", alignItems:"center", flexShrink:0 }}><IconSearch /></span>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
              placeholder="Discord / FiveM / Steam / Xbox ID, license, IP…"
              style={{ flex:1, background:"none", border:"none", outline:"none", color:G.text, fontSize:13, fontFamily:"inherit" }} />
          </div>
          <SearchBtn loading={state==="loading"} onClick={handleSearch} />
        </div>
        <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
          {FILTER_TYPES.map(t=>(
            <button key={t} onClick={()=>setFilterType(filterType===t?null:t)}
              style={{ background:filterType===t?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${filterType===t?G.bord3:G.border}`, color:filterType===t?G.text:G.dim, borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:filterType===t?600:400, cursor:"pointer", transition:"all .15s" }}
            >{t}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:20 }}>
          {[["2.4B+","Identifiers indexed"],["18","Databases"],["2 hrs ago","Last update"]].map(([val, label])=>(
            <div key={label} style={{ background:G.surf2, borderRadius:10, border:`1px solid ${G.border}`, padding:"14px 18px" }}>
              <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", color:G.text }}>{val}</div>
              <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
        <ResultZone state={state} />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Dashboard
// ═══════════════════════════════════════════════════════
function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useUser();
  const isAdmin = useIsAdmin();

  const stats = [
    { label:"Searches today",    value:"—",    icon:<IconSearch />,   color:G.text },
    { label:"Databases indexed", value:"18",   icon:<IconDatabase />, color:G.text },
    { label:"Records available", value:"2.4B+",icon:<IconTrend />,    color:G.text },
    { label:"Last update",       value:"2h ago",icon:<IconActivity />, color:G.text },
  ];

  const quickLinks = [
    { label:"Breach Data",     desc:"Search leaked records",             path:"breach",   icon:<IconShield /> },
    { label:"Discord lookup",  desc:"Profile & message search",          path:"discord",  icon:<IconDiscord /> },
    { label:"FiveM lookup",    desc:"Cross-reference game identifiers",  path:"fivem",    icon:<IconFiveM /> },
    { label:"Watchlist",       desc:"Monitor targets automatically",     path:"watchlist",icon:<IconBell />, soon:true },
  ];

  const discordLink = getDiscordLink();

  return (
    <>
      <PageHeader
        icon={<IconDashboard />}
        title="Dashboard"
        desc={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}. Here's an overview of the platform.`}
      />

      {isAdmin && (
        <div style={{ marginBottom:16, background:G.accentBg, border:`1px solid ${G.accentBd}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
          onClick={() => onNavigate("admin")}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(139,92,246,0.12)")}
          onMouseLeave={e=>(e.currentTarget.style.background=G.accentBg)}
        >
          <span style={{ color:G.accent, display:"flex" }}><IconCrown /></span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:G.accent }}>Admin access detected</div>
            <div style={{ fontSize:11, color:"rgba(139,92,246,0.7)" }}>You have administrator privileges — click to open the Admin Dashboard.</div>
          </div>
          <span style={{ marginLeft:"auto", color:G.accent, display:"flex" }}><IconArrow /></span>
        </div>
      )}

      {/* Discord community banner */}
      <a href={discordLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:20 }}>
        <div style={{ background:G.discordBg, border:`1px solid ${G.discordBd}`, borderRadius:12, padding:"13px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(88,101,242,0.14)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(88,101,242,0.4)"; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=G.discordBg; (e.currentTarget as HTMLElement).style.borderColor=G.discordBd; }}
        >
          <span style={{ color:"#5865F2", display:"flex" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></span>
          <span style={{ fontSize:13, fontWeight:500, color:"#5865F2" }}>Join our Discord community — support, updates, and the team are there.</span>
          <span style={{ marginLeft:"auto", color:"#5865F2", opacity:.7, display:"flex" }}><IconArrow /></span>
        </div>
      </a>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ color:G.dim, display:"flex" }}>{s.icon}</span>
              <span style={{ fontSize:10, letterSpacing:"0.1em", color:G.dim, fontWeight:700 }}>{s.label.toUpperCase()}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24 }}>
        <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:16 }}>QUICK ACCESS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {quickLinks.map(l => (
            <div key={l.path} onClick={() => !l.soon && onNavigate(l.path)}
              style={{ background:G.surf2, border:`1px solid ${G.border}`, borderRadius:12, padding:"16px 18px", cursor:l.soon?"default":"pointer", display:"flex", alignItems:"flex-start", gap:12, transition:"all .15s", opacity:l.soon?0.6:1 }}
              onMouseEnter={e=>{ if(!l.soon) { (e.currentTarget as HTMLElement).style.background=G.surf3; (e.currentTarget as HTMLElement).style.borderColor=G.bord2; } }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=G.surf2; (e.currentTarget as HTMLElement).style.borderColor=G.border; }}
            >
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.06)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.muted, flexShrink:0 }}>{l.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{l.label}</span>
                  {l.soon && <Badge label="SOON" />}
                </div>
                <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{l.desc}</div>
              </div>
              {!l.soon && <span style={{ color:G.dim, display:"flex", alignItems:"center", flexShrink:0, marginTop:2 }}><IconArrow /></span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Watchlist
// ═══════════════════════════════════════════════════════
function WatchlistPage() {
  const [items, setItems] = useState([
    { id:1, type:"Email", value:"john.doe@example.com", added:"2025-06-01", hits:3 },
    { id:2, type:"Username", value:"jdoe92", added:"2025-06-03", hits:0 },
  ]);
  const [newType, setNewType] = useState("Email");
  const [newValue, setNewValue] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!newValue.trim()) return;
    setAdding(true);
    setTimeout(() => {
      setItems(prev => [...prev, { id:Date.now(), type:newType, value:newValue.trim(), added:new Date().toISOString().split("T")[0], hits:0 }]);
      setNewValue("");
      setAdding(false);
    }, 600);
  };

  const handleRemove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <>
      <PageHeader icon={<IconBell />} title="Watchlist" desc="Monitor specific identifiers — get alerted when new records appear in freshly indexed databases." badge={{ label:"BETA", color:G.warn, bg:G.warnBg, border:G.warnBd }} />

      {/* Add item */}
      <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24, marginBottom:20 }}>
        <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:14 }}>ADD TO WATCHLIST</div>
        <div style={{ display:"flex", gap:10 }}>
          <select value={newType} onChange={e=>setNewType(e.target.value)}
            style={{ background:G.surf2, border:`1px solid ${G.bord2}`, color:G.text, padding:"0 12px", height:44, borderRadius:10, fontSize:13, cursor:"pointer", outline:"none", fontFamily:"inherit" }}>
            {["Email","Username","IP","Discord ID","Steam ID","Phone"].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <input value={newValue} onChange={e=>setNewValue(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()}
            placeholder="Value to monitor…"
            style={{ flex:1, background:G.surf2, border:`1px solid ${G.border}`, borderRadius:10, color:G.text, padding:"0 14px", height:44, fontSize:13, outline:"none", fontFamily:"inherit", transition:"border .15s" }}
            onFocus={e=>{e.target.style.borderColor=G.bord2;}}
            onBlur={e=>{e.target.style.borderColor=G.border;}}
          />
          <button onClick={handleAdd} disabled={adding||!newValue.trim()}
            style={{ background:"#fff", border:"none", borderRadius:10, color:"#000", padding:"0 20px", height:44, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all .2s", opacity:(!newValue.trim()||adding)?0.5:1 }}>
            {adding ? <Spinner size={14} /> : <><IconPlus /><span>Add</span></>}
          </button>
        </div>
      </div>

      {/* Items list */}
      <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24 }}>
        <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:14 }}>MONITORED ITEMS — {items.length}</div>
        {items.length === 0 ? (
          <EmptyState icon={<IconBell />} title="Nothing to monitor" desc="Add identifiers above to start tracking them across newly indexed databases." />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {items.map(item => (
              <div key={item.id} style={{ background:G.surf2, border:`1px solid ${G.border}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <Badge label={item.type} color={G.muted} />
                <span style={{ fontSize:13, color:G.text, fontFamily:"monospace", flex:1 }}>{item.value}</span>
                <span style={{ fontSize:11, color:G.dim }}>Since {item.added}</span>
                {item.hits > 0 ? (
                  <span style={{ fontSize:11, fontWeight:700, color:G.success, background:G.successBg, border:`1px solid ${G.successBd}`, padding:"2px 8px", borderRadius:6 }}>{item.hits} hit{item.hits>1?"s":""}</span>
                ) : (
                  <span style={{ fontSize:11, color:G.dim }}>No hits yet</span>
                )}
                <button onClick={() => handleRemove(item.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:G.dim, display:"flex", alignItems:"center", padding:4, borderRadius:6, transition:"all .15s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=G.danger; (e.currentTarget as HTMLElement).style.background=G.dangerBg; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=G.dim; (e.currentTarget as HTMLElement).style.background="none"; }}
                ><IconTrash /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Documentation
// ═══════════════════════════════════════════════════════
function DocsPage() {
  const [activeDoc, setActiveDoc] = useState("overview");

  const docs: Record<string, { title: string; content: React.ReactNode }> = {
    overview: {
      title: "Overview",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <DocSection title="What is AnKa OSINT?">
            AnKa OSINT is a cross-database lookup platform for OSINT investigations. It allows you to search billions of leaked and indexed records across multiple data sources — identity, contact, address, financial, credentials, and game identifiers.
          </DocSection>
          <DocSection title="Getting started">
            Navigate to any search module using the left sidebar. Select the category of data you're looking for, fill in at least one field, and click <strong>Search</strong>. Results are pulled in real-time from our indexed databases.
          </DocSection>
          <DocSection title="Search operators">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                ["CONT", "Contains — the field contains the value anywhere"],
                ["EQ",   "Equals — exact match only"],
                ["START","Starts with — the field begins with the value"],
                ["END",  "Ends with — the field ends with the value"],
              ].map(([op, desc]) => (
                <div key={op} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <code style={{ background:G.surf3, border:`1px solid ${G.border}`, color:G.text, padding:"2px 8px", borderRadius:6, fontSize:12, flexShrink:0, fontFamily:"monospace" }}>{op}</code>
                  <span style={{ fontSize:13, color:G.muted, lineHeight:1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </DocSection>
        </div>
      ),
    },
    breach: {
      title: "Breach Data",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <DocSection title="Breach Data module">
            Search across 7 categories of leaked data: Identity, Contact, Address, Birth, Financial, Credentials, and Identifiers. Each category maps to a separate database table for performance.
          </DocSection>
          <DocSection title="Combining fields">
            All filled fields in a single search are combined with AND logic — every returned record must match all conditions. To search with OR logic, run separate queries.
          </DocSection>
        </div>
      ),
    },
    discord: {
      title: "Discord lookup",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <DocSection title="User lookup">
            Enter a Discord user ID to retrieve the indexed profile data, historical usernames, and cross-referenced accounts.
          </DocSection>
          <DocSection title="DSL syntax">
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[["content:hello","Messages containing 'hello'"],["has:image","Messages with attachments"],["from:userId","Messages from a specific user"],["in:channelId","Messages in a specific channel"],["guild:guildId","Messages in a specific guild"]].map(([syn,desc])=>(
                <div key={syn} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <code style={{ background:G.surf3, border:`1px solid ${G.border}`, color:G.text, padding:"2px 8px", borderRadius:6, fontSize:12, flexShrink:0, fontFamily:"monospace" }}>{syn}</code>
                  <span style={{ fontSize:13, color:G.muted }}>{desc}</span>
                </div>
              ))}
            </div>
          </DocSection>
        </div>
      ),
    },
  };

  return (
    <>
      <PageHeader icon={<IconBook />} title="Documentation" desc="Everything you need to use AnKa OSINT effectively." />
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20 }}>
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:"12px 0", height:"fit-content" }}>
          {Object.entries(docs).map(([key, doc]) => (
            <SideNavItem key={key} icon={<IconBook />} label={doc.title} active={activeDoc===key} onClick={()=>setActiveDoc(key)} />
          ))}
        </div>
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:28 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 24px", letterSpacing:"-0.02em" }}>{docs[activeDoc]?.title}</h2>
          {docs[activeDoc]?.content}
        </div>
      </div>
    </>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:700, color:G.text, marginBottom:10, letterSpacing:"-0.01em" }}>{title}</div>
      <div style={{ fontSize:13, color:G.muted, lineHeight:1.8 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Support
// ═══════════════════════════════════════════════════════
function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const discordLink = getDiscordLink();
  const { user, isLoaded } = useUser();

  const discordAccount = user?.externalAccounts?.find(a => a.provider === "discord");
  const discordHandle = discordAccount
    ? (discordAccount.username || `${discordAccount.firstName ?? ""} ${discordAccount.lastName ?? ""}`.trim() || discordAccount.providerUserId)
    : null;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const identityLabel = discordHandle ? `Discord: ${discordHandle}` : (email ? `Email: ${email}` : "Unknown user");

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");

    const webhookUrl = getSupportWebhook();

    if (!webhookUrl) {
      // No webhook configured — fall back to local-only confirmation
      setTimeout(() => { setSending(false); setSent(true); }, 800);
      return;
    }

    try {
      const payload = {
        username: "AnKa Support",
        embeds: [
          {
            title: `New support ticket — ${subject.trim()}`,
            description: message.trim(),
            color: 0x8b5cf6,
            fields: [
              { name: "From", value: identityLabel, inline: true },
              ...(discordHandle && email ? [{ name: "Email", value: email, inline: true }] : []),
              { name: "User ID", value: user?.id ?? "unknown", inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
      setSent(true);
    } catch (e) {
      setError("Couldn't deliver your message. Please try again or use Discord.");
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    { q:"How often is the data updated?", a:"Databases are refreshed every few hours as new leaks are indexed and processed." },
    { q:"Can I export results?", a:"Yes — use the Export JSON button above any result set to download the data." },
    { q:"Why are some modules showing 'SOON'?", a:"Watchlist and API Reference are in active development and will be available shortly." },
    { q:"How do I become an admin?", a:"Admin roles are assigned manually by the platform operator via Clerk's user metadata." },
    { q:"How do I join the Discord?", a:"Click the Discord button in the sidebar or the banners on the Dashboard and Discord pages." },
  ];

  return (
    <>
      <PageHeader icon={<IconSupport />} title="Support" desc="Browse the FAQ or send us a message — we'll get back to you shortly." />

      {/* Discord CTA */}
      <a href={discordLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:20 }}>
        <div style={{ background:G.discordBg, border:`1px solid ${G.discordBd}`, borderRadius:12, padding:"13px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background="rgba(88,101,242,0.14)"; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=G.discordBg; }}
        >
          <span style={{ color:"#5865F2", display:"flex" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></span>
          <span style={{ fontSize:13, fontWeight:500, color:"#5865F2" }}>Need faster support? Join the Discord community for real-time help.</span>
          <span style={{ marginLeft:"auto", color:"#5865F2", opacity:.7, display:"flex" }}><IconArrow /></span>
        </div>
      </a>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* FAQ */}
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:16 }}>FAQ</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:16 }}>SEND A MESSAGE</div>
          {sent ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"40px 0", animation:"fadeUp .3s ease" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:G.successBg, border:`1px solid ${G.successBd}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.success }}><IconCheck /></div>
              <div style={{ fontSize:14, fontWeight:600, color:G.text }}>Message sent</div>
              <div style={{ fontSize:12, color:G.dim, textAlign:"center" }}>We'll reply to your email address on file.</div>
              <button onClick={()=>{ setSent(false); setSubject(""); setMessage(""); }} style={{ background:"none", border:`1px solid ${G.border}`, color:G.muted, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Send another</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:G.surf2, border:`1px solid ${G.border}`, borderRadius:8, fontSize:11, color:G.dim }}>
                <span style={{ color:G.muted, display:"flex" }}><IconUser /></span>
                Sending as <span style={{ color:G.text, fontWeight:600 }}>{isLoaded ? identityLabel : "…"}</span>
              </div>
              <div>
                <label style={{ display:"block", fontSize:9, letterSpacing:"0.14em", color:G.dim, marginBottom:6, fontWeight:700 }}>SUBJECT</label>
                <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief description…"
                  style={{ width:"100%", background:G.surf2, border:`1px solid ${G.border}`, borderRadius:8, color:G.text, padding:"0 14px", height:40, fontSize:13, outline:"none", fontFamily:"inherit", transition:"border .15s", boxSizing:"border-box" }}
                  onFocus={e=>{e.target.style.borderColor=G.bord2;}} onBlur={e=>{e.target.style.borderColor=G.border;}} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:9, letterSpacing:"0.14em", color:G.dim, marginBottom:6, fontWeight:700 }}>MESSAGE</label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your issue or question…" rows={5}
                  style={{ width:"100%", background:G.surf2, border:`1px solid ${G.border}`, borderRadius:8, color:G.text, padding:"10px 14px", fontSize:13, outline:"none", fontFamily:"inherit", resize:"vertical", transition:"border .15s", boxSizing:"border-box" }}
                  onFocus={e=>{e.target.style.borderColor=G.bord2;}} onBlur={e=>{e.target.style.borderColor=G.border;}} />
              </div>
              {error && (
                <div style={{ background:G.dangerBg, border:`1px solid ${G.dangerBd}`, color:G.danger, borderRadius:8, padding:"8px 12px", fontSize:12 }}>{error}</div>
              )}
              <button onClick={handleSend} disabled={sending||!subject.trim()||!message.trim()}
                style={{ background:"#fff", border:"none", borderRadius:9, color:"#000", padding:"0 22px", height:44, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, justifyContent:"center", boxShadow:G.glowHot, transition:"all .2s", opacity:(sending||!subject.trim()||!message.trim())?0.5:1 }}>
                {sending ? <><Spinner size={14} /><span>Sending…</span></> : <><span>Send message</span><IconArrow /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1px solid ${G.border}`, borderRadius:10, overflow:"hidden" }}>
      <button onClick={()=>setOpen(!open)} style={{ width:"100%", background:"none", border:"none", padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
        <span style={{ flex:1, fontSize:13, fontWeight:500, color:G.text }}>{q}</span>
        <span style={{ color:G.dim, display:"flex", transform:open?"rotate(180deg)":"", transition:"transform .2s" }}><IconChevron /></span>
      </button>
      {open && <div style={{ padding:"12px 14px", fontSize:12, color:G.muted, lineHeight:1.7, borderTop:`1px solid ${G.border}` }}>{a}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE: Admin Dashboard
// ═══════════════════════════════════════════════════════
function AdminDashboardPage() {
  const [activeAdminTab, setActiveAdminTab] = useState<"overview"|"users"|"logs"|"keys"|"settings">("overview");
  const [discordLinkInput, setDiscordLinkInput] = useState(getDiscordLink());
  const [linkSaved, setLinkSaved] = useState(false);
  const [webhookInput, setWebhookInput] = useState(getSupportWebhook());
  const [webhookSaved, setWebhookSaved] = useState(false);
  const { show: showToast } = useToast();

  // Mock data
  const mockUsers = [
    { id:"user_01", name:"Alice Martin", email:"alice@example.com", role:"admin", joined:"2025-05-10", searches:142, status:"active" },
    { id:"user_02", name:"Bob Durand",   email:"bob@example.com",   role:"user",  joined:"2025-05-14", searches:38,  status:"active" },
    { id:"user_03", name:"Clara Smith",  email:"clara@example.com", role:"user",  joined:"2025-05-20", searches:5,   status:"suspended" },
    { id:"user_04", name:"David Lee",    email:"david@example.com", role:"user",  joined:"2025-06-01", searches:91,  status:"active" },
  ];

  const mockLogs = [
    { ts:"2025-06-12 14:32:08", user:"alice@example.com", action:"Search", detail:"Breach / Identity — firstName: Jane" },
    { ts:"2025-06-12 14:15:44", user:"bob@example.com",   action:"Search", detail:"Discord — userId: 123456789" },
    { ts:"2025-06-12 13:58:12", user:"david@example.com", action:"Search", detail:"FiveM — Steam ID: 76561..." },
    { ts:"2025-06-12 13:40:00", user:"alice@example.com", action:"Login",  detail:"Session created" },
    { ts:"2025-06-12 13:22:55", user:"clara@example.com", action:"Banned", detail:"Account suspended by admin" },
  ];

  const mockKeys = [
    { id:"key_1", name:"Production key", prefix:"anka_prod_***", created:"2025-05-01", lastUsed:"today", requests:12540 },
    { id:"key_2", name:"Staging key",    prefix:"anka_stg_***",  created:"2025-05-15", lastUsed:"3d ago", requests:204 },
  ];

  const adminStats = [
    { label:"Total users",   value:mockUsers.length.toString(),  icon:<IconUsers />,   delta:"+2 this week" },
    { label:"Searches today",value:"236",                        icon:<IconSearch />,  delta:"+18% vs yesterday" },
    { label:"Active sessions",value:"7",                         icon:<IconActivity />,delta:"live" },
    { label:"DB records",    value:"2.4B",                       icon:<IconDatabase />,delta:"Updated 2h ago" },
  ];

  const ADMIN_TABS: { key: typeof activeAdminTab; label: string; icon: React.ReactNode }[] = [
    { key:"overview",  label:"Overview",   icon:<IconDashboard /> },
    { key:"users",     label:"Users",      icon:<IconUsers /> },
    { key:"logs",      label:"Audit logs", icon:<IconActivity /> },
    { key:"keys",      label:"API Keys",   icon:<IconKey /> },
    { key:"settings",  label:"Settings",   icon:<IconSettings /> },
  ];

  const handleSaveDiscordLink = () => {
    const trimmed = discordLinkInput.trim();
    if (!trimmed.startsWith("http")) {
      showToast("Please enter a valid URL (must start with http)", "error");
      return;
    }
    setDiscordLink(trimmed);
    setLinkSaved(true);
    showToast("Discord link updated — visible immediately to all users", "success");
    setTimeout(() => setLinkSaved(false), 3000);
  };

  const handleResetDiscordLink = () => {
    setDiscordLinkInput(DEFAULT_DISCORD_LINK);
    setDiscordLink(DEFAULT_DISCORD_LINK);
    showToast("Discord link reset to default", "info");
  };

  const handleSaveWebhook = () => {
    const trimmed = webhookInput.trim();
    if (trimmed && !trimmed.startsWith("http")) {
      showToast("Please enter a valid webhook URL (must start with http)", "error");
      return;
    }
    setSupportWebhook(trimmed);
    setWebhookSaved(true);
    showToast(trimmed ? "Support webhook updated" : "Support webhook cleared — tickets won't be forwarded", "success");
    setTimeout(() => setWebhookSaved(false), 3000);
  };

  const handleClearWebhook = () => {
    setWebhookInput("");
    setSupportWebhook("");
    showToast("Support webhook cleared", "info");
  };

  const handleTestWebhook = async () => {
    const trimmed = webhookInput.trim();
    if (!trimmed) { showToast("Set a webhook URL first", "error"); return; }
    try {
      const res = await fetch(trimmed, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "AnKa Support",
          embeds: [{ title: "Webhook test", description: "This is a test message from the AnKa admin dashboard.", color: 0x22c55e }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      showToast("Test message sent — check your Discord channel", "success");
    } catch {
      showToast("Failed to reach webhook. Check the URL and try again.", "error");
    }
  };

  return (
    <>
      <PageHeader
        icon={<IconCrown />}
        title="Admin Dashboard"
        desc="Platform administration — manage users, monitor activity and configure access."
        badge={{ label:"ADMIN", color:G.accent, bg:G.accentBg, border:G.accentBd }}
      />

      {/* Admin tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:24, background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:4 }}>
        {ADMIN_TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveAdminTab(t.key)}
            style={{ flex:1, background:activeAdminTab===t.key?"rgba(255,255,255,0.08)":"none", border:`1px solid ${activeAdminTab===t.key?G.bord2:"transparent"}`, borderRadius:8, color:activeAdminTab===t.key?G.text:G.dim, padding:"9px 16px", cursor:"pointer", fontSize:12, fontWeight:activeAdminTab===t.key?600:400, display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all .15s" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeAdminTab === "overview" && (
        <div style={{ animation:"fadeUp .25s ease" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {adminStats.map(s=>(
              <div key={s.label} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ color:G.accent, display:"flex" }}>{s.icon}</span>
                  <span style={{ fontSize:10, letterSpacing:"0.1em", color:G.dim, fontWeight:700 }}>{s.label.toUpperCase()}</span>
                </div>
                <div style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.04em", marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:11, color:G.dim }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24 }}>
            <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:16 }}>RECENT ACTIVITY</div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {mockLogs.slice(0,4).map((log, i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:i<3?`1px solid ${G.border}`:"none" }}>
                  <span style={{ fontSize:11, color:G.dim, fontFamily:"monospace", flexShrink:0, width:130 }}>{log.ts.split(" ")[1]}</span>
                  <Badge label={log.action} color={log.action==="Banned"?G.danger:log.action==="Login"?G.success:G.muted} bg={log.action==="Banned"?G.dangerBg:log.action==="Login"?G.successBg:"rgba(255,255,255,0.04)"} border={log.action==="Banned"?G.dangerBd:log.action==="Login"?G.successBd:G.border} />
                  <span style={{ fontSize:12, color:G.muted, flex:1 }}><span style={{ color:G.text }}>{log.user}</span> — {log.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeAdminTab === "users" && (
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24, animation:"fadeUp .25s ease" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>ALL USERS — {mockUsers.length}</div>
            <button style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${G.bord2}`, color:G.muted, padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
              <IconPlus /> Invite user
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {mockUsers.map(u=>(
              <div key={u.id} style={{ background:G.surf2, border:`1px solid ${G.border}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:G.text, flexShrink:0 }}>
                  {u.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:G.text }}>{u.name}</div>
                  <div style={{ fontSize:11, color:G.dim }}>{u.email}</div>
                </div>
                <span style={{ fontSize:11, color:G.dim, flexShrink:0 }}>{u.searches} searches</span>
                <Badge label={u.role.toUpperCase()} color={u.role==="admin"?G.accent:G.dim} bg={u.role==="admin"?G.accentBg:"rgba(255,255,255,0.04)"} border={u.role==="admin"?G.accentBd:G.border} />
                <Badge label={u.status.toUpperCase()} color={u.status==="active"?G.success:G.danger} bg={u.status==="active"?G.successBg:G.dangerBg} border={u.status==="active"?G.successBd:G.dangerBd} />
                <button style={{ background:"none", border:"none", cursor:"pointer", color:G.dim, display:"flex", alignItems:"center", padding:4, borderRadius:6, transition:"all .15s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=G.muted; (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=G.dim; (e.currentTarget as HTMLElement).style.background="none"; }}>
                  <IconSettings />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit logs */}
      {activeAdminTab === "logs" && (
        <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24, animation:"fadeUp .25s ease" }}>
          <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700, marginBottom:16 }}>AUDIT LOG — LAST 24H</div>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {mockLogs.map((log, i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<mockLogs.length-1?`1px solid ${G.border}`:"none" }}>
                <span style={{ fontSize:11, color:G.dim, fontFamily:"monospace", flexShrink:0, width:160 }}>{log.ts}</span>
                <Badge label={log.action} color={log.action==="Banned"?G.danger:log.action==="Login"?G.success:G.muted} bg={log.action==="Banned"?G.dangerBg:log.action==="Login"?G.successBg:"rgba(255,255,255,0.04)"} border={log.action==="Banned"?G.dangerBd:log.action==="Login"?G.successBd:G.border} />
                <span style={{ fontSize:12, color:G.muted, flex:1 }}><span style={{ color:G.text }}>{log.user}</span> — {log.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeAdminTab === "keys" && (
        <div style={{ animation:"fadeUp .25s ease" }}>
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:24, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:11, letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>API KEYS</div>
              <button style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${G.bord2}`, color:G.muted, padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
                <IconPlus /> Generate key
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {mockKeys.map(k=>(
                <div key={k.id} style={{ background:G.surf2, border:`1px solid ${G.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:G.accentBg, border:`1px solid ${G.accentBd}`, display:"flex", alignItems:"center", justifyContent:"center", color:G.accent, flexShrink:0 }}><IconKey /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:G.text }}>{k.name}</div>
                    <code style={{ fontSize:11, color:G.dim, fontFamily:"monospace" }}>{k.prefix}</code>
                  </div>
                  <div style={{ fontSize:11, color:G.dim, textAlign:"right" }}>
                    <div>Created {k.created}</div>
                    <div>Last used {k.lastUsed}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:G.text, textAlign:"right", minWidth:80 }}>
                    {k.requests.toLocaleString()}
                    <div style={{ fontSize:10, color:G.dim, fontWeight:400 }}>requests</div>
                  </div>
                  <button style={{ background:"none", border:`1px solid ${G.dangerBd}`, cursor:"pointer", color:G.danger, display:"flex", alignItems:"center", padding:"6px 10px", borderRadius:6, gap:5, fontSize:11, transition:"all .15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=G.dangerBg;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="none";}}>
                    <IconTrash /> Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:G.warnBg, border:`1px solid ${G.warnBd}`, borderRadius:12, padding:"12px 16px", fontSize:12, color:G.warn }}>
            ⚠ API keys grant full read access to all search endpoints. Revoke unused keys immediately.
          </div>
        </div>
      )}

      {/* Settings tab — Discord link editor */}
      {activeAdminTab === "settings" && (
        <div style={{ animation:"fadeUp .25s ease", display:"flex", flexDirection:"column", gap:16 }}>
          {/* Discord link config */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ color:"#5865F2", display:"flex" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></span>
              <div style={{ fontSize:14, fontWeight:700, color:G.text }}>Discord invite link</div>
              <Badge label="ADMIN ONLY" color={G.accent} bg={G.accentBg} border={G.accentBd} />
            </div>
            <div style={{ fontSize:12, color:G.dim, marginBottom:18, lineHeight:1.6 }}>
              This link appears in the sidebar, on the Dashboard, Discord search page, and Support page. Changing it here updates it everywhere immediately (stored in the browser's localStorage per user — for a true server-side solution, store it in your backend and expose it via API).
            </div>

            <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:10, padding:"0 14px", height:44, gap:10 }}>
                <span style={{ color:G.dim, display:"flex", flexShrink:0 }}><IconLink /></span>
                <input
                  value={discordLinkInput}
                  onChange={e=>setDiscordLinkInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSaveDiscordLink()}
                  placeholder="https://discord.gg/…"
                  style={{ flex:1, background:"none", border:"none", outline:"none", color:G.text, fontSize:13, fontFamily:"monospace" }}
                />
              </div>
              <button onClick={handleSaveDiscordLink}
                style={{ background:linkSaved?"rgba(34,197,94,0.15)":"rgba(88,101,242,0.12)", border:`1px solid ${linkSaved?G.successBd:"rgba(88,101,242,0.3)"}`, color:linkSaved?G.success:"#5865F2", borderRadius:10, padding:"0 20px", height:44, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all .25s", flexShrink:0 }}>
                {linkSaved ? <><IconCheck /> Saved</> : <><IconEdit /> Save link</>}
              </button>
              <button onClick={handleResetDiscordLink}
                style={{ background:"none", border:`1px solid ${G.border}`, color:G.dim, borderRadius:10, padding:"0 16px", height:44, fontSize:12, cursor:"pointer", transition:"all .15s", flexShrink:0 }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.bord2; (e.currentTarget as HTMLElement).style.color=G.muted; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.color=G.dim; }}
              >Reset to default</button>
            </div>

            {/* Preview */}
            <div style={{ marginTop:16, padding:"12px 14px", background:G.surf2, borderRadius:10, border:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, color:G.dim, fontWeight:700, flexShrink:0 }}>CURRENT LINK:</span>
              <a href={getDiscordLink()} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:"#5865F2", textDecoration:"none", fontFamily:"monospace", wordBreak:"break-all", flex:1 }}
                onMouseEnter={e=>(e.currentTarget.style.textDecoration="underline")}
                onMouseLeave={e=>(e.currentTarget.style.textDecoration="none")}
              >{getDiscordLink()}</a>
            </div>
          </div>

          {/* Support webhook config */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ color:G.muted, display:"flex" }}><IconSupport /></span>
              <div style={{ fontSize:14, fontWeight:700, color:G.text }}>Support ticket webhook</div>
              <Badge label="ADMIN ONLY" color={G.accent} bg={G.accentBg} border={G.accentBd} />
            </div>
            <div style={{ fontSize:12, color:G.dim, marginBottom:18, lineHeight:1.6 }}>
              When a user sends a message from the Support page, it's posted to this Discord webhook. Each ticket includes the message, subject, and the user's identity — their linked Discord handle if connected, otherwise their account email. Leave empty to disable forwarding.
            </div>

            <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", background:G.surf2, border:`1px solid ${G.bord2}`, borderRadius:10, padding:"0 14px", height:44, gap:10 }}>
                <span style={{ color:G.dim, display:"flex", flexShrink:0 }}><IconLink /></span>
                <input
                  value={webhookInput}
                  onChange={e=>setWebhookInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSaveWebhook()}
                  placeholder="https://discord.com/api/webhooks/…"
                  style={{ flex:1, background:"none", border:"none", outline:"none", color:G.text, fontSize:13, fontFamily:"monospace" }}
                />
              </div>
              <button onClick={handleSaveWebhook}
                style={{ background:webhookSaved?"rgba(34,197,94,0.15)":"rgba(88,101,242,0.12)", border:`1px solid ${webhookSaved?G.successBd:"rgba(88,101,242,0.3)"}`, color:webhookSaved?G.success:"#5865F2", borderRadius:10, padding:"0 20px", height:44, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all .25s", flexShrink:0 }}>
                {webhookSaved ? <><IconCheck /> Saved</> : <><IconEdit /> Save</>}
              </button>
              <button onClick={handleTestWebhook}
                style={{ background:"none", border:`1px solid ${G.border}`, color:G.dim, borderRadius:10, padding:"0 16px", height:44, fontSize:12, cursor:"pointer", transition:"all .15s", flexShrink:0 }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.bord2; (e.currentTarget as HTMLElement).style.color=G.muted; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.color=G.dim; }}
              >Send test</button>
              <button onClick={handleClearWebhook}
                style={{ background:"none", border:`1px solid ${G.border}`, color:G.dim, borderRadius:10, padding:"0 16px", height:44, fontSize:12, cursor:"pointer", transition:"all .15s", flexShrink:0 }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.dangerBd; (e.currentTarget as HTMLElement).style.color=G.danger; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.color=G.dim; }}
              >Clear</button>
            </div>

            <div style={{ marginTop:16, padding:"12px 14px", background:G.surf2, borderRadius:10, border:`1px solid ${G.border}`, fontSize:11, color:G.dim, lineHeight:1.6 }}>
              <strong style={{ color:G.muted }}>How to get a webhook URL:</strong> in Discord, go to Server Settings → Integrations → Webhooks → New Webhook, pick the channel where tickets should land, then copy the webhook URL and paste it above.
              <br/><br/>
              <strong style={{ color:G.muted }}>Note:</strong> this value is stored in your browser's localStorage, same as the Discord invite link above. For a setup shared across all admins/devices, move it to your backend and load it via an API instead.
            </div>
          </div>

          {/* Platform settings placeholder */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, padding:28 }}>
            <div style={{ fontSize:14, fontWeight:700, color:G.text, marginBottom:6 }}>Platform settings</div>
            <div style={{ fontSize:12, color:G.dim, marginBottom:20 }}>General platform configuration options.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Maintenance mode", desc:"Prevents non-admin users from accessing the platform", value:false },
                { label:"New registrations", desc:"Allow new users to create accounts", value:true },
                { label:"Search rate limit", desc:"Limit searches to 100/hour per user", value:true },
              ].map(setting => (
                <div key={setting.label} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", background:G.surf2, borderRadius:10, border:`1px solid ${G.border}` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:G.text }}>{setting.label}</div>
                    <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{setting.desc}</div>
                  </div>
                  <div style={{ width:36, height:20, borderRadius:10, background:setting.value?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.08)", border:`1px solid ${setting.value?G.successBd:G.border}`, position:"relative", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:setting.value?G.success:"rgba(255,255,255,0.3)", position:"absolute", top:2, left:setting.value?18:2, transition:"left .2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function LeakFun() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchesOpen, setSearchesOpen] = useState(true);
  const isAdmin = useIsAdmin();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const navigate = (path: string) => setActiveNav(path);

  const renderPage = () => {
    switch (activeNav) {
      case "discord":   return <DiscordPage key="discord" />;
      case "fivem":     return <FiveMPage key="fivem" />;
      case "breach":    return <BreachPage key="breach" />;
      case "watchlist": return <WatchlistPage key="watchlist" />;
      case "docs":      return <DocsPage key="docs" />;
      case "support":   return <SupportPage key="support" />;
      case "admin":     return isAdmin ? <AdminDashboardPage key="admin" /> : <BreachPage key="breach" />;
      default:          return <DashboardPage key="dashboard" onNavigate={navigate} />;
    }
  };

  return (
    <AuthGuard>
      <div style={{ display:"flex", height:"100vh", background:G.bg, color:G.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", overflow:"hidden" }}>
        <style>{`
          *{box-sizing:border-box}
          ::placeholder{color:rgba(255,255,255,0.18)}
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          select option{background:#111;color:#fff}
          textarea{color-scheme:dark}
        `}</style>

        {/* ── Sidebar ── */}
        <div style={{ width:collapsed?"0":"220px", minWidth:collapsed?"0":"220px", background:G.surface, borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column", transition:"width .25s cubic-bezier(.4,0,.2,1),min-width .25s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }}>

          {/* Logo */}
          <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>AnKa OSINT</span>
            <button onClick={()=>setCollapsed(true)} style={{ background:"none", border:`1px solid ${G.border}`, borderRadius:6, color:G.dim, cursor:"pointer", padding:"4px 6px", display:"flex", alignItems:"center", transition:"all .15s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.bord2; (e.currentTarget as HTMLElement).style.color=G.muted; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.color=G.dim; }}
            ><IconPanel /></button>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"10px 0" }}>
            {/* MAIN */}
            <div style={{ padding:"10px 16px 4px", fontSize:9, letterSpacing:"0.14em", color:G.dim, fontWeight:700 }}>MAIN</div>
            <SideNavItem icon={<IconDashboard />} label="Dashboard" active={activeNav==="dashboard"} onClick={()=>navigate("dashboard")} />

            {/* SEARCHES */}
            <div onClick={()=>setSearchesOpen(!searchesOpen)} style={{ padding:"10px 16px 4px", fontSize:9, letterSpacing:"0.14em", color:G.dim, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, userSelect:"none" }}>
              <IconSearch /><span>SEARCHES</span>
              <span style={{ marginLeft:"auto", opacity:.5, transform:searchesOpen?"rotate(0)":"rotate(-90deg)", transition:"transform .2s", display:"flex" }}><IconChevron /></span>
            </div>
            {searchesOpen && NAV_SEARCHES.map(item=>(
              <SideNavItem key={item.path} icon={item.icon} label={item.label} active={activeNav===item.path} sub onClick={()=>navigate(item.path)} />
            ))}

            <SideNavItem icon={<IconBell />} label="Watchlist" active={activeNav==="watchlist"} onClick={()=>navigate("watchlist")} badge="BETA" />

            {/* ADMIN */}
            {isAdmin && (
              <>
                <div style={{ margin:"8px 16px", height:1, background:G.border }} />
                <div style={{ padding:"4px 16px 4px", fontSize:9, letterSpacing:"0.14em", color:G.dim, fontWeight:700 }}>ADMINISTRATION</div>
                <SideNavItem icon={<IconCrown />} label="Admin Dashboard" active={activeNav==="admin"} onClick={()=>navigate("admin")} adminOnly />
              </>
            )}

            <div style={{ margin:"16px 16px", height:1, background:G.border }} />

            {/* RESOURCES */}
            <div style={{ padding:"4px 16px 4px", fontSize:9, letterSpacing:"0.14em", color:G.dim, fontWeight:700 }}>RESOURCES</div>
            <SideNavItem icon={<IconBook />}    label="Documentation" active={activeNav==="docs"}    onClick={()=>navigate("docs")} />
            <SideNavItem icon={<IconCode />}    label="API Reference"  active={false}                onClick={()=>{}}               badge="SOON" />
            <SideNavItem icon={<IconSupport />} label="Support"        active={activeNav==="support"} onClick={()=>navigate("support")} />
            {/* Discord as real external link */}
            <DiscordSidebarBtn />
          </div>

          <SidebarUser onNavigate={navigate} />
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button onClick={()=>setCollapsed(false)} style={{ position:"absolute", left:12, top:18, background:G.surface, border:`1px solid ${G.border}`, borderRadius:8, color:G.muted, cursor:"pointer", padding:"8px 10px", zIndex:50, display:"flex", alignItems:"center", boxShadow:G.glow }}>
            <IconPanel />
          </button>
        )}

        {/* ── Main content ── */}
        <div key={activeNav} style={{ flex:1, overflowY:"auto", padding:"44px 52px", animation:"fadeUp .25s ease" }}>
          {renderPage()}
        </div>
      </div>

      {/* Global toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={hideToast} />}
    </AuthGuard>
  );
}