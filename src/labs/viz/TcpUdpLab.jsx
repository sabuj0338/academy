import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// TCP vs UDP দৌড়: একই ৮টি packet, একই packet loss — কে কীভাবে সামলায়?
const N = 8;
const APPS = [
  { t: '📞 WhatsApp video call', a: 'udp', why: 'একটু ছবি ফেটে গেলে চলে, কিন্তু ২ সেকেন্ড পিছিয়ে থাকা চলে না।' },
  { t: '📄 ব্যাংক statement ডাউনলোড', a: 'tcp', why: 'একটা byte হারালেও file নষ্ট — প্রতিটি packet পৌঁছাতেই হবে।' },
  { t: '🎮 Online game-এ খেলোয়াড়ের অবস্থান', a: 'udp', why: 'পুরনো অবস্থান আবার পাঠিয়ে লাভ নেই, নতুনটাই দরকার।' },
  { t: '📧 Email পাঠানো', a: 'tcp', why: 'পুরো message ঠিকঠাক, ক্রমানুসারে পৌঁছাতে হবে।' },
  { t: '🔎 DNS query', a: 'udp', why: 'ছোট একটা প্রশ্ন-উত্তর; হারালে আবার জিজ্ঞেস করলেই হলো — handshake-এর খরচ বাঁচে।' },
];

function plan(loss, tcp) {
  const ev = []; // {seq, t, lost, retry}
  const lostFirst = [];
  for (let i = 0; i < N; i++) {
    const lost = Math.random() < loss;
    ev.push({ seq: i + 1, t: i * 0.45, lost });
    if (lost) lostFirst.push(i + 1);
  }
  if (tcp) {
    let t = N * 0.45 + 1.2; // timeout-এর পরে retransmit
    lostFirst.forEach((s) => { ev.push({ seq: s, t, lost: false, retry: true }); t += 0.6; });
  }
  return ev;
}

function Lane({ kind, events, running, onArrive, arrived, title, color }) {
  return (
    <div className="lane">
      <div className="lane-h" style={{ color }}>{title}</div>
      <div className="lane-track">
        <div className="lane-end left">💻<small>Sender</small></div>
        <div className="lane-end right">🖥️<small>Receiver</small></div>
        <AnimatePresence>
          {running && events.map((e, i) => (
            <motion.div key={kind + i} className={'lane-pkt' + (e.retry ? ' retry' : '')} style={{ background: e.retry ? '#fb923c' : color }}
              initial={{ left: '9%', opacity: 0 }}
              animate={e.lost ? { left: ['9%', '50%', '50%'], opacity: [1, 1, 0], rotate: [0, 0, 45] } : { left: ['9%', '88%'], opacity: [1, 1] }}
              transition={{ delay: e.t, duration: e.lost ? 1.1 : 1.0, ease: 'linear' }}
              onAnimationComplete={() => !e.lost && onArrive(e.seq)}>
              {e.lost ? '✖' : e.seq}
            </motion.div>
          ))}
          {running && kind === 'tcp' && events.filter((e) => !e.lost).map((e, i) => (
            <motion.div key={'ack' + i} className="lane-ack" initial={{ left: '88%', opacity: 0 }} animate={{ left: ['88%', '9%'], opacity: [0, 1, 0] }} transition={{ delay: e.t + 1.0, duration: 0.8 }}>ACK {e.seq}</motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="lane-buf">
        {Array.from({ length: N }, (_, i) => {
          const got = arrived.includes(i + 1);
          return <motion.span key={i} animate={{ scale: got ? [1.4, 1] : 1, background: got ? color : 'rgba(255,255,255,.03)' }} style={{ color: got ? '#04111f' : 'var(--dim)' }}>{i + 1}</motion.span>;
        })}
      </div>
    </div>
  );
}

export default function TcpUdpLab({ onComplete }) {
  const [loss, setLoss] = useState(0.25);
  const [run, setRun] = useState(0);
  const [ev, setEv] = useState({ tcp: [], udp: [] });
  const [arr, setArr] = useState({ tcp: [], udp: [] });
  const [t0, setT0] = useState(0);
  const [times, setTimes] = useState({});
  const [done, setDone] = useState([]);
  const [ans, setAns] = useState({});
  const timer = useRef();
  const tasks = [
    { id: 'run0', text: 'Loss ০% রেখে একবার পাঠাও — দুটোই সব পায়' },
    { id: 'runloss', text: 'Loss ২০%+ করে পাঠাও — পার্থক্য দেখো' },
    { id: 'apps', text: '৫টি app-এর জন্য সঠিক protocol বেছে নাও' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  const start = () => {
    setEv({ tcp: plan(loss, true), udp: plan(loss, false) });
    setArr({ tcp: [], udp: [] });
    setTimes({});
    setT0(performance.now());
    setRun((r) => r + 1);
    clearTimeout(timer.current);
    const id = loss === 0 ? 'run0' : loss >= 0.2 ? 'runloss' : null;
    if (id) timer.current = setTimeout(() => mark(id), 6500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const arrive = (k) => (seq) => {
    setArr((a) => {
      const n = { ...a, [k]: [...new Set([...a[k], seq])] };
      setTimes((t) => ({ ...t, [k]: ((performance.now() - t0) / 1000).toFixed(1) }));
      return n;
    });
  };
  useEffect(() => { if (Object.keys(ans).length === APPS.length && APPS.every((a, i) => ans[i] === a.a)) mark('apps'); }, [ans]); // eslint-disable-line

  return (
    <div className="stack">
      <div className="row">
        <span>📉 Packet loss (পথে হারানোর সম্ভাবনা): <b>{Math.round(loss * 100)}%</b></span>
        <input type="range" min={0} max={0.5} step={0.05} value={loss} onChange={(e) => setLoss(+e.target.value)} style={{ accentColor: '#f87171', width: 200 }} />
        <button className="btn primary" onClick={start}>🚀 দুই lane-এ ৮টি packet পাঠাও</button>
      </div>
      <Lane key={'t' + run} kind="tcp" title="🤝 TCP — নির্ভরযোগ্য (ACK + retransmit + ক্রম ঠিক রাখে)" color="#a78bfa" events={ev.tcp} running={run > 0} arrived={arr.tcp} onArrive={arrive('tcp')} />
      <Lane key={'u' + run} kind="udp" title="⚡ UDP — দ্রুত (পাঠিয়ে দাও, ফিরে দেখো না)" color="#22d3ee" events={ev.udp} running={run > 0} arrived={arr.udp} onArrive={arrive('udp')} />
      {run > 0 && (
        <div className="grid2">
          <div className="note" style={{ borderColor: '#a78bfa' }}>TCP: পেয়েছে <b>{arr.tcp.length}/{N}</b> {times.tcp && `· শেষ packet ${times.tcp}s`} — হারানোগুলো (কমলা) timeout-এর পরে আবার পাঠানো হয়েছে। সব পৌঁছায়, কিন্তু সময় বেশি লাগে।</div>
          <div className="note" style={{ borderColor: '#22d3ee' }}>UDP: পেয়েছে <b>{arr.udp.length}/{N}</b> {times.udp && `· শেষ packet ${times.udp}s`} — হারানো packet আর আসবে না, ফাঁকা ঘরগুলো দেখো। কিন্তু কোনো অপেক্ষা নেই।</div>
        </div>
      )}
      <div className="grid2">
        <div className="card">
          <div className="section-h">🤔 কোন app-এ কোনটা?</div>
          {APPS.map((a, i) => (
            <div key={i} className="app-pick">
              <span>{a.t}</span>
              <div className="row" style={{ gap: 4 }}>
                {['tcp', 'udp'].map((p) => <button key={p} className={'btn sm ' + (ans[i] === p ? (p === a.a ? 'success' : 'danger') : '')} onClick={() => setAns({ ...ans, [i]: p })}>{p.toUpperCase()}</button>)}
              </div>
              {ans[i] && <div className="muted" style={{ fontSize: 13, width: '100%' }}>{ans[i] === a.a ? '✅ ' : '✖ '}{a.why}</div>}
            </div>
          ))}
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
