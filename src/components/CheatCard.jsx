import React, { useState } from 'react';
import { severityInfo, toBn, trackOf, lessonById } from '../data/curriculum.js';

export function cheatMarkdown(l, total) {
  const c = l.cheat;
  const sev = severityInfo[c.severity] || severityInfo.info;
  let s = `## ${l.no}. ${l.title}\n**Track:** ${trackOf(l.track).title} · **Category:** ${c.category} · **Type:** ${sev.label}\n\n${c.summary}\n\n**নিয়ম:**\n${c.rules.map((r) => `- ${r}`).join('\n')}\n\n**Checklist:**\n${c.checklist.map((r) => `- [ ] ${r}`).join('\n')}\n`;
  if (c.commands?.length) s += `\n**Commands:**\n\`\`\`bash\n${c.commands.join('\n')}\n\`\`\`\n`;
  const rel = (l.related || []).map(lessonById).filter(Boolean);
  if (rel.length) s += `\n**Related:** ${rel.map((r) => `${trackOf(r.track).bn} → ${r.title}`).join(' · ')}\n`;
  s += `\n> ${c.remember}\n`;
  return s;
}

export default function CheatCard({ lesson, compact, total, onOpen }) {
  const c = lesson.cheat;
  const sev = severityInfo[c.severity] || severityInfo.info;
  const T = trackOf(lesson.track);
  const [copied, setCopied] = useState(false);
  return (
    <div className={'cheat-card' + (compact ? ' compact' : '')} style={{ '--sev': sev.color }}>
      <div className="cheat-top">
        <span className="mono" style={{ fontSize: 12, letterSpacing: '.08em' }}>{T.icon} {c.category.toUpperCase()}</span>
        <span className="cheat-no mono">{lesson.no} / {total || ''}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: '6px 0', cursor: onOpen ? 'pointer' : 'default' }} onClick={onOpen}>{lesson.icon} {lesson.title}</h3>
        <span className="badge" style={{ color: sev.color, borderColor: sev.color }}>{sev.label}</span>
      </div>
      <p style={{ margin: '0 0 12px' }}>{c.summary}</p>
      <div className="grid2" style={{ gap: 14 }}>
        <div>
          <div className="section-h">{lesson.track === 'sec' ? '🛡 নিয়ম' : '🧠 মূল নিয়ম'}</div>
          {c.rules.map((r) => <div key={r} className="mini-li good">{r}</div>)}
        </div>
        <div>
          <div className="section-h">☑️ Checklist</div>
          {c.checklist.map((r) => <div key={r} className="mini-li">☐ {r}</div>)}
          {c.commands?.length > 0 && (<><div className="section-h" style={{ marginTop: 10 }}>⌨️ Commands</div><pre className="code" style={{ fontSize: 12.5 }}>{c.commands.join('\n')}</pre></>)}
        </div>
      </div>
      <div className="remember">💭 {c.remember}</div>
      {!compact && (
        <button className="btn sm" style={{ marginTop: 12 }} onClick={() => navigator.clipboard?.writeText(cheatMarkdown(lesson, total)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {})}>
          {copied ? '✓ Copied' : '📋 Markdown হিসেবে copy'}
        </button>
      )}
    </div>
  );
}

export { toBn };
