import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

// Kubernetes: desired state (replicas) — k8s নিজে থেকে বাস্তবকে সেই অবস্থায় আনে
let PID = 0;
const mk = (v = 1) => ({ id: 'p' + ++PID, v, ready: false, born: Date.now() });

export default function K8sLab({ onComplete }) {
  const [replicas, setReplicas] = useState(3);
  const [nodes, setNodes] = useState([{ n: 'node-1', up: true, pods: [] }, { n: 'node-2', up: true, pods: [] }, { n: 'node-3', up: true, pods: [] }]);
  const [version, setVersion] = useState(1);
  const [hpa, setHpa] = useState(false);
  const [traffic, setTraffic] = useState(30);
  const [events, setEvents] = useState([]);
  const [done, setDone] = useState([]);
  const S = useRef({});
  S.current = { replicas, nodes, version, hpa, traffic };
  const tasks = [
    { id: 'scale', text: 'Replicas ৬ করো — নতুন pod তৈরি হবে' },
    { id: 'heal', text: 'একটি node crash করাও — pod অন্য node-এ আবার জন্মাবে (self-healing)' },
    { id: 'roll', text: 'v2 deploy করো — rolling update, একটা একটা করে বদলায়' },
    { id: 'hpa', text: 'HPA চালু করে traffic ৯০%+ করো — replicas নিজে থেকে বাড়বে' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));
  const ev = (t) => setEvents((e) => [{ id: Date.now() + Math.random(), t }, ...e].slice(0, 7));

  // reconcile loop — controller-এর মতো
  useEffect(() => {
    const iv = setInterval(() => {
      const { replicas, nodes, version, hpa, traffic } = S.current;
      let want = replicas;
      if (hpa) {
        const cpu = traffic / Math.max(1, nodes.reduce((a, n) => a + n.pods.length, 0)) * 3;
        if (cpu > 70 && replicas < 9) { setReplicas(replicas + 1); ev(`📈 HPA: CPU ${Math.round(cpu)}% > 70% → replicas ${replicas + 1}`); if (traffic >= 90) mark('hpa'); }
        else if (cpu < 30 && replicas > 2) { setReplicas(replicas - 1); ev(`📉 HPA: CPU ${Math.round(cpu)}% → replicas ${replicas - 1}`); }
      }
      let ns = nodes.map((n) => ({ ...n, pods: n.pods.map((p) => ({ ...p, ready: p.ready || Date.now() - p.born > 900 })) }));
      const all = ns.flatMap((n) => (n.up ? n.pods : []));
      // rolling update: একটা পুরনো version pod বদলাও (maxUnavailable=1)
      const old = all.find((p) => p.v !== version);
      const notReady = all.some((p) => !p.ready);
      if (old && !notReady && all.length >= want) {
        ns = ns.map((n) => ({ ...n, pods: n.pods.filter((p) => p.id !== old.id) }));
        ev(`🔄 Rolling: pod ${old.id} (v${old.v}) সরানো হলো`);
      }
      const live = ns.flatMap((n) => (n.up ? n.pods : []));
      if (live.length < want) {
        const target = ns.filter((n) => n.up).sort((a, b) => a.pods.length - b.pods.length)[0];
        if (target) { const p = mk(version); target.pods = [...target.pods, p]; ev(`🐣 Scheduler: ${p.id} (v${version}) → ${target.n}`); }
      } else if (live.length > want) {
        const target = ns.filter((n) => n.up).sort((a, b) => b.pods.length - a.pods.length)[0];
        const p = target.pods[target.pods.length - 1];
        target.pods = target.pods.slice(0, -1);
        ev(`🗑 ${p.id} বন্ধ (desired ${want})`);
      }
      setNodes(ns);
      const finalLive = ns.flatMap((n) => (n.up ? n.pods : []));
      if (version === 2 && finalLive.length >= want && finalLive.every((p) => p.v === 2 && p.ready)) mark('roll');
      if (replicas >= 6 && finalLive.length >= 6) mark('scale');
      if (ns.some((n) => !n.up) && finalLive.length >= want && finalLive.every((p) => p.ready)) mark('heal');
    }, 700);
    return () => clearInterval(iv);
  }, []);

  const crash = (i) => {
    setNodes((ns) => ns.map((n, j) => (j === i ? { ...n, up: !n.up, pods: n.up ? [] : n.pods } : n)));
    ev(nodes[i].up ? `💥 ${nodes[i].n} crash! ${nodes[i].pods.length}টি pod হারাল` : `✅ ${nodes[i].n} আবার চালু`);
  };
  const live = nodes.flatMap((n) => (n.up ? n.pods : []));

  return (
    <div className="stack">
      <div className="row">
        <span>📄 Deployment replicas: <b>{replicas}</b></span>
        <input type="range" min={1} max={9} value={replicas} disabled={hpa} onChange={(e) => setReplicas(+e.target.value)} style={{ accentColor: '#a78bfa' }} />
        <button className="btn sm primary" disabled={version === 2} onClick={() => { setVersion(2); ev('🚀 kubectl set image … app:v2'); }}>🚀 v2 deploy</button>
        <Toggle on={hpa} onChange={setHpa} label="📈 HPA (auto-scale)" />
        {hpa && <><span className="muted">Traffic: {traffic}%</span><input type="range" min={5} max={100} value={traffic} onChange={(e) => setTraffic(+e.target.value)} style={{ accentColor: '#f472b6' }} /></>}
      </div>
      <div className="k8s-stage">
        <div className="k8s-svc">🌐 Service <small>({live.filter((p) => p.ready).length} ready pod-এ traffic)</small></div>
        <LayoutGroup>
          <div className="k8s-nodes">
            {nodes.map((n, i) => (
              <motion.div key={n.n} className={'k8s-node' + (n.up ? '' : ' down')} layout>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>🖥️ {n.n}</b>
                  <button className={'btn sm ' + (n.up ? 'danger' : 'success')} style={{ padding: '1px 8px', fontSize: 12 }} onClick={() => crash(i)}>{n.up ? '💥 crash' : '🔌 চালু'}</button>
                </div>
                <div className="k8s-pods">
                  <AnimatePresence>
                    {n.pods.map((p) => (
                      <motion.div key={p.id} layoutId={p.id} className="k8s-pod" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: p.ready ? 1 : 0.5 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ background: p.v === 2 ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'linear-gradient(135deg,#0891b2,#2563eb)' }}>
                        📦<small>v{p.v}</small>{!p.ready && <i>…</i>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!n.up && <div className="muted" style={{ fontSize: 13 }}>☠️ NotReady</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-h">📜 Controller events (kubectl get events)</div>
          <AnimatePresence initial={false}>{events.map((e) => <motion.div key={e.id} className="mono" style={{ fontSize: 12.5 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{e.t}</motion.div>)}</AnimatePresence>
          <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>💡 তুমি বলো "কী চাই" (desired state: ৩টি pod, v2)। Kubernetes বারবার দেখে "কী আছে" এবং পার্থক্য মিটিয়ে দেয় — reconciliation loop।</div>
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
