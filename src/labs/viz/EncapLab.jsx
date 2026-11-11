import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// Encapsulation: প্রতিটি layer নিজের header দিয়ে data-কে মুড়ে দেয় (পেঁয়াজের খোসার মতো)।
const OSI = [
  { n: 7, name: 'Application', pdu: 'Data', hdr: null, color: '#f472b6', say: 'Browser লিখল: GET /index.html — এটাই আসল data (payload)।' },
  { n: 6, name: 'Presentation', pdu: 'Data', hdr: null, color: '#e879f9', say: 'Data-কে encode/encrypt করা হলো (UTF-8, gzip, TLS encryption)। নতুন header যোগ হয় না, data-র রূপ বদলায়।' },
  { n: 5, name: 'Session', pdu: 'Data', hdr: null, color: '#c084fc', say: 'Session/connection-এর হিসাব রাখা হয় (কোন কথোপকথনের অংশ)। TCP/IP দুনিয়ায় এটা মূলত app/TLS-এর ভেতরেই।' },
  { n: 4, name: 'Transport', pdu: 'Segment', hdr: { id: 'tcp', label: 'TCP', f: 'src port 51544 → dst port 443 · seq 1 · ACK' }, color: '#a78bfa', say: 'TCP header যোগ হলো: কোন port থেকে কোন port-এ (কোন app-এর জন্য), sequence number (ক্রম ঠিক রাখতে)। এখন এর নাম Segment।' },
  { n: 3, name: 'Network', pdu: 'Packet', hdr: { id: 'ip', label: 'IP', f: '192.168.1.5 → 93.184.216.34 · TTL 64' }, color: '#22d3ee', say: 'IP header যোগ হলো: কোন computer থেকে কোন computer-এ (IP address)। Router-রা শুধু এটা পড়েই পথ ঠিক করে। এখন এর নাম Packet।' },
  { n: 2, name: 'Data Link', pdu: 'Frame', hdr: { id: 'eth', label: 'ETH', f: 'MAC aa:11 → router MAC bb:22' }, trailer: 'FCS', color: '#4ade80', say: 'Ethernet/Wi-Fi header (MAC address — পাশের কোন device-এ যাবে) আর শেষে FCS (ভুল ধরার checksum)। এখন এর নাম Frame।' },
  { n: 1, name: 'Physical', pdu: 'Bits', hdr: null, color: '#fbbf24', say: 'পুরো frame এখন 0 আর 1 — তারে বিদ্যুৎ, fiber-এ আলো, Wi-Fi-তে রেডিও তরঙ্গ হয়ে যাত্রা করবে।' },
];
const TCPIP = [
  { label: 'Application', covers: [7, 6, 5], color: '#f472b6' },
  { label: 'Transport', covers: [4], color: '#a78bfa' },
  { label: 'Internet', covers: [3], color: '#22d3ee' },
  { label: 'Link', covers: [2, 1], color: '#4ade80' },
];
const IDENT = [
  { q: 'কোন header দেখে Router ঠিক করে packet কোথায় যাবে?', a: 'ip' },
  { q: 'কোন header বলে data কোন app (port)-এর জন্য?', a: 'tcp' },
  { q: 'কোন header শুধু পাশের device পর্যন্ত (প্রতি hop-এ বদলায়)?', a: 'eth' },
];

export default function EncapLab({ onComplete }) {
  const [down, setDown] = useState(0); // sender-এ কয়টি layer পার হয়েছে (0..7)
  const [sent, setSent] = useState(false);
  const [up, setUp] = useState(0); // receiver-এ কয়টি layer উঠেছে
  const [qi, setQi] = useState(0);
  const [msg, setMsg] = useState(null);
  const [done, setDone] = useState([]);
  const [model, setModel] = useState('osi');
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const tasks = [{ id: 'enc', text: 'Sender-এ ৭টি layer পার করে data-কে bits বানাও' }, { id: 'dec', text: 'Bits পাঠিয়ে receiver-এ উপরে তুলে header খুলে ফেলো' }, { id: 'id', text: 'Header চেনার ৩টি প্রশ্নের উত্তর দাও (packet-এর header-এ ক্লিক)' }];
  useCompletion(tasks.length, done.length, onComplete);

  const layersApplied = sent ? OSI.slice(0, 7 - up) : OSI.slice(0, down);
  const hdrs = layersApplied.filter((l) => l.hdr).reverse(); // outermost first
  const cur = sent ? OSI[6 - Math.min(up, 6)] : OSI[Math.max(down - 1, 0)];
  const stage = !sent ? (down === 0 ? 'শুরু' : `${OSI[down - 1].name} → ${OSI[down - 1].pdu}`) : up >= 7 ? 'Browser পেল ✅' : `Receiver: ${OSI[6 - up].name}`;
  const bits = sent ? up === 0 : down === 7;

  const step = () => {
    if (!sent) {
      if (down < 7) setDown(down + 1);
      if (down + 1 === 7) mark('enc');
    } else if (up < 7) {
      setUp(up + 1);
      if (up + 1 === 7) mark('dec');
    }
  };
  const clickHdr = (id) => {
    if (qi >= IDENT.length) return;
    if (IDENT[qi].a === id) {
      setMsg({ t: '✅ ঠিক! ' + (id === 'ip' ? 'IP header-এ source/destination IP থাকে — router এটাই পড়ে।' : id === 'tcp' ? 'TCP header-এ port number — OS বুঝে কোন app-কে দিতে হবে।' : 'Ethernet header-এর MAC প্রতি hop-এ বদলায়; IP address পুরো পথে একই থাকে।'), good: true });
      if (qi + 1 === IDENT.length) mark('id');
      setQi(qi + 1);
    } else setMsg({ t: '✖ এটা নয় — আবার ভাবো।', good: false });
  };
  const reset = () => { setDown(0); setSent(false); setUp(0); setMsg(null); };

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <button className={'btn sm ' + (model === 'osi' ? 'primary' : '')} onClick={() => setModel('osi')}>OSI (৭ layer)</button>
          <button className={'btn sm ' + (model === 'tcpip' ? 'primary' : '')} onClick={() => setModel('tcpip')}>TCP/IP (৪ layer)</button>
        </div>
        <span className="badge">অবস্থা: {stage}</span>
      </div>
      <div className="encap-grid">
        <div className="encap-col">
          <div className="encap-h">💻 Sender (তোমার laptop)</div>
          {OSI.map((l, i) => (
            <motion.div key={l.n} className={'encap-layer' + (!sent && i < down ? ' on' : '')} style={{ '--c': l.color }} animate={!sent && i === down - 1 ? { x: [0, 6, 0] } : {}}>
              <span className="mono">L{l.n}</span> {l.name}
              {model === 'tcpip' && TCPIP.map((t) => t.covers[0] === l.n && <span key={t.label} className="tcpip-tag" style={{ background: t.color }}>{t.label}</span>)}
            </motion.div>
          ))}
        </div>
        <div className="encap-mid">
          <div className="encap-h">📦 Packet-এর এখনকার চেহারা</div>
          <div className="encap-packet">
            <AnimatePresence>
              {bits ? (
                <motion.div key="bits" className="bits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 64 }, (_, i) => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: (i % 16) * 0.05 }}>{(i * 7919) % 3 ? 1 : 0}</motion.span>)}
                </motion.div>
              ) : (
                <motion.div key="nest" className="nest" layout>
                  {hdrs.map((l) => (
                    <motion.button key={l.hdr.id} layout className="hdr" style={{ '--c': l.color }} onClick={() => clickHdr(l.hdr.id)} initial={{ opacity: 0, x: -30, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -30 }} title={l.hdr.f}>
                      <b>{l.hdr.label}</b><small>{l.hdr.f}</small>
                    </motion.button>
                  ))}
                  <motion.div layout className="payload">{layersApplied.length >= 2 ? '🔒 GET /index.html' : 'GET /index.html'}</motion.div>
                  {layersApplied.some((l) => l.trailer) && <motion.div layout className="hdr trailer" style={{ '--c': '#4ade80' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><b>FCS</b></motion.div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {(down > 0 || sent) && cur && <motion.div key={stage} className="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderColor: cur.color }}>{sent && up >= 7 ? '✅ সব header খুলে ফেলা হয়েছে — Browser শুধু আসল data পেল। এটাই decapsulation।' : cur.say}</motion.div>}
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            {!sent && down < 7 && <button className="btn primary" onClick={step}>⬇ পরের layer-এ নামাও</button>}
            {!sent && down === 7 && <button className="btn primary" onClick={() => setSent(true)}>⚡ তারের মধ্য দিয়ে পাঠাও</button>}
            {sent && up < 7 && <button className="btn primary" onClick={step}>⬆ Receiver-এ উপরে তোলো</button>}
            <button className="btn sm" onClick={reset}>↺ Reset</button>
          </div>
        </div>
        <div className="encap-col">
          <div className="encap-h">🖥️ Receiver (server)</div>
          {OSI.map((l, i) => (
            <div key={l.n} className={'encap-layer' + (sent && 6 - i < up ? ' on' : '')} style={{ '--c': l.color }}>
              <span className="mono">L{l.n}</span> {l.name}
            </div>
          ))}
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-h">🧩 Header চেনো {qi < IDENT.length ? `(${qi + 1}/${IDENT.length})` : '✓'}</div>
          {qi < IDENT.length ? <div>{IDENT[qi].q} <div className="muted" style={{ fontSize: 13 }}>Sender-এ অন্তত Data Link পর্যন্ত নামিয়ে তারপর মাঝের packet-এর রঙিন header-এ ক্লিক করো।</div></div> : <div style={{ color: 'var(--green)' }}>🎉 তিনটিই ঠিক!</div>}
          {msg && <div className={'note ' + (msg.good ? 'good' : 'bad')}>{msg.t}</div>}
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
