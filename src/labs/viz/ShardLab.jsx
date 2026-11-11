import React, { useMemo, useRef, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// Sharding: hash(key) % N বনাম consistent hashing ring
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; };
const KEYS = Array.from({ length: 36 }, (_, i) => 'user' + (i * 7 + 101));
const COLORS = ['#22d3ee', '#f472b6', '#fbbf24', '#4ade80', '#a78bfa', '#fb923c', '#60a5fa', '#f87171'];
const MAX = 2 ** 32;

function assign(mode, n) {
  if (mode === 'mod') return Object.fromEntries(KEYS.map((k) => [k, fnv(k) % n]));
  const ring = [];
  for (let s = 0; s < n; s++) for (let v = 0; v < 8; v++) ring.push({ h: fnv(`shard${s}#${v}`), s });
  ring.sort((a, b) => a.h - b.h);
  return Object.fromEntries(KEYS.map((k) => { const h = fnv(k); const node = ring.find((r) => r.h >= h) || ring[0]; return [k, node.s]; }));
}

export default function ShardLab({ onComplete }) {
  const [mode, setMode] = useState('mod');
  const [n, setN] = useState(3);
  const [moved, setMoved] = useState(null);
  const [done, setDone] = useState([]);
  const prev = useRef(assign('mod', 3));
  const map = useMemo(() => assign(mode, n), [mode, n]);
  const tasks = [
    { id: 'mod', text: 'Modulo (% N) mode-এ shard ৩→৪ করো — কত key সরে গেল?' },
    { id: 'ring', text: 'Consistent hashing-এ একই কাজ করো — অনেক কম key সরে' },
    { id: 'hot', text: 'প্রতিটি shard-এ কতগুলো key, সেটা দেখে নাও (balance)' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));

  const change = (nm, nn) => {
    const before = assign(nm, n);
    const after = assign(nm, nn);
    const mv = KEYS.filter((k) => before[k] !== after[k]).length;
    if (nm === mode && nn !== n) {
      setMoved({ mv, from: n, to: nn, mode: nm });
      if (nm === 'mod' && nn > n) mark('mod');
      if (nm === 'ring' && nn > n) mark('ring');
    }
    prev.current = before;
    setN(nn);
  };
  const switchMode = (m) => { setMode(m); setMoved(null); prev.current = assign(m, n); };
  const counts = Array.from({ length: n }, (_, s) => KEYS.filter((k) => map[k] === s).length);

  return (
    <div className="stack">
      <div className="row">
        <button className={'btn sm ' + (mode === 'mod' ? 'primary' : '')} onClick={() => switchMode('mod')}>🔢 hash(key) % N</button>
        <button className={'btn sm ' + (mode === 'ring' ? 'primary' : '')} onClick={() => switchMode('ring')}>💍 Consistent hashing</button>
        <span style={{ marginLeft: 12 }}>Shard সংখ্যা: <b>{n}</b></span>
        <button className="btn sm" disabled={n <= 2} onClick={() => change(mode, n - 1)}>➖</button>
        <button className="btn sm primary" disabled={n >= 8} onClick={() => change(mode, n + 1)}>➕ নতুন shard যোগ</button>
      </div>
      {moved && (
        <motion.div key={moved.to + moved.mode} className={'note ' + (moved.mv / KEYS.length > 0.4 ? 'bad' : 'good')} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {moved.from} → {moved.to} shard: <b>{moved.mv}/{KEYS.length} key ({Math.round((moved.mv / KEYS.length) * 100)}%)</b> অন্য shard-এ সরাতে হলো। {moved.mode === 'mod' ? 'Modulo-তে N বদলালেই প্রায় সব key-এর ঠিকানা বদলে যায় → বিশাল data migration!' : 'Consistent hashing-এ শুধু নতুন shard-এর ভাগের key সরে (~1/N) — বাকিরা যেখানে ছিল সেখানেই।'}
        </motion.div>
      )}
      <div className="grid2" style={{ gridTemplateColumns: mode === 'ring' ? '1fr 1.4fr' : '1fr' }}>
        {mode === 'ring' && (
          <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
            <svg viewBox="-110 -110 220 220" style={{ width: '100%', maxWidth: 300 }}>
              <circle r="90" fill="none" stroke="#2b3d63" strokeWidth="2" />
              {Array.from({ length: n }, (_, s) => Array.from({ length: 8 }, (_, v) => {
                const a = (fnv(`shard${s}#${v}`) / MAX) * Math.PI * 2 - Math.PI / 2;
                return <motion.circle key={s + '-' + v} initial={{ r: 0 }} animate={{ r: 5 }} cx={Math.cos(a) * 90} cy={Math.sin(a) * 90} fill={COLORS[s]} stroke="#03060c" />;
              }))}
              {KEYS.map((k) => {
                const a = (fnv(k) / MAX) * Math.PI * 2 - Math.PI / 2;
                return <circle key={k} r="2.2" cx={Math.cos(a) * 74} cy={Math.sin(a) * 74} fill={COLORS[map[k]]} opacity=".9" />;
              })}
              <text textAnchor="middle" y="4" fill="#8a9bb8" fontSize="10">hash ring</text>
            </svg>
            <div className="muted" style={{ fontSize: 12.5 }}>বড় বিন্দু = shard (virtual node), ছোট বিন্দু = key। Key ঘড়ির কাঁটার দিকে প্রথম যে shard পায়, সেখানে যায়।</div>
          </div>
        )}
        <LayoutGroup>
          <div className="shard-cols" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {Array.from({ length: n }, (_, s) => (
              <div key={s} className="shard-col" style={{ borderColor: COLORS[s] }} onClick={() => mark('hot')}>
                <div className="shard-h" style={{ color: COLORS[s] }}>🗄️ Shard {s + 1} <small>({counts[s]})</small></div>
                <div className="shard-keys">
                  {KEYS.filter((k) => map[k] === s).map((k) => (
                    <motion.span key={k} layoutId={k} layout className={'shard-key' + (prev.current[k] !== s && moved ? ' moved' : '')} transition={{ type: 'spring', stiffness: 200, damping: 24 }}>{k}</motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <div className="card"><div className="section-h">🎯 Mission <span className="muted" style={{ fontSize: 13 }}>(shard কলামে ক্লিক করলে ৩ নম্বর হবে)</span></div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
