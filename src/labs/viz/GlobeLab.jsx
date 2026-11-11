import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useCompletion } from '../../components/ui.jsx';

// 3D পৃথিবী — শহরগুলোর মধ্যে data-র arc। cities: [{id,name,lat,lon,kind}]
// scenarios: [{id,name,desc,routes:[{from,to,label,desc,color}]}]
const R = 2;
const KIND = { user: '#22d3ee', server: '#f472b6', edge: '#4ade80', dns: '#fbbf24', isp: '#a78bfa', cable: '#fb923c' };

function v3(lat, lon, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const th = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

function Earth() {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(R * 1.002, 5), []);
  const rings = useMemo(() => {
    const out = [];
    for (let lat = -60; lat <= 60; lat += 30) out.push(Array.from({ length: 73 }, (_, i) => v3(lat, i * 5 - 180, R * 1.003)));
    for (let lon = -180; lon < 180; lon += 30) out.push(Array.from({ length: 37 }, (_, i) => v3(i * 5 - 90, lon, R * 1.003)));
    return out;
  }, []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial color="#0b1a36" emissive="#0e7490" emissiveIntensity={0.18} roughness={0.8} />
      </mesh>
      <points geometry={geo}><pointsMaterial color="#67e8f9" size={0.022} transparent opacity={0.55} /></points>
      {rings.map((pts, i) => <Line key={i} points={pts} color="#1e3a5f" lineWidth={0.6} transparent opacity={0.6} />)}
      <mesh><sphereGeometry args={[R * 1.08, 48, 48]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.05} side={THREE.BackSide} /></mesh>
    </group>
  );
}

function Arc({ a, b, color, active, label }) {
  const ref = useRef();
  const t0 = useRef(null);
  const curve = useMemo(() => {
    const A = v3(a.lat, a.lon), B = v3(b.lat, b.lon);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const h = 1 + A.distanceTo(B) * 0.32;
    mid.normalize().multiplyScalar(R * h);
    return new THREE.QuadraticBezierCurve3(A, mid, B);
  }, [a, b]);
  const pts = useMemo(() => curve.getPoints(60), [curve]);
  useFrame((st) => {
    if (!ref.current || !active) return;
    if (t0.current === null) t0.current = st.clock.elapsedTime;
    const t = Math.min((st.clock.elapsedTime - t0.current) / 1.6, 1);
    ref.current.position.copy(curve.getPoint(t));
  });
  return (
    <group>
      <Line points={pts} color={color} lineWidth={active ? 2.2 : 1} transparent opacity={active ? 0.95 : 0.35} />
      {active && (
        <mesh ref={ref} position={pts[0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
          <Html center position={[0, 0.2, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <div className="seq-flylabel" style={{ borderColor: color }}>{label}</div>
          </Html>
        </mesh>
      )}
    </group>
  );
}

function City({ c, hot }) {
  const p = useMemo(() => v3(c.lat, c.lon, R * 1.01), [c]);
  const col = KIND[c.kind] || '#e6edf7';
  const ring = useRef();
  useFrame((st) => { if (ring.current) { const s = 1 + ((st.clock.elapsedTime * 1.2) % 1) * 2.2; ring.current.scale.setScalar(s); ring.current.material.opacity = 0.7 - ((st.clock.elapsedTime * 1.2) % 1) * 0.7; } });
  return (
    <group position={p} onUpdate={(g) => g.lookAt(0, 0, 0)}>
      <mesh><sphereGeometry args={[hot ? 0.065 : 0.045, 16, 16]} /><meshBasicMaterial color={col} toneMapped={false} /></mesh>
      {hot && <mesh ref={ring}><ringGeometry args={[0.07, 0.09, 32]} /><meshBasicMaterial color={col} transparent side={THREE.DoubleSide} /></mesh>}
      <Html center position={[0, 0, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none', transform: 'translateY(-18px)' }}>
        <div className="globe-label" style={{ borderColor: col, opacity: hot ? 1 : 0.7 }}>{c.icon || ''} {c.name}</div>
      </Html>
    </group>
  );
}

function Spin({ children, focus }) {
  const g = useRef();
  useFrame((_, dt) => {
    if (!g.current) return;
    if (focus) {
      const target = -((focus.lon + 90) * Math.PI) / 180;
      let d = target - g.current.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      g.current.rotation.y += d * Math.min(dt * 2, 1);
      g.current.rotation.x += ((focus.lat * Math.PI) / 360 - g.current.rotation.x) * Math.min(dt * 2, 1);
    }
  });
  return <group ref={g}>{children}</group>;
}

export default function GlobeLab({ cities, scenarios, onComplete }) {
  const [sid, setSid] = useState(scenarios[0].id);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState([]);
  const sc = scenarios.find((s) => s.id === sid);
  const C = Object.fromEntries(cities.map((c) => [c.id, c]));
  const routes = sc.routes;
  useCompletion(scenarios.length, seen.length, onComplete);
  useEffect(() => { setStep(-1); setPlaying(false); }, [sid]);
  useEffect(() => { if (step === routes.length - 1 && !seen.includes(sid)) setSeen((s) => [...s, sid]); }, [step, routes.length, sid, seen]);
  useEffect(() => {
    if (!playing) return;
    if (step >= routes.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), step < 0 ? 200 : 3000);
    return () => clearTimeout(t);
  }, [playing, step, routes.length]);
  const cur = step >= 0 ? routes[step] : null;
  const hot = new Set(routes.slice(0, step + 1).flatMap((r) => [r.from, r.to]));
  const focus = cur ? { lat: (C[cur.from].lat + C[cur.to].lat) / 2, lon: (C[cur.from].lon + C[cur.to].lon) / 2 } : C[routes[0].from];
  const usedCities = new Set(scenarios.flatMap((s) => s.routes.flatMap((r) => [r.from, r.to])));

  return (
    <div className="stack">
      <div className="row">
        {scenarios.map((s) => (
          <button key={s.id} className={'btn sm ' + (s.id === sid ? (s.kind === 'fail' ? 'danger' : s.kind === 'defense' ? 'success' : 'primary') : '')} onClick={() => setSid(s.id)}>
            🌍 {s.name} {seen.includes(s.id) && '✓'}
          </button>
        ))}
      </div>
      {sc.desc && <div className="muted" style={{ fontSize: 14.5 }}>📝 {sc.desc}</div>}
      <div className="grid-3d">
        <div className="canvas-box" style={{ height: 440 }}>
          <Canvas camera={{ position: [0, 0.6, 6.2], fov: 45 }} dpr={[1, 2]}>
            <color attach="background" args={['#03060c']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[6, 4, 6]} intensity={80} color="#e0f2fe" />
            <Spin focus={focus}>
              <Earth />
              {cities.filter((c) => usedCities.has(c.id)).map((c) => <City key={c.id} c={c} hot={hot.has(c.id)} />)}
              {routes.slice(0, step + 1).map((r, i) => <Arc key={sid + i} a={C[r.from]} b={C[r.to]} color={r.color || '#22d3ee'} active={i === step} label={r.label} />)}
            </Spin>
            <OrbitControls enablePan={false} minDistance={3.5} maxDistance={10} />
          </Canvas>
          <div className="canvas-hint">🖱 টেনে পৃথিবী ঘোরাও · scroll করে zoom</div>
          <div className="globe-legend">{Object.entries({ user: 'User', server: 'Server/Origin', edge: 'Edge/CDN', dns: 'DNS', isp: 'ISP/IXP' }).map(([k, v]) => <span key={k}><i style={{ background: KIND[k] }} />{v}</span>)}</div>
        </div>
        <div className="stack">
          <div className="row">
            <button className="btn primary sm" onClick={() => { if (step >= routes.length - 1) setStep(-1); setPlaying((p) => !p); }}>{playing ? '⏸ Pause' : step >= routes.length - 1 ? '↺ আবার' : '▶ Play'}</button>
            <button className="btn sm" disabled={step <= 0} onClick={() => { setPlaying(false); setStep((s) => s - 1); }}>◀</button>
            <button className="btn sm" disabled={step >= routes.length - 1} onClick={() => { setPlaying(false); setStep((s) => s + 1); }}>পরের ▶</button>
            <span className="muted" style={{ fontSize: 13 }}>{Math.max(step + 1, 0)}/{routes.length}</span>
          </div>
          <div className="seq-list">
            {routes.map((r, i) => (
              <button key={i} className={'seq-item' + (i === step ? ' on' : '') + (i < step ? ' past' : '')} style={{ '--c': r.color || '#22d3ee' }} onClick={() => { setPlaying(false); setStep(i); }}>
                <span className="mono" style={{ fontSize: 11, opacity: 0.75 }}>{C[r.from].name} → {C[r.to].name}</span><span>{r.label}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sid + step} className="card" style={{ borderColor: cur?.color || 'var(--line)', minHeight: 100 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {cur ? <p style={{ margin: 0 }}>{cur.desc}</p> : <p className="muted" style={{ margin: 0 }}>▶ Play চাপো — data কোন শহর থেকে কোন শহরে যায় 3D পৃথিবীতে দেখো। সব scenario দেখলে lab সম্পূর্ণ ({seen.length}/{scenarios.length})।</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
