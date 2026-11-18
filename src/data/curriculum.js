import p1 from './phase1.js';
import p2 from './phase2.js';
import p3 from './phase3.js';
import p4 from './phase4.js';
import p5 from './phase5.js';
import p6 from './phase6.js';
import simple from './simple.js';
import enrich from './secEnrich.js';
import { netPhases, netLessons } from './net/index.js';
import { sdPhases, sdLessons } from './sd/index.js';
import { cdPhases, cdLessons } from './cd/index.js';
import visuals from './visuals/index.js';
import courseList, { LEVELS, upcoming } from './courses.js';

// ───────── কোর্স (পুরনো নাম "track" — lesson.track = course id)
export const tracks = courseList;
export const courses = courseList;
export { LEVELS, upcoming };

const secPhases = [
  { id: 1, title: 'Security Fundamentals', bn: 'ভিত্তি', color: '#22d3ee', desc: 'HTTP, session, AuthN/AuthZ, recon, threat modeling' },
  { id: 2, title: 'Common Web Attacks', bn: 'সাধারণ ওয়েব আক্রমণ', color: '#f472b6', desc: 'XSS, CSRF, SQLi, IDOR, SSRF, upload, traversal…' },
  { id: 3, title: 'API & Mobile Security', bn: 'API ও মোবাইল', color: '#a78bfa', desc: 'Mass assignment, JWT, OAuth, rate limit, CORS, mobile' },
  { id: 4, title: 'Server & Deployment', bn: 'সার্ভার ও ডিপ্লয়মেন্ট', color: '#fb923c', desc: 'Linux, SSH, firewall, Nginx, Docker, CDN, TLS' },
  { id: 5, title: 'Database & Data', bn: 'ডেটাবেস ও ডেটা', color: '#fbbf24', desc: 'PostgreSQL, Redis, secrets, encryption, backup' },
  { id: 6, title: 'Testing & Monitoring', bn: 'টেস্টিং ও মনিটরিং', color: '#4ade80', desc: 'Headers, deps, Burp/ZAP, logs, incident response, audit' },
];

export const phases = [
  ...netPhases.map((p) => ({ ...p, track: 'net' })),
  ...sdPhases.map((p) => ({ ...p, track: 'sd' })),
  ...secPhases.map((p) => ({ ...p, track: 'sec' })),
  ...cdPhases.map((p) => ({ ...p, track: 'cd' })),
];

const secLessons = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6].map((l) => {
  const e = enrich[l.id] || {};
  return { ...l, track: 'sec', simple: l.simple || simple[l.id], terms: l.terms || e.terms, steps: l.steps.map((st, i) => ({ ...st, ...(e.steps?.[i] || {}) })) };
});

// Recommended sequence: Networking → System Design → Security
// visuals/*.js — ধাপে বাড়তি visual block (seq, anatomy, bars, layers, ask, maps)। নতুন ধাপ যোগ হয় না, তাই progress অক্ষত।
const withVisuals = (l) => {
  const v = visuals[l.id];
  return v ? { ...l, steps: l.steps.map((st, i) => (v[i] ? { ...st, ...v[i] } : st)) } : l;
};

export const lessons = [
  ...netLessons.map((l) => ({ ...l, track: 'net' })),
  ...sdLessons.map((l) => ({ ...l, track: 'sd' })),
  ...secLessons,
  ...cdLessons.map((l) => ({ ...l, track: 'cd' })),
].map(withVisuals).map((l) => {
  const c = courseList.find((x) => x.id === l.track);
  return { ...l, level: l.level || c?.lessonLevels?.[l.id] || c?.level || 'beginner' };
});

export const trackOf = (id) => tracks.find((t) => t.id === id) || tracks[0];
export const phasesOf = (track) => phases.filter((p) => p.track === track);
export const lessonsOf = (track) => lessons.filter((l) => l.track === track);
export const phaseOf = (l) => phases.find((p) => p.track === l.track && p.id === l.phase);
export const lessonById = (id) => { const k = id.includes(':') ? id.split(':')[1] : id; return lessons.find((l) => l.id === k); };
export const levelOf = (l) => LEVELS[l.level] || LEVELS.beginner;

// "৪০–৫০ মিনিট" → ৫০ (উপরের সীমা, মিনিটে)
const fromBn = (s) => s.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));
export const minutesOf = (l) => {
  const n = fromBn(l.duration || '').match(/\d+(\.\d+)?/g)?.map(Number) || [30];
  const m = Math.max(...n);
  return /ঘণ্টা/.test(l.duration || '') ? m * 60 : m;
};

// Syllabus-এর unit: course.units থাকলে সেটা, নইলে প্রতিটি phase একটি unit
export const unitsOf = (courseId) => {
  const c = trackOf(courseId);
  const ph = phasesOf(courseId);
  const ls = lessonsOf(courseId);
  const groups = c.units || ph.map((p) => ({ title: p.bn, desc: p.desc, phases: [p.id] }));
  return groups.map((u) => ({ ...u, lessons: ls.filter((l) => u.phases.includes(l.phase)) }));
};
export const unitOf = (l) => unitsOf(l.track).find((u) => u.phases.includes(l.phase));
export const courseStats = (courseId) => {
  const ls = lessonsOf(courseId);
  const mins = ls.reduce((s, l) => s + minutesOf(l), 0);
  return { lessons: ls.length, labs: ls.reduce((s, l) => s + l.labs.length, 0), hours: Math.round(mins / 60) };
};

// একই feature — তিন দৃষ্টিকোণ (home page-এর knowledge map)
export const scenarios = [
  { name: 'User login', icon: '🔑', net: ['net-tls', 'HTTPS, TLS'], sd: ['sd-api', 'Auth API design'], sec: ['jwt', 'JWT, session security'] },
  { name: 'Product search', icon: '🔍', net: ['net-dns', 'DNS, HTTP'], sd: ['sd-caching', 'Caching, indexing'], sec: ['sqli', 'SQL injection'] },
  { name: 'Order creation', icon: '🛒', net: ['net-protocols', 'TCP, HTTP'], sd: ['sd-db-internals', 'Transactions, queues'], sec: ['authz', 'Authorization'] },
  { name: 'File upload', icon: '📤', net: ['net-http', 'HTTP, multipart'], sd: ['sd-storage', 'Object storage, CDN'], sec: ['upload', 'Malicious uploads'] },
  { name: 'High traffic', icon: '🌊', net: ['net-routing', 'TCP, routing'], sd: ['sd-lb', 'Load balancing, scaling'], sec: ['ddos', 'DDoS protection'] },
  { name: 'Database', icon: '🗄️', net: ['net-ports', 'Ports, connections'], sd: ['sd-scaling', 'Replication, sharding'], sec: ['postgres', 'Access control'] },
];

export const toBn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

export const severityInfo = {
  critical: { label: 'Critical', color: '#f87171' },
  high: { label: 'High', color: '#fb923c' },
  medium: { label: 'Medium', color: '#fbbf24' },
  info: { label: 'Fundamental', color: '#22d3ee' },
  core: { label: 'Core concept', color: '#22d3ee' },
  design: { label: 'Design pattern', color: '#a78bfa' },
};
