import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

function buildLogs() {
  const L = [];
  const t = (m, s) => `2026-11-10T03:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}Z`;
  const normal = ['103.48.16.22', '27.147.201.9', '114.130.54.77'];
  let m = 0, s = 2;
  const push = (ip, method, path, status, extra = '') => { L.push({ ts: t(m, s), ip, method, path, status, extra }); s += 7; if (s >= 60) { s -= 60; m++; } };
  push(normal[0], 'GET', '/', 200);
  push(normal[1], 'GET', '/api/products?page=1', 200);
  push('45.83.12.9', 'GET', '/.env', 404, 'ua=Mozilla/5.0 zgrab/0.x');
  push('45.83.12.9', 'GET', '/wp-admin/', 404, 'ua=zgrab');
  push(normal[2], 'POST', '/api/login', 200, 'email=nusrat@mail.com');
  push('45.83.12.9', 'GET', "/api/products?id=1'%20OR%201=1--", 500, 'ua=sqlmap/1.8');
  for (let i = 0; i < 9; i++) push('185.220.101.4', 'POST', '/api/login', 401, 'email=admin@shop.local');
  push(normal[0], 'GET', '/api/me', 200);
  push('45.83.12.9', 'GET', '/api/download?file=../../etc/passwd', 400, 'ua=curl/8.5');
  for (let i = 0; i < 5; i++) push('185.220.101.4', 'POST', '/api/login', 401, 'email=admin@shop.local');
  push('185.220.101.4', 'POST', '/api/login', 200, 'email=admin@shop.local');
  push('185.220.101.4', 'GET', '/api/admin/users/export', 200, 'bytes=4821193');
  push(normal[1], 'POST', '/api/login', 401, 'email=karim@mail.com');
  push(normal[1], 'POST', '/api/login', 200, 'email=karim@mail.com');
  push('45.83.12.9', 'GET', '/phpmyadmin/', 404, 'ua=zgrab');
  push(normal[2], 'GET', '/api/orders', 200);
  return L;
}
const Q = [
  { id: 'ip', q: 'কোন IP brute-force করেছে?', opts: ['103.48.16.22', '185.220.101.4', '45.83.12.9', '27.147.201.9'], a: '185.220.101.4' },
  { id: 'acct', q: 'কোন account আপস (compromised) হয়েছে?', opts: ['nusrat@mail.com', 'karim@mail.com', 'admin@shop.local', 'কোনোটাই না'], a: 'admin@shop.local' },
  { id: 'exfil', q: 'Breach-এর পরে attacker কী করেছে?', opts: ['কিছুই না', 'User data export (4.8 MB)', 'Password বদলেছে', 'Logout করেছে'], a: 'User data export (4.8 MB)' },
  { id: 'first', q: 'প্রথম containment পদক্ষেপ কী?', opts: ['Log মুছে ফেলা', 'Admin session revoke + password reset + IP block', 'Nginx restart', 'অপেক্ষা করা'], a: 'Admin session revoke + password reset + IP block' },
];
const TYPES = [['sqli', 'SQL Injection probe', true], ['trav', 'Path traversal', true], ['scan', 'Recon / scanner', true], ['xss', 'XSS', false], ['ddos', 'DDoS', false]];

export default function LogLab({ onComplete }) {
  const logs = useMemo(buildLogs, []);
  const [filter, setFilter] = useState('');
  const [ans, setAns] = useState({});
  const [types, setTypes] = useState({});
  const [checked, setChecked] = useState(false);
  const rows = logs.filter((l) => !filter || `${l.ts} ${l.ip} ${l.method} ${l.path} ${l.status} ${l.extra}`.toLowerCase().includes(filter.toLowerCase()));
  const typesOk = TYPES.every(([k, , v]) => !!types[k] === v);
  const allOk = Q.every((q) => ans[q.id] === q.a) && typesOk;
  useCompletion(1, checked && allOk ? 1 : 0, onComplete);
  const counts = useMemo(() => { const c = {}; logs.filter((l) => l.status === 401).forEach((l) => (c[l.ip] = (c[l.ip] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1]); }, [logs]);

  return (
    <div className="stack">
      <div className="row">
        <input className="input mono" style={{ maxWidth: 320 }} placeholder="filter: IP, status, path…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {['401', '185.220', '45.83', '/api/login', 'export', ' 500'].map((f) => <button key={f} className="cmd-chip mono" onClick={() => setFilter(f.trim())}>{f.trim()}</button>)}
        <button className="btn sm" onClick={() => setFilter('')}>সব দেখাও</button>
        <span className="muted">{rows.length}/{logs.length} লাইন</span>
      </div>
      <div className="log-box mono">
        {rows.map((l, i) => (
          <motion.div key={l.ts + i} className="log-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="muted">{l.ts.slice(11, 19)}</span>
            <span style={{ color: '#a78bfa', width: 120 }}>{l.ip}</span>
            <span style={{ width: 44 }}>{l.method}</span>
            <span style={{ color: l.status >= 500 ? 'var(--red)' : l.status >= 400 ? 'var(--amber)' : 'var(--green)', width: 34 }}>{l.status}</span>
            <span style={{ flex: 1, wordBreak: 'break-all' }}>{l.path} <span className="muted">{l.extra}</span></span>
          </motion.div>
        ))}
      </div>
      <div className="card" style={{ padding: 12 }}>
        <span className="muted">📊 401 per IP: </span>{counts.map(([ip, n]) => <span key={ip} className="badge" style={{ marginRight: 6 }}>{ip}: {n}</span>)}
      </div>
      <div className="grid2">
        {Q.map((q) => (
          <div key={q.id} className="card">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{q.q}</div>
            {q.opts.map((o) => (
              <button key={o} className={'quiz-opt' + (checked && ans[q.id] === o ? (o === q.a ? ' right' : ' wrong') : ans[q.id] === o ? ' sel-opt' : '')} onClick={() => { setAns({ ...ans, [q.id]: o }); setChecked(false); }} style={{ fontSize: 14, padding: '8px 12px' }}>{o}</button>
            ))}
          </div>
        ))}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>45.83.12.9 কোন কোন ধরনের আক্রমণ চেষ্টা করেছে?</div>
          {TYPES.map(([k, l, v]) => (
            <label key={k} className="check-row" style={{ color: checked ? (!!types[k] === v ? 'var(--green)' : 'var(--red)') : undefined }}>
              <input type="checkbox" checked={!!types[k]} onChange={(e) => { setTypes({ ...types, [k]: e.target.checked }); setChecked(false); }} /> {l}
            </label>
          ))}
        </div>
      </div>
      <button className="btn primary" onClick={() => setChecked(true)}>🔍 তদন্ত রিপোর্ট জমা দাও</button>
      {checked && <div className={'note ' + (allOk ? 'good' : 'warn')}>{allOk ? '🎉 চমৎকার বিশ্লেষণ! ১৪টি ব্যর্থ login-এর পরে সফল login = brute-force সফল। তারপর ৪.৮ MB user export = data breach। এখন: session revoke, password reset + MFA, IP block, user-দের জানানো।' : 'কিছু উত্তর ভুল (লাল)। Filter দিয়ে লগ আবার দেখো — বিশেষ করে 401-এর পরের 200।'}</div>}
    </div>
  );
}
