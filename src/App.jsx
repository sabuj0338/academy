import React, { useCallback, useEffect, useState } from 'react';
import { lessonById, lessonsOf, trackOf, tracks } from './data/curriculum.js';
import LessonView from './components/LessonView.jsx';
import TopNav from './components/TopNav.jsx';
import Home from './pages/Home.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CoursePage from './pages/CoursePage.jsx';
import HandbookPage from './pages/HandbookPage.jsx';
import { loadProgress, saveProgress, recordActivity } from './lib/progress.js';

// পুরনো export — কিছু component এখনো এখান থেকে নেয়
export { isDone } from './lib/progress.js';

function useRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, '');
  const [r, setR] = useState(get());
  useEffect(() => { const f = () => setR(get()); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return [r, (to) => { window.location.hash = '/' + to; }];
}

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('academy-theme') || 'system'; } catch { return 'system'; } });
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', theme);
    try { localStorage.setItem('academy-theme', theme); } catch { /* ignore */ }
  }, [theme]);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  return [isDark, () => setTheme(isDark ? 'light' : 'dark')];
}

export default function App() {
  const [route, go] = useRoute();
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState(null);
  const [isDark, toggleTheme] = useTheme();

  const update = useCallback((id, patch, msg) => {
    setProgress((p) => {
      const n = { ...p, [id]: { ...(p[id] || {}), ...patch } };
      saveProgress(n);
      return n;
    });
    recordActivity();
    if (msg) { setToast(msg); setTimeout(() => setToast(null), 2600); }
  }, []);

  const [head, a, b] = route.split('/');
  const lesson = head === 'lesson' && a ? lessonById(a) : null;
  const courseId = head === 'course' || head === 'track' ? a : lesson?.track;
  const pageKey = lesson ? 'lesson/' + lesson.id : head + '/' + (a || '');

  useEffect(() => { window.scrollTo(0, 0); }, [pageKey]);
  useEffect(() => {
    const T = lesson ? lesson.title + ' · ' : courseId && (head === 'course' || head === 'track') ? trackOf(courseId).bn + ' কোর্স · ' : '';
    document.title = T + 'Engineering Academy — বাংলায় দেখে-ছুঁয়ে শেখো';
  }, [pageKey]); // eslint-disable-line

  let page;
  if (lesson) {
    const lt = lessonsOf(lesson.track);
    const i = lt.findIndex((l) => l.id === lesson.id);
    page = <LessonView lesson={lesson} progress={progress} update={update} go={go} next={lt[i + 1]} prev={lt[i - 1]} total={lt.length} />;
  } else if ((head === 'course' || head === 'track') && tracks.some((t) => t.id === a)) {
    page = <CoursePage course={trackOf(a)} progress={progress} go={go} />;
  } else if (head === 'courses') {
    page = <CoursesPage progress={progress} go={go} />;
  } else if (head === 'handbook') {
    page = <HandbookPage initial={a || 'all'} go={go} />;
  } else {
    page = <Home progress={progress} go={go} />;
  }

  return (
    <div className="ui flex min-h-screen flex-col">
      <TopNav route={route} courseId={courseId} progress={progress} go={go} isDark={isDark} toggleTheme={toggleTheme} onReset={() => setProgress({})} />
      <main className="fade-in flex-1" key={pageKey} data-sub={b || ''}>{page}</main>
      {!lesson && (
        <footer className="no-print border-t border-line bg-panel">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 text-[14.5px] sm:px-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2.5 text-base"><span className="bg-brandgrad grid size-7 place-items-center rounded-[9px] text-[15px]">🎓</span><b>Engineering Academy</b></div>
              <p className="mt-2 text-muted">প্রযুক্তির কঠিন বিষয় — সহজ বাংলায়, চোখে দেখে আর নিজের হাতে চালিয়ে শেখার জায়গা। সব simulation তোমার browser-এর ভেতরেই চলে, কোনো account লাগে না।</p>
            </div>
            <div className="self-start rounded-2xl border border-warn/30 bg-warn/6 px-4 py-3.5">⚖️ <b>নৈতিকতা:</b> এখানের সব আক্রমণ কৌশল শেখানো হয় রক্ষা করার জন্য। বাস্তবে শুধু নিজের system বা লিখিত অনুমতি আছে এমন জায়গায় পরীক্ষা করবে।</div>
          </div>
        </footer>
      )}
      {toast && <div className="toast pop-in">{toast}</div>}
    </div>
  );
}
