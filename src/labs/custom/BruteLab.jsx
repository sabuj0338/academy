import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Toggle, useCompletion } from '../../components/ui.jsx';

// সরল মডেল: password টি rockyou top-10k-এর মধ্যে (গড়ে ৫০০০ চেষ্টা লাগে)
const fmt = (sec) => {
  if (!isFinite(sec)) return 'কখনো না (MFA)';
  if (sec < 60) return `${sec.toFixed(0)} সেকেন্ড`;
  if (sec < 3600) return `${(sec / 60).toFixed(0)} মিনিট`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} ঘণ্টা`;
  if (sec < 86400 * 365) return `${(sec / 86400).toFixed(0)} দিন`;
  return `${(sec / 86400 / 365).toFixed(1)} বছর`;
};

export default function BruteLab({ onComplete }) {
  const [d, setD] = useState({ ip: false, acct: false, captcha: false, mfa: false, generic: false });
  const [botnet, setBotnet] = useState(false);
  const [ticks, setTicks] = useState(0);
  const m = useMemo(() => {
    let rate = 50; // req/s single bot
    const ips = botnet ? 1000 : 1;
    if (d.ip) rate = Math.min(rate * ips, (5 / 60) * ips); else rate = rate * (botnet ? 20 : 1);
    if (d.acct) rate = Math.min(rate, 5 / 3600); // প্রতি account ঘণ্টায় ৫টি
    if (d.captcha) rate = rate / 50;
    const time = d.mfa ? Infinity : 5000 / rate;
    const userPain = d.acct && !d.captcha ? 'মাঝারি (৫ বার ভুল হলে অপেক্ষা)' : d.captcha ? 'সামান্য (সন্দেহ হলে Turnstile)' : 'নেই';
    return { rate, time, userPain };
  }, [d, botnet]);
  const safe = m.time > 86400 * 365 || d.mfa;
  useCompletion(1, safe && botnet && (d.acct || d.mfa) && d.generic ? 1 : 0, onComplete);
  useEffect(() => { const t = setInterval(() => setTicks((x) => x + 1), 120); return () => clearInterval(t); }, []);
  const streamCount = Math.min(14, Math.max(1, Math.round(Math.log10(m.rate * 100 + 1) * 4)));

  return (
    <div className="stack">
      <div className="grid2">
        <div className="card">
          <div className="section-h">🛡 তোমার defense</div>
          <div className="stack" style={{ gap: 8 }}>
            <Toggle on={d.ip} onChange={(v) => setD({ ...d, ip: v })} label="Per-IP rate limit (5/min)" />
            <Toggle on={d.acct} onChange={(v) => setD({ ...d, acct: v })} label="Per-account limit (৫/ঘণ্টা) + temporary lockout" />
            <Toggle on={d.captcha} onChange={(v) => setD({ ...d, captcha: v })} label="সন্দেহজনক হলে Turnstile/CAPTCHA" />
            <Toggle on={d.mfa} onChange={(v) => setD({ ...d, mfa: v })} label="MFA (TOTP / passkey)" />
            <Toggle on={d.generic} onChange={(v) => setD({ ...d, generic: v })} label='Generic error ("Email অথবা password ভুল")' />
          </div>
          <div className="section-h" style={{ marginTop: 14, color: 'var(--red)' }}>😈 Attacker</div>
          <Toggle on={botnet} onChange={setBotnet} label="Botnet: ১০০০টি আলাদা IP ব্যবহার করে" color="var(--red)" />
        </div>
        <div className="card">
          <div className="section-h">📈 Live simulation</div>
          <div className="brute-stream">
            {Array.from({ length: streamCount }).map((_, i) => (
              <motion.span key={i + '-' + (ticks % 50)} className="mono" initial={{ x: -20, opacity: 0 }} animate={{ x: 260, opacity: [0, 1, 1, 0] }} transition={{ duration: 1.6, delay: i * 0.08 }} style={{ top: (i % 7) * 18 }}>
                {['123456', 'password', 'rahim123', 'qwerty', 'dhaka2026'][(i + ticks) % 5]}
              </motion.span>
            ))}
          </div>
          <div className="metric"><span>চেষ্টার হার</span><b className="mono">{m.rate >= 1 ? m.rate.toFixed(0) : m.rate.toFixed(4)} /সেকেন্ড</b></div>
          <div className="metric"><span>Password ভাঙতে আনুমানিক সময়</span><b style={{ color: safe ? 'var(--green)' : 'var(--red)' }}>{fmt(m.time)}</b></div>
          <div className="metric"><span>User enumeration</span><b style={{ color: d.generic ? 'var(--green)' : 'var(--amber)' }}>{d.generic ? 'বন্ধ' : '"Email registered নয়" — valid email ফাঁস'}</b></div>
          <div className="metric"><span>আসল user-এর ভোগান্তি</span><b>{m.userPain}</b></div>
          {botnet && d.ip && !d.acct && !d.mfa && <div className="note warn">⚠ Botnet প্রতি IP-তে limit-এর নিচে থেকে চেষ্টা করছে — per-IP limit একা যথেষ্ট নয়!</div>}
          {d.mfa && <div className="note good">✅ Password ভাঙলেও MFA ছাড়া login নেই।</div>}
        </div>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>লক্ষ্য: Botnet চালু থাকা অবস্থায় ভাঙার সময় ১ বছরের বেশি (বা MFA), per-account বা MFA defense, এবং generic error message।</div>
    </div>
  );
}
