import React, { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { phaseOf, trackOf, lessonById, toBn } from '../data/curriculum.js';
import { labRegistry } from '../labs/index.js';
import { Code } from './ui.jsx';
import Quiz from './Quiz.jsx';
import CheatCard from './CheatCard.jsx';

const TABS = [
  { id: 'learn', label: '📖 পাঠ' },
  { id: 'lab', label: '🧪 ল্যাব' },
  { id: 'quiz', label: '❓ কুইজ' },
  { id: 'cheat', label: '📌 চিটশিট' },
];

// ধাপের ভেতরের ছোট animated chain: [['🧑','তুমি'], ['📡','Router'], …]
function Chain({ items, color }) {
  return (
    <div className="chain">
      {items.map(([ic, t, sub], i) => (
        <React.Fragment key={i}>
          <motion.div className="chain-node" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }}>
            <div className="chain-ic">{ic}</div>
            <div className="chain-t">{t}</div>
            {sub && <div className="chain-sub">{sub}</div>}
          </motion.div>
          {i < items.length - 1 && (
            <div className="chain-link">
              <motion.span className="chain-dot" style={{ background: color }} animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.35, ease: 'easeInOut' }} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Compare({ a, b }) {
  return (
    <div className="compare">
      {[a, b].map((s, k) => (
        <motion.div key={k} className="compare-col" style={{ '--c': s.color || (k ? 'var(--green)' : 'var(--amber)') }} initial={{ opacity: 0, x: k ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="compare-h">{s.title}</div>
          {s.items.map((it) => <div key={it} className="compare-li">{it}</div>)}
        </motion.div>
      ))}
      <div className="compare-vs">VS</div>
    </div>
  );
}

export default function LessonView({ lesson, progress, update, next, prev, go, total }) {
  const [tab, setTab] = useState('learn');
  const [step, setStep] = useState(0);
  const [labIdx, setLabIdx] = useState(0);
  const P = progress[lesson.id] || {};
  const phase = phaseOf(lesson);
  const T = trackOf(lesson.track);
  const related = (lesson.related || []).map(lessonById).filter(Boolean);

  useEffect(() => { setTab('learn'); setStep(0); setLabIdx(0); }, [lesson.id]);
  useEffect(() => {
    if (tab === 'learn' && (P.step ?? -1) < step) update(lesson.id, { step });
  }, [step, tab]); // eslint-disable-line

  const S = lesson.steps[step];
  const lab = lesson.labs[labIdx];
  const Lab = labRegistry[lab.type];
  const labsDone = P.labs || [];
  const stepsDone = (P.step ?? -1) + 1 >= lesson.steps.length;

  const tabDone = { learn: stepsDone, lab: labsDone.length >= lesson.labs.length, quiz: (P.quiz ?? -1) >= Math.ceil(lesson.quiz.length * 0.6), cheat: stepsDone };

  const Related = related.length > 0 && (
    <div className="related">
      <span className="muted" style={{ fontSize: 13 }}>🔗 অন্য track-এ সম্পর্কিত:</span>
      {related.map((r) => (
        <button key={r.id} className="st-chip" style={{ '--c': trackOf(r.track).color }} onClick={() => go('lesson/' + r.id)}>{trackOf(r.track).icon} {r.title}</button>
      ))}
    </div>
  );

  return (
    <div className="container">
      <motion.div className="lesson-head" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={lesson.id}>
        <div className="ic" style={{ borderColor: phase.color }}>{lesson.icon}</div>
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge" style={{ color: T.color, borderColor: T.color }} onClick={() => go('track/' + T.id)}>{T.icon} {T.bn}</span>
            <span className="badge" style={{ color: phase.color, borderColor: phase.color }}>Phase {toBn(lesson.phase)} · Lesson {toBn(lesson.no)}</span>
            <span className="badge">⏱ {lesson.duration}</span>
          </div>
          <h2>{lesson.title}</h2>
          <div className="muted">{lesson.subtitle}</div>
        </div>
      </motion.div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {tab === t.id && <motion.span layoutId="tabpill" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            {t.label} {tabDone[t.id] && <span style={{ color: 'var(--green)' }}>✓</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'learn' && (
          <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {step === 0 && lesson.simple && (
              <motion.div className="simple-box" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="simple-ic">🧒</div>
                <div><div className="simple-h">সহজ কথায় (১৪ বছরের বন্ধুকে যেভাবে বলবে)</div><div>{lesson.simple}</div></div>
              </motion.div>
            )}
            {step === 0 && lesson.goals && (
              <div className="card goals">
                <div className="section-h">🎯 এই lesson শেষে তুমি বুঝবে</div>
                <div className="goal-grid">{lesson.goals.map((g) => <div key={g} className="goal">✦ {g}</div>)}</div>
                {lesson.terms && (
                  <>
                    <div className="section-h" style={{ marginTop: 14 }}>🔤 মূল শব্দগুলো (hover/tap করো)</div>
                    <div className="terms">{lesson.terms.map(([t, d]) => <span key={t} className="term" tabIndex={0}>{t}<span className="term-tip">{d}</span></span>)}</div>
                  </>
                )}
              </div>
            )}
            <div className="stepper">
              {lesson.steps.map((s, i) => <button key={i} title={s.title} className={i <= step ? 'done' : ''} onClick={() => setStep(i)} />)}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} className="card step-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div className="muted" style={{ fontSize: 13 }}>ধাপ {toBn(step + 1)} / {toBn(lesson.steps.length)}</div>
                <h3>{S.title}</h3>
                {S.body && <p>{S.body}</p>}
                {S.analogy && (
                  <motion.div className="analogy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <span className="analogy-ic">🍎</span><div><b>উপমা দিয়ে বোঝো: </b>{S.analogy}</div>
                  </motion.div>
                )}
                {S.chain && <Chain items={S.chain} color={T.color} />}
                {S.compare && <Compare a={S.compare[0]} b={S.compare[1]} />}
                {S.points && <ul>{S.points.map((p, i) => <motion.li key={p} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>{p}</motion.li>)}</ul>}
                {S.code && <div className="stack" style={{ marginBottom: 12 }}>{S.code.map((c, i) => <Code key={i} {...c} />)}</div>}
                {S.warn && <div className="warn-box">⚠️ {S.warn}</div>}
                {S.tip && <div className="tip">💡 {S.tip}</div>}
              </motion.div>
            </AnimatePresence>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
              <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← আগের ধাপ</button>
              {step < lesson.steps.length - 1
                ? <button className="btn primary" onClick={() => setStep(step + 1)}>পরের ধাপ →</button>
                : <button className="btn primary" onClick={() => setTab('lab')}>🧪 এবার ল্যাবে হাতে-কলমে →</button>}
            </div>
            {step === lesson.steps.length - 1 && Related}
          </motion.div>
        )}

        {tab === 'lab' && (
          <motion.div key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {lesson.labs.length > 1 && (
              <div className="row" style={{ marginBottom: 12, gap: 6 }}>
                {lesson.labs.map((l, i) => (
                  <button key={i} className={'btn sm ' + (labIdx === i ? 'primary' : '')} onClick={() => setLabIdx(i)}>Lab {toBn(i + 1)}: {l.title} {labsDone.includes(i) && '✓'}</button>
                ))}
              </div>
            )}
            <div className="lab-shell">
              <div className="lab-top">
                <div className="lab-dots"><span style={{ background: '#f87171' }} /><span style={{ background: '#fbbf24' }} /><span style={{ background: '#4ade80' }} /></div>
                <b>{lab.title}</b>
                <span className="badge" style={{ marginLeft: 'auto' }}>{labsDone.includes(labIdx) ? '✅ সম্পূর্ণ' : '🔬 চলমান'}</span>
              </div>
              <div className="lab-intro">{lab.intro}</div>
              <div className="lab-body">
                <Suspense fallback={<div className="muted" style={{ padding: 40, textAlign: 'center' }}>⏳ ল্যাব লোড হচ্ছে…</div>}>
                  <Lab key={lesson.id + labIdx} {...lab} onComplete={() => update(lesson.id, { labs: [...new Set([...(progress[lesson.id]?.labs || []), labIdx])] }, `🧪 "${lab.title}" সম্পূর্ণ!`)} />
                </Suspense>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
              {labIdx < lesson.labs.length - 1
                ? <button className="btn primary" onClick={() => setLabIdx(labIdx + 1)}>পরের ল্যাব →</button>
                : <button className="btn primary" onClick={() => setTab('quiz')}>❓ কুইজে যাও →</button>}
            </div>
          </motion.div>
        )}

        {tab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Quiz key={lesson.id} quiz={lesson.quiz} best={P.quiz} onDone={(score) => { update(lesson.id, { quiz: Math.max(score, P.quiz ?? 0) }, score === lesson.quiz.length ? '🏆 নিখুঁত স্কোর!' : null); }} />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn primary" onClick={() => setTab('cheat')}>📌 চিটশিট দেখো →</button></div>
          </motion.div>
        )}

        {tab === 'cheat' && (
          <motion.div key="cheat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CheatCard lesson={lesson} total={total} />
            {Related}
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
              <button className="btn" onClick={() => go('handbook/' + lesson.track)}>📚 {T.bn} Handbook</button>
              <div className="row">
                {prev && <button className="btn" onClick={() => go('lesson/' + prev.id)}>← {prev.title.slice(0, 22)}…</button>}
                {next && <button className="btn primary" onClick={() => go('lesson/' + next.id)}>পরের lesson: {next.title.slice(0, 26)}{next.title.length > 26 ? '…' : ''} →</button>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
