import React, { useState } from 'react';
import { toBn } from '../data/curriculum.js';

// এক এক করে প্রশ্ন — উত্তর দিলেই সাথে সাথে ব্যাখ্যা; শেষে score ও ভুলগুলোর পুনরালোচনা
export default function Quiz({ quiz, best, onDone }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [finished, setFinished] = useState(false);
  const q = quiz[i];
  const picked = ans[i];
  const answered = picked != null;
  const isRight = (k) => ans[k] === quiz[k].answer;
  const score = quiz.filter((_, k) => isRight(k)).length;
  let streak = 0;
  for (let k = Object.keys(ans).length - 1; k >= 0 && isRight(k); k--) streak++;

  const nextQ = () => {
    if (i < quiz.length - 1) setI(i + 1);
    else { setFinished(true); onDone(score); }
  };
  const restart = () => { setAns({}); setI(0); setFinished(false); };

  const dots = (
    <div className="qz-dots">
      {quiz.map((_, k) => <span key={k} className={'qz-dot' + (ans[k] != null ? (isRight(k) ? ' ok' : ' no') : k === i && !finished ? ' cur' : '')} />)}
    </div>
  );

  if (finished) {
    const pass = score / quiz.length >= 0.6;
    const wrong = quiz.map((x, k) => [x, k]).filter(([, k]) => !isRight(k));
    return (
      <div className="card">
        <div className="qz-result">
          <div className="qz-ring" style={{ '--p': (score / quiz.length) * 100, '--rc': pass ? 'var(--green)' : 'var(--amber)' }}><div>{toBn(score)}/{toBn(quiz.length)}</div></div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ margin: 0 }}>{score === quiz.length ? '🏆 নিখুঁত! সব ঠিক।' : pass ? '✅ দারুণ — পাস করেছ!' : '💪 আরেকবার চেষ্টা করো'}</h3>
            <div className="muted">{pass ? 'ভুল হওয়া প্রশ্নগুলো নিচে দেখে নাও — ওগুলোই তোমার শেখার সবচেয়ে বড় সুযোগ।' : 'পাস করতে ৬০% লাগে। নিচের ব্যাখ্যাগুলো পড়ে আবার দাও — এবার পারবে।'}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={restart}>↺ আবার দাও</button>
              {best != null && <span className="badge ok">সেরা স্কোর: {toBn(Math.max(best, score))}/{toBn(quiz.length)}</span>}
            </div>
          </div>
        </div>
        {wrong.length > 0 && (
          <div className="qz-review">
            <div className="section-h" style={{ margin: '6px 0 0' }}>🔁 যেগুলো ভুল হয়েছে</div>
            {wrong.map(([x, k]) => (
              <div key={k} className="qz-rev" style={{ '--c': 'var(--red)' }}>
                <b>{toBn(k + 1)}. {x.q}</b>
                <div style={{ color: 'var(--green)' }}>✔ {x.options[x.answer]}</div>
                <div className="muted">{x.explain}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="row">
        <span className="muted" style={{ fontSize: 13.5 }}>প্রশ্ন {toBn(i + 1)}/{toBn(quiz.length)}</span>
        {dots}
        {streak >= 2 && <span className="qz-streak">🔥 টানা {toBn(streak)}টি ঠিক</span>}
        {best != null && <span className="badge ok">সেরা: {toBn(best)}/{toBn(quiz.length)}</span>}
      </div>
      <div className="card qz-card" key={i}>
        <div className="qz-q">{q.q}</div>
        {q.options.map((o, j) => {
          const cls = answered ? (j === q.answer ? ' right' : picked === j ? ' wrong' : '') : '';
          return <button key={j} disabled={answered} className={'quiz-opt' + cls} onClick={() => setAns({ ...ans, [i]: j })}>{o}</button>;
        })}
        {answered && (
          <div className={'note fade-in ' + (picked === q.answer ? 'good' : 'bad')}>{picked === q.answer ? '✅ ঠিক! ' : '✖ ভুল। '}{q.explain}</div>
        )}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn primary" disabled={!answered} onClick={nextQ}>{i < quiz.length - 1 ? 'পরের প্রশ্ন →' : '🏁 ফলাফল দেখো'}</button>
        </div>
      </div>
    </div>
  );
}
