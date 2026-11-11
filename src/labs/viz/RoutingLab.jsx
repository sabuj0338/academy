import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

const toInt = (ip) => ip.split('.').reduce((a, x) => ((a << 8) >>> 0) + +x, 0) >>> 0;
const inNet = (ip, net, c) => (c === 0 ? true : ((toInt(ip) & ((0xffffffff << (32 - c)) >>> 0)) >>> 0) === toInt(net));
const TABLE = [
  { net: '0.0.0.0', c: 0, via: 'ISP (203.0.113.1)', ifc: 'wan0', icon: '🌍', note: 'Default route — বাকি সবকিছু' },
  { net: '10.0.0.0', c: 8, via: 'VPN tunnel', ifc: 'wg0', icon: '🔐', note: 'কোম্পানির পুরো private network' },
  { net: '10.20.0.0', c: 16, via: 'Branch office router', ifc: 'wg0', icon: '🏢', note: 'চট্টগ্রাম শাখা' },
  { net: '10.20.5.0', c: 24, via: 'Server room switch', ifc: 'wg0', icon: '🗄️', note: 'শাখার server room' },
  { net: '192.168.1.0', c: 24, via: 'Directly connected', ifc: 'lan0', icon: '🏠', note: 'বাড়ির LAN' },
];
const DESTS = [['8.8.8.8', 'Google DNS'], ['10.3.9.1', 'HQ server'], ['10.20.77.4', 'শাখার printer'], ['10.20.5.30', 'শাখার DB server'], ['192.168.1.42', 'বাড়ির TV']];

export default function RoutingLab({ onComplete }) {
  const [tab, setTab] = useState('lpm');
  const [dst, setDst] = useState('10.20.5.30');
  const [scan, setScan] = useState(-1);
  const [winner, setWinner] = useState(null);
  const [nat, setNat] = useState([]);
  const [flash, setFlash] = useState(null);
  const [done, setDone] = useState([]);
  const tasks = [
    { id: 'def', text: 'এমন destination route করো যা শুধু default route (/0)-এ মেলে' },
    { id: 'lpm', text: 'এমন destination দাও যেখানে ৩টি route মেলে — longest prefix জিতে' },
    { id: 'lan', text: 'বাড়ির LAN-এর কোনো device-এ route করো (directly connected)' },
    { id: 'nat', text: 'NAT tab-এ দুইটি আলাদা device থেকে internet-এ request পাঠাও' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const valid = /^(\d{1,3}\.){3}\d{1,3}$/.test(dst) && dst.split('.').every((x) => +x < 256);

  const route = () => {
    if (!valid) return;
    setWinner(null);
    setScan(0);
  };
  useEffect(() => {
    if (scan < 0) return;
    if (scan >= TABLE.length) {
      const matches = TABLE.map((r, i) => ({ ...r, i })).filter((r) => inNet(dst, r.net, r.c));
      const w = matches.sort((a, b) => b.c - a.c)[0];
      setWinner(w);
      if (matches.length === 1) mark('def');
      if (matches.length >= 3) mark('lpm');
      if (w.ifc === 'lan0') mark('lan');
      setScan(-1);
      return;
    }
    const t = setTimeout(() => setScan(scan + 1), 550);
    return () => clearTimeout(t);
  }, [scan]); // eslint-disable-line

  const send = (dev, ipaddr) => {
    const port = 50000 + Math.floor(Math.random() * 9000);
    const pub = 40000 + nat.length;
    const row = { dev, in: `${ipaddr}:${port}`, out: `103.110.5.9:${pub}`, to: '142.250.193.14:443' };
    setNat((n) => [...n, row]);
    setFlash(nat.length);
    const devs = new Set([...nat.map((r) => r.dev), dev]);
    if (devs.size >= 2) mark('nat');
  };

  return (
    <div className="stack">
      <div className="row">
        <button className={'btn sm ' + (tab === 'lpm' ? 'primary' : '')} onClick={() => setTab('lpm')}>🧭 Routing table (Longest Prefix Match)</button>
        <button className={'btn sm ' + (tab === 'nat' ? 'primary' : '')} onClick={() => setTab('nat')}>🔁 NAT translation</button>
      </div>
      {tab === 'lpm' ? (
        <>
          <div className="row">
            <span>📦 Destination IP:</span>
            <input className="input mono" style={{ width: 180 }} value={dst} onChange={(e) => { setDst(e.target.value); setWinner(null); }} />
            <button className="btn primary sm" disabled={!valid || scan >= 0} onClick={route}>🧭 Route lookup</button>
            {DESTS.map(([d, l]) => <button key={d} className="cmd-chip mono" onClick={() => { setDst(d); setWinner(null); }}>{d} <span style={{ fontFamily: 'var(--font)' }}>({l})</span></button>)}
          </div>
          <div className="rt-table">
            <div className="rt-row rt-head"><span>Destination</span><span>Prefix</span><span>Next hop</span><span>Interface</span><span>মিলেছে?</span></div>
            {TABLE.map((r, i) => {
              const checked = scan > i || (scan === -1 && winner);
              const ok = valid && inNet(dst, r.net, r.c);
              return (
                <motion.div key={i} className="rt-row" animate={{ backgroundColor: scan === i ? 'rgba(34,211,238,.15)' : winner?.i === i ? 'rgba(74,222,128,.15)' : 'rgba(0,0,0,0)', scale: winner?.i === i ? 1.02 : 1 }}>
                  <span className="mono">{r.icon} {r.net}</span><span className="mono">/{r.c}</span><span>{r.via}</span><span className="mono">{r.ifc}</span>
                  <span>{checked ? (ok ? <b style={{ color: '#4ade80' }}>✓ মেলে ({r.c} bit)</b> : <span className="muted">✖ না</span>) : scan === i ? '🔎…' : ''}</span>
                </motion.div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {winner && (
              <motion.div key={dst} className="note good" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                🏆 বিজয়ী: <b className="mono">{winner.net}/{winner.c}</b> → {winner.via} ({winner.ifc}). একাধিক route মিললে router সবচেয়ে <b>লম্বা prefix</b> (সবচেয়ে নির্দিষ্ট) বেছে নেয় — যেমন চিঠিতে "ঢাকা" না "মিরপুর ১০, রোড ৫" — যেটা বেশি নির্দিষ্ট সেটাই আগে। ({winner.note})
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <div className="nat-stage">
            <div className="nat-side">
              <div className="encap-h">🏠 Private LAN (192.168.1.0/24)</div>
              {[['📱 Phone', '192.168.1.23'], ['💻 Laptop', '192.168.1.5'], ['📺 Smart TV', '192.168.1.42']].map(([d, a]) => (
                <button key={d} className="btn sm" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => send(d, a)}>{d} <span className="mono muted">{a}</span> → 🌐</button>
              ))}
            </div>
            <div className="nat-router">
              <motion.div className="nat-box" animate={{ boxShadow: flash !== null ? ['0 0 0px #22d3ee', '0 0 30px #22d3ee', '0 0 0px #22d3ee'] : 'none' }} key={flash}>📡<b>Router (NAT)</b><small className="mono">LAN 192.168.1.1<br />WAN 103.110.5.9</small></motion.div>
            </div>
            <div className="nat-side">
              <div className="encap-h">🌐 Internet</div>
              <div className="muted" style={{ fontSize: 14 }}>Google server (142.250.193.14) শুধু একটি IP দেখে: <b className="mono">103.110.5.9</b>। ভেতরে কয়টা device আছে সে জানে না।</div>
            </div>
          </div>
          <div className="rt-table">
            <div className="rt-row rt-head nat"><span>Device</span><span>ভেতরের (private) IP:port</span><span>বাইরের (public) IP:port</span><span>গন্তব্য</span></div>
            {nat.length === 0 && <div className="muted" style={{ padding: 10 }}>বাম দিকের কোনো device থেকে request পাঠাও।</div>}
            {nat.map((r, i) => (
              <motion.div key={i} className="rt-row nat" initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(34,211,238,.25)' }} animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 0.8 }}>
                <span>{r.dev}</span><span className="mono">{r.in}</span><span className="mono" style={{ color: '#22d3ee' }}>{r.out}</span><span className="mono">{r.to}</span>
              </motion.div>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 14 }}>💡 Reply ফিরে এলে router এই table দেখে বোঝে port 400xx কোন device-এর — এবং destination বদলে ভেতরে পাঠায়। IPv4 address কম বলেই পুরো বাড়ি/অফিস একটি public IP share করে।</div>
        </>
      )}
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
