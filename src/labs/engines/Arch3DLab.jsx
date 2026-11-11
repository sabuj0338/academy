import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion } from '../../components/ui.jsx';

function Slab({ layer, i, n, selected, onSelect }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);
  const y = (n - 1 - i) * 1.05 - (n - 1) * 0.52;
  useFrame((st) => {
    if (!ref.current) return;
    const target = selected ? 0.35 : hover ? 0.15 : 0;
    ref.current.position.x += (target - ref.current.position.x) * 0.12;
    ref.current.material.emissiveIntensity = selected ? 0.55 + Math.sin(st.clock.elapsedTime * 3) * 0.15 : hover ? 0.35 : 0.12;
  });
  return (
    <group position={[0, y, 0]}>
      <RoundedBox ref={ref} args={[3.6, 0.42, 2.2]} radius={0.08} smoothness={4}
        onClick={(e) => { e.stopPropagation(); onSelect(i); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }}>
        <meshStandardMaterial color={layer.color} emissive={layer.color} emissiveIntensity={0.12} transparent opacity={selected ? 0.95 : 0.72} roughness={0.35} metalness={0.2} />
      </RoundedBox>
      <Html position={[2.1, 0, 0]} center={false} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <div className="html3d-label" style={{ borderColor: layer.color, opacity: selected ? 1 : 0.85 }}>{layer.name}</div>
      </Html>
    </group>
  );
}

function Packet({ n, evil }) {
  const ref = useRef();
  useFrame((st) => {
    const t = (st.clock.elapsedTime * 0.35) % 1;
    const top = (n - 1) * 0.52 + 0.6;
    ref.current.position.y = top - t * (n * 1.05 + 0.2);
    ref.current.position.z = Math.sin(t * Math.PI * 4) * 0.25;
  });
  return (
    <mesh ref={ref} position={[-1.2, 0, 0]}>
      <sphereGeometry args={[0.13, 24, 24]} />
      <meshStandardMaterial color={evil ? '#f87171' : '#e0f2fe'} emissive={evil ? '#f87171' : '#22d3ee'} emissiveIntensity={1.4} />
    </mesh>
  );
}

export default function Arch3DLab({ layers, onComplete, leftKey = 'risks', rightKey = 'defense', leftTitle = '⚠ সম্ভাব্য আক্রমণ', rightTitle = '🛡 প্রতিরক্ষা', packetLabel }) {
  const [sel, setSel] = useState(0);
  const [seen, setSeen] = useState([0]);
  const [evil, setEvil] = useState(false);
  useCompletion(layers.length, seen.length, onComplete);
  const select = (i) => { setSel(i); setSeen((s) => (s.includes(i) ? s : [...s, i])); };
  const L = layers[sel];
  return (
    <div className="grid-3d">
      <div className="canvas-box" style={{ height: 420 }}>
        <Canvas camera={{ position: [6.5, 2.6, 7.6], fov: 48 }} dpr={[1, 2]}>
          <color attach="background" args={['#060b16']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 6, 5]} intensity={60} />
          <pointLight position={[-6, -3, -4]} intensity={25} color="#a78bfa" />
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
            <group rotation={[0, -0.35, 0]}>
              {layers.map((l, i) => <Slab key={i} layer={l} i={i} n={layers.length} selected={sel === i} onSelect={select} />)}
              <Packet n={layers.length} evil={evil} />
            </group>
          </Float>
          <gridHelper args={[16, 32, '#1f2d4a', '#0f1a30']} position={[0, -(layers.length * 0.55) - 0.3, 0]} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={14} autoRotate={false} />
        </Canvas>
        <div className="canvas-hint">🖱 টেনে ঘোরাও · scroll করে zoom · layer-এ ক্লিক করো</div>
        {leftKey === 'risks' && <button className={'btn sm ' + (evil ? 'danger' : '')} style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setEvil((e) => !e)}>{evil ? '😈 Malicious packet' : '📦 Normal packet'}</button>}
      </div>
      <div className="stack">
        <div className="row" style={{ gap: 6 }}>
          {layers.map((l, i) => (
            <button key={i} className="chip" onClick={() => select(i)} style={{ borderColor: sel === i ? l.color : undefined, opacity: seen.includes(i) ? 1 : 0.6, fontSize: 13 }}>
              {i + 1}. {l.name} {seen.includes(i) && '✓'}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={sel} className="card" style={{ borderColor: L.color }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 style={{ margin: 0, color: L.color }}>{L.name}</h3>
            <div className="muted" style={{ fontSize: 14 }}>{L.sub}</div>
            <div className="grid2" style={{ marginTop: 12, gap: 10 }}>
              <div>
                <div className="section-h" style={{ color: leftKey === 'risks' ? 'var(--red)' : 'var(--cyan)' }}>{leftTitle}</div>
                {L[leftKey].map((r) => <div key={r} className={'mini-li' + (leftKey === 'risks' ? ' bad' : '')}>{r}</div>)}
              </div>
              <div>
                <div className="section-h" style={{ color: leftKey === 'risks' ? 'var(--green)' : 'var(--violet)' }}>{rightTitle}</div>
                {L[rightKey].map((r) => <div key={r} className="mini-li good">{r}</div>)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="muted" style={{ fontSize: 13 }}>দেখা হয়েছে: {seen.length}/{layers.length} layer</div>
      </div>
    </div>
  );
}
