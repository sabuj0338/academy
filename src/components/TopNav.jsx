import React, { useEffect, useRef, useState } from 'react';
import { tracks, lessonById, toBn } from '../data/curriculum.js';
import { xpOf, streakOf, lastLesson, resetAll } from '../lib/progress.js';

const link = 'rounded-[10px] px-3 py-1.5 text-[15px] font-medium text-muted hover:bg-bg2 hover:text-ink';

export default function TopNav({ route, courseId, progress, go, isDark, toggleTheme, onReset }) {
  const [menu, setMenu] = useState(false);
  const [dd, setDd] = useState(false);
  const ddRef = useRef(null);
  const xp = xpOf(progress);
  const streak = streakOf();
  const last = lastLesson() && lessonById(lastLesson());
  useEffect(() => { setMenu(false); setDd(false); }, [route]);
  useEffect(() => {
    const f = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDd(false); };
    document.addEventListener('pointerdown', f);
    return () => document.removeEventListener('pointerdown', f);
  }, []);
  const reset = () => { if (confirm('সব কোর্সের অগ্রগতি মুছে ফেলবে?')) { resetAll(); onReset(); } };

  return (
    <header className="sticky top-0 z-60 border-b border-line bg-[var(--nav-bg)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[62px] max-w-[1400px] items-center gap-4 px-4 sm:px-5">
        <a href="#/" className="flex flex-none items-center gap-2.5" aria-label="Engineering Academy — প্রথম পাতা">
          <span className="bg-brandgrad grid size-9 place-items-center rounded-[11px] text-[19px] shadow-[0_6px_16px_rgba(79,70,229,.3)]">🎓</span>
          <span className="flex flex-col leading-tight">
            <b className="text-[16.5px]">Engineering Academy</b>
            <small className="hidden text-[11.5px] text-muted sm:block">বাংলায় দেখে-ছুঁয়ে শেখো</small>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          <div className="relative" ref={ddRef}>
            <button className={link + (courseId || route.startsWith('course') ? ' bg-bg2 text-ink' : '')} onClick={() => setDd((x) => !x)} aria-expanded={dd}>📚 কোর্স ▾</button>
            {dd && (
              <div className="pop-in absolute left-0 top-[calc(100%+8px)] w-80 rounded-2xl border border-line bg-panel p-2 shadow-pop">
                {tracks.map((t) => (
                  <a key={t.id} href={'#/course/' + t.id} className={'flex items-center gap-3 rounded-xl p-2.5 hover:bg-bg2' + (courseId === t.id ? ' bg-bg2' : '')}>
                    <span className="bg-tcgrad grid size-10 flex-none place-items-center rounded-xl text-[21px]" style={{ '--g': t.grad }}>{t.icon}</span>
                    <span className="leading-snug"><b className="block text-[15px]">{t.bn}</b><small className="text-[13px] text-muted">{t.q}</small></span>
                  </a>
                ))}
                <a href="#/courses" className="mt-1 block border-t border-line p-2 text-center text-sm font-semibold text-brand">সব কোর্স দেখো →</a>
              </div>
            )}
          </div>
          <a href="#/handbook/all" className={link + (route.startsWith('handbook') ? ' bg-bg2 text-ink' : '')}>📌 চিটশিট</a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {streak > 0 && <span className="hidden whitespace-nowrap rounded-full border border-line bg-bg2 px-2.5 py-0.5 text-sm font-semibold sm:inline" title="পরপর কত দিন শিখেছ">🔥 {toBn(streak)}</span>}
          {xp > 0 && <span className="hidden whitespace-nowrap rounded-full border border-line bg-bg2 px-2.5 py-0.5 text-sm font-semibold sm:inline" title="অর্জিত XP — পড়া, lab ও quiz থেকে">⚡ {toBn(xp)}</span>}
          {last && !route.startsWith('lesson/') && <button className="btn sm primary hidden lg:inline-flex" onClick={() => go('lesson/' + last.id)}>▶ চালিয়ে যাও</button>}
          <button className="grid size-[38px] place-items-center rounded-[11px] border border-line bg-panel text-[17px] hover:bg-bg2" onClick={toggleTheme} aria-label={isDark ? 'Light mode' : 'Dark mode'} title={isDark ? 'আলো mode' : 'অন্ধকার mode'}>{isDark ? '☀️' : '🌙'}</button>
          <button className="grid size-[38px] place-items-center rounded-[11px] border border-line bg-panel text-[17px] md:hidden" onClick={() => setMenu((m) => !m)} aria-label="মেনু">{menu ? '✕' : '☰'}</button>
        </div>
      </div>

      {menu && (
        <div className="pop-in absolute inset-x-0 top-[62px] flex flex-col gap-1 border-b border-line bg-panel px-4 pb-4 pt-2 shadow-pop md:hidden">
          {tracks.map((t) => <a key={t.id} href={'#/course/' + t.id} className={link + ' py-2.5'}>{t.icon} {t.bn} কোর্স</a>)}
          <a href="#/courses" className={link + ' py-2.5'}>📚 সব কোর্স</a>
          <a href="#/handbook/all" className={link + ' py-2.5'}>📌 চিটশিট</a>
          {(streak > 0 || xp > 0) && <div className="px-3 py-2 text-sm text-muted">🔥 {toBn(streak)} দিন · ⚡ {toBn(xp)} XP</div>}
          {xp > 0 && <button className={link + ' py-2.5 text-left'} onClick={reset}>↺ অগ্রগতি মুছো</button>}
        </div>
      )}
    </header>
  );
}
