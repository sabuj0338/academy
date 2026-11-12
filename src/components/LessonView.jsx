import React, { Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { phaseOf, trackOf, lessonById, toBn } from '../data/curriculum.js';
import { labRegistry } from '../labs/index.js';
import { Code } from './ui.jsx';
import Quiz from './Quiz.jsx';
import CheatCard from './CheatCard.jsx';
import { Rich, Journey, Maps, Points, Seq, Anatomy, Bars, Layers, Ask, MindMap, Flashcards, useGlossary } from './blocks.jsx';

const TABS = [
  { id: 'learn', label: '📖 পাঠ' },
  { id: 'lab', label: '🧪 ল্যাব' },
  { id: 'quiz', label: '❓ কুইজ' },
  { id: 'cheat', label: '📌 চিটশিট' },
];

function Compare({ a, b }) {
  return (
    <div className="compare">
      {[a, b].map((s, k) => (
        <div key={k} className="compare-col fade-in" style={{ '--c': s.color || (k ? 'var(--green)' : 'var(--amber)'), animationDelay: k * 0.12 + 's' }}>
          <div className="compare-h">{s.title}</div>
          {s.items.map((it) => <div key={it} className="compare-li">{it}</div>)}
        </div>
      ))}
      <div className="compare-vs">VS</div>
    </div>
  );
}

// URL: #/lesson/<id>/<ধাপ নম্বর | recap | lab | quiz | cheat> — ধাপ share ও back-button এর জন্য
const hashLesson = () => window.location.hash.split('/')[2];
function readHash(lesson) {
  const seg = window.location.hash.split('/')[3];
  if (['lab', 'quiz', 'cheat'].includes(seg)) return { tab: seg, step: 0 };
  if (seg === 'recap') return { tab: 'learn', step: lesson.steps.length };
  const n = parseInt(seg, 10);
  return { tab: 'learn', step: n >= 1 && n <= lesson.steps.length ? n - 1 : 0 };
}

export default function LessonView({ lesson, progress, update, next, prev, go, total }) {
  const init = useRef(null);
  if (!init.current || init.current.id !== lesson.id) init.current = { id: lesson.id, ...readHash(lesson) };
  const [tab, setTab] = useState(init.current.tab);
  const [step, setStepRaw] = useState(init.current.step);
  const [dir, setDir] = useState(1);
  const [labIdx, setLabIdx] = useState(0);
  const P = progress[lesson.id] || {};
  const phase = phaseOf(lesson);
  const T = trackOf(lesson.track);
  const related = (lesson.related || []).map(lessonById).filter(Boolean);
  const gloss = useGlossary(lesson.terms);
  const N = lesson.steps.length;
  const isRecap = step >= N;

  const setStep = (s) => { setDir(s >= step ? 1 : -1); setStepRaw(Math.max(0, Math.min(N, s))); };

  useEffect(() => { setTab(init.current.tab); setStepRaw(init.current.step); setLabIdx(0); }, [lesson.id]);
  useEffect(() => {
    const seen = Math.min(step, N - 1);
    if (tab === 'learn' && (P.step ?? -1) < seen) update(lesson.id, { step: seen });
  }, [step, tab]); // eslint-disable-line
  useEffect(() => {
    const seg = tab !== 'learn' ? tab : isRecap ? 'recap' : step ? String(step + 1) : '';
    const h = '#/lesson/' + lesson.id + (seg ? '/' + seg : '');
    if (hashLesson() === lesson.id && window.location.hash !== h) window.history.replaceState(null, '', h);
  }, [tab, step, lesson.id]); // eslint-disable-line
  useEffect(() => {
    const f = () => { if (hashLesson() !== lesson.id) return; const r = readHash(lesson); setTab(r.tab); setStepRaw(r.step); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, [lesson]);
  useEffect(() => {
    if (tab !== 'learn') return undefined;
    const f = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') setStep(step + 1);
      if (e.key === 'ArrowLeft') setStep(step - 1);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [tab, step, N]); // eslint-disable-line

  const S = lesson.steps[Math.min(step, N - 1)];
  const lab = lesson.labs[labIdx];
  const Lab = labRegistry[lab.type];
  const labsDone = P.labs || [];
  const stepsDone = (P.step ?? -1) + 1 >= N;
  const tabDone = { learn: stepsDone, lab: labsDone.length >= lesson.labs.length, quiz: (P.quiz ?? -1) >= Math.ceil(lesson.quiz.length * 0.6), cheat: stepsDone };
  const duel = S.code?.length === 2 && S.code[0].kind === 'bad' && S.code[1].kind === 'good';

  const Related = related.length > 0 && (
    <div className="related">
      <span className="muted" style={{ fontSize: 13 }}>🔗 অন্য track-এ সম্পর্কিত:</span>
      {related.map((r) => (
        <button key={r.id} className="st-chip" style={{ '--c': trackOf(r.track).color }} onClick={() => go('lesson/' + r.id)}>{trackOf(r.track).icon} {r.title}</button>
      ))}
    </div>
  );

  return (
    <div className="container lesson" style={{ '--tc': T.color }}>
      <div className="lesson-head fade-in" key={lesson.id}>
        <div className="ic" style={{ borderColor: phase.color }}>{lesson.icon}</div>
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge" style={{ color: T.color, borderColor: T.color, cursor: 'pointer' }} onClick={() => go('track/' + T.id)}>{T.icon} {T.bn}</span>
            <span className="badge" style={{ color: phase.color, borderColor: phase.color }}>Phase {toBn(lesson.phase)} · Lesson {toBn(lesson.no)}</span>
            <span className="badge">⏱ {lesson.duration}</span>
          </div>
          <h2>{lesson.title}</h2>
          <div className="muted">{lesson.subtitle}</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {tab === t.id && <motion.span layoutId="tabpill" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            {t.label} {tabDone[t.id] && <span style={{ color: 'var(--green)' }}>✓</span>}
          </button>
        ))}
      </div>

      {tab === 'learn' && (
        <div key="learn" className="fade-in">
          {step === 0 && lesson.simple && (
            <div className="simple-box fade-in">
              <div className="simple-ic">🧒</div>
              <div><div className="simple-h">সহজ কথায় (১৪ বছরের বন্ধুকে যেভাবে বলবে)</div><div>{lesson.simple}</div></div>
            </div>
          )}
          {step === 0 && lesson.goals && (
            <div className="card goals">
              <div className="section-h">🎯 এই lesson শেষে তুমি বুঝবে</div>
              <div className="goal-grid">{lesson.goals.map((g) => <div key={g} className="goal">✦ {g}</div>)}</div>
              {lesson.terms && (
                <>
                  <div className="section-h" style={{ marginTop: 14 }}>🔤 মূল শব্দগুলো (hover/tap করো) — পাঠের ভেতরেও এগুলো <span className="gloss">এভাবে দাগানো</span> থাকবে</div>
                  <div className="terms">{lesson.terms.map(([t, d]) => <span key={t} className="term" tabIndex={0}>{t}<span className="term-tip">{d}</span></span>)}</div>
                </>
              )}
            </div>
          )}

          <div className="jnav">
            {lesson.steps.map((s, i) => (
              <React.Fragment key={i}>
                <button title={s.title} className={'jnav-dot' + (i === step ? ' on' : i < step ? ' done' : '')} onClick={() => setStep(i)}>{i < step ? '✓' : toBn(i + 1)}</button>
                <span className={'jnav-line' + (i < step ? ' done' : '')} />
              </React.Fragment>
            ))}
            <button title="ঝালাই — পুরো lesson এক নজরে" className={'jnav-dot' + (isRecap ? ' on' : '')} onClick={() => setStep(N)}>🧠</button>
          </div>
          <div className="jnav-hint"><span>{isRecap ? 'ঝালাই' : `ধাপ ${toBn(step + 1)} / ${toBn(N)}`}</span><span><kbd>←</kbd> <kbd>→</kbd> দিয়েও ধাপ বদলাতে পারো</span></div>

          {!isRecap ? (
            <div key={step} className={'card step-card' + (dir < 0 ? ' back' : '')}>
              <div className="step-wm">{toBn(String(step + 1).padStart(2, '0'))}</div>
              <div className="step-kicker">ধাপ {toBn(step + 1)}</div>
              <h3>{S.title}</h3>
              {S.body && <p><Rich text={S.body} gloss={gloss} /></p>}
              {S.analogy && (
                <div className="analogy">
                  <span className="analogy-ic">🍎</span>
                  <div className="analogy-h">উপমা দিয়ে বোঝো</div>
                  <div>{S.analogy}</div>
                  {S.maps && <Maps pairs={S.maps} />}
                </div>
              )}
              {!S.analogy && S.maps && <div className="analogy"><span className="analogy-ic">🍎</span><div className="analogy-h">মিলিয়ে নাও</div><Maps pairs={S.maps} /></div>}
              {S.seq && <Seq {...S.seq} />}
              {S.anatomy && <Anatomy {...S.anatomy} />}
              {S.layers && <Layers {...S.layers} />}
              {S.chain && <Journey items={S.chain} color={T.color} />}
              {S.bars && <Bars {...S.bars} />}
              {S.compare && <Compare a={S.compare[0]} b={S.compare[1]} />}
              {S.points && <Points points={S.points} gloss={gloss} />}
              {S.code && <div className={duel ? 'duel' : 'stack'} style={{ marginBottom: 12 }}>{S.code.map((c, i) => <Code key={i} {...c} />)}</div>}
              {S.warn && <div className="warn-box">⚠️ {S.warn}</div>}
              {S.tip && <div className="tip">💡 {S.tip}</div>}
              {S.ask && <Ask {...S.ask} />}
            </div>
          ) : (
            <div key="recap" className="card step-card recap">
              <div className="step-kicker">ঝালাই</div>
              <h3>🧠 পুরো lesson এক নজরে</h3>
              <div className="muted">যে ধাপটা ঝাপসা লাগছে, সেটায় ক্লিক করে আবার দেখে নাও।</div>
              <MindMap lesson={lesson} onJump={setStep} />
              {lesson.terms && <Flashcards terms={lesson.terms} />}
              {lesson.cheat?.remember && <div className="remember" style={{ marginTop: 16 }}>💭 <b>একটা কথাই মনে রাখো:</b> {lesson.cheat.remember}</div>}
            </div>
          )}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
            <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← আগের ধাপ</button>
            {step < N - 1
              ? <button className="btn primary" onClick={() => setStep(step + 1)}>পরের ধাপ: {lesson.steps[step + 1].title.slice(0, 30)}{lesson.steps[step + 1].title.length > 30 ? '…' : ''} →</button>
              : !isRecap
                ? <button className="btn primary" onClick={() => setStep(N)}>🧠 ঝালাই করে নাও →</button>
                : <button className="btn primary" onClick={() => setTab('lab')}>🧪 এবার ল্যাবে হাতে-কলমে →</button>}
          </div>
          {isRecap && Related}
        </div>
      )}

      {tab === 'lab' && (
        <div key="lab" className="fade-in">
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
        </div>
      )}

      {tab === 'quiz' && (
        <div key="quiz" className="fade-in">
          <Quiz key={lesson.id} quiz={lesson.quiz} best={P.quiz} onDone={(score) => { update(lesson.id, { quiz: Math.max(score, P.quiz ?? 0) }, score === lesson.quiz.length ? '🏆 নিখুঁত স্কোর!' : null); }} />
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn primary" onClick={() => setTab('cheat')}>📌 চিটশিট দেখো →</button></div>
        </div>
      )}

      {tab === 'cheat' && (
        <div key="cheat" className="fade-in">
          <CheatCard lesson={lesson} total={total} />
          {Related}
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
            <button className="btn" onClick={() => go('handbook/' + lesson.track)}>📚 {T.bn} Handbook</button>
            <div className="row">
              {prev && <button className="btn" onClick={() => go('lesson/' + prev.id)}>← {prev.title.slice(0, 22)}…</button>}
              {next && <button className="btn primary" onClick={() => go('lesson/' + next.id)}>পরের lesson: {next.title.slice(0, 26)}{next.title.length > 26 ? '…' : ''} →</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
