import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// ১ লাখ row-এর table-এ খোঁজা: full scan বনাম B-tree index
const CELLS = 300;
const TARGET = 213;
const Q = {
  email: { sql: "SELECT * FROM users WHERE email = 'rahim@mail.com';", col: 'email' },
  name: { sql: "SELECT * FROM users WHERE name = 'Rahim';", col: 'name' },
};

export default function IndexLab({ onComplete }) {
  const [idx, setIdx] = useState(false);
  const [q, setQ] = useState('email');
  const [scan, setScan] = useState(-1);
  const [tree, setTree] = useState(-1);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState([]);
  const tasks = [
    { id: 'seq', text: 'Index ছাড়া email খোঁজো — পুরো table scan' },
    { id: 'idx', text: 'CREATE INDEX চালিয়ে আবার খোঁজো — B-tree দিয়ে ৩ লাফে' },
    { id: 'other', text: 'Index নেই এমন column (name) দিয়ে খোঁজো — আবার full scan!' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));
  const useIdx = idx && q === 'email';

  const run = () => {
    setResult(null);
    if (useIdx) { setScan(-1); setTree(0); } else { setTree(-1); setScan(0); }
  };
  useEffect(() => {
    if (scan < 0) return;
    if (scan >= CELLS) {
      setResult({ plan: `Seq Scan on users  (rows examined: 100,000)\n  Filter: (${Q[q].col} = '…')\nExecution Time: 118.4 ms`, bad: true });
      if (q === 'email' && !idx) mark('seq');
      if (q === 'name') mark('other');
      setScan(-1);
      return;
    }
    const t = setTimeout(() => setScan(scan + 6), 16);
    return () => clearTimeout(t);
  }, [scan]); // eslint-disable-line
  useEffect(() => {
    if (tree < 0) return;
    if (tree > 3) {
      setResult({ plan: "Index Scan using idx_users_email on users  (rows examined: 1)\n  Index Cond: (email = 'rahim@mail.com')\nExecution Time: 0.06 ms", bad: false });
      mark('idx');
      setTree(-1);
      return;
    }
    const t = setTimeout(() => setTree(tree + 1), 600);
    return () => clearTimeout(t);
  }, [tree]); // eslint-disable-line

  const lvl = (n) => tree >= n || (result && !result.bad);
  return (
    <div className="stack">
      <div className="row">
        <select className="input mono" style={{ maxWidth: 520 }} value={q} onChange={(e) => { setQ(e.target.value); setResult(null); }}>
          {Object.entries(Q).map(([k, v]) => <option key={k} value={k}>{v.sql}</option>)}
        </select>
        <button className="btn primary sm" disabled={scan >= 0 || tree >= 0} onClick={run}>▶ Query চালাও</button>
        <button className={'btn sm ' + (idx ? 'success' : '')} onClick={() => { setIdx(!idx); setResult(null); }}>{idx ? '✓ idx_users_email আছে' : '⚡ CREATE INDEX idx_users_email ON users(email)'}</button>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-h">📋 users table (প্রতিটি ঘর ≈ ৩৩৩টি row)</div>
          <div className="idx-grid">
            {Array.from({ length: CELLS }, (_, i) => (
              <span key={i} style={{ background: i === TARGET && (scan > i || (result && !result.bad) || (result?.bad && q === 'email')) ? '#4ade80' : scan >= 0 && i < scan ? 'rgba(248,113,113,.55)' : result?.bad ? 'rgba(248,113,113,.35)' : 'rgba(255,255,255,.05)' }} />
            ))}
          </div>
          <div className="muted" style={{ fontSize: 13 }}>লাল = পড়তে হয়েছে। Index ছাড়া database-কে প্রতিটি row খুলে দেখতে হয় — যেমন index ছাড়া বইয়ে একটা শব্দ খুঁজতে পুরো বই পড়া।</div>
        </div>
        <div className="card" style={{ opacity: idx ? 1 : 0.35 }}>
          <div className="section-h">🌳 B-tree index (email অনুসারে sorted)</div>
          <svg viewBox="0 0 320 190" style={{ width: '100%' }}>
            {[[160, 25, 'm…'], [70, 90, 'd…  h…'], [250, 90, 'p…  t…'], [30, 160, 'a-c'], [100, 160, 'n-o'], [190, 160, 'p-r'], [280, 160, 'u-z']].map(([x, y, t], i) => {
              const path = [0, 2, 5];
              const on = path.includes(i) && lvl(path.indexOf(i) + 1);
              return (
                <g key={i}>
                  {i > 0 && <line x1={i < 3 ? 160 : i < 5 ? 70 : 250} y1={i < 3 ? 38 : 103} x2={x} y2={y - 13} stroke={on ? '#4ade80' : '#2b3d63'} strokeWidth={on ? 3 : 1.5} />}
                  <motion.rect x={x - 32} y={y - 13} width="64" height="26" rx="6" animate={{ fill: on ? '#14532d' : '#15213a', stroke: on ? '#4ade80' : '#2b3d63' }} strokeWidth="1.5" />
                  <text x={x} y={y + 5} textAnchor="middle" fill="#e6edf7" fontSize="12" fontFamily="monospace">{t}</text>
                </g>
              );
            })}
            {lvl(3) && <text x="190" y="186" textAnchor="middle" fill="#4ade80" fontSize="11">→ rahim@… row #71,204 🎯</text>}
          </svg>
          <div className="muted" style={{ fontSize: 13 }}>'r' কি 'm'-এর পরে? → ডানে। 'p…t'-এর মাঝে? → p-r। ১ লাখ row-এও মাত্র ~৩-৪ ধাপ (log n)।</div>
        </div>
      </div>
      {result && <motion.pre className="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderColor: result.bad ? '#f87171' : '#4ade80' }}>EXPLAIN ANALYZE →{'\n'}{result.plan}</motion.pre>}
      <div className="note warn">⚖️ Index ফ্রি নয়: প্রতিটি INSERT/UPDATE-এ index-ও update করতে হয় (write একটু ধীর) এবং disk জায়গা লাগে। তাই শুধু যে column দিয়ে বারবার খোঁজো (WHERE, JOIN, ORDER BY) সেখানেই index।</div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
