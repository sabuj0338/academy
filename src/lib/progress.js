// শেখার অগ্রগতি — সব browser-এর localStorage-এ (কোনো server, কোনো account নেই)।
// একটি ছোট store: nav-এর XP আর page-এর progress আলাদা island হলেও একসাথে বদলায়।
import { useEffect, useState, useSyncExternalStore } from 'react';

export const KEY = 'seclab-progress-v1'; // পুরনো নাম রাখা হলো, যাতে আগের অগ্রগতি হারায় না
const ACT = 'academy-activity';
const LAST = 'academy-last-lesson';
const EVT = 'academy-progress';

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

// ───────── store
const EMPTY = {};
let cache = null;
const snapshot = () => (cache ??= read(KEY, {}));
const emit = () => window.dispatchEvent(new Event(EVT));
const subscribe = (fn) => {
  const onStorage = (e) => { if (!e.key || e.key === KEY || e.key === ACT) { cache = null; fn(); } };
  window.addEventListener(EVT, fn);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVT, fn); window.removeEventListener('storage', onStorage); };
};

/** Server-এ (build-এর সময়) খালি progress, browser-এ আসল — hydration mismatch হয় না */
export const useProgress = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);

export function updateLesson(id, patch) {
  const p = snapshot();
  cache = { ...p, [id]: { ...(p[id] || {}), ...patch } };
  write(KEY, cache);
  recordActivity();
  emit();
}

export function resetAll() {
  try { [KEY, ACT, LAST].forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
  cache = null;
  emit();
}

/** প্রথম render server-এর মতো, তারপর browser-এর মান — localStorage নির্ভর UI-র জন্য */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

// ───────── হিসাব
const passMark = (l) => Math.ceil(l.quiz.length * 0.6);
export const isDone = (l, p) => {
  const x = p[l.id];
  if (!x) return false;
  return (x.step ?? -1) + 1 >= l.steps.length && (x.labs?.length || 0) >= l.labs.length && (x.quiz ?? -1) >= passMark(l);
};
export const pct = (l, p) => {
  const x = p[l.id] || {};
  const total = l.steps.length + l.labs.length + 1;
  return ((x.step ?? -1) + 1 + (x.labs?.length || 0) + ((x.quiz ?? -1) >= passMark(l) ? 1 : 0)) / total;
};
export const statusOf = (l, p) => (isDone(l, p) ? 'done' : pct(l, p) > 0 ? 'started' : 'new');

// XP: প্রতিটি পড়া ধাপ ১০, প্রতিটি lab ৩০, quiz-এর প্রতিটি সঠিক উত্তর ১০
export const xpOf = (p) => Object.values(p).reduce((s, x) => s + ((x.step ?? -1) + 1) * 10 + (x.labs?.length || 0) * 30 + (x.quiz || 0) * 10, 0);

// Streak: পরপর কত দিন শেখা হয়েছে (আজ বা গতকাল পর্যন্ত)
const day = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; // local তারিখ, UTC নয়
export const recordActivity = () => {
  const a = read(ACT, []);
  const t = day();
  if (a[a.length - 1] !== t) write(ACT, [...a, t].slice(-120));
};
export const streakOf = () => {
  const a = new Set(read(ACT, []));
  let n = 0;
  const d = new Date();
  if (!a.has(day(d))) d.setDate(d.getDate() - 1);
  while (a.has(day(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
};

export const setLastLesson = (id) => write(LAST, id);
export const lastLesson = () => read(LAST, null);

/** পড়া ধাপ শুধু বাড়ে, কখনো কমে না (সরাসরি store থেকে পড়ে — hydration-এর খালি snapshot-এ ভুল হয় না) */
export function bumpStep(id, seen) {
  if ((snapshot()[id]?.step ?? -1) < seen) updateLesson(id, { step: seen });
}
