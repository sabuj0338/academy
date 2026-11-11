import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditPresets } from '../auditPresets.js';
import { useCompletion } from '../../components/ui.jsx';

// Config/code review — সন্দেহজনক লাইনে ক্লিক করো, সব পেলে fix apply।
export default function AuditLab({ preset, onComplete }) {
  const P = auditPresets[preset];
  const lines = P.lines.map((l) => (typeof l === 'string' ? { t: l } : l));
  const badIdx = lines.map((l, i) => (l.bad ? i : -1)).filter((i) => i >= 0);
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [active, setActive] = useState(null);
  const [fixed, setFixed] = useState(false);
  const [misses, setMisses] = useState(0);
  useCompletion(1, fixed ? 1 : 0, onComplete);

  const click = (i) => {
    if (fixed || !lines[i].t.trim()) return;
    if (lines[i].bad) {
      if (!found.includes(i)) setFound((f) => [...f, i]);
      setActive(i);
    } else {
      setWrong(i);
      setMisses((m) => m + 1);
      setTimeout(() => setWrong(null), 600);
    }
  };
  const all = found.length === badIdx.length;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <span className="badge">📄 {P.file}</span>
          <span className={'badge ' + (all ? 'ok' : 'warn')}>পাওয়া গেছে {found.length}/{badIdx.length}</span>
          {misses > 0 && <span className="badge">ভুল ক্লিক: {misses}</span>}
        </div>
        <div className="row">
          {!fixed && <button className="btn sm" onClick={() => setFound(badIdx)}>💡 সব দেখাও</button>}
          <button className="btn primary sm" disabled={!all || fixed} onClick={() => setFixed(true)}>🔧 Fix apply করো</button>
        </div>
      </div>
      <div className="audit-grid">
        <div className="audit-file">
          {lines.map((l, i) => {
            const isFound = found.includes(i);
            const showFix = fixed && l.bad;
            return (
              <motion.div key={i} className={'audit-line' + (isFound && !fixed ? ' found' : '') + (active === i ? ' active' : '') + (showFix ? ' fixed' : '')}
                onClick={() => click(i)} animate={wrong === i ? { x: [0, -6, 6, -4, 4, 0], backgroundColor: ['rgba(248,113,113,.0)', 'rgba(248,113,113,.18)', 'rgba(248,113,113,0)'] } : {}} transition={{ duration: 0.45 }}>
                <span className="ln">{i + 1}</span>
                <AnimatePresence mode="wait">
                  {showFix ? (
                    <motion.span key="fix" className="lt" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: badIdx.indexOf(i) * 0.12 }}>
                      <span className="del">{l.t}</span>{'\n'}<span className="add">{l.bad.fix}</span>
                    </motion.span>
                  ) : (
                    <motion.span key="orig" className="lt">{l.t || ' '}</motion.span>
                  )}
                </AnimatePresence>
                {isFound && !fixed && <span className="flag">⚠</span>}
              </motion.div>
            );
          })}
        </div>
        <div className="stack">
          <AnimatePresence mode="wait">
            {active !== null && lines[active]?.bad ? (
              <motion.div key={active} className="card" style={{ borderColor: 'var(--red)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-h" style={{ color: 'var(--red)' }}>⚠ লাইন {active + 1}: কেন বিপজ্জনক</div>
                <p style={{ margin: '0 0 10px' }}>{lines[active].bad.why}</p>
                <div className="section-h" style={{ color: 'var(--green)' }}>✔ সমাধান</div>
                <pre className="code">{lines[active].bad.fix}</pre>
              </motion.div>
            ) : (
              <motion.div key="hint" className="card muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                বাম পাশের ফাইলে যে লাইন বিপজ্জনক মনে হয় তাতে ক্লিক করো। সঠিক হলে ব্যাখ্যা দেখাবে, ভুল হলে লাইন কেঁপে উঠবে।
              </motion.div>
            )}
          </AnimatePresence>
          {fixed && (
            <motion.div className="card" style={{ borderColor: 'var(--green)' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              ✅ সব {badIdx.length}টি সমস্যা ঠিক করা হয়েছে। বাম পাশে লাল = পুরনো, সবুজ = নতুন লাইন। Config বদলের পরে সবসময় syntax test (nginx -t, sshd -t) ও reload করো।
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
