import React from 'react';
import { tracks, trackOf, lessonsOf, unitsOf, courseStats, toBn } from '../data/curriculum.js';
import { isDone, pct, statusOf, useProgress } from '../lib/progress.js';
import { href } from '../lib/nav.js';
import { LevelTag } from '../components/CourseCard.jsx';

const card = 'rounded-[18px] border border-line bg-panel px-[18px] py-4';

export default function CoursePage({ courseId }) {
  const c = trackOf(courseId);
  const progress = useProgress();
  const ls = lessonsOf(c.id);
  const st = courseStats(c.id);
  const done = ls.filter((l) => isDone(l, progress)).length;
  const next = ls.find((l) => !isDone(l, progress)) || ls[0];
  const started = ls.some((l) => pct(l, progress) > 0);
  const others = tracks.filter((t) => t.id !== c.id);
  let n = 0;

  return (
    <div style={{ '--tc': c.color, '--g': c.grad }}>
      {/* banner */}
      <section className="bg-tcgrad on-color relative overflow-hidden text-white">
        <span className="animate-drift absolute -right-32 -top-44 size-[420px] rounded-full bg-white/15" />
        <span className="animate-drift absolute -bottom-36 left-[30%] size-60 rounded-full bg-white/10 [animation-delay:-5s]" />
        <span className="grid-bg absolute inset-0" />
        <div className="relative mx-auto flex max-w-[1180px] items-center gap-8 px-4 pb-10 pt-8 sm:px-6">
          <div className="animate-rise min-w-0 flex-1">
            <a href={href.courses()} className="text-sm font-semibold text-white/85 hover:text-white">← সব কোর্স</a>
            <div className="mb-2 mt-3 flex items-center gap-4">
              <span className="grid size-[60px] flex-none place-items-center rounded-[20px] border border-white/30 bg-white/20 text-[32px] md:size-[76px] md:text-[42px]">{c.icon}</span>
              <div><h1 className="text-[30px] font-bold leading-tight md:text-[40px]">{c.bn}</h1><div className="text-[15px] opacity-85">{c.title}</div></div>
            </div>
            <p className="mb-3.5 mt-1 max-w-[640px] text-[17px] opacity-95 md:text-[18px]">{c.tagline}</p>
            <div className="flex flex-wrap gap-2 text-sm [&>span]:rounded-full [&>span]:border [&>span]:border-white/25 [&>span]:bg-white/15 [&>span]:px-3 [&>span]:py-1">
              <span><LevelTag level={c.level} text={c.levelRange} /></span>
              <span>📖 {toBn(st.lessons)}টি lesson</span>
              <span>🧪 {toBn(st.labs)}টি lab</span>
              <span>⏱ ~{toBn(st.hours)} ঘণ্টা</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button className="btn lg border-transparent! bg-white! font-bold text-[#111827]! shadow-[0_10px_24px_rgba(0,0,0,.18)]" onClick={() => { window.location.href = href.lesson(next.id); }}>
                {started ? '▶ চালিয়ে যাও' : '▶ কোর্স শুরু করো'}: {next.title.slice(0, 26)}{next.title.length > 26 ? '…' : ''}
              </button>
              <a className="btn lg border-white/35! bg-white/15! text-white! hover:bg-white/25!" href={href.handbook(c.id)}>📌 Cheatsheet</a>
            </div>
          </div>
          <div className="animate-rise hidden flex-none md:block [animation-delay:.1s]">
            <div className="grid size-[124px] place-items-center rounded-full" style={{ background: `conic-gradient(#fff ${(done / ls.length) * 100}%, rgba(255,255,255,.22) 0)` }}>
              <div className="flex size-[100px] flex-col items-center justify-center rounded-full bg-black/20 leading-tight">
                <b className="text-2xl">{toBn(done)}/{toBn(ls.length)}</b><small className="text-xs opacity-90">সম্পূর্ণ</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] items-start gap-8 px-4 pb-20 pt-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* syllabus */}
        <div>
          <h2 className="text-[28px] font-bold">Syllabus</h2>
          <p className="text-muted">ক্রম অনুযায়ী সাজানো — তবে যেকোনো lesson-এ সরাসরি যেতে পারো।</p>
          {unitsOf(c.id).map((u, ui) => {
            const ud = u.lessons.filter((l) => isDone(l, progress)).length;
            return (
              <section key={ui} className="animate-rise mt-7" style={{ animationDelay: ui * 0.06 + 's' }}>
                <div className="mb-3 flex items-start gap-3.5">
                  <span className="bg-tcgrad grid size-11 flex-none place-items-center rounded-[14px] text-[19px] font-extrabold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--tc)_30%,transparent)]">{toBn(ui + 1)}</span>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-bold tracking-wide text-tc-ink">Unit {toBn(ui + 1)} · {toBn(u.lessons.length)}টি lesson</div>
                    <h3 className="text-[21px] font-bold">{u.title}</h3>
                    <p className="text-[14.5px] text-muted">{u.desc}</p>
                  </div>
                  {ud > 0 && <span className="badge ok">{toBn(ud)}/{toBn(u.lessons.length)}</span>}
                </div>
                <ol className="pl-1">
                  {u.lessons.map((l, li) => {
                    n++;
                    const s = statusOf(l, progress);
                    const isNext = l.id === next.id;
                    const last = li === u.lessons.length - 1;
                    return (
                      <li key={l.id} className="relative flex items-stretch gap-3.5 pb-2.5">
                        {!last && <span className={'absolute bottom-0 left-[17px] top-9 w-0.5 ' + (s === 'done' ? 'bg-ok' : 'bg-line2')} />}
                        <span style={{ '--p': pct(l, progress) * 100 }}
                          className={'lp-node relative z-[1] mt-3 grid size-9 flex-none place-items-center rounded-full border-2 text-sm font-bold ' +
                            (s === 'done' ? 'border-ok bg-ok text-white' : s === 'started' ? 'lp-started border-transparent text-ink' : isNext ? 'animate-glow border-tc bg-panel text-tc-ink' : 'border-line2 bg-panel text-muted')}>
                          {s === 'done' ? '✓' : toBn(n)}
                        </span>
                        <a href={href.lesson(l.id)}
                          className={'lift flex min-w-0 flex-1 items-start gap-3.5 rounded-2xl border bg-panel px-4 py-3.5 ' + (isNext ? 'border-tc/55 ring-[3px] ring-tc/12' : 'border-line')}>
                          <span className="flex-none text-[28px] leading-tight">{l.icon}</span>
                          <span className="flex min-w-0 flex-col">
                            <b className="text-[16.5px] leading-snug">{l.title}</b>
                            <span className="text-sm text-muted">{l.subtitle}</span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                              <LevelTag level={l.level} />
                              <span>⏱ {l.duration}</span>
                              <span>🧪 {toBn(l.labs.length)} lab</span>
                              {isNext && <span className="font-bold text-tc-ink">{started ? 'পরবর্তী' : 'এখান থেকে শুরু'} →</span>}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        {/* পাশের তথ্য */}
        <aside className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] lg:sticky lg:top-20 lg:mt-12 lg:flex lg:flex-col">
          <div className={card}>
            <h3 className="mb-2 text-[17px] font-bold">🎯 যা শিখবে</h3>
            <ul className="grid gap-2 text-[14.5px] leading-relaxed">
              {c.outcomes.map((o) => <li key={o} className="flex gap-2.5"><span className="mt-1 grid size-[18px] flex-none place-items-center rounded-full bg-ok text-[11px] font-extrabold text-white">✓</span>{o}</li>)}
            </ul>
          </div>
          <div className={card}>
            <h3 className="mb-2 text-[17px] font-bold">🧰 শুরুর আগে</h3>
            <ul className="grid gap-2 text-[14.5px] leading-relaxed">
              {c.prerequisites.map((o) => <li key={o} className="flex gap-2.5"><span className="mt-2.5 size-[7px] flex-none rounded-full bg-tc" />{o}</li>)}
            </ul>
            <div className="mt-3 border-t border-dashed border-line pt-2.5 text-sm"><b>কার জন্য:</b> {c.audience}</div>
          </div>
          <div className={card}>
            <h3 className="mb-2 text-[17px] font-bold">📖 প্রতিটি lesson-এ</h3>
            <div className="grid gap-1.5 text-[14.5px]">
              {[['🧒', 'সহজ কথায় ব্যাখ্যা'], ['🎬', 'Animation ও diagram'], ['🧪', 'হাতে-কলমে lab'], ['❓', 'Quiz'], ['📌', 'এক পাতার cheatsheet']].map(([i, t]) => (
                <span key={t} className="flex items-center gap-2.5"><i className="grid size-7 place-items-center rounded-[9px] bg-bg2 not-italic">{i}</i>{t}</span>
              ))}
            </div>
          </div>
          <div className={card}>
            <h3 className="mb-2 text-[17px] font-bold">➡️ অন্য কোর্স</h3>
            {others.map((t) => (
              <a key={t.id} href={href.course(t.id)} className="-mx-2 flex items-center gap-3 rounded-xl p-2 hover:bg-bg2">
                <span className="grid size-[38px] flex-none place-items-center rounded-[11px] text-[19px]" style={{ background: t.grad }}>{t.icon}</span>
                <span className="leading-snug"><b className="block text-[15px]">{t.bn}</b><small className="text-[13px] text-muted">{t.q}</small></span>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
