import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toggle, useCompletion } from '../../components/ui.jsx';

const FILES = [
  { name: 'avatar.png', ct: 'image/png', magic: '89 50 4E 47', size: '240 KB', big: false, legit: true },
  { name: 'shell.php', ct: 'application/x-php', magic: '3C 3F 70 68  <?ph', size: '1 KB', threat: 'rce' },
  { name: 'cat.php.jpg', ct: 'image/jpeg', magic: '3C 3F 70 68  <?ph', size: '1 KB', threat: 'rce' },
  { name: 'logo.svg', ct: 'image/svg+xml', magic: '3C 73 76 67  <svg', size: '2 KB', threat: 'xss' },
  { name: '../../etc/cron.d/x.png', ct: 'image/png', magic: '89 50 4E 47', size: '1 KB', threat: 'path' },
  { name: 'huge.png', ct: 'image/png', magic: '89 50 4E 47', size: '5.2 GB', big: true, threat: 'dos' },
];
const DEF = [
  { id: 'ext', label: 'Extension allowlist (png/jpg)' },
  { id: 'magic', label: 'Magic bytes check' },
  { id: 'size', label: 'Size limit (5 MB)' },
  { id: 'rename', label: 'Random UUID filename' },
  { id: 'noexec', label: 'Object storage (S3/R2), execute নেই' },
];
const ext = (n) => n.split('.').pop().toLowerCase();
const isImgMagic = (m) => m.startsWith('89 50') || m.startsWith('FF D8');

function judge(f, d) {
  const steps = [];
  if (d.size && f.big) return { steps: [['size', false]], result: 'blocked', why: '413 Payload Too Large — size limit।' };
  if (d.size) steps.push(['size', true]);
  if (d.ext) { const ok = ['png', 'jpg', 'jpeg'].includes(ext(f.name)); steps.push(['ext', ok]); if (!ok) return { steps, result: 'blocked', why: `.${ext(f.name)} allowlist-এ নেই।` }; }
  if (d.magic) { const ok = isImgMagic(f.magic); steps.push(['magic', ok]); if (!ok) return { steps, result: 'blocked', why: `ফাইলের প্রথম bytes "${f.magic}" — আসলে ছবি নয়! Extension/Content-Type মিথ্যা।` }; }
  if (f.legit) return { steps, result: 'ok', why: 'আসল ছবি — সফলভাবে upload হলো।' };
  if (f.threat === 'path') return d.rename ? { steps: [...steps, ['rename', true]], result: 'safe', why: 'User-এর filename ফেলে দিয়ে UUID নাম — path traversal অসম্ভব।' } : { steps, result: 'pwned', why: '💥 ফাইলটি /etc/cron.d/-তে লেখা হলো → cron job হিসেবে চলবে!' };
  if (f.threat === 'rce') return d.noexec ? { steps: [...steps, ['noexec', true]], result: 'safe', why: 'S3/R2-এ রাখা — কোনো PHP interpreter নেই, ফাইলটি শুধু data।' } : { steps, result: 'pwned', why: '💥 /uploads/' + f.name + ' খুললেই server-এ attacker-এর code চলে (web shell)।' };
  if (f.threat === 'xss') return { steps, result: 'pwned', why: '💥 SVG-র ভেতরের <script> তোমার domain-এ চলবে (stored XSS)।' };
  if (f.threat === 'dos') return { steps, result: 'pwned', why: '💥 5 GB ফাইল disk ভরিয়ে দিল — server বন্ধ।' };
  return { steps, result: 'ok' };
}

export default function UploadLab({ onComplete }) {
  const [d, setD] = useState({ ext: false, magic: false, size: false, rename: false, noexec: false });
  const [res, setRes] = useState(null);
  const results = res || {};
  const allGood = res && FILES.every((f) => (f.legit ? results[f.name].result === 'ok' : ['blocked', 'safe'].includes(results[f.name].result)));
  useCompletion(1, allGood ? 1 : 0, onComplete);
  const test = () => setRes(Object.fromEntries(FILES.map((f) => [f.name, judge(f, d)])));
  const col = { ok: 'var(--green)', blocked: 'var(--cyan)', safe: 'var(--cyan)', pwned: 'var(--red)' };
  const lab = { ok: '✅ Uploaded', blocked: '⛔ Blocked', safe: '🛡 Harmless', pwned: '💥 Compromised' };

  return (
    <div className="stack">
      <div className="card">
        <div className="section-h">🛡 Upload pipeline-এ defense চালু করো</div>
        <div className="row">{DEF.map((x) => <Toggle key={x.id} on={d[x.id]} onChange={(v) => { setD({ ...d, [x.id]: v }); setRes(null); }} label={x.label} />)}</div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={test}>📤 সব ফাইল upload চেষ্টা করো</button>
      </div>
      <div className="upload-grid">
        {FILES.map((f, i) => {
          const r = results[f.name];
          return (
            <motion.div key={f.name} className="card" style={{ borderColor: r ? col[r.result] : undefined }} initial={false} animate={r ? { y: [8, 0], opacity: [0.4, 1] } : {}} transition={{ delay: i * 0.08 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontWeight: 600, wordBreak: 'break-all' }}>{f.legit ? '🖼️' : '📄'} {f.name}</span>
                {r && <span className="badge" style={{ color: col[r.result], borderColor: col[r.result] }}>{lab[r.result]}</span>}
              </div>
              <div className="mono muted" style={{ fontSize: 12.5 }}>Content-Type: {f.ct} · {f.size}<br />magic: {f.magic}</div>
              {r && (
                <>
                  <div className="row" style={{ gap: 4, margin: '6px 0' }}>{r.steps.map(([s, ok]) => <span key={s} className={'badge ' + (ok ? 'ok' : 'bad')}>{s} {ok ? '✓' : '✖'}</span>)}</div>
                  <div style={{ fontSize: 14 }}>{r.why}</div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
      {res && <div className={'note ' + (allGood ? 'good' : 'warn')}>{allGood ? '🎉 সব malicious ফাইল আটকানো বা নিরীহ, আর আসল ছবি ঠিকমতো upload হচ্ছে। Defense in depth!' : 'এখনো কিছু ফাইল ক্ষতি করছে (বা আসল ছবি আটকে যাচ্ছে)। আরও defense চালু করো।'}</div>}
    </div>
  );
}
