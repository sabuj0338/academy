// Phase 06 — Security Testing & Monitoring
export default [
  {
    id: 'headers',
    phase: 6,
    no: '35',
    icon: '🧢',
    title: 'Security Headers',
    subtitle: 'Browser-কে নিরাপত্তার নির্দেশ দাও',
    duration: '২৫ মিনিট',
    goals: ['প্রধান security header ও তাদের কাজ', 'CSP লেখা', 'Next.js ও Nginx-এ header যোগ', 'Grade A পাওয়া'],
    steps: [
      {
        title: 'Header = browser-এর জন্য নিয়মপত্র',
        body: 'কয়েকটি response header যোগ করেই অনেক attack class দুর্বল করা যায়:',
        points: ['Strict-Transport-Security — সবসময় HTTPS', 'Content-Security-Policy — কোথা থেকে script/style/image লোড হবে', 'X-Content-Type-Options: nosniff — MIME sniffing বন্ধ', 'X-Frame-Options / frame-ancestors — clickjacking', 'Referrer-Policy — URL leak কমায়', 'Permissions-Policy — camera, mic, geolocation বন্ধ'],
      },
      {
        title: 'Next.js-এ',
        body: '',
        code: [{ label: 'next.config.js', lang: 'js', kind: 'good', text: "const headers = [\n  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },\n  { key: 'X-Content-Type-Options', value: 'nosniff' },\n  { key: 'X-Frame-Options', value: 'DENY' },\n  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },\n  { key: 'Content-Security-Policy', value: \"default-src 'self'; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none'\" },\n]\nmodule.exports = {\n  poweredByHeader: false,\n  async headers() { return [{ source: '/(.*)', headers }] },\n}" }],
        tip: 'CSP প্রথমে Content-Security-Policy-Report-Only দিয়ে চালাও — কী ভাঙছে দেখো, তারপর enforce করো। Next.js-এ nonce-based CSP middleware দিয়ে করা যায়।',
      },
    ],
    labs: [{ type: 'headers', title: 'Header Grader', intro: 'তোমার site-এর response header চালু/বন্ধ করো এবং grade (F → A+) কীভাবে বদলায় দেখো। প্রতিটি header কোন attack আটকায় তা-ও দেখো।' }],
    quiz: [
      { q: 'কোন header MIME sniffing বন্ধ করে?', options: ['X-Content-Type-Options: nosniff', 'HSTS', 'CSP', 'Referrer-Policy'], answer: 0, explain: 'Browser Content-Type মেনে চলে।' },
      { q: 'CSP নতুন করে চালু করার নিরাপদ উপায়?', options: ['সরাসরি enforce', 'Report-Only দিয়ে শুরু', 'শুধু staging', 'চালু না করা'], answer: 1, explain: 'ভাঙন দেখে তারপর enforce।' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'medium',
      summary: 'কয়েকটি header দিয়ে XSS, clickjacking, downgrade, sniffing দুর্বল করা যায়।',
      rules: ['HSTS', 'CSP (Report-Only → enforce)', 'nosniff', 'frame-ancestors / XFO', 'Referrer-Policy', 'Permissions-Policy', 'poweredByHeader: false'],
      checklist: ['securityheaders.com', 'curl -sI https://site'],
      commands: ['curl -sI https://example.com | grep -i "strict\\|content-security\\|x-frame"'],
      remember: 'Header বিনামূল্যে — ব্যবহার না করার কারণ নেই।',
    },
  },

  {
    id: 'deps',
    phase: 6,
    no: '36',
    icon: '📦',
    title: 'Dependency Vulnerabilities',
    subtitle: 'তোমার code-এর ৯০% অন্যের লেখা',
    duration: '২৫ মিনিট',
    goals: ['Supply chain ঝুঁকি', 'npm audit, govulncheck, trivy', 'Lockfile ও typosquatting', 'Dependabot/Renovate'],
    steps: [
      {
        title: 'Supply chain attack',
        body: 'একটি সাধারণ Next.js project-এ ১০০০+ npm package থাকে। এর যেকোনোটির vulnerability বা compromise তোমার app-এর vulnerability।',
        points: ['Known CVE — পুরনো version (Log4Shell)', 'Malicious package — typosquatting (reqeusts, expresss)', 'Account takeover — maintainer-এর account hack করে malicious version publish (event-stream, ua-parser-js)', 'postinstall script — install-এর সময়ই code চলে'],
      },
      {
        title: 'Scan tools',
        body: '',
        code: [{ label: 'Commands', lang: 'bash', kind: 'good', text: 'npm audit --omit=dev\nnpm audit fix\n\ngo install golang.org/x/vuln/cmd/govulncheck@latest\ngovulncheck ./...          # শুধু তোমার code যে function call করে সেটা দেখায়\n\ntrivy fs .                 # সব lockfile + Dockerfile' }],
        points: ['Lockfile commit করো (package-lock.json, go.sum)', 'CI-তে npm ci (lockfile মেনে)', 'Dependabot / Renovate — স্বয়ংক্রিয় PR', 'নতুন package যোগের আগে: download সংখ্যা, maintainer, শেষ update দেখো'],
      },
    ],
    labs: [{ type: 'deps', title: 'Dependency Triage', intro: 'Scanner তোমার project-এ বেশ কিছু vulnerability পেয়েছে। প্রতিটির severity, reachability ও fix দেখে সিদ্ধান্ত নাও — কোনটা এখনই upgrade, কোনটা পরে, কোনটা সরাতে হবে।' }],
    quiz: [
      { q: 'govulncheck-এর বিশেষত্ব কী?', options: ['শুধু npm', 'তোমার code আসলে vulnerable function call করে কিনা দেখে', 'Docker scan', 'Password crack'], answer: 1, explain: 'Reachability analysis — noise কম।' },
      { q: '"expresss" নামের package কী হতে পারে?', options: ['নতুন version', 'Typosquatting malicious package', 'Official fork', 'TypeScript types'], answer: 1, explain: 'বানান খেয়াল করো।' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'high',
      summary: 'Dependency-র vulnerability = তোমার vulnerability।',
      rules: ['Lockfile commit + npm ci', 'npm audit / govulncheck / trivy CI-তে', 'Dependabot/Renovate', 'নতুন package যাচাই', 'অব্যবহৃত package সরাও'],
      checklist: ['npm audit --omit=dev', 'govulncheck ./...', 'trivy fs .'],
      commands: ['npm audit --omit=dev', 'govulncheck ./...', 'trivy fs --severity HIGH,CRITICAL .'],
      remember: 'npm install = অন্যের code নিজের server-এ চালানো।',
    },
  },

  {
    id: 'scanning',
    phase: 6,
    no: '37',
    icon: '🛰️',
    title: 'Security Testing Tools: Burp, ZAP, Nmap',
    subtitle: 'নিজের app নিজে আক্রমণ করো',
    duration: '৪০ মিনিট',
    goals: ['Burp Suite proxy-র workflow', 'OWASP ZAP automated scan', 'Nmap service detection', 'Testing-এর আইনি সীমা'],
    steps: [
      {
        title: 'Intercepting Proxy (Burp / ZAP)',
        body: 'Browser ও server-এর মাঝে proxy বসিয়ে প্রতিটি request থামিয়ে (intercept) দেখা ও বদলানো যায়। এটাই web security testing-এর মূল হাতিয়ার।',
        points: ['Proxy → Intercept: request থামাও, বদলাও, পাঠাও', 'Repeater: একটি request বারবার বদলে পাঠাও', 'Intruder: parameter-এ অনেক মান চেষ্টা (IDOR, brute)', 'Decoder: Base64/URL encode-decode', 'ZAP Automated Scan: পরিচিত vulnerability খোঁজে'],
      },
      {
        title: 'Testing workflow',
        body: 'নিজের app-এ OWASP Testing Guide অনুসরণ করো:',
        points: ['১. Recon: সব endpoint তালিকা (Burp sitemap, JS)', '২. Auth: login, logout, session, reset password', '৩. AuthZ: দুই user, cross-access (IDOR)', '৪. Input: প্রতিটি parameter-এ SQLi, XSS, traversal payload', '৫. Business logic: দাম, coupon, quantity -1', '৬. Config: header, TLS, CORS, error message', '৭. রিপোর্ট লেখো'],
        warn: 'শুধু নিজের system, লিখিত অনুমতি, বা legal lab (PortSwigger Academy, Juice Shop, HackTheBox) — অন্যথায় এটা অপরাধ।',
      },
      {
        title: 'অনুশীলনের জায়গা',
        body: 'PortSwigger Web Security Academy (বিনামূল্যে, সেরা), OWASP Juice Shop (docker run -p 3000:3000 bkimminich/juice-shop), DVWA, HackTheBox, TryHackMe।',
      },
    ],
    labs: [{ type: 'intercept', title: 'Mini Burp — Intercept & Repeat', intro: 'Browser থেকে একটি checkout request যাচ্ছে। Intercept চালু করে request থামাও, দাম ও quantity বদলাও, তারপর forward করো। Business logic bug খুঁজে বের করো।' }],
    quiz: [
      { q: 'Burp-এ একটি request বারবার হাতে বদলে পাঠানোর tool?', options: ['Intruder', 'Repeater', 'Decoder', 'Comparer'], answer: 1, explain: 'Manual testing-এর জন্য Repeater।' },
      { q: 'Checkout-এ quantity = -5 পাঠানো কোন ধরনের test?', options: ['XSS', 'Business logic', 'TLS', 'DNS'], answer: 1, explain: 'Negative quantity → negative total!' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'info',
      summary: 'Proxy দিয়ে request থামাও, বদলাও, পাঠাও। Attacker-এর মতো ভাবো — অনুমতি নিয়ে।',
      rules: ['শুধু নিজের/অনুমোদিত target', 'দুই test account (AuthZ)', 'Business logic: দাম/quantity/coupon server-side', 'Automated scan + manual test দুটোই'],
      checklist: ['OWASP WSTG checklist', 'PortSwigger Academy labs', 'Juice Shop'],
      commands: ['docker run -p 3000:3000 bkimminich/juice-shop', 'zap-baseline.py -t https://staging.example.com', 'nmap -sV -sC target'],
      remember: 'Attacker যা পারবে, তুমি আগে চেষ্টা করো।',
    },
  },

  {
    id: 'logs',
    phase: 6,
    no: '38',
    icon: '🔎',
    title: 'Log Analysis ও Intrusion Detection',
    subtitle: 'প্রমাণ সবসময় log-এ থাকে',
    duration: '৩৫ মিনিট',
    goals: ['কী log করতে হবে (এবং কী নয়)', 'Attack pattern চেনা', 'Fail2ban, Wazuh, CrowdSec', 'Alerting'],
    steps: [
      {
        title: 'কী log করবে',
        body: 'Security event: login সফল/ব্যর্থ, password reset, role change, 401/403 spike, admin action, rate-limit hit। প্রতিটি log-এ: timestamp (UTC), user ID, IP, request ID, action, ফলাফল।',
        warn: 'Log-এ কখনো: password, token, session cookie, পূর্ণ card number, OTP।',
        code: [{ label: 'Node.js · structured log (pino)', lang: 'js', kind: 'good', text: 'import pino from \'pino\';\nconst log = pino();\n\nlog.info({\n  event: \'login_failed\',\n  email_hash: sha256hex(email),   // আসল email নয়\n  ip: req.ip,\n  ua: req.get(\'User-Agent\'),\n  req_id: req.id,\n}, \'login failed\');' }],
      },
      {
        title: 'Pattern চেনো',
        body: '',
        points: ['একই IP থেকে বহু 401 → brute-force', 'বহু IP, একই password → spraying', 'Failed-এর পরপর Success → সম্ভাব্য breach!', '/wp-admin, /.env, /phpmyadmin → scanner', "URL-এ ' OR, <script>, ../ → attack attempt", 'অস্বাভাবিক সময়/দেশ থেকে admin login'],
        code: [{ label: 'দ্রুত বিশ্লেষণ', lang: 'bash', text: "grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head\nawk '$9==401 {print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head" }],
      },
      {
        title: 'Detection tools',
        body: 'Fail2ban (log দেখে IP ban), CrowdSec (community blocklist), Wazuh (open-source SIEM + HIDS), Grafana Loki + alert। ছোট setup-এ: Loki + Grafana alert rule + Telegram/Slack notification।',
      },
    ],
    labs: [{ type: 'logs', title: 'SOC Analyst Lab', intro: 'রাত ৩টায় alert এসেছে। Nginx ও auth log ফিল্টার করে আক্রমণকারী IP, কোন account breach হয়েছে এবং কোন attack চেষ্টা হয়েছে খুঁজে বের করো।' }],
    quiz: [
      { q: 'কোন pattern সবচেয়ে উদ্বেগজনক?', options: ['একটি 404', 'অনেক Failed-এর পরে একই IP থেকে Success', 'Static file request', '200 OK'], answer: 1, explain: 'Brute-force সফল হয়েছে!' },
      { q: 'Log-এ কোনটি রাখা যাবে না?', options: ['Request ID', 'IP', 'Password / token', 'Timestamp'], answer: 2, explain: 'Log leak = credential leak।' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'high',
      summary: 'Structured security log + pattern detection + alert।',
      rules: ['Auth event, AuthZ failure, admin action log', 'UTC timestamp, user, IP, req_id', 'Secret কখনো log-এ নয়', 'Log server আলাদা (attacker মুছতে না পারে)', 'Alert: 401 spike, admin login'],
      checklist: ['Fail2ban jail চালু?', 'শেষ ২৪ ঘণ্টার top 401 IP', 'Failed → Success pattern'],
      commands: ["awk '$9==401{print $1}' access.log | sort | uniq -c | sort -rn | head", 'journalctl -u ssh --since "1 hour ago"'],
      remember: 'যা log হয় না, তা তদন্ত করা যায় না।',
    },
  },

  {
    id: 'incident',
    phase: 6,
    no: '39',
    icon: '🚨',
    title: 'Incident Response',
    subtitle: 'Breach হলে প্রথম ১ ঘণ্টা',
    duration: '৩০ মিনিট',
    goals: ['NIST incident response lifecycle', 'Containment-এ কী করবে, কী নয়', 'Evidence সংরক্ষণ', 'Post-mortem'],
    steps: [
      {
        title: 'NIST IR Lifecycle',
        body: '',
        points: ['১. Preparation — playbook, contact list, backup, log', '২. Detection & Analysis — কী ঘটেছে, কতটা', '৩. Containment — ছড়ানো বন্ধ (key revoke, IP block, server isolate)', '৪. Eradication — backdoor, malware, দুর্বলতা সরাও', '৫. Recovery — clean backup থেকে, monitor সহ', '৬. Lessons Learned — blameless post-mortem'],
      },
      {
        title: 'প্রথম ঘণ্টার ভুলগুলো',
        body: '',
        points: ['❌ আতঙ্কে server মুছে ফেলা — evidence হারায়', '❌ Compromised server থেকেই password বদলানো', '❌ শুধু একটি key rotate — attacker অন্যটা নিয়েছে', '✅ Snapshot নাও, তারপর isolate', '✅ সব secret rotate (DB, JWT secret → সব session invalid, API key)', '✅ Timeline লেখো', '✅ আইন অনুযায়ী user/কর্তৃপক্ষকে জানাও'],
      },
    ],
    labs: [
      { type: 'classify', title: 'IR Playbook — কোন ধাপে কোন কাজ?', intro: 'একটি breach-এর সময়ের কাজগুলো সঠিক IR phase-এ রাখো।', buckets: [
        { id: 'p', label: 'Preparation', color: '#94a3b8' },
        { id: 'd', label: 'Detection', color: '#22d3ee' },
        { id: 'c', label: 'Containment', color: '#fb923c' },
        { id: 'e', label: 'Eradication', color: '#f472b6' },
        { id: 'r', label: 'Recovery', color: '#4ade80' },
        { id: 'l', label: 'Lessons', color: '#a78bfa' },
      ], items: [
        { text: 'On-call contact list ও playbook লেখা', bucket: 'p', explain: 'আগে থেকেই প্রস্তুতি।' },
        { text: 'Grafana-য় 401 spike alert দেখা', bucket: 'd', explain: 'সনাক্তকরণ।' },
        { text: 'Leak হওয়া AWS key সাথে সাথে disable', bucket: 'c', explain: 'ছড়ানো থামানো।' },
        { text: 'Compromised server network থেকে বিচ্ছিন্ন (snapshot নিয়ে)', bucket: 'c', explain: 'Isolation।' },
        { text: 'crontab-এ attacker-এর backdoor সরানো', bucket: 'e', explain: 'নির্মূল।' },
        { text: 'SQLi bug patch করা', bucket: 'e', explain: 'মূল কারণ দূর।' },
        { text: 'Clean image থেকে নতুন server deploy, monitoring বাড়িয়ে', bucket: 'r', explain: 'পুনরুদ্ধার।' },
        { text: 'Blameless post-mortem ও নতুন CI check', bucket: 'l', explain: 'শিক্ষা।' },
        { text: 'Log বিশ্লেষণ করে কোন data access হয়েছে নির্ণয়', bucket: 'd', explain: 'Analysis।' },
      ] },
    ],
    quiz: [
      { q: 'Breach সন্দেহ হলে server নিয়ে প্রথমে কী?', options: ['Format করো', 'Snapshot নিয়ে isolate', 'Ignore', 'Reboot'], answer: 1, explain: 'Evidence রক্ষা + ছড়ানো বন্ধ।' },
      { q: 'JWT secret leak হলে rotate করলে কী হয়?', options: ['কিছু না', 'সব পুরনো token invalid — সবাই আবার login', 'Database মুছে যায়', 'HTTPS বন্ধ'], answer: 1, explain: 'প্রত্যাশিত ও দরকারি।' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'critical',
      summary: 'Prepare → Detect → Contain → Eradicate → Recover → Learn।',
      rules: ['Playbook আগে থেকে লেখা', 'Snapshot → isolate (মুছো না)', 'সব secret rotate', 'Timeline রাখো', 'Clean source থেকে rebuild', 'Blameless post-mortem'],
      checklist: ['Contact list আপডেট?', 'Secret rotation কতক্ষণে সম্ভব?', 'Backup restore test?'],
      remember: 'আতঙ্ক নয়, playbook।',
    },
  },

  {
    id: 'capstone',
    phase: 6,
    no: '40',
    icon: '🏁',
    title: 'Capstone: পূর্ণ Security Audit',
    subtitle: 'পুরো architecture audit করে রিপোর্ট',
    duration: '৬০ মিনিট',
    goals: ['সব phase-এর জ্ঞান একসাথে প্রয়োগ', 'Layer ধরে audit', 'Severity নির্ধারণ (CVSS ধারণা)', 'Audit report লেখা'],
    steps: [
      {
        title: 'OWASP Top 10 (2021) — পুনরালোচনা',
        body: 'তুমি এখন পর্যন্ত যা শিখেছ তা OWASP Top 10-এর সাথে মেলাও:',
        points: ['A01 Broken Access Control — IDOR, AuthZ', 'A02 Cryptographic Failures — TLS, hashing, encryption', 'A03 Injection — SQLi, XSS', 'A04 Insecure Design — threat modeling, business logic', 'A05 Security Misconfiguration — Nginx, Docker, Redis, CORS, header', 'A06 Vulnerable Components — dependency', 'A07 Identification & Auth Failures — brute-force, session, JWT', 'A08 Software & Data Integrity — supply chain, CI/CD', 'A09 Logging & Monitoring Failures', 'A10 SSRF'],
      },
      {
        title: 'Audit report-এর গঠন',
        body: 'প্রতিটি finding-এ: শিরোনাম, severity (Critical/High/Medium/Low), প্রভাবিত component, বিবরণ, reproduce করার ধাপ, প্রভাব, সমাধান, reference। শুরুতে executive summary — non-technical পাঠকের জন্য।',
        code: [{ label: 'Finding template', lang: 'md', text: '## [HIGH] IDOR in GET /api/invoices/:id\n**Component:** Go Fiber API\n**Steps:** User A token দিয়ে /api/invoices/<B-এর id>\n**Impact:** যেকোনো user-এর invoice (নাম, ঠিকানা, phone) পড়া যায়\n**Fix:** WHERE id=$1 AND user_id=$2; 404 ফেরত\n**Ref:** OWASP API1:2023' }],
      },
    ],
    labs: [{ type: 'capstone', title: 'Full-Stack Audit — ShopBD', intro: 'ShopBD-এর পুরো stack (Next.js → Cloudflare → Nginx → Go Fiber → PostgreSQL/Redis → Docker/Linux) তোমার সামনে। প্রতিটি layer-এ ক্লিক করে evidence দেখো, finding চিহ্নিত করো ও severity দাও। শেষে তোমার audit report তৈরি হবে।' }],
    quiz: [
      { q: 'OWASP Top 10 2021-এ #1 কোনটি?', options: ['Injection', 'Broken Access Control', 'XSS', 'SSRF'], answer: 1, explain: 'A01।' },
      { q: 'Public Redis without password — severity?', options: ['Low', 'Medium', 'Critical', 'Info'], answer: 2, explain: 'Data + RCE সম্ভাবনা।' },
      { q: 'Audit report-এর শুরুতে কী থাকে?', options: ['Code dump', 'Executive summary', 'Nmap raw output', 'Password list'], answer: 1, explain: 'Non-technical পাঠকের জন্য সারাংশ।' },
    ],
    cheat: {
      category: 'Testing & Monitoring', severity: 'info',
      summary: 'Layer ধরে audit: Client → Edge → Proxy → API → Data → Host। প্রতিটি finding: severity + reproduce + fix।',
      rules: ['OWASP Top 10 + API Top 10 চেকলিস্ট', 'Deploy-এর আগে audit', 'Finding-এর owner ও deadline', 'Fix-এর পরে retest'],
      checklist: ['Phase 1–6-এর প্রতিটি cheatsheet checklist', 'Critical/High = deploy blocker'],
      remember: 'নিরাপত্তা একটি প্রক্রিয়া, একবারের কাজ নয়।',
    },
  },
];
