import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

const TASKS = [
  { id: 'intercept', text: 'Intercept চালু করে checkout request থামাও' },
  { id: 'price', text: 'price বদলে ৳১৫০০-এর headphone ৳১-এ কেনো' },
  { id: 'negative', text: 'quantity negative করে total negative বানাও (refund exploit)' },
  { id: 'fixed', text: 'Secure backend চালু করে একই কাজ ব্যর্থ হতে দেখো' },
];
const PRICE = 1500;

export default function InterceptLab({ onComplete }) {
  const [intercept, setIntercept] = useState(false);
  const [secure, setSecure] = useState(false);
  const [held, setHeld] = useState(null);
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [done, setDone] = useState([]);
  useCompletion(TASKS.length, done.length, onComplete);
  const mark = (...ids) => setDone((d) => [...new Set([...d, ...ids])]);

  const checkout = () => {
    const req = { product_id: 42, qty: 1, price: PRICE, coupon: '' };
    setResult(null);
    if (intercept) { setHeld(true); setBody(JSON.stringify(req, null, 2)); mark('intercept'); }
    else process(req);
  };
  const process = (req) => {
    let r;
    try { r = typeof req === 'string' ? JSON.parse(req) : req; } catch { setResult({ status: 400, msg: 'invalid JSON' }); return; }
    const tampered = r.price !== PRICE || r.qty < 1;
    if (secure) {
      if (!Number.isInteger(r.qty) || r.qty < 1 || r.qty > 10) { setResult({ status: 422, msg: 'qty must be 1–10', good: true }); if (tampered) mark('fixed'); return; }
      const total = PRICE * r.qty;
      setResult({ status: 201, msg: `Order created · দাম DB থেকে: ৳${PRICE} × ${r.qty} = ৳${total} (client-এর price উপেক্ষিত)`, good: tampered });
      if (tampered) mark('fixed');
      return;
    }
    const total = r.price * r.qty;
    setResult({ status: 201, msg: `Order created · total = ৳${total}`, bad: total < PRICE * Math.max(1, r.qty) || total < 0, total });
    if (r.price < PRICE && r.qty >= 1) mark('price');
    if (total < 0) mark('negative');
  };

  return (
    <div className="stack">
      <div className="row">
        <Toggle on={intercept} onChange={setIntercept} label="🛑 Proxy Intercept" color="var(--orange)" />
        <Toggle on={secure} onChange={(v) => { setSecure(v); setResult(null); }} label="Secure backend (দাম server-side)" />
      </div>
      <div className="intercept-grid">
        <div className="card">
          <div className="browser-mock">
            <div className="browser-bar"><span className="mono">https://shop.local/cart</span></div>
            <div className="browser-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44 }}>🎧</div>
              <b>Wireless Headphone</b>
              <div className="muted">৳{PRICE} × 1</div>
              <button className="btn primary" style={{ marginTop: 10 }} onClick={checkout}>Place order</button>
            </div>
          </div>
        </div>
        <div className="proxy-col">
          <motion.div className="proxy-badge" animate={{ scale: held ? [1, 1.1, 1] : 1 }} transition={{ repeat: held ? Infinity : 0, duration: 1.2 }}>{held ? '⏸' : intercept ? '🛑' : '→'}</motion.div>
          <div className="muted" style={{ fontSize: 12 }}>Burp Proxy<br />127.0.0.1:8080</div>
        </div>
        <div className="card">
          <div className="section-h">Proxy → Intercept</div>
          <AnimatePresence mode="wait">
            {held ? (
              <motion.div key="held" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <pre className="code" style={{ marginBottom: 6 }}>POST /api/checkout HTTP/1.1{'\n'}Host: shop.local{'\n'}Cookie: session=…{'\n'}Content-Type: application/json</pre>
                <textarea className="input mono" rows={6} value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} />
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn success sm" onClick={() => { setHeld(null); process(body); }}>▶ Forward</button>
                  <button className="btn danger sm" onClick={() => setHeld(null)}>✕ Drop</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px 0' }}>{intercept ? 'Request-এর অপেক্ষায়… browser-এ "Place order" চাপো।' : 'Intercept বন্ধ — request সরাসরি যাচ্ছে।'}</motion.div>
            )}
          </AnimatePresence>
          {result && <div className={'note ' + (result.bad ? 'bad' : result.good ? 'good' : '')}>HTTP {result.status} — {result.msg}{result.bad ? (result.total < 0 ? ' 💥 Negative total → দোকান তোমাকে টাকা ফেরত দেবে!' : ' 💥 Server client-এর পাঠানো দাম বিশ্বাস করেছে!') : ''}{result.good ? ' ✅' : ''}</div>}
        </div>
      </div>
      <div className="card"><TaskList tasks={TASKS} done={done} /></div>
    </div>
  );
}
