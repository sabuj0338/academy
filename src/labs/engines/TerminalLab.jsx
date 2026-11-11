import React, { useEffect, useRef, useState } from 'react';
import { terminalPresets } from '../terminalPresets.js';
import { TaskList, useCompletion } from '../../components/ui.jsx';

export default function TerminalLab({ preset, onComplete }) {
  const P = terminalPresets[preset];
  const state = useRef(null);
  if (!state.current) { state.current = { flags: {} }; P.init?.(state.current); }
  const [lines, setLines] = useState([{ k: 'sys', t: P.banner }]);
  const [cmd, setCmd] = useState('');
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const [done, setDone] = useState([]);
  const boxRef = useRef();
  const inRef = useRef();
  useCompletion(P.missions.length, done.length, onComplete);
  useEffect(() => { boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [lines]);

  const run = (raw) => {
    const c = raw.trim();
    if (!c) return;
    setHist((h) => [c, ...h]);
    setHi(-1);
    if (c === 'clear') { setLines([]); return; }
    let out;
    if (c === 'help') out = 'চেষ্টা করার মতো command:\n' + P.help;
    else {
      const hit = P.commands.find((x) => x.match.test(c));
      if (hit) {
        const m = c.match(hit.match);
        out = typeof hit.out === 'function' ? hit.out(m, state.current) : hit.out;
        if (hit.flag) state.current.flags[hit.flag] = true;
      } else out = `${c.split(' ')[0]}: command not found (এই lab-এ সিমুলেটেড নয়) — "help" দেখো`;
    }
    setLines((l) => [...l, { k: 'cmd', t: c }, { k: 'out', t: out }]);
    const nd = P.missions.filter((ms) => (ms.check ? ms.check(c, state.current) : state.current.flags[ms.id])).map((ms) => ms.id);
    setDone(nd);
  };

  return (
    <div className="grid-term">
      <div className="terminal" ref={boxRef} onClick={() => inRef.current?.focus()}>
        {lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: l.k === 'out' ? 8 : 0, color: l.k === 'sys' ? '#8a9bb8' : l.k === 'cmd' ? '#e6edf7' : undefined }}>
            {l.k === 'cmd' && <span className="prompt">{P.prompt} </span>}{l.t}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="prompt">{P.prompt}</span>
          <input ref={inRef} value={cmd} autoFocus={false} spellCheck={false} autoCapitalize="off" autoComplete="off"
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { run(cmd); setCmd(''); }
              if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (hist[n]) { setHi(n); setCmd(hist[n]); } }
              if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(n); setCmd(n >= 0 ? hist[n] : ''); }
            }} />
        </div>
      </div>
      <div className="stack">
        <div className="card">
          <div className="section-h">🎯 Missions</div>
          <TaskList tasks={P.missions} done={done} />
        </div>
        <div className="card">
          <div className="section-h">⚡ দ্রুত command (ক্লিক করে বসাও)</div>
          <div className="stack" style={{ gap: 4 }}>
            {P.help.split('\n').map((h) => (
              <button key={h} className="cmd-chip mono" onClick={() => { setCmd(h); inRef.current?.focus(); }}>{h}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
