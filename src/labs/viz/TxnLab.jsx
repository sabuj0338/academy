import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// শেষ PS5-টি একসাথে দুজন কিনছে — race condition ও তার সমাধান
const S = {
  naive: {
    name: '😬 Read → check → write (lock নেই)',
    steps: [
      { who: 1, sql: 'BEGIN; SELECT stock FROM products WHERE id=7;', note: 'Alice দেখল stock = 1', stock: 1 },
      { who: 2, sql: 'BEGIN; SELECT stock FROM products WHERE id=7;', note: 'Bob-ও একই সময়ে দেখল stock = 1 (Alice এখনো commit করেনি)', stock: 1 },
      { who: 1, sql: 'UPDATE products SET stock = 0; INSERT INTO orders …; COMMIT;', note: 'Alice-এর order হলো, stock = 0', stock: 0, order: 'A' },
      { who: 2, sql: 'UPDATE products SET stock = 0; INSERT INTO orders …; COMMIT;', note: 'Bob-এর code-ও ভাবছে stock ছিল 1 → সে-ও order পেল!', stock: 0, order: 'B', bad: true },
    ],
    end: '💥 Oversold! ১টি PS5, কিন্তু ২টি order। একজনকে ফোন করে "দুঃখিত" বলতে হবে। এটাই Lost update / race condition।',
  },
  lock: {
    name: '🔒 SELECT … FOR UPDATE (row lock)',
    steps: [
      { who: 1, sql: 'BEGIN; SELECT stock FROM products WHERE id=7 FOR UPDATE;', note: 'Alice row-টা lock করল, stock = 1', stock: 1, lock: 1 },
      { who: 2, sql: 'BEGIN; SELECT stock FROM products WHERE id=7 FOR UPDATE;', note: '⏳ Bob অপেক্ষা করছে — row-টা Alice-এর lock-এ', stock: 1, lock: 1, wait: 2 },
      { who: 1, sql: 'UPDATE products SET stock = 0; INSERT INTO orders …; COMMIT;', note: 'Alice commit করল → lock ছেড়ে দিল', stock: 0, order: 'A' },
      { who: 2, sql: '-- এখন Bob-এর SELECT শেষ হলো: stock = 0 → ROLLBACK;', note: 'Bob সর্বশেষ মান (0) দেখল → "Sold out" দেখানো হলো', stock: 0, good: true },
    ],
    end: '✅ ঠিক ১টি order। Pessimistic locking: আগে lock, তারপর কাজ। দাম: অন্যরা অপেক্ষা করে।',
  },
  atomic: {
    name: '⚛️ Atomic conditional UPDATE',
    steps: [
      { who: 1, sql: "UPDATE products SET stock = stock - 1 WHERE id=7 AND stock > 0; -- 1 row", note: 'Alice-এর UPDATE একটি row বদলাল → stock = 0, order তৈরি', stock: 0, order: 'A' },
      { who: 2, sql: "UPDATE products SET stock = stock - 1 WHERE id=7 AND stock > 0; -- 0 rows", note: 'Bob-এর UPDATE কোনো row পেল না (stock > 0 মিথ্যা) → Sold out', stock: 0, good: true },
    ],
    end: '✅ ঠিক ১টি order — আলাদা read-ই নেই! Database নিজেই check + write একসাথে (atomically) করে। সবচেয়ে সহজ ও দ্রুত সমাধান।',
  },
};

export default function TxnLab({ onComplete }) {
  const [k, setK] = useState('naive');
  const [i, setI] = useState(-1);
  const [done, setDone] = useState([]);
  const sc = S[k];
  const tasks = [
    { id: 'naive', text: 'Lock ছাড়া চালাও — ১টি জিনিসে ২টি order (oversell) দেখো' },
    { id: 'lock', text: 'SELECT FOR UPDATE দিয়ে ঠিক করো' },
    { id: 'atomic', text: 'Atomic UPDATE … WHERE stock > 0 দিয়ে ঠিক করো' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  useEffect(() => { setI(-1); }, [k]);
  useEffect(() => { if (i === sc.steps.length - 1) setDone((d) => (d.includes(k) ? d : [...d, k])); }, [i]); // eslint-disable-line
  const cur = i >= 0 ? sc.steps[i] : null;
  const orders = sc.steps.slice(0, i + 1).filter((s) => s.order).map((s) => s.order);

  return (
    <div className="stack">
      <div className="row">{Object.entries(S).map(([id, s]) => <button key={id} className={'btn sm ' + (k === id ? (id === 'naive' ? 'danger' : 'success') : '')} onClick={() => setK(id)}>{s.name} {done.includes(id) && '✓'}</button>)}</div>
      <div className="tx-stage">
        {[1, 2].map((w) => (
          <div key={w} className="tx-col">
            <div className="tx-who">{w === 1 ? '👩 Alice (Transaction 1)' : '🧔 Bob (Transaction 2)'}</div>
            {sc.steps.map((s, j) => s.who === w && (
              <motion.div key={j} className={'tx-step' + (j <= i ? ' on' : '') + (s.bad && j <= i ? ' bad' : '') + (s.good && j <= i ? ' good' : '')} animate={{ opacity: j <= i ? 1 : 0.25, x: j === i ? [0, 6, 0] : 0 }}>
                <span className="tx-t">t{j + 1}</span><code>{s.sql}</code>
                {s.wait && j === i && <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ display: 'inline-block' }}>⏳</motion.span>}
              </motion.div>
            ))}
          </div>
        ))}
        <div className="tx-db">
          <div className="tx-who">🗄️ Database</div>
          <div className="tx-row">
            <span>🎮 PS5</span>
            <motion.b key={cur?.stock ?? 1} initial={{ scale: 1.6, color: '#fbbf24' }} animate={{ scale: 1, color: '#e6edf7' }}>stock: {cur ? cur.stock : 1}</motion.b>
            {cur?.lock && <span title="locked">🔒 T{cur.lock}</span>}
          </div>
          <div className="tx-who" style={{ marginTop: 10 }}>🧾 Orders ({orders.length})</div>
          <AnimatePresence>{orders.map((o) => <motion.div key={o} className="tx-order" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ borderColor: orders.length > 1 && o === 'B' ? '#f87171' : '#4ade80' }}>{o === 'A' ? '👩 Alice — PS5' : '🧔 Bob — PS5'}</motion.div>)}</AnimatePresence>
        </div>
      </div>
      <div className="row">
        <button className="btn primary sm" disabled={i >= sc.steps.length - 1} onClick={() => setI(i + 1)}>▶ পরের মুহূর্ত (t{i + 2})</button>
        <button className="btn sm" onClick={() => setI(-1)}>↺ আবার</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={k + i} className={'note ' + (i === sc.steps.length - 1 ? (k === 'naive' ? 'bad' : 'good') : '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {cur ? (i === sc.steps.length - 1 ? sc.end : cur.note) : 'দুজন একই মিলিসেকেন্ডে "Buy" চাপল। ▶ চেপে সময় এগিয়ে দেখো দুই transaction কীভাবে interleave হয়।'}
        </motion.div>
      </AnimatePresence>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
