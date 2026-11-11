import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { handlers } from '../handlers.js';
import { TaskList, Toggle, useCompletion, statusColor } from '../../components/ui.jsx';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function RequestLab({ server, presets, handler, tasks, secureLabel, onComplete }) {
  const [req, setReq] = useState(presets[0].req);
  const [secure, setSecure] = useState(false);
  const [res, setRes] = useState(null);
  const [flying, setFlying] = useState(false);
  const [done, setDone] = useState([]);
  const [history, setHistory] = useState([]);
  const state = useRef({});
  useCompletion(tasks.length, done.length, onComplete);

  const send = () => {
    setFlying(true);
    setRes(null);
    setTimeout(() => {
      const out = handlers[handler](req, secure, state.current);
      setRes(out);
      setFlying(false);
      if (out.done?.length) setDone((d) => [...new Set([...d, ...out.done.filter((id) => tasks.some((t) => t.id === id))])]);
      setHistory((h) => [{ m: req.method, p: req.path, s: out.status, secure }, ...h].slice(0, 8));
    }, 750);
  };

  const body = res && (typeof res.body === 'string' ? res.body : JSON.stringify(res.body, null, 2));

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Toggle on={secure} onChange={(v) => { setSecure(v); setRes(null); }} label={secure ? `🛡 Secure mode: ${secureLabel}` : '⚠ Vulnerable mode'} />
        <div className="row" style={{ gap: 6 }}>
          {presets.map((p) => (
            <button key={p.name} className="btn sm" onClick={() => { setReq(p.req); setRes(null); }}>{p.name}</button>
          ))}
        </div>
      </div>

      <div className="req-grid">
        <div className="card req-card">
          <div className="req-title"><span className="dot" style={{ background: 'var(--cyan)' }} /> Request <span className="muted">→ {server}</span></div>
          <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
            <select className="input mono" style={{ width: 110 }} value={req.method} onChange={(e) => setReq({ ...req, method: e.target.value })}>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <input className="input mono" value={req.path} onChange={(e) => setReq({ ...req, path: e.target.value })} spellCheck={false} />
          </div>
          <label className="lbl">Headers</label>
          <textarea className="input mono" rows={3} value={req.headers} onChange={(e) => setReq({ ...req, headers: e.target.value })} spellCheck={false} placeholder="Authorization: Bearer …" />
          <label className="lbl">Body</label>
          <textarea className="input mono" rows={4} value={req.body} onChange={(e) => setReq({ ...req, body: e.target.value })} spellCheck={false} placeholder="(খালি)" />
          <button className="btn primary" onClick={send} disabled={flying} style={{ marginTop: 10, width: '100%' }}>{flying ? 'পাঠানো হচ্ছে…' : '🚀 Send Request'}</button>
        </div>

        <div className="req-wire">
          <AnimatePresence>
            {flying && (
              <motion.div className="wire-packet" initial={{ y: -10, opacity: 0 }} animate={{ y: [0, 60, 120], opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.75 }}>📦</motion.div>
            )}
          </AnimatePresence>
          <div className="wire-line" />
        </div>

        <div className="card req-card">
          <div className="req-title"><span className="dot" style={{ background: res ? statusColor(res.status) : 'var(--dim)' }} /> Response</div>
          {res ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mono status-line" style={{ color: statusColor(res.status) }}>HTTP/1.1 {res.status}</div>
              {Object.entries(res.headers || {}).map(([k, v]) => <div key={k} className="mono muted" style={{ fontSize: 13 }}>{k}: {v}</div>)}
              <pre className="code" style={{ marginTop: 8, maxHeight: 220, overflow: 'auto' }}>{body || '(empty body)'}</pre>
              {res.note && <div className={'note ' + (res.note.startsWith('💥') || res.note.startsWith('⚠') ? 'bad' : res.note.startsWith('✅') ? 'good' : '')}>{res.note}</div>}
            </motion.div>
          ) : (
            <div className="muted" style={{ padding: '30px 0', textAlign: 'center' }}>{flying ? '⏳ Server process করছে…' : 'Request পাঠাও'}</div>
          )}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="section-h">🎯 Mission</div>
          <TaskList tasks={tasks} done={done} />
        </div>
        <div className="card">
          <div className="section-h">📜 History</div>
          {history.length === 0 && <div className="muted" style={{ fontSize: 14 }}>এখনো কিছু পাঠানো হয়নি</div>}
          {history.map((h, i) => (
            <div key={i} className="mono" style={{ fontSize: 12.5, display: 'flex', gap: 8 }}>
              <span style={{ color: statusColor(h.s), width: 32 }}>{h.s}</span>
              <span style={{ width: 54 }}>{h.m}</span>
              <span className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{h.p}</span>
              <span>{h.secure ? '🛡' : '⚠'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
