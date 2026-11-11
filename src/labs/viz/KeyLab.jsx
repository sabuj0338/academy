import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

// আসল WebCrypto দিয়ে public/private key — browser-এর ভেতরেই
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const enc = new TextEncoder();
const dec = new TextDecoder();

export default function KeyLab({ onComplete }) {
  const [keys, setKeys] = useState(null);
  const [eve, setEve] = useState(null);
  const [msg, setMsg] = useState('আমার bKash PIN 4821');
  const [cipher, setCipher] = useState(null);
  const [out, setOut] = useState(null);
  const [sig, setSig] = useState(null);
  const [signed, setSigned] = useState('সার্ভার: এই certificate আমার — api.bank.local');
  const [verify, setVerify] = useState(null);
  const [done, setDone] = useState([]);
  const tasks = [
    { id: 'gen', text: 'Server-এর জন্য key pair (public + private) তৈরি করো' },
    { id: 'enc', text: 'Public key দিয়ে গোপন message encrypt করো' },
    { id: 'eve', text: 'Eve (attacker)-এর ভুল key দিয়ে খোলার চেষ্টা — ব্যর্থ হবে' },
    { id: 'dec', text: 'Server-এর private key দিয়ে খোলো' },
    { id: 'tamper', text: 'Signed message বদলে দাও — signature verify ব্যর্থ হবে' },
  ];
  useCompletion(tasks.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const ok = typeof crypto !== 'undefined' && crypto.subtle;

  const gen = async () => {
    const rsa = { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };
    const k = await crypto.subtle.generateKey(rsa, true, ['encrypt', 'decrypt']);
    const e = await crypto.subtle.generateKey(rsa, true, ['encrypt', 'decrypt']);
    const s = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const spki = await crypto.subtle.exportKey('spki', k.publicKey);
    setKeys({ ...k, sign: s, pubText: b64(spki) });
    setEve(e);
    setCipher(null); setOut(null); setSig(null); setVerify(null);
    mark('gen');
  };
  const encrypt = async () => {
    const c = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, keys.publicKey, enc.encode(msg));
    setCipher(c); setOut(null); mark('enc');
  };
  const tryDec = async (who) => {
    try {
      const p = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, who === 'server' ? keys.privateKey : eve.privateKey, cipher);
      setOut({ ok: true, who, t: dec.decode(p) });
      if (who === 'server') mark('dec');
    } catch {
      setOut({ ok: false, who, t: 'OperationError — decrypt ব্যর্থ। ভুল private key দিয়ে খোলা অসম্ভব।' });
      if (who === 'eve') mark('eve');
    }
  };
  const sign = async () => {
    const s = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.sign.privateKey, enc.encode(signed));
    setSig({ s, orig: signed }); setVerify(null);
  };
  const doVerify = async () => {
    const v = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, keys.sign.publicKey, sig.s, enc.encode(signed));
    setVerify(v);
    if (!v && signed !== sig.orig) mark('tamper');
  };
  useEffect(() => { if (!ok) setOut({ ok: false, t: 'এই browser-এ WebCrypto নেই (https বা localhost দরকার)।' }); }, [ok]);

  return (
    <div className="stack">
      <div className="key-stage">
        <div className="key-actor"><div style={{ fontSize: 34 }}>🧑‍💻</div><b>তুমি (Browser)</b><small>শুধু public key জানো</small></div>
        <div className="key-mid">
          <motion.div className="key-lock" animate={{ rotate: cipher ? [0, -10, 10, 0] : 0 }} key={!!cipher + ''}>{cipher ? '🔒' : '✉️'}</motion.div>
          <div className="muted" style={{ fontSize: 12.5 }}>{cipher ? 'Encrypted — পথে সবাই দেখবে কিন্তু পড়বে না' : 'খোলা চিঠি'}</div>
          <div className="key-eve">🦹 Eve মাঝপথে বসে আছে</div>
        </div>
        <div className="key-actor"><div style={{ fontSize: 34 }}>🏦</div><b>Server</b><small>private key শুধু এর কাছে</small></div>
      </div>
      <div className="grid2">
        <div className="card stack">
          <div className="section-h">১. Key pair ও encryption (RSA-OAEP 2048)</div>
          <button className="btn primary" disabled={!ok} onClick={gen}>🔑 {keys ? 'নতুন key pair' : 'Key pair তৈরি করো'}</button>
          {keys && <div className="mono key-pub" title="Public key (SPKI, base64)">🔓 public: {keys.pubText.slice(0, 90)}…</div>}
          <input className="input" value={msg} onChange={(e) => { setMsg(e.target.value); setCipher(null); }} />
          <button className="btn" disabled={!keys} onClick={encrypt}>🔒 Server-এর public key দিয়ে encrypt</button>
          {cipher && <div className="mono key-pub" style={{ color: '#fca5a5' }}>{b64(cipher).slice(0, 140)}…</div>}
          <div className="row">
            <button className="btn sm danger" disabled={!cipher} onClick={() => tryDec('eve')}>🦹 Eve-এর key দিয়ে খোলো</button>
            <button className="btn sm success" disabled={!cipher} onClick={() => tryDec('server')}>🏦 Server-এর private key দিয়ে খোলো</button>
          </div>
          {out && <div className={'note ' + (out.ok ? 'good' : 'bad')}>{out.ok ? '✅ খোলা গেল: "' + out.t + '"' : '✖ ' + out.t}</div>}
        </div>
        <div className="card stack">
          <div className="section-h">২. Digital signature (ECDSA P-256) — "সত্যিই কি server পাঠিয়েছে?"</div>
          <textarea className="input" rows={2} value={signed} onChange={(e) => { setSigned(e.target.value); setVerify(null); }} />
          <div className="row">
            <button className="btn sm" disabled={!keys} onClick={sign}>✍️ Server private key দিয়ে sign</button>
            <button className="btn sm" disabled={!sig} onClick={doVerify}>🔍 Public key দিয়ে verify</button>
          </div>
          {sig && <div className="mono key-pub">signature: {b64(sig.s).slice(0, 80)}…</div>}
          {verify !== null && <div className={'note ' + (verify ? 'good' : 'bad')}>{verify ? '✅ Signature valid — message অপরিবর্তিত ও server-এরই।' : '✖ Signature invalid — একটা অক্ষর বদলালেও ধরা পড়ে! এভাবেই browser নকল certificate ধরে।'}</div>}
          <div className="muted" style={{ fontSize: 13 }}>টিপ: sign করার পরে উপরের লেখায় একটি অক্ষর বদলাও, তারপর verify করো।</div>
        </div>
      </div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={tasks} done={done} /></div>
    </div>
  );
}
