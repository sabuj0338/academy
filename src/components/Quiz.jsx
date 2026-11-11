import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBn } from '../data/curriculum.js';

export default function Quiz({ quiz, best, onDone }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const score = quiz.filter((q, i) => ans[i] === q.answer).length;
  const all = Object.keys(ans).length === quiz.length;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="muted">{toBn(Object.keys(ans).length)}/{toBn(quiz.length)} উত্তর দেওয়া হয়েছে</span>
        {best != null && <span className="badge ok">সেরা স্কোর: {toBn(best)}/{toBn(quiz.length)}</span>}
      </div>
      {quiz.map((q, i) => (
        <motion.div key={i} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>{toBn(i + 1)}. {q.q}</div>
          {q.options.map((o, j) => {
            const cls = checked ? (j === q.answer ? ' right' : ans[i] === j ? ' wrong' : '') : ans[i] === j ? ' sel-opt' : '';
            return <button key={j} className={'quiz-opt' + cls} onClick={() => { if (!checked) setAns({ ...ans, [i]: j }); }}>{o}</button>;
          })}
          <AnimatePresence>{checked && <motion.div className={'note ' + (ans[i] === q.answer ? 'good' : 'bad')} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{ans[i] === q.answer ? '✅ ' : '✖ '}{q.explain}</motion.div>}</AnimatePresence>
        </motion.div>
      ))}
      <div className="row">
        {!checked
          ? <button className="btn primary" disabled={!all} onClick={() => { setChecked(true); onDone(score); }}>উত্তর যাচাই করো</button>
          : <>
              <motion.div className="score-pill" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: score / quiz.length >= 0.6 ? 'var(--green)' : 'var(--amber)' }}>স্কোর: {toBn(score)}/{toBn(quiz.length)}</motion.div>
              <button className="btn" onClick={() => { setAns({}); setChecked(false); }}>↺ আবার চেষ্টা</button>
            </>}
      </div>
    </div>
  );
}
