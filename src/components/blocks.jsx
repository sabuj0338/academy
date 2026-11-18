// Lesson-এর ভেতরের visual block গুলো — সব data-driven (src/data/visuals/*.js দেখো)।
// Entry animation সব CSS দিয়ে, যাতে tab hidden থাকলেও content আটকে না যায়।
import React, { useEffect, useMemo, useState } from 'react';
import { toBn } from '../data/curriculum.js';

const PALETTE = ['#22d3ee', '#a78bfa', '#fbbf24', '#4ade80', '#f472b6', '#fb923c'];
const KIND = { bad: '#f87171', good: '#4ade80' };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ───────── Glossary: lesson.terms থেকে শব্দ খুঁজে body-র ভেতরেই tooltip বানায়
export function buildGlossary(terms) {
  if (!terms?.length) return null;
  const map = new Map();
  for (const [t, d] of terms) {
    const m = t.match(/^(.*?)\s*\((.+)\)\s*$/);
    for (const k of m ? [m[1], m[2]] : [t]) if (k.trim().length > 1) map.set(k.trim().toLowerCase(), [t, d]);
  }
  const keys = [...map.keys()].sort((a, b) => b.length - a.length).map(esc);
  if (!keys.length) return null;
  return { map, re: new RegExp('(?<![A-Za-z0-9_])(' + keys.join('|') + ')(?![A-Za-z0-9_])', 'gi') };
}

export function Rich({ text, gloss }) {
  const out = [];
  const seen = new Set();
  String(text).split(/(`[^`]+`)/).forEach((chunk, ci) => {
    if (chunk.length > 2 && chunk.startsWith('`') && chunk.endsWith('`')) {
      out.push(<code key={ci} className="icode">{chunk.slice(1, -1)}</code>);
      return;
    }
    if (!gloss) { out.push(chunk); return; }
    let last = 0;
    let m;
    gloss.re.lastIndex = 0;
    while ((m = gloss.re.exec(chunk))) {
      const [t, d] = gloss.map.get(m[1].toLowerCase());
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(chunk.slice(last, m.index));
      out.push(
        <span key={ci + '-' + m.index} className="gloss" tabIndex={0}>
          {m[1]}<span className="term-tip"><b>{t}</b> — {d}</span>
        </span>,
      );
      last = m.index + m[1].length;
    }
    out.push(chunk.slice(last));
  });
  return <>{out}</>;
}

// ───────── Journey: পুরনো chain-এর interactive রূপ — packet node থেকে node-এ হাঁটে
export function Journey({ items, color }) {
  const [at, setAt] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return undefined;
    const t = setInterval(() => setAt((a) => (a + 1) % items.length), 1500);
    return () => clearInterval(t);
  }, [auto, items.length]);
  const [ic, t, sub] = items[at];
  return (
    <div className="journey stage" style={{ '--c': color }}>
      <div className="chain">
        {items.map(([i, title, s], k) => (
          <React.Fragment key={k}>
            <button className={'chain-node' + (k === at ? ' on' : k < at ? ' past' : '')} style={{ animationDelay: k * 0.08 + 's' }} onClick={() => { setAt(k); setAuto(false); }}>
              <div className="chain-ic">{i}</div>
              <div className="chain-t">{title}</div>
              {s && <div className="chain-sub">{s}</div>}
            </button>
            {k < items.length - 1 && <div className={'chain-link' + (k < at ? ' past' : '')}>{k === at - 1 && <span className="chain-dot" />}</div>}
          </React.Fragment>
        ))}
      </div>
      <div className="journey-cap">
        <span className="journey-n">{toBn(at + 1)}</span>
        <span><b>{ic} {t}</b>{sub ? ' — ' + sub : ''}</span>
        <button className="btn sm ghost" onClick={() => setAuto((a) => !a)}>{auto ? '⏸ থামাও' : '▶ চালাও'}</button>
      </div>
    </div>
  );
}

// ───────── Maps: উপমার কোন জিনিস = বাস্তবের কোন জিনিস
export function Maps({ pairs }) {
  return (
    <div className="maps">
      {pairs.map(([a, b], i) => (
        <div key={i} className="maps-row" style={{ animationDelay: 0.1 + i * 0.08 + 's' }}>
          <span className="maps-a">{a}</span><span className="maps-eq">≈</span><span className="maps-b">{b}</span>
        </div>
      ))}
    </div>
  );
}

// ───────── Points: “Label: ব্যাখ্যা” ধরনের লাইনকে tile বানায়
const POINT_RE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}{2})️?\s*)?(.{2,44}?)(?::| —| –) (.+)$/u;
const EMOJI_RE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}{2})️?)\s*(.+)$/u;
export function Points({ points, gloss }) {
  const parsed = points.map((p) => {
    const m = p.match(POINT_RE);
    if (m) return { icon: m[1]?.trim(), label: m[2], rest: m[3] };
    const e = p.match(EMOJI_RE);
    return e ? { icon: e[1], rest: e[2] } : { rest: p };
  });
  const grid = parsed.length >= 4 && parsed.every((p) => p.label && p.rest.length < 95);
  return (
    <div className={'points' + (grid ? ' grid' : '')}>
      {parsed.map((p, i) => (
        <div key={i} className="point" style={{ animationDelay: 0.05 * i + 's', '--c': PALETTE[i % PALETTE.length] }}>
          <span className="point-n">{p.icon || toBn(i + 1)}</span>
          <div>{p.label && <b className="point-l">{p.label}</b>}<span className="point-d"><Rich text={p.rest} gloss={gloss} /></span></div>
        </div>
      ))}
    </div>
  );
}

// ───────── Seq: কে কাকে কী বলছে — এক এক করে বার্তা
export function Seq({ title, actors, msgs }) {
  const [n, setN] = useState(1);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return undefined;
    if (n >= msgs.length) { setAuto(false); return undefined; }
    const t = setTimeout(() => setN((x) => x + 1), 1700);
    return () => clearTimeout(t);
  }, [auto, n, msgs.length]);
  const cx = (i) => ((i + 0.5) / actors.length) * 100;
  const cur = msgs[Math.max(n - 1, 0)];
  const curColor = KIND[cur[4]] || 'var(--tc, var(--cyan))';
  return (
    <div className="viz stage seq">
      {title && <div className="viz-h">🎬 {title}</div>}
      <div className="seq-actors" style={{ gridTemplateColumns: `repeat(${actors.length}, 1fr)` }}>
        {actors.map(([ic, name], i) => (
          <div key={i} className={'seq-actor' + (cur[0] === i || cur[1] === i ? ' on' : '')}><span>{ic}</span><b>{name}</b></div>
        ))}
      </div>
      <div className="seq-body">
        {actors.map((_, i) => <span key={i} className="seq-life" style={{ left: cx(i) + '%' }} />)}
        {msgs.map(([a, b, label, , kind], i) => {
          const shown = i < n;
          const c = KIND[kind] || 'var(--tc, var(--cyan))';
          const self = a === b;
          const l = Math.min(cx(a), cx(b));
          const w = Math.abs(cx(a) - cx(b));
          return (
            <button key={i} className={'seq-row' + (shown ? ' shown' : '') + (i === n - 1 ? ' cur' : '')} onClick={() => { setN(i + 1); setAuto(false); }} title="এই ধাপে যাও">
              {self ? (
                <span className="seq-self" style={{ left: cx(a) + '%', '--c': c }}>{label}</span>
              ) : (
                <span className={'seq-arrow ' + (b > a ? 'r' : 'l')} style={{ left: l + '%', width: w + '%', '--c': c }}>
                  <span className="seq-label">{label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="seq-cap" style={{ '--c': curColor }}>
        <span className="journey-n">{toBn(n)}</span>
        <div><b>{cur[2]}</b>{cur[3] ? <> — {cur[3]}</> : null}</div>
      </div>
      <div className="viz-ctl">
        <button className="btn sm" disabled={n <= 1} onClick={() => { setN(n - 1); setAuto(false); }}>←</button>
        <button className="btn sm primary" disabled={n >= msgs.length} onClick={() => { setN(n + 1); setAuto(false); }}>পরের বার্তা →</button>
        <button className="btn sm" onClick={() => { setN(1); setAuto(true); }}>↺ আবার চালাও</button>
        <span className="muted" style={{ fontSize: 12.5, marginLeft: 'auto' }}>{toBn(n)}/{toBn(msgs.length)}</span>
      </div>
    </div>
  );
}

// ───────── Anatomy: একটি লাইনকে টুকরো করে প্রতিটি অংশের মানে
export function Anatomy({ title, parts, note }) {
  const labeled = parts.map((p, i) => (p[1] ? i : -1)).filter((i) => i >= 0);
  const [sel, setSel] = useState(labeled[0] ?? 0);
  const colorOf = (i) => KIND[parts[i][3]] || PALETTE[labeled.indexOf(i) % PALETTE.length];
  const S = parts[sel];
  return (
    <div className="viz stage anatomy">
      {title && <div className="viz-h">🔬 {title}</div>}
      <div className="an-line">
        {parts.map(([text, label], i) => {
          const lines = text.split('\n');
          return (
            <React.Fragment key={i}>
              {lines.map((ln, k) => (
                <React.Fragment key={k}>
                  {k > 0 && <span className="an-br" />}
                  {ln && (label
                    ? <button className={'an-part' + (sel === i ? ' on' : '')} style={{ '--c': colorOf(i), animationDelay: i * 0.06 + 's' }} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)}>
                        <span className="an-text">{ln}</span>{k === 0 && <span className="an-label">{label}</span>}
                      </button>
                    : <span className="an-plain">{ln}</span>)}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </div>
      {S?.[1] && (
        <div className="an-desc" key={sel} style={{ '--c': colorOf(sel) }}>
          <b>{S[1]}</b> <code className="icode">{S[0].trim()}</code><div>{S[2]}</div>
        </div>
      )}
      {note && <div className="viz-note">{note}</div>}
      <div className="viz-hint">👆 প্রতিটি রঙিন অংশে mouse নাও বা tap করো</div>
    </div>
  );
}

// ───────── Bars: সংখ্যার তুলনা চোখে দেখো
export function Bars({ title, items, scale, note }) {
  const f = scale === 'log' ? (v) => Math.log10(v + 1) : scale === 'sqrt' ? Math.sqrt : (v) => v;
  const max = Math.max(...items.map((i) => f(i[1])));
  return (
    <div className="viz stage bars">
      {title && <div className="viz-h">📊 {title}</div>}
      {items.map(([label, value, display, kind], i) => (
        <div key={i} className="bar-row">
          <span className="bar-l">{label}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: Math.max((f(value) / max) * 100, 1.5) + '%', '--c': KIND[kind] || PALETTE[i % PALETTE.length], animationDelay: i * 0.12 + 's' }} /></span>
          <span className="bar-v">{display}</span>
        </div>
      ))}
      {scale && <div className="viz-hint">⚠️ পার্থক্য এত বিশাল যে bar-গুলো {scale === 'log' ? 'logarithmic' : 'সংকুচিত'} scale-এ আঁকা — আসল ফারাক আরও অনেক বেশি।</div>}
      {note && <div className="viz-note">{note}</div>}
    </div>
  );
}

// ───────── Layers: স্তরে স্তরে সাজানো ধারণা
export function Layers({ title, items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="viz stage layers">
      {title && <div className="viz-h">🧱 {title}</div>}
      {items.map(([ic, t, d], i) => (
        <button key={i} className={'layer' + (open === i ? ' on' : '')} style={{ '--c': PALETTE[i % PALETTE.length], animationDelay: i * 0.07 + 's' }} onClick={() => setOpen(i)} onMouseEnter={() => setOpen(i)}>
          <span className="layer-ic">{ic}</span>
          <span className="layer-main"><b>{t}</b>{open === i && <span className="layer-d">{d}</span>}</span>
        </button>
      ))}
    </div>
  );
}

// ───────── Ask: পড়া থামিয়ে একটু ভাবো
export function Ask({ q, options, answer, why }) {
  const [pick, setPick] = useState(null);
  const ok = pick === answer;
  return (
    <div className={'ask' + (pick != null ? (ok ? ' ok' : ' no') : '')}>
      <div className="ask-h">✋ থামো — আগে নিজে ভাবো</div>
      <div className="ask-q">{q}</div>
      <div className="ask-opts">
        {options.map((o, i) => (
          <button key={i} disabled={pick != null && ok} className={'ask-opt' + (pick != null && i === answer && (ok || pick === i) ? ' right' : '') + (pick === i && !ok ? ' wrong' : '')} onClick={() => setPick(i)}>{o}</button>
        ))}
      </div>
      {pick != null && (
        <div className="ask-why" key={pick}>{ok ? <>🎉 ঠিক! {why}</> : <>🤔 আরেকবার ভাবো — অন্য একটা বেছে দেখো।</>}</div>
      )}
    </div>
  );
}

// ───────── Recap: mind map + flashcard
export function MindMap({ lesson, onJump }) {
  const n = lesson.steps.length;
  const pos = lesson.steps.map((_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [50 + Math.cos(a) * 32, 50 + Math.sin(a) * 36];
  });
  return (
    <div className="mm stage">
      <svg className="mm-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {pos.map(([x, y], i) => <line key={i} x1="50" y1="50" x2={x} y2={y} style={{ animationDelay: i * 0.1 + 's' }} />)}
      </svg>
      <div className="mm-center"><span>{lesson.icon}</span><b>{lesson.title}</b></div>
      {lesson.steps.map((s, i) => (
        <button key={i} className="mm-node" style={{ left: pos[i][0] + '%', top: pos[i][1] + '%', '--c': PALETTE[i % PALETTE.length], animationDelay: 0.15 + i * 0.1 + 's' }} onClick={() => onJump(i)}>
          <span className="mm-n">{toBn(i + 1)}</span>{s.title}
        </button>
      ))}
    </div>
  );
}

export function Flashcards({ terms }) {
  const [flip, setFlip] = useState({});
  const count = Object.values(flip).filter(Boolean).length;
  return (
    <>
      <div className="section-h" style={{ marginTop: 18 }}>🃏 Flashcard — আগে নিজে মনে মনে উত্তর বলো, তারপর card উল্টাও ({toBn(count)}/{toBn(terms.length)})</div>
      <div className="flash-grid">
        {terms.map(([t, d], i) => (
          <button key={t} className={'flash' + (flip[i] ? ' flipped' : '')} onClick={() => setFlip({ ...flip, [i]: !flip[i] })}>
            <span className="flash-in">
              <span className="flash-f"><b>{t}</b><small>এটা কী? 🤔</small></span>
              <span className="flash-b">{d}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

export function useGlossary(terms) {
  return useMemo(() => buildGlossary(terms), [terms]);
}
