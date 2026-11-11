import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle, useCompletion } from '../../components/ui.jsx';

const LOCS = [
  { id: 'local', name: 'একই server-এ (/var/backups)', icon: '🖥️', dies: 'Server-এর সাথেই encrypt হয়ে গেল।' },
  { id: 'disk2', name: 'একই server-এর দ্বিতীয় disk', icon: '💿', dies: 'Mounted disk — ransomware এটাও encrypt করল।' },
  { id: 's3same', name: 'S3 — একই AWS account, server-এ key', icon: '🪣', dies: 'Server-এর ~/.aws/credentials দিয়ে attacker bucket মুছে দিল।' },
  { id: 'r2lock', name: 'R2/S3 আলাদা account + Object Lock (write-only key)', icon: '🔒', survives: 'Write-only key দিয়ে মোছা যায় না, Object Lock ৩০ দিন রক্ষা করে।' },
  { id: 'offline', name: 'Offline / air-gapped কপি (সাপ্তাহিক)', icon: '📦', survives: 'Network-এ নেই — নাগালের বাইরে।', weekly: true },
];
const FREQ = { hourly: 1, daily: 24, weekly: 168 };

export default function BackupLab({ onComplete }) {
  const [sel, setSel] = useState(['local']);
  const [freq, setFreq] = useState('daily');
  const [encOn, setEncOn] = useState(false);
  const [tested, setTested] = useState(false);
  const [result, setResult] = useState(null);
  useCompletion(1, result?.win ? 1 : 0, onComplete);

  const attack = () => {
    const surv = LOCS.filter((l) => sel.includes(l.id) && l.survives);
    const lost = LOCS.filter((l) => sel.includes(l.id) && !l.survives);
    let rpo = null;
    if (surv.some((s) => s.id === 'r2lock')) rpo = FREQ[freq];
    else if (surv.some((s) => s.id === 'offline')) rpo = 168;
    const rto = rpo === null ? null : tested ? '২–৪ ঘণ্টা' : 'অজানা (restore কখনো test হয়নি — script ভাঙা পাওয়া গেল, ২ দিন লাগল)';
    const win = rpo !== null && rpo <= 24 && encOn && tested;
    setResult({ surv, lost, rpo, rto, win });
  };

  return (
    <div className="stack">
      <div className="grid2">
        <div className="card">
          <div className="section-h">📍 Backup কোথায় রাখবে? (একাধিক বেছে নাও)</div>
          {LOCS.map((l) => (
            <label key={l.id} className="check-row">
              <input type="checkbox" checked={sel.includes(l.id)} onChange={(e) => { setSel(e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id)); setResult(null); }} />
              <span>{l.icon} {l.name}</span>
            </label>
          ))}
        </div>
        <div className="card">
          <div className="section-h">⏱ কত ঘন ঘন (RPO)?</div>
          <div className="row">{Object.keys(FREQ).map((f) => <button key={f} className={'btn sm ' + (freq === f ? 'primary' : '')} onClick={() => { setFreq(f); setResult(null); }}>{f === 'hourly' ? 'প্রতি ঘণ্টা' : f === 'daily' ? 'প্রতিদিন' : 'সাপ্তাহিক'}</button>)}</div>
          <div className="stack" style={{ marginTop: 12, gap: 8 }}>
            <Toggle on={encOn} onChange={(v) => { setEncOn(v); setResult(null); }} label="Backup encrypted (age/gpg)" />
            <Toggle on={tested} onChange={(v) => { setTested(v); setResult(null); }} label="মাসিক restore test করা হয়" />
          </div>
          <button className="btn danger" style={{ marginTop: 14, width: '100%' }} onClick={attack}>☠️ Ransomware আক্রমণ চালাও</button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={JSON.stringify(result)} className="card" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ borderColor: result.win ? 'var(--green)' : 'var(--red)' }}>
            <div className="ransom">🔒 YOUR FILES ARE ENCRYPTED. Send 2 BTC to bc1q… <span className="muted">(production server, ০৩:১৪)</span></div>
            <div className="grid2" style={{ marginTop: 10 }}>
              <div>
                {result.lost.map((l, i) => <motion.div key={l.id} className="mini-li bad" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>✖ {l.icon} {l.name}: {l.dies}</motion.div>)}
                {result.surv.map((l, i) => <motion.div key={l.id} className="mini-li good" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.2 }}>✔ {l.icon} {l.name}: {l.survives}</motion.div>)}
              </div>
              <div>
                <div className="metric"><span>Data loss (RPO)</span><b style={{ color: result.rpo === null ? 'var(--red)' : result.rpo <= 24 ? 'var(--green)' : 'var(--amber)' }}>{result.rpo === null ? 'সব data হারিয়েছে 💀' : `সর্বোচ্চ ${result.rpo} ঘণ্টা`}</b></div>
                <div className="metric"><span>আবার চালু (RTO)</span><b>{result.rto || '—'}</b></div>
                <div className="metric"><span>Backup চুরি হলে</span><b style={{ color: encOn ? 'var(--green)' : 'var(--red)' }}>{encOn ? 'Encrypted — পড়া যায় না' : 'Plain — সব customer data ফাঁস'}</b></div>
              </div>
            </div>
            <div className={'note ' + (result.win ? 'good' : 'warn')}>{result.win ? '🎉 মুক্তিপণ ছাড়াই পুনরুদ্ধার! আলাদা account + immutable storage + encryption + tested restore।' : 'লক্ষ্য: RPO ≤ ২৪ ঘণ্টা, encrypted, এবং restore tested। কোন backup টিকে থাকে তা খেয়াল করো।'}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
