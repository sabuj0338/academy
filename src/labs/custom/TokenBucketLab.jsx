import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

// প্রতিটি client-এর আলাদা bucket। ১০ সেকেন্ডের simulation।
export default function TokenBucketLab({ onComplete }) {
  const [cap, setCap] = useState(10);
  const [refill, setRefill] = useState(1);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [stats, setStats] = useState({ user: { ok: 0, no: 0, tokens: 10 }, bot: { ok: 0, no: 0, tokens: 10 } });
  const [flash, setFlash] = useState([]);
  const [win, setWin] = useState(false);
  const sim = useRef(null);
  useCompletion(1, win ? 1 : 0, onComplete);

  const start = () => {
    sim.current = { t: 0, user: { ok: 0, no: 0, tokens: cap }, bot: { ok: 0, no: 0, tokens: cap }, nextUser: 0 };
    setRunning(true); setT(0); setFlash([]);
  };

  useEffect(() => {
    if (!running) return;
    const dt = 0.05;
    const id = setInterval(() => {
      const s = sim.current;
      s.t += dt;
      for (const k of ['user', 'bot']) s[k].tokens = Math.min(cap, s[k].tokens + refill * dt);
      const events = [];
      const hit = (k) => { if (s[k].tokens >= 1) { s[k].tokens -= 1; s[k].ok++; events.push({ k, ok: true }); } else { s[k].no++; events.push({ k, ok: false }); } };
      // bot: ২০ req/s
      if (Math.random() < 20 * dt) hit('bot');
      // user: প্রতি ~৩ সেকেন্ডে ৪টি request-এর burst (page load)
      if (s.t >= s.nextUser) { for (let i = 0; i < 4; i++) hit('user'); s.nextUser = s.t + 2.5 + Math.random(); }
      setStats({ user: { ...s.user }, bot: { ...s.bot } });
      setT(s.t);
      if (events.length) setFlash((f) => [...f.slice(-24), ...events.map((e) => ({ ...e, id: Math.random() }))]);
      if (s.t >= 10) {
        setRunning(false);
        const botBlock = s.bot.no / Math.max(1, s.bot.ok + s.bot.no);
        if (s.user.no === 0 && botBlock >= 0.8) setWin(true);
      }
    }, 50);
    return () => clearInterval(id);
  }, [running, cap, refill]);

  const Bucket = ({ k, label, icon }) => {
    const st = stats[k];
    const pct = Math.max(0, Math.min(1, st.tokens / cap));
    const total = st.ok + st.no;
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600 }}>{icon} {label}</div>
        <div className="bucket">
          <motion.div className="bucket-fill" animate={{ height: pct * 100 + '%' }} transition={{ duration: 0.05 }} />
          <div className="bucket-num mono">{st.tokens.toFixed(1)} / {cap}</div>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="badge ok">200: {st.ok}</span>
          <span className="badge bad">429: {st.no}</span>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>blocked {total ? Math.round((st.no / total) * 100) : 0}%</div>
        <div className="req-dots">
          {flash.filter((f) => f.k === k).slice(-12).map((f) => <motion.span key={f.id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: f.ok ? 'var(--green)' : 'var(--red)' }} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="grid2">
          <label>Bucket capacity (burst): <b className="mono">{cap}</b><input type="range" min="1" max="30" value={cap} onChange={(e) => setCap(+e.target.value)} disabled={running} style={{ width: '100%' }} /></label>
          <label>Refill rate: <b className="mono">{refill} token/s</b><input type="range" min="0.5" max="15" step="0.5" value={refill} onChange={(e) => setRefill(+e.target.value)} disabled={running} style={{ width: '100%' }} /></label>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={start} disabled={running}>{running ? `চলছে… ${t.toFixed(1)}s / 10s` : '▶ ১০ সেকেন্ডের traffic চালাও'}</button>
          <span className="muted" style={{ fontSize: 14 }}>User: প্রতি ~৩ সেকেন্ডে ৪টি request (page load) · Bot: ২০ req/s</span>
        </div>
      </div>
      <div className="grid2">
        <Bucket k="user" label="Normal user" icon="🧑" />
        <Bucket k="bot" label="Scraper bot" icon="🤖" />
      </div>
      {!running && t >= 10 && <div className={'note ' + (win ? 'good' : 'warn')}>{win ? '🎉 নিখুঁত! User একবারও 429 পায়নি, আর bot-এর ৮০%+ request আটকেছে। Burst capacity user-এর page load সামলায়, কম refill rate bot-এর গড় হার আটকায়।' : 'এখনো হয়নি। লক্ষ্য: user-এর 429 = 0, bot blocked ≥ 80%। Capacity ও refill rate বদলে আবার চালাও।'}</div>}
    </div>
  );
}
