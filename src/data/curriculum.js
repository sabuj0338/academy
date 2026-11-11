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

// ───────── তিনটি learning track
export const tracks = [
  { id: 'net', icon: '🌐', title: 'Computer Networking', bn: 'নেটওয়ার্কিং', q: 'কীভাবে যোগাযোগ হয়?', color: '#22d3ee', grad: 'linear-gradient(135deg,#0891b2,#2563eb)', desc: 'Browser থেকে router, DNS, internet হয়ে server পর্যন্ত data কীভাবে ভ্রমণ করে।' },
  { id: 'sd', icon: '🏗️', title: 'System Design', bn: 'সিস্টেম ডিজাইন', q: 'কীভাবে তৈরি হয়?', color: '#a78bfa', grad: 'linear-gradient(135deg,#7c3aed,#db2777)', desc: 'ছোট app থেকে লাখো user সামলাতে পারে এমন scalable, reliable architecture।' },
  { id: 'sec', icon: '🛡️', title: 'Application & Infrastructure Security', bn: 'সিকিউরিটি', q: 'কীভাবে সুরক্ষিত রাখব?', color: '#f472b6', grad: 'linear-gradient(135deg,#db2777,#ea580c)', desc: 'Attacker-এর মতো ভাবো, defender-এর মতো বানাও — web, API, server, database।' },
];

const secPhases = [
  { id: 1, title: 'Security Fundamentals', bn: 'ভিত্তি', color: '#22d3ee', desc: 'HTTP, session, AuthN/AuthZ, recon, threat modeling' },
  { id: 2, title: 'Common Web Attacks', bn: 'সাধারণ ওয়েব আক্রমণ', color: '#f472b6', desc: 'XSS, CSRF, SQLi, IDOR, SSRF, upload, traversal…' },
  { id: 3, title: 'API & Mobile Security', bn: 'API ও মোবাইল', color: '#a78bfa', desc: 'Mass assignment, JWT, OAuth, rate limit, CORS, mobile' },
  { id: 4, title: 'Server & Deployment', bn: 'সার্ভার ও ডিপ্লয়মেন্ট', color: '#fb923c', desc: 'Linux, SSH, firewall, Nginx, Docker, Cloudflare, TLS' },
  { id: 5, title: 'Database & Data', bn: 'ডেটাবেস ও ডেটা', color: '#fbbf24', desc: 'PostgreSQL, Redis, secrets, encryption, backup' },
  { id: 6, title: 'Testing & Monitoring', bn: 'টেস্টিং ও মনিটরিং', color: '#4ade80', desc: 'Headers, deps, Burp/ZAP, logs, incident response, audit' },
];

export const phases = [
  ...netPhases.map((p) => ({ ...p, track: 'net' })),
  ...sdPhases.map((p) => ({ ...p, track: 'sd' })),
  ...secPhases.map((p) => ({ ...p, track: 'sec' })),
];

const secLessons = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6].map((l) => {
  const e = enrich[l.id] || {};
  return { ...l, track: 'sec', simple: l.simple || simple[l.id], terms: l.terms || e.terms, steps: l.steps.map((st, i) => ({ ...st, ...(e.steps?.[i] || {}) })) };
});

// Recommended sequence: Networking → System Design → Security
export const lessons = [
  ...netLessons.map((l) => ({ ...l, track: 'net' })),
  ...sdLessons.map((l) => ({ ...l, track: 'sd' })),
  ...secLessons,
];

export const trackOf = (id) => tracks.find((t) => t.id === id) || tracks[0];
export const phasesOf = (track) => phases.filter((p) => p.track === track);
export const lessonsOf = (track) => lessons.filter((l) => l.track === track);
export const phaseOf = (l) => phases.find((p) => p.track === l.track && p.id === l.phase);
export const lessonById = (id) => { const k = id.includes(':') ? id.split(':')[1] : id; return lessons.find((l) => l.id === k); };

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
