import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// CAP: network partition হলে Consistency নাকি Availability?
export default function CapLab({ onComplete }) {
  const [mode, setMode] = useState('CP');
  const [part, setPart] = useState(false);
  const [a, setA] = useState({ v: 100, ts: 1 });
  const [b, setB] = useState({ v: 100, ts: 1 });
  const [anim, setAnim] = useState(null);
  const [res, setRes] = useState(null);
  const [done, setDone] = useState([]);
  const tasks = [
    { id: 'normal', text: 'Partition ছাড়া: Dhaka-তে লেখো, Singapore থেকে পড়ো — একই মান' },
    { id: 'cp', text: 'CP mode + partition: লেখার চেষ্টা — system "না" বলবে (unavailable)' },
    { id: 'ap', text: 'AP mode + partition: লেখা সফল, কিন্তু Singapore পুরনো মান দেখায় (stale)' },
    { id: 'heal', text: 'AP-তে partition সারিয়ে দাও — দুই node আবার মিলে যায় (eventual consistency)' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));

  const write = () => {
    const nv = { v: a.v + 50, ts: Math.max(a.ts, b.ts) + 1 };
    if (!part) {
      setA(nv); setAnim('sync'); setTimeout(() => { setB(nv); setAnim(null); }, 900);
      setRes({ ok: true, t: `✅ Dhaka-তে likes = ${nv.v} লেখা হলো এবং Singapore-এ replicate হলো।` });
    } else if (mode === 'CP') {
      setAnim('blocked'); setTimeout(() => setAnim(null), 900);
      setRes({ ok: false, t: '⛔ 503 — Singapore-এর সাথে যোগাযোগ নেই, majority (quorum) পাওয়া যাচ্ছে না। ভুল data দেওয়ার চেয়ে "এখন পারব না" বলা ভালো — এটাই Consistency বেছে নেওয়া।' });
      mark('cp');
    } else {
      setA(nv);
      setRes({ ok: true, t: `✅ Dhaka-তে likes = ${nv.v} লেখা হলো (Singapore জানে না!)। System চালু আছে — এটাই Availability বেছে নেওয়া।` });
    }
  };
  const read = () => {
    if (part && mode === 'CP') { setRes({ ok: false, t: '⛔ CP: Singapore নিশ্চিত নয় তার data সর্বশেষ কি না → পড়তেও দেয় না (বা শুধু leader থেকে পড়তে বলে)।' }); return; }
    const stale = b.ts < a.ts;
    setRes({ ok: !stale, t: stale ? `⚠ Singapore থেকে পড়লে: likes = ${b.v} (পুরনো!) — Dhaka-তে আসলে ${a.v}।` : `📖 Singapore থেকে পড়লে: likes = ${b.v} ✓ সর্বশেষ মান।` });
    if (!part && !stale && a.ts > 1) mark('normal');
    if (part && mode === 'AP' && stale) mark('ap');
  };
  const toggle = () => {
    if (part && mode === 'AP' && a.ts !== b.ts) {
      setAnim('sync');
      setTimeout(() => { const w = a.ts > b.ts ? a : b; setA(w); setB(w); setAnim(null); }, 900);
      setRes({ ok: true, t: '🔄 Partition সেরেছে — node-গুলো নিজেদের মধ্যে data মিলিয়ে নিল (last-write-wins)। কিছুক্ষণ পরে সবাই একই — eventual consistency।' });
      mark('heal');
    }
    setPart(!part);
  };

  const Node = ({ name, flag, s, side }) => (
    <motion.div className="cap-node" animate={{ borderColor: anim === 'sync' ? '#22d3ee' : '#2b3d63' }}>
      <div style={{ fontSize: 30 }}>{flag}</div>
      <b>{name}</b>
      <div className="cap-val">❤️ {s.v}</div>
      <small className="muted mono">version {s.ts}</small>
      {side === 'b' && b.ts < a.ts && <div className="badge warn" style={{ marginTop: 4 }}>stale</div>}
    </motion.div>
  );

  return (
    <div className="stack">
      <div className="row">
        <button className={'btn sm ' + (mode === 'CP' ? 'primary' : '')} onClick={() => setMode('CP')}>🏦 CP (Consistency আগে)</button>
        <button className={'btn sm ' + (mode === 'AP' ? 'primary' : '')} onClick={() => setMode('AP')}>📱 AP (Availability আগে)</button>
        <button className={'btn sm ' + (part ? 'success' : 'danger')} onClick={toggle}>{part ? '🔧 Partition সারাও' : '✂️ সাগরের নিচের cable কেটে দাও (partition)'}</button>
      </div>
      <div className="cap-stage">
        <Node name="Dhaka node" flag="🇧🇩" s={a} side="a" />
        <div className="cap-link">
          <div className={'cap-cable' + (part ? ' cut' : '')} />
          {part && <motion.div className="cap-cut" initial={{ scale: 0 }} animate={{ scale: 1 }}>✂️</motion.div>}
          <AnimatePresence>
            {anim === 'sync' && <motion.div className="cap-pkt" initial={{ left: '0%' }} animate={{ left: '100%' }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>📦</motion.div>}
            {anim === 'blocked' && <motion.div className="cap-pkt" initial={{ left: '0%' }} animate={{ left: ['0%', '45%', '40%'] }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>📦✖</motion.div>}
          </AnimatePresence>
        </div>
        <Node name="Singapore node" flag="🇸🇬" s={b} side="b" />
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn primary" onClick={write}>✍️ Dhaka-তে লেখো: likes +50</button>
        <button className="btn" onClick={read}>📖 Singapore থেকে পড়ো</button>
      </div>
      <AnimatePresence mode="wait">{res && <motion.div key={res.t} className={'note ' + (res.ok ? 'good' : 'bad')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{res.t}</motion.div>}</AnimatePresence>
      <div className="grid2">
        <div className="card">
          <div className="section-h">🤔 কোথায় কোনটা?</div>
          <div className="mini-li">🏦 Bank balance, টিকিট বুকিং, inventory → <b>CP</b> (ভুল সংখ্যার চেয়ে অপেক্ষা ভালো)</div>
          <div className="mini-li">❤️ Like count, view count, news feed → <b>AP</b> (একটু পুরনো চলবে, বন্ধ থাকা চলবে না)</div>
          <div className="mini-li">💡 Partition না থাকলে দুটোই পাওয়া যায় — trade-off শুধু partition-এর সময়।</div>
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
