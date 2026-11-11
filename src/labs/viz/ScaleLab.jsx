import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

// 100 user থেকে ১ কোটি user — component যোগ করে app বাঁচাও।
const USERS = [100, 1e3, 1e4, 1e5, 1e6, 1e7];
const ULBL = ['১০০', '১ হাজার', '১০ হাজার', '১ লাখ', '১০ লাখ (1M)', '১ কোটি (10M)'];
const f = (u) => (u < 0.6 ? 10 * u : u < 0.9 ? 40 * u : u < 1 ? 200 * u : 900 * u);
const col = (u) => (u < 0.6 ? '#4ade80' : u < 0.9 ? '#fbbf24' : '#f87171');

function sim(c) {
  const users = USERS[c.lvl];
  const rps = users * 0.02;
  const stat = rps * 0.6, dyn = rps * 0.4;
  const statOrigin = c.cdn ? stat * 0.05 : stat;
  const appLoad = dyn + statOrigin * 0.2;
  const servers = c.lb ? c.app : 1;
  const appCap = servers * (c.sepDb ? 1500 : 600);
  const reads = dyn * 0.9, writes = dyn * 0.1;
  const dbReads = c.cache ? reads * 0.15 : reads;
  const dbWrites = (c.queue ? writes * 0.6 : writes) * 3; // write ≈ ৩ গুণ ভারী
  const primCap = (c.sepDb ? 2000 : 900) * c.shards;
  const repCap = c.replicas * 2500;
  const readsOnRep = Math.min(dbReads, repCap * 0.95);
  const tiers = {
    app: appLoad / appCap,
    db: (dbWrites + (dbReads - readsOnRep)) / primCap,
    rep: c.replicas ? readsOnRep / repCap : 0,
    cache: c.cache ? (reads * 0.85) / 150000 : 0,
  };
  const worst = Math.max(...Object.values(tiers));
  const err = Math.min(Object.values(tiers).reduce((m, u) => Math.max(m, u > 1 ? 1 - 1 / u : 0), 0), 1);
  const p95 = Math.round(45 + f(tiers.app) + f(tiers.db) * 1.5 + f(tiers.rep) + (c.cache ? -10 : 0) + (c.cdn ? 0 : users >= 1e5 ? 120 : 30) + (c.queue ? -8 : 0));
  const cost = Math.round(servers * 40 + (c.lb ? 20 : 0) + (c.sepDb ? 80 * c.shards : 0) + c.replicas * 60 + (c.cache ? 30 : 0) + (c.cdn ? 20 + stat * 0.004 : 0) + (c.queue ? 25 : 0) + (c.sepDb ? 0 : 0));
  const names = { app: 'App server', db: 'Database primary', rep: 'Read replica', cache: 'Cache' };
  const hot = Object.entries(tiers).sort((a, b) => b[1] - a[1])[0];
  return { users, rps, tiers, worst, err, p95: Math.max(p95, 30), cost, hot: names[hot[0]], hotKey: hot[0], ok: err < 0.01 && p95 < 400 };
}

const HINT = {
  app: 'App server-এর CPU ভরে গেছে → Load Balancer চালু করে আরও server যোগ করো (horizontal scaling)। Static file-এর চাপ কমাতে CDN।',
  db: 'Database primary হাঁপাচ্ছে → আগে Cache (reads কমাও), তারপর Read replica, write বেশি হলে Queue বা Sharding।',
  rep: 'Read replica-গুলো ভরা → আরও replica বা cache hit বাড়াও।',
  cache: 'Cache cluster বড় করতে হবে।',
};

function Tier({ show, icon, label, u, sub, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div layout className="sc-tier" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} style={{ borderColor: u != null ? col(u) : 'var(--line2)' }}>
          <div className="sc-ic">{icon}</div>
          <div className="sc-lbl">{label}</div>
          {sub && <div className="sc-sub">{sub}</div>}
          {children}
          {u != null && <div className="sc-bar"><motion.div animate={{ width: Math.min(u, 1) * 100 + '%', background: col(u) }} /></div>}
          {u != null && <div className="sc-u" style={{ color: col(u) }}>{Math.round(u * 100)}%</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ScaleLab({ onComplete }) {
  const [c, setC] = useState({ lvl: 0, sepDb: false, lb: false, app: 1, cdn: false, cache: false, replicas: 0, shards: 1, queue: false });
  const [done, setDone] = useState([]);
  const set = (k, v) => setC((x) => ({ ...x, [k]: v }));
  const s = useMemo(() => sim(c), [c]);
  const tasks = [
    { id: 'l2', text: '১০ হাজার user — error < 1%, p95 < 400ms' },
    { id: 'l4', text: '১০ লাখ (1M) user সামলাও' },
    { id: 'cheap', text: '1M user, খরচ মাসে $800-এর কম' },
    { id: 'l5', text: '১ কোটি (10M) user সামলাও 🏆' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  useEffect(() => {
    if (!s.ok) return;
    const nd = [];
    if (c.lvl >= 2) nd.push('l2');
    if (c.lvl >= 4) nd.push('l4');
    if (c.lvl === 4 && s.cost < 800) nd.push('cheap');
    if (c.lvl === 5) nd.push('l5');
    if (nd.some((x) => !done.includes(x))) setDone((d) => [...new Set([...d, ...nd])]);
  }, [s, c.lvl]); // eslint-disable-line


  return (
    <div className="stack">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b>👥 User সংখ্যা: <span style={{ color: '#a78bfa' }}>{ULBL[c.lvl]}</span> <span className="muted" style={{ fontSize: 13 }}>(~{Math.round(s.rps).toLocaleString()} request/sec)</span></b>
          <div className="row" style={{ gap: 4 }}>{ULBL.map((l, i) => <button key={i} className={'btn sm ' + (c.lvl === i ? 'primary' : '')} onClick={() => set('lvl', i)}>{l}</button>)}</div>
        </div>
      </div>

      <div className="sc-stage">
        <motion.div layout className="sc-flow">
          <Tier show icon={c.lvl >= 4 ? '👥👥👥' : c.lvl >= 2 ? '👥👥' : '👤'} label="Users" sub={ULBL[c.lvl]} />
          <Tier show={c.cdn} icon="🌍" label="CDN" sub="static file" />
          <Tier show={c.lb} icon="⚖️" label="Load Balancer" />
          <Tier show icon="" label={c.lb ? `App servers ×${c.app}` : c.sepDb ? 'App server' : 'App + DB (একই মেশিন)'} u={s.tiers.app}>
            <div className="sc-grid">{Array.from({ length: Math.min(c.lb ? c.app : 1, 24) }, (_, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}>🖥️</motion.span>)}{c.lb && c.app > 24 && <span className="muted">+{c.app - 24}</span>}</div>
          </Tier>
          <Tier show={c.cache} icon="⚡" label="Redis Cache" sub="85% hit" u={s.tiers.cache} />
          <Tier show={c.queue} icon="📬" label="Queue" sub="async write" />
          <Tier show={c.sepDb} icon="" label={c.shards > 1 ? `DB shards ×${c.shards}` : 'DB primary'} u={s.tiers.db}>
            <div className="sc-grid">{Array.from({ length: c.shards }, (_, i) => <span key={i}>🗄️</span>)}</div>
          </Tier>
          <Tier show={c.replicas > 0} icon="" label={`Read replica ×${c.replicas}`} u={s.tiers.rep}>
            <div className="sc-grid">{Array.from({ length: c.replicas }, (_, i) => <span key={i}>📀</span>)}</div>
          </Tier>
        </motion.div>
        <div className="sc-particles">{Array.from({ length: Math.min(4 + c.lvl * 3, 18) }, (_, i) => <span key={i} style={{ animationDelay: `${(i * 0.37) % 2}s`, top: `${10 + ((i * 37) % 80)}%`, background: s.err > 0.01 && i % 3 === 0 ? '#f87171' : '#22d3ee' }} />)}</div>
      </div>

      <div className="sc-metrics">
        <div className="sc-m" style={{ borderColor: s.err < 0.01 ? '#4ade80' : '#f87171' }}><small>Error rate</small><b style={{ color: s.err < 0.01 ? '#4ade80' : '#f87171' }}>{(s.err * 100).toFixed(1)}%</b></div>
        <div className="sc-m" style={{ borderColor: s.p95 < 400 ? '#4ade80' : '#f87171' }}><small>p95 latency</small><b style={{ color: s.p95 < 400 ? '#4ade80' : '#f87171' }}>{s.p95 > 5000 ? '>5000' : s.p95} ms</b></div>
        <div className="sc-m"><small>মাসিক খরচ</small><b>${s.cost.toLocaleString()}</b></div>
        <div className="sc-m" style={{ borderColor: s.ok ? '#4ade80' : '#f87171' }}><small>অবস্থা</small><b>{s.ok ? '😎 ঠিক চলছে' : s.worst > 1 ? '🔥 ভেঙে পড়ছে' : '🐢 ধীর'}</b></div>
      </div>
      {!s.ok && <div className="note bad">🔎 Bottleneck: <b>{s.hot}</b> ({Math.round(s.worst * 100)}% load) — {HINT[s.hotKey]}</div>}
      {s.ok && c.lvl >= 2 && <div className="note good">✅ এই স্তরে সব ঠিক আছে! এবার user সংখ্যা বাড়িয়ে দেখো কী ভাঙে।</div>}

      <div className="grid2">
        <div className="card stack" style={{ gap: 6 }}>
          <div className="section-h">🧰 Architecture toolbox</div>
          <Toggle on={c.sepDb} onChange={(v) => set('sepDb', v)} label="🗄️ Database আলাদা server-এ (প্রথম ধাপ!)" />
          <Toggle on={c.lb} onChange={(v) => set('lb', v)} label="⚖️ Load Balancer + একাধিক app server" />
          {c.lb && <div className="row"><span className="muted" style={{ fontSize: 14 }}>App servers: {c.app}</span><input type="range" min={1} max={80} value={c.app} onChange={(e) => set('app', +e.target.value)} style={{ flex: 1, accentColor: '#a78bfa' }} /></div>}
          <Toggle on={c.cdn} onChange={(v) => set('cdn', v)} label="🌍 CDN (ছবি, JS, CSS কাছের edge থেকে)" />
          <Toggle on={c.cache} onChange={(v) => set('cache', v)} label="⚡ Redis cache (বারবার পড়া data)" />
          <Toggle on={c.queue} onChange={(v) => set('queue', v)} label="📬 Message queue (write/কাজ পরে করো)" />
          <div className="row"><span className="muted" style={{ fontSize: 14 }}>📀 Read replicas: {c.replicas}</span><input type="range" min={0} max={6} value={c.replicas} disabled={!c.sepDb} onChange={(e) => set('replicas', +e.target.value)} style={{ flex: 1, accentColor: '#a78bfa' }} /></div>
          <div className="row"><span className="muted" style={{ fontSize: 14 }}>🧩 DB shards: {c.shards}</span><input type="range" min={1} max={12} value={c.shards} disabled={!c.sepDb} onChange={(e) => set('shards', +e.target.value)} style={{ flex: 1, accentColor: '#a78bfa' }} /></div>
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} />
          <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>💡 বাস্তবেও ঠিক এই ক্রম: আগে সবচেয়ে সহজ জিনিস (DB আলাদা, cache), তারপর জটিল জিনিস (sharding)। Sharding সবার শেষে — কারণ এটা সবচেয়ে কঠিন ও ব্যয়বহুল।</div>
        </div>
      </div>
    </div>
  );
}
