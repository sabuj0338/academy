import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// Wireshark-এর মতো packet capture simulation (সব data বানানো, তোমার lab network)
const ME = '192.168.1.5', GW = '192.168.1.1', DNS = '1.1.1.1', SHOP = '203.0.113.10', BANK = '198.51.100.7';
const P = [];
const add = (src, dst, proto, info, layers, tags = []) => P.push({ no: P.length + 1, time: (P.length * 0.0137).toFixed(4), src, dst, proto, len: 54 + ((P.length * 37) % 500), info, layers, tags: [proto.toLowerCase(), ...tags] });
const eth = (a, b) => ({ name: 'Ethernet II', f: [['Src MAC', a], ['Dst MAC', b]] });
const ip = (s, d, ttl = 64) => ({ name: 'Internet Protocol v4', f: [['Source', s], ['Destination', d], ['TTL', ttl], ['Protocol', '']] });
const tcp = (sp, dp, flags, seq, ack) => ({ name: 'Transmission Control Protocol', f: [['Src Port', sp], ['Dst Port', dp], ['Flags', flags], ['Seq', seq], ['Ack', ack]] });
const udp = (sp, dp) => ({ name: 'User Datagram Protocol', f: [['Src Port', sp], ['Dst Port', dp]] });
const LM = 'aa:bb:cc:00:00:05', RM = 'aa:bb:cc:00:00:01';

add(ME, 'Broadcast', 'ARP', 'Who has 192.168.1.1? Tell 192.168.1.5', [eth(LM, 'ff:ff:ff:ff:ff:ff'), { name: 'Address Resolution Protocol', f: [['Opcode', 'request (1)'], ['Sender IP', ME], ['Target IP', GW], ['Target MAC', '00:00:00:00:00:00 (জানি না)']] }]);
add(GW, ME, 'ARP', '192.168.1.1 is at aa:bb:cc:00:00:01', [eth(RM, LM), { name: 'Address Resolution Protocol', f: [['Opcode', 'reply (2)'], ['Sender IP', GW], ['Sender MAC', RM]] }]);
add(ME, DNS, 'DNS', 'Standard query 0x1a2b A shop.local', [eth(LM, RM), ip(ME, DNS), udp(53122, 53), { name: 'Domain Name System (query)', f: [['Transaction ID', '0x1a2b'], ['Question', 'shop.local: type A, class IN']] }], ['udp']);
add(DNS, ME, 'DNS', 'Standard query response 0x1a2b A shop.local A 203.0.113.10', [eth(RM, LM), ip(DNS, ME, 57), udp(53, 53122), { name: 'Domain Name System (response)', f: [['Transaction ID', '0x1a2b'], ['Answer', 'shop.local A 203.0.113.10 TTL 300']] }], ['udp']);
add(ME, SHOP, 'TCP', '51544 → 80 [SYN] Seq=0', [eth(LM, RM), ip(ME, SHOP), tcp(51544, 80, 'SYN', 0, 0)], ['syn']);
add(SHOP, ME, 'TCP', '80 → 51544 [SYN, ACK] Seq=0 Ack=1', [eth(RM, LM), ip(SHOP, ME, 52), tcp(80, 51544, 'SYN, ACK', 0, 1)], ['syn']);
add(ME, SHOP, 'TCP', '51544 → 80 [ACK] Seq=1 Ack=1', [eth(LM, RM), ip(ME, SHOP), tcp(51544, 80, 'ACK', 1, 1)]);
add(ME, SHOP, 'HTTP', 'POST /login HTTP/1.1 (application/x-www-form-urlencoded)', [eth(LM, RM), ip(ME, SHOP), tcp(51544, 80, 'PSH, ACK', 1, 1), { name: 'Hypertext Transfer Protocol', f: [['Request', 'POST /login HTTP/1.1'], ['Host', 'shop.local'], ['Content-Type', 'application/x-www-form-urlencoded'], ['Body', 'username=rahim&password=hunter2  ⚠ plaintext!']] }], ['tcp', 'post', 'secret']);
add(SHOP, ME, 'HTTP', 'HTTP/1.1 302 Found (Set-Cookie: sid=9f2a…)', [eth(RM, LM), ip(SHOP, ME, 52), tcp(80, 51544, 'PSH, ACK', 1, 120), { name: 'Hypertext Transfer Protocol', f: [['Status', '302 Found'], ['Set-Cookie', 'sid=9f2a71c0 (HTTP-তে চুরি করা সহজ!)']] }], ['tcp']);
add(ME, DNS, 'DNS', 'Standard query 0x7c11 A api.bank.local', [eth(LM, RM), ip(ME, DNS), udp(50311, 53), { name: 'Domain Name System (query)', f: [['Question', 'api.bank.local: type A']] }], ['udp']);
add(DNS, ME, 'DNS', 'Standard query response 0x7c11 A 198.51.100.7', [eth(RM, LM), ip(DNS, ME, 57), udp(53, 50311), { name: 'Domain Name System (response)', f: [['Answer', 'api.bank.local A 198.51.100.7']] }], ['udp']);
add(ME, BANK, 'TCP', '51600 → 443 [SYN] Seq=0', [eth(LM, RM), ip(ME, BANK), tcp(51600, 443, 'SYN', 0, 0)], ['syn']);
add(BANK, ME, 'TCP', '443 → 51600 [SYN, ACK] Seq=0 Ack=1', [eth(RM, LM), ip(BANK, ME, 49), tcp(443, 51600, 'SYN, ACK', 0, 1)], ['syn']);
add(ME, BANK, 'TCP', '51600 → 443 [ACK] Seq=1 Ack=1', [eth(LM, RM), ip(ME, BANK), tcp(51600, 443, 'ACK', 1, 1)]);
add(ME, BANK, 'TLS', 'Client Hello (SNI=api.bank.local)', [eth(LM, RM), ip(ME, BANK), tcp(51600, 443, 'PSH, ACK', 1, 1), { name: 'Transport Layer Security', f: [['Handshake', 'Client Hello'], ['Version', 'TLS 1.3'], ['SNI (server name)', 'api.bank.local  ← এটা এখনো plaintext'], ['Cipher suites', 'TLS_AES_128_GCM_SHA256, …'], ['Key share', 'x25519']] }], ['tcp', 'hello']);
add(BANK, ME, 'TLS', 'Server Hello, Change Cipher Spec, Application Data', [eth(RM, LM), ip(BANK, ME, 49), tcp(443, 51600, 'PSH, ACK', 1, 518), { name: 'Transport Layer Security', f: [['Handshake', 'Server Hello'], ['Cipher', 'TLS_AES_128_GCM_SHA256'], ['Certificate', '🔒 encrypted (TLS 1.3)']] }], ['tcp']);
add(ME, BANK, 'TLS', 'Application Data', [eth(LM, RM), ip(ME, BANK), tcp(51600, 443, 'PSH, ACK', 518, 1300), { name: 'Transport Layer Security', f: [['Content', 'Application Data'], ['Encrypted payload', '17 03 03 00 4a 8f 2c e1 9b … (পড়া যায় না 🔒)']] }], ['tcp', 'secure']);
add(ME, '8.8.8.8', 'ICMP', 'Echo (ping) request id=0x0001, seq=1', [eth(LM, RM), ip(ME, '8.8.8.8'), { name: 'Internet Control Message Protocol', f: [['Type', '8 (Echo request)'], ['Seq', 1]] }]);
add('8.8.8.8', ME, 'ICMP', 'Echo (ping) reply id=0x0001, seq=1, ttl=117', [eth(RM, LM), ip('8.8.8.8', ME, 117), { name: 'Internet Control Message Protocol', f: [['Type', '0 (Echo reply)'], ['Seq', 1]] }]);
P.forEach((p) => p.layers.forEach((l) => l.f.forEach((f) => { if (f[0] === 'Protocol') f[1] = p.tags.includes('udp') ? 'UDP (17)' : p.proto === 'ICMP' ? 'ICMP (1)' : 'TCP (6)'; })));

function match(p, expr) {
  const e = expr.trim().toLowerCase();
  if (!e) return true;
  return e.split('&&').every((part) => {
    const x = part.trim();
    let m;
    if ((m = x.match(/^ip\.(src|dst|addr)\s*==\s*([\d.]+)$/))) return m[1] === 'src' ? p.src === m[2] : m[1] === 'dst' ? p.dst === m[2] : p.src === m[2] || p.dst === m[2];
    if ((m = x.match(/^(tcp|udp)\.port\s*==\s*(\d+)$/))) return p.layers.some((l) => l.name.toLowerCase().includes(m[1] === 'tcp' ? 'transmission' : 'datagram') && l.f.some(([k, v]) => k.includes('Port') && String(v) === m[2]));
    if (/^tcp\.flags\.syn\s*==\s*1$/.test(x)) return p.tags.includes('syn');
    if (/^http\.request\.method\s*==\s*"?post"?$/.test(x)) return p.tags.includes('post');
    if ((m = x.match(/^frame\s+contains\s+"(.+)"$/))) return JSON.stringify(p).toLowerCase().includes(m[1]);
    if (/^[a-z]+$/.test(x)) return p.tags.includes(x);
    return false;
  });
}
const ROW = { arp: '#3f3a12', dns: '#0f2e4a', tcp: '#2a1f45', http: '#123a24', tls: '#30203d', icmp: '#3d1a2f' };
const FILTERS = ['dns', 'tcp.flags.syn==1', 'http', 'tls', 'ip.addr==198.51.100.7', 'frame contains "password"', 'arp', 'icmp'];

export default function PacketLab({ onComplete }) {
  const [f, setF] = useState('');
  const [applied, setApplied] = useState('');
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState({});
  const [done, setDone] = useState([]);
  const tasks = [
    { id: 'dns', text: '"dns" filter দিয়ে শুধু DNS packet দেখো — shop.local-এর IP কী?' },
    { id: 'syn', text: 'TCP three-way handshake-এর প্রথম SYN packet খুলে দেখো' },
    { id: 'pw', text: 'HTTP (port 80)-এ plaintext password খুঁজে বের করো 😱' },
    { id: 'sni', text: 'TLS Client Hello-তে SNI (কোন site-এ যাচ্ছে) দেখো' },
    { id: 'enc', text: 'HTTPS Application Data খুলে দেখো — password পড়া যায় কি?' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const list = useMemo(() => P.filter((p) => match(p, applied)), [applied]);
  const apply = (v) => { setApplied(v); setF(v); if (v.trim().toLowerCase() === 'dns') mark('dns'); };
  const pick = (p) => {
    setSel(p.no);
    setOpen({ [p.layers.length - 1]: true });
    if (p.info.includes('[SYN] Seq=0')) mark('syn');
    if (p.tags.includes('secret')) mark('pw');
    if (p.tags.includes('hello')) mark('sni');
    if (p.tags.includes('secure')) mark('enc');
  };
  const S = P.find((p) => p.no === sel);
  const valid = !f.trim() || P.some((p) => match(p, f)) || /^[a-z]+$/.test(f.trim());

  return (
    <div className="stack">
      <div className="ws-bar">
        <span className="ws-logo">🦈</span>
        <input className="input mono ws-filter" style={{ borderColor: valid ? '#4ade80' : '#f87171' }} placeholder="Apply a display filter … (যেমন: dns, tcp.flags.syn==1)" value={f} onChange={(e) => setF(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply(f)} spellCheck={false} />
        <button className="btn sm primary" onClick={() => apply(f)}>Apply</button>
        <button className="btn sm" onClick={() => apply('')}>Clear</button>
      </div>
      <div className="row" style={{ gap: 4 }}>{FILTERS.map((x) => <button key={x} className="cmd-chip mono" onClick={() => apply(x)}>{x}</button>)}</div>
      <div className="ws-list">
        <div className="ws-row ws-head"><span>No.</span><span>Time</span><span>Source</span><span>Destination</span><span>Proto</span><span>Len</span><span>Info</span></div>
        {list.map((p) => (
          <div key={p.no} className={'ws-row' + (sel === p.no ? ' sel' : '')} style={{ background: sel === p.no ? '#1d4ed8' : ROW[p.proto.toLowerCase()] }} onClick={() => pick(p)}>
            <span>{p.no}</span><span>{p.time}</span><span>{p.src}</span><span>{p.dst}</span><span>{p.proto}</span><span>{p.len}</span><span className="ws-info">{p.info}</span>
          </div>
        ))}
        {!list.length && <div className="muted" style={{ padding: 12 }}>এই filter-এ কোনো packet নেই।</div>}
      </div>
      <div className="grid2">
        <div className="ws-detail">
          {S ? S.layers.map((l, i) => (
            <div key={i}>
              <div className="ws-layer" onClick={() => setOpen({ ...open, [i]: !open[i] })}>{open[i] ? '▾' : '▸'} {l.name}</div>
              <AnimatePresence>
                {open[i] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    {l.f.map(([k, v]) => <div key={k} className={'ws-field' + (String(v).includes('⚠') || String(v).includes('←') ? ' hot' : '')}>{k}: {String(v)}</div>)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )) : <div className="muted">উপরের কোনো packet-এ ক্লিক করো — নিচে layer অনুযায়ী (Ethernet → IP → TCP/UDP → App) খুলে দেখাবে। ঠিক যেন OSI model!</div>}
        </div>
        <div className="card"><div className="section-h">🎯 Missions</div><TaskList tasks={tasks} done={done} />
          {done.includes('pw') && <div className="note bad" style={{ marginTop: 10 }}>💥 এজন্যই login সবসময় HTTPS-এ। একই Wi-Fi-তে থাকা যে কেউ HTTP traffic এভাবে পড়তে পারে।</div>}
        </div>
      </div>
    </div>
  );
}
