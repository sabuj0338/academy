import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function Globe() {
  const g = useRef();
  const pts = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 3);
    return geo;
  }, []);
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.12; g.current.rotation.x += dt * 0.03; });
  return (
    <group ref={g}>
      <mesh geometry={pts}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.14} />
      </mesh>
      <points geometry={pts}>
        <pointsMaterial color="#67e8f9" size={0.05} />
      </points>
      <mesh>
        <sphereGeometry args={[2.05, 48, 48]} />
        <meshStandardMaterial color="#0b1730" emissive="#0e7490" emissiveIntensity={0.25} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Orbit({ r, speed, color, tilt, n = 3 }) {
  const ref = useRef();
  useFrame((st) => { ref.current.rotation.z = st.clock.elapsedTime * speed; });
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.006, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Shield() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.9); s.quadraticCurveTo(0.6, 0.75, 0.75, 0.7); s.lineTo(0.7, 0); s.quadraticCurveTo(0.55, -0.6, 0, -0.95);
    s.quadraticCurveTo(-0.55, -0.6, -0.7, 0); s.lineTo(-0.75, 0.7); s.quadraticCurveTo(-0.6, 0.75, 0, 0.9);
    return s;
  }, []);
  return (
    <Float speed={2} floatIntensity={0.6} rotationIntensity={0.4}>
      <mesh position={[0, 0, 2.4]} scale={0.6}>
        <extrudeGeometry args={[shape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 }]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.6} metalness={0.4} roughness={0.25} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 7.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 6]} intensity={50} color="#e0f2fe" />
      <group position={[2.2, 0.3, 0]}>
        <Globe />
        <Orbit r={2.9} speed={0.6} color="#22d3ee" tilt={0.5} />
        <Orbit r={3.3} speed={-0.4} color="#f472b6" tilt={-0.7} n={2} />
        <Orbit r={3.6} speed={0.3} color="#4ade80" tilt={1.2} n={4} />
        <Shield />
      </group>
    </Canvas>
  );
}
