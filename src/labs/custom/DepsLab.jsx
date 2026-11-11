import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletion, Code } from '../../components/ui.jsx';

const VULNS = [
  { pkg: 'next', ver: '14.1.0', sev: 'critical', id: 'GHSA (middleware auth bypass)', info: 'Production dependency · তোমার middleware.ts auth-এর জন্য ব্যবহার হয় · fix: 14.2.25', answer: 'now', why: 'Critical + reachable + production → এখনই upgrade।' },
  { pkg: 'golang.org/x/crypto', ver: 'v0.17.0', sev: 'high', id: 'GO-2024 (ssh)', info: 'govulncheck: "Your code does not call vulnerable functions" · fix: v0.31.0', answer: 'later', why: 'Reachable নয় → জরুরি নয়, পরের sprint-এ upgrade।' },
  { pkg: 'expresss', ver: '1.0.2', sev: 'critical', id: 'MAL-2026 (malicious)', info: 'Weekly downloads: 41 · ১ সপ্তাহ আগে publish · postinstall script আছে · "express"-এর ভুল বানান', answer: 'remove', why: 'Typosquatting malicious package — সরাও, secret rotate করো (postinstall চলেছে!)।' },
  { pkg: 'semver', ver: '5.7.1', sev: 'medium', id: 'ReDoS', info: 'devDependency · শুধু build tool-এর ভেতরে · user input পায় না', answer: 'later', why: 'Dev-only, user input নেই → কম ঝুঁকি, স্বাভাবিক update-এ।' },
  { pkg: 'github.com/gofiber/fiber/v2', ver: 'v2.49.0', sev: 'high', id: 'CVE (CSRF token)', info: 'Production · তুমি csrf middleware ব্যবহার করো · fix: v2.52.5', answer: 'now', why: 'তুমি ঠিক ওই middleware ব্যবহার করো → এখনই।' },
  { pkg: 'left-pad-ultra', ver: '2.0.0', sev: 'low', id: '—', info: 'কোনো CVE নেই · ৪ বছর update হয়নি · code-এ কোথাও import নেই', answer: 'remove', why: 'অব্যবহৃত dependency = অকারণ attack surface।' },
];
const ACT = { now: '⚡ এখনই upgrade', later: '📅 পরে / নিয়মিত update', remove: '🗑 সরাও' };
const SEV = { critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--amber)', low: 'var(--muted)' };

export default function DepsLab({ onComplete }) {
  const [ans, setAns] = useState({});
  const correct = VULNS.filter((v, i) => ans[i] === v.answer).length;
  useCompletion(VULNS.length, correct, onComplete);
  return (
    <div className="stack">
      <Code label="$ npm audit --omit=dev && govulncheck ./... && trivy fs ." lang="bash" text={`found ${VULNS.length} issues (2 critical, 2 high, 1 medium, 1 low)`} />
      {VULNS.map((v, i) => {
        const a = ans[i];
        const ok = a === v.answer;
        return (
          <motion.div key={v.pkg} className="card" style={{ borderColor: a ? (ok ? 'var(--green)' : 'var(--red)') : undefined }} layout>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span><b className="mono">{v.pkg}@{v.ver}</b> <span className="badge" style={{ color: SEV[v.sev], borderColor: SEV[v.sev] }}>{v.sev}</span> <span className="muted mono" style={{ fontSize: 12.5 }}>{v.id}</span></span>
              <div className="row" style={{ gap: 6 }}>{Object.entries(ACT).map(([k, l]) => <button key={k} className={'btn sm ' + (a === k ? (ok ? 'success' : 'danger') : '')} onClick={() => setAns({ ...ans, [i]: k })}>{l}</button>)}</div>
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{v.info}</div>
            <AnimatePresence>{a && <motion.div className={'note ' + (ok ? 'good' : 'bad')} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>{ok ? '✅ ' + v.why : '✖ আবার ভাবো — severity, reachability, production নাকি dev, এবং package-টা আসল কিনা।'}</motion.div>}</AnimatePresence>
          </motion.div>
        );
      })}
      <div className="badge ok" style={{ width: 'fit-content' }}>সঠিক সিদ্ধান্ত: {correct}/{VULNS.length}</div>
    </div>
  );
}
