// Cloud ও DevOps কোর্স — Lesson 01–04 (Cloud, Linux, Git, Docker)
const ask = (q, options, answer, why) => ({ q, options, answer, why });

const REGIONS = [
  { id: 'dhaka', name: 'ঢাকা (তোমার user)', lat: 23.8, lon: 90.4, kind: 'user' },
  { id: 'mumbai', name: 'Mumbai — ap-south-1', lat: 19.07, lon: 72.87, kind: 'edge' },
  { id: 'sg', name: 'Singapore — ap-southeast-1 (AZ-a)', lat: 1.35, lon: 103.8, kind: 'edge' },
  { id: 'sgb', name: 'Singapore AZ-b (আরেক ভবন)', lat: 1.45, lon: 104.0, kind: 'edge' },
  { id: 'frankfurt', name: 'Frankfurt — eu-central-1', lat: 50.1, lon: 8.7, kind: 'server' },
  { id: 'virginia', name: 'Virginia — us-east-1', lat: 38.9, lon: -77.4, kind: 'server' },
];

export default [
  // ─────────────────────────────── 01 · Cloud
  {
    id: 'cd-cloud',
    phase: 1,
    no: '01',
    icon: '☁️',
    title: 'Cloud কী? — অন্যের computer ভাড়া নেওয়া',
    subtitle: 'নিজের server কেনা বনাম ভাড়া — IaaS, PaaS, SaaS, region ও খরচ',
    duration: '৪০–৫০ মিনিট',
    simple: 'Cloud মানে আকাশে ভাসা কিছু নয় — অন্য কোম্পানির বিশাল data center-এর computer, যেটা তুমি internet দিয়ে ভাড়া নাও। বিদ্যুৎ যেমন নিজে না বানিয়ে লাইন থেকে নাও আর যতটুকু খরচ করো ততটুকু বিল দাও, cloud-ও তেমন: যতক্ষণ চালাও, ততক্ষণের টাকা।',
    goals: ['Cloud কেন এল, আর নিজের server-এর সাথে পার্থক্য', 'IaaS, PaaS, SaaS ও serverless — কে কতটুকু সামলায়', 'Region ও Availability Zone কেন দরকার', 'Cloud-এ খরচ কীভাবে হিসাব হয়'],
    terms: [
      ['Cloud', 'Internet দিয়ে ভাড়া নেওয়া computing — server, storage, database'],
      ['Data center', 'হাজারো server রাখা বিশাল ভবন — বিদ্যুৎ, ঠান্ডা রাখার ব্যবস্থা ও পাহারা সহ'],
      ['IaaS', 'Infrastructure as a Service — শুধু virtual machine ভাড়া, বাকি সব তোমার'],
      ['PaaS', 'Platform as a Service — তুমি code দাও, চালানোর দায়িত্ব cloud-এর'],
      ['SaaS', 'Software as a Service — তৈরি software, শুধু ব্যবহার করো (যেমন Gmail)'],
      ['Region', 'পৃথিবীর একটি এলাকায় cloud-এর data center-এর গুচ্ছ (যেমন Singapore)'],
      ['Availability Zone (AZ)', 'একই region-এর ভেতরে আলাদা ভবন — একটায় সমস্যা হলে অন্যটা চলে'],
    ],
    steps: [
      {
        title: 'Cloud আসার আগে — নিজের server-এর ঝামেলা',
        body: 'একসময় একটা website চালাতে হলে server কিনতে হতো, ঘরে বা অফিসে রাখতে হতো, বিদ্যুৎ-AC-internet-এর ব্যবস্থা করতে হতো, আর নষ্ট হলে নিজে মেরামত। User বাড়লে নতুন server কিনে আনতে সপ্তাহ লেগে যেত; আবার ঈদের sale শেষে সেই বাড়তি server মাসের পর মাস বসে থাকত।',
        analogy: 'নিজের server হলো বাড়িতে নিজের জেনারেটর বসানো — কেনা, তেল, মেরামত সব তোমার। Cloud হলো বিদ্যুতের লাইন: সুইচ টিপলেই আলো, মাস শেষে মিটার দেখে বিল।',
        maps: [['🔌 বিদ্যুতের লাইন', 'Cloud provider'], ['💡 সুইচ টেপা', 'নতুন server চালু করা'], ['🧾 মিটারের বিল', 'Pay-as-you-go বিল']],
        compare: [
          { title: '🏢 নিজের server (on-premise)', items: ['শুরুতেই অনেক টাকা — server কেনা', 'নতুন server পেতে সপ্তাহ', 'বিদ্যুৎ, AC, মেরামত তোমার মাথাব্যথা', 'বাড়তি capacity বসে থাকে'] },
          { title: '☁️ Cloud', items: ['শুরুতে প্রায় শূন্য খরচ', 'মিনিটে নতুন server', 'Hardware-এর ঝামেলা provider-এর', 'যতটুকু চালাও, ততটুকু টাকা'] },
        ],
      },
      {
        title: 'Virtualization — এক computer, অনেক computer',
        body: 'Cloud-এর জাদুর মূলে আছে virtualization। Data center-এর একটা বিশাল physical server-কে hypervisor নামের software কয়েক টুকরো `virtual machine` (VM)-এ ভাগ করে। প্রতিটা VM নিজেকে আলাদা একটা computer মনে করে — নিজের CPU, RAM, disk, operating system। তাই cloud কোম্পানি মিনিটে লাখো এমন VM বানিয়ে ভাড়া দিতে পারে।',
        analogy: 'একটা বিশাল apartment building (physical server)। Building-টা ভাগ করে অনেকগুলো flat (VM) — প্রতিটা flat-এর নিজের দরজা, তালা, রান্নাঘর। এক flat-এর লোক পাশের flat-এ ঢুকতে পারে না, যদিও সবাই একই ভিত্তির উপর দাঁড়িয়ে।',
        layers: {
          title: 'একটি physical server-এর ভেতরে (উপর থেকে নিচে)',
          items: [
            ['🧩', 'তোমার app', 'Node.js website, database — যা তুমি চালাতে চাও'],
            ['🐧', 'Guest OS (Linux)', 'প্রতিটা VM-এর নিজস্ব operating system'],
            ['📦', 'Virtual Machine (VM)', 'তোমার ভাড়া নেওয়া “computer” — যেমন 2 CPU, 4 GB RAM'],
            ['🎛️', 'Hypervisor', 'এক machine-কে অনেক VM-এ ভাগ করার software (KVM, Xen)'],
            ['🖥️', 'Physical hardware', 'আসল CPU, RAM, disk — data center-এর rack-এ'],
          ],
        },
      },
      {
        title: 'IaaS, PaaS, SaaS — কে কতটুকু সামলায়',
        body: 'Cloud service-গুলোকে তিন ভাগে ভাগ করা হয়, পার্থক্য শুধু একটাই — কতটুকু কাজ তোমার, কতটুকু provider-এর। নিচে যত যাও, তত কম ঝামেলা কিন্তু তত কম স্বাধীনতা।',
        analogy: 'Pizza খাওয়ার চার উপায়: বাড়িতে আটা মেখে বানানো (নিজের server), frozen pizza কিনে নিজের ovenে গরম করা (IaaS), delivery আনিয়ে নিজের টেবিলে খাওয়া (PaaS), আর restaurant-এ গিয়ে খাওয়া (SaaS)।',
        maps: [['🏠 বাড়িতে pizza বানানো', 'On-premise'], ['🧊 Frozen pizza', 'IaaS'], ['🛵 Home delivery', 'PaaS'], ['🍽️ Restaurant', 'SaaS']],
        points: [
          '🖥️ IaaS: একটা ফাঁকা VM পাও — OS update, security patch, app সব তোমার। যেমন AWS EC2, DigitalOcean Droplet।',
          '🚀 PaaS: শুধু code push করো — server, OS, scaling ওদের। যেমন Render, Railway, Vercel, Heroku।',
          '📧 SaaS: তৈরি software, শুধু ব্যবহার। যেমন Gmail, Google Docs, Slack।',
          '⚡ Serverless: শুধু একটা function — request এলে চলে, না এলে খরচ শূন্য। যেমন AWS Lambda, Cloudflare Workers।',
        ],
        ask: ask('তুমি শুধু code লিখতে চাও; server-এর OS update বা security patch নিয়ে মাথা ঘামাতে চাও না। কোনটা বাছবে?', ['PaaS (যেমন Render, Vercel)', 'IaaS (একটা ফাঁকা VM)', 'নিজের ঘরে server'], 0, 'PaaS-এ তুমি শুধু app দাও; নিচের সব স্তর provider সামলায়। শুরু করার জন্য এটাই সবচেয়ে সহজ পথ।'),
      },
      {
        title: 'Region ও Availability Zone',
        body: 'AWS, Google Cloud, Azure-এর data center পৃথিবীর অনেক জায়গায়। Region মানে একটা এলাকা — যেমন `ap-southeast-1` (Singapore), `ap-south-1` (Mumbai)। প্রতিটা region-এ ২ থেকে ৬টা Availability Zone (AZ): আলাদা ভবন, আলাদা বিদ্যুৎ, কয়েক কিলোমিটার দূরে, কিন্তু দ্রুত fiber দিয়ে যুক্ত। তোমার user বাংলাদেশে হলে কাছের region বাছো — latency কম হবে। আর দুটো AZ-এ server রাখলে এক ভবনে আগুন লাগলেও site চালু থাকে।',
        bars: { title: 'ঢাকা থেকে বিভিন্ন region-এ round trip (আনুমানিক)', items: [['Mumbai', 45, '~৪৫ ms', 'good'], ['Singapore', 55, '~৫৫ ms', 'good'], ['Frankfurt', 160, '~১৬০ ms'], ['Virginia (US)', 240, '~২৪০ ms', 'bad']] },
        tip: 'Data কোথায় রাখছ সেটা আইনেরও বিষয় — কিছু দেশে নাগরিকের ব্যক্তিগত data দেশের বাইরে রাখার নিয়ম কড়া। বড় project-এ region বাছার আগে এটা জেনে নিও।',
      },
      {
        title: 'Shared responsibility — নিরাপত্তা কার দায়িত্ব?',
        body: 'Cloud provider দায়ী ভবন, hardware আর hypervisor নিরাপদ রাখার জন্য — “cloud-এর নিরাপত্তা”। তুমি দায়ী তোমার app, data, password আর কে কী access পাবে তার জন্য — “cloud-এর ভেতরের নিরাপত্তা”। বাস্তবে বেশিরভাগ cloud data leak provider-এর দোষে হয় না — হয় ভুল setting-এ, যেমন সবার জন্য খোলা রাখা storage bucket।',
        compare: [
          { title: '☁️ Provider-এর দায়িত্ব', color: '#0ea5e9', items: ['Data center-এর পাহারা ও বিদ্যুৎ', 'Physical server ও network', 'Hypervisor ও VM-এর আলাদা থাকা', '(PaaS-এ) OS update'] },
          { title: '🧑 তোমার দায়িত্ব', color: '#f59e0b', items: ['Account-এর password ও MFA', 'কে কোন জিনিস access পাবে (IAM)', 'তোমার data ও তার encryption', 'App-এর code ও তার bug'] },
        ],
        warn: 'Cloud account-এর মূল (root) login-এ প্রথম দিনেই MFA (দুই ধাপের যাচাই) চালু করো — এই একটা account দিয়ে পুরো ব্যবসা মুছে ফেলা যায়।',
      },
      {
        title: 'খরচ — যত চালাও তত টাকা',
        body: 'Cloud-এ বিল হয় ব্যবহার অনুযায়ী — প্রতি ঘণ্টা বা প্রতি সেকেন্ড। মনে রাখো: চালু থাকা server ফাঁকা বসে থাকলেও বিল হয়; বাইরে (internet-এ) data পাঠানো (egress) টাকা লাগে, আর ভেতরে আনা সাধারণত বিনামূল্যে। শেখার সময় free tier ব্যবহার করো আর প্রথম দিনেই budget alert বসাও।',
        points: [
          '⏱️ On-demand: যখন খুশি চালু-বন্ধ, কিন্তু প্রতি ঘণ্টার দাম সবচেয়ে বেশি',
          '📅 Reserved / Savings plan: ১–৩ বছরের প্রতিশ্রুতি দিলে অনেক কম দাম',
          '🎲 Spot: খালি পড়ে থাকা capacity খুব সস্তায় — কিন্তু provider যেকোনো মুহূর্তে কেড়ে নিতে পারে',
          '📤 Egress: internet-এ data পাঠানোর খরচ — video site-এর বিলের বড় অংশ',
        ],
        ask: ask('Weekend-এ test করার জন্য একটা বড় server চালু করেছিলে, তারপর ভুলে গেছ। কী হবে?', ['মাস শেষে পুরো সময়ের বিল আসবে', 'ব্যবহার না হলে বিল হয় না', 'Cloud নিজে থেকেই বন্ধ করে দেবে'], 0, 'চালু থাকা মানেই বিল — কাজ হোক বা না হোক। তাই budget alert আর কাজ শেষে বন্ধ করার অভ্যাস জরুরি।'),
      },
    ],
    labs: [
      {
        type: 'arch3d',
        title: '3D দায়িত্বের টাওয়ার — কে কোন তলা সামলায়?',
        intro: 'একটা app চালাতে নিচ থেকে উপর পর্যন্ত সাতটা তলা লাগে। প্রতিটা তলায় ক্লিক করে দেখো — কোন model-এ সেটা তোমার কাজ, আর কোন model-এ cloud-এর। সব তলা দেখলে lab সম্পূর্ণ।',
        leftKey: 'you',
        rightKey: 'cloud',
        leftTitle: '🧑 তুমি সামলাও',
        rightTitle: '☁️ Cloud সামলায়',
        layers: [
          { name: 'Data ও access', sub: 'কোন data, কে দেখতে পারবে', color: '#f472b6', you: ['সব model-এ — নিজের data আর access সবসময় তোমার দায়িত্ব'], cloud: ['কখনো পুরোটা নয় — শুধু encryption-এর সুবিধা দেয়'] },
          { name: 'Application', sub: 'তোমার code', color: '#e879f9', you: ['On-premise, IaaS, PaaS'], cloud: ['SaaS — তুমি শুধু ব্যবহার করো'] },
          { name: 'Runtime', sub: 'Node.js, Python …', color: '#a78bfa', you: ['On-premise, IaaS'], cloud: ['PaaS, SaaS, Serverless'] },
          { name: 'Operating system', sub: 'Linux, update, patch', color: '#818cf8', you: ['On-premise, IaaS — security patch তোমার'], cloud: ['PaaS, SaaS, Serverless'] },
          { name: 'Virtual machine', sub: 'Hypervisor ও VM', color: '#60a5fa', you: ['শুধু On-premise'], cloud: ['IaaS থেকে বাকি সব'] },
          { name: 'Physical server', sub: 'CPU, RAM, disk, network', color: '#38bdf8', you: ['শুধু On-premise — কেনা ও মেরামত'], cloud: ['IaaS, PaaS, SaaS, Serverless'] },
          { name: 'Data center ভবন', sub: 'বিদ্যুৎ, AC, পাহারা', color: '#22d3ee', you: ['শুধু On-premise'], cloud: ['সব cloud model'] },
        ],
      },
      {
        type: 'classify',
        title: 'কোনটা IaaS, PaaS, SaaS?',
        intro: 'প্রতিটা কার্ড বেছে সঠিক বাক্সে রাখো। প্রশ্নটা একটাই: “এখানে আমাকে কতটুকু সামলাতে হবে?”',
        buckets: [{ id: 'iaas', label: '🖥️ IaaS (ফাঁকা VM)', color: '#38bdf8' }, { id: 'paas', label: '🚀 PaaS (code দাও, চালাবে ওরা)', color: '#a78bfa' }, { id: 'saas', label: '📧 SaaS (শুধু ব্যবহার)', color: '#4ade80' }],
        items: [
          { text: 'AWS EC2-তে একটা Ubuntu VM', bucket: 'iaas', explain: 'ফাঁকা VM — OS থেকে app সব তোমার।' },
          { text: 'DigitalOcean Droplet', bucket: 'iaas', explain: 'Droplet মানে VM — IaaS।' },
          { text: 'Google Compute Engine', bucket: 'iaas', explain: 'Google-এর VM service।' },
          { text: 'Render-এ git push করে Node.js app deploy', bucket: 'paas', explain: 'তুমি code দাও, server চালায় Render।' },
          { text: 'Vercel-এ React website', bucket: 'paas', explain: 'Build, hosting, CDN — সব platform-এর।' },
          { text: 'Heroku', bucket: 'paas', explain: 'PaaS-এর পুরনো ও বিখ্যাত উদাহরণ।' },
          { text: 'Gmail', bucket: 'saas', explain: 'তৈরি software — তুমি শুধু ব্যবহার করো।' },
          { text: 'Google Docs', bucket: 'saas', explain: 'Browser-এ খোলো, লেখো — কিছুই চালাতে হয় না।' },
          { text: 'Zoom', bucket: 'saas', explain: 'সম্পূর্ণ তৈরি service।' },
        ],
      },
      {
        type: 'globe',
        title: '3D Globe — কোন region বাছবে?',
        intro: 'তোমার user ঢাকায়। Server কোথায় রাখলে কত দ্রুত উত্তর আসে দেখো, আর একটা AZ বন্ধ হলে কী হয় দেখো। Mouse দিয়ে পৃথিবী ঘোরাও।',
        cities: REGIONS,
        scenarios: [
          { id: 'near', name: 'কাছের region (Singapore)', desc: 'বাংলাদেশের user-দের জন্য সবচেয়ে প্রচলিত পছন্দ।', routes: [
            { from: 'dhaka', to: 'sg', label: 'request → ap-southeast-1', color: '#22d3ee', desc: 'বঙ্গোপসাগরের নিচের cable দিয়ে Singapore — কয়েক হাজার কিলোমিটার।' },
            { from: 'sg', to: 'dhaka', label: 'response (~৫৫ ms)', color: '#4ade80', desc: 'পুরো round trip ১০০ ms-এর অনেক কম — page দ্রুত লাগে।' },
          ] },
          { id: 'far', name: 'দূরের region (Virginia)', desc: 'অনেক টিউটোরিয়ালের default region us-east-1 — কিন্তু তোমার user-দের থেকে অনেক দূরে।', routes: [
            { from: 'dhaka', to: 'virginia', label: 'request → us-east-1', color: '#fb923c', desc: 'অর্ধেক পৃথিবী পার — আলোরও সময় লাগে।' },
            { from: 'virginia', to: 'dhaka', label: 'response (~২৪০ ms)', color: '#f472b6', desc: 'প্রতিটা request-এ প্রায় চার গুণ বেশি সময়। Page-এ ২০টা request থাকলে পার্থক্যটা চোখে পড়ে।' },
          ] },
          { id: 'az', name: 'একটা AZ বন্ধ হলে', kind: 'fail', desc: 'দুটো AZ-এ server থাকলে একটা ভবনের সমস্যায় site বন্ধ হয় না।', routes: [
            { from: 'dhaka', to: 'sg', label: 'AZ-a 🔥 বন্ধ', color: '#f87171', desc: 'বিদ্যুৎ বিভ্রাটে AZ-a-র সব server বন্ধ হয়ে গেল!' },
            { from: 'dhaka', to: 'sgb', label: 'load balancer → AZ-b', color: '#fbbf24', desc: 'Load balancer সুস্থ AZ-b-তে পাঠিয়ে দিল। User কিছুই টের পেল না।' },
            { from: 'sgb', to: 'dhaka', label: 'response ✓', color: '#4ade80', desc: 'শিক্ষা: গুরুত্বপূর্ণ app সবসময় অন্তত দুটো AZ-এ চালাও।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'Cloud-এর সবচেয়ে বড় সুবিধা কোনটা?', options: ['মিনিটে server পাওয়া, যতটুকু চালাও ততটুকু টাকা', 'সবসময় বিনামূল্যে', 'Internet ছাড়াই চলে', 'কখনো নষ্ট হয় না'], answer: 0, explain: 'দ্রুততা আর ব্যবহার-অনুযায়ী খরচই cloud-এর মূল কথা। বিনামূল্যে নয়, আর সমস্যাও হয় — তাই multi-AZ।' },
      { q: 'Render বা Vercel-এ শুধু code push করে site চালানো — কোন model?', options: ['SaaS', 'IaaS', 'PaaS', 'On-premise'], answer: 2, explain: 'Code তোমার, চালানো platform-এর — এটাই PaaS।' },
      { q: 'Availability Zone কেন দরকার?', options: ['এক ভবনে সমস্যা হলেও অন্য ভবনে app চালু রাখতে', 'দাম কমাতে', 'বেশি RAM পেতে', 'Domain কিনতে'], answer: 0, explain: 'AZ হলো আলাদা ভবন, আলাদা বিদ্যুৎ — একটা ডুবলে অন্যটা চলে।' },
      { q: 'তোমার storage bucket ভুল করে সবার জন্য খোলা। দায় কার?', options: ['তোমার — setting তোমার দায়িত্ব', 'Cloud কোম্পানির', 'কারো না', 'Internet-এর'], answer: 0, explain: 'Shared responsibility: hardware provider-এর, setting ও access তোমার।' },
      { q: 'বাংলাদেশের user-দের জন্য কোন region যুক্তিসঙ্গত?', options: ['কাছের region — যেমন Singapore বা Mumbai', 'সবচেয়ে সস্তা যেকোনো দেশ', 'যেকোনো একটা, পার্থক্য নেই', 'সবসময় আমেরিকা'], answer: 0, explain: 'কাছের region = কম latency = দ্রুত app।' },
    ],
    cheat: {
      category: 'Cloud Basics',
      severity: 'core',
      summary: 'Cloud = internet দিয়ে ভাড়া নেওয়া computer। IaaS-এ বেশি স্বাধীনতা ও দায়িত্ব, PaaS-এ শুধু code, SaaS-এ শুধু ব্যবহার। কাছের region, দুটো AZ, আর প্রথম দিন থেকে MFA ও budget alert।',
      rules: ['শুরুতে PaaS — দরকার হলে তবেই IaaS', 'User-দের কাছের region বাছো', 'গুরুত্বপূর্ণ app অন্তত ২টা AZ-এ', 'Root account-এ MFA, দৈনন্দিন কাজে আলাদা user', 'চালু = বিল; কাজ শেষে বন্ধ করো'],
      checklist: ['Root account-এ MFA চালু?', 'Budget alert বসানো?', 'কোন region-এ কী চলছে জানি?', 'অব্যবহৃত server বন্ধ?'],
      commands: ['aws configure', 'aws ec2 describe-regions --output table', 'aws ec2 describe-instances --region ap-southeast-1'],
      remember: 'Cloud হলো অন্যের computer — কিন্তু তার setting-এর দায় তোমার।',
    },
    related: ['net-basics', 'sd-scaling'],
  },

  // ─────────────────────────────── 02 · Linux
  {
    id: 'cd-linux',
    phase: 2,
    no: '02',
    icon: '🐧',
    title: 'Linux command line — server-এর ভাষা',
    subtitle: 'Terminal, ফাইল, permission, process আর package — mouse ছাড়া server চালানো',
    duration: '৫০–৬০ মিনিট',
    simple: 'প্রায় সব cloud server-এ Linux চলে, আর সেখানে mouse নেই — শুধু লেখা command। Terminal হলো server-এর সাথে কথা বলার chat window: তুমি লেখো “ফাইলগুলো দেখাও” (ls), server উত্তর দেয়। কয়েকটা command শিখলেই পুরো server নিজের হাতে।',
    goals: ['Terminal, shell ও একটা command-এর গঠন', 'ফাইল-ফোল্ডারে চলাফেরা: pwd, ls, cd, mkdir, cat', 'Permission (rwx) ও sudo', 'Process, service, log আর package install'],
    terms: [
      ['Terminal', 'লেখা দিয়ে computer চালানোর জানালা'],
      ['Shell (bash)', 'Terminal-এ লেখা command বুঝে চালায় যে program'],
      ['Path', 'ফাইলের ঠিকানা — যেমন /var/log/nginx/error.log'],
      ['sudo', '“admin হিসেবে চালাও” — বিশেষ ক্ষমতার command-এর আগে বসে'],
      ['Process', 'চলমান একটা program'],
      ['Service', 'Background-এ সবসময় চালু থাকা process — যেমন nginx'],
      ['Package manager (apt)', 'Program install ও update করার app store'],
    ],
    steps: [
      {
        title: 'কেন Linux?',
        body: 'পৃথিবীর বেশিরভাগ cloud server আর প্রায় সব container-এর ভেতরে Linux চলে — এটা বিনামূল্যে, হালকা আর স্থিতিশীল। Ubuntu আর Debian সবচেয়ে প্রচলিত। Server-এ সাধারণত কোনো screen বা mouse থাকে না; তুমি নিজের laptop থেকে SSH দিয়ে ঢুকে command লিখে সব কাজ করো।',
        analogy: 'Menu-র ছবিতে আঙুল দিয়ে order দেওয়া হলো GUI। রাঁধুনিকে সরাসরি বলা “দুটো ডিম পোচ, লবণ কম, সাথে টোস্ট” হলো terminal — একটু শিখতে হয়, কিন্তু অনেক দ্রুত, আর ঠিক যা চাও তাই পাও।',
        chain: [['💻', 'তোমার laptop'], ['🔐', 'ssh user@server', 'encrypted'], ['🐧', 'Linux server'], ['⌨️', 'bash shell'], ['📄', 'command চলে', 'output ফেরে']],
      },
      {
        title: 'একটা command-এর গঠন',
        body: 'প্রায় সব Linux command একই ছাঁচে লেখা: আগে command (কী করবে), তারপর option (কীভাবে করবে), তারপর argument (কিসের উপর করবে)। কোনো command না চিনলে `man ls` বা `ls --help` লেখো — নিজের manual নিজেই দেখায়।',
        anatomy: {
          title: 'ls -la /var/log — টুকরো টুকরো করে',
          parts: [
            ['ls', 'Command', '“list” — ফাইলের তালিকা দেখাও।'],
            [' ', ''],
            ['-la', 'Option (flag)', '-l = বিস্তারিত (size, তারিখ, permission), -a = লুকানো ফাইলও দেখাও (যাদের নাম . দিয়ে শুরু)।'],
            [' ', ''],
            ['/var/log', 'Argument', 'কোন folder-এর তালিকা। না দিলে এখন যে folder-এ আছো সেটার।'],
          ],
        },
        tip: 'Tab চাপলে ফাইল বা command-এর নাম নিজে পূর্ণ হয়; ↑ চাপলে আগের command ফিরে আসে। এই দুটো অভ্যাস করলেই অর্ধেক টাইপিং বেঁচে যায়।',
      },
      {
        title: 'File system — উল্টো গাছ',
        body: 'Windows-এ C:, D: আলাদা drive। Linux-এ সব কিছু একটা গাছের মতো `/` (root) থেকে শুরু হয়। তুমি সবসময় কোনো একটা folder-এর “ভেতরে” থাকো, আর cd দিয়ে এক folder থেকে আরেক folder-এ যাও।',
        points: [
          '🏠 /home/rafi: তোমার নিজের ফাইল (ছোট করে ~ লেখা যায়)',
          '⚙️ /etc: সব setting (config) ফাইল — যেমন /etc/nginx/',
          '📜 /var/log: log ফাইল — কিছু ভাঙলে প্রথমে এখানে খোঁজো',
          '🗑️ /tmp: অস্থায়ী ফাইল — restart-এ মুছে যেতে পারে',
          '🧰 /usr/bin: install করা program (ls, git, node)',
        ],
        code: [{ label: 'চলাফেরার মূল command', lang: 'bash', text: `pwd                 # আমি এখন কোথায়?  → /home/rafi
ls                  # এখানে কী কী আছে?
cd /var/log         # অন্য folder-এ যাও
cd ..               # এক ধাপ উপরে
cd ~                # নিজের home-এ ফেরো
mkdir projects      # নতুন folder বানাও
cat notes.txt       # ছোট ফাইলের লেখা দেখাও
less big.log        # বড় ফাইল পাতা পাতা করে (q দিয়ে বের হও)
tail -f app.log     # log-এর শেষ লাইনগুলো লাইভ দেখো (Ctrl+C দিয়ে থামো)` }],
      },
      {
        title: 'Permission — কে কী করতে পারবে',
        body: 'Linux-এ প্রতিটা ফাইলের একজন মালিক আর একটা group থাকে। মালিক, group আর বাকি সবার জন্য আলাদা তিনটা অনুমতি: r (পড়া), w (লেখা), x (চালানো)। সাধারণ user সিস্টেমের ফাইল বদলাতে পারে না — admin-এর কাজে `sudo` লাগে।',
        anatomy: {
          title: 'ls -l-এর একটা লাইন',
          parts: [
            ['-', 'ধরন', '- = সাধারণ ফাইল, d = folder।'],
            ['rwx', 'মালিক', 'rafi পড়তে, লিখতে ও চালাতে পারে।'],
            ['r-x', 'Group', 'devs group-এর সদস্যরা পড়তে ও চালাতে পারে, বদলাতে পারে না।'],
            ['---', 'বাকি সবাই', 'অন্য কেউ কিছুই পারে না।', 'good'],
            ['  rafi devs  ', ''],
            ['deploy.sh', ''],
          ],
          note: 'সংখ্যায় লেখা: r=4, w=2, x=1 → rwx = 7, r-x = 5, --- = 0 → chmod 750 deploy.sh',
        },
        code: [{ label: 'Permission বদলানো', lang: 'bash', text: `chmod +x deploy.sh        # script-টা চালানোর অনুমতি দাও
chmod 600 .env            # শুধু মালিক পড়বে-লিখবে (secret ফাইলের জন্য)
sudo chown www-data uploads/   # মালিক বদলাও (admin লাগে)` }],
        warn: 'sudo মানে “আমি admin হিসেবে করছি” — ভুল command-ও কোনো প্রশ্ন ছাড়াই চলবে। Internet থেকে copy করা sudo command কী করে না বুঝে কখনো চালিয়ো না।',
        ask: ask('chmod 600 .env দিলে কী হয়?', ['শুধু মালিক পড়তে ও লিখতে পারে, আর কেউ না', 'সবাই পড়তে পারে', 'ফাইল মুছে যায়'], 0, '6 = পড়া (4) + লেখা (2) মালিকের জন্য; group ও বাকিদের 0 — কিছুই না। Password-ওয়ালা ফাইলের জন্য ঠিক এটাই চাই।'),
      },
      {
        title: 'Process, service ও log — কী চলছে?',
        body: 'যে program চলছে সেটা process। Web server বা database-এর মতো জিনিস সবসময় চালু রাখতে service হিসেবে চালানো হয় (systemd দিয়ে) — crash করলে বা server restart হলে নিজে থেকেই আবার চালু হয়। কোনো service কাজ না করলে আগে তার status আর log দেখো।',
        analogy: '`|` (pipe) হলো কারখানার conveyor belt — প্রথম মেশিনের (ps aux) পুরো output দ্বিতীয় মেশিনে (grep) ঢুকে ছাঁকা হয়ে বেরোয়।',
        code: [{ label: 'Server-এর হালচাল', lang: 'bash', text: `ps aux | grep node          # node process চলছে কি?
top                         # কে কতটা CPU/RAM খাচ্ছে (q দিয়ে বের হও)
systemctl status nginx      # service-এর অবস্থা
sudo systemctl restart nginx
journalctl -u nginx -n 50   # service-এর শেষ ৫০ লাইন log
df -h                       # disk কতটা ভরা
free -h                     # RAM কতটা খালি` }],
        tip: 'Server “ধীর” বা “বন্ধ” লাগলে এই ক্রমে দেখো: df -h (disk ভরে গেছে?), free -h (RAM শেষ?), top (কে CPU খাচ্ছে?), তারপর সংশ্লিষ্ট service-এর log।',
      },
      {
        title: 'Package manager — server-এর app store',
        body: 'Ubuntu-তে program install করা হয় `apt` দিয়ে। আগে `sudo apt update` (কোন program-এর কোন version পাওয়া যায় তার তালিকা হালনাগাদ), তারপর `sudo apt install nginx`। নিয়মিত `sudo apt upgrade` মানে security patch — এটা না করলে পুরনো ফুটো খোলা থাকে।',
        chain: [['📋', 'apt update', 'তালিকা আনো'], ['⬇️', 'apt install nginx', 'নামাও ও বসাও'], ['🔧', 'service চালু', 'systemctl'], ['✅', 'status দেখো', 'active (running)']],
        tip: 'Server-এ শুধু যা দরকার তাই install করো — প্রতিটা বাড়তি program মানে বাড়তি update আর বাড়তি ঝুঁকি।',
      },
    ],
    labs: [
      {
        type: 'terminal',
        preset: 'linux101',
        title: 'প্রথম Linux server — ঘুরে দেখো ও সারাও',
        intro: 'তুমি একটা নতুন Ubuntu server-এ SSH দিয়ে ঢুকেছ। Site একটু আগে বন্ধ হয়ে গিয়েছিল। চারপাশ ঘুরে দেখো, log পড়ো, কারণ খুঁজে বের করো আর ঠিক করো। আটকে গেলে “help” লেখো।',
      },
      {
        type: 'classify',
        title: 'কোন command কোন কাজের?',
        intro: 'প্রতিটা command বেছে সঠিক বাক্সে রাখো।',
        buckets: [{ id: 'files', label: '📁 ফাইল ও folder', color: '#38bdf8' }, { id: 'sys', label: '⚙️ Process, service ও সিস্টেম', color: '#a78bfa' }, { id: 'admin', label: '🔐 Permission ও admin', color: '#f472b6' }],
        items: [
          { text: 'ls -la', bucket: 'files', explain: 'ফাইলের বিস্তারিত তালিকা।' },
          { text: 'cd /etc/nginx', bucket: 'files', explain: 'অন্য folder-এ যাওয়া।' },
          { text: 'mkdir backups', bucket: 'files', explain: 'নতুন folder।' },
          { text: 'tail -f app.log', bucket: 'files', explain: 'ফাইলের শেষ অংশ লাইভ পড়া।' },
          { text: 'systemctl restart nginx', bucket: 'sys', explain: 'Service আবার চালু।' },
          { text: 'top', bucket: 'sys', explain: 'কে কতটা CPU/RAM খাচ্ছে।' },
          { text: 'df -h', bucket: 'sys', explain: 'Disk কতটা ভরা।' },
          { text: 'chmod 600 .env', bucket: 'admin', explain: 'শুধু মালিক পড়তে-লিখতে পারবে।' },
          { text: 'sudo apt upgrade', bucket: 'admin', explain: 'Admin হিসেবে security update।' },
          { text: 'sudo chown www-data uploads', bucket: 'admin', explain: 'ফাইলের মালিক বদল।' },
        ],
      },
    ],
    quiz: [
      { q: 'pwd command কী বলে?', options: ['এখন কোন folder-এ আছো', 'Password বদলায়', 'Process-এর তালিকা', 'Disk কতটা ভরা'], answer: 0, explain: 'print working directory — “আমি কোথায়?”' },
      { q: '/var/log folder-এ সাধারণত কী থাকে?', options: ['Log ফাইল', 'User-দের ছবি', 'Program-এর code', 'Password'], answer: 0, explain: 'কিছু ভাঙলে প্রথমে এখানেই খোঁজো।' },
      { q: 'Server restart হলেও nginx যেন নিজে চালু হয় — এটা কে নিশ্চিত করে?', options: ['systemd service', 'ls', 'chmod', 'cd'], answer: 0, explain: 'Service হিসেবে enable করা থাকলে systemd boot-এর সময় চালু করে।' },
      { q: 'Disk ভরে গেছে কিনা দেখার command?', options: ['df -h', 'free -h', 'pwd', 'cat'], answer: 0, explain: 'df = disk free; free -h দেখায় RAM।' },
      { q: 'Internet থেকে পাওয়া একটা “sudo …” command কী করে না বুঝে চালানো ঠিক?', options: ['না — admin ক্ষমতায় যেকোনো কিছু করতে পারে', 'হ্যাঁ, sudo নিরাপদ', 'হ্যাঁ, যদি ছোট হয়', 'হ্যাঁ, রাতে চালালে'], answer: 0, explain: 'sudo-র কোনো সুরক্ষা জাল নেই — পুরো server মুছেও দিতে পারে।' },
    ],
    cheat: {
      category: 'Linux',
      severity: 'core',
      summary: 'Command → option → argument। সব কিছু / থেকে শুরু একটা গাছ। মালিক/group/বাকিদের rwx। Service চলে systemd-তে, log থাকে /var/log আর journalctl-এ।',
      rules: ['না বুঝে sudo নয়', 'Secret ফাইল chmod 600', 'নিয়মিত apt update && apt upgrade', 'কিছু ভাঙলে আগে status, তারপর log', 'যা দরকার নেই তা install নয়'],
      checklist: ['df -h — disk ভরা?', 'free -h — RAM শেষ?', 'systemctl status <service>', 'journalctl -u <service> -n 50'],
      commands: ['pwd && ls -la', 'tail -f /var/log/nginx/error.log', 'sudo systemctl restart nginx', 'chmod 600 .env'],
      remember: 'Server-এ চোখ নেই — log-ই তার চোখ।',
    },
    related: ['linux', 'ssh'],
  },

  // ─────────────────────────────── 03 · Git
  {
    id: 'cd-git',
    phase: 3,
    no: '03',
    icon: '🌿',
    title: 'Git ও GitHub — code-এর টাইম মেশিন',
    subtitle: 'Commit, branch, merge, pull request — একা বা দলে নিরাপদে code লেখা',
    duration: '৫০–৬০ মিনিট',
    simple: 'Git হলো game-এর save point। প্রতিবার ভালো কিছু করলে “save” (commit) করো; ভুল হলে আগের save-এ ফিরে যাও। GitHub হলো সেই save-গুলো internet-এ রাখার আর বন্ধুদের সাথে একসাথে কাজ করার জায়গা।',
    goals: ['Version control কেন দরকার', 'Commit, branch, merge-এর মানে', 'GitHub-এ push, pull request ও code review', 'Merge conflict মেটানো আর কী কখনো commit করবে না'],
    terms: [
      ['Repository (repo)', 'Project-এর folder + তার পুরো ইতিহাস'],
      ['Commit', 'একটা save point — কী বদলাল, কে, কখন, কেন'],
      ['Branch', 'মূল code-কে না ছুঁয়ে আলাদা লাইনে কাজ করার খাতা'],
      ['Merge', 'এক branch-এর কাজ আরেক branch-এ মেশানো'],
      ['Remote', 'Repo-র online copy — যেমন GitHub-এ'],
      ['Pull Request (PR)', '“আমার branch মূল code-এ মেশাতে চাই — দেখে দাও” অনুরোধ'],
      ['Conflict', 'দুজন একই লাইন দুইভাবে বদলালে Git নিজে বাছতে পারে না'],
    ],
    steps: [
      {
        title: 'Version control কেন?',
        body: 'Git ছাড়া project-এর অবস্থা হয় “final.zip, final_v2.zip, final_REAL.zip”-এর মতো। কোন version কাজ করত, কে কী বদলেছে — কেউ জানে না। Git প্রতিটা পরিবর্তনের পুরো ইতিহাস রাখে: কে, কবে, কী আর কেন। আর দলের সবাই একই project-এ একসাথে কাজ করতে পারে, একে অপরের কাজ মুছে না দিয়ে।',
        analogy: 'Game-এ boss-এর সাথে লড়ার আগে save করো। হেরে গেলে শুরু থেকে নয় — শেষ save থেকে আবার। Commit ঠিক সেই save point।',
        compare: [
          { title: '😵 Git ছাড়া', items: ['zip ফাইলের স্তূপ', 'কে কী বদলাল অজানা', 'ভুল হলে আগের অবস্থা ফেরানো কঠিন', 'দুজন একই ফাইলে কাজ = বিপদ'] },
          { title: '🌿 Git সহ', items: ['প্রতিটা পরিবর্তনের ইতিহাস', 'git log-এ কে, কখন, কেন', 'যেকোনো আগের অবস্থায় ফেরা', 'Branch-এ সবাই আলাদা কাজ করে, পরে মেশায়'] },
        ],
      },
      {
        title: 'তিনটি জায়গা: working → staging → commit',
        body: 'ফাইল বদলালে সেটা প্রথমে working directory-তে থাকে। `git add` দিয়ে বাছাই করো কোন পরিবর্তন পরের save-এ যাবে (staging)। তারপর `git commit` — স্থায়ী snapshot, সাথে একটা বার্তা। শেষে `git push` দিয়ে GitHub-এ পাঠাও।',
        chain: [['✏️', 'Working directory', 'ফাইল বদলাও'], ['📥', 'Staging area', 'git add'], ['📸', 'Commit', 'git commit'], ['☁️', 'GitHub', 'git push']],
        code: [{ label: 'প্রথম commit', lang: 'bash', text: `git init                       # এই folder-এ Git শুরু
git status                     # কী বদলেছে?
git add index.html             # এই ফাইল পরের commit-এ যাবে
git commit -m "Add home page"  # snapshot + বার্তা
git log --oneline              # ইতিহাস দেখো` }],
        tip: 'Commit message-এ লেখো “কী আর কেন” — যেমন "Fix total when cart is empty"। ছয় মাস পরের তুমি ধন্যবাদ দেবে। "fix" বা "update" কিছুই বলে না।',
      },
      {
        title: 'Branch — আলাদা খাতায় পরীক্ষা',
        body: '`main` branch-এ থাকে সবসময় চালু, ভরসাযোগ্য code। নতুন feature-এর জন্য একটা branch খোলো, সেখানে যত খুশি পরীক্ষা করো — main ভাঙে না। কাজ শেষ হলে merge করে main-এ মেশাও। ভালো না লাগলে branch মুছে ফেলো, কেউ টেরও পাবে না।',
        analogy: 'মূল হাঁড়ির তরকারি না ছুঁয়ে ছোট বাটিতে নতুন মশলা চেখে দেখা। ভালো লাগলে মূল হাঁড়িতে মেশাও (merge), খারাপ লাগলে বাটিটা ফেলে দাও।',
        code: [{ label: 'Branch-এ কাজ', lang: 'bash', text: `git switch -c add-login        # নতুন branch বানিয়ে সেখানে যাও
# … কাজ, git add, git commit …
git switch main                # main-এ ফেরো
git merge add-login            # feature মেশাও
git branch -d add-login        # কাজ শেষ — branch মুছে দাও` }],
      },
      {
        title: 'GitHub ও pull request',
        body: 'দলে কাজ করলে কেউ সরাসরি main-এ merge করে না। Branch push করে GitHub-এ pull request (PR) খোলো — “এটা main-এ মেশাতে চাই।” Teammate code পড়ে মন্তব্য দেয়, CI নিজে test চালায়, সব ঠিক থাকলে তবেই merge। এভাবে ভুল main-এ পৌঁছানোর আগেই ধরা পড়ে।',
        seq: {
          title: 'একটা pull request-এর জীবন',
          actors: [['👩‍💻', 'মিতু'], ['🐙', 'GitHub'], ['🧪', 'CI'], ['🧑‍💻', 'রাফি (reviewer)']],
          msgs: [
            [0, 1, 'git push add-login', 'মিতু তার branch GitHub-এ পাঠাল।'],
            [0, 1, 'Pull Request খোলা', '“login feature main-এ মেশাতে চাই” — সাথে কী, কেন তার বর্ণনা।'],
            [1, 2, 'test চালাও', 'PR খুলতেই GitHub Actions নিজে test চালায়।'],
            [2, 1, '✓ সব test পাস', 'কোনো পুরনো feature ভাঙেনি।', 'good'],
            [3, 1, 'review: "password-এর length যাচাই দাও"', 'রাফি code পড়ে একটা পরিবর্তন চাইল।'],
            [0, 1, 'নতুন commit push', 'মিতু ঠিক করে আবার push করল — PR নিজে হালনাগাদ হলো।'],
            [3, 1, 'Approve ✓', 'রাফি সন্তুষ্ট।', 'good'],
            [1, 1, 'Merge → main', 'Code এখন main-এ — এখান থেকেই deploy হবে।', 'good'],
          ],
        },
        code: [{ label: 'GitHub-এ পাঠানো', lang: 'bash', text: `git remote add origin https://github.com/you/shop.git   # একবারই
git push -u origin add-login   # branch GitHub-এ পাঠাও
git pull                       # অন্যদের নতুন কাজ নামিয়ে আনো` }],
      },
      {
        title: 'Merge conflict — দুজন একই লাইন বদলালে',
        body: 'তুমি আর তোমার teammate দুজনেই একই ফাইলের একই লাইন আলাদাভাবে বদলালে Git নিজে সিদ্ধান্ত নেয় না। সে দুটো সংস্করণ চিহ্ন দিয়ে দেখায় — তুমি ঠিক করো কোনটা থাকবে। ভয়ের কিছু নেই; conflict মানে শুধু “মানুষের সিদ্ধান্ত দরকার।”',
        anatomy: {
          title: 'Conflict হলে ফাইলের ভেতরটা এমন দেখায়',
          parts: [
            ['<<<<<<< HEAD', 'শুরুর চিহ্ন', 'এর পরের লাইনগুলো তোমার এখনকার branch-এর।'],
            ['\n', ''],
            ['const price = 100;', 'তোমার লেখা', 'তুমি দাম ১০০ করেছ।'],
            ['\n', ''],
            ['=======', 'বিভাজক', 'উপরে তোমার, নিচে অন্যজনের।'],
            ['\n', ''],
            ['const price = 120;', 'অন্যজনের লেখা', 'main-এ teammate দাম ১২০ করেছে।'],
            ['\n', ''],
            ['>>>>>>> main', 'শেষের চিহ্ন', 'অন্য branch-এর নাম।'],
          ],
          note: 'সমাধান: যেটা সঠিক রাখো, তিনটা চিহ্নের লাইন মুছে ফেলো, তারপর git add ও git commit।',
        },
        ask: ask('Merge conflict হলে Git কী করে?', ['দুটো সংস্করণ চিহ্ন দিয়ে দেখায়; কোনটা থাকবে তুমি ঠিক করো', 'নিজে থেকে নতুনটা রাখে', 'পুরো ফাইল মুছে দেয়'], 0, 'Git অনুমান করে না — কোন দাম ঠিক সেটা শুধু মানুষ জানে।'),
      },
      {
        title: '.gitignore — যা কখনো commit করবে না',
        body: 'কিছু জিনিস repo-তে যাওয়ার কথা নয়: `node_modules` (npm install দিয়েই আবার আসে), build-এর output, আর সবচেয়ে বড় কথা `.env`-এর মতো password বা secret-ওয়ালা ফাইল। `.gitignore` ফাইলে তালিকা দিলে Git এগুলো দেখেও না দেখার ভান করে।',
        code: [{ label: '.gitignore', lang: 'bash', text: `node_modules/
dist/
.env
*.log` }],
        warn: 'একবার secret push হয়ে গেলে পরের commit-এ মুছে দিলেও সেটা Git-এর ইতিহাসে থেকে যায় — আর bot কয়েক মিনিটে public repo থেকে key খুঁজে নেয়। একমাত্র সমাধান: সেই key সাথে সাথে বাতিল করে নতুন বানানো।',
      },
    ],
    labs: [
      {
        type: 'terminal',
        preset: 'git101',
        title: 'Git playground — প্রথম repo থেকে merge পর্যন্ত',
        intro: 'একটা ছোট online দোকানের project। Repo শুরু করো, commit করো, branch-এ নতুন feature বানাও, main-এ merge করো, আর একটা conflict মেটাও। আটকে গেলে “help”।',
      },
      {
        type: 'map',
        title: 'Pull request-এর পথ',
        intro: 'একটা feature branch থেকে production পর্যন্ত — সব ঠিক থাকলে, test ব্যর্থ হলে, আর reviewer পরিবর্তন চাইলে কী হয় দেখো। তিনটা mode দেখলে lab সম্পূর্ণ।',
        height: 320,
        nodes: [
          { id: 'dev', x: 7, y: 50, icon: '👩‍💻', label: 'Developer' },
          { id: 'branch', x: 22, y: 50, icon: '🌿', label: 'feature branch' },
          { id: 'pr', x: 38, y: 50, icon: '📬', label: 'Pull Request' },
          { id: 'ci', x: 54, y: 22, icon: '🧪', label: 'CI test' },
          { id: 'review', x: 54, y: 78, icon: '👀', label: 'Code review' },
          { id: 'main', x: 72, y: 50, icon: '🌳', label: 'main' },
          { id: 'prod', x: 91, y: 50, icon: '🚀', label: 'Production' },
        ],
        edges: [['dev', 'branch'], ['branch', 'pr'], ['pr', 'ci'], ['pr', 'review'], ['ci', 'main'], ['review', 'main'], ['main', 'prod']],
        modes: [
          { id: 'happy', name: 'সব ঠিক', hops: [
            { path: ['dev', 'branch', 'pr'], label: 'push + PR', desc: 'নতুন feature একটা branch-এ, তারপর pull request।' },
            { paths: [['pr', 'ci'], ['pr', 'review']], label: 'test + review', desc: 'CI test চালায় আর একজন মানুষ code পড়ে — একসাথে।' },
            { paths: [['ci', 'main'], ['review', 'main']], label: '✓ ✓ merge', status: 'ok', desc: 'দুটো দরজাই সবুজ — main-এ merge।' },
            { path: ['main', 'prod'], label: 'deploy', status: 'ok', desc: 'main থেকে নিজে থেকেই production-এ।' },
          ] },
          { id: 'cifail', name: 'Test ব্যর্থ', kind: 'fail', hops: [
            { path: ['dev', 'branch', 'pr'], label: 'push + PR', desc: 'একটা নতুন discount feature।' },
            { path: ['pr', 'ci'], label: '✗ 1 test failed', status: 'blocked', desc: 'Cart খালি থাকলে total ভুল আসছে — CI লাল।' },
            { path: ['ci', 'pr'], label: 'merge বোতাম বন্ধ', status: 'blocked', desc: 'Repo-র নিয়ম: CI সবুজ না হলে merge করা যাবে না। ভাঙা code main-এ ঢুকতেই পারল না।' },
          ] },
          { id: 'changes', name: 'Reviewer পরিবর্তন চাইল', hops: [
            { path: ['pr', 'review'], label: '"input validate করো"', status: 'evil', desc: 'Reviewer দেখল form-এর input যাচাই হচ্ছে না।' },
            { path: ['dev', 'branch', 'pr'], label: 'fix commit', desc: 'Developer ঠিক করে আবার push করল — একই PR হালনাগাদ।' },
            { path: ['review', 'main'], label: 'approve → merge', status: 'ok', desc: 'দুই জোড়া চোখ, এক জোড়ার চেয়ে ভালো।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'git add-এর কাজ কী?', options: ['পরের commit-এ কোন পরিবর্তন যাবে তা বাছাই', 'GitHub-এ পাঠানো', 'Branch মোছা', 'নতুন repo শুরু'], answer: 0, explain: 'Staging-এ রাখা — তারপর commit।' },
      { q: 'নতুন feature-এর কাজ কোথায় করা উচিত?', options: ['আলাদা branch-এ', 'সরাসরি main-এ', 'Production server-এ', 'zip ফাইলে'], answer: 0, explain: 'Branch-এ পরীক্ষা করো, main নিরাপদ থাকে।' },
      { q: 'Pull request-এর মূল উদ্দেশ্য?', options: ['Merge-এর আগে review ও test', 'Code মুছে ফেলা', 'Password বদলানো', 'Server চালু করা'], answer: 0, explain: 'ভুল main-এ যাওয়ার আগেই ধরা।' },
      { q: '.env ফাইল কোথায় লেখা উচিত?', options: ['.gitignore-এ, যাতে commit না হয়', 'README-তে', 'সবার আগে commit-এ', 'Branch-এর নামে'], answer: 0, explain: 'Secret কখনো repo-তে নয়।' },
      { q: 'ভুল করে API key push হয়ে গেছে। সঠিক কাজ?', options: ['Key সাথে সাথে বাতিল করে নতুন বানানো', 'পরের commit-এ মুছে দেওয়া — ব্যস', 'Repo-র নাম বদলানো', 'কিছু না'], answer: 0, explain: 'History-তে থেকে যায়; key-টাই অকেজো করতে হবে।' },
    ],
    cheat: {
      category: 'Git',
      severity: 'core',
      summary: 'Working → git add → git commit → git push। নতুন কাজ branch-এ, merge pull request দিয়ে review ও CI-এর পরে। Secret কখনো commit নয়।',
      rules: ['ছোট, ঘন ঘন commit — অর্থপূর্ণ message', 'main-এ সরাসরি কাজ নয়', 'Merge-এর আগে PR + review + সবুজ CI', '.gitignore-এ node_modules, .env', 'Push-এর আগে git status দেখো'],
      checklist: ['git status পরিষ্কার?', 'Commit message “কী আর কেন” বলে?', 'PR-এ CI সবুজ?', '.env ignore করা?'],
      commands: ['git switch -c feature-x', 'git add -p && git commit -m "…"', 'git push -u origin feature-x', 'git log --oneline --graph'],
      remember: 'Commit = save point। ঘন ঘন save করলে হারানোর ভয় থাকে না।',
    },
    related: ['secrets', 'sd-deploy'],
  },

  // ─────────────────────────────── 04 · Docker
  {
    id: 'cd-docker',
    phase: 4,
    no: '04',
    icon: '🐳',
    title: 'Docker — app-কে box-এ ভরা',
    subtitle: 'Container, image, Dockerfile, port আর volume',
    duration: '৫০–৬০ মিনিট',
    simple: '“আমার computer-এ তো চলে!” — developer-দের সবচেয়ে পরিচিত অজুহাত। Docker app-কে তার সব জিনিসপত্র (Node.js-এর version, library, setting) সহ একটা box-এ (container) ভরে দেয়। সেই box যেকোনো computer-এ হুবহু একইভাবে চলে।',
    goals: ['Container কী, আর VM থেকে কেন হালকা', 'Image বনাম container — রেসিপি বনাম রান্না করা খাবার', 'Dockerfile লিখে নিজের image বানানো', 'Port, volume ও environment variable'],
    terms: [
      ['Container', 'App + তার সব দরকারি জিনিস, আলাদা করে চালানো একটা box'],
      ['Image', 'Container বানানোর read-only ছাঁচ'],
      ['Dockerfile', 'Image বানানোর ধাপে ধাপে রেসিপি'],
      ['Layer', 'Dockerfile-এর প্রতিটা ধাপ থেকে তৈরি image-এর একটা স্তর — cache হয়'],
      ['Registry', 'Image রাখার online দোকান — Docker Hub, GitHub Container Registry'],
      ['Volume', 'Container-এর বাইরে রাখা data — container মুছলেও থাকে'],
      ['Port mapping', 'তোমার computer-এর port → container-এর ভেতরের port'],
    ],
    steps: [
      {
        title: 'সমস্যা: “আমার computer-এ তো চলে!”',
        body: 'তোমার laptop-এ Node 22, বন্ধুর Node 18, server-এ আরেকটা — একই code তিন জায়গায় তিন রকম আচরণ করে। Docker সমাধান দেয় app-টাকে তার পুরো পরিবেশসহ এক box-এ ভরে: যেখানেই চালাও, ভেতরে ঠিক একই জিনিস।',
        analogy: 'Shipping container আসার আগে জাহাজে প্রতিটা বস্তা, বাক্স, ড্রাম আলাদাভাবে তুলতে হতো। একই মাপের container আসার পর জাহাজ, ট্রাক, ক্রেন — সবাই একই বাক্স সামলায়, ভেতরে চাল থাক বা গাড়ি। Docker container ঠিক তাই — server জানে শুধু “box চালাও”, ভেতরে Node.js না Python, তার মাথাব্যথা নেই।',
        compare: [
          { title: '😩 Docker ছাড়া', items: ['প্রতিটা server-এ হাতে Node, library install', 'Version-এর অমিল', 'নতুন developer-এর setup-এ দিন শেষ', '“আমার এখানে তো চলে!”'] },
          { title: '🐳 Docker সহ', items: ['এক command: docker run', 'সবখানে একই image', 'নতুন developer ১০ মিনিটে প্রস্তুত', 'যা test হলো, ঠিক তাই production-এ'] },
        ],
      },
      {
        title: 'Container বনাম virtual machine',
        body: 'আগের lesson-এর VM প্রত্যেকটা একটা পুরো operating system বহন করে — কয়েক GB, চালু হতে মিনিট। Container আলাদা OS আনে না; host-এর Linux kernel ভাগ করে নেয়, শুধু নিজের app আর library রাখে। তাই সে কয়েক MB, চালু হয় এক সেকেন্ডেরও কমে, আর এক server-এ শত শত container চলতে পারে।',
        bars: { title: 'চালু হতে সময় (আনুমানিক)', items: [['Virtual machine', 45, '৩০–৬০ সেকেন্ড', 'bad'], ['Container', 1, '১ সেকেন্ডের কম', 'good']] },
        compare: [
          { title: '🖥️ Virtual machine', items: ['নিজের পুরো OS', 'GB আকার', 'মিনিটে চালু', 'আরও শক্ত দেয়াল (hardware স্তরে আলাদা)'] },
          { title: '📦 Container', items: ['Host-এর kernel ভাগ করে', 'MB আকার', 'সেকেন্ডে চালু', 'হালকা দেয়াল — ভেতরে root না রাখাই ভালো'] },
        ],
      },
      {
        title: 'Image ও container',
        body: 'Image হলো রেসিপি — কোনোদিন বদলায় না (read-only)। Container হলো সেই রেসিপি থেকে রান্না করা খাবার — চালু, জীবন্ত। একটা image থেকে যত খুশি container বানানো যায়। Image রাখা থাকে registry-তে (যেমন Docker Hub), যেখান থেকে যেকোনো server নামিয়ে নিতে পারে।',
        maps: [['📜 রান্নার রেসিপি', 'Image'], ['🍲 রান্না করা খাবার', 'Container'], ['📚 রেসিপির বই', 'Registry (Docker Hub)']],
        anatomy: {
          title: 'docker run — একটা লাইন, পাঁচটা অংশ',
          parts: [
            ['docker run', 'Command', 'Image থেকে নতুন container বানিয়ে চালাও।'],
            [' ', ''],
            ['-d', 'Detached', 'পেছনে চালাও — terminal আটকে থাকবে না।'],
            [' ', ''],
            ['-p 8080:80', 'Port mapping', 'তোমার computer-এর 8080 → container-এর ভেতরের 80। Browser-এ localhost:8080 খুললেই nginx।'],
            [' ', ''],
            ['--name web', 'নাম', 'এলোমেলো নামের বদলে মনে রাখার মতো নাম।'],
            [' ', ''],
            ['nginx:1.27', 'Image ও tag', ':1.27 মানে নির্দিষ্ট version। Tag না দিলে :latest — যেটা যেকোনো দিন বদলে যেতে পারে।'],
          ],
        },
        code: [{ label: 'প্রতিদিনের command', lang: 'bash', text: `docker pull nginx:1.27            # registry থেকে image নামাও
docker images                     # কোন কোন image আছে
docker run -d -p 8080:80 --name web nginx:1.27
docker ps                         # চলমান container
docker logs -f web                # container-এর log
docker exec -it web sh            # container-এর ভেতরে ঢোকো
docker stop web && docker rm web  # থামাও ও মুছে ফেলো` }],
      },
      {
        title: 'Dockerfile — নিজের image-এর রেসিপি',
        body: 'নিজের app-এর image বানাতে একটা Dockerfile লেখো। প্রতিটা লাইন একটা ধাপ, আর প্রতিটা ধাপ একটা layer। Docker layer cache করে রাখে — যে ধাপের input বদলায়নি, সেটা আবার চালায় না। তাই ক্রম গুরুত্বপূর্ণ: যা কম বদলায় (dependency) আগে, যা বেশি বদলায় (তোমার code) পরে।',
        code: [
          { label: 'Dockerfile — একটা Node.js app', lang: 'dockerfile', text: `FROM node:22-alpine            # ভিত্তি: ছোট Linux + Node.js
WORKDIR /app                   # container-এর ভেতরে কাজের folder
COPY package*.json ./          # আগে শুধু dependency-র তালিকা…
RUN npm ci --omit=dev          # …install (এই layer cache হয়)
COPY . .                       # তারপর বাকি code
EXPOSE 3000
USER node                      # root হিসেবে নয়
CMD ["node", "server.js"]      # container চালু হলে এটা চলবে` },
          { label: 'Build ও run', lang: 'bash', text: `docker build -t shop-api:1.0 .
docker run -d -p 3000:3000 shop-api:1.0
curl localhost:3000/health` },
        ],
        ask: ask('শুধু server.js বদলেছ। আবার docker build করলে কোন ধাপ নতুন করে চলবে?', ['শুধু COPY . . আর তার পরের ধাপ', 'সব ধাপ শুরু থেকে', 'কোনো ধাপই না'], 0, 'package.json বদলায়নি, তাই npm ci-র layer cache থেকে আসে — build কয়েক সেকেন্ডে শেষ।'),
      },
      {
        title: 'Data কোথায় থাকে? — volume',
        body: 'Container মুছলে তার ভেতরে লেখা সব data-ও মুছে যায় — container অস্থায়ী। Database-এর মতো জিনিসের data তাই volume-এ রাখো: container-এর বাইরে Docker-এর রাখা একটা জায়গা। নতুন version-এর container এলেও একই volume জুড়ে নেয়, data অক্ষত।',
        analogy: 'Container হলো হোটেলের ঘর — চেক-আউট করলে ঘর পরিষ্কার হয়ে যায়। Volume হলো হোটেলের locker — ঘর বদলালেও তোমার জিনিস locker-এ থেকে যায়।',
        code: [{ label: 'Volume সহ database', lang: 'bash', text: `docker volume create pgdata
docker run -d --name db \\
  -e POSTGRES_PASSWORD=change-me \\
  -v pgdata:/var/lib/postgresql/data \\
  postgres:16` }],
        warn: 'Volume ছাড়া database container চালিয়ে পরে docker rm করলে — সব data চিরতরে শেষ।',
      },
      {
        title: 'Environment variable ও .dockerignore',
        body: 'একই image dev, staging আর production-এ চলে — শুধু setting আলাদা। সেগুলো image-এ লেখো না; চালানোর সময় environment variable দিয়ে দাও (`-e DATABASE_URL=…`)। আর `.dockerignore` ফাইলে `.env`, `.git`, `node_modules` রাখো — নইলে এগুলো image-এ ঢুকে পড়ে।',
        points: [
          '⚙️ Setting: -e বা --env-file দিয়ে চালানোর সময়',
          '🔑 Secret: কখনো Dockerfile-এ ENV দিয়ে নয় — docker history দিয়ে যে কেউ পড়তে পারে',
          '🚫 .dockerignore: .env, .git, node_modules',
          '🏷️ Tag: :latest নয়, নির্দিষ্ট version বা commit-এর নাম',
        ],
        tip: 'Image-কে ভাবো ছাপা বইয়ের মতো — যারাই পাবে সবাই সব পাতা পড়তে পারবে। তাই বইয়ে password লিখবে না।',
      },
    ],
    labs: [
      {
        type: 'terminal',
        preset: 'docker101',
        title: 'Docker playground — প্রথম container থেকে নিজের image',
        intro: 'একটা ফাঁকা machine-এ Docker install করা আছে। প্রথম container চালাও, nginx-কে browser-এ আনো, নিজের app-এর image বানাও, আর volume দিয়ে data বাঁচাও। আটকে গেলে “help”।',
      },
      {
        type: 'audit',
        preset: 'docker',
        title: 'Dockerfile review — ভুলগুলো খুঁজে বের করো',
        intro: 'একজন নতুন teammate একটা Dockerfile আর docker-compose.yml লিখেছে। সন্দেহজনক প্রতিটা লাইনে ক্লিক করো — কেন সমস্যা আর কীভাবে ঠিক করবে দেখো। সব পেলে lab সম্পূর্ণ।',
      },
    ],
    quiz: [
      { q: 'Image আর container-এর সম্পর্ক?', options: ['Image রেসিপি, container তা থেকে চালু হওয়া জিনিস', 'দুটো একই', 'Container থেকে image চলে', 'Image হলো server'], answer: 0, explain: 'এক image থেকে অনেক container।' },
      { q: 'Container VM-এর চেয়ে হালকা কেন?', options: ['আলাদা OS আনে না, host-এর kernel ভাগ করে', 'কম code থাকে', 'Internet লাগে না', 'শুধু Windows-এ চলে'], answer: 0, explain: 'OS না থাকায় MB আকার আর সেকেন্ডে চালু।' },
      { q: '-p 8080:80 মানে?', options: ['Computer-এর 8080 → container-এর 80', 'Container-এর 8080 → computer-এর 80', '80 জন user', '8080 MB RAM'], answer: 0, explain: 'বাম দিক বাইরের, ডান দিক container-এর ভেতরের।' },
      { q: 'Database-এর data কোথায় রাখা উচিত?', options: ['Volume-এ', 'Container-এর ভেতরে', 'Image-এ', 'Dockerfile-এ'], answer: 0, explain: 'Container মুছলেও volume থাকে।' },
      { q: 'Dockerfile-এ ENV DB_PASSWORD=secret লেখা কেন খারাপ?', options: ['Image-এর ভেতরে থেকে যায় — যে image পায় সে-ই পড়তে পারে', 'Build ধীর হয়', 'কোনো সমস্যা নেই', 'Docker তা মানে না'], answer: 0, explain: 'Secret চালানোর সময় দাও, image-এ নয়।' },
    ],
    cheat: {
      category: 'Docker',
      severity: 'core',
      summary: 'Image = read-only রেসিপি, container = চালু box। Dockerfile-এ কম বদলানো ধাপ আগে। Data volume-এ, setting env-এ, secret কখনো image-এ নয়।',
      rules: [':latest নয় — নির্দিষ্ট tag', 'package.json আগে COPY, তারপর code', 'USER node — root নয়', 'Database-এর data volume-এ', '.dockerignore-এ .env ও .git'],
      checklist: ['Image-এ secret নেই?', 'Container root হিসেবে চলছে না?', 'Volume ছাড়া কোনো database নেই?', 'Image-এর আকার যুক্তিসঙ্গত?'],
      commands: ['docker build -t app:1.0 .', 'docker run -d -p 3000:3000 app:1.0', 'docker logs -f <name>', 'docker exec -it <name> sh'],
      remember: 'যা test হলো, ঠিক সেই box-টাই production-এ যাক।',
    },
    related: ['docker', 'sd-deploy'],
  },
];
