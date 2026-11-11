import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// Back-of-the-envelope estimation — খাতা-কলমের হিসাব
const DAU = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8];
const fmt = (n) => (n >= 1e12 ? (n / 1e12).toFixed(1) + ' T' : n >= 1e9 ? (n / 1e9).toFixed(1) + ' B' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' M' : n >= 1e3 ? (n / 1e3).toFixed(1) + ' K' : Math.round(n) + '');
const bytes = (b) => (b >= 1e15 ? (b / 1e15).toFixed(1) + ' PB' : b >= 1e12 ? (b / 1e12).toFixed(1) + ' TB' : b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : (b / 1e3).toFixed(0) + ' KB');
const PRESETS = [
  { n: '📸 Photo app', d: 4, r: 50, w: 2, s: 500, p: 3 },
  { n: '💬 Chat app', d: 4, r: 100, w: 40, s: 1, p: 2 },
  { n: '🛒 BD e-commerce', d: 3, r: 30, w: 1, s: 5, p: 5 },
  { n: '🔗 URL shortener', d: 3, r: 10, w: 0.2, s: 0.5, p: 3 },
];

export default function EstimateLab({ onComplete }) {
  const [d, setD] = useState(3); // index
  const [r, setR] = useState(30); // reads per user/day
  const [w, setW] = useState(2); // writes per user/day
  const [s, setS] = useState(5); // KB per write
  const [p, setP] = useState(3); // peak factor
  const [done, setDone] = useState([]);
  const users = DAU[d];
  const reqDay = users * (r + w);
  const qps = reqDay / 86400;
  const peak = qps * p;
  const wqps = (users * w) / 86400;
  const storeDay = users * w * s * 1000;
  const store5 = storeDay * 365 * 5;
  const bw = (users * r * s * 1000) / 86400;
  const servers = Math.max(1, Math.ceil(peak / 1000));
  const tasks = [
    { id: 'peak', text: 'এমন সেটিং করো যাতে Peak QPS ১০,০০০ ছাড়ায়' },
    { id: 'pb', text: '৫ বছরের storage ১ PB (petabyte) ছাড়ায় এমন app বানাও' },
    { id: 'small', text: 'এমন app যেটা ১টা server-এই চলে (peak < 1000 QPS) কিন্তু ১ লাখ+ user' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  useEffect(() => {
    const nd = [];
    if (peak > 1e4) nd.push('peak');
    if (store5 > 1e15) nd.push('pb');
    if (peak < 1000 && users >= 1e5) nd.push('small');
    if (nd.some((x) => !done.includes(x))) setDone((x) => [...new Set([...x, ...nd])]);
  }, [peak, store5, users]); // eslint-disable-line

  const slider = ({ label, v, set, min, max, step = 1, show }) => (
    <div><label className="lbl">{label}: <b style={{ color: 'var(--text)' }}>{show}</b></label><input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} style={{ width: '100%', accentColor: '#a78bfa' }} /></div>
  );

  return (
    <div className="stack">
      <div className="row" style={{ gap: 6 }}>{PRESETS.map((x) => <button key={x.n} className="btn sm" onClick={() => { setD(x.d); setR(x.r); setW(x.w); setS(x.s); setP(x.p); }}>{x.n}</button>)}</div>
      <div className="grid2">
        <div className="card">
          {slider({ label: '👥 Daily Active Users (DAU)', v: d, set: setD, min: 0, max: 5, show: fmt(users) })}
          {slider({ label: '👀 প্রতি user দিনে কয়বার পড়ে (read)', v: r, set: setR, min: 1, max: 200, show: r })}
          {slider({ label: '✍️ প্রতি user দিনে কয়বার লেখে (write)', v: w, set: setW, min: 0.2, max: 50, step: 0.2, show: w })}
          {slider({ label: '📦 প্রতিটি write-এর আকার (KB)', v: s, set: setS, min: 0.5, max: 2000, step: 0.5, show: s + ' KB' })}
          {slider({ label: '📈 Peak factor (সবচেয়ে ব্যস্ত সময় গড়ের কত গুণ)', v: p, set: setP, min: 1, max: 10, show: p + '×' })}
        </div>
        <div className="card">
          <div className="metric"><span>মোট request / দিন</span><b>{fmt(reqDay)}</b></div>
          <div className="metric"><span>গড় QPS (÷ 86,400 সেকেন্ড)</span><b>{fmt(qps)}</b></div>
          <div className="metric"><span>🔥 Peak QPS</span><b style={{ color: peak > 1e4 ? '#f87171' : '#4ade80' }}>{fmt(peak)}</b></div>
          <div className="metric"><span>Write QPS</span><b>{fmt(wqps)}</b></div>
          <div className="metric"><span>নতুন storage / দিন</span><b>{bytes(storeDay)}</b></div>
          <div className="metric"><span>💾 ৫ বছরে storage</span><b style={{ color: '#fbbf24' }}>{bytes(store5)}</b></div>
          <div className="metric"><span>Read bandwidth (গড়)</span><b>{bytes(bw)}/s</b></div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>অনুমান: ১টি app server ≈ 1,000 QPS সামলায়</div>
        </div>
      </div>
      <div className="card">
        <div className="section-h">🖥️ দরকারি app server (peak-এ): {servers.toLocaleString()}টি {servers > 60 && '(দেখানো হচ্ছে ৬০টি)'}</div>
        <div className="server-farm">
          {Array.from({ length: Math.min(servers, 60) }, (_, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }}>🖥️</motion.span>)}
        </div>
        <div className="muted" style={{ fontSize: 13.5 }}>💡 Interview বা design-এর শুরুতেই এই হিসাব করলে বুঝবে: একটা server যথেষ্ট, নাকি cache/replica/sharding লাগবে। ১ দিন ≈ ১ লাখ সেকেন্ড (86,400) — মনে রাখার সহজ কৌশল।</div>
      </div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
