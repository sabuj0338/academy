import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

const toInt = (ip) => {
  const p = ip.trim().split('.');
  if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || +x > 255)) return null;
  return p.reduce((a, x) => ((a << 8) >>> 0) + +x, 0) >>> 0;
};
const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
const maskOf = (c) => (c === 0 ? 0 : (0xffffffff << (32 - c)) >>> 0);

export function classify(n) {
  const inR = (base, c) => ((n & maskOf(c)) >>> 0) === toInt(base);
  if (inR('10.0.0.0', 8)) return { t: 'Private (10/8)', c: '#4ade80', priv: true };
  if (inR('172.16.0.0', 12)) return { t: 'Private (172.16/12)', c: '#4ade80', priv: true };
  if (inR('192.168.0.0', 16)) return { t: 'Private (192.168/16)', c: '#4ade80', priv: true };
  if (inR('127.0.0.0', 8)) return { t: 'Loopback (নিজের computer)', c: '#fbbf24' };
  if (inR('169.254.0.0', 16)) return { t: 'Link-local (DHCP পায়নি!)', c: '#fb923c' };
  if (inR('100.64.0.0', 10)) return { t: 'CGNAT (ISP-এর shared)', c: '#a78bfa' };
  if (inR('224.0.0.0', 4)) return { t: 'Multicast', c: '#f472b6' };
  return { t: 'Public (internet-এ routable)', c: '#22d3ee' };
}

const CHALLENGES = [
  { id: 'priv', text: 'যেকোনো একটি Private IP লেখো', check: (n) => classify(n).priv },
  { id: 'c25', text: '১০০টি device ধরবে এমন সবচেয়ে ছোট subnet বেছে নাও (slider)', check: (n, c) => c === 25 },
  { id: 'net20', text: 'IP 172.16.40.9 আর /20 দাও — network address কী হয় দেখো', check: (n, c) => n === toInt('172.16.40.9') && c === 20 },
  { id: 'split', text: '192.168.1.20 ও 192.168.1.200 যেন আলাদা subnet-এ পড়ে — এমন CIDR দাও', check: (n, c, other) => other !== null && ((n & maskOf(c)) >>> 0) !== ((other & maskOf(c)) >>> 0) && n === toInt('192.168.1.20') && other === toInt('192.168.1.200') },
];

export default function SubnetLab({ onComplete }) {
  const [ip, setIp] = useState('192.168.1.10');
  const [cidr, setCidr] = useState(24);
  const [other, setOther] = useState('192.168.1.200');
  const [done, setDone] = useState([]);
  useCompletion(CHALLENGES.length, done.length, onComplete);
  const n = toInt(ip);
  const o = toInt(other);
  const r = useMemo(() => {
    if (n === null) return null;
    const m = maskOf(cidr);
    const net = (n & m) >>> 0;
    const bc = (net | (~m >>> 0)) >>> 0;
    const total = 2 ** (32 - cidr);
    const hosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : total - 2;
    return { m, net, bc, total, hosts, first: cidr >= 31 ? net : net + 1, last: cidr >= 31 ? bc : bc - 1 };
  }, [n, cidr]);

  React.useEffect(() => {
    if (n === null) return;
    const nd = CHALLENGES.filter((c) => c.check(n, cidr, o)).map((c) => c.id);
    if (nd.some((id) => !done.includes(id))) setDone((d) => [...new Set([...d, ...nd])]);
  }, [n, cidr, o]); // eslint-disable-line

  const bits = n === null ? [] : Array.from({ length: 32 }, (_, i) => (n >>> (31 - i)) & 1);
  const same = r && o !== null ? ((o & r.m) >>> 0) === r.net : null;
  const cls = n !== null ? classify(n) : null;
  // ছোট /24 ম্যাপ: 256 ঘর, subnet ব্লক রঙিন
  const blk = cidr >= 24 ? 2 ** (32 - cidr) : 256;

  return (
    <div className="stack">
      <div className="grid2">
        <div className="card">
          <label className="lbl">IPv4 Address</label>
          <input className="input mono" value={ip} onChange={(e) => setIp(e.target.value)} spellCheck={false} />
          <label className="lbl">CIDR prefix: /{cidr} — প্রথম {cidr} bit = network, বাকি {32 - cidr} bit = host</label>
          <input type="range" min={8} max={32} value={cidr} onChange={(e) => setCidr(+e.target.value)} style={{ width: '100%', accentColor: '#22d3ee' }} />
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            {[8, 16, 20, 24, 25, 26, 28, 30, 32].map((c) => <button key={c} className={'btn sm ' + (c === cidr ? 'primary' : '')} onClick={() => setCidr(c)}>/{c}</button>)}
          </div>
          {cls && <div className="badge" style={{ marginTop: 10, color: cls.c, borderColor: cls.c }}>🏷 {cls.t}</div>}
          {n === null && <div className="note bad">IP ঠিক format-এ নেই (যেমন 192.168.1.10)</div>}
        </div>
        <div className="card">
          {r && (
            <div className="stack" style={{ gap: 0 }}>
              <div className="metric"><span>Subnet mask</span><b className="mono">{toIp(r.m)}</b></div>
              <div className="metric"><span>Network address</span><b className="mono" style={{ color: '#22d3ee' }}>{toIp(r.net)}/{cidr}</b></div>
              <div className="metric"><span>Broadcast</span><b className="mono">{toIp(r.bc)}</b></div>
              <div className="metric"><span>ব্যবহারযোগ্য host range</span><b className="mono" style={{ fontSize: 13 }}>{toIp(r.first)} – {toIp(r.last)}</b></div>
              <div className="metric"><span>মোট address / ব্যবহারযোগ্য host</span><b>{r.total.toLocaleString()} / <span style={{ color: '#4ade80' }}>{r.hosts.toLocaleString()}</span></b></div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-h">🔢 ৩২টি bit — <span style={{ color: '#22d3ee' }}>network অংশ</span> / <span style={{ color: '#fbbf24' }}>host অংশ</span></div>
        <div className="bitrow">
          {bits.map((b, i) => (
            <React.Fragment key={i}>
              <motion.span className="bit" animate={{ backgroundColor: i < cidr ? 'rgba(34,211,238,.22)' : 'rgba(251,191,36,.16)', borderColor: i < cidr ? '#22d3ee' : '#fbbf24', y: i === cidr - 1 || i === cidr ? [0, -4, 0] : 0 }} transition={{ duration: 0.3 }}>{b}</motion.span>
              {i % 8 === 7 && i < 31 && <span className="bitdot">.</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="row mono" style={{ justifyContent: 'space-around', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{n !== null && toIp(n).split('.').map((x, i) => <span key={i}>{x}</span>)}</div>
        {cidr >= 24 && r && (
          <>
            <div className="section-h" style={{ marginTop: 12 }}>🗺 শেষ octet-এর ২৫৬টি address — প্রতিটি রঙ একটি আলাদা subnet ({toBn(256 / blk)}টি subnet, প্রতিটিতে {blk}টি address)</div>
            <div className="addr-map">
              {Array.from({ length: 256 }, (_, i) => {
                const g = Math.floor(i / blk);
                const mine = Math.floor((n & 255) / blk) === g;
                const edge = i % blk === 0 || i % blk === blk - 1;
                return <span key={i} title={i} style={{ background: `hsl(${(g * 47) % 360} 70% ${mine ? 55 : 28}%)`, opacity: edge && blk > 2 ? 0.45 : 1, outline: i === (n & 255) ? '2px solid white' : 'none' }} />;
              })}
            </div>
            <div className="muted" style={{ fontSize: 12.5 }}>সাদা বর্ডার = তোমার IP · ঝাপসা ঘর = network ও broadcast address (device-কে দেওয়া যায় না)</div>
          </>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="section-h">🤝 একই subnet-এ? (একই subnet হলে router ছাড়াই সরাসরি কথা বলে)</div>
          <input className="input mono" value={other} onChange={(e) => setOther(e.target.value)} spellCheck={false} />
          {same !== null && <div className={'note ' + (same ? 'good' : 'warn')}>{same ? `✅ ${other} একই network (${toIp(r.net)}/${cidr})-এ — switch দিয়ে সরাসরি যাবে।` : `↪ ${other} অন্য network-এ — packet default gateway (router)-এ যাবে।`}</div>}
        </div>
        <div className="card"><div className="section-h">🎯 Challenges</div><TaskList tasks={CHALLENGES} done={done} /></div>
      </div>
    </div>
  );
}
const toBn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
