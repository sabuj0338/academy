import React, { Suspense, lazy } from 'react';
import { tracks, lessons, lessonsOf, lessonById, trackOf, scenarios, upcoming, courseStats, toBn } from '../data/curriculum.js';
import { isDone, pct, lastLesson, useProgress, useMounted } from '../lib/progress.js';
import { href } from '../lib/nav.js';
import CourseCard, { SoonCard } from '../components/CourseCard.jsx';

const Hero3D = lazy(() => import('../components/Hero3D.jsx'));

const METHOD = [
  { ic: '🎬', t: 'দেখো', d: '3D globe, চলমান packet, ধাপে ধাপে diagram — কঠিন ধারণা চোখের সামনে ঘটতে দেখো।', art: 'watch' },
  { ic: '🧪', t: 'নিজে করো', d: 'প্রতিটি lesson-এ নিরাপদ lab — বোতাম টেপো, তার কাটো, আক্রমণ চালাও, ফলাফল দেখো।', art: 'lab' },
  { ic: '✋', t: 'ভাবো', d: 'পড়ার মাঝে ছোট প্রশ্ন আর শেষে quiz — ভুল হলে সাথে সাথে কারণসহ ব্যাখ্যা।', art: 'think' },
  { ic: '🧠', t: 'মনে রাখো', d: 'Mind map, flashcard আর এক পাতার cheatsheet — পরে দ্রুত ঝালাই করে নাও।', art: 'remember' },
];

const PATH = [
  ['net', 'আগে বোঝো data কীভাবে এক computer থেকে আরেকটায় যায়।'],
  ['sd', 'তারপর দেখো সেই যোগাযোগ দিয়ে বড় app কীভাবে বানানো হয়।'],
  ['sec', 'শেষে শেখো সেই app-কে আক্রমণ থেকে কীভাবে বাঁচাতে হয়।'],
];

function MethodArt({ kind }) {
  return (
    <div className="m-art" aria-hidden="true">
      {kind === 'watch' && <><span className="ma-node">💻</span><span className="ma-wire"><i /></span><span className="ma-node">🖥️</span></>}
      {kind === 'lab' && <><span className="ma-switch"><i /></span><span className="ma-bulb">💡</span></>}
      {kind === 'think' && <><span className="ma-opt">A</span><span className="ma-opt ok">B ✓</span><span className="ma-opt">C</span></>}
      {kind === 'remember' && <span className="ma-card"><span className="f">DNS?</span><span className="b">ফোনবুক 📒</span></span>}
    </div>
  );
}

export function SecHead({ kicker, title, children }) {
  return (
    <div className="mb-5 max-w-[680px]">
      <span className="text-[13px] font-bold uppercase tracking-[.08em] text-brand">{kicker}</span>
      <h2 className="mb-1.5 mt-0.5 text-[25px] font-bold leading-snug md:text-[30px]">{title}</h2>
      {children && <p className="text-[16.5px] text-muted">{children}</p>}
    </div>
  );
}

export default function Home() {
  const progress = useProgress();
  const mounted = useMounted(); // 3D ও “যেখানে থেমেছিলে” শুধু browser-এ
  const totalLabs = lessons.reduce((s, l) => s + l.labs.length, 0);
  const hours = tracks.reduce((s, t) => s + courseStats(t.id).hours, 0);
  const last = mounted && lastLesson() ? lessonById(lastLesson()) : null;
  const first = lessonsOf('net')[0];
  const LT = last && trackOf(last.track);

  return (
    <>
      {/* hero */}
      <section className="mx-auto grid max-w-[1180px] items-center gap-7 px-4 pb-14 pt-7 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-10 md:pt-12">
        <div className="animate-rise">
          <span className="inline-block rounded-full border border-brand/25 bg-brand/10 px-3.5 py-1.5 text-[13.5px] font-semibold">🎓 বিনামূল্যে · সহজ বাংলায় · কোনো অভিজ্ঞতা লাগবে না</span>
          <h1 className="mb-3.5 mt-4 text-[38px] font-bold leading-[1.18] tracking-tight md:text-[52px]">প্রযুক্তির কঠিন বিষয়,<br /><span className="text-grad">চোখে দেখে শেখো</span></h1>
          <p className="mb-6 max-w-[560px] text-[17px] text-muted md:text-[18.5px]">Internet কীভাবে চলে, বড় app কীভাবে বানানো হয়, আর hacker-দের কীভাবে ঠেকাতে হয় — 3D animation, interactive lab আর গল্পের মতো ব্যাখ্যায়। একদম শুরু থেকে, নিজের গতিতে।</p>
          <div className="flex flex-wrap gap-2.5">
            {last
              ? <a className="btn primary lg" href={href.lesson(last.id)}>▶ চালিয়ে যাও: {last.title.slice(0, 26)}{last.title.length > 26 ? '…' : ''}</a>
              : <a className="btn primary lg" href={href.lesson(first.id)}>▶ প্রথম lesson শুরু করো</a>}
            <a className="btn lg" href={href.courses()}>সব কোর্স দেখো</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 md:gap-7">
            {[[tracks.length, 'কোর্স'], [lessons.length, 'lesson'], [totalLabs, 'interactive lab'], ['~' + hours, 'ঘণ্টা']].map(([n, t]) => (
              <div key={t} className="flex flex-col leading-tight"><b className="text-[22px] md:text-[26px]">{toBn(n)}</b><span className="text-[13.5px] text-muted">{t}</span></div>
            ))}
          </div>
        </div>
        <div className="hero-visual stage animate-rise relative h-[300px] overflow-hidden rounded-[22px] border border-line bg-[radial-gradient(circle_at_50%_45%,#15295a,#070b14_70%)] shadow-pop [animation-delay:.1s] md:h-[440px] md:rounded-[28px]">
          {mounted && <Suspense fallback={null}><Hero3D /></Suspense>}
          {[['📦 Packet', 'left-[8%] top-[12%]', '0s'], ['🔒 HTTPS', 'right-[9%] top-[18%]', '-1.5s'], ['🛡️ Firewall', 'bottom-[22%] left-[10%]', '-3s'], ['⚡ Cache', 'bottom-[14%] right-[12%]', '-2.2s']].map(([t, pos, d]) => (
            <span key={t} className={'animate-floaty pointer-events-none absolute z-[2] rounded-full border border-white/10 bg-[#101a2e]/75 px-3 py-1.5 text-[12px] font-semibold text-[#e6edf7] backdrop-blur md:text-[13.5px] ' + pos} style={{ animationDelay: d }}>{t}</span>
          ))}
          <span className="pointer-events-none absolute inset-x-0 bottom-3 z-[2] text-center text-[12.5px] text-[#8a9bb8]">🖱️ এটা জীবন্ত — lesson-গুলোতেও এমন 3D দেখবে</span>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-14 px-4 pb-20 sm:px-6 md:gap-[72px]">
        {last && (
          <button className="lift animate-rise -mt-6 flex flex-wrap items-center gap-4 rounded-[20px] border border-line bg-panel p-4 text-left shadow-card md:px-5" style={{ '--c': LT.color }} onClick={() => { window.location.href = href.lesson(last.id); }}>
            <span className="grid size-[54px] flex-none place-items-center rounded-2xl bg-c/15 text-[28px]">{last.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-muted">যেখানে থেমেছিলে · {LT.bn}</span>
              <b className="block truncate text-[18px]">{last.title}</b>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full" style={{ width: pct(last, progress) * 100 + '%', background: LT.grad }} /></span>
            </span>
            <span className="btn primary">চালিয়ে যাও →</span>
          </button>
        )}

        <section>
          <SecHead kicker="শেখার পদ্ধতি" title="এখানে শেখা একটু অন্যরকম">মুখস্থ নয় — প্রতিটি lesson চারটি ধাপে তোমাকে বিষয়টা সত্যিই বুঝিয়ে দেয়।</SecHead>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((m, i) => (
              <div key={m.t} className="animate-rise rounded-[20px] border border-line bg-panel p-4 pb-5 shadow-card" style={{ animationDelay: i * 0.08 + 's' }}>
                <MethodArt kind={m.art} />
                <div className="mt-3.5 text-[19px] font-bold">{m.ic} {toBn(i + 1)}. {m.t}</div>
                <p className="mt-1 text-[15px] text-muted">{m.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SecHead kicker="কোর্সসমূহ" title="যেকোনো একটা দিয়ে শুরু করো">প্রতিটি কোর্স স্বয়ংসম্পূর্ণ — প্রতিটি নতুন শব্দ প্রথমবার আসার সাথে সাথেই ব্যাখ্যা করা আছে।</SecHead>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
            {tracks.map((t, k) => <CourseCard key={t.id} course={t} progress={progress} index={k} />)}
            {upcoming.slice(0, 1).map((u) => <SoonCard key={u.title} u={u} />)}
          </div>
        </section>

        <section>
          <SecHead kicker="কোথা থেকে শুরু করব?" title="পরামর্শ: এই ক্রমে এগোও">প্রতিটি কোর্স আগেরটার উপর দাঁড়িয়ে — তবে আগ্রহ অনুযায়ী যেকোনোটায় সরাসরি যেতে পারো।</SecHead>
          <div className="flex flex-col items-stretch md:flex-row">
            {PATH.map(([id, why], i) => {
              const t = trackOf(id);
              const ls = lessonsOf(id);
              const d = ls.filter((l) => isDone(l, progress)).length;
              return (
                <React.Fragment key={id}>
                  <a href={href.course(id)} className="lift relative flex flex-1 flex-col gap-1 rounded-[20px] border border-line bg-panel p-5 text-[15px] shadow-card" style={{ '--c': t.color, '--g': t.grad }}>
                    <span className="absolute right-4 top-3.5 text-[40px] font-extrabold leading-none text-c/25">{toBn(i + 1)}</span>
                    <span className="bg-tcgrad mb-1.5 grid size-[50px] place-items-center rounded-[15px] text-[26px]">{t.icon}</span>
                    <b className="text-[19px]">{t.bn}</b>
                    <span className="text-muted">{why}</span>
                    {d > 0 && <span className="badge ok mt-1 w-fit">{toBn(d)}/{toBn(ls.length)} শেষ</span>}
                  </a>
                  {i < PATH.length - 1 && (
                    <span className="relative h-[26px] w-0.5 self-center bg-line2 md:h-0.5 md:w-[42px] md:flex-none" aria-hidden="true"><i className="flow-dot hidden md:block" /></span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        <section>
          <SecHead kicker="সব জোড়া লাগে" title="একই feature, তিনটি দৃষ্টিকোণ">ধরো তুমি একটি online দোকান বানাচ্ছ। প্রতিটি কাজ তিন কোর্সে তিনভাবে দেখা হয়েছে — যেকোনো chip-এ ক্লিক করলে সেই lesson খুলবে।</SecHead>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {scenarios.map((s) => (
              <div key={s.name} className="flex flex-col gap-1.5 rounded-[18px] border border-line bg-panel p-3.5">
                <div className="mb-0.5 text-[16px] font-bold">{s.icon} {s.name}</div>
                {['net', 'sd', 'sec'].map((t) => {
                  const [id, label] = s[t];
                  const l = lessonById(id);
                  return (
                    <a key={t} href={href.lesson(id)} style={{ '--c': trackOf(t).color }}
                      className="flex items-center gap-2 rounded-[10px] border border-c/30 bg-c/8 px-2.5 py-1.5 text-left text-sm transition hover:translate-x-[3px] hover:bg-c/15">
                      <span>{trackOf(t).icon}</span>{label}{l && isDone(l, progress) && <span className="ml-auto text-ok">✓</span>}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
