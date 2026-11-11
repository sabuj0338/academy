import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// Distributed tracing waterfall: GET /checkout কেন ২ সেকেন্ড লাগছে?
function build(fixed) {
  const s = [];
  const add = (name, svc, start, dur, depth, attrs = {}, tag) => s.push({ id: s.length, name, svc, start, dur, depth, attrs, tag });
  add('GET /checkout', 'gateway', 0, 0, 0, { 'http.status': 200, 'user.id': 7 });
  add('auth.verify_jwt', 'auth', 8, 22, 1, { cache: 'hit' });
  add('cart.get', 'cart-svc', 34, 40, 1, { items: 12 });
  if (!fixed) {
    add('product.get_details', 'product-svc', 78, 0, 1, { note: 'প্রতিটি item-এর জন্য আলাদা query!' }, 'slow');
    for (let i = 0; i < 12; i++) add(`SELECT * FROM products WHERE id=$1`, 'postgres', 82 + i * 98, 92, 2, { 'db.rows': 1, 'loop.i': i + 1 }, 'n1');
  } else {
    add('product.get_details', 'product-svc', 78, 0, 1, { note: 'batched' });
    add('SELECT * FROM products WHERE id = ANY($1)', 'postgres', 82, 38, 2, { 'db.rows': 12 });
  }
  const pEnd = fixed ? 124 : 82 + 12 * 98;
  s[3].dur = pEnd - 78;
  add('payment.authorize', 'payment-svc', pEnd + 6, 160, 1, { provider: 'bkash-sandbox' });
  add('redis.SET order:lock', 'redis', pEnd + 170, 3, 1);
  s[0].dur = pEnd + 190;
  return s;
}
const SVC = { gateway: '#22d3ee', auth: '#a78bfa', 'cart-svc': '#4ade80', 'product-svc': '#fb923c', postgres: '#fbbf24', 'payment-svc': '#f472b6', redis: '#f87171' };

export default function TraceLab({ onComplete }) {
  const [fixed, setFixed] = useState(false);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const spans = build(fixed);
  const total = spans[0].dur;
  const tasks = [
    { id: 'slow', text: 'Waterfall দেখে সবচেয়ে বেশি সময় নেওয়া service খুঁজে বের করো (ক্লিক)' },
    { id: 'n1', text: 'বারবার হওয়া একটি DB span-এ ক্লিক করো — এটাই N+1 query সমস্যা' },
    { id: 'fix', text: 'Fix apply করো (এক query-তে সব product) — total time দেখো' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));
  const click = (sp) => {
    setSel(sp.id);
    if (sp.tag === 'slow') mark('slow');
    if (sp.tag === 'n1') mark('n1');
  };
  const S = spans.find((x) => x.id === sel);
  const logs = S ? [`{"level":"info","trace_id":"4bf92f3577b34da6","span_id":"${(S.id * 7919).toString(16)}","service":"${S.svc}","msg":"${S.name}","duration_ms":${S.dur}}`] : [];

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <span className="badge">🔎 trace_id: 4bf92f3577b34da6</span>
          <span className="badge" style={{ color: total > 1000 ? '#f87171' : '#4ade80', borderColor: total > 1000 ? '#f87171' : '#4ade80' }}>⏱ মোট: {total} ms</span>
          <span className="badge">{spans.length} span</span>
        </div>
        <button className={'btn sm ' + (fixed ? 'success' : 'primary')} disabled={!done.includes('n1')} onClick={() => { setFixed(true); setSel(null); mark('fix'); }}>{fixed ? '✅ Batched query' : '🔧 Fix: WHERE id = ANY($1)'}</button>
      </div>
      <div className="trace">
        <div className="trace-axis">{[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f} style={{ left: f * 100 + '%' }}>{Math.round(total * f)}ms</span>)}</div>
        <AnimatePresence initial={false}>
          {spans.map((sp) => (
            <motion.div key={(fixed ? 'f' : 'o') + sp.id} layout className={'trace-row' + (sel === sp.id ? ' sel' : '')} onClick={() => click(sp)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="trace-name" style={{ paddingLeft: sp.depth * 14 }}><i style={{ background: SVC[sp.svc] }} />{sp.svc}: {sp.name}</span>
              <span className="trace-lane">
                <motion.span className="trace-bar" initial={{ width: 0 }} animate={{ width: Math.max((sp.dur / total) * 100, 0.6) + '%' }} style={{ left: (sp.start / total) * 100 + '%', background: SVC[sp.svc] }} transition={{ duration: 0.5, delay: sp.id * 0.02 }} />
                <span className="trace-ms" style={{ left: Math.min(((sp.start + sp.dur) / total) * 100, 88) + '%' }}>{sp.dur}ms</span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="grid2">
        <div className="card">
          {S ? (
            <>
              <div className="section-h" style={{ color: SVC[S.svc] }}>Span: {S.name}</div>
              <div className="metric"><span>Service</span><b>{S.svc}</b></div>
              <div className="metric"><span>শুরু / সময়</span><b>{S.start}ms / {S.dur}ms</b></div>
              {Object.entries(S.attrs).map(([k, v]) => <div key={k} className="metric"><span className="mono">{k}</span><b>{String(v)}</b></div>)}
              <div className="section-h" style={{ marginTop: 10 }}>📜 একই trace_id-এর log</div>
              <pre className="code" style={{ fontSize: 11.5 }}>{logs.join('\n')}</pre>
              {S.tag === 'n1' && <div className="note bad">🐞 N+1: ১২টি item → ১২টি আলাদা query, একটার পর একটা। প্রতিটি ~৯০ms → ১ সেকেন্ডের বেশি নষ্ট। সমাধান: একটি query-তে সব id (WHERE id = ANY($1)) বা JOIN।</div>}
            </>
          ) : <div className="muted">কোনো span (bar)-এ ক্লিক করো। Trace = একটি request-এর পুরো যাত্রার timeline; প্রতিটি bar = একটি কাজ (span)।</div>}
        </div>
        <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
      </div>
    </div>
  );
}
