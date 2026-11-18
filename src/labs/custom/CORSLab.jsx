import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

const CONFIGS = [
  { id: 'none', name: 'কোনো CORS header নেই', code: '// cors middleware নেই' },
  { id: 'reflect', name: 'Origin reflect + credentials', code: "origin: true,   // যে আসে তাকেই অনুমতি\ncredentials: true" },
  { id: 'wild', name: 'Wildcard *', code: "origin: '*'" },
  { id: 'suffix', name: 'Suffix check (bug)', code: "origin: (o, cb) => cb(null, o.endsWith('example.com')),\ncredentials: true" },
  { id: 'nul', name: '"null" allowed', code: "origin: ['https://app.example.com', 'null'],\ncredentials: true" },
  { id: 'allow', name: 'Explicit allowlist', code: "origin: 'https://app.example.com',\ncredentials: true" },
];
const ORIGINS = [
  { o: 'https://app.example.com', label: 'তোমার frontend', good: true },
  { o: 'https://evil.com', label: 'Attacker site' },
  { o: 'https://evilexample.com', label: 'Attacker (চালাক নাম)' },
  { o: 'null', label: 'Sandboxed iframe' },
];

function respond(cfg, origin) {
  switch (cfg) {
    case 'none': return {};
    case 'reflect': return { acao: origin, acac: true };
    case 'wild': return { acao: '*' };
    case 'suffix': return origin.endsWith('example.com') ? { acao: origin, acac: true } : {};
    case 'nul': return origin === 'https://app.example.com' || origin === 'null' ? { acao: origin, acac: true } : {};
    case 'allow': return origin === 'https://app.example.com' ? { acao: origin, acac: true } : {};
    default: return {};
  }
}
// Browser-এর নিয়ম: credentials সহ request-এ ACAO হুবহু origin হতে হবে এবং ACAC true
const canRead = (h, origin) => h.acao === origin && h.acac === true;

export default function CORSLab({ onComplete }) {
  const [cfg, setCfg] = useState('none');
  const [results, setResults] = useState({});
  const [found, setFound] = useState({ leak: false, fixed: false });
  useCompletion(2, (found.leak ? 1 : 0) + (found.fixed ? 1 : 0), onComplete);

  const fire = () => {
    const r = Object.fromEntries(ORIGINS.map(({ o }) => { const h = respond(cfg, o); return [o, { h, read: canRead(h, o) }]; }));
    setResults(r);
    const evilRead = ORIGINS.some((x) => !x.good && r[x.o].read);
    const appRead = r['https://app.example.com'].read;
    setFound((f) => ({ leak: f.leak || evilRead, fixed: f.fixed || (!evilRead && appRead) }));
  };

  return (
    <div className="stack">
      <div className="grid2">
        <div className="card">
          <div className="section-h">⚙️ Express-এর cors() config বেছে নাও</div>
          <div className="stack" style={{ gap: 6 }}>
            {CONFIGS.map((c) => <button key={c.id} className={'btn sm ' + (cfg === c.id ? 'primary' : '')} style={{ justifyContent: 'flex-start' }} onClick={() => { setCfg(c.id); setResults({}); }}>{c.name}</button>)}
          </div>
          <pre className="code" style={{ marginTop: 10 }}>{CONFIGS.find((c) => c.id === cfg).code}</pre>
          <button className="btn danger" style={{ marginTop: 10 }} onClick={fire}>🌐 সব origin থেকে fetch('/api/me', {'{'}credentials:'include'{'}'})</button>
        </div>
        <div className="stack">
          {ORIGINS.map(({ o, label, good }) => {
            const r = results[o];
            return (
              <motion.div key={o} className="card" layout style={{ borderColor: r ? (r.read ? (good ? 'var(--green)' : 'var(--red)') : good ? 'var(--amber)' : 'var(--cyan)') : undefined, padding: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span><span className="mono">{o}</span> <span className="muted">· {label}</span></span>
                  {r && <span className={'badge ' + (r.read ? (good ? 'ok' : 'bad') : '')}>{r.read ? (good ? '✓ পড়তে পারে' : '💥 data পড়ে ফেলল') : '🚫 browser আটকে দিল'}</span>}
                </div>
                <AnimatePresence>
                  {r && (
                    <motion.div className="mono muted" style={{ fontSize: 12.5, marginTop: 4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      Access-Control-Allow-Origin: {r.h.acao || '(নেই)'}{r.h.acac ? ' · Allow-Credentials: true' : ''}
                      {r.read && !good && <div style={{ color: 'var(--red)' }}>{'{"email":"rahim@mail.com","phone":"01711…","balance":125000}'}</div>}
                      {o === 'https://app.example.com' && !r.read && <div style={{ color: 'var(--amber)' }}>⚠ তোমার নিজের frontend-ও পড়তে পারছে না!</div>}
                      {cfg === 'wild' && <div>* + credentials browser নিজেই নিষেধ করে — তাই wildcard-এ cookie-ভিত্তিক data পড়া যায় না।</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="row">
        <span className={'badge ' + (found.leak ? 'bad' : '')}>{found.leak ? '✓' : '○'} এমন config খুঁজে বের করো যেখানে attacker data পড়ে</span>
        <span className={'badge ' + (found.fixed ? 'ok' : '')}>{found.fixed ? '✓' : '○'} এমন config যেখানে শুধু তোমার frontend পড়তে পারে</span>
      </div>
    </div>
  );
}
