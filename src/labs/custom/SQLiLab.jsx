import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

const USERS = [
  { id: 1, username: 'admin', password: 'S3cure!Admin#2026', role: 'admin' },
  { id: 7, username: 'rahim', password: 'rahim123', role: 'user' },
  { id: 9, username: 'nusrat', password: 'n#2026!', role: 'user' },
];
const SECRETS = [
  { id: 1, name: 'stripe_key', value: 'sk_live_51HxEXAMPLE' },
  { id: 2, name: 'jwt_secret', value: 'FLAG{uni0n_s3l3ct_ftw}' },
  { id: 3, name: 'smtp_pass', value: 'mail@2026' },
];
const TASKS = [
  { id: 'error', text: 'একটি single quote (\') দিয়ে SQL error trigger করো' },
  { id: 'bypass', text: 'Password ছাড়াই admin হিসেবে login করো' },
  { id: 'union', text: 'UNION SELECT দিয়ে secrets টেবিলের data বের করো (৩টি column লাগবে)' },
  { id: 'fixed', text: 'Parameterized mode-এ একই payload চেষ্টা করে ব্যর্থ হতে দেখো' },
];

function evaluate(u, p) {
  // খুবই সরল SQL "interpreter" — শুধু শেখানোর জন্য সাধারণ payload pattern চেনে
  const inj = u.includes("'") ? u : p.includes("'") ? p : null;
  if (!inj) {
    const row = USERS.find((x) => x.username === u && x.password === p);
    return row ? { rows: [row] } : { rows: [] };
  }
  const where = inj === u ? 'username' : 'password';
  const union = inj.match(/'\s*union\s+(all\s+)?select\s+(.+?)\s+from\s+(\w+)\s*(--|#|;|$)/i);
  if (union) {
    const cols = union[2].split(',').map((c) => c.trim());
    const table = union[3].toLowerCase();
    if (cols.length !== 3) return { error: `ERROR: each UNION query must have the same number of columns (LINE 1: …)` };
    const src = table === 'secrets' ? SECRETS : table === 'users' ? USERS : null;
    if (!src) return { error: `ERROR: relation "${union[3]}" does not exist` };
    const rows = src.map((r) => Object.fromEntries(cols.map((c, i) => [['id', 'username', 'role'][i], c in r ? r[c] : c.replace(/'/g, '')])));
    return { rows, union: table };
  }
  const commentAfter = inj.match(/^(.*?)'\s*(--|#)/);
  const taut = /'\s*or\s+('?)(\w+)\1\s*=\s*\1\2\1/i.test(inj) || /'\s*or\s+true/i.test(inj);
  if (taut) return { rows: USERS.slice(), taut: true };
  if (commentAfter && where === 'username') {
    const name = commentAfter[1];
    const row = USERS.find((x) => x.username === name);
    return { rows: row ? [row] : [], comment: true };
  }
  const quotes = (inj.match(/'/g) || []).length;
  if (quotes % 2 === 1) return { error: `ERROR: unterminated quoted string at or near "'${inj.split("'").pop()}' AND …"\nLINE 1: SELECT id, username, role FROM users WHERE ${where} = '${inj}…` };
  return { rows: [] };
}

export default function SQLiLab({ onComplete }) {
  const [u, setU] = useState('rahim');
  const [p, setP] = useState('rahim123');
  const [param, setParam] = useState(false);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState([]);
  useCompletion(TASKS.length, done.length, onComplete);
  const mark = (...ids) => setDone((d) => [...new Set([...d, ...ids])]);

  const submit = () => {
    if (param) {
      const row = USERS.find((x) => x.username === u && x.password === p);
      const looksAttack = /['"]|--|union|\bor\b/i.test(u + p);
      setResult({ rows: row ? [row] : [], param: true });
      if (looksAttack) mark('fixed');
      return;
    }
    const r = evaluate(u, p);
    setResult(r);
    if (r.error) mark('error');
    if (r.rows?.[0]?.role === 'admin' && !r.union && p !== USERS[0].password) mark('bypass');
    if (r.union === 'secrets') mark('union');
  };

  const pieces = useMemo(() => param
    ? [['SELECT id, username, role FROM users\nWHERE username = ', 'k'], ['$1', 'param'], [' AND password_hash = crypt(', 'k'], ['$2', 'param'], [')', 'k']]
    : [['SELECT id, username, role FROM users\nWHERE username = \'', 'k'], [u, u.includes("'") ? 'inj' : 'input'], ['\' AND password = \'', 'k'], [p, p.includes("'") ? 'inj' : 'input'], ['\'', 'k']], [u, p, param]);

  const logged = result?.rows?.length && !result.union ? result.rows[0] : null;

  return (
    <div className="stack">
      <Toggle on={param} onChange={(v) => { setParam(v); setResult(null); }} label={param ? '🛡 Parameterized query ($1, $2)' : '⚠ String concatenation (vulnerable)'} />
      <div className="grid2">
        <div className="card">
          <div className="login-box">
            <div style={{ fontSize: 26 }}>🛒</div>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>ShopBD Admin Login</div>
            <label className="lbl">Username</label>
            <input className="input mono" value={u} onChange={(e) => setU(e.target.value)} spellCheck={false} />
            <label className="lbl">Password</label>
            <input className="input mono" value={p} onChange={(e) => setP(e.target.value)} spellCheck={false} />
            <button className="btn primary" style={{ width: '100%', marginTop: 12 }} onClick={submit}>Login</button>
            <div className="row" style={{ gap: 6, marginTop: 10 }}>
              {["'", "admin'--", "' OR '1'='1' --", "' UNION SELECT id, name, value FROM secrets--"].map((x) => (
                <button key={x} className="cmd-chip mono" onClick={() => { setU(x); setP('x'); }}>{x}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <div className="section-h">⚙️ Backend যে query বানাল (লাইভ)</div>
            <pre className="code sql-live">
              {pieces.map(([t, k], i) => <span key={i} className={'q-' + k}>{t}</span>)}
            </pre>
            {param && <div className="mono muted" style={{ fontSize: 13, marginTop: 6 }}>params: $1 = {JSON.stringify(u)}, $2 = {JSON.stringify(p)}  ← শুধু data, কখনো SQL নয়</div>}
          </div>
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={JSON.stringify(result)} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ borderColor: result.error ? 'var(--amber)' : logged?.role === 'admin' || result.union ? 'var(--red)' : logged ? 'var(--green)' : 'var(--line2)' }}>
                {result.error && (<><div className="section-h" style={{ color: 'var(--amber)' }}>Database error (client-কে দেখানো হচ্ছে!)</div><pre className="code" style={{ color: '#fde68a' }}>{result.error}</pre><div className="note bad">⚠ Error message-এ query-র গঠন ফাঁস হচ্ছে — attacker এখান থেকে শিখে payload বানায়।</div></>)}
                {result.union && (<><div className="section-h" style={{ color: 'var(--red)' }}>💥 UNION দিয়ে অন্য টেবিল dump</div><table className="tbl"><tbody>{result.rows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="mono">{String(v)}</td>)}</tr>)}</tbody></table></>)}
                {!result.error && !result.union && (logged ? (
                  <div><div style={{ fontSize: 20 }}>{logged.role === 'admin' ? '👑' : '✅'} Welcome, <b>{logged.username}</b> <span className="badge">{logged.role}</span></div>
                    {result.taut && <div className="note bad">💥 '1'='1' সবসময় সত্য → সব row ফেরত এসেছে, প্রথমটা (admin) দিয়ে login!</div>}
                    {result.comment && <div className="note bad">💥 -- বাকি query (password check) comment করে দিয়েছে!</div>}
                  </div>
                ) : <div>❌ Invalid username or password {result.param && <div className="note good">✅ Parameterized: পুরো payload-টা একটি username string হিসেবে খোঁজা হয়েছে — এমন নামের user নেই।</div>}</div>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="card"><div className="section-h">🎯 Mission</div><TaskList tasks={TASKS} done={done} /></div>
    </div>
  );
}
