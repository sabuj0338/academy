import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TaskList({ tasks, done }) {
  return (
    <div className="task-list">
      {tasks.map((t) => {
        const ok = done.includes(t.id);
        return (
          <motion.div key={t.id} className={'task' + (ok ? ' done' : '')} animate={ok ? { x: [0, 4, 0] } : {}}>
            <span className="box">{ok ? '✓' : ''}</span>
            <span>{t.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// সব task শেষ হলে একবার onComplete ডাকে
export function useCompletion(total, doneCount, onComplete) {
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current && total > 0 && doneCount >= total) {
      fired.current = true;
      onComplete?.();
    }
  }, [total, doneCount, onComplete]);
}

export function Toggle({ on, onChange, label, color = 'var(--green)' }) {
  return (
    <button className="toggle" onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="toggle-track" style={{ background: on ? color : 'var(--line2)' }}>
        <motion.span className="toggle-knob" animate={{ x: on ? 18 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function Code({ label, kind, text, lang }) {
  return (
    <div className={'codeblock ' + (kind || '')}>
      {label && (
        <div className="codeblock-h">
          <span>{kind === 'bad' ? '✖ ' : kind === 'good' ? '✔ ' : ''}{label}</span>
          {lang && <span className="lang">{lang}</span>}
        </div>
      )}
      <pre className="code">{text}</pre>
    </div>
  );
}

export function Note({ text, tone }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div key={text} className={'note ' + (tone || '')} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function statusColor(s) {
  if (s >= 500) return 'var(--red)';
  if (s >= 400) return 'var(--amber)';
  if (s >= 300) return 'var(--violet)';
  return 'var(--green)';
}
