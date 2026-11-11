import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

// Order service → Payment service। Payment অসুস্থ হলে কী হয়? timeout, retry, circuit breaker।
const POOL = 10;
const HEALTH = { ok: { t: 1, fail: false, label: '✅ সুস্থ' }, slow: { t: 40, fail: false, label: '🐢 খুব ধীর' }, down: { t: 2, fail: true, label: '💀 ডাউন' } };

export default function BreakerLab({ onComplete }) {
  const [health, setHealth] = useState('ok');
  const [timeout, setTo] = useState(false);
  const [retry, setRetry] = useState(0);
  const [cb, setCb] = useState(false);
  const [inflight, setInflight] = useState([]);
  const [log, setLog] = useState([]); // outcome dots
  const [state, setState] = useState('CLOSED');
  const [load, setLoad] = useState(0);
  const [done, setDone] = useState([]);
  const S = useRef({});
  const br = useRef({ fails: 0, openUntil: 0, tick: 0, state: 'CLOSED', wasOpen: false });
  const nid = useRef(0);
  S.current = { health, timeout, retry, cb, inflight };
  const tasks = [
    { id: 'exhaust', text: 'Payment "খুব ধীর" + timeout বন্ধ → thread pool ভরে পুরো service বসে যাবে' },
    { id: 'to', text: 'Timeout চালু করে pool খালি রাখো' },
    { id: 'storm', text: 'Payment ডাউন + retry ৩ → payment-এ চাপ ৩ গুণ (retry storm) দেখো' },
    { id: 'open', text: 'Circuit breaker চালু করো — OPEN হয়ে দ্রুত fail করবে' },
    { id: 'heal', text: 'Payment আবার সুস্থ করো — HALF-OPEN হয়ে CLOSED-এ ফিরবে' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (x) => setDone((d) => (d.includes(x) ? d : [...d, x]));

  useEffect(() => {
    const iv = setInterval(() => {
      const { health, timeout, retry, cb, inflight } = S.current;
      const B = br.current;
      B.tick++;
      const H = HEALTH[health];
      const out = [];
      let calls = 0;
      // চলমান কল এগোয়
      let fl = [];
      inflight.forEach((c) => {
        const left = c.left - 1;
        const waited = c.waited + 1;
        if (timeout && waited >= 5 && left > 0) { out.push({ k: 'timeout', a: c.a }); onFail(c); return; }
        if (left > 0) { fl.push({ ...c, left, waited }); return; }
        if (c.fail) { out.push({ k: 'fail', a: c.a }); onFail(c); } else { out.push({ k: 'ok', a: c.a }); onOk(); }
      });
      function onFail(c) {
        B.fails++;
        if (c.a < retry + 1) fl.push(newCall(c.a + 1));
        if (cb && B.state !== 'OPEN' && B.fails >= 5) { B.state = 'OPEN'; B.openUntil = B.tick + 12; }
        if (B.state === 'HALF') { B.state = 'OPEN'; B.openUntil = B.tick + 12; }
      }
      function onOk() { B.fails = 0; if (B.state === 'HALF') B.state = 'CLOSED'; }
      function newCall(a) { calls++; return { id: ++nid.current, a, left: H.t, waited: 0, fail: H.fail }; }
      if (!cb) B.state = 'CLOSED';
      if (B.state === 'OPEN' && B.tick >= B.openUntil) B.state = 'HALF';
      // নতুন request
      if (B.state === 'OPEN') out.push({ k: 'fast' });
      else if (fl.length >= POOL) out.push({ k: 'pool' });
      else if (B.state === 'HALF' && fl.length > 0) out.push({ k: 'fast' });
      else fl.push(newCall(1));
      setInflight(fl);
      setState(B.state);
      setLoad((l) => l * 0.8 + calls * 0.2);
      setLog((g) => [...g, ...out].slice(-60));
      if (fl.length >= POOL && health === 'slow' && !timeout) mark('exhaust');
      if (health === 'slow' && timeout && fl.length < POOL && out.some((o) => o.k === 'timeout')) mark('to');
      if (health === 'down' && retry >= 3 && calls >= 2) mark('storm');
      if (B.state === 'OPEN' && cb) mark('open');
      if (B.wasOpen && B.state === 'CLOSED' && cb && health === 'ok') mark('heal');
      if (B.state === 'OPEN') br.current.wasOpen = true;

    }, 300);
    return () => clearInterval(iv);
  }, []);

  const C = { ok: '#4ade80', fail: '#f87171', timeout: '#fb923c', fast: '#64748b', pool: '#7f1d1d' };
  const L = { ok: 'সফল', fail: 'error', timeout: 'timeout', fast: 'fast-fail (breaker)', pool: 'pool full — service বসে গেছে' };
  return (
    <div className="stack">
      <div className="row">
        <span>💳 Payment service:</span>
        {Object.entries(HEALTH).map(([k, v]) => <button key={k} className={'btn sm ' + (health === k ? (k === 'ok' ? 'success' : 'danger') : '')} onClick={() => setHealth(k)}>{v.label}</button>)}
      </div>
      <div className="row">
        <Toggle on={timeout} onChange={setTo} label="⏱ Timeout (1.5s)" />
        <span className="muted">🔁 Retry: {retry}</span><input type="range" min={0} max={3} value={retry} onChange={(e) => setRetry(+e.target.value)} style={{ accentColor: '#a78bfa', width: 90 }} />
        <Toggle on={cb} onChange={setCb} label="🔌 Circuit breaker" />
      </div>
      <div className="br-stage">
        <div className="br-svc">
          <b>🛒 Order service</b>
          <div className="muted" style={{ fontSize: 12.5 }}>Thread pool ({inflight.length}/{POOL})</div>
          <div className="br-pool">{Array.from({ length: POOL }, (_, i) => <motion.span key={i} animate={{ background: i < inflight.length ? (inflight.length >= POOL ? '#f87171' : '#fbbf24') : 'rgba(255,255,255,.05)' }} />)}</div>
        </div>
        <div className="br-sm">
          {['CLOSED', 'OPEN', 'HALF'].map((s) => (
            <motion.div key={s} className="br-state" animate={{ scale: state === s && cb ? 1.12 : 1, borderColor: state === s && cb ? (s === 'CLOSED' ? '#4ade80' : s === 'OPEN' ? '#f87171' : '#fbbf24') : '#2b3d63', opacity: cb ? 1 : 0.35 }}>
              {s === 'CLOSED' ? '🟢 CLOSED' : s === 'OPEN' ? '🔴 OPEN' : '🟡 HALF-OPEN'}
              <small>{s === 'CLOSED' ? 'স্বাভাবিক, সব যায়' : s === 'OPEN' ? 'কিছুই পাঠায় না, সাথে সাথে fail' : 'একটা trial পাঠায়'}</small>
            </motion.div>
          ))}
        </div>
        <div className="br-svc">
          <b>💳 Payment service</b>
          <div style={{ fontSize: 26 }}>{health === 'ok' ? '😊' : health === 'slow' ? '🥵' : '💀'}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>চাপ: {load.toFixed(1)} call/tick</div>
          <div className="sc-bar"><motion.div animate={{ width: Math.min(load / 3, 1) * 100 + '%', background: load > 1.5 ? '#f87171' : '#4ade80' }} /></div>
        </div>
      </div>
      <div className="card">
        <div className="section-h">📈 শেষ ৬০টি ফলাফল</div>
        <div className="br-log">{log.map((o, i) => <span key={i} title={L[o.k]} style={{ background: C[o.k] }}>{o.a > 1 ? o.a : ''}</span>)}</div>
        <div className="row" style={{ gap: 10, marginTop: 6, fontSize: 12.5 }}>{Object.entries(L).map(([k, v]) => <span key={k}><i className="lg-dot" style={{ background: C[k] }} />{v}</span>)}<span className="muted">(সংখ্যা = কততম চেষ্টা)</span></div>
      </div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
