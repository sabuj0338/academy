import React from 'react';
import { tracks, upcoming } from '../data/curriculum.js';
import CourseCard, { SoonCard } from '../components/CourseCard.jsx';

export function PageHead({ kicker, title, children }) {
  return (
    <div className="animate-rise mb-7 mt-4 max-w-[720px]">
      <span className="text-[13px] font-bold uppercase tracking-[.08em] text-brand">{kicker}</span>
      <h1 className="mb-1.5 mt-1 text-[30px] font-bold leading-snug md:text-[38px]">{title}</h1>
      <p className="text-[17px] text-muted">{children}</p>
    </div>
  );
}

export default function CoursesPage({ progress }) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 sm:px-6">
      <PageHead kicker="কোর্সসমূহ" title="কী শিখতে চাও?">
        প্রতিটি কোর্সে ছোট ছোট lesson, প্রতিটি lesson-এ animation, হাতে-কলমে lab, quiz আর এক পাতার cheatsheet। নতুন হলে Networking দিয়ে শুরু করো।
      </PageHead>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
        {tracks.map((t, k) => <CourseCard key={t.id} course={t} progress={progress} index={k} />)}
        {upcoming.map((u) => <SoonCard key={u.title} u={u} />)}
      </div>
    </div>
  );
}
