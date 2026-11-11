import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

const H = [
  { id: 'hsts', name: 'Strict-Transport-Security', val: 'max-age=63072000; includeSubDomains; preload', stops: 'SSL stripping / HTTP downgrade', w: 25 },
  { id: 'csp', name: 'Content-Security-Policy', val: "default-src 'self'; object-src 'none'; frame-ancestors 'none'", stops: 'XSS-এর প্রভাব, data injection', w: 25 },
  { id: 'xcto', name: 'X-Content-Type-Options', val: 'nosniff', stops: 'MIME sniffing (upload করা ফাইল script হিসেবে চলা)', w: 10 },
  { id: 'xfo', name: 'X-Frame-Options', val: 'DENY', stops: 'Clickjacking', w: 15 },
  { id: 'ref', name: 'Referrer-Policy', val: 'strict-origin-when-cross-origin', stops: 'URL-এ থাকা token/ID অন্য site-এ leak', w: 10 },
  { id: 'perm', name: 'Permissions-Policy', val: 'camera=(), microphone=(), geolocation=()', stops: 'Injected script দিয়ে camera/mic অপব্যবহার', w: 10 },
  { id: 'xpb', name: 'X-Powered-By: Next.js (সরাও)', val: '', stops: 'Tech stack fingerprinting', w: 5, remove: true },
];
const grade = (s) => (s >= 100 ? 'A+' : s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 50 ? 'C' : s >= 30 ? 'D' : 'F');
const gColor = (g) => (g.startsWith('A') ? 'var(--green)' : g === 'B' ? '#a3e635' : g === 'C' ? 'var(--amber)' : 'var(--red)');

export default function HeadersLab({ onComplete }) {
  const [on, setOn] = useState({});
  const score = H.reduce((s, h) => s + (on[h.id] ? h.w : 0), 0);
  const g = grade(score);
  useCompletion(1, g === 'A+' ? 1 : 0, onComplete);
  return (
    <div className="grid2">
      <div className="card">
        <div className="section-h">Header চালু/বন্ধ করো</div>
        {H.map((h) => (
          <motion.label key={h.id} className="check-row" whileHover={{ x: 3 }}>
            <input type="checkbox" checked={!!on[h.id]} onChange={(e) => setOn({ ...on, [h.id]: e.target.checked })} />
            <span><b className="mono" style={{ fontSize: 13.5 }}>{h.name}</b><br /><span className="muted" style={{ fontSize: 13 }}>আটকায়: {h.stops}</span></span>
          </motion.label>
        ))}
      </div>
      <div className="stack">
        <div className="card" style={{ textAlign: 'center' }}>
          <motion.div key={g} className="grade" style={{ color: gColor(g), borderColor: gColor(g) }} initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>{g}</motion.div>
          <div className="muted">Security header score: {score}/100</div>
        </div>
        <div className="card">
          <div className="section-h">curl -sI https://shop.example.com</div>
          <pre className="code">{['HTTP/2 200', 'content-type: text/html', !on.xpb && 'x-powered-by: Next.js', ...H.filter((h) => on[h.id] && !h.remove).map((h) => `${h.name.toLowerCase()}: ${h.val}`)].filter(Boolean).join('\n')}</pre>
        </div>
      </div>
    </div>
  );
}
