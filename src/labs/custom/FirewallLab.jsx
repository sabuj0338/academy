import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

const PORTS = [
  { p: 22, s: 'ssh', v: 'OpenSSH 9.6' }, { p: 80, s: 'http', v: 'nginx 1.24' }, { p: 443, s: 'https', v: 'nginx 1.24' },
  { p: 3000, s: 'http', v: 'Node.js app (direct!)' }, { p: 5432, s: 'postgresql', v: 'PostgreSQL 16' }, { p: 6379, s: 'redis', v: 'Redis 7.2 (no auth)' }, { p: 2375, s: 'docker', v: 'Docker API (unauthenticated!)' },
];
const SOURCES = { any: 'any', office: '203.0.113.10 (অফিস)', cf: 'Cloudflare IP range', atk: '45.83.12.9 (attacker)' };
const TRAFFIC = [
  { from: 'office', port: 22, label: 'অফিস থেকে SSH', want: 'allow' },
  { from: 'atk', port: 22, label: 'Bot SSH brute-force', want: 'deny' },
  { from: 'cf', port: 443, label: 'Visitor (Cloudflare দিয়ে)', want: 'allow' },
  { from: 'atk', port: 443, label: 'সরাসরি origin IP-তে (CF bypass)', want: 'deny' },
  { from: 'atk', port: 3000, label: 'App-এ সরাসরি (Nginx bypass)', want: 'deny' },
  { from: 'atk', port: 5432, label: 'PostgreSQL scan', want: 'deny' },
  { from: 'atk', port: 6379, label: 'Redis exploit', want: 'deny' },
  { from: 'atk', port: 2375, label: 'Docker API takeover', want: 'deny' },
];
const matchSrc = (rule, from) => rule === 'any' || rule === from;

export default function FirewallLab({ onComplete }) {
  const [scanned, setScanned] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [policy, setPolicy] = useState('allow');
  const [rules, setRules] = useState([{ act: 'allow', src: 'any', port: '22' }]);
  const [draft, setDraft] = useState({ act: 'allow', src: 'any', port: '443' });
  const [res, setRes] = useState(null);
  const score = res ? res.filter((r) => r.ok).length : 0;
  useCompletion(1, res && score === TRAFFIC.length ? 1 : 0, onComplete);

  const scan = () => {
    setScanning(true); setScanned(0);
    PORTS.forEach((_, i) => setTimeout(() => { setScanned(i + 1); if (i === PORTS.length - 1) setScanning(false); }, 350 * (i + 1)));
  };
  const evaluate = () => setRes(TRAFFIC.map((t) => {
    const idx = rules.findIndex((r) => matchSrc(r.src, t.from) && (r.port === 'any' || +r.port === t.port));
    const act = idx >= 0 ? rules[idx].act : policy;
    return { ...t, act, idx, ok: act === t.want };
  }));
  const move = (i, d) => { const r = [...rules]; const j = i + d; if (j < 0 || j >= r.length) return; [r[i], r[j]] = [r[j], r[i]]; setRules(r); setRes(null); };

  return (
    <div className="stack">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="section-h" style={{ margin: 0 }}>① বাইরে থেকে নিজের server scan: <span className="mono">nmap -sV -p- 198.51.100.7</span></div>
          <button className="btn sm" onClick={scan} disabled={scanning}>{scanning ? 'Scanning…' : '▶ Scan'}</button>
        </div>
        <table className="tbl mono" style={{ marginTop: 8 }}>
          <thead><tr><th>PORT</th><th>STATE</th><th>SERVICE</th><th>VERSION</th></tr></thead>
          <tbody>
            {PORTS.slice(0, scanned).map((p) => (
              <motion.tr key={p.p} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: [3000, 5432, 6379, 2375].includes(p.p) ? 'var(--red)' : undefined }}>
                <td>{p.p}/tcp</td><td>open</td><td>{p.s}</td><td>{p.v}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {scanned === PORTS.length && <div className="note bad">💥 ৭টি port খোলা — এর ৪টি (3000, 5432, 6379, 2375) কখনোই internet-এ থাকা উচিত নয়।</div>}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="section-h">② UFW rules (উপর থেকে নিচে, প্রথম মিল জেতে)</div>
          {rules.map((r, i) => (
            <motion.div layout key={i + r.act + r.src + r.port} className="fw-rule mono">
              <span className="muted">{i + 1}.</span>
              <span style={{ color: r.act === 'allow' ? 'var(--green)' : 'var(--red)', width: 50 }}>{r.act.toUpperCase()}</span>
              <span style={{ flex: 1 }}>from {r.src === 'any' ? 'any' : SOURCES[r.src].split(' ')[0]} → port {r.port}</span>
              <button className="btn sm" onClick={() => move(i, -1)}>↑</button>
              <button className="btn sm" onClick={() => move(i, 1)}>↓</button>
              <button className="btn sm danger" onClick={() => { setRules(rules.filter((_, j) => j !== i)); setRes(null); }}>✕</button>
            </motion.div>
          ))}
          <div className="row" style={{ gap: 6, marginTop: 8 }}>
            <select className="input" style={{ width: 90 }} value={draft.act} onChange={(e) => setDraft({ ...draft, act: e.target.value })}><option value="allow">ALLOW</option><option value="deny">DENY</option></select>
            <select className="input" style={{ width: 190 }} value={draft.src} onChange={(e) => setDraft({ ...draft, src: e.target.value })}>{Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select className="input" style={{ width: 90 }} value={draft.port} onChange={(e) => setDraft({ ...draft, port: e.target.value })}>{['any', '22', '80', '443', '3000', '5432', '6379', '2375'].map((p) => <option key={p}>{p}</option>)}</select>
            <button className="btn sm primary" onClick={() => { setRules([...rules, draft]); setRes(null); }}>+ Rule</button>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <span className="muted">Default incoming policy:</span>
            {['allow', 'deny'].map((p) => <button key={p} className={'btn sm ' + (policy === p ? (p === 'deny' ? 'success' : 'danger') : '')} onClick={() => { setPolicy(p); setRes(null); }}>{p.toUpperCase()}</button>)}
          </div>
          <button className="btn primary" style={{ marginTop: 12, width: '100%' }} onClick={evaluate}>③ Traffic চালাও</button>
        </div>
        <div className="card">
          <div className="section-h">Traffic simulation {res && <span className={'badge ' + (score === TRAFFIC.length ? 'ok' : 'warn')}>{score}/{TRAFFIC.length} সঠিক</span>}</div>
          <AnimatePresence>
            {TRAFFIC.map((t, i) => {
              const r = res?.[i];
              return (
                <motion.div key={t.label} className="fw-pkt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span style={{ width: 22 }}>{t.from === 'atk' ? '😈' : t.from === 'cf' ? '☁️' : '🏢'}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{t.label} <span className="mono muted">:{t.port}</span></span>
                  {r && (
                    <motion.span initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className={'badge ' + (r.ok ? 'ok' : 'bad')}>{r.act === 'allow' ? '→ ঢুকল' : '⛔ আটকাল'} {r.ok ? '✓' : '✖'}<span className="muted" style={{ marginLeft: 4 }}>{r.idx >= 0 ? `rule ${r.idx + 1}` : 'default'}</span></motion.span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {res && score < TRAFFIC.length && <div className="note warn">টিপ: সবচেয়ে নিরাপদ: default DENY, তারপর শুধু অফিস → 22 এবং Cloudflare → 443 ALLOW।</div>}
          {res && score === TRAFFIC.length && <div className="note good">🎉 নিখুঁত firewall! মনে রেখো: Docker port publish UFW bypass করতে পারে — compose-এ 127.0.0.1 bind করো।</div>}
        </div>
      </div>
    </div>
  );
}
