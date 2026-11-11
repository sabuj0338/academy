import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

const ALGOS = [
  { id: 'rr', name: 'Round Robin', d: 'পালাক্রমে: ১, ২, ৩, ৪, ১, ২… সবচেয়ে সহজ।' },
  { id: 'wrr', name: 'Weighted RR', d: 'শক্তিশালী server (weight 3) বেশি request পায়।' },
  { id: 'lc', name: 'Least Connections', d: 'যার হাতে এখন সবচেয়ে কম কাজ, সে পায়। লম্বা request থাকলে সেরা।' },
  { id: 'hash', name: 'IP Hash (sticky)', d: 'একই user সবসময় একই server-এ — session/cache-এর জন্য।' },
];
const USERS = [['🧑', '#22d3ee'], ['👩', '#f472b6'], ['🧔', '#fbbf24'], ['👧', '#4ade80'], ['👴', '#a78bfa'], ['🧕', '#fb923c']];
const SERVERS = [{ n: 'web-1', w: 1, cap: 4 }, { n: 'web-2', w: 1, cap: 4 }, { n: 'web-3 (বড়)', w: 3, cap: 10 }, { n: 'web-4', w: 1, cap: 4 }];

export default function LBLab({ onComplete }) {
  const [algo, setAlgo] = useState('rr');
  const [dead, setDead] = useState([false, false, false, false]);
  const [hc, setHc] = useState(false);
  const [conns, setConns] = useState([[], [], [], []]); // active {id, u, left}
  const [flying, setFlying] = useState([]);
  const [stats, setStats] = useState({ ok: [0, 0, 0, 0], err: 0, byUser: {} });
  const [unhealthy, setUnhealthy] = useState([false, false, false, false]);
  const [used, setUsed] = useState([]);
  const [done, setDone] = useState([]);
  const st = useRef({});
  const rr = useRef(0);
  const id = useRef(0);
  st.current = { algo, dead, hc, conns, unhealthy };
  const tasks = [
    { id: 'algos', text: '৩টি ভিন্ন algorithm চালিয়ে দেখো' },
    { id: 'err', text: 'Health check বন্ধ রেখে একটি server "মেরে" ফেলো — error আসবে' },
    { id: 'hc', text: 'Health check চালু করো — মৃত server বাদ পড়বে, error বন্ধ' },
    { id: 'sticky', text: 'IP Hash-এ দেখো একই user সবসময় একই server-এ যায়' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));

  useEffect(() => {
    const iv = setInterval(() => {
      const { algo, dead, hc, conns, unhealthy } = st.current;
      // connection শেষ হওয়া
      const nc = conns.map((list) => list.map((c) => ({ ...c, left: c.left - 1 })).filter((c) => c.left > 0));
      // health check: ২ tick পরে unhealthy
      const nu = dead.map((d) => (hc ? d : false));
      const pool = SERVERS.map((_, i) => i).filter((i) => !nu[i]);
      const u = Math.floor(Math.random() * USERS.length);
      let s = 0;
      if (pool.length) {
        if (algo === 'rr') { s = pool[rr.current % pool.length]; rr.current++; }
        else if (algo === 'wrr') { const seq = pool.flatMap((i) => Array(SERVERS[i].w).fill(i)); s = seq[rr.current % seq.length]; rr.current++; }
        else if (algo === 'lc') s = pool.reduce((a, b) => (nc[b].length / SERVERS[b].w < nc[a].length / SERVERS[a].w ? b : a));
        else s = pool[(u * 7 + 3) % pool.length];
      }
      const fail = !pool.length || dead[s];
      const myId = ++id.current;
      setFlying((f) => [...f.slice(-10), { id: myId, u, s, fail }]);
      if (!fail) nc[s] = [...nc[s], { id: myId, u, left: 3 + Math.floor(Math.random() * (algo === 'lc' ? 8 : 6)) }];
      setConns(nc);
      setUnhealthy(nu);
      setStats((x) => {
        const ok = [...x.ok];
        if (!fail) ok[s]++;
        const byUser = { ...x.byUser, [u]: [...new Set([...(x.byUser[u] || []), s])] };
        if (fail) mark('err');
        if (hc && dead.some(Boolean) && !fail) mark('hc');
        return { ok, err: x.err + (fail ? 1 : 0), byUser };
      });
    }, 600);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setUsed((u) => { const n = [...new Set([...u, algo])]; if (n.length >= 3) mark('algos'); return n; });
    setStats({ ok: [0, 0, 0, 0], err: 0, byUser: {} });
  }, [algo]);
  useEffect(() => {
    if (algo === 'hash' && Object.keys(stats.byUser).length >= 4 && Object.values(stats.byUser).every((v) => v.length === 1)) mark('sticky');
  }, [stats, algo]);

  return (
    <div className="stack">
      <div className="row" style={{ gap: 6 }}>
        {ALGOS.map((a) => <button key={a.id} className={'btn sm ' + (algo === a.id ? 'primary' : '')} onClick={() => setAlgo(a.id)}>{a.name} {used.includes(a.id) && '✓'}</button>)}
        <Toggle on={hc} onChange={setHc} label="🩺 Health check" />
      </div>
      <div className="muted" style={{ fontSize: 14 }}>📝 {ALGOS.find((a) => a.id === algo).d}</div>
      <div className="lb-stage">
        <div className="lb-users">{USERS.map(([e, c], i) => <span key={i} style={{ borderColor: c }}>{e}</span>)}</div>
        <div className="lb-box">⚖️<b>Load Balancer</b><small>{ALGOS.find((a) => a.id === algo).name}</small></div>
        <div className="lb-servers">
          {SERVERS.map((s, i) => (
            <motion.div key={i} className={'lb-srv' + (dead[i] ? ' dead' : '')} animate={{ borderColor: dead[i] ? '#f87171' : unhealthy[i] ? '#fbbf24' : '#2b3d63' }}>
              <div className="row" style={{ justifyContent: 'space-between', gap: 4 }}>
                <b style={{ fontSize: 13 }}>{dead[i] ? '💀' : '🖥️'} {s.n}</b>
                <button className={'btn sm ' + (dead[i] ? 'success' : 'danger')} style={{ padding: '1px 7px', fontSize: 11.5 }} onClick={() => setDead((d) => d.map((x, j) => (j === i ? !x : x)))}>{dead[i] ? 'চালু' : 'মারো'}</button>
              </div>
              <div className="lb-conns">
                {conns[i].map((c) => <motion.span key={c.id} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: USERS[c.u][1] }} />)}
              </div>
              <div className="muted" style={{ fontSize: 11.5 }}>w={s.w} · মোট {stats.ok[i]} {hc && dead[i] && '· ⛔ বাদ'}</div>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {flying.map((f) => (
            <motion.div key={f.id} className="lb-ball" style={{ background: USERS[f.u][1] }}
              initial={{ left: '8%', top: '50%', opacity: 1 }}
              animate={{ left: ['8%', '40%', '74%'], top: ['50%', '50%', 12 + f.s * 25 + '%'], opacity: [1, 1, f.fail ? 0 : 0.2] }}
              transition={{ duration: 0.9 }} onAnimationComplete={() => setFlying((x) => x.filter((y) => y.id !== f.id))}>
              {f.fail ? '✖' : ''}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="sc-metrics">
        <div className="sc-m"><small>সফল</small><b style={{ color: '#4ade80' }}>{stats.ok.reduce((a, b) => a + b, 0)}</b></div>
        <div className="sc-m" style={{ borderColor: stats.err ? '#f87171' : undefined }}><small>Error (মৃত server-এ গেছে)</small><b style={{ color: stats.err ? '#f87171' : undefined }}>{stats.err}</b></div>
        <div className="sc-m"><small>বণ্টন</small><b style={{ fontSize: 14 }}>{stats.ok.join(' / ')}</b></div>
      </div>
      {algo === 'hash' && <div className="note">🔗 User → server: {Object.entries(stats.byUser).map(([u, s]) => `${USERS[u][0]}→web-${s.map((x) => x + 1).join(',')}`).join('  ')}</div>}
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
