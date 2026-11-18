import React from 'react';
import { lessonsOf, courseStats, LEVELS, toBn } from '../data/curriculum.js';
import { isDone, pct } from '../lib/progress.js';
import { href } from '../lib/nav.js';

export function LevelTag({ level, text }) {
  const L = LEVELS[level] || LEVELS.beginner;
  return (
    <span className="level" style={{ '--c': L.color }} title={L.label}>
      <span className="level-dots">{[1, 2, 3].map((i) => <i key={i} className={i <= L.dots ? 'on' : ''} />)}</span>
      {text || L.bn}
    </span>
  );
}

export function SoonCard({ u }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[22px] border border-dashed border-line2 bg-panel opacity-80">
      <div className="grid h-[90px] place-items-center bg-bg2 text-[40px] grayscale-[.4]">{u.icon}</div>
      <div className="flex flex-col gap-1.5 p-5">
        <span className="badge w-fit">শীঘ্রই আসছে</span>
        <h3 className="text-[21px] font-bold">{u.title}</h3>
        <p className="text-[15px] text-muted">{u.desc}</p>
      </div>
    </div>
  );
}

export default function CourseCard({ course: c, progress, index }) {
  const ls = lessonsOf(c.id);
  const st = courseStats(c.id);
  const done = ls.filter((l) => isDone(l, progress)).length;
  const started = ls.some((l) => pct(l, progress) > 0);
  return (
    <a href={href.course(c.id)} className="lift group animate-rise flex flex-col overflow-hidden rounded-[22px] border border-line bg-panel shadow-card hover:border-[color-mix(in_srgb,var(--c)_45%,var(--line))]"
      style={{ '--c': c.color, '--g': c.grad, animationDelay: (index || 0) * 0.07 + 's' }}>
      <div className="bg-tcgrad relative grid h-32 place-items-center overflow-hidden">
        <span className="animate-drift absolute -right-10 -top-16 size-40 rounded-full bg-white/20" />
        <span className="animate-drift absolute -bottom-8 left-[10%] size-24 rounded-full bg-white/15 [animation-delay:-4s]" />
        <span className="relative text-[56px] drop-shadow-[0_8px_18px_rgba(0,0,0,.25)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">{c.icon}</span>
        {index != null && <span className="absolute left-3.5 top-3 rounded-full bg-black/20 px-2.5 py-0.5 text-[12.5px] font-bold text-white">কোর্স {toBn(index + 1)}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-5 pb-5 pt-4">
        <LevelTag level={c.level} text={c.levelRange} />
        <h3 className="mt-1 text-[23px] font-bold leading-snug">{c.bn}<small className="block text-[13.5px] font-medium text-muted">{c.title}</small></h3>
        <p className="text-[15px] text-muted">{c.tagline}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[13.5px] text-muted">
          <span>📖 {toBn(st.lessons)} lesson</span><span>🧪 {toBn(st.labs)} lab</span><span>⏱ ~{toBn(st.hours)} ঘণ্টা</span>
        </div>
        {started && (
          <div className="mt-1 flex items-center gap-2.5 text-[13px] text-muted">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><div className="bg-tcgrad h-full rounded-full" style={{ width: (done / ls.length) * 100 + '%' }} /></div>
            {toBn(done)}/{toBn(ls.length)}
          </div>
        )}
        <span className="mt-auto pt-2.5 font-bold text-c-ink">{started ? 'চালিয়ে যাও' : 'কোর্স দেখো'} →</span>
      </div>
    </a>
  );
}
