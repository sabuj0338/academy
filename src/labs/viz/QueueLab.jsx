import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

// Order → (sync বা queue) → worker: payment, email, invoice
export default function QueueLab({ onComplete }) {
  const [mode, setMode] = useState('sync');
  const [rate, setRate] = useState(3); // orders/sec
  const [workers, setWorkers] = useState(2);
  const [poison, setPoison] = useState(false);
  const [sale, setSale] = useState(0); // remaining ticks of flash sale
  const [queue, setQueue] = useState([]);
  const [busy, setBusy] = useState([]); // {id, left, w, tries, bad}
  const [dlq, setDlq] = useState([]);
  const [st, setSt] = useState({ accepted: 0, failed: 0, processed: 0, wait: [] });
  const [done, setDone] = useState([]);
  const S = useRef({});
  const nid = useRef(0);
  const acc = useRef(0);
  const armed = useRef(false);
  S.current = { mode, rate, workers, poison, sale, queue, busy };
  const tasks = [
    { id: 'syncfail', text: 'Sync mode-এ Flash Sale চালাও — অনেক order ব্যর্থ (timeout)' },
    { id: 'async', text: 'Queue mode-এ Flash Sale — কোনো order হারায় না, শুধু queue লম্বা হয়' },
    { id: 'drain', text: 'Worker বাড়িয়ে queue ০-তে নামাও' },
    { id: 'dlq', text: 'Poison message চালু করো — ৩ বার ব্যর্থ হয়ে DLQ-তে যাবে' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));
  const CAP = 2; // প্রতি worker প্রতি সেকেন্ডে ~২টি কাজ

  useEffect(() => {
    const iv = setInterval(() => {
      const { mode, rate, workers, poison, sale, queue, busy } = S.current;
      const r = sale > 0 ? 25 : rate;
      acc.current += r / 4;
      let incoming = Math.floor(acc.current);
      acc.current -= incoming;
      let q = [...queue];
      let b = busy.map((x) => ({ ...x, left: x.left - 1 }));
      let failed = 0, processed = 0;
      const newDlq = [];
      // শেষ হওয়া কাজ
      b = b.filter((x) => {
        if (x.left > 0) return true;
        if (x.bad) {
          if (x.tries >= 3) newDlq.push(x.id);
          else q.push({ ...x, tries: x.tries + 1 });
        } else processed++;
        return false;
      });
      const waits = [];
      for (let i = 0; i < incoming; i++) {
        const m = { id: ++nid.current, tries: 1, bad: poison && Math.random() < 0.15, t: Date.now() };
        if (mode === 'sync') {
          // sync: সরাসরি worker লাগবে, না পেলে user অপেক্ষা করতে করতে timeout
          if (b.length < workers) { b.push({ ...m, left: 4 / CAP }); waits.push(2.4); }
          else { failed++; waits.push(30); }
        } else { q.push(m); waits.push(0.05); }
      }
      while (b.length < workers && q.length) { const m = q.shift(); b.push({ ...m, left: Math.max(1, Math.round(4 / CAP)) }); }
      setQueue(q);
      setBusy(b);
      if (newDlq.length) { setDlq((d) => [...d, ...newDlq].slice(-12)); mark('dlq'); }
      setSale((s) => Math.max(0, s - 1));
      setSt((x) => ({ accepted: x.accepted + incoming - failed, failed: x.failed + failed, processed: x.processed + processed, wait: [...x.wait, ...waits].slice(-30) }));
      if (failed && sale > 0 && mode === 'sync') mark('syncfail');
      if (mode === 'async' && sale > 0 && q.length > 10) mark('async');
      if (mode === 'async' && sale === 0 && q.length === 0 && armed.current) { mark('drain'); }
      if (mode === 'async' && q.length > 15) armed.current = true;
    }, 250);
    return () => clearInterval(iv);
  }, []);

  const avgWait = st.wait.length ? st.wait.reduce((a, b) => a + b, 0) / st.wait.length : 0;
  const reset = () => { setQueue([]); setBusy([]); setDlq([]); setSt({ accepted: 0, failed: 0, processed: 0, wait: [] }); };

  return (
    <div className="stack">
      <div className="row">
        <button className={'btn sm ' + (mode === 'sync' ? 'danger' : '')} onClick={() => { setMode('sync'); reset(); }}>⏳ Synchronous (সব কাজ request-এর ভেতরে)</button>
        <button className={'btn sm ' + (mode === 'async' ? 'success' : '')} onClick={() => { setMode('async'); reset(); }}>📬 Asynchronous (queue)</button>
        <button className="btn sm primary" disabled={sale > 0} onClick={() => setSale(24)}>🔥 Flash Sale! (৬ সেকেন্ড ২৫ order/s)</button>
        <Toggle on={poison} onChange={setPoison} label="☠️ Poison message" />
      </div>
      <div className="q-stage">
        <div className="q-prod">
          <motion.div animate={{ scale: sale > 0 ? [1, 1.15, 1] : 1 }} transition={{ repeat: sale > 0 ? Infinity : 0, duration: 0.5 }} style={{ fontSize: 34 }}>🛒</motion.div>
          <b>Order API</b><small>{sale > 0 ? '🔥 25/s' : rate + '/s'}</small>
          <div className="badge" style={{ marginTop: 4 }}>{mode === 'sync' ? 'user অপেক্ষা করে' : '202 Accepted তখনই'}</div>
        </div>
        <div className="q-tube" style={{ opacity: mode === 'async' ? 1 : 0.25 }}>
          <div className="q-label">📬 Queue ({queue.length})</div>
          <div className="q-msgs">
            <AnimatePresence initial={false}>
              {queue.slice(0, 40).map((m) => (
                <motion.span key={m.id + '-' + m.tries} layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="q-msg" style={{ background: m.bad ? '#f87171' : m.tries > 1 ? '#fb923c' : '#22d3ee' }} />
              ))}
            </AnimatePresence>
            {queue.length > 40 && <span className="muted" style={{ fontSize: 12 }}>+{queue.length - 40}</span>}
          </div>
        </div>
        <div className="q-workers">
          {Array.from({ length: workers }, (_, i) => {
            const job = busy[i];
            return (
              <div key={i} className="q-worker" style={{ borderColor: job ? (job.bad ? '#f87171' : '#4ade80') : '#2b3d63' }}>
                <motion.span animate={{ rotate: job ? 360 : 0 }} transition={{ repeat: job ? Infinity : 0, duration: 1, ease: 'linear' }}>⚙️</motion.span>
                <small>worker {i + 1}</small>
              </div>
            );
          })}
        </div>
        <div className="q-dlq">
          <div className="q-label" style={{ color: '#f87171' }}>☠️ DLQ ({dlq.length})</div>
          <div className="row" style={{ gap: 3 }}>{dlq.map((d) => <span key={d} className="q-msg" style={{ background: '#7f1d1d' }} />)}</div>
        </div>
      </div>
      <div className="row">
        <span>Order rate: {rate}/s</span><input type="range" min={1} max={10} value={rate} onChange={(e) => setRate(+e.target.value)} style={{ accentColor: '#a78bfa' }} />
        <span>Workers: {workers}</span><input type="range" min={1} max={8} value={workers} onChange={(e) => setWorkers(+e.target.value)} style={{ accentColor: '#a78bfa' }} />
      </div>
      <div className="sc-metrics">
        <div className="sc-m"><small>গৃহীত order</small><b style={{ color: '#4ade80' }}>{st.accepted}</b></div>
        <div className="sc-m" style={{ borderColor: st.failed ? '#f87171' : undefined }}><small>ব্যর্থ (timeout)</small><b style={{ color: st.failed ? '#f87171' : undefined }}>{st.failed}</b></div>
        <div className="sc-m"><small>প্রসেস শেষ</small><b>{st.processed}</b></div>
        <div className="sc-m"><small>User-এর গড় অপেক্ষা</small><b>{avgWait.toFixed(1)}s</b></div>
      </div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
