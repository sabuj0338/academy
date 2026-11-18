import React, { Suspense, useEffect, useRef, useState } from 'react';
import { trackOf, lessonById, unitsOf, unitOf, lessonsOf, toBn } from '../data/curriculum.js';
import { labRegistry } from '../labs/index.js';
import { isDone, statusOf, setLastLesson, useProgress, updateLesson, bumpStep } from '../lib/progress.js';
import { href } from '../lib/nav.js';
import { Code } from './ui.jsx';
import Quiz from './Quiz.jsx';
import CheatCard from './CheatCard.jsx';
import { LevelTag } from './CourseCard.jsx';
import { Rich, Journey, Maps, Points, Seq, Anatomy, Bars, Layers, Ask, MindMap, Flashcards, useGlossary } from './blocks.jsx';

const TABS = [
  { id: 'learn', ic: '📖', label: 'পাঠ' },
  { id: 'lab', ic: '🧪', label: 'ল্যাব' },
  { id: 'quiz', ic: '❓', label: 'কুইজ' },
  { id: 'cheat', ic: '📌', label: 'চিটশিট' },
];

function Compare({ a, b }) {
  return (
    <div className="compare">
      {[a, b].map((s, k) => (
        <div key={k} className="compare-col rise" style={{ '--c': s.color || (k ? '#22c55e' : '#f59e0b'), animationDelay: k * 0.12 + 's' }}>
          <div className="compare-h">{s.title}</div>
          {s.items.map((it) => <div key={it} className="compare-li">{it}</div>)}
        </div>
      ))}
      <div className="compare-vs">VS</div>
    </div>
  );
}

// বাম পাশের course outline — কোর্সের সব unit ও lesson, কোনটা শেষ, কোনটায় আছো
function Outline({ lesson, progress, open, onClose }) {
  const T = trackOf(lesson.track);
  const ls = lessonsOf(lesson.track);
  const done = ls.filter((l) => isDone(l, progress)).length;
  const cur = useRef(null);
  useEffect(() => { cur.current?.scrollIntoView({ block: 'nearest' }); }, [lesson.id]);
  let n = 0;
  return (
    <>
      {open && <div className="fixed inset-0 z-[70] bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={'fixed inset-y-0 left-0 z-[71] w-[300px] max-w-[85vw] overflow-y-auto border-r border-line bg-panel px-3 pb-10 pt-4 transition-transform duration-300 ' +
        'lg:sticky lg:top-[62px] lg:z-auto lg:h-[calc(100vh-62px)] lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-transparent ' + (open ? 'translate-x-0 shadow-pop' : '-translate-x-full')}>
        <a href={href.course(T.id)} className="mb-3 flex items-center gap-3 rounded-xl p-1.5 hover:bg-bg2">
          <span className="grid size-10 flex-none place-items-center rounded-xl text-xl" style={{ background: T.grad }}>{T.icon}</span>
          <span className="leading-snug"><b className="block">{T.bn}</b><small className="text-[12.5px] text-muted">{toBn(done)}/{toBn(ls.length)} lesson সম্পূর্ণ</small></span>
        </a>
        <div className="mx-1.5 mb-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full" style={{ width: (done / ls.length) * 100 + '%', background: T.grad }} /></div>
        {unitsOf(T.id).map((u, ui) => (
          <div key={ui} className="mb-2">
            <div className="px-2 pb-1 pt-3 text-[11.5px] font-bold uppercase tracking-wide text-dim">Unit {toBn(ui + 1)} · {u.title}</div>
            {u.lessons.map((l) => {
              n++;
              const s = statusOf(l, progress);
              const on = l.id === lesson.id;
              return (
                <a key={l.id} ref={on ? cur : null} href={href.lesson(l.id)} onClick={onClose}
                  className={'flex items-start gap-2.5 rounded-[10px] px-2 py-1.5 text-[14px] leading-snug ' + (on ? 'bg-tc/12 font-semibold text-ink' : 'text-muted hover:bg-bg2 hover:text-ink')}>
                  <span className={'mt-px grid size-[22px] flex-none place-items-center rounded-full text-[11.5px] font-bold ' +
                    (s === 'done' ? 'bg-ok text-white' : on ? 'bg-tc text-[#06101f]' : s === 'started' ? 'border-2 border-tc text-tc-ink' : 'border border-line2')}>
                    {s === 'done' ? '✓' : toBn(n)}
                  </span>
                  <span>{l.title}</span>
                </a>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
}

// URL: /learn/<id>/#<ধাপ নম্বর | recap | lab | quiz | cheat> — ধাপ share ও back-button এর জন্য
function readHash(lesson) {
  const seg = window.location.hash.slice(1);
  if (['lab', 'quiz', 'cheat'].includes(seg)) return { tab: seg, step: 0 };
  if (seg === 'recap') return { tab: 'learn', step: lesson.steps.length };
  const n = parseInt(seg, 10);
  return { tab: 'learn', step: n >= 1 && n <= lesson.steps.length ? n - 1 : 0 };
}

export default function LessonView({ lessonId }) {
  const lesson = lessonById(lessonId);
  const progress = useProgress();
  const lt = lessonsOf(lesson.track);
  const li = lt.indexOf(lesson);
  const prev = lt[li - 1];
  const next = lt[li + 1];
  const total = lt.length;
  const [toast, setToast] = useState(null);
  const update = (id, patch, msg) => {
    updateLesson(id, patch);
    if (msg) { setToast(msg); setTimeout(() => setToast(null), 2600); }
  };
  // build-এর HTML সবসময় ধাপ ১ দেখায়; browser-এ এসে URL-এর #hash পড়ে ঠিক ধাপে যায়
  const [ready, setReady] = useState(false);
  const [tab, setTabRaw] = useState('learn');
  const [step, setStepRaw] = useState(0);
  const [dir, setDir] = useState(1);
  const [labIdx, setLabIdx] = useState(0);
  const [outline, setOutline] = useState(false);
  const top = useRef(null);
  const P = progress[lesson.id] || {};
  const T = trackOf(lesson.track);
  const unit = unitOf(lesson);
  const unitNo = unitsOf(lesson.track).indexOf(unit) + 1;
  const lessonNo = lessonsOf(lesson.track).indexOf(lesson) + 1;
  const related = (lesson.related || []).map(lessonById).filter(Boolean);
  const gloss = useGlossary(lesson.terms);
  const N = lesson.steps.length;
  const isRecap = step >= N;

  // নতুন ধাপ/tab-এ গেলে, উপরের অংশ পর্দার বাইরে থাকলে সেখানে scroll করো
  const toTop = () => requestAnimationFrame(() => {
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 64) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
  });
  const setStep = (s) => { setDir(s >= step ? 1 : -1); setStepRaw(Math.max(0, Math.min(N, s))); toTop(); };
  const setTab = (t) => { setTabRaw(t); toTop(); };

  useEffect(() => {
    const r = readHash(lesson);
    setTabRaw(r.tab); setStepRaw(r.step); setReady(true);
    setLastLesson(lesson.id);
  }, [lesson.id]); // eslint-disable-line
  useEffect(() => {
    if (ready && tab === 'learn') bumpStep(lesson.id, Math.min(step, N - 1));
  }, [ready, step, tab]); // eslint-disable-line
  useEffect(() => {
    if (!ready) return;
    const seg = tab !== 'learn' ? tab : isRecap ? 'recap' : step ? String(step + 1) : '';
    const want = seg ? '#' + seg : '';
    if (window.location.hash !== want) window.history.replaceState(null, '', want || window.location.pathname);
  }, [ready, tab, step]); // eslint-disable-line
  useEffect(() => {
    const f = () => { const r = readHash(lesson); setTabRaw(r.tab); setStepRaw(r.step); };
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
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line2 p-3">
      <span className="text-[13.5px] text-muted">🔗 অন্য কোর্সে এর সাথে সম্পর্কিত:</span>
      {related.map((r) => (
        <a key={r.id} style={{ '--c': trackOf(r.track).color }} href={href.lesson(r.id)} className="rounded-[10px] border border-c/40 bg-c/10 px-2.5 py-1 text-[14px] hover:bg-c/20">{trackOf(r.track).icon} {r.title}</a>
      ))}
    </div>
  );

  return (
    <div className="lesson mx-auto grid max-w-[1400px] lg:grid-cols-[290px_minmax(0,1fr)]" style={{ '--tc': T.color, '--g': T.grad }}>
      <Outline lesson={lesson} progress={progress} open={outline} onClose={() => setOutline(false)} />

      <div className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[860px]">
          <div className="animate-rise mb-5" key={lesson.id}>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
              <button className="btn sm lg:hidden" onClick={() => setOutline(true)}>☰ Syllabus</button>
              <a href={href.course(T.id)} className="font-semibold text-tc-ink hover:underline">{T.icon} {T.bn}</a><span>›</span><span>Unit {toBn(unitNo)}: {unit?.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-[60px] flex-none place-items-center rounded-[18px] border border-tc/35 bg-tc/10 text-[34px] md:size-[70px] md:text-[40px]">{lesson.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold tracking-wide text-tc-ink">LESSON {toBn(lessonNo)} / {toBn(total)}</div>
                <h1 className="text-[24px] font-bold leading-snug md:text-[30px]">{lesson.title}</h1>
                <div className="text-muted">{lesson.subtitle}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted">
              <LevelTag level={lesson.level} />
              <span>⏱ {lesson.duration}</span><span>📖 {toBn(N)} ধাপ</span><span>🧪 {toBn(lesson.labs.length)} lab</span><span>❓ {toBn(lesson.quiz.length)} প্রশ্ন</span>
            </div>
          </div>

          <div ref={top} className="sticky top-[62px] z-20 -mx-1 mb-5 flex gap-1 rounded-2xl border border-line bg-[var(--nav-bg)] p-1 backdrop-blur-xl">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[15px] font-medium transition ' + (tab === t.id ? 'bg-brandgrad text-white shadow-card' : 'text-muted hover:bg-bg2 hover:text-ink')}>
                <span>{t.ic}</span><span className={tab === t.id ? '' : 'hidden sm:inline'}>{t.label}</span>{tabDone[t.id] && <span className={tab === t.id ? 'text-white' : 'text-ok'}>✓</span>}
              </button>
            ))}
          </div>

        {tab === 'learn' && (
          <div key="learn" className="fade-in">
            {step === 0 && lesson.simple && (
              <div className="simple-box rise">
                <div className="simple-ic">🧒</div>
                <div><div className="simple-h">সহজ কথায়</div><div>{lesson.simple}</div></div>
              </div>
            )}
            {step === 0 && lesson.goals && (
              <div className="card goals">
                <div className="goals-h">🎯 এই lesson শেষে তুমি পারবে</div>
                <div className="goal-grid">{lesson.goals.map((g) => <div key={g} className="goal"><span className="goal-tick">✓</span>{g}</div>)}</div>
                {lesson.terms && (
                  <>
                    <div className="goals-h" style={{ marginTop: 16 }}>🔤 নতুন শব্দ — ছুঁয়ে দেখো <span className="muted" style={{ fontWeight: 400 }}>(পাঠের ভেতরেও এগুলো <span className="gloss">দাগানো</span> থাকবে)</span></div>
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
            <div className="jnav-hint"><span>{isRecap ? 'ঝালাই' : `ধাপ ${toBn(step + 1)} / ${toBn(N)} · ${S.title}`}</span><span className="kbd-hint"><kbd>←</kbd> <kbd>→</kbd> দিয়েও ধাপ বদলাতে পারো</span></div>

            {!isRecap ? (
              <article key={step} className={'step-card' + (dir < 0 ? ' back' : '')}>
                <div className="step-wm">{toBn(String(step + 1).padStart(2, '0'))}</div>
                <div className="step-kicker">ধাপ {toBn(step + 1)}</div>
                <h2>{S.title}</h2>
                {S.body && <p className="step-body"><Rich text={S.body} gloss={gloss} /></p>}
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
              </article>
            ) : (
              <article key="recap" className="step-card recap">
                <div className="step-kicker">ঝালাই</div>
                <h2>🧠 পুরো lesson এক নজরে</h2>
                <div className="muted">যে ধাপটা ঝাপসা লাগছে, সেটায় ক্লিক করে আবার দেখে নাও।</div>
                <MindMap lesson={lesson} onJump={setStep} />
                {lesson.terms && <Flashcards terms={lesson.terms} />}
                {lesson.cheat?.remember && <div className="remember" style={{ marginTop: 16 }}>💭 <b>একটা কথাই মনে রাখো:</b> {lesson.cheat.remember}</div>}
              </article>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← আগের</button>
              {step < N - 1
                ? <button className="btn primary" onClick={() => setStep(step + 1)}><span className="max-w-[46vw] truncate sm:max-w-[420px]">পরের ধাপ: {lesson.steps[step + 1].title}</span> →</button>
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
              <div className="mb-3 grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                {lesson.labs.map((l, i) => (
                  <button key={i} onClick={() => setLabIdx(i)}
                    className={'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[14.5px] transition ' + (labIdx === i ? 'border-tc bg-tc/10 font-semibold' : 'border-line bg-panel hover:border-line2')}>
                    <span className={'grid size-6 flex-none place-items-center rounded-full text-xs font-bold ' + (labsDone.includes(i) ? 'bg-ok text-white' : labIdx === i ? 'bg-tc text-[#06101f]' : 'bg-bg2 text-muted')}>{labsDone.includes(i) ? '✓' : toBn(i + 1)}</span>
                    <span>{l.title}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="lab-shell stage">
              <div className="lab-top">
                <div className="lab-dots"><span style={{ background: '#f87171' }} /><span style={{ background: '#fbbf24' }} /><span style={{ background: '#4ade80' }} /></div>
                <b>{lab.title}</b>
                <span className="badge" style={{ marginLeft: 'auto' }}>{labsDone.includes(labIdx) ? '✅ সম্পূর্ণ' : '🔬 চলমান'}</span>
              </div>
              <div className="lab-intro">💡 {lab.intro}</div>
              <div className="lab-body">
                <Suspense fallback={<div className="muted" style={{ padding: 40, textAlign: 'center' }}>⏳ ল্যাব লোড হচ্ছে…</div>}>
                  <Lab key={lesson.id + labIdx} {...lab} onComplete={() => update(lesson.id, { labs: [...new Set([...(progress[lesson.id]?.labs || []), labIdx])] }, `🧪 "${lab.title}" সম্পূর্ণ! +৩০ XP`)} />
                </Suspense>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span />
              {labIdx < lesson.labs.length - 1
                ? <button className="btn primary" onClick={() => setLabIdx(labIdx + 1)}>পরের ল্যাব →</button>
                : <button className="btn primary" onClick={() => setTab('quiz')}>❓ কুইজে যাও →</button>}
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div key="quiz" className="fade-in">
            <Quiz key={lesson.id} quiz={lesson.quiz} best={P.quiz} onDone={(score) => { update(lesson.id, { quiz: Math.max(score, P.quiz ?? 0) }, score === lesson.quiz.length ? '🏆 নিখুঁত স্কোর!' : null); }} />
            <div className="mt-4 flex items-center justify-between gap-3"><span /><button className="btn primary" onClick={() => setTab('cheat')}>📌 চিটশিট দেখো →</button></div>
          </div>
        )}

        {tab === 'cheat' && (
          <div key="cheat" className="fade-in">
            <CheatCard lesson={lesson} total={total} />
            {Related}
            {isDone(lesson, progress) && <div className="animate-rise mt-4 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-[16px]">🎉 <b>Lesson সম্পূর্ণ!</b> দারুণ কাজ — পরেরটায় চলো।</div>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {prev ? <a className="lift flex flex-col rounded-2xl border border-line bg-panel px-4 py-3" href={href.lesson(prev.id)}><small className="text-muted">← আগের lesson</small><b>{prev.icon} {prev.title}</b></a> : <span />}
              {next ? <a className="lift flex flex-col rounded-2xl border border-tc/50 bg-tc/8 px-4 py-3 sm:text-right" href={href.lesson(next.id)}><small className="text-muted">পরের lesson →</small><b>{next.icon} {next.title}</b></a>
                : <a className="lift flex flex-col rounded-2xl border border-tc/50 bg-tc/8 px-4 py-3 sm:text-right" href={href.course(T.id)}><small className="text-muted">কোর্সের শেষ lesson 🎓</small><b>কোর্সের পাতায় ফেরো</b></a>}
            </div>
          </div>
        )}
        </div>
      </div>
      {toast && <div className="toast pop-in">{toast}</div>}
    </div>
  );
}
