import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox, Line } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useCompletion } from '../../components/ui.jsx';

// 3D sequence diagram: actors দাঁড়িয়ে থাকে, message-গুলো আলোর বলের মতো উড়ে যায়।
// actors: [{id,label,icon,color}], scenarios: [{id,name,kind,desc,msgs:[{from,to,label,desc,color,lost,state:{actorId:'STATE'}}]}]
const GAP = 0.85;

function Actor({ a, x, depth, state }) {
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[1.5, 0.7, 0.9]} radius={0.12} position={[0, 0.6, 0]}>
        <meshStandardMaterial color={a.color} emissive={a.color} emissiveIntensity={0.35} roughness={0.3} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, depth, 8]} />
        <meshBasicMaterial color={a.color} transparent opacity={0.35} />
      </mesh>
      <Html position={[0, 1.35, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="html3d-label" style={{ borderColor: a.color, fontSize: 13 }}>{a.icon} {a.label}</div>
      </Html>
      {state && (
        <Html position={[0, 0.6, 0.5]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="seq-state" style={{ borderColor: a.color }}>{state}</div>
        </Html>
      )}
    </group>
  );
}

function Flying({ from, to, y, color, lost, label }) {
  const ref = useRef();
  const t0 = useRef(null);
  const [done, setDone] = useState(false);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(from, y, 0), new THREE.Vector3((from + to) / 2, y + 0.25, 0.9), new THREE.Vector3(to, y, 0)), [from, to, y]);
  useFrame((st) => {
    if (!ref.current) return;
    if (t0.current === null) t0.current = st.clock.elapsedTime;
    let t = Math.min((st.clock.elapsedTime - t0.current) / 1.15, 1);
    if (lost) t = Math.min(t, 0.5);
    const p = curve.getPoint(t);
    ref.current.position.copy(p);
    ref.current.scale.setScalar(lost && t >= 0.5 ? 1 + Math.sin(st.clock.elapsedTime * 10) * 0.2 : 1);
    if (t >= 1 && !done) setDone(true);
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={lost ? '#f87171' : color} emissive={lost ? '#f87171' : color} emissiveIntensity={1.6} toneMapped={false} />
        <Html center position={[0, 0.38, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="seq-flylabel" style={{ borderColor: lost ? '#f87171' : color }}>{lost ? '✖ ' : ''}{label}</div>
        </Html>
      </mesh>
      {!lost && <Line points={curve.getPoints(30)} color={color} lineWidth={1} transparent opacity={done ? 0.7 : 0.25} dashed={!done} dashSize={0.1} gapSize={0.08} />}
    </group>
  );
}

function Arrow({ from, to, y, color, lost }) {
  const dir = Math.sign(to - from) || 1;
  const end = lost ? (from + to) / 2 : to - dir * 0.15;
  return (
    <group>
      <Line points={[[from, y, 0], [end, y, 0]]} color={lost ? '#f87171' : color} lineWidth={1.5} transparent opacity={0.75} dashed={lost} dashSize={0.12} gapSize={0.1} />
      {!lost && (
        <mesh position={[end, y, 0]} rotation={[0, 0, dir > 0 ? -Math.PI / 2 : Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.22, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
      {lost && <Html position={[end, y, 0]} center style={{ pointerEvents: 'none' }}><span style={{ color: '#f87171', fontWeight: 800 }}>✖</span></Html>}
    </group>
  );
}

export default function Seq3DLab({ actors, scenarios, onComplete }) {
  const [sid, setSid] = useState(scenarios[0].id);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState([]);
  const sc = scenarios.find((s) => s.id === sid);
  const acts = sc.actors ? actors.filter((a) => sc.actors.includes(a.id)) : actors;
  const xs = Object.fromEntries(acts.map((a, i) => [a.id, (i - (acts.length - 1) / 2) * (acts.length > 3 ? 3 : 4)]));
  const msgs = sc.msgs;
  const depth = Math.max(msgs.length * GAP + 0.6, 3);
  useCompletion(scenarios.length, seen.length, onComplete);

  useEffect(() => { setStep(-1); setPlaying(false); }, [sid]);
  useEffect(() => { if (step === msgs.length - 1 && !seen.includes(sid)) setSeen((s) => [...s, sid]); }, [step, msgs.length, sid, seen]);
  useEffect(() => {
    if (!playing) return;
    if (step >= msgs.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), step < 0 ? 200 : 2600);
    return () => clearTimeout(t);
  }, [playing, step, msgs.length]);

  const states = {};
  msgs.slice(0, step + 1).forEach((m) => Object.assign(states, m.state || {}));
  const yOf = (i) => -0.2 - i * GAP;
  const cur = step >= 0 ? msgs[step] : null;
  const colorOf = (m) => m.color || acts.find((a) => a.id === m.from)?.color || '#22d3ee';

  return (
    <div className="stack">
      <div className="row">
        {scenarios.map((s) => (
          <button key={s.id} className={'btn sm ' + (s.id === sid ? (s.kind === 'attack' || s.kind === 'fail' ? 'danger' : s.kind === 'defense' ? 'success' : 'primary') : '')} onClick={() => setSid(s.id)}>
            {s.kind === 'attack' ? '😈 ' : s.kind === 'fail' ? '💥 ' : '▶ '}{s.name} {seen.includes(s.id) && '✓'}
          </button>
        ))}
      </div>
      {sc.desc && <div className="muted" style={{ fontSize: 14.5 }}>📝 {sc.desc}</div>}
      <div className="grid-3d seq-grid">
        <div className="canvas-box" style={{ height: 440 }}>
          <Canvas camera={{ position: [3.5, 1.2, 9.5], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={['#060b16']} />
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 6, 6]} intensity={70} />
            <pointLight position={[-6, -4, 4]} intensity={30} color="#a78bfa" />
            <group position={[0, Math.min(depth / 2 - 0.5, 2.6), 0]} key={sid}>
              {acts.map((a) => <Actor key={a.id} a={a} x={xs[a.id]} depth={depth} state={states[a.id]} />)}
              {msgs.slice(0, Math.max(step, 0)).map((m, i) => <Arrow key={i} from={xs[m.from]} to={xs[m.to]} y={yOf(i)} color={colorOf(m)} lost={m.lost} />)}
              {cur && <Flying key={sid + step} from={xs[cur.from]} to={xs[cur.to]} y={yOf(step)} color={colorOf(cur)} lost={cur.lost} label={cur.label} />}
            </group>
            <OrbitControls enablePan={false} minDistance={5} maxDistance={18} />
          </Canvas>
          <div className="canvas-hint">🖱 টেনে ঘোরাও · scroll করে zoom</div>
        </div>
        <div className="stack">
          <div className="row">
            <button className="btn primary sm" onClick={() => { if (step >= msgs.length - 1) setStep(-1); setPlaying((p) => !p); }}>{playing ? '⏸ Pause' : step >= msgs.length - 1 ? '↺ আবার' : '▶ Play'}</button>
            <button className="btn sm" disabled={step <= 0} onClick={() => { setPlaying(false); setStep((s) => s - 1); }}>◀</button>
            <button className="btn sm" disabled={step >= msgs.length - 1} onClick={() => { setPlaying(false); setStep((s) => s + 1); }}>পরের ▶</button>
            <span className="muted" style={{ fontSize: 13 }}>{Math.max(step + 1, 0)}/{msgs.length}</span>
          </div>
          <div className="seq-list">
            {msgs.map((m, i) => (
              <button key={i} className={'seq-item' + (i === step ? ' on' : '') + (i < step ? ' past' : '')} onClick={() => { setPlaying(false); setStep(i); }} style={{ '--c': m.lost ? '#f87171' : colorOf(m) }}>
                <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{acts.find((a) => a.id === m.from)?.icon}→{acts.find((a) => a.id === m.to)?.icon}</span>
                <span>{m.lost ? '✖ ' : ''}{m.label}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sid + step} className="card" style={{ borderColor: cur ? (cur.lost ? '#f87171' : colorOf(cur)) : 'var(--line)', minHeight: 110 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {cur ? <p style={{ margin: 0 }}>{cur.desc}</p> : <p className="muted" style={{ margin: 0 }}>▶ Play চাপো। প্রতিটি message 3D-তে উড়ে যাবে, ডানে ব্যাখ্যা দেখবে। সব scenario দেখলে lab সম্পূর্ণ ({seen.length}/{scenarios.length})।</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
