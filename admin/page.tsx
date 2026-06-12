"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// ── Theme (same as dashboard) ─────────────────────────────────────
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
  glowHot: "0 0 24px rgba(255,255,255,0.2)",
  success: "rgba(34,197,94,0.9)",
  successBg:"rgba(34,197,94,0.08)",
  successBd:"rgba(34,197,94,0.2)",
  danger:  "rgba(239,68,68,0.9)",
  dangerBg:"rgba(239,68,68,0.08)",
  dangerBd:"rgba(239,68,68,0.2)",
  warn:    "rgba(234,179,8,0.9)",
  warnBg:  "rgba(234,179,8,0.08)",
  warnBd:  "rgba(234,179,8,0.2)",
  purple:  "rgba(168,85,247,0.9)",
  purpleBg:"rgba(168,85,247,0.08)",
  purpleBd:"rgba(168,85,247,0.2)",
};

// ── Types ─────────────────────────────────────────────────────────
type NavLink = { id: string; label: string; url: string; visible: boolean };
type Webhook = { id: string; name: string; url: string; events: string[]; active: boolean; lastPing?: string; lastStatus?: number };
type AdminUser = { id: string; name: string; email: string; role: "admin" | "user" | "banned"; searches: number; joined: string; avatar?: string };

// ── Mock data ─────────────────────────────────────────────────────
const MOCK_USERS: AdminUser[] = [
  { id:"1", name:"Alexandre D.", email:"alex@example.com", role:"admin",  searches:1240, joined:"2024-01-12" },
  { id:"2", name:"Marie L.",     email:"marie@example.com",role:"user",   searches:83,   joined:"2024-03-22" },
  { id:"3", name:"Thomas B.",    email:"thomas@example.com",role:"user",  searches:512,  joined:"2024-02-08" },
  { id:"4", name:"Julie M.",     email:"julie@example.com", role:"banned",searches:2,    joined:"2024-04-01" },
  { id:"5", name:"Kevin R.",     email:"kevin@example.com", role:"user",  searches:99,   joined:"2024-05-15" },
];

const WEBHOOK_EVENTS = ["search.query","user.signup","user.banned","error.critical","rate.limit.hit"];

// ── Icons ─────────────────────────────────────────────────────────
const Icon = ({ d, size=14 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconShield   = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const IconLink     = () => <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />;
const IconWebhook  = () => <Icon d="M18 16.98h-5.99c-1.1 0-1.95.68-2.23 1.62m0 0A3 3 0 1 1 4 20.6M12.77 18.6A3 3 0 1 0 18 14.02M9 11l3-3m0 0 3-3m-3 3-3-3m3 3 3 3" />;
const IconUsers    = () => <><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" stroke="currentColor" strokeWidth="2" fill="none"/></>;
const IconSettings = () => <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" fill="none"/></>;
const IconText     = () => <><polyline points="4 7 4 4 20 4 20 7" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2"/></>;
const IconRate     = () => <><line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2"/><line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2"/></>;
const IconLogs     = () => <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2"/></>;
const IconPlus     = () => <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>;
const IconTrash    = () => <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>;
const IconDrag     = () => <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>;
const IconCheck    = () => <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" fill="none" />;
const IconX        = () => <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>;
const IconCopy     = () => <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" fill="none"/></>;
const IconSend     = () => <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" fill="none"/></>;
const IconEye      = () => <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></>;
const IconBan      = () => <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2"/></>;
const IconArrowLeft= () => <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>;
const IconGlobe    = () => <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none"/></>;

const SECTIONS = [
  { id:"overview",  label:"Overview",    icon:<IconShield /> },
  { id:"branding",  label:"Branding",    icon:<IconGlobe /> },
  { id:"nav",       label:"Navigation",  icon:<IconLink /> },
  { id:"content",   label:"Content",     icon:<IconText /> },
  { id:"webhooks",  label:"Webhooks",    icon:<IconWebhook /> },
  { id:"users",     label:"Users",       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><IconUsers /></svg> },
  { id:"ratelimit", label:"Rate limits", icon:<IconRate /> },
  { id:"logs",      label:"Logs",        icon:<IconLogs /> },
];

// ── Shared UI atoms ───────────────────────────────────────────────

const inp: React.CSSProperties = {
  width:"100%", background:G.surf2, border:`1px solid ${G.border}`,
  borderRadius:8, color:G.text, padding:"0 14px", height:40,
  fontSize:13, outline:"none", fontFamily:"inherit",
  transition:"border .15s, box-shadow .15s",
};

const textarea: React.CSSProperties = {
  ...inp, height:"auto", padding:"10px 14px", resize:"vertical" as const,
  lineHeight:1.6,
};

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display:"block", fontSize:"9px", letterSpacing:"0.14em", color:G.dim, marginBottom:7, fontWeight:700 }}>{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width:40, height:22, borderRadius:11, background: value ? "#fff" : G.surf3, border:`1px solid ${value ? "transparent" : G.bord2}`, cursor:"pointer", position:"relative", transition:"all .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: value ? 21 : 3, width:14, height:14, borderRadius:"50%", background: value ? G.bg : G.muted, transition:"left .2s, background .2s" }} />
    </div>
  );
}

function Btn({ children, onClick, variant="default", size="md", disabled=false, loading=false }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "default"|"primary"|"danger"|"success"|"ghost";
  size?: "sm"|"md"; disabled?: boolean; loading?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background:G.surf2, border:`1px solid ${G.bord2}`, color:G.muted },
    primary: { background:"#fff", border:"none", color:"#000", boxShadow:G.glowHot },
    danger:  { background:G.dangerBg, border:`1px solid ${G.dangerBd}`, color:G.danger },
    success: { background:G.successBg, border:`1px solid ${G.successBd}`, color:G.success },
    ghost:   { background:"none", border:"none", color:G.dim },
  };
  return (
    <button onClick={onClick} disabled={disabled||loading} style={{
      ...styles[variant],
      borderRadius:8, cursor:(disabled||loading)?"not-allowed":"pointer",
      fontSize: size==="sm" ? 11 : 13, fontWeight:600,
      padding: size==="sm" ? "5px 12px" : "8px 18px",
      display:"flex", alignItems:"center", gap:7,
      opacity:(disabled||loading)?.5:1, transition:"all .15s",
      whiteSpace:"nowrap", flexShrink:0,
    }}
    onMouseEnter={e => { if(!disabled&&!loading) (e.currentTarget as HTMLElement).style.opacity=".8"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity="1"; }}
    >
      {loading ? <Spinner sm /> : children}
    </button>
  );
}

function Spinner({ sm=false }: { sm?: boolean }) {
  const s = sm ? 12 : 16;
  return <div style={{ width:s, height:s, border:`2px solid rgba(255,255,255,0.15)`, borderTopColor:"currentColor", borderRadius:"50%", animation:"spin .7s linear infinite" }} />;
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position:"fixed", bottom:28, right:28, background: ok ? G.successBg : G.dangerBg, border:`1px solid ${ok ? G.successBd : G.dangerBd}`, color: ok ? G.success : G.danger, borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:8, zIndex:1000, boxShadow:"0 8px 40px rgba(0,0,0,.8)", animation:"fadeUp .2s ease" }}>
      {ok ? <IconCheck /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><IconX /></svg>}
      {msg}
    </div>
  );
}

function SectionCard({ title, desc, children, action }: { title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background:G.surface, borderRadius:14, border:`1px solid ${G.border}`, marginBottom:20, overflow:"hidden" }}>
      <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:G.text, marginBottom:3 }}>{title}</div>
          {desc && <div style={{ fontSize:12, color:G.dim, lineHeight:1.5 }}>{desc}</div>}
        </div>
        {action && <div style={{ flexShrink:0 }}>{action}</div>}
      </div>
      <div style={{ padding:"20px 24px" }}>{children}</div>
    </div>
  );
}

function Badge({ children, color="default" }: { children: React.ReactNode; color?: "green"|"red"|"yellow"|"purple"|"default" }) {
  const map = {
    green:   { bg:G.successBg, bd:G.successBd, c:G.success },
    red:     { bg:G.dangerBg,  bd:G.dangerBd,  c:G.danger },
    yellow:  { bg:G.warnBg,    bd:G.warnBd,    c:G.warn },
    purple:  { bg:G.purpleBg,  bd:G.purpleBd,  c:G.purple },
    default: { bg:"rgba(255,255,255,0.04)", bd:G.border, c:G.muted },
  };
  const s = map[color];
  return <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", background:s.bg, border:`1px solid ${s.bd}`, color:s.c, borderRadius:5, padding:"2px 8px" }}>{children}</span>;
}

// ═══════════════════════════════════════════════════════
// SECTION: Overview
// ═══════════════════════════════════════════════════════
function OverviewSection() {
  const stats = [
    { label:"Total searches", value:"48,291", delta:"+12% this week", ok:true },
    { label:"Active users",   value:"1,204",  delta:"+34 today",      ok:true },
    { label:"Banned users",   value:"7",      delta:"+1 this week",   ok:false },
    { label:"Webhook errors", value:"3",      delta:"last 24h",       ok:false },
  ];
  const recent = [
    { time:"14:32", user:"marie@example.com", query:"john.doe@gmail.com", type:"email",   hits:3 },
    { time:"14:28", user:"kevin@example.com", query:"76561198043059..."  , type:"steam",  hits:0 },
    { time:"14:21", user:"thomas@example.com",query:"+33612345678"       , type:"phone",  hits:1 },
    { time:"14:09", user:"marie@example.com", query:"jordan_sky92"       , type:"discord",hits:7 },
    { time:"13:55", user:"kevin@example.com", query:"192.168.1.1"        , type:"ip",     hits:0 },
  ];
  return (
    <>
      {/* Stat grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", color:G.text }}>{s.value}</div>
            <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{s.label}</div>
            <div style={{ fontSize:10, color: s.ok ? G.success : G.danger, marginTop:6, fontWeight:500 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Recent queries */}
      <SectionCard title="Recent queries" desc="Live feed of the last searches across all users.">
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${G.border}` }}>
              {["Time","User","Query","Type","Hits"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"6px 10px 10px", fontSize:"9px", letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((r,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${G.border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}
              >
                <td style={{ padding:"10px", color:G.muted, fontFamily:"monospace" }}>{r.time}</td>
                <td style={{ padding:"10px", color:G.text }}>{r.user}</td>
                <td style={{ padding:"10px", color:G.muted, fontFamily:"monospace", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.query}</td>
                <td style={{ padding:"10px" }}><Badge color="purple">{r.type.toUpperCase()}</Badge></td>
                <td style={{ padding:"10px", color: r.hits>0 ? G.success : G.dim, fontWeight:600 }}>{r.hits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Branding
// ═══════════════════════════════════════════════════════
function BrandingSection({ onSave }: { onSave: (msg: string) => void }) {
  const [form, setForm] = useState({
    siteName: "Leak Scanner",
    tagline: "Public data, private search.",
    description: "OSINT Breach Checker Tool",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#a855f7",
    bannerEnabled: false,
    bannerText: "",
    bannerType: "info" as "info"|"warn"|"danger",
    maintenanceMode: false,
  });

  const set = (k: keyof typeof form, v: string|boolean) => setForm(f => ({...f, [k]:v}));

  return (
    <>
      <SectionCard title="Site identity" desc="Basic information shown across the UI and in browser tabs.">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
          <Field label="SITE NAME">
            <input style={inp} value={form.siteName} onChange={e=>set("siteName",e.target.value)}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
          </Field>
          <Field label="TAGLINE">
            <input style={inp} value={form.tagline} onChange={e=>set("tagline",e.target.value)}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
          </Field>
          <Field label="META DESCRIPTION">
            <input style={inp} value={form.description} onChange={e=>set("description",e.target.value)}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
          </Field>
          <Field label="PRIMARY COLOR">
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input type="color" value={form.primaryColor} onChange={e=>set("primaryColor",e.target.value)} style={{ width:40, height:40, border:`1px solid ${G.border}`, borderRadius:8, cursor:"pointer", background:"none", padding:2 }} />
              <input style={{...inp, fontFamily:"monospace"}} value={form.primaryColor} onChange={e=>set("primaryColor",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
            </div>
          </Field>
          <Field label="LOGO URL">
            <input style={inp} placeholder="https://..." value={form.logoUrl} onChange={e=>set("logoUrl",e.target.value)}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
          </Field>
          <Field label="FAVICON URL">
            <input style={inp} placeholder="https://..." value={form.faviconUrl} onChange={e=>set("faviconUrl",e.target.value)}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Announcement banner" desc="Display a banner at the top of the site for all visitors.">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:13, color:G.text, marginBottom:2 }}>Enable banner</div>
            <div style={{ fontSize:11, color:G.dim }}>Visible to all users, including unauthenticated</div>
          </div>
          <Toggle value={form.bannerEnabled} onChange={v=>set("bannerEnabled",v)} />
        </div>
        {form.bannerEnabled && (
          <>
            <Field label="BANNER MESSAGE">
              <input style={inp} placeholder="We're migrating our database. Searches may be slower." value={form.bannerText} onChange={e=>set("bannerText",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
            </Field>
            <Field label="TYPE">
              <div style={{ display:"flex", gap:8 }}>
                {(["info","warn","danger"] as const).map(t => (
                  <button key={t} onClick={()=>set("bannerType",t)} style={{ padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, border:`1px solid ${form.bannerType===t ? G.bord2 : G.border}`, background:form.bannerType===t?"rgba(255,255,255,0.08)":G.surf2, color:form.bannerType===t?G.text:G.dim, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            {/* Preview */}
            <div style={{ borderRadius:8, padding:"10px 16px", fontSize:12, fontWeight:500, marginTop:4, background:form.bannerType==="info"?"rgba(59,130,246,0.1)":form.bannerType==="warn"?G.warnBg:G.dangerBg, border:`1px solid ${form.bannerType==="info"?"rgba(59,130,246,0.2)":form.bannerType==="warn"?G.warnBd:G.dangerBd}`, color:form.bannerType==="info"?"rgba(147,197,253,0.9)":form.bannerType==="warn"?G.warn:G.danger }}>
              {form.bannerText || "Preview of your banner message here…"}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Maintenance mode" desc="Redirects all non-admin users to a maintenance page.">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:13, color: form.maintenanceMode ? G.danger : G.text, fontWeight:500 }}>
              {form.maintenanceMode ? "⚠ Maintenance mode is ON" : "Maintenance mode is off"}
            </div>
            <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>Only admins can access the site while this is active</div>
          </div>
          <Toggle value={form.maintenanceMode} onChange={v=>set("maintenanceMode",v)} />
        </div>
      </SectionCard>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <Btn variant="primary" onClick={()=>onSave("Branding saved")}>Save changes</Btn>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Navigation links
// ═══════════════════════════════════════════════════════
function NavSection({ onSave }: { onSave: (msg: string) => void }) {
  const [links, setLinks] = useState<NavLink[]>([
    { id:"1", label:"Dashboard",     url:"/dashboard",    visible:true },
    { id:"2", label:"Documentation", url:"/docs",         visible:true },
    { id:"3", label:"Contact",       url:"/contact",      visible:true },
    { id:"4", label:"API Reference", url:"/docs/api",     visible:false },
  ]);
  const [dragging, setDragging] = useState<string|null>(null);

  const updateLink = (id: string, k: keyof NavLink, v: string|boolean) =>
    setLinks(ls => ls.map(l => l.id===id ? {...l,[k]:v} : l));

  const removeLink = (id: string) => setLinks(ls => ls.filter(l => l.id!==id));

  const addLink = () => setLinks(ls => [...ls, { id:Date.now().toString(), label:"New link", url:"/", visible:true }]);

  return (
    <SectionCard
      title="Navigation links"
      desc="Manage which links appear in the main header. Drag to reorder."
      action={<Btn size="sm" onClick={addLink}><IconPlus /> Add link</Btn>}
    >
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {links.map((link, i) => (
          <div key={link.id} style={{ display:"flex", alignItems:"center", gap:10, background: dragging===link.id ? "rgba(255,255,255,0.04)" : G.surf2, border:`1px solid ${G.border}`, borderRadius:10, padding:"10px 14px", transition:"background .15s" }}
            draggable
            onDragStart={() => setDragging(link.id)}
            onDragEnd={() => setDragging(null)}
            onDragOver={e => {
              e.preventDefault();
              if (dragging && dragging !== link.id) {
                const fromIdx = links.findIndex(l=>l.id===dragging);
                const toIdx = i;
                const newLinks = [...links];
                const [moved] = newLinks.splice(fromIdx,1);
                newLinks.splice(toIdx,0,moved);
                setLinks(newLinks);
              }
            }}
          >
            <span style={{ color:G.dim, cursor:"grab", display:"flex" }}><IconDrag /></span>
            <input value={link.label} onChange={e=>updateLink(link.id,"label",e.target.value)} style={{ ...inp, width:140, flex:"none" }}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
            <input value={link.url} onChange={e=>updateLink(link.id,"url",e.target.value)} style={{ ...inp, flex:1, fontFamily:"monospace", fontSize:12 }}
              onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
              onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
            />
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color:G.dim, letterSpacing:"0.08em" }}>VISIBLE</span>
              <Toggle value={link.visible} onChange={v=>updateLink(link.id,"visible",v)} />
            </div>
            <button onClick={()=>removeLink(link.id)} style={{ background:"none", border:"none", color:G.dim, cursor:"pointer", display:"flex", padding:4, borderRadius:6, transition:"color .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=G.danger)}
              onMouseLeave={e=>(e.currentTarget.style.color=G.dim)}
            ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconTrash /></svg></button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
        <Btn variant="primary" onClick={()=>onSave("Navigation saved")}>Save navigation</Btn>
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Content texts
// ═══════════════════════════════════════════════════════
function ContentSection({ onSave }: { onSave: (msg: string) => void }) {
  const [texts, setTexts] = useState({
    heroTitle:    "Public data,",
    heroSubtitle: "private search.",
    heroDesc:     "Start with an email, username, phone or platform ID — Leak Scanner routes it to the right search.",
    howItWorksTitle:"How it works",
    step1Title:   "Search.",
    step1Desc:    "Drop any identifier — email, username, phone, gamer ID — into the search bar. No SDK, no API key, no boilerplate setup.",
    step2Title:   "Match.",
    step2Desc:    "Leak Scanner normalises your input on the fly: phone numbers are parsed, emails canonicalised, gamer IDs cross-referenced.",
    step3Title:   "Export.",
    step3Desc:    "Download results as JSON or CSV. Full record with all matched fields, source breach, and confidence score.",
    footerText:   "© 2025 Leak Scanner. For legitimate OSINT research only.",
    loginPrompt:  "Sign in to run searches",
    notFoundTitle:"No results found",
    notFoundDesc: "Try different or broader terms.",
  });

  const set = (k: keyof typeof texts, v: string) => setTexts(t=>({...t,[k]:v}));

  const sections = [
    { title:"Homepage hero", fields:[
      { key:"heroTitle" as const,    label:"HERO TITLE" },
      { key:"heroSubtitle" as const, label:"HERO SUBTITLE" },
      { key:"heroDesc" as const,     label:"HERO DESCRIPTION", multi:true },
    ]},
    { title:"How it works section", fields:[
      { key:"howItWorksTitle" as const, label:"SECTION TITLE" },
      { key:"step1Title" as const,  label:"STEP 1 TITLE" },
      { key:"step1Desc" as const,   label:"STEP 1 DESCRIPTION", multi:true },
      { key:"step2Title" as const,  label:"STEP 2 TITLE" },
      { key:"step2Desc" as const,   label:"STEP 2 DESCRIPTION", multi:true },
      { key:"step3Title" as const,  label:"STEP 3 TITLE" },
      { key:"step3Desc" as const,   label:"STEP 3 DESCRIPTION", multi:true },
    ]},
    { title:"UI strings", fields:[
      { key:"loginPrompt" as const,   label:"LOGIN PROMPT" },
      { key:"notFoundTitle" as const, label:"NO RESULTS TITLE" },
      { key:"notFoundDesc" as const,  label:"NO RESULTS DESCRIPTION" },
      { key:"footerText" as const,    label:"FOOTER TEXT" },
    ]},
  ];

  return (
    <>
      {sections.map(s => (
        <SectionCard key={s.title} title={s.title}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
            {s.fields.map(f => (
              <div key={f.key} style={{ marginBottom:20, gridColumn: (f as any).multi ? "span 2" : "span 1" }}>
                <Label>{f.label}</Label>
                {(f as any).multi ? (
                  <textarea rows={2} style={textarea} value={texts[f.key]} onChange={e=>set(f.key, e.target.value)}
                    onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                    onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
                  />
                ) : (
                  <input style={inp} value={texts[f.key]} onChange={e=>set(f.key, e.target.value)}
                    onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                    onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
                  />
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <Btn variant="primary" onClick={()=>onSave("Content saved")}>Save content</Btn>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Webhooks
// ═══════════════════════════════════════════════════════
function WebhooksSection({ onSave }: { onSave: (msg: string) => void }) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id:"1", name:"Logs — Discord", url:"https://discord.com/api/webhooks/xxx/yyy", events:["search.query","user.signup"], active:true, lastPing:"2 min ago", lastStatus:200 },
    { id:"2", name:"Alerts — Slack", url:"https://hooks.slack.com/services/xxx/yyy/zzz", events:["error.critical","user.banned"], active:false },
  ]);
  const [editing, setEditing] = useState<string|null>(null);
  const [testing, setTesting] = useState<string|null>(null);
  const [testResult, setTestResult] = useState<Record<string,{ok:boolean;msg:string}>>({});

  const newHook = (): Webhook => ({ id:Date.now().toString(), name:"New webhook", url:"", events:[], active:false });
  const update = (id:string, patch: Partial<Webhook>) => setWebhooks(ws=>ws.map(w=>w.id===id?{...w,...patch}:w));
  const remove = (id:string) => { setWebhooks(ws=>ws.filter(w=>w.id!==id)); if(editing===id) setEditing(null); };
  const toggleEvent = (id:string, ev:string) => {
    const w = webhooks.find(x=>x.id===id)!;
    const evs = w.events.includes(ev) ? w.events.filter(e=>e!==ev) : [...w.events,ev];
    update(id,"events" as keyof Webhook, evs as any);
  };
  const testWebhook = async (id:string) => {
    setTesting(id);
    await new Promise(r=>setTimeout(r,1200));
    setTesting(null);
    setTestResult(r=>({...r,[id]:{ok:Math.random()>.2,msg:Math.random()>.2?"200 OK — webhook received":"Connection refused"}}));
    setTimeout(()=>setTestResult(r=>{const n={...r};delete n[id];return n;}),4000);
  };

  return (
    <>
      <SectionCard
        title="Configured webhooks"
        desc="POST requests sent to your URLs when selected events fire."
        action={<Btn size="sm" onClick={()=>{ const h=newHook(); setWebhooks(ws=>[...ws,h]); setEditing(h.id); }}><IconPlus /> Add webhook</Btn>}
      >
        {webhooks.length===0 && (
          <div style={{ textAlign:"center", padding:"32px", color:G.dim, fontSize:13 }}>No webhooks configured yet.</div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {webhooks.map(w => (
            <div key={w.id} style={{ border:`1px solid ${G.border}`, borderRadius:10, overflow:"hidden" }}>
              {/* Row */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:G.surf2 }}>
                <Toggle value={w.active} onChange={v=>update(w.id,"active",v)} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:G.text }}>{w.name}</div>
                  <div style={{ fontSize:11, color:G.dim, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{w.url||"No URL set"}</div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {w.lastStatus && <Badge color={w.lastStatus===200?"green":"red"}>{w.lastStatus}</Badge>}
                  {w.lastPing && <span style={{ fontSize:10, color:G.dim }}>{w.lastPing}</span>}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {testResult[w.id] && <Badge color={testResult[w.id].ok?"green":"red"}>{testResult[w.id].msg}</Badge>}
                  <Btn size="sm" onClick={()=>testWebhook(w.id)} loading={testing===w.id} disabled={!w.url}><IconSend /> Test</Btn>
                  <Btn size="sm" onClick={()=>setEditing(editing===w.id?null:w.id)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><IconSettings /></svg> {editing===w.id?"Close":"Edit"}</Btn>
                  <button onClick={()=>remove(w.id)} style={{ background:G.dangerBg, border:`1px solid ${G.dangerBd}`, color:G.danger, borderRadius:7, cursor:"pointer", padding:"5px 10px", display:"flex", alignItems:"center" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconTrash /></svg>
                  </button>
                </div>
              </div>

              {/* Expanded editor */}
              {editing===w.id && (
                <div style={{ padding:"16px 16px 20px", borderTop:`1px solid ${G.border}`, background:G.surface }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
                    <Field label="NAME">
                      <input style={inp} value={w.name} onChange={e=>update(w.id,"name",e.target.value)}
                        onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                        onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
                      />
                    </Field>
                    <Field label="URL">
                      <div style={{ display:"flex", gap:6 }}>
                        <input style={{...inp, fontFamily:"monospace", fontSize:12}} value={w.url} onChange={e=>update(w.id,"url",e.target.value)} placeholder="https://..."
                          onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                          onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
                        />
                        <button onClick={()=>navigator.clipboard.writeText(w.url)} style={{ background:G.surf3, border:`1px solid ${G.border}`, color:G.dim, borderRadius:7, cursor:"pointer", padding:"0 10px", display:"flex", alignItems:"center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconCopy /></svg></button>
                      </div>
                    </Field>
                  </div>
                  <Label>EVENTS TO SUBSCRIBE</Label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                    {WEBHOOK_EVENTS.map(ev => {
                      const on = w.events.includes(ev);
                      return (
                        <button key={ev} onClick={()=>toggleEvent(w.id,ev)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"monospace", border:`1px solid ${on?G.bord2:G.border}`, background:on?"rgba(255,255,255,0.08)":G.surf2, color:on?G.text:G.dim, transition:"all .15s" }}>
                          {on && <span style={{ marginRight:5, fontSize:9 }}>✓</span>}{ev}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
                    <Btn variant="primary" size="sm" onClick={()=>{ onSave("Webhook saved"); setEditing(null); }}>Save webhook</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Payload preview */}
      <SectionCard title="Payload format" desc="Example JSON sent on search.query event.">
        <pre style={{ background:G.surf2, borderRadius:8, border:`1px solid ${G.border}`, padding:"14px 16px", fontSize:11, color:G.muted, fontFamily:"'JetBrains Mono','Fira Code',monospace", lineHeight:1.8, margin:0, overflowX:"auto" }}>
{`{
  "event":     "search.query",
  "timestamp": "2025-06-12T14:32:07.000Z",
  "user": {
    "id":    "user_2xxxxxxxxxxxxx",
    "email": "marie@example.com"
  },
  "query": {
    "input":  "john.doe@gmail.com",
    "type":   "email",
    "module": "breach"
  },
  "result": {
    "hits": 3,
    "latency_ms": 142
  }
}`}
        </pre>
      </SectionCard>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Users
// ═══════════════════════════════════════════════════════
function UsersSection({ onSave }: { onSave: (msg: string) => void }) {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"admin"|"user"|"banned">("all");

  const updateUser = (id:string, patch: Partial<AdminUser>) =>
    setUsers(us=>us.map(u=>u.id===id?{...u,...patch}:u));

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.includes(search) || u.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || u.role===filter;
    return matchSearch && matchFilter;
  });

  const roleColor = (r: AdminUser["role"]) =>
    r==="admin" ? "purple" : r==="banned" ? "red" : "default";

  return (
    <SectionCard
      title="User management"
      desc="Manage roles and access. Changes sync to Clerk publicMetadata."
      action={
        <div style={{ display:"flex", gap:8 }}>
          {(["all","admin","user","banned"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${filter===f?G.bord2:G.border}`, background:filter===f?"rgba(255,255,255,0.08)":G.surf2, color:filter===f?G.text:G.dim }}>
              {f}
            </button>
          ))}
        </div>
      }
    >
      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", background:G.surf2, border:`1px solid ${G.border}`, borderRadius:8, padding:"0 12px", height:38, gap:8, marginBottom:16 }}>
        <span style={{ color:G.dim, display:"flex", flexShrink:0 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconSearch /></svg></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" style={{ flex:1, background:"none", border:"none", outline:"none", color:G.text, fontSize:13 }} />
      </div>

      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${G.border}` }}>
            {["User","Email","Role","Searches","Joined","Actions"].map(h=>(
              <th key={h} style={{ textAlign:"left", padding:"6px 10px 10px", fontSize:"9px", letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(u=>(
            <tr key={u.id} style={{ borderBottom:`1px solid ${G.border}` }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.015)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}
            >
              <td style={{ padding:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:G.muted, flexShrink:0 }}>
                    {u.name.slice(0,2).toUpperCase()}
                  </div>
                  <span style={{ color:G.text, fontWeight:500 }}>{u.name}</span>
                </div>
              </td>
              <td style={{ padding:"10px", color:G.muted, fontFamily:"monospace" }}>{u.email}</td>
              <td style={{ padding:"10px" }}><Badge color={roleColor(u.role)}>{u.role.toUpperCase()}</Badge></td>
              <td style={{ padding:"10px", color:G.muted }}>{u.searches.toLocaleString()}</td>
              <td style={{ padding:"10px", color:G.dim }}>{u.joined}</td>
              <td style={{ padding:"10px" }}>
                <div style={{ display:"flex", gap:6" }}>
                  {u.role!=="admin" && (
                    <Btn size="sm" variant="ghost" onClick={()=>{ updateUser(u.id,{role:"admin"}); onSave(`${u.name} promoted to admin`); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconShield /></svg> Promote
                    </Btn>
                  )}
                  {u.role==="admin" && (
                    <Btn size="sm" variant="ghost" onClick={()=>{ updateUser(u.id,{role:"user"}); onSave(`${u.name} demoted`); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconX /></svg> Demote
                    </Btn>
                  )}
                  {u.role!=="banned" ? (
                    <Btn size="sm" variant="danger" onClick={()=>{ updateUser(u.id,{role:"banned"}); onSave(`${u.name} banned`); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconBan /></svg> Ban
                    </Btn>
                  ) : (
                    <Btn size="sm" variant="success" onClick={()=>{ updateUser(u.id,{role:"user"}); onSave(`${u.name} unbanned`); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconCheck /></svg> Unban
                    </Btn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length===0 && (
        <div style={{ textAlign:"center", padding:"32px", color:G.dim, fontSize:13 }}>No users match this filter.</div>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Rate limiting
// ═══════════════════════════════════════════════════════
function RateLimitSection({ onSave }: { onSave: (msg: string) => void }) {
  const [form, setForm] = useState({
    globalEnabled: true,
    freeLimit: "50",
    freePeriod: "day",
    proLimit: "500",
    proPeriod: "day",
    burstLimit: "10",
    burstWindow: "60",
    whitelist: "alex@example.com\nadmin@example.com",
  });
  const set = (k: keyof typeof form, v: string|boolean) => setForm(f=>({...f,[k]:v}));

  return (
    <>
      <SectionCard title="Global rate limiting">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:13, color:G.text }}>Enable rate limiting</div>
            <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>Applies to all non-whitelisted users</div>
          </div>
          <Toggle value={form.globalEnabled} onChange={v=>set("globalEnabled",v)} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
          <div style={{ marginBottom:20 }}>
            <Label>FREE TIER — MAX SEARCHES</Label>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" style={{...inp,width:100,flex:"none"}} value={form.freeLimit} onChange={e=>set("freeLimit",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
              <select value={form.freePeriod} onChange={e=>set("freePeriod",e.target.value)} style={{ ...inp, width:"auto", cursor:"pointer" }}>
                <option value="hour">per hour</option>
                <option value="day">per day</option>
                <option value="week">per week</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <Label>PRO TIER — MAX SEARCHES</Label>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" style={{...inp,width:100,flex:"none"}} value={form.proLimit} onChange={e=>set("proLimit",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
              <select value={form.proPeriod} onChange={e=>set("proPeriod",e.target.value)} style={{ ...inp, width:"auto", cursor:"pointer" }}>
                <option value="hour">per hour</option>
                <option value="day">per day</option>
                <option value="week">per week</option>
              </select>
            </div>
          </div>
          <Field label={`BURST LIMIT (max ${form.burstLimit} req per ${form.burstWindow}s)`}>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" style={{...inp,width:80,flex:"none"}} value={form.burstLimit} onChange={e=>set("burstLimit",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
              <span style={{ color:G.dim, fontSize:12, alignSelf:"center" }}>req per</span>
              <input type="number" style={{...inp,width:80,flex:"none"}} value={form.burstWindow} onChange={e=>set("burstWindow",e.target.value)}
                onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
                onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
              />
              <span style={{ color:G.dim, fontSize:12, alignSelf:"center" }}>seconds</span>
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Whitelist" desc="These emails are exempt from all rate limits. One per line.">
        <textarea rows={5} style={textarea} value={form.whitelist} onChange={e=>set("whitelist",e.target.value)}
          onFocus={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.bord2}`;(e.target as HTMLElement).style.boxShadow="0 0 0 3px rgba(255,255,255,0.04)";}}
          onBlur={e=>{(e.target as HTMLElement).style.border=`1px solid ${G.border}`;(e.target as HTMLElement).style.boxShadow="none";}}
        />
        <div style={{ fontSize:11, color:G.dim, marginTop:6 }}>
          {form.whitelist.split("\n").filter(Boolean).length} email(s) whitelisted
        </div>
      </SectionCard>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <Btn variant="primary" onClick={()=>onSave("Rate limits saved")}>Save limits</Btn>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION: Logs
// ═══════════════════════════════════════════════════════
function LogsSection() {
  const logs = [
    { ts:"2025-06-12 14:32:07", level:"info",  msg:"search.query",    detail:"marie@example.com → email → 3 hits",          user:"marie@example.com" },
    { ts:"2025-06-12 14:30:12", level:"warn",  msg:"rate.limit.hit",  detail:"kevin@example.com exceeded 50 req/day limit",  user:"kevin@example.com" },
    { ts:"2025-06-12 14:28:55", level:"info",  msg:"user.signup",     detail:"New user: thomas@example.com (Clerk ID: …)",   user:"thomas@example.com" },
    { ts:"2025-06-12 14:21:03", level:"info",  msg:"search.query",    detail:"thomas@example.com → steam → 0 hits",          user:"thomas@example.com" },
    { ts:"2025-06-12 14:10:44", level:"error", msg:"webhook.error",   detail:"POST https://hooks.slack.com/ → 503 Bad Gateway",user:"system" },
    { ts:"2025-06-12 14:09:01", level:"info",  msg:"user.banned",     detail:"julie@example.com banned by alex@example.com", user:"admin" },
    { ts:"2025-06-12 13:55:22", level:"info",  msg:"search.query",    detail:"kevin@example.com → ip → 0 hits",              user:"kevin@example.com" },
    { ts:"2025-06-12 13:40:18", level:"error", msg:"error.critical",  detail:"Database timeout on breach index shard 4",     user:"system" },
  ];

  const levelColor = (l:string) => l==="error"?"red":l==="warn"?"yellow":"default";
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter==="all" ? logs : logs.filter(l=>l.level===filter);

  return (
    <SectionCard
      title="System logs"
      desc="Last 500 events. Auto-refreshes every 30s."
      action={
        <div style={{ display:"flex", gap:8 }}>
          {["all","info","warn","error"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${filter===f?G.bord2:G.border}`, background:filter===f?"rgba(255,255,255,0.08)":G.surf2, color:filter===f?G.text:G.dim }}>
              {f}
            </button>
          ))}
        </div>
      }
    >
      <div style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:11, lineHeight:1.9 }}>
        {filtered.map((log, i) => (
          <div key={i} style={{ display:"flex", gap:16, padding:"5px 0", borderBottom:i<filtered.length-1?`1px solid ${G.border}`:"none", alignItems:"flex-start" }}>
            <span style={{ color:G.dim, flexShrink:0, whiteSpace:"nowrap" }}>{log.ts}</span>
            <span style={{ flexShrink:0, width:44 }}><Badge color={levelColor(log.level) as any}>{log.level.toUpperCase()}</Badge></span>
            <span style={{ color:G.muted, flexShrink:0, width:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.msg}</span>
            <span style={{ color:G.dim, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.detail}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function IconSearch() {
  return <><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/></>;
}

// ═══════════════════════════════════════════════════════
// ROOT — Admin page
// ═══════════════════════════════════════════════════════
export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [section, setSection] = useState("overview");
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!isLoaded) return;
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";
    if (isLoaded && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  const showToast = (msg: string, ok=true) => {
    setToast({msg,ok});
    setTimeout(()=>setToast(null),3000);
  };

  if (!isLoaded) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:G.bg }}>
        <Spinner />
      </div>
    );
  }

  const renderSection = () => {
    switch(section) {
      case "overview":  return <OverviewSection />;
      case "branding":  return <BrandingSection onSave={showToast} />;
      case "nav":       return <NavSection onSave={showToast} />;
      case "content":   return <ContentSection onSave={showToast} />;
      case "webhooks":  return <WebhooksSection onSave={showToast} />;
      case "users":     return <UsersSection onSave={showToast} />;
      case "ratelimit": return <RateLimitSection onSave={showToast} />;
      case "logs":      return <LogsSection />;
      default:          return null;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:G.bg, color:G.text, fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", overflow:"hidden" }}>
      <style>{`
        *{box-sizing:border-box}
        ::placeholder{color:rgba(255,255,255,0.18)}
        select option{background:#111;color:#fff}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        textarea{font-family:inherit}
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ width:220, minWidth:220, background:G.surface, borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${G.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:G.purple }} />
            <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>leak<span style={{color:G.dim}}>.</span>fun</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:10, letterSpacing:"0.12em", color:G.dim, fontWeight:700 }}>ADMIN PANEL</span>
            <Badge color="purple">ADMIN</Badge>
          </div>
        </div>

        {/* Back to app */}
        <div style={{ padding:"12px 12px 4px" }}>
          <button onClick={()=>router.push("/dashboard")} style={{ width:"100%", background:"none", border:`1px solid ${G.border}`, borderRadius:8, color:G.dim, cursor:"pointer", padding:"7px 12px", display:"flex", alignItems:"center", gap:8, fontSize:12, transition:"all .15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.bord2;(e.currentTarget as HTMLElement).style.color=G.muted;}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.border;(e.currentTarget as HTMLElement).style.color=G.dim;}}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><IconArrowLeft /></svg>
            Back to app
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {SECTIONS.map(s => {
            const active = section===s.id;
            return (
              <div key={s.id} onClick={()=>setSection(s.id)} style={{ padding:"8px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:9, background:active?"rgba(255,255,255,0.06)":"transparent", borderLeft:active?"1.5px solid #fff":"1.5px solid transparent", transition:"all .15s", borderRadius:"0 8px 8px 0", marginRight:8 }}
                onMouseEnter={e=>{ if(!active) (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)"; }}
                onMouseLeave={e=>{ if(!active) (e.currentTarget as HTMLElement).style.background="transparent"; }}
              >
                <span style={{ color:active?G.text:G.dim, display:"flex" }}>{s.icon}</span>
                <span style={{ fontSize:13, color:active?G.text:G.muted, fontWeight:active?600:400 }}>{s.label}</span>
                {active && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fff", boxShadow:"0 0 8px #fff", marginLeft:"auto", flexShrink:0 }} />}
              </div>
            );
          })}
        </div>

        {/* User footer */}
        <div style={{ padding:"12px 12px", borderTop:`1px solid ${G.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", marginBottom:8 }}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
            ) : (
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:`1px solid ${G.bord2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:G.text, flexShrink:0 }}>
                {(user?.fullName||user?.username||"A").slice(0,2).toUpperCase()}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:600, color:G.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username ? `@${user.username}` : user?.fullName ?? "Admin"}</div>
              <div style={{ fontSize:10, color:G.dim, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.primaryEmailAddress?.emailAddress ?? ""}</div>
            </div>
          </div>
          <button onClick={()=>signOut({redirectUrl:"/"})} style={{ width:"100%", background:G.dangerBg, border:`1px solid ${G.dangerBd}`, borderRadius:8, color:G.danger, cursor:"pointer", padding:"7px 12px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:12, fontWeight:600, transition:"all .15s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.15)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=G.dangerBg;}}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div key={section} style={{ flex:1, overflowY:"auto", padding:"40px 48px", animation:"fadeUp .2s ease" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", margin:"0 0 4px" }}>
              {SECTIONS.find(s=>s.id===section)?.label}
            </h1>
            <div style={{ fontSize:12, color:G.dim }}>
              {section==="overview"  && "Real-time activity and system health."}
              {section==="branding"  && "Control how the site looks and feels."}
              {section==="nav"       && "Edit, reorder and toggle navigation links."}
              {section==="content"   && "Edit all visible text across the application."}
              {section==="webhooks"  && "Configure outbound event hooks for logging and alerts."}
              {section==="users"     && "Manage user roles and access."}
              {section==="ratelimit" && "Set search quotas and protect the API."}
              {section==="logs"      && "Real-time stream of system events."}
            </div>
          </div>
          {renderSection()}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
