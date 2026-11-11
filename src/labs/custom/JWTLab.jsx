import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

const enc = new TextEncoder();
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = (s) => b64u(enc.encode(s));
const unb64u = (s) => { try { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); return new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0))); } catch { return '(invalid base64)'; } };
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
const WEAK = 'secret123';
const STRONG = 'q7$Lm2!vR9#xT4@pZ8&kW1^nB6*cY3%e';
const WORDLIST = ['123456', 'password', 'admin', 'jwt', 'shopbd', 'changeme', 'qwerty', 'letmein', 'secret', 'supersecret', 'jwtsecret', 'dhaka2026', 'secret1', 'secret12', 'secret123', 'password1', 'iloveyou'];

const BASIC_TASKS = [
  { id: 'decode', text: 'Token-এর payload decode করে দেখো (কোনো key ছাড়াই পড়া যায়!)' },
  { id: 'tamper', text: 'Payload-এ role: "admin" করে পুরনো signature সহ পাঠাও → server reject করবে' },
  { id: 'valid', text: 'আসল token verify করে 200 পাও' },
];
const ATTACK_TASKS = [
  { id: 'none-ok', text: 'Algorithm pin বন্ধ রেখে alg:"none" token দিয়ে admin হও' },
  { id: 'none-block', text: 'Algorithm pin চালু করে alg:none ব্লক হতে দেখো' },
  { id: 'crack', text: 'Wordlist দিয়ে দুর্বল HMAC secret crack করো' },
  { id: 'forge', text: 'Crack করা secret দিয়ে admin token sign করে server-এ পাঠাও' },
  { id: 'strong', text: 'Strong secret চালু করে আবার crack চেষ্টা করো — ব্যর্থ হবে' },
];

export default function JWTLab({ mode = 'basic', onComplete }) {
  const attack = mode === 'attack';
  const TASKS = attack ? ATTACK_TASKS : BASIC_TASKS;
  const [pin, setPin] = useState(false);
  const [strong, setStrong] = useState(!attack);
  const serverSecret = strong ? STRONG : WEAK;
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"7","name":"Rahim","role":"user","exp":1794400000}');
  const [sigMode, setSigMode] = useState('keep');
  const [signSecret, setSignSecret] = useState('');
  const [origSig, setOrigSig] = useState('');
  const [token, setToken] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [crack, setCrack] = useState({ running: false, i: -1, found: null });
  const [done, setDone] = useState([]);
  const [showDecoded, setShowDecoded] = useState(!attack);
  useCompletion(TASKS.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) || !TASKS.some((t) => t.id === id) ? d : [...d, id]));

  // আসল token তৈরি (server secret দিয়ে)
  useEffect(() => {
    const h = b64uStr('{"alg":"HS256","typ":"JWT"}'), p = b64uStr('{"sub":"7","name":"Rahim","role":"user","exp":1794400000}');
    hmac(serverSecret, h + '.' + p).then((s) => { setOrigSig(s); setToken(`${h}.${p}.${s}`); });
    setCrack({ running: false, i: -1, found: null });
  }, [serverSecret]);

  const build = async () => {
    const h = b64uStr(header.trim()), p = b64uStr(payload.trim());
    let s = '';
    if (sigMode === 'keep') s = origSig;
    else if (sigMode === 'sign') s = await hmac(signSecret, h + '.' + p);
    setToken(`${h}.${p}.${s}`);
    setVerdict(null);
  };

  const verify = async () => {
    const [h, p, s = ''] = token.split('.');
    let hdr, pl;
    try { hdr = JSON.parse(unb64u(h)); pl = JSON.parse(unb64u(p)); } catch { setVerdict({ ok: false, msg: 'Malformed token' }); return; }
    const isAdmin = pl.role === 'admin';
    if (String(hdr.alg).toLowerCase() === 'none') {
      if (pin) { setVerdict({ ok: false, msg: '401 — alg "none" not in WithValidMethods(["HS256"]) ✓' }); mark('none-block'); return; }
      setVerdict({ ok: true, msg: `200 — Library header-এর alg বিশ্বাস করল, signature যাচাই-ই করেনি! Welcome ${pl.name} (role: ${pl.role})`, evil: isAdmin });
      if (isAdmin) mark('none-ok');
      return;
    }
    const expect = await hmac(serverSecret, h + '.' + p);
    if (expect !== s) {
      setVerdict({ ok: false, msg: '401 — signature mismatch। Payload বদলালে signature আর মেলে না।' });
      if (isAdmin) mark('tamper');
      return;
    }
    setVerdict({ ok: true, msg: `200 — valid token। Welcome ${pl.name} (role: ${pl.role})`, evil: isAdmin });
    if (!isAdmin) mark('valid');
    if (isAdmin && sigMode === 'sign') mark('forge');
  };

  const runCrack = async () => {
    setCrack({ running: true, i: 0, found: null });
    const parts = token.split('.');
    const target = origSig, data = parts[0] && b64uStr('{"alg":"HS256","typ":"JWT"}') + '.' + b64uStr('{"sub":"7","name":"Rahim","role":"user","exp":1794400000}');
    for (let i = 0; i < WORDLIST.length; i++) {
      setCrack({ running: true, i, found: null });
      await new Promise((r) => setTimeout(r, 140));
      if ((await hmac(WORDLIST[i], data)) === target) { setCrack({ running: false, i, found: WORDLIST[i] }); mark('crack'); return; }
    }
    setCrack({ running: false, i: WORDLIST.length, found: false });
    if (strong) mark('strong');
  };

  const [th, tp, ts] = token.split('.');
  const presets = attack ? [
    { n: 'alg:none + admin', f: () => { setHeader('{"alg":"none","typ":"JWT"}'); setPayload('{"sub":"7","name":"Rahim","role":"admin","exp":1794400000}'); setSigMode('empty'); } },
    { n: 'role → admin', f: () => setPayload('{"sub":"7","name":"Rahim","role":"admin","exp":1794400000}') },
    { n: 'Reset', f: () => { setHeader('{"alg":"HS256","typ":"JWT"}'); setPayload('{"sub":"7","name":"Rahim","role":"user","exp":1794400000}'); setSigMode('keep'); } },
  ] : [
    { n: 'role → admin', f: () => setPayload('{"sub":"7","name":"Rahim","role":"admin","exp":1794400000}') },
    { n: 'Reset', f: () => { setPayload('{"sub":"7","name":"Rahim","role":"user","exp":1794400000}'); setSigMode('keep'); } },
  ];

  return (
    <div className="stack">
      {attack && (
        <div className="row">
          <span className="muted">Server config:</span>
          <Toggle on={pin} onChange={setPin} label="WithValidMethods(HS256) — alg pin" />
          <Toggle on={strong} onChange={setStrong} label={strong ? 'Strong 256-bit secret' : 'Weak secret ("secret123")'} />
        </div>
      )}
      <div className="card">
        <div className="section-h">🎫 Token (ক্লিক করে decode করো)</div>
        <div className="jwt-token mono" onClick={() => { setShowDecoded(true); mark('decode'); }}>
          <span className="jh">{th}</span>.<span className="jp">{tp}</span>.<span className="js">{ts || '(empty)'}</span>
        </div>
        <AnimatePresence>
          {showDecoded && th && (
            <motion.div className="grid3" style={{ marginTop: 10 }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div><div className="lbl" style={{ color: '#f472b6' }}>HEADER</div><pre className="code">{unb64u(th)}</pre></div>
              <div><div className="lbl" style={{ color: '#a78bfa' }}>PAYLOAD (encrypted নয়!)</div><pre className="code">{unb64u(tp)}</pre></div>
              <div><div className="lbl" style={{ color: '#22d3ee' }}>SIGNATURE</div><pre className="code">HMAC-SHA256(header.payload, SECRET){'\n'}= {ts ? ts.slice(0, 22) + '…' : '(none)'}</pre></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="section-h">✏️ Token edit করো</div>
          <div className="row" style={{ gap: 6, marginBottom: 6 }}>{presets.map((x) => <button key={x.n} className="btn sm" onClick={x.f}>{x.n}</button>)}</div>
          <label className="lbl">Header</label>
          <input className="input mono" value={header} onChange={(e) => setHeader(e.target.value)} />
          <label className="lbl">Payload</label>
          <textarea className="input mono" rows={2} value={payload} onChange={(e) => setPayload(e.target.value)} />
          <label className="lbl">Signature</label>
          <select className="input" value={sigMode} onChange={(e) => setSigMode(e.target.value)}>
            <option value="keep">পুরনো signature রাখো</option>
            <option value="empty">খালি signature (alg:none)</option>
            <option value="sign">এই secret দিয়ে নতুন sign করো…</option>
          </select>
          {sigMode === 'sign' && <input className="input mono" style={{ marginTop: 6 }} placeholder="secret" value={signSecret} onChange={(e) => setSignSecret(e.target.value)} />}
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={build}>🔨 Token বানাও</button>
            <button className="btn primary" onClick={verify}>📤 Server-এ পাঠাও</button>
          </div>
          <AnimatePresence mode="wait">
            {verdict && <motion.div key={verdict.msg} className={'note ' + (verdict.ok ? (verdict.evil ? 'bad' : 'good') : 'warn')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{verdict.evil ? '💥 ' : ''}{verdict.msg}</motion.div>}
          </AnimatePresence>
        </div>
        <div className="card">
          {attack ? (
            <>
              <div className="section-h">🔓 Offline secret cracker (hashcat-এর মতো)</div>
              <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>আসল token-এর signature নিয়ে প্রতিটি শব্দ দিয়ে HMAC হিসাব করে মেলানো হচ্ছে (আসল WebCrypto)।</p>
              <button className="btn danger" disabled={crack.running} onClick={runCrack}>{crack.running ? 'Cracking…' : '▶ Wordlist attack চালাও'}</button>
              <div className="wordlist">
                {WORDLIST.map((w, i) => (
                  <motion.span key={w} className="mono word" animate={{ backgroundColor: crack.found === w ? 'rgba(248,113,113,.35)' : crack.i === i && crack.running ? 'rgba(34,211,238,.25)' : 'rgba(0,0,0,0)', opacity: crack.i > i && crack.found !== w ? 0.35 : 1 }}>{w}</motion.span>
                ))}
              </div>
              {crack.found && <div className="note bad">💥 Secret পাওয়া গেছে: <b className="mono">{crack.found}</b> — এখন "এই secret দিয়ে sign করো" বেছে admin token বানাও।</div>}
              {crack.found === false && <div className="note good">✅ কোনো শব্দ মেলেনি। 256-bit random secret brute-force করা কার্যত অসম্ভব।</div>}
            </>
          ) : (
            <>
              <div className="section-h">💡 যা শিখছ</div>
              <p style={{ marginTop: 0 }}>Header ও payload শুধু Base64URL — যে কেউ পড়তে পারে। Signature-ই একমাত্র সুরক্ষা: server-এর গোপন secret ছাড়া বৈধ signature বানানো যায় না।</p>
              <p className="muted">তাই payload বদলালে signature মেলে না → 401। আর secret দুর্বল হলে? সেটা Phase 3-এর JWT Attacks lesson-এ দেখবে।</p>
            </>
          )}
          <div style={{ marginTop: 12 }}><TaskList tasks={TASKS} done={done} /></div>
        </div>
      </div>
    </div>
  );
}
