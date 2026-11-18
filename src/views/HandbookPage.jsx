import React, { useEffect, useState } from 'react';
import { tracks, lessons, lessonsOf, trackOf, unitsOf, toBn } from '../data/curriculum.js';
import CheatCard, { cheatMarkdown } from '../components/CheatCard.jsx';
import { PageHead } from './CoursesPage.jsx';
import { href } from '../lib/nav.js';

export default function HandbookPage({ initial }) {
  const [q, setQ] = useState('');
  const [tr, setTr] = useState(tracks.some((t) => t.id === initial) ? initial : 'all');
  const [unit, setUnit] = useState(-1);
  const [copied, setCopied] = useState(false);
  useEffect(() => setUnit(-1), [tr]);
  const pool = tr === 'all' ? lessons : lessonsOf(tr);
  const units = tr === 'all' ? [] : unitsOf(tr);
  const inUnit = (l) => unit < 0 || units[unit].phases.includes(l.phase);
  const list = pool.filter((l) => inUnit(l) && (!q || (l.title + l.cheat.summary + l.cheat.rules.join(' ') + l.cheat.category).toLowerCase().includes(q.toLowerCase())));
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
  const seg = (on) => 'rounded-[10px] px-3.5 py-1.5 text-[14.5px] font-medium ' + (on ? 'bg-panel text-ink shadow-card' : 'text-muted hover:text-ink');
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 sm:px-6">
      <PageHead kicker="Cheatsheet library" title={'📌 ' + (tr === 'all' ? 'সব cheatsheet এক জায়গায়' : trackOf(tr).bn + ' cheatsheet')}>
        প্রতিটি lesson-এর সারকথা এক পাতায় — নিয়ম, checklist আর মনে রাখার একটি কথা। Print করে রাখো বা Markdown হিসেবে নামিয়ে নাও।
      </PageHead>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex flex-wrap gap-0.5 rounded-[13px] border border-line bg-bg2 p-1">
          <button className={seg(tr === 'all')} onClick={() => { setTr('all'); history.replaceState(null, '', href.handbook()); }}>সব</button>
          {tracks.map((t) => <button key={t.id} className={seg(tr === t.id)} onClick={() => { setTr(t.id); history.replaceState(null, '', href.handbook(t.id)); }}>{t.icon} {t.bn}</button>)}
        </div>
        <input className="input max-w-[260px]" placeholder="🔍 খোঁজো: dns, cache, jwt…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="flex-1" />
        <button className="btn sm" onClick={() => navigator.clipboard?.writeText(all()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {})}>{copied ? '✓ Copied' : '📋 Copy'}</button>
        <button className="btn sm" onClick={download}>⬇ .md</button>
        <button className="btn sm" onClick={() => window.print()}>🖨 Print</button>
      </div>
      {units.length > 0 && (
        <div className="no-print -mt-1 mb-4 flex flex-wrap gap-1.5">
          <button className={'btn sm ' + (unit < 0 ? 'primary' : '')} onClick={() => setUnit(-1)}>সব unit</button>
          {units.map((u, i) => <button key={i} className={'btn sm ' + (unit === i ? 'primary' : '')} onClick={() => setUnit(i)}>{toBn(i + 1)}. {u.title}</button>)}
        </div>
      )}
      <div className="cheat-grid">
        {list.map((l) => <CheatCard key={l.id} lesson={l} compact total={lessonsOf(l.track).length} link={href.lesson(l.id)} />)}
      </div>
      {!list.length && <div className="text-muted">কিছু পাওয়া যায়নি।</div>}
    </div>
  );
}
