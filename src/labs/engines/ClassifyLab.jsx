import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

// কার্ড বেছে নিয়ে বাক্সে রাখো। সঠিক হলে বাক্সে চলে যায় (layout animation)।
export default function ClassifyLab({ buckets, items, onComplete }) {
  const order = useMemo(() => items.map((_, i) => i).sort(() => Math.random() - 0.5), [items]);
  const [placed, setPlaced] = useState({});
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  useCompletion(items.length, Object.keys(placed).length, onComplete);

  const drop = (b) => {
    if (sel === null) { setMsg({ t: 'আগে একটি কার্ড বেছে নাও', bad: true }); return; }
    const it = items[sel];
    if (it.bucket === b) {
      setPlaced((p) => ({ ...p, [sel]: b }));
      setMsg({ t: '✅ ' + it.explain });
      setSel(null);
    } else {
      setMistakes((m) => m + 1);
      setMsg({ t: '✖ আবার ভাবো — "' + it.text + '" এখানে নয়।', bad: true });
    }
  };
  const pending = order.filter((i) => !(i in placed));

  return (
    <LayoutGroup>
      <div className="stack">
        <div className="row">
          <span className="badge ok">সঠিক: {Object.keys(placed).length}/{items.length}</span>
          <span className="badge">ভুল: {mistakes}</span>
        </div>
        <div className="card" style={{ minHeight: 70 }}>
          <div className="section-h">কার্ড (ক্লিক করে বেছে নাও)</div>
          <div className="row" style={{ gap: 8 }}>
            {pending.map((i) => (
              <motion.div layoutId={'c' + i} key={i} className={'chip' + (sel === i ? ' sel' : '')} onClick={() => setSel(i)} whileHover={{ y: -2 }}>
                {items[i].text}
              </motion.div>
            ))}
            {pending.length === 0 && <span style={{ color: 'var(--green)' }}>🎉 সব কার্ড সঠিক জায়গায়!</span>}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {msg && <motion.div key={msg.t} className={'note ' + (msg.bad ? 'bad' : 'good')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{msg.t}</motion.div>}
        </AnimatePresence>
        <div className="bucket-grid" style={{ gridTemplateColumns: `repeat(${Math.min(buckets.length, 3)}, 1fr)` }}>
          {buckets.map((b) => (
            <motion.div key={b.id} className="drop-zone" style={{ borderColor: b.color }} onClick={() => drop(b.id)} whileHover={{ scale: sel !== null ? 1.02 : 1 }}>
              <div style={{ color: b.color, fontWeight: 600 }}>{b.label}</div>
              {Object.entries(placed).filter(([, v]) => v === b.id).map(([i]) => (
                <motion.div layoutId={'c' + i} key={i} className="chip" style={{ borderColor: b.color, cursor: 'default' }}>{items[i].text}</motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </LayoutGroup>
  );
}
