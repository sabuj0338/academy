// ───────── Course catalog
// নতুন কোর্স যোগ করতে: (১) এখানে একটি object যোগ করো, (২) curriculum.js-এ তার phases ও lessons জুড়ে দাও।
// বাকি সব — catalog card, course page, syllabus path, lesson player, handbook — নিজে থেকেই তৈরি হবে।
//
// level: 'beginner' | 'intermediate' | 'advanced'
// units: course page-এর syllabus-এ কয়েকটি phase একসাথে দেখানোর জন্য (না দিলে প্রতিটি phase একটি unit)
// lessonLevels: lesson id → level (না দিলে course-এর level)

export const LEVELS = {
  beginner: { bn: 'শুরু', label: 'Beginner', color: '#16a34a', dots: 1 },
  intermediate: { bn: 'মাঝারি', label: 'Intermediate', color: '#d97706', dots: 2 },
  advanced: { bn: 'উন্নত', label: 'Advanced', color: '#dc2626', dots: 3 },
};

export default [
  {
    id: 'net',
    icon: '🌐',
    title: 'Computer Networking',
    bn: 'নেটওয়ার্কিং',
    q: 'Internet আসলে কীভাবে চলে?',
    color: '#0ea5e9',
    grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    level: 'beginner',
    levelRange: 'একদম শুরু থেকে',
    tagline: 'একটা click থেকে পৃথিবীর অন্য প্রান্তের server পর্যন্ত — তোমার data-র পুরো যাত্রা নিজের চোখে দেখো।',
    desc: 'Browser থেকে router, DNS, সাগরের নিচের cable হয়ে server পর্যন্ত data কীভাবে ভ্রমণ করে।',
    audience: 'যে কেউ — programming না জানলেও চলবে',
    prerequisites: ['Computer আর browser চালাতে পারলেই যথেষ্ট', 'প্রতিটি নতুন শব্দ প্রথমবার আসার সাথে সাথেই সহজ ভাষায় বোঝানো হয়েছে'],
    outcomes: [
      'একটা website খুললে পর্দার আড়ালে কী কী ঘটে — ধাপে ধাপে বলতে পারবে',
      'IP address, DNS, port, router — শব্দগুলোর আসল মানে বুঝবে',
      'TCP, HTTP আর HTTPS কীভাবে data নির্ভুল ও নিরাপদে পৌঁছায়',
      'Internet ধীর বা বন্ধ হলে নিজেই কারণ খুঁজে বের করতে পারবে',
    ],
    units: [
      { title: 'Network-এর ভিত্তি', desc: 'Network কী, data কীভাবে খামে ভরে পাঠানো হয়, ঠিকানা কীভাবে কাজ করে', phases: [1, 2, 3, 4] },
      { title: 'Internet-এর ভাষা', desc: 'Device-রা কোন নিয়মে কথা বলে আর পথ খুঁজে নেয়', phases: [5, 6, 7, 8] },
      { title: 'Web ও নিরাপদ যোগাযোগ', desc: 'Browser কীভাবে page আনে, আর তালা-চিহ্নটা আসলে কী', phases: [9, 10] },
      { title: 'বাস্তবের দক্ষতা', desc: 'সমস্যা খোঁজা, আর বড় কোম্পানিগুলো যেসব কৌশল ব্যবহার করে', phases: [11, 12] },
    ],
    lessonLevels: { 'net-routing': 'intermediate', 'net-http': 'intermediate', 'net-tls': 'intermediate', 'net-troubleshoot': 'intermediate', 'net-advanced': 'advanced' },
  },
  {
    id: 'sd',
    icon: '🏗️',
    title: 'System Design',
    bn: 'সিস্টেম ডিজাইন',
    q: 'বড় app কীভাবে বানানো হয়?',
    color: '#8b5cf6',
    grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    level: 'intermediate',
    levelRange: 'শুরু → মাঝারি',
    tagline: 'ছোট একটা app কীভাবে লাখো মানুষের ভার সামলায় — server, database, cache, queue-কে কাজ করতে দেখো।',
    desc: 'ছোট app থেকে লাখো user সামলাতে পারে এমন দ্রুত, নির্ভরযোগ্য software-এর নকশা।',
    audience: 'যারা app বানাতে চায় বা software engineering interview-এর প্রস্তুতি নিচ্ছে',
    prerequisites: ['Networking কোর্সের প্রথম অর্ধেক — অথবা internet কীভাবে চলে তার মোটামুটি ধারণা', 'যেকোনো একটা programming ভাষার সামান্য ধারণা থাকলে ভালো, তবে বাধ্যতামূলক নয়'],
    outcomes: [
      'একটা app-এর প্রতিটি অংশ — server, database, cache, queue — কী কাজ করে',
      'User বাড়লে system কোথায় ভাঙে, আর কীভাবে বড় করতে হয়',
      'কখন কোন database, cache বা message queue বেছে নেবে',
      'একটা system-এর নকশা আঁকতে ও তার trade-off ব্যাখ্যা করতে পারবে',
    ],
    units: [
      { title: 'ভিত্তি ও নকশা', desc: 'Requirement বোঝা, architecture বাছাই আর API-র নকশা', phases: [1, 2, 3] },
      { title: 'Data-র জগৎ', desc: 'Database কীভাবে data রাখে, খোঁজে আর দ্রুত দেয়', phases: [4, 5, 6] },
      { title: 'বড় হওয়া ও টিকে থাকা', desc: 'Scale করা, ভার ভাগ করা, আর কিছু ভাঙলেও চালু থাকা', phases: [7, 8, 9, 10, 11] },
      { title: 'বাস্তব system', desc: 'File, real-time chat, monitoring আর deploy — সব একসাথে', phases: [12, 13, 14, 15, 16] },
    ],
    lessonLevels: { 'sd-fundamentals': 'beginner', 'sd-architecture': 'beginner', 'sd-api': 'beginner', 'sd-db-design': 'beginner', 'sd-distributed': 'advanced', 'sd-reliability': 'advanced', 'sd-observability': 'advanced', 'sd-advanced': 'advanced' },
  },
  {
    id: 'sec',
    icon: '🛡️',
    title: 'Web & Cyber Security',
    bn: 'সিকিউরিটি',
    q: 'App-কে কীভাবে সুরক্ষিত রাখব?',
    color: '#ec4899',
    grad: 'linear-gradient(135deg,#ec4899,#f97316)',
    level: 'intermediate',
    levelRange: 'শুরু → উন্নত',
    tagline: 'Hacker কীভাবে ভাবে, নিরাপদ sandbox-এ নিজে আক্রমণ চালিয়ে দেখো — তারপর শেখো কীভাবে ঠেকাতে হয়।',
    desc: 'Attacker-এর মতো ভাবো, defender-এর মতো বানাও — website, API, server ও database-এর নিরাপত্তা।',
    audience: 'Web developer, student, আর যারা cyber security-তে career শুরু করতে চায়',
    prerequisites: ['Networking কোর্স — বিশেষ করে HTTP ও TLS lesson দুটি', 'একটা সাধারণ website কীভাবে চলে তার ধারণা: form, server, database'],
    outcomes: [
      'XSS, SQL injection, CSRF-এর মতো সবচেয়ে সাধারণ আক্রমণ নিজের চোখে ঘটতে দেখবে',
      'প্রতিটি আক্রমণ ঠেকানোর সঠিক code চিনতে ও লিখতে পারবে',
      'Server, Docker ও database নিরাপদভাবে চালানোর checklist',
      'নিজের বা দলের app-এর একটা পূর্ণ security audit করতে পারবে',
    ],
    lessonLevels: {
      http: 'beginner', session: 'beginner', authz: 'beginner', recon: 'beginner', threat: 'beginner',
      xss: 'beginner', sqli: 'beginner', idor: 'beginner', bruteforce: 'beginner', secrets: 'beginner', encryption: 'beginner', backup: 'beginner', headers: 'beginner',
      linux: 'advanced', ssh: 'advanced', firewall: 'advanced', nginx: 'advanced', docker: 'advanced', ddos: 'advanced', tls: 'advanced',
      postgres: 'advanced', redis: 'advanced', scanning: 'advanced', logs: 'advanced', incident: 'advanced', capstone: 'advanced', pinning: 'advanced', oauth: 'advanced',
    },
  },
];

// ভবিষ্যতের কোর্স — catalog-এ “শীঘ্রই আসছে” কার্ড হিসেবে দেখায়
export const upcoming = [
  { icon: '☁️', title: 'Cloud ও DevOps', desc: 'Linux, Docker, CI/CD আর cloud-এ app চালানো' },
  { icon: '🗄️', title: 'Database গভীরে', desc: 'SQL শেখা থেকে query optimization পর্যন্ত' },
];
