import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle, useCompletion } from '../../components/ui.jsx';

const ATTACKS = [
  { id: 'xss', icon: '📜', name: 'XSS: document.cookie চুরি', need: 'httpOnly', why: 'Comment-এ ঢোকানো script document.cookie পড়ে attacker-এর server-এ পাঠায়।', block: 'HttpOnly: JavaScript cookie দেখতেই পায় না — document.cookie খালি।' },
  { id: 'sniff', icon: '📶', name: 'Public Wi-Fi sniffing (http://)', need: 'secure', why: 'User ভুলে http:// link খুলল। Cookie plain text-এ গেল, café Wi-Fi-তে attacker পড়ে ফেলল।', block: 'Secure: cookie শুধু HTTPS-এ যায় — http:// request-এ পাঠানোই হয় না।' },
  { id: 'csrf', icon: '🎭', name: 'CSRF: evil.com থেকে POST', need: 'samesite', why: 'evil.com-এর লুকানো form bank-এ POST করল, browser cookie জুড়ে দিল।', block: 'SameSite=Lax/Strict: অন্য site থেকে আসা POST-এ cookie যায় না।' },
];

export default function CookieLab({ onComplete }) {
  const [flags, setFlags] = useState({ httpOnly: false, secure: false, samesite: 'None' });
  const [run, setRun] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [stolen, setStolen] = useState([]);
  useCompletion(ATTACKS.length, blocked.length, onComplete);

  const protectedBy = (a) => (a.need === 'samesite' ? flags.samesite !== 'None' : flags[a.need]);
  const launch = (a) => {
    const ok = protectedBy(a);
    setRun({ a, ok, k: Date.now() });
    if (ok) setBlocked((b) => (b.includes(a.id) ? b : [...b, a.id]));
    else setStolen((s) => (s.includes(a.id) ? s : [...s, a.id]));
  };
  const header = `Set-Cookie: session=8f2a…c91; Path=/${flags.httpOnly ? '; HttpOnly' : ''}${flags.secure ? '; Secure' : ''}; SameSite=${flags.samesite}`;

  return (
    <div className="stack">
      <div className="card">
        <div className="section-h">🍪 Server যে cookie পাঠাচ্ছে</div>
        <pre className="code">{header}</pre>
        <div className="row" style={{ marginTop: 10 }}>
          <Toggle on={flags.httpOnly} onChange={(v) => setFlags({ ...flags, httpOnly: v })} label="HttpOnly" />
          <Toggle on={flags.secure} onChange={(v) => setFlags({ ...flags, secure: v })} label="Secure" />
          <div className="row" style={{ gap: 4 }}>
            <span className="muted">SameSite:</span>
            {['None', 'Lax', 'Strict'].map((s) => <button key={s} className={'btn sm ' + (flags.samesite === s ? 'primary' : '')} onClick={() => setFlags({ ...flags, samesite: s })}>{s}</button>)}
          </div>
        </div>
      </div>
      <div className="grid3">
        {ATTACKS.map((a) => (
          <div key={a.id} className="card" style={{ borderColor: blocked.includes(a.id) ? 'var(--green)' : stolen.includes(a.id) ? 'var(--red)' : undefined }}>
            <div style={{ fontSize: 28 }}>{a.icon}</div>
            <div style={{ fontWeight: 600 }}>{a.name}</div>
            <p className="muted" style={{ fontSize: 14 }}>{a.why}</p>
            <button className="btn danger sm" onClick={() => launch(a)}>😈 আক্রমণ চালাও</button>
            {blocked.includes(a.id) && <div className="badge ok" style={{ marginTop: 8 }}>✓ আটকানো গেছে</div>}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {run && (
          <motion.div key={run.k} className="card cookie-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="cookie-track">
              <span className="actor">🧑 Browser</span>
              <motion.span className="cookie" initial={{ left: '12%' }} animate={run.ok ? { left: ['12%', '45%', '42%'], rotate: [0, 0, -20] } : { left: ['12%', '85%'] }} transition={{ duration: 1.2 }}>🍪</motion.span>
              {run.ok && <motion.span className="shield" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.6 }}>🛡️</motion.span>}
              <span className="actor" style={{ right: 0, position: 'absolute' }}>😈 Attacker</span>
            </div>
            <div className={'note ' + (run.ok ? 'good' : 'bad')}>{run.ok ? '✅ ' + run.a.block : '💥 Cookie চুরি! Attacker এখন password ছাড়াই তোমার session ব্যবহার করে logged in। ঠিক কোন flag এটা আটকাত?'}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="muted" style={{ fontSize: 14 }}>লক্ষ্য: তিনটি আক্রমণই আটকাও ({blocked.length}/3)। প্রতিটি flag একটি নির্দিষ্ট আক্রমণ ঠেকায় — কোনটা কোনটা, খেয়াল করো।</div>
    </div>
  );
}
