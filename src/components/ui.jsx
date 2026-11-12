import React, { useEffect, useRef, useState } from 'react';
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

const HASH_LANGS = new Set(['bash', 'yaml', 'nginx', 'conf', 'dockerfile', 'hcl', 'graphql']);
const KEYWORDS = 'func|return|if|else|for|range|var|const|let|import|from|export|default|async|await|function|class|new|package|type|struct|interface|defer|nil|true|false|null|undefined|final|void|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|GRANT|REVOKE|ALTER|DROP|ROLE|AND|OR|NOT|JOIN|LIMIT|BEGIN|COMMIT|ROLLBACK|UNION|RUN|COPY|WORKDIR|EXPOSE|ENTRYPOINT|CMD|sudo';

// হালকা syntax রং — comment, string, সংখ্যা, keyword
function tint(text, lang) {
  if (!lang || lang === 'text' || lang === 'md') return text;
  const comment = [String.raw`\/\*[\s\S]*?\*\/`, String.raw`(?<=^|\s)\/\/.*$`];
  if (HASH_LANGS.has(lang)) comment.push(String.raw`(?<=^|\s)#.*$`);
  if (lang === 'sql') comment.push(String.raw`(?<=^|\s)--\s.*$`);
  const re = new RegExp(
    '(' + comment.join('|') + ')|' + String.raw`("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(\d+(?:\.\d+)?)\b|\b(` + KEYWORDS + String.raw`)\b`,
    'gm',
  );
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (!m[0].length) { re.lastIndex++; continue; }
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={m.index} className={m[1] ? 'tk-c' : m[2] ? 'tk-s' : m[3] ? 'tk-n' : 'tk-k'}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export function Code({ label, kind, text, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className={'codeblock ' + (kind || '')}>
      {label && (
        <div className="codeblock-h">
          <span>{kind === 'bad' ? '✖ ' : kind === 'good' ? '✔ ' : ''}{label}</span>
          {lang && <span className="lang">{lang}</span>}
          <button className="code-copy" onClick={copy}>{copied ? '✓ copied' : '⧉ copy'}</button>
        </div>
      )}
      <pre className="code">{tint(text, lang)}</pre>
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
