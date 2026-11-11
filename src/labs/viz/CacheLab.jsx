import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

// Cache-aside simulation: কিছু product খুব জনপ্রিয় (Zipf) — cache কতটা DB বাঁচায়?
const KEYS = Array.from({ length: 16 }, (_, i) => 'p' + (i + 1));
const W = KEYS.map((_, i) => 1 / (i + 1) ** 1.1);
const WS = W.reduce((a, b) => a + b, 0);
const pick = () => { let r = Math.random() * WS; for (let i = 0; i < KEYS.length; i++) { r -= W[i]; if (r <= 0) return i; } return 0; };

export default function CacheLab({ onComplete }) {
  const [on, setOn] = useState(false);
  const [cap, setCap] = useState(4);
  const [ttl, setTtl] = useState(8);
  const [inval, setInval] = useState(false);
  const [running, setRunning] = useState(true);
  const [cache, setCache] = useState([]); // {k, exp, ver, used}
  const [feed, setFeed] = useState([]); // {id,k,hit}
  const [stats, setStats] = useState({ hit: 0, miss: 0, dbHits: [] });
  const [db, setDb] = useState(() => Object.fromEntries(KEYS.map((k) => [k, { price: 1000, ver: 1 }])));
  const [stale, setStale] = useState(false);
  const [done, setDone] = useState([]);
  const tick = useRef(0);
  const st = useRef({});
  st.current = { on, cap, ttl, cache, db };
  const tasks = [
    { id: 'nocache', text: 'Cache ছাড়া চালিয়ে DB load দেখো (প্রতিটি request DB-তে)' },
    { id: 'hit80', text: 'Cache চালু করে hit ratio ৭০%+ তোলো (capacity/TTL বদলাও)' },
    { id: 'stale', text: 'Product p1-এর দাম update করো — cache পুরনো দাম দেখাচ্ছে (stale!)' },
    { id: 'fix', text: 'Invalidation চালু করে আবার update — এবার সাথে সাথে নতুন দাম' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      tick.current += 1;
      const now = tick.current;
      const { on, cap, ttl, cache, db } = st.current;
      const k = KEYS[pick()];
      let c = cache.filter((e) => e.exp > now);
      let hit = false, val;
      if (on) {
        const e = c.find((x) => x.k === k);
        if (e) { hit = true; val = e; c = c.map((x) => (x.k === k ? { ...x, used: now } : x)); }
        else {
          val = { k, exp: now + ttl * 4, ver: db[k].ver, price: db[k].price, used: now };
          c = [...c, val];
          if (c.length > cap) { const lru = c.reduce((a, b) => (a.used < b.used ? a : b)); c = c.filter((x) => x !== lru); }
        }
      }
      setCache(c);
      const isStale = hit && val.ver !== db[k].ver;
      if (isStale) { setStale(true); mark('stale'); }
      setFeed((f) => [{ id: now, k, hit, stale: isStale }, ...f].slice(0, 14));
      setStats((s) => {
        const dbHits = [...s.dbHits, hit ? 0 : 1].slice(-40);
        const n = { hit: s.hit + (hit ? 1 : 0), miss: s.miss + (hit ? 0 : 1), dbHits };
        const tot = n.hit + n.miss;
        if (!on && tot > 15) mark('nocache');
        if (on && tot > 30 && n.hit / tot >= 0.7) mark('hit80');
        return n;
      });
    }, 250);
    return () => clearInterval(iv);
  }, [running]);

  const update = () => {
    setDb((d) => ({ ...d, p1: { price: d.p1.price + 250, ver: d.p1.ver + 1 } }));
    if (inval) {
      setCache((c) => c.filter((x) => x.k !== 'p1'));
      if (on) { mark('fix'); setStale(false); }
    }
  };
  const reset = () => { setStats({ hit: 0, miss: 0, dbHits: [] }); setFeed([]); setStale(false); };
  const tot = stats.hit + stats.miss;
  const ratio = tot ? stats.hit / tot : 0;
  const load = stats.dbHits.length ? stats.dbHits.reduce((a, b) => a + b, 0) / stats.dbHits.length : 0;
  const lat = tot ? Math.round((stats.hit * 2 + stats.miss * 45) / tot) : 0;

  return (
    <div className="stack">
      <div className="row">
        <Toggle on={on} onChange={(v) => { setOn(v); reset(); setCache([]); }} label={on ? '⚡ Cache-aside চালু' : '🐢 Cache নেই'} />
        <Toggle on={inval} onChange={setInval} label="🧹 Write হলে cache key delete (invalidation)" />
        <button className="btn sm" onClick={() => setRunning((r) => !r)}>{running ? '⏸ থামাও' : '▶ চালাও'}</button>
        <button className="btn sm danger" onClick={update}>✏️ p1-এর দাম +৳২৫০ update</button>
      </div>
      <div className="cache-stage">
        <div className="cache-col">
          <div className="encap-h">📥 আসা request</div>
          <div className="cache-feed">
            <AnimatePresence initial={false}>
              {feed.map((r) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="cache-req" style={{ borderColor: r.stale ? '#fb923c' : r.hit ? '#4ade80' : '#f87171' }}>
                  GET /product/{r.k} <b style={{ color: r.stale ? '#fb923c' : r.hit ? '#4ade80' : '#f87171' }}>{r.stale ? 'STALE' : r.hit ? 'HIT 2ms' : on ? 'MISS 45ms' : 'DB 45ms'}</b>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="cache-col">
          <div className="encap-h">⚡ Redis ({cache.length}/{cap})</div>
          <div className="cache-box" style={{ opacity: on ? 1 : 0.3 }}>
            <AnimatePresence>
              {cache.map((e) => (
                <motion.div key={e.k} layout className="cache-key" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} style={{ borderColor: e.ver !== db[e.k].ver ? '#fb923c' : '#22d3ee' }}>
                  <b>{e.k}</b><small>৳{e.price}{e.ver !== db[e.k].ver && ' ⚠'}</small>
                  <div className="ttl-bar"><div style={{ width: Math.max(0, ((e.exp - tick.current) / (ttl * 4)) * 100) + '%' }} /></div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!on && <div className="muted" style={{ padding: 20 }}>Cache বন্ধ</div>}
          </div>
        </div>
        <div className="cache-col">
          <div className="encap-h">🗄️ PostgreSQL</div>
          <div className="db-gauge">
            <motion.div className="db-fill" animate={{ height: load * 100 + '%', background: load > 0.7 ? '#f87171' : load > 0.4 ? '#fbbf24' : '#4ade80' }} />
            <span>{Math.round(load * 100)}%<br /><small>load</small></span>
          </div>
          <div className="muted mono" style={{ fontSize: 12.5, textAlign: 'center' }}>p1 = ৳{db.p1.price}</div>
        </div>
      </div>
      <div className="sc-metrics">
        <div className="sc-m"><small>Hit ratio</small><b style={{ color: ratio >= 0.7 ? '#4ade80' : '#fbbf24' }}>{Math.round(ratio * 100)}%</b></div>
        <div className="sc-m"><small>গড় latency</small><b>{lat} ms</b></div>
        <div className="sc-m"><small>DB-তে গেছে</small><b>{stats.miss}</b></div>
        <div className="sc-m"><small>Cache থেকে</small><b>{stats.hit}</b></div>
      </div>
      <div className="grid2">
        <div className="card">
          <label className="lbl">Cache capacity (কয়টি key রাখা যাবে — LRU পুরনোটা ফেলে দেয়): {cap}</label>
          <input type="range" min={1} max={12} value={cap} onChange={(e) => setCap(+e.target.value)} style={{ width: '100%', accentColor: '#22d3ee' }} />
          <label className="lbl">TTL (কতক্ষণ পরে নিজে থেকে মুছে যাবে): {ttl}s</label>
          <input type="range" min={1} max={30} value={ttl} onChange={(e) => setTtl(+e.target.value)} style={{ width: '100%', accentColor: '#22d3ee' }} />
          {stale && <div className="note warn">⚠ Stale data! DB-তে দাম বদলেছে, কিন্তু cache এখনো পুরনো দাম দেখাচ্ছে — TTL শেষ না হওয়া পর্যন্ত। সমাধান: write-এর পরে cache key delete করো।</div>}
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
