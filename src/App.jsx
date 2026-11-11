import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tracks, phasesOf, lessons, lessonsOf, lessonById, trackOf, scenarios, toBn } from './data/curriculum.js';
import LessonView from './components/LessonView.jsx';
import CheatCard, { cheatMarkdown } from './components/CheatCard.jsx';

const Hero3D = lazy(() => import('./components/Hero3D.jsx'));
const KEY = 'seclab-progress-v1';
const TKEY = 'academy-track';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export const isDone = (l, p) => {
  const x = p[l.id];
  if (!x) return false;
  return (x.step ?? -1) + 1 >= l.steps.length && (x.labs?.length || 0) >= l.labs.length && (x.quiz ?? -1) >= Math.ceil(l.quiz.length * 0.6);
};
const pct = (l, p) => {
  const x = p[l.id] || {};
  const total = l.steps.length + l.labs.length + 1;
  return ((x.step ?? -1) + 1 + (x.labs?.length || 0) + ((x.quiz ?? -1) >= Math.ceil(l.quiz.length * 0.6) ? 1 : 0)) / total;
};

function useRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, '');
  const [r, setR] = useState(get());
  useEffect(() => { const f = () => setR(get()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return [r, (to) => { window.location.hash = '/' + to; }];
}

export default function App() {
  const [route, go] = useRoute();
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState(null);
  const [menu, setMenu] = useState(false);
  const [navTrack, setNavTrack] = useState(() => { try { return localStorage.getItem(TKEY) || 'net'; } catch { return 'net'; } });

  const update = useCallback((id, patch, msg) => {
    setProgress((p) => {
      const n = { ...p, [id]: { ...(p[id] || {}), ...patch } };
      try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
    if (msg) { setToast(msg); setTimeout(() => setToast(null), 2600); }
  }, []);

  const lessonId = route.startsWith('lesson/') ? route.slice(7) : null;
  const lesson = lessonId ? lessonById(lessonId) : null;
  const routeTrack = route.startsWith('track/') ? route.slice(6) : lesson?.track;

  useEffect(() => { document.querySelector('.main')?.scrollTo(0, 0); setMenu(false); }, [route]);
  useEffect(() => {
    if (routeTrack && tracks.some((t) => t.id === routeTrack)) {
      setNavTrack(routeTrack);
      try { localStorage.setItem(TKEY, routeTrack); } catch {}
    }
  }, [routeTrack]);

  const T = trackOf(navTrack);
  const tl = lessonsOf(navTrack);
  const doneCount = tl.filter((l) => isDone(l, progress)).length;
  const lt = lesson ? lessonsOf(lesson.track) : [];
  const li = lesson ? lt.findIndex((l) => l.id === lesson.id) : -1;

  return (
    <div className="app" style={{ '--track': T.color }}>
      <button className="btn sm menu-btn" onClick={() => setMenu((m) => !m)}>☰ মেনু</button>
      <aside className={'sidebar' + (menu ? ' open' : '')}>
        <div className="brand" onClick={() => go('')}>
          <div className="brand-logo">🎓</div>
          <div><h1>Engineering Academy</h1><small>বাংলায় Networking · System Design · Security</small></div>
        </div>
        <div className="track-switch">
          {tracks.map((t) => (
            <button key={t.id} className={'track-tab' + (navTrack === t.id ? ' on' : '')} style={{ '--c': t.color }} onClick={() => go('track/' + t.id)}>
              {navTrack === t.id && <motion.span layoutId="trackpill" className="track-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="tt-ic">{t.icon}</span><span>{t.bn}</span>
            </button>
          ))}
        </div>
        <div className="progress-mini">
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span className="muted">{T.bn} অগ্রগতি</span><span>{toBn(doneCount)}/{toBn(tl.length)}</span>
          </div>
          <div className="bar"><motion.div animate={{ width: (doneCount / Math.max(tl.length, 1)) * 100 + '%' }} style={{ background: T.grad }} /></div>
        </div>
        <button className={'nav-item' + (route.startsWith('handbook') ? ' active' : '')} onClick={() => go('handbook/' + navTrack)}><span className="ic">📚</span>{T.bn} Handbook</button>
        {phasesOf(navTrack).map((ph) => (
          <div key={ph.id}>
            <div className="mod-title"><span className="mod-dot" style={{ background: ph.color }} />PHASE {toBn(String(ph.id).padStart(2, '0'))} · {ph.bn}</div>
            {tl.filter((l) => l.phase === ph.id).map((l) => (
              <button key={l.id} className={'nav-item' + (l.id === lessonId ? ' active' : '')} onClick={() => go('lesson/' + l.id)}>
                <span className="ic">{l.icon}</span>
                <span>{l.title}</span>
                {isDone(l, progress) ? <span className="check">✓</span> : pct(l, progress) > 0 ? <span className="check" style={{ color: 'var(--amber)' }}>◐</span> : null}
              </button>
            ))}
          </div>
        ))}
        <button className="nav-item" style={{ marginTop: 20, color: 'var(--dim)', fontSize: 13 }} onClick={() => { if (confirm('সব track-এর অগ্রগতি মুছে ফেলবে?')) { localStorage.removeItem(KEY); setProgress({}); } }}>↺ অগ্রগতি reset</button>
      </aside>

      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div key={route || 'home'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {lesson ? (
              <LessonView lesson={lesson} progress={progress} update={update} go={go} next={lt[li + 1]} prev={lt[li - 1]} total={lt.length} />
            ) : route.startsWith('handbook') ? (
              <HandbookPage initial={route.split('/')[1] || 'all'} go={go} />
            ) : route.startsWith('track/') ? (
              <TrackPage track={trackOf(route.slice(6))} progress={progress} go={go} />
            ) : (
              <Home progress={progress} go={go} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && <motion.div className="toast" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

const PHILOSOPHY = [['💡', 'Concept'], ['🎬', 'Visual Simulation'], ['🌍', 'Real-world Example'], ['🧪', 'Hands-on Practice'], ['📌', 'Cheatsheet'], ['🏆', 'Assessment']];
const WEEK = [['Day 1', 'net'], ['Day 2', 'sd'], ['Day 3', 'sec'], ['Day 4', 'net'], ['Day 5', 'sd'], ['Day 6', 'sec'], ['Day 7', null]];

function Home({ progress, go }) {
  const totalLabs = lessons.reduce((s, l) => s + l.labs.length, 0);
  const nextOf = (t) => lessonsOf(t).find((l) => !isDone(l, progress)) || lessonsOf(t)[0];
  // rotation: আজ কোন track? — যে track-এ সবচেয়ে কম lesson শেষ, recommended order অনুযায়ী
  const doneIn = (t) => lessonsOf(t).filter((l) => isDone(l, progress)).length;
  const today = ['net', 'sd', 'sec'].reduce((a, b) => (doneIn(b) < doneIn(a) ? b : a));
  const todayLesson = nextOf(today);
  const L = (id) => lessonById(id);

  return (
    <>
      <section className="hero">
        <Suspense fallback={null}><Hero3D /></Suspense>
        <div className="hero-text">
          <div className="badge" style={{ marginBottom: 10 }}>🎓 ৩টি Track · {toBn(lessons.length)}টি Lesson · {toBn(totalLabs)}টি Interactive Lab</div>
          <h2>Software Engineering <span className="grad">Masterclass</span></h2>
          <p>Request কীভাবে ভ্রমণ করে (Networking), app কীভাবে বড় হয় (System Design), আর কীভাবে আক্রমণ ঠেকাতে হয় (Security) — দেখে, ছুঁয়ে, নিজের হাতে চালিয়ে শেখো। ক্লাস ৯-এর একজন ছাত্রও যেন বুঝতে পারে, এমনভাবে।</p>
          <div className="row" style={{ marginTop: 16, pointerEvents: 'auto' }}>
            <button className="btn primary" onClick={() => go('lesson/' + todayLesson.id)}>▶ আজকের lesson: {todayLesson.title}</button>
            <button className="btn" onClick={() => go('handbook/all')}>📚 Handbooks</button>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="track-cards">
          {tracks.map((t, k) => {
            const ls = lessonsOf(t.id);
            const d = doneIn(t.id);
            return (
              <motion.div key={t.id} className="track-card" style={{ '--c': t.color, '--g': t.grad }} onClick={() => go('track/' + t.id)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * k }} whileHover={{ y: -6 }}>
                <div className="tc-glow" />
                <div className="tc-top"><span className="tc-ic">{t.icon}</span><span className="badge">Track {toBn('0' + (k + 1))}</span></div>
                <h3>{t.bn}</h3>
                <div className="tc-q">{t.q}</div>
                <p className="muted">{t.desc}</p>
                <div className="row" style={{ gap: 6 }}>
                  <span className="badge">{toBn(phasesOf(t.id).length)} phase</span>
                  <span className="badge">{toBn(ls.length)} lesson</span>
                  <span className="badge">🧪 {toBn(ls.reduce((s, l) => s + l.labs.length, 0))} lab</span>
                </div>
                <div className="bar" style={{ marginTop: 14 }}><div style={{ width: (d / ls.length) * 100 + '%', background: t.grad }} /></div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                  <span className="muted">{toBn(d)}/{toBn(ls.length)} সম্পূর্ণ</span>
                  <span style={{ color: t.color }}>শুরু করো →</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="card how" style={{ marginTop: 28 }}>
          <div className="section-h">🧭 Learning philosophy — প্রতিটি lesson একই ছন্দে</div>
          <div className="philo">
            {PHILOSOPHY.map(([i, t], k) => (
              <React.Fragment key={t}>
                <motion.div className="philo-step" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * k }}>
                  <div className="philo-ic">{i}</div><b>{t}</b>
                </motion.div>
                {k < PHILOSOPHY.length - 1 && <div className="philo-arrow"><motion.span animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: k * 0.15 }}>→</motion.span></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <section style={{ marginTop: 32 }}>
          <div className="section-title">🔗 একই feature, তিনটি দৃষ্টিকোণ</div>
          <p className="muted" style={{ marginTop: 0 }}>ধরো তুমি একটি SaaS platform বানাচ্ছ। প্রতিটি feature-কে Networking, System Design ও Security — তিন চোখে দেখো। যেকোনো chip-এ ক্লিক করলে সেই lesson খুলবে।</p>
          <div className="scenario-table">
            <div className="st-head"><span>Scenario</span>{tracks.map((t) => <span key={t.id} style={{ color: t.color }}>{t.icon} {t.bn}</span>)}</div>
            {scenarios.map((s, i) => (
              <motion.div key={s.name} className="st-row" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <span className="st-name">{s.icon} {s.name}</span>
                {['net', 'sd', 'sec'].map((t) => {
                  const [id, label] = s[t];
                  const l = L(id);
                  return (
                    <button key={t} className="st-chip" style={{ '--c': trackOf(t).color }} onClick={() => l && go('lesson/' + id)}>
                      {label} {l && isDone(l, progress) && <span style={{ color: 'var(--green)' }}>✓</span>}
                    </button>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid2" style={{ marginTop: 32 }}>
          <div className="card">
            <div className="section-h">🪜 Recommended learning sequence</div>
            {[['১', 'net', 'আগে network, IP, DNS, TCP, HTTP, TLS ভালোভাবে বোঝো।'], ['২', 'sd', 'তারপর architecture, database, caching, scaling, distributed systems।'], ['৩', 'sec', 'শেখা networking ও architecture দিয়ে attack surface ও defense বোঝো।'], ['৪', null, 'তিন track মিলিয়ে production-grade app design, deploy, secure ও scale।']].map(([n, t, d]) => (
              <div key={n} className="seq-row" onClick={() => t && go('track/' + t)} style={{ cursor: t ? 'pointer' : 'default' }}>
                <span className="seq-n" style={{ background: t ? trackOf(t).grad : 'linear-gradient(135deg,#16a34a,#0891b2)' }}>{n}</span>
                <div><b>{t ? trackOf(t).title : 'Advanced Integrated Projects'}</b><div className="muted" style={{ fontSize: 14 }}>{d}</div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-h">📅 সাপ্তাহিক rotation — প্রতিদিন একটি গভীর lesson</div>
            <div className="week">
              {WEEK.map(([d, t]) => (
                <div key={d} className="week-day" style={{ '--c': t ? trackOf(t).color : '#4ade80' }} onClick={() => go(t ? 'lesson/' + nextOf(t).id : 'handbook/all')}>
                  <span className="mono" style={{ fontSize: 11 }}>{d}</span>
                  <span style={{ fontSize: 22 }}>{t ? trackOf(t).icon : '🔁'}</span>
                  <span style={{ fontSize: 12.5 }}>{t ? trackOf(t).bn : 'Revision'}</span>
                </div>
              ))}
            </div>
            <div className="note" style={{ marginTop: 14 }}>👉 আজকের পরামর্শ: <b>{trackOf(today).bn}</b> — “{todayLesson.title}”। যে track-এ তুমি সবচেয়ে পিছিয়ে, সেটা আগে।</div>
          </div>
        </section>

        <div className="card ethics" style={{ marginTop: 36 }}>
          ⚖️ <b>নৈতিকতা:</b> এখানের সব আক্রমণ ও network simulation তোমার browser-এর ভেতরে চলে। বাস্তবে scanning বা attack কৌশল শুধু নিজের system, লিখিত অনুমতি আছে এমন target, অথবা legal practice lab-এ ব্যবহার করবে।
        </div>
      </div>
    </>
  );
}

function TrackPage({ track, progress, go }) {
  const ls = lessonsOf(track.id);
  const nextLesson = ls.find((l) => !isDone(l, progress)) || ls[0];
  const d = ls.filter((l) => isDone(l, progress)).length;
  return (
    <div className="container">
      <motion.div className="track-hero" style={{ '--c': track.color, '--g': track.grad }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="th-ic">{track.icon}</div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="mono" style={{ color: track.color, fontSize: 12, letterSpacing: '.12em' }}>{track.title.toUpperCase()}</div>
          <h2 style={{ margin: '2px 0' }}>{track.bn} — {track.q}</h2>
          <div className="muted">{track.desc}</div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => go('lesson/' + nextLesson.id)}>{d ? '▶ চালিয়ে যাও' : '▶ শুরু করো'}: {nextLesson.title}</button>
            <button className="btn" onClick={() => go('handbook/' + track.id)}>📚 {track.bn} Handbook</button>
            <span className="badge">{toBn(d)}/{toBn(ls.length)} সম্পূর্ণ</span>
          </div>
        </div>
      </motion.div>
      {phasesOf(track.id).map((ph) => {
        const pl = ls.filter((l) => l.phase === ph.id);
        return (
          <section key={ph.id} style={{ marginTop: 28 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div className="mono" style={{ color: ph.color, fontSize: 12, letterSpacing: '.1em' }}>PHASE {String(ph.id).padStart(2, '0')} · {ph.title.toUpperCase()}</div>
                <h3 style={{ margin: '2px 0 0', fontSize: 21 }}>{ph.bn}</h3>
                <div className="muted" style={{ fontSize: 14 }}>{ph.desc}</div>
              </div>
              <span className="badge">{toBn(pl.filter((l) => isDone(l, progress)).length)}/{toBn(pl.length)} সম্পূর্ণ</span>
            </div>
            <div className="lesson-grid">
              {pl.map((l, i) => {
                const p = pct(l, progress);
                return (
                  <motion.div key={l.id} className="card lesson-card" onClick={() => go('lesson/' + l.id)} whileHover={{ y: -4, borderColor: ph.color }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                    <div className="num">{l.no}</div>
                    <div className="ic">{l.icon}</div>
                    <h4>{l.title}</h4>
                    <p>{l.subtitle}</p>
                    <div className="row" style={{ gap: 6, marginTop: 10 }}>
                      <span className="badge" style={{ fontSize: 11.5 }}>⏱ {l.duration}</span>
                      <span className="badge" style={{ fontSize: 11.5 }}>🧪 {toBn(l.labs.length)} ল্যাব</span>
                    </div>
                    <div className="bar" style={{ marginTop: 12, height: 4 }}><div style={{ width: p * 100 + '%', background: isDone(l, progress) ? 'var(--green)' : ph.color }} /></div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function HandbookPage({ initial, go }) {
  const [q, setQ] = useState('');
  const [tr, setTr] = useState(tracks.some((t) => t.id === initial) ? initial : 'all');
  const [ph, setPh] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => setPh(0), [tr]);
  const pool = tr === 'all' ? lessons : lessonsOf(tr);
  const list = pool.filter((l) => (!ph || l.phase === ph) && (!q || (l.title + l.cheat.summary + l.cheat.rules.join(' ') + l.cheat.category).toLowerCase().includes(q.toLowerCase())));
  const name = tr === 'all' ? 'Engineering Handbook' : trackOf(tr).title + ' Handbook';
  const all = () => `# ${name}\n\n` + pool.map((l) => cheatMarkdown(l, lessonsOf(l.track).length)).join('\n---\n\n');
  const download = () => {
    const blob = new Blob([all()], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name.toLowerCase().replace(/[^a-z]+/g, '-') + '.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="container">
      <div className="lesson-head">
        <div className="ic">📚</div>
        <div><h2>{tr === 'all' ? 'Personal Knowledge Base' : trackOf(tr).bn + ' Handbook'}</h2><div className="muted">তিনটি আলাদা handbook, কিন্তু lesson-গুলো একে অপরের সাথে link করা — develop বা deploy-এর সময় দ্রুত দেখে নাও</div></div>
      </div>
      <div className="row no-print" style={{ marginBottom: 12 }}>
        <button className={'btn sm ' + (tr === 'all' ? 'primary' : '')} onClick={() => setTr('all')}>🎓 সব</button>
        {tracks.map((t) => <button key={t.id} className={'btn sm ' + (tr === t.id ? 'primary' : '')} onClick={() => setTr(t.id)}>{t.icon} {t.bn} Handbook</button>)}
      </div>
      <div className="row no-print" style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="🔍 খোঁজো: dns, cache, jwt…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tr !== 'all' && <>
          <button className={'btn sm ' + (!ph ? 'primary' : '')} onClick={() => setPh(0)}>সব phase</button>
          {phasesOf(tr).map((p) => <button key={p.id} className={'btn sm ' + (ph === p.id ? 'primary' : '')} onClick={() => setPh(p.id)} title={p.title}>P{p.id}</button>)}
        </>}
        <span style={{ flex: 1 }} />
        <button className="btn sm" onClick={() => navigator.clipboard?.writeText(all()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {})}>{copied ? '✓ Copied' : '📋 Markdown copy'}</button>
        <button className="btn sm" onClick={download}>⬇ .md</button>
        <button className="btn sm" onClick={() => window.print()}>🖨 Print / PDF</button>
      </div>
      <div className="cheat-grid">
        {list.map((l) => <CheatCard key={l.id} lesson={l} compact total={lessonsOf(l.track).length} onOpen={() => go('lesson/' + l.id)} />)}
      </div>
      {!list.length && <div className="muted">কিছু পাওয়া যায়নি।</div>}
    </div>
  );
}
