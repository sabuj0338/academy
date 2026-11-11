import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

const LAYERS = [
  { name: 'Next.js Frontend', icon: '🧑‍💻', ev: [
    { t: "localStorage.setItem('access_token', token) — login.tsx", f: { title: 'Token localStorage-এ (XSS হলে চুরি)', sev: 'Medium', fix: 'HttpOnly Secure cookie / BFF' } },
    { t: 'productionBrowserSourceMaps: false', ok: true },
    { t: "<div dangerouslySetInnerHTML={{__html: review.body}} /> — sanitize নেই", f: { title: 'Stored XSS in product reviews', sev: 'High', fix: 'DOMPurify.sanitize + CSP' } },
  ] },
  { name: 'Cloudflare', icon: '☁️', ev: [
    { t: 'SSL/TLS mode: Flexible', f: { title: 'Cloudflare → origin plain HTTP', sev: 'High', fix: 'Full (strict) + Origin CA cert' } },
    { t: 'WAF Managed Rules: On', ok: true },
    { t: 'dev.shopbd.com — DNS only (grey cloud) → origin IP 198.51.100.7', f: { title: 'Origin IP leak via unproxied subdomain', sev: 'Medium', fix: 'Proxy সব record + origin-এ শুধু CF IP' } },
  ] },
  { name: 'Nginx', icon: '🔀', ev: [
    { t: 'server_tokens off;', ok: true },
    { t: 'GET /.git/config → 200 OK', f: { title: 'Exposed .git directory (source code leak)', sev: 'High', fix: 'location ~ /\\. { deny all; }' } },
    { t: 'client_max_body_size 5m;', ok: true },
  ] },
  { name: 'Go Fiber API', icon: '⚙️', ev: [
    { t: 'GET /api/orders/:id — WHERE id=$1 (user_id শর্ত নেই)', f: { title: 'IDOR on orders endpoint', sev: 'High', fix: 'AND user_id=$2 + 404' } },
    { t: 'jwt.Parse(raw, keyFunc) — WithValidMethods নেই, secret="shopbd2024"', f: { title: 'Weak JWT secret + no alg pinning', sev: 'Critical', fix: '32-byte random secret + WithValidMethods' } },
    { t: 'db.Query("SELECT … WHERE email = $1", email)', ok: true },
    { t: 'POST /api/login — rate limit নেই', f: { title: 'No brute-force protection on login', sev: 'Medium', fix: 'Fiber limiter (IP+account) + Redis' } },
  ] },
  { name: 'PostgreSQL / Redis', icon: '🗄️', ev: [
    { t: 'Redis: bind 0.0.0.0, protected-mode no, requirepass নেই, port 6379 public', f: { title: 'Unauthenticated public Redis', sev: 'Critical', fix: 'bind 127.0.0.1 + ACL + firewall' } },
    { t: 'App connects as role "app_rw" (NOSUPERUSER)', ok: true },
    { t: 'Nightly pg_dump → same server /var/backups, unencrypted', f: { title: 'Backups on same host, unencrypted', sev: 'Medium', fix: 'Encrypted, offsite, immutable (R2 Object Lock)' } },
  ] },
  { name: 'Docker / Linux', icon: '🐳', ev: [
    { t: 'sshd: PasswordAuthentication no, PermitRootLogin no', ok: true },
    { t: 'api container: volumes: /var/run/docker.sock', f: { title: 'Docker socket mounted into API container', sev: 'Critical', fix: 'docker.sock mount সরাও' } },
    { t: 'unattended-upgrades: active', ok: true },
  ] },
];
const SEVS = ['Critical', 'High', 'Medium', 'Low'];
const SC = { Critical: 'var(--red)', High: 'var(--orange)', Medium: 'var(--amber)', Low: 'var(--muted)' };
const ALL = LAYERS.flatMap((l, li) => l.ev.map((e, ei) => ({ ...e, key: li + ':' + ei, layer: l.name })));
const FINDINGS = ALL.filter((e) => e.f);

export default function CapstoneLab({ onComplete }) {
  const [li, setLi] = useState(0);
  const [marks, setMarks] = useState({}); // key -> severity | 'ok'
  const [report, setReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const correct = FINDINGS.filter((f) => marks[f.key] === f.f.sev).length;
  const falsePos = ALL.filter((e) => e.ok && marks[e.key] && marks[e.key] !== 'ok').length;
  useCompletion(1, correct === FINDINGS.length && falsePos === 0 ? 1 : 0, onComplete);
  const L = LAYERS[li];

  const md = () => {
    const by = SEVS.map((s) => [s, FINDINGS.filter((f) => marks[f.key] === s)]);
    let out = `# Security Audit Report — ShopBD\n\n## Executive Summary\nমোট ${FINDINGS.filter((f) => marks[f.key] && marks[f.key] !== 'ok').length}টি finding: ` + by.map(([s, a]) => `${s} ${a.length}`).join(', ') + '। Critical finding গুলো deploy-blocker।\n\n';
    by.forEach(([s, arr]) => arr.forEach((f) => { out += `## [${s.toUpperCase()}] ${f.f.title}\n**Component:** ${f.layer}\n**Evidence:** \`${f.t}\`\n**Fix:** ${f.f.fix}\n\n`; }));
    return out;
  };

  return (
    <div className="stack">
      <div className="capstone-layers">
        {LAYERS.map((l, i) => {
          const doneHere = l.ev.every((e, ei) => marks[i + ':' + ei] !== undefined);
          return (
            <motion.button key={l.name} className={'cap-layer' + (li === i ? ' active' : '')} onClick={() => setLi(i)} whileHover={{ y: -3 }}>
              <span style={{ fontSize: 24 }}>{l.icon}</span>
              <span style={{ fontSize: 13 }}>{l.name}</span>
              {doneHere && <span className="badge ok" style={{ fontSize: 11 }}>✓ reviewed</span>}
              {i < LAYERS.length - 1 && <span className="cap-arrow">→</span>}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={li} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="section-h">{L.icon} {L.name} — evidence। প্রতিটি: ঠিক আছে, নাকি finding (severity সহ)?</div>
          {L.ev.map((e, ei) => {
            const key = li + ':' + ei;
            const m = marks[key];
            const right = m && (e.f ? m === e.f.sev : m === 'ok');
            return (
              <div key={key} className="cap-ev" style={{ borderColor: m ? (right ? 'var(--green)' : 'var(--red)') : 'var(--line)' }}>
                <div className="mono" style={{ fontSize: 13.5, flex: 1, minWidth: 220 }}>{e.t}</div>
                <div className="row" style={{ gap: 4 }}>
                  <button className={'btn sm ' + (m === 'ok' ? 'success' : '')} onClick={() => setMarks({ ...marks, [key]: 'ok' })}>✓ ঠিক আছে</button>
                  {SEVS.map((s) => <button key={s} className="btn sm" style={m === s ? { borderColor: SC[s], color: SC[s], background: 'rgba(255,255,255,.04)' } : {}} onClick={() => setMarks({ ...marks, [key]: s })}>{s}</button>)}
                </div>
                {m && !right && <div className="note bad" style={{ width: '100%' }}>{e.f ? (m === 'ok' ? '✖ এটা একটি সমস্যা — আবার দেখো।' : `✖ Severity আবার ভাবো (প্রভাব × সম্ভাবনা)।`) : '✖ এটা আসলে নিরাপদ configuration।'}</div>}
                {m && right && e.f && <div className="note good" style={{ width: '100%' }}>✅ {e.f.title} → {e.f.fix}</div>}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <div className="row">
        <span className="badge ok">সঠিক finding: {correct}/{FINDINGS.length}</span>
        {falsePos > 0 && <span className="badge bad">False positive: {falsePos}</span>}
        <button className="btn primary" onClick={() => setReport(true)}>📝 Audit report তৈরি করো</button>
      </div>
      {report && (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="section-h" style={{ margin: 0 }}>📄 report.md</div>
            <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(md()).then(() => setCopied(true)).catch(() => {}); }}>{copied ? '✓ Copied' : '📋 Copy Markdown'}</button>
          </div>
          <pre className="code" style={{ maxHeight: 360, overflow: 'auto', marginTop: 8 }}>{md()}</pre>
        </motion.div>
      )}
    </div>
  );
}
