import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList, useCompletion } from '../../components/ui.jsx';

const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const b64 = (s) => btoa(String.fromCharCode(...enc.encode(s)));
const TASKS = [
  { id: 'b64', text: 'Base64 "লুকানো" data attacker হিসেবে decode করো' },
  { id: 'row', text: 'Field-level encryption চালু করে চুরি হওয়া DB dump দেখো' },
  { id: 'nonce', text: 'Nonce reuse attack demo চালাও' },
];

export default function EncryptLab({ onComplete }) {
  const [text, setText] = useState('NID: 1990123456789');
  const [out, setOut] = useState({ sha: '', aes: '' });
  const [key, setKey] = useState(null);
  const [decoded, setDecoded] = useState(false);
  const [fieldEnc, setFieldEnc] = useState(false);
  const [rowCt, setRowCt] = useState({});
  const [nonceDemo, setNonceDemo] = useState(null);
  const [done, setDone] = useState([]);
  useCompletion(TASKS.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  useEffect(() => { crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']).then(setKey); }, []);
  useEffect(() => {
    if (!key) return;
    (async () => {
      const sha = hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
      setOut({ sha, aes: hex(iv) + ':' + hex(ct) });
    })();
  }, [text, key]);

  const ROW = { name: 'Nusrat Jahan', nid: '1990123456789', phone: '01819-552211', bank: 'DBBL 1051-1234-5678' };
  const encryptRow = async (on) => {
    setFieldEnc(on);
    if (!on || !key) return;
    const o = {};
    for (const k of ['nid', 'phone', 'bank']) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      o[k] = hex(iv).slice(0, 8) + '…' + hex(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(ROW[k]))).slice(0, 24);
    }
    setRowCt(o);
    mark('row');
  };

  const runNonce = async () => {
    const iv = new Uint8Array(12); // একই nonce দুবার — ভুল!
    const p1 = 'transfer 500 to Rahim', p2 = 'PIN for card is 4821!';
    const c1 = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(p1)));
    const c2 = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(p2)));
    const known = enc.encode(p1);
    const rec = new Uint8Array(known.length).map((_, i) => c1[i] ^ c2[i] ^ known[i]);
    setNonceDemo({ c1: hex(c1.slice(0, 21)), c2: hex(c2.slice(0, 21)), p1, rec: new TextDecoder().decode(rec) });
    mark('nonce');
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="section-h">🧪 একই input — তিনটি আলাদা জিনিস</div>
        <input className="input mono" value={text} onChange={(e) => { setText(e.target.value); setDecoded(false); }} />
        <div className="grid3" style={{ marginTop: 10 }}>
          <div>
            <div className="lbl">Base64 (encoding)</div>
            <pre className="code">{b64(text)}</pre>
            <button className="btn sm danger" style={{ marginTop: 6 }} onClick={() => { setDecoded(true); mark('b64'); }}>😈 Attacker decode করে</button>
            {decoded && <div className="note bad">atob() → "{text}" — কোনো key লাগেনি! Encoding ≠ security।</div>}
          </div>
          <div>
            <div className="lbl">SHA-256 (hashing)</div>
            <pre className="code">{out.sha}</pre>
            <div className="muted" style={{ fontSize: 13 }}>একমুখী — ফেরানো যায় না। একটি অক্ষর বদলে দেখো, পুরো hash বদলায়।</div>
          </div>
          <div>
            <div className="lbl">AES-256-GCM (encryption)</div>
            <pre className="code" style={{ wordBreak: 'break-all' }}>{out.aes}</pre>
            <div className="muted" style={{ fontSize: 13 }}>Key ছাড়া অর্থহীন। প্রতিবার নতুন nonce → একই text-এর আলাদা ciphertext।</div>
          </div>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-h">💽 চুরি হওয়া database backup — attacker কী দেখে?</div>
          <div className="row"><button className={'btn sm ' + (fieldEnc ? '' : 'danger')} onClick={() => encryptRow(false)}>Plain columns</button><button className={'btn sm ' + (fieldEnc ? 'success' : '')} onClick={() => encryptRow(true)}>🔐 Field-level AES-GCM</button></div>
          <table className="tbl mono" style={{ marginTop: 10 }}>
            <tbody>
              {Object.entries(ROW).map(([k, v]) => (
                <tr key={k}><td className="muted">{k}</td>
                  <td><motion.span key={fieldEnc + k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: fieldEnc && k !== 'name' ? 'var(--green)' : k !== 'name' ? 'var(--red)' : undefined }}>{fieldEnc && rowCt[k] ? rowCt[k] : v}</motion.span></td></tr>
              ))}
            </tbody>
          </table>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Key আছে KMS/secret manager-এ — dump-এ নেই। তাই চুরি হওয়া backup থেকে NID/ব্যাংক তথ্য পড়া যায় না।</div>
        </div>
        <div className="card">
          <div className="section-h">⚠ Nonce reuse — কেন প্রতিবার নতুন nonce?</div>
          <button className="btn danger sm" onClick={runNonce} disabled={!key}>▶ একই nonce দিয়ে দুটি message encrypt করো</button>
          {nonceDemo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mono" style={{ fontSize: 12.5, marginTop: 8 }}>
              <div>C1 = {nonceDemo.c1}…</div>
              <div>C2 = {nonceDemo.c2}…</div>
              <div className="muted">Attacker জানে P1 = "{nonceDemo.p1}"</div>
              <div>C1 ⊕ C2 ⊕ P1 = <b style={{ color: 'var(--red)' }}>"{nonceDemo.rec}"</b></div>
              <div className="note bad" style={{ fontFamily: 'var(--font)' }}>💥 Key ছাড়াই দ্বিতীয় message (PIN!) উদ্ধার। GCM-এ nonce পুনঃব্যবহারে authentication-ও ভেঙে পড়ে।</div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="card"><TaskList tasks={TASKS} done={done} /></div>
    </div>
  );
}
