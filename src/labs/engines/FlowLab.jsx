import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

// 2D network flow animation (framer-motion)। nodes এক সারিতে, packet hop ধরে চলে।
export default function FlowLab({ nodes, modes, onComplete }) {
  const [modeId, setModeId] = useState(modes[0].id);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState([]);
  const mode = modes.find((m) => m.id === modeId);
  const hops = mode.hops;
  const idx = useMemo(() => Object.fromEntries(nodes.map((n, i) => [n.id, i])), [nodes]);
  const xOf = (id) => ((idx[id] + 0.5) / nodes.length) * 100;

  useCompletion(modes.length, seen.length, onComplete);

  useEffect(() => { setStep(-1); setPlaying(false); }, [modeId]);
  useEffect(() => {
    if (step === hops.length - 1 && !seen.includes(modeId)) setSeen((s) => [...s, modeId]);
  }, [step, hops.length, modeId, seen]);
  useEffect(() => {
    if (!playing) return;
    if (step >= hops.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), step < 0 ? 200 : 2600);
    return () => clearTimeout(t);
  }, [playing, step, hops.length]);

  const hop = step >= 0 ? hops[step] : null;
  const color = (h) => (h?.status === 'evil' ? 'var(--red)' : h?.status === 'blocked' ? 'var(--amber)' : mode.kind === 'defense' ? 'var(--green)' : 'var(--cyan)');
  const activeNodes = hop ? [hop.from, hop.to] : [];
  const forward = hop ? idx[hop.to] >= idx[hop.from] : true;

  return (
    <div className="stack">
      <div className="row">
        {modes.map((m) => (
          <button key={m.id} className={'btn sm ' + (m.id === modeId ? (m.kind === 'attack' ? 'danger' : m.kind === 'defense' ? 'success' : 'primary') : '')} onClick={() => setModeId(m.id)}>
            {m.kind === 'attack' ? '😈 ' : m.kind === 'defense' ? '🛡️ ' : '▶ '}{m.name} {seen.includes(m.id) && '✓'}
          </button>
        ))}
      </div>

      <div className="flow-stage">
        <svg className="flow-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1={xOf(nodes[0].id)} y1="50" x2={xOf(nodes[nodes.length - 1].id)} y2="50" stroke="var(--line2)" strokeWidth="0.4" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
        </svg>
        {nodes.map((n) => {
          const active = activeNodes.includes(n.id);
          const blockedHere = hop?.status === 'blocked' && hop.to === n.id;
          return (
            <motion.div key={n.id} className="flow-node" style={{ left: xOf(n.id) + '%', x: '-50%', y: '-50%' }}
              animate={{ scale: active ? 1.08 : 1, borderColor: active ? color(hop) : 'var(--line2)', boxShadow: active ? `0 0 28px ${hop?.status === 'evil' ? 'rgba(248,113,113,.45)' : 'rgba(34,211,238,.35)'}` : '0 0 0 rgba(0,0,0,0)' }}
              transition={{ duration: 0.3 }}>
              <div className="flow-icon">{n.icon}</div>
              <div className="flow-label">{n.label}</div>
              <div className="flow-sub">{n.sub}</div>
              {blockedHere && <motion.div className="flow-block" initial={{ scale: 0 }} animate={{ scale: 1 }}>⛔</motion.div>}
            </motion.div>
          );
        })}
        <AnimatePresence>
          {hop && (
            <motion.div key={modeId + step} className="packet" style={{ top: forward ? '12%' : '80%', background: color(hop), x: '-50%' }}
              initial={{ left: xOf(hop.from) + '%', opacity: 0, scale: 0.6 }}
              animate={{ left: hop.from === hop.to ? [xOf(hop.from) + '%', xOf(hop.from) + '%'] : xOf(hop.to) + '%', opacity: 1, scale: 1, rotate: hop.status === 'blocked' ? [0, -6, 6, -6, 0] : 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 1.3, ease: 'easeInOut' }}>
              {hop.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="row">
        <button className="btn primary sm" onClick={() => { if (step >= hops.length - 1) setStep(-1); setPlaying((p) => !p); }}>{playing ? '⏸ Pause' : step >= hops.length - 1 ? '↺ আবার' : '▶ Play'}</button>
        <button className="btn sm" disabled={step <= 0} onClick={() => { setPlaying(false); setStep((s) => s - 1); }}>◀ আগের</button>
        <button className="btn sm" disabled={step >= hops.length - 1} onClick={() => { setPlaying(false); setStep((s) => s + 1); }}>পরের ধাপ ▶</button>
        <span className="muted" style={{ fontSize: 14 }}>ধাপ {Math.max(step + 1, 0)} / {hops.length}</span>
      </div>

      <motion.div key={modeId + step} className="card flow-desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ borderColor: hop ? color(hop) : 'var(--line)' }}>
          {hop ? (
            <>
              <div className="badge" style={{ color: color(hop), borderColor: color(hop) }}>{hop.status === 'evil' ? '⚠ আক্রমণ' : hop.status === 'blocked' ? '⛔ আটকানো হলো' : 'বর্তমান ধাপ'}: {hop.label}</div>
              <p style={{ margin: '8px 0 0' }}>{hop.desc}</p>
            </>
          ) : (
            <p className="muted" style={{ margin: 0 }}>▶ Play চাপো অথবা "পরের ধাপ" দিয়ে এক এক করে দেখো। সব mode দেখলে lab সম্পূর্ণ হবে।</p>
          )}
      </motion.div>
    </div>
  );
}
