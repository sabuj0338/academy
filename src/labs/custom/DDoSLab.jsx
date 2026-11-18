import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Toggle, useCompletion } from '../../components/ui.jsx';

const N = 600;
function Flood({ passRatio, cfOn, bypass }) {
  const ref = useRef();
  const data = useMemo(() => Array.from({ length: N }, () => ({ a: Math.random() * Math.PI * 2, r: 7 + Math.random() * 4, y: (Math.random() - 0.5) * 5, t: Math.random(), legit: Math.random() < 0.06, pass: Math.random() })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    data.forEach((p, i) => {
      p.t += dt * (p.legit ? 0.25 : 0.45);
      if (p.t > 1) { p.t = 0; p.pass = Math.random(); }
      const passes = p.legit || bypass || p.pass < passRatio;
      const shieldR = 3.2;
      let dist = p.r * (1 - p.t);
      if (cfOn && !passes && !bypass && dist < shieldR) dist = shieldR + Math.sin(p.t * 40) * 0.1;
      dummy.position.set(Math.cos(p.a) * dist, p.y * (dist / p.r), Math.sin(p.a) * dist);
      const s = cfOn && !passes && dist <= shieldR + 0.2 ? 0.04 : 0.09;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, color.set(p.legit ? '#4ade80' : '#f87171'));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[null, null, N]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Server({ cpu }) {
  const ref = useRef();
  useFrame((st) => { ref.current.rotation.y += 0.005; const s = 1 + (cpu > 90 ? Math.sin(st.clock.elapsedTime * 20) * 0.03 : 0); ref.current.scale.setScalar(s); });
  const c = cpu > 90 ? '#f87171' : cpu > 60 ? '#fbbf24' : '#22d3ee';
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.2, 1.8, 1.2]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} />
      <Html position={[0, 1.4, 0]} center style={{ pointerEvents: 'none' }}><div className="html3d-label" style={{ borderColor: c }}>Origin CPU {cpu.toFixed(0)}%</div></Html>
    </mesh>
  );
}

export default function DDoSLab({ onComplete }) {
  const [d, setD] = useState({ proxy: false, waf: false, rl: false, cache: false, lock: false });
  const [bypass, setBypass] = useState(false);
  const m = useMemo(() => {
    const attack = 40000, legit = 300, capacity = 2500;
    let pass;
    if (bypass && !d.lock) pass = attack; // origin IP leak → CF সম্পূর্ণ bypass
    else if (!d.proxy) pass = attack;
    else { pass = attack * (d.waf ? 0.35 : 1) * (d.rl ? 0.08 : 1) * (d.cache ? 0.5 : 1); }
    if (bypass && d.lock && !d.proxy) pass = 0;
    const load = pass + legit;
    const cpu = Math.min(100, (load / capacity) * 100);
    const legitOk = cpu < 85 ? 99.9 : Math.max(2, (capacity / load) * 100);
    return { pass, cpu, legitOk };
  }, [d, bypass]);
  const effectiveCF = d.proxy && !(bypass && !d.lock);
  const win = bypass && d.proxy && m.cpu < 60 && m.legitOk > 95;
  useCompletion(1, win ? 1 : 0, onComplete);
  const T = (k, l) => <Toggle on={d[k]} onChange={(v) => setD({ ...d, [k]: v })} label={l} color="var(--orange)" />;

  return (
    <div className="grid-3d">
      <div className="canvas-box" style={{ height: 420 }}>
        <Canvas camera={{ position: [0, 5, 11], fov: 50 }}>
          <color attach="background" args={['#060b16']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 6, 4]} intensity={40} />
          <Flood passRatio={effectiveCF ? Math.min(1, m.pass / 40000) : 1} cfOn={effectiveCF} bypass={bypass && !d.lock} />
          <Server cpu={m.cpu} />
          {effectiveCF && (
            <mesh>
              <sphereGeometry args={[3.2, 32, 32]} />
              <meshStandardMaterial color="#fb923c" transparent opacity={0.12} emissive="#fb923c" emissiveIntensity={0.4} wireframe />
            </mesh>
          )}
          <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} minDistance={6} maxDistance={18} />
        </Canvas>
        <div className="canvas-hint">🔴 attack traffic · 🟢 আসল user · 🟠 Cloudflare shield</div>
      </div>
      <div className="stack">
        <div className="card">
          <div className="section-h">☁️ Cloudflare ও origin defense</div>
          <div className="stack" style={{ gap: 8 }}>
            {T('proxy', 'Proxy চালু (কমলা মেঘ)')}
            {T('waf', 'WAF + Bot Fight Mode')}
            {T('rl', 'Rate Limiting Rule (/api/*)')}
            {T('cache', 'Cache Rules (static + public API)')}
            {T('lock', 'Origin firewall: শুধু CF IP / Tunnel')}
          </div>
          <div className="section-h" style={{ marginTop: 12, color: 'var(--red)' }}>😈 Attacker</div>
          <Toggle on={bypass} onChange={setBypass} label="Origin IP জেনে সরাসরি আক্রমণ" color="var(--red)" />
        </div>
        <div className="card">
          <div className="metric"><span>Origin-এ পৌঁছানো attack</span><b className="mono">{Math.round(m.pass).toLocaleString()} req/s</b></div>
          <div className="metric"><span>Server CPU</span><b style={{ color: m.cpu > 90 ? 'var(--red)' : m.cpu > 60 ? 'var(--amber)' : 'var(--green)' }}>{m.cpu.toFixed(0)}%</b></div>
          <div className="metric"><span>আসল user সফল</span><b style={{ color: m.legitOk > 95 ? 'var(--green)' : 'var(--red)' }}>{m.legitOk.toFixed(1)}%</b></div>
          {bypass && !d.lock && <div className="note bad">💥 Origin IP leak! Cloudflare-এর সব সুরক্ষা bypass — attacker সরাসরি তোমার server-এ।</div>}
          {win && <div className="note good">🎉 Origin IP জানা থাকলেও firewall শুধু Cloudflare-কে ঢুকতে দেয়, আর edge-এ WAF/rate limit L7 flood আটকাচ্ছে।</div>}
          {!win && <div className="muted" style={{ fontSize: 13 }}>লক্ষ্য: "Origin IP জেনে সরাসরি আক্রমণ" চালু থাকা অবস্থায় CPU &lt; 60% এবং আসল user &gt; 95%।</div>}
        </div>
      </div>
    </div>
  );
}
