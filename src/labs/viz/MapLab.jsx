import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

// 2D architecture / network map। nodes {id,x,y,icon,label,sub} (x,y = %)।
// mode: { id, name, kind, desc, nodes?, edges?, down?: [ids], hops: [{ path:[ids] | paths:[[ids]], label, desc, status }] }
const COL = { evil: '#f87171', blocked: '#fbbf24', ok: '#4ade80', slow: '#fb923c' };

function Packet({ path, pos, label, color, dur, delay = 0, blocked }) {
  const xs = path.map((id) => pos[id].x + '%');
  const ys = path.map((id) => pos[id].y + '%');
  const end = path.length - 1;
  return (
    <motion.div className="map-packet" style={{ background: color, x: '-50%', y: '-50%' }}
      initial={{ left: xs[0], top: ys[0], opacity: 0, scale: 0.5 }}
      animate={{ left: xs, top: ys, opacity: 1, scale: blocked ? [1, 1, 1.25, 1] : 1 }}
      transition={{ duration: dur, delay, ease: 'easeInOut', times: path.map((_, i) => (end ? i / end : 0)) }}>
      {label}
    </motion.div>
  );
}

export default function MapLab({ nodes: baseNodes, edges: baseEdges = [], zones: baseZones = [], modes, height = 380, onComplete }) {
  const [modeId, setModeId] = useState(modes[0].id);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState([]);
  const mode = modes.find((m) => m.id === modeId);
  const nodes = mode.nodes || baseNodes;
  const edges = mode.edges || baseEdges;
  const zones = mode.zones || baseZones;
  const hops = mode.hops;
  const pos = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  useCompletion(modes.length, seen.length, onComplete);

  useEffect(() => { setStep(-1); setPlaying(false); }, [modeId]);
  useEffect(() => {
    if (step === hops.length - 1 && !seen.includes(modeId)) setSeen((s) => [...s, modeId]);
  }, [step, hops.length, modeId, seen]);
  const hop = step >= 0 ? hops[step] : null;
  const paths = hop ? hop.paths || [hop.path] : [];
  const dur = hop ? Math.min(0.55 * Math.max(...paths.map((p) => p.length - 1), 1) + 0.3, 2.6) : 1;
  useEffect(() => {
    if (!playing) return;
    if (step >= hops.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), step < 0 ? 200 : dur * 1000 + 1700);
    return () => clearTimeout(t);
  }, [playing, step, hops.length, dur]);

  const color = hop?.status ? COL[hop.status] || '#22d3ee' : mode.kind === 'defense' ? '#4ade80' : '#22d3ee';
  const activeIds = new Set(paths.flat());
  const lastIds = new Set(paths.map((p) => p[p.length - 1]));
  const down = new Set([...(mode.down || []), ...(hop?.down || [])]);
  const onPath = (a, b) => paths.some((p) => p.some((id, i) => i > 0 && ((p[i - 1] === a && id === b) || (p[i - 1] === b && id === a))));

  return (
    <div className="stack">
      <div className="row">
        {modes.map((m) => (
          <button key={m.id} className={'btn sm ' + (m.id === modeId ? (m.kind === 'attack' || m.kind === 'fail' ? 'danger' : m.kind === 'defense' ? 'success' : 'primary') : '')} onClick={() => setModeId(m.id)}>
            {m.kind === 'attack' ? '😈 ' : m.kind === 'fail' ? '💥 ' : m.kind === 'defense' ? '🛡️ ' : '▶ '}{m.name} {seen.includes(m.id) && '✓'}
          </button>
        ))}
      </div>
      {mode.desc && <div className="muted" style={{ fontSize: 14.5 }}>📝 {mode.desc}</div>}

      <div className="map-stage" style={{ height }}>
        {zones.map((z) => (
          <div key={z.label} className="map-zone" style={{ left: z.x + '%', top: z.y + '%', width: z.w + '%', height: z.h + '%', borderColor: z.color || 'var(--line2)' }}>
            <span style={{ color: z.color || 'var(--muted)' }}>{z.label}</span>
          </div>
        ))}
        <svg className="flow-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
          {edges.map(([a, b, lbl], i) => {
            if (!pos[a] || !pos[b]) return null;
            const on = onPath(a, b);
            const dead = down.has(a) || down.has(b);
            return (
              <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} vectorEffect="non-scaling-stroke"
                stroke={dead ? '#7f1d1d' : on ? color : '#2b3d63'} strokeWidth={on ? 2.5 : 1.4} strokeDasharray={dead ? '4 4' : on ? '0' : '5 5'}
                className={on ? 'map-edge-on' : ''} />
            );
          })}
        </svg>
        {nodes.map((n) => {
          const active = activeIds.has(n.id);
          const isDown = down.has(n.id);
          const blocked = hop?.status === 'blocked' && lastIds.has(n.id);
          return (
            <motion.div key={modeId + n.id} className={'map-node' + (n.small ? ' small' : '') + (isDown ? ' down' : '')} style={{ left: n.x + '%', top: n.y + '%', x: '-50%', y: '-50%' }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: isDown ? 0.45 : 1, scale: active && lastIds.has(n.id) ? 1.1 : 1, borderColor: active ? color : 'rgba(43,61,99,1)', boxShadow: active ? `0 0 26px ${color}66` : '0 0 0 rgba(0,0,0,0)' }}
              transition={{ duration: 0.3 }}>
              <div className="map-icon">{n.icon}</div>
              <div className="map-label">{n.label}</div>
              {n.sub && <div className="map-sub">{n.sub}</div>}
              {isDown && <div className="map-x">✖</div>}
              {blocked && <motion.div className="flow-block" initial={{ scale: 0 }} animate={{ scale: 1 }}>⛔</motion.div>}
            </motion.div>
          );
        })}
        <AnimatePresence>
          {hop && paths.map((p, i) => p.length > 1 && (
            <Packet key={modeId + step + '-' + i} path={p} pos={pos} label={hop.plabel?.[i] ?? hop.label} color={color} dur={dur} delay={hop.stagger ? i * 0.25 : 0} blocked={hop.status === 'blocked'} />
          ))}
        </AnimatePresence>
      </div>

      <div className="row">
        <button className="btn primary sm" onClick={() => { if (step >= hops.length - 1) setStep(-1); setPlaying((p) => !p); }}>{playing ? '⏸ Pause' : step >= hops.length - 1 ? '↺ আবার' : '▶ Play'}</button>
        <button className="btn sm" disabled={step <= 0} onClick={() => { setPlaying(false); setStep((s) => s - 1); }}>◀ আগের</button>
        <button className="btn sm" disabled={step >= hops.length - 1} onClick={() => { setPlaying(false); setStep((s) => s + 1); }}>পরের ধাপ ▶</button>
        <span className="muted" style={{ fontSize: 14 }}>ধাপ {Math.max(step + 1, 0)} / {hops.length}</span>
        <div className="map-progress">{hops.map((_, i) => <span key={i} className={i <= step ? 'on' : ''} style={{ background: i <= step ? color : undefined }} />)}</div>
      </div>

      <motion.div key={modeId + step} className="card flow-desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ borderColor: hop ? color : 'var(--line)' }}>
        {hop ? (
          <>
            <div className="badge" style={{ color, borderColor: color }}>{hop.status === 'evil' ? '⚠ সমস্যা' : hop.status === 'blocked' ? '⛔ আটকানো/ব্যর্থ' : hop.status === 'ok' ? '✅ সফল' : 'ধাপ ' + (step + 1)}: {hop.label}</div>
            <p style={{ margin: '8px 0 0' }}>{hop.desc}</p>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>▶ Play চাপো অথবা "পরের ধাপ" দিয়ে এক এক করে দেখো। উপরের সব mode দেখলে lab সম্পূর্ণ হবে ({seen.length}/{modes.length})।</p>
        )}
      </motion.div>
    </div>
  );
}
