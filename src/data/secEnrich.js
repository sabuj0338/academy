// Security track-এর জন্য শেখার সহায়ক — মূল শব্দ, উপমা, animated chain, VS তুলনা।
// steps: { [stepIndex]: { analogy?, chain?, compare? } } — বিদ্যমান ধাপের সাথে মিশে যায় (নতুন ধাপ নয়, তাই progress অক্ষত)।
const V = (a, b) => [a, b];

export default {
  http: {
    terms: [['Request', 'Client-এর পাঠানো চিঠি: method + URL + header + body'], ['Response', 'Server-এর উত্তর: status + header + body'], ['Status code', '200 সফল, 401 পরিচয় নেই, 403 অনুমতি নেই, 500 server ভুল'], ['Header', 'চিঠির খামের উপরের তথ্য (Cookie, Authorization)'], ['Attack surface', 'যেসব জায়গা দিয়ে attacker ঢুকতে পারে']],
    steps: {
      0: { chain: [['🧑', 'Browser', 'request'], ['☁️', 'Cloudflare'], ['🔀', 'Nginx'], ['⚙️', 'Go Fiber'], ['🗄️', 'PostgreSQL'], ['📨', 'Response']] },
      1: { analogy: 'Request হলো রেস্টুরেন্টের অর্ডার স্লিপ: “কী চাই” (method + URL), “আমি কে” (header-এ token), আর বিস্তারিত (body)। মনে রেখো — যে কেউ নিজের হাতে স্লিপ লিখতে পারে, তাই রান্নাঘর প্রতিটি স্লিপ যাচাই করে।' },
      4: { compare: V({ title: '😇 সাধারণ user', items: ['তোমার বানানো UI ব্যবহার করে', 'বোতাম যা পাঠায় তাই পাঠায়', 'DevTools খোলে না'] }, { title: '😈 Attacker', items: ['UI-ই লাগে না — curl, Burp, script', 'যেকোনো field বদলায়, id বাড়ায়', 'Header নকল করে'] }) },
    },
  },
  session: {
    terms: [['Stateless', 'HTTP নিজে আগের request মনে রাখে না'], ['Session ID', 'Server-এ রাখা login-এর চাবির নম্বর'], ['HttpOnly', 'JavaScript cookie পড়তে পারবে না'], ['SameSite', 'অন্য site থেকে আসা request-এ cookie যাবে কি না'], ['Refresh token', 'নতুন access token আনার দীর্ঘমেয়াদি চাবি']],
    steps: {
      0: { analogy: 'HTTP হলো এমন দোকানদার যার স্মৃতিশক্তি শূন্য — প্রতিবার তুমি গেলে নতুন মানুষ ভাবে। তাই প্রথমবার পরিচয় দিলে সে তোমার হাতে একটা টোকেন (cookie) দেয়; এরপর টোকেন দেখালেই চেনে।' },
      1: { chain: [['🔑', 'Login', 'email + password'], ['🗄️', 'Session store', 'Redis: sid → user 7'], ['🍪', 'Set-Cookie', 'sid=9f2…'], ['🔁', 'প্রতি request', 'cookie যায়'], ['✅', 'Server চেনে']] },
      2: { analogy: 'Cookie-র attribute হলো খামের উপর লেখা নির্দেশ: “শুধু রেজিস্ট্রি ডাকে পাঠাবে” (Secure), “খুলে পড়া নিষেধ” (HttpOnly), “বাইরের লোক দিলে নেবে না” (SameSite)।' },
      4: { compare: V({ title: '⏱ Access token', items: ['স্বল্পমেয়াদি (১৫ মিনিট)', 'প্রতি API call-এ যায়', 'চুরি হলেও ক্ষতি সীমিত'] }, { title: '🔄 Refresh token', items: ['দীর্ঘমেয়াদি (দিন/সপ্তাহ)', 'শুধু token refresh endpoint-এ', 'HttpOnly cookie-তে রাখো, rotate করো'] }) },
      5: { analogy: 'Session hijacking = কেউ তোমার মেলার হাতের stamp-এর ছবি তুলে নিজের হাতে এঁকে নিল। দারোয়ান stamp দেখে, মানুষ নয় — তাই সে-ও ঢুকে যায়।' },
    },
  },
  authz: {
    terms: [['Authentication (AuthN)', 'তুমি কে — প্রমাণ'], ['Authorization (AuthZ)', 'তুমি কী করতে পারো — অনুমতি'], ['RBAC', 'Role-ভিত্তিক অনুমতি (admin, user)'], ['Ownership check', 'এই resource কি সত্যিই তোমার?'], ['Broken Access Control', 'OWASP #1 — অনুমতির যাচাই নেই বা ভুল']],
    steps: {
      0: { compare: V({ title: '🪪 Authentication', color: '#22d3ee', items: ['“তুমি কে?”', 'Password, OTP, passkey', 'ব্যর্থ হলে 401'] }, { title: '🔐 Authorization', color: '#a78bfa', items: ['“তুমি কি এটা করতে পারো?”', 'Role, ownership, policy', 'ব্যর্থ হলে 403'] }), analogy: 'বিমানবন্দরে passport দেখানো = authentication। Boarding pass-এ লেখা seat 14A — তুমি business class-এ বসতে পারবে না = authorization।' },
      3: { chain: [['📨', 'Request'], ['🪪', 'Auth middleware', 'কে?'], ['🎭', 'Role check', 'admin?'], ['📦', 'Ownership', 'তোমার?'], ['✅', 'Handler']] },
    },
  },
  recon: {
    terms: [['Recon', 'আক্রমণের আগে তথ্য সংগ্রহ'], ['Passive recon', 'Target-কে না ছুঁয়ে (crt.sh, Google, DNS)'], ['Active recon', 'সরাসরি target-এ request (scan, path খোঁজা)'], ['Source map', 'Minified JS-এর আসল code — production-এ ফাঁস হয়'], ['Attack surface', 'বাইরে থেকে পৌঁছানো যায় এমন সব কিছু']],
    steps: {
      0: { analogy: 'চোর ঢোকার আগে কয়েকদিন বাড়ির চারপাশে ঘোরে: কখন সবাই বাইরে যায়, কোন জানালা খোলা, পাপোশের নিচে চাবি আছে কি না। Defender হিসেবে তুমি নিজেই আগে এই ঘোরাঘুরি করো।' },
      1: { chain: [['🔎', 'crt.sh', 'subdomain'], ['📖', 'DNS', 'IP, mail'], ['🐙', 'GitHub', 'leaked code'], ['🗂️', 'Wayback', 'পুরনো path']] },
      2: { compare: V({ title: '🕵️ Passive', items: ['Target টের পায় না', 'Certificate log, search engine', 'আইনি ঝুঁকি কম'] }, { title: '📡 Active', items: ['সরাসরি request/scan', 'Log-এ ধরা পড়ে', 'শুধু অনুমতি থাকলে'] }) },
    },
  },
  threat: {
    terms: [['Threat model', 'কে, কী, কীভাবে আক্রমণ করতে পারে তার মানচিত্র'], ['Trust boundary', 'যেখানে data কম বিশ্বস্ত থেকে বেশি বিশ্বস্ত এলাকায় ঢোকে'], ['STRIDE', 'Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation'], ['Risk', 'সম্ভাবনা × ক্ষতি'], ['Mitigation', 'ঝুঁকি কমানোর ব্যবস্থা']],
    steps: {
      0: { analogy: 'বাড়ি বানানোর আগেই স্থপতি ভাবেন: চোর কোন দিক দিয়ে আসবে, আগুন লাগলে কোন দরজা দিয়ে বেরোবে। পরে দেয়াল ভেঙে দরজা বানানোর চেয়ে নকশাতেই রাখা অনেক সস্তা।' },
      1: { chain: [['🌍', 'Internet', 'অবিশ্বস্ত'], ['🧱', 'Boundary', 'validate!'], ['⚙️', 'API', 'বিশ্বস্ত এলাকা'], ['🧱', 'Boundary'], ['🗄️', 'DB']] },
      3: { compare: V({ title: '🔥 আগে ঠিক করো', color: '#f87171', items: ['সম্ভাবনা বেশি + ক্ষতি বেশি', 'যেমন: IDOR-এ সবার invoice', 'Payment bypass'] }, { title: '🕐 পরে', color: '#fbbf24', items: ['সম্ভাবনা কম বা ক্ষতি কম', 'যেমন: version header leak', 'Low-traffic admin page-এর ছোট ত্রুটি'] }) },
    },
  },
  xss: {
    terms: [['XSS', 'অন্যের page-এ attacker-এর JavaScript চালানো'], ['Stored XSS', 'Payload database-এ জমা, সবাই দেখলে চলে'], ['Reflected XSS', 'URL-এর payload সাথে সাথে page-এ ফিরে আসে'], ['Escaping', '< কে &lt; বানানো — code নয়, লেখা হিসেবে দেখানো'], ['CSP', 'Browser-কে বলা কোন script চালানো যাবে']],
    steps: {
      0: { analogy: 'স্কুলের notice board-এ কেউ এমন কাগজ লাগাল যাতে লেখা “এটা পড়লে নিজের টিফিনের টাকা আমাকে দিয়ে দাও” — আর পাঠকরা (browser) সেটা নির্দেশ হিসেবে মেনে নেয়! Website অন্যের লেখাকে code হিসেবে চালালে এটাই হয়।' },
      1: { chain: [['😈', 'Attacker', 'comment-এ <script>'], ['🗄️', 'DB-তে জমা'], ['🌐', 'Victim page খোলে'], ['⚡', 'Script চলে'], ['🍪', 'Token চুরি']] },
      3: { compare: V({ title: '✖ বিপজ্জনক', color: '#f87171', items: ['dangerouslySetInnerHTML={{__html: comment}}', 'innerHTML = userInput', 'href={userUrl} (javascript: চলে)'] }, { title: '✔ নিরাপদ', color: '#4ade80', items: ['{comment} — React নিজে escape করে', 'DOMPurify দিয়ে sanitize', 'URL-এ শুধু http/https allow + CSP'] }) },
    },
  },
  csrf: {
    terms: [['CSRF', 'অন্য site থেকে তোমার নামে request পাঠিয়ে নেওয়া'], ['Ambient credential', 'Browser নিজে থেকে পাঠানো cookie'], ['CSRF token', 'Form-এর ভেতরের গোপন সংখ্যা যা attacker জানে না'], ['SameSite=Lax', 'অন্য site-এর POST-এ cookie যায় না'], ['Origin header', 'Request কোন site থেকে এলো']],
    steps: {
      0: { analogy: 'তুমি bank-এ logged in। একটা মজার website-এ একটা ছবি দেখলে, কিন্তু ছবির পেছনে লুকানো ফর্ম তোমার নামে bank-কে বলে “৫০০০ টাকা পাঠাও”। Bank দেখে তোমার cookie আছে, ভাবে তুমিই চেয়েছ — যেন কেউ তোমার হাত ধরে চেকে সই করিয়ে নিল।' },
      1: { chain: [['🎣', 'evil.com খোলো'], ['📝', 'লুকানো form', 'POST bank.com/transfer'], ['🍪', 'Browser cookie যোগ করে'], ['🏦', 'Bank: “ঠিক আছে”'], ['💸', 'টাকা গেল']] },
      2: { compare: V({ title: '🛡 Browser-স্তর', items: ['SameSite=Lax/Strict cookie', 'State বদলানো কাজ GET-এ নয়'] }, { title: '🛡 Server-স্তর', items: ['CSRF token যাচাই', 'Origin/Referer header check', 'গুরুত্বপূর্ণ কাজে আবার password/OTP'] }) },
    },
  },
  sqli: {
    terms: [['SQL Injection', 'Input দিয়ে SQL query-র অর্থ বদলে দেওয়া'], ['Parameterized query', '$1 placeholder — input সবসময় data, কখনো code নয়'], ['UNION attack', 'অন্য table-এর data নিজের result-এ জুড়ে আনা'], ['Blind SQLi', 'উত্তর দেখা যায় না, হ্যাঁ/না বা সময় দিয়ে অনুমান'], ['Least privilege', 'App-এর DB user শুধু দরকারি অনুমতি পায়']],
    steps: {
      0: { analogy: 'লাইব্রেরিয়ানকে চিরকুট দিলে: “রহিমের বই দিন”। চালাক কেউ লিখল: “রহিমের বই দিন — অথবা সবার বই দিন”। লাইব্রেরিয়ান যদি পুরো চিরকুট নির্দেশ হিসেবে পড়ে, সবার বই দিয়ে দেবে। Parameterized query মানে লাইব্রেরিয়ান শুধু নামের ঘরটা পড়ে, বাকি লেখাকে নাম হিসেবেই ধরে।' },
      1: { compare: V({ title: '✖ String জোড়া', color: '#f87171', items: ["\"… WHERE email='\" + email + \"'\"", "email = ' OR 1=1--", 'Query-র অর্থ বদলে গেল'] }, { title: '✔ Parameterized', color: '#4ade80', items: ['db.Query("… WHERE email=$1", email)', 'Input আলাদাভাবে যায়', "' OR 1=1-- শুধু একটা অদ্ভুত email"] }) },
      3: { chain: [['📝', 'Input validate'], ['🧩', 'Parameterized query'], ['🔒', 'Least-privilege DB user'], ['☁️', 'WAF (অতিরিক্ত)'], ['📜', 'Error গোপন']] },
    },
  },
  idor: {
    terms: [['IDOR', 'Insecure Direct Object Reference — id বদলে অন্যের data'], ['BOLA', 'API-তে একই সমস্যা: Broken Object Level Authorization'], ['Ownership check', 'WHERE id=$1 AND user_id=$2'], ['/me pattern', 'Client id পাঠায় না, server session থেকে নেয়'], ['UUID', 'অনুমান-অযোগ্য id (কিন্তু authz-এর বিকল্প নয়)']],
    steps: {
      0: { analogy: 'জিমের লকার ১০৪ তোমার। চাবির বদলে শুধু নম্বর বললেই লকার খোলে — তুমি ১০৫ বললে অন্যের লকারও খুলে যায়! পাহারাদারের দেখা উচিত ছিল লকারটা আসলে কার।' },
      1: { chain: [['👤', 'User 7 logged in'], ['📨', 'GET /invoices/1001 ✓'], ['✏️', 'id → 1002'], ['🗄️', 'SELECT … WHERE id=1002'], ['😱', 'অন্যের invoice']] },
      2: { compare: V({ title: '✖ শুধু id', color: '#f87171', items: ['WHERE id = $1', 'Login থাকলেই যথেষ্ট ভাবা', 'Frontend-এ বোতাম লুকানো'] }, { title: '✔ id + মালিক', color: '#4ade80', items: ['WHERE id = $1 AND user_id = $2', 'না পেলে 404 (অস্তিত্বও ফাঁস নয়)', 'প্রতিটি endpoint-এ test'] }) },
    },
  },
  ssrf: {
    terms: [['SSRF', 'Server-কে দিয়ে attacker-এর পছন্দের URL-এ request করানো'], ['Metadata endpoint', '169.254.169.254 — cloud-এর গোপন credential'], ['Internal network', 'বাইরে থেকে না পৌঁছানো private service'], ['Allowlist', 'শুধু অনুমোদিত domain-এ যেতে দেওয়া'], ['DNS rebinding', 'যাচাইয়ের পরে domain-এর IP বদলে দেওয়ার কৌশল']],
    steps: {
      0: { analogy: 'তুমি অফিসের বাইরের লোক, ভেতরের archive রুমে ঢুকতে পারো না। কিন্তু অফিসের পিয়নকে বললে “এই ঠিকানা থেকে ফাইলটা এনে দাও” — আর ঠিকানাটা archive রুমের! পিয়ন ভেতরের লোক, তাকে কেউ আটকায় না।' },
      1: { chain: [['😈', 'url=http://169.254.169.254/'], ['⚙️', 'Server fetch করে'], ['☁️', 'Cloud metadata'], ['🔑', 'IAM credential'], ['💥', 'পুরো cloud account']] },
      3: { compare: V({ title: '✖ Blocklist', color: '#f87171', items: ['“localhost বাদ”', '127.1, 0x7f000001, [::1] দিয়ে bypass', 'Redirect দিয়ে bypass'] }, { title: '✔ Allowlist + network', color: '#4ade80', items: ['শুধু নির্দিষ্ট domain/scheme', 'Resolve করা IP private কিনা যাচাই', 'Redirect বন্ধ, IMDSv2, egress firewall'] }) },
    },
  },
  upload: {
    terms: [['Content-Type', 'Client-এর দাবি করা file ধরন — নকল করা যায়'], ['Magic bytes', 'File-এর শুরুর আসল চিহ্ন (JPEG = FF D8 FF)'], ['Web shell', 'Server-এ চালানো যায় এমন upload করা script'], ['Re-encode', 'ছবি নতুন করে বানানো — লুকানো payload মুছে যায়'], ['Polyglot', 'একসাথে বৈধ ছবি ও বৈধ script']],
    steps: {
      0: { analogy: 'বিমানবন্দরে ব্যাগের গায়ে “কাপড়” লেবেল দেখে ছেড়ে দিলে চলে না — স্ক্যানারে ভেতর দেখতে হয়। File-এর নাম আর Content-Type হলো লেবেল; magic bytes আর re-encode হলো স্ক্যানার।' },
      2: { chain: [['📏', 'Size limit'], ['🔍', 'Magic bytes'], ['🎨', 'Re-encode'], ['🆔', 'Random নাম'], ['🪣', 'Web root-এর বাইরে / S3']] },
    },
  },
  traversal: {
    terms: [['Path traversal', '../ দিয়ে অনুমোদিত folder থেকে বেরিয়ে যাওয়া'], ['Canonicalize', 'Path-কে চূড়ান্ত রূপে আনা (filepath.Clean)'], ['Base directory', 'যে folder-এর বাইরে যাওয়া নিষেধ'], ['Encoding bypass', '%2e%2e%2f = ../'], ['/etc/passwd', 'Attacker-এর প্রিয় প্রথম লক্ষ্য']],
    steps: {
      0: { analogy: 'লাইব্রেরির পাবলিক তাকের ঠিকানা “তাক-৩/বই-৫”। কেউ লিখল “তাক-৩/../../স্টোররুম/গোপন-ফাইল” — প্রতিটি ../ মানে এক ধাপ পেছনে। লাইব্রেরিয়ান না বুঝে হাঁটতে থাকলে স্টোররুমে পৌঁছে যায়।' },
      1: { chain: [['📁', '/files/report.pdf'], ['⬆️', '../'], ['⬆️', '../'], ['📂', '/etc'], ['🔑', 'passwd']] },
      2: { compare: V({ title: '✖ String ফিল্টার', color: '#f87171', items: ['replace("../", "")', '....// দিয়ে bypass', 'URL encoding দিয়ে bypass'] }, { title: '✔ Clean + prefix check', color: '#4ade80', items: ['filepath.Clean(filepath.Join(base, name))', 'ফল base দিয়ে শুরু কিনা যাচাই', 'বা id → path mapping, user নাম নয়'] }) },
    },
  },
  clickjack: {
    terms: [['Clickjacking', 'অদৃশ্য iframe-এর বোতামে তোমাকে দিয়ে ক্লিক করানো'], ['iframe', 'এক page-এর ভেতরে আরেক page'], ['X-Frame-Options', 'DENY/SAMEORIGIN — frame-এ খোলা নিষেধ'], ['frame-ancestors', 'CSP-র আধুনিক বিকল্প'], ['UI redress', 'Clickjacking-এর আরেক নাম']],
    steps: {
      0: { analogy: 'একটা চকচকে “🎁 পুরস্কার নাও” বোতাম, কিন্তু তার উপর একটা স্বচ্ছ কাচ, আর কাচের ঠিক সেই জায়গায় bank-এর “টাকা পাঠাও” বোতাম। তুমি পুরস্কার চাপছ ভাবছ, আসলে চাপছ কাচের নিচের বোতাম।', chain: [['🎁', 'Evil page', 'লোভনীয় বোতাম'], ['🪟', 'স্বচ্ছ iframe', 'opacity: 0'], ['🏦', 'Bank page', 'logged in'], ['👆', 'ক্লিক'], ['💸', 'অজান্তে transfer']] },
      1: { compare: V({ title: '✖ Header নেই', color: '#f87171', items: ['যেকোনো site তোমাকে frame করতে পারে', 'JS frame-buster সহজে ভাঙা যায়'] }, { title: '✔ Header আছে', color: '#4ade80', items: ['X-Frame-Options: DENY', "CSP: frame-ancestors 'none'", 'Browser frame খুলতেই দেয় না'] }) },
    },
  },
  redirect: {
    terms: [['Open redirect', '?next=… দিয়ে যেকোনো site-এ পাঠিয়ে দেওয়া'], ['Phishing', 'আসল site-এর নামে নকল page'], ['Allowlist', 'শুধু নিজের path/domain'], ['Relative path', '/dashboard — domain ছাড়া, নিরাপদ'], ['OAuth redirect_uri', 'Open redirect এখানে থাকলে token চুরি']],
    steps: {
      0: { analogy: 'বিশ্বস্ত স্কুলের গেটে সাইনবোর্ড: “লাইব্রেরি এই দিকে →”। কেউ তীরটা ঘুরিয়ে চোরের গলির দিকে করে দিল। মানুষ স্কুলের সাইনবোর্ড বলে বিশ্বাস করে হাঁটতে থাকে।', chain: [['📧', 'Email: bank.com/login?next=…'], ['🏦', 'আসল bank.com', 'বিশ্বাসযোগ্য'], ['↪️', 'Redirect'], ['🎣', 'evil-bank.com', 'নকল login'], ['🔑', 'Password চুরি']] },
      2: { compare: V({ title: '✖ যা আসে তাই', color: '#f87171', items: ['redirect(req.query.next)', '//evil.com, https:evil.com bypass'] }, { title: '✔ শুধু নিজের path', color: '#4ade80', items: ['next “/” দিয়ে শুরু, “//” নয়', 'অথবা id → path allowlist', 'বাইরে গেলে সতর্কবার্তা page'] }) },
    },
  },
  bruteforce: {
    terms: [['Brute force', 'সব সম্ভাব্য password একে একে চেষ্টা'], ['Credential stuffing', 'অন্য site-এর ফাঁস হওয়া email+password চেষ্টা'], ['Password spraying', 'অনেক account-এ কয়েকটা সাধারণ password'], ['User enumeration', 'Error message দেখে কোন email-এর account আছে বোঝা'], ['MFA', 'Password-এর সাথে দ্বিতীয় প্রমাণ (OTP, passkey)']],
    steps: {
      0: { compare: V({ title: '🔨 Brute force', items: ['এক account', 'হাজারো password', 'Account lockout/rate limit ধরে'] }, { title: '🌧 Spraying / stuffing', items: ['হাজারো account', 'প্রতিটিতে ১-২টি password', 'Per-account limit এড়িয়ে যায় → IP/global limit + MFA লাগে'] }), analogy: 'তালার সব combination একে একে ঘোরানো = brute force। আর পুরো পাড়ার সব দরজায় “1234” চেষ্টা করা = spraying — কোনো এক দরজা খুলবেই।' },
      1: { analogy: 'দারোয়ান যদি বলে “এই নামে কেউ থাকে না” আর অন্যজনকে বলে “নাম ঠিক, কিন্তু চাবি ভুল” — চোর বুঝে যায় কে কে থাকে। সব ক্ষেত্রে একই উত্তর: “email বা password ভুল”।' },
      3: { chain: [['🪣', 'Rate limit', 'IP + account'], ['⏳', 'Backoff/lockout'], ['🤖', 'CAPTCHA (সন্দেহে)'], ['📱', 'MFA'], ['🔔', 'Alert']] },
    },
  },
  massassign: {
    terms: [['Mass assignment', 'Request body সরাসরি model-এ বসিয়ে দেওয়া'], ['DTO', 'শুধু অনুমোদিত field-এর আলাদা struct'], ['Allowlist binding', 'কোন field বদলানো যাবে তা আগেই ঠিক করা'], ['Excessive data exposure', 'দরকারের বেশি field response-এ পাঠানো'], ['OWASP API Top 10', 'API-এর সবচেয়ে সাধারণ ১০টি ঝুঁকি']],
    steps: {
      1: { analogy: 'Profile ফর্মে শুধু “নাম” আর “ঠিকানা”র ঘর। কিন্তু কেউ নিজে থেকে কাগজের নিচে লিখে দিল “role: admin, balance: 1000000” — আর অফিস চোখ বন্ধ করে পুরো কাগজটাই ফাইলে তুলে নিল।', compare: V({ title: '✖ সরাসরি bind', color: '#f87171', items: ['c.BodyParser(&user) → db.Save(user)', 'Client role/is_admin পাঠালেই বদলে যায়'] }, { title: '✔ DTO', color: '#4ade80', items: ['type UpdateProfile struct { Name, Address }', 'শুধু এই field copy', 'role কেবল admin API-তে'] }) },
      2: { analogy: 'Waiter-কে এক গ্লাস পানি চাইলে সে পুরো ফ্রিজ টেবিলে রেখে গেল — “যা দরকার নিয়ে নাও”। Frontend যা দেখায় না তা-ও network tab-এ সবাই দেখতে পায়।' },
    },
  },
  jwt: {
    terms: [['Header.Payload.Signature', 'JWT-এর তিন অংশ, base64url-এ'], ['alg', 'কোন algorithm দিয়ে সই — server ঠিক করবে, token নয়'], ['HS256', 'একই secret দিয়ে সই ও যাচাই'], ['RS256', 'Private key দিয়ে সই, public key দিয়ে যাচাই'], ['exp', 'মেয়াদ শেষের সময়']],
    steps: {
      0: { analogy: 'JWT হলো সিল-মোহর দেওয়া পরিচয়পত্র। লেখা যে কেউ পড়তে পারে (base64 মানে গোপন নয়!), কিন্তু সিল নকল করা যায় না — যদি দারোয়ান সত্যিই সিল পরীক্ষা করে।', chain: [['📝', 'Header', '{alg:HS256}'], ['📦', 'Payload', '{sub:7, role:user}'], ['✍️', 'Signature', 'HMAC(secret)'], ['🔍', 'Server যাচাই', 'alg + sig + exp']] },
      1: { analogy: 'alg=none মানে পরিচয়পত্রে লেখা “এই কার্ডে সিল লাগবে না”। বোকা দারোয়ান কার্ডের কথাই মেনে নেয় — অথচ নিয়ম ঠিক করবে দারোয়ান, কার্ড নয়।' },
      3: { compare: V({ title: '✖ Token-কে বিশ্বাস', color: '#f87171', items: ['token.alg যা বলে তাই', 'RS256 public key-কে HS256 secret হিসেবে ব্যবহার', 'Attacker নিজে সই করে'] }, { title: '✔ Server-এর নিয়ম', color: '#4ade80', items: ['Allowed alg আগে থেকে fixed', 'Key type-ও যাচাই', 'exp, iss, aud check'] }) },
    },
  },
  oauth: {
    terms: [['OAuth 2.0', 'Password না দিয়ে সীমিত অনুমতি দেওয়ার পদ্ধতি'], ['OIDC', 'OAuth-এর উপর login/পরিচয় স্তর (id_token)'], ['Authorization code', 'একবার-ব্যবহারযোগ্য কোড, পরে token-এ বদলায়'], ['PKCE', 'Code চুরি হলেও কাজে লাগানো যায় না এমন প্রমাণ'], ['state', 'CSRF ঠেকাতে random মান']],
    steps: {
      0: { analogy: 'Hotel-এর valet-কে গাড়ির পুরো চাবি নয়, “valet key” দাও — শুধু চালাতে পারবে, ডিকি খুলতে পারবে না। OAuth ঠিক তাই: app তোমার Google password পায় না, শুধু সীমিত অনুমতির token।' },
      1: { chain: [['📱', 'App', 'code_challenge'], ['🔐', 'Google login', 'user রাজি'], ['↪️', 'redirect_uri?code=…'], ['🔁', 'code + verifier → token'], ['✅', 'id_token / access_token']] },
      3: { compare: V({ title: '✖ সাধারণ ভুল', color: '#f87171', items: ['redirect_uri wildcard', 'state নেই (login CSRF)', 'Implicit flow — URL-এ token', 'id_token যাচাই না করা'] }, { title: '✔ নিরাপদ', color: '#4ade80', items: ['Exact redirect_uri match', 'state + PKCE সবসময়', 'Authorization code flow', 'iss, aud, exp, nonce যাচাই'] }) },
    },
  },
  apiabuse: {
    terms: [['Rate limit', 'নির্দিষ্ট সময়ে সর্বোচ্চ কতবার'], ['Token bucket', 'Token জমে, প্রতি request একটা খরচ'], ['Sliding window', 'শেষ N সেকেন্ডের হিসাব'], ['429', 'Too Many Requests + Retry-After'], ['Resource limit', 'Page size, upload size, query complexity সীমা']],
    steps: {
      0: { analogy: 'বুফেতে নিয়ম না থাকলে একজন ১০০০ প্লেট তুলে নেয়, বাকিরা খালি হাতে ফেরে। Rate limit = “প্রতি জন, প্রতি ৫ মিনিটে এক প্লেট”।' },
      1: { compare: V({ title: '🪣 Token bucket', items: ['Burst অনুমতি দেয় (bucket ভরা থাকলে)', 'গড় হার নিয়ন্ত্রণ', 'API-র জন্য জনপ্রিয়'] }, { title: '🪟 Fixed / sliding window', items: ['প্রতি মিনিটে সর্বোচ্চ N', 'Fixed: সীমানায় দ্বিগুণ burst সম্ভব', 'Sliding: মসৃণ, একটু বেশি হিসাব'] }) },
      2: { chain: [['☁️', 'Cloudflare', 'IP/country'], ['🔀', 'Nginx', 'limit_req'], ['⚙️', 'App', 'per-user/API key'], ['🗄️', 'Query', 'max limit clamp']] },
    },
  },
  cors: {
    terms: [['Origin', 'scheme + domain + port (https://app.com:443)'], ['SOP', 'Same-Origin Policy — অন্য origin-এর response পড়া নিষেধ'], ['CORS', 'Server-এর দেওয়া ব্যতিক্রমের অনুমতি'], ['Preflight', 'আসল request-এর আগে OPTIONS জিজ্ঞাসা'], ['Credentials', 'Cookie সহ cross-origin request']],
    steps: {
      0: { analogy: 'Browser একজন কড়া দারোয়ান: evil.com-এর script তোমার bank.com-এ চিঠি পাঠাতে পারে, কিন্তু উত্তরের খাম খুলে পড়তে পারবে না — যদি না bank.com নিজে অনুমতি তালিকায় evil.com-এর নাম লিখে দেয় (CORS header)।', chain: [['😈', 'evil.com script'], ['📨', 'fetch(api.bank.com)'], ['🏦', 'Response আসে'], ['🛂', 'Browser: ACAO দেখে'], ['⛔', 'অনুমতি নেই → পড়া বন্ধ']] },
      1: { compare: V({ title: '✖ বিপজ্জনক', color: '#f87171', items: ['Origin যা আসে তাই ফেরত (reflect)', 'ACAO: * + credentials', 'null origin allow', 'endsWith("bank.com") → evilbank.com'] }, { title: '✔ নিরাপদ', color: '#4ade80', items: ['নির্দিষ্ট origin-এর exact তালিকা', 'Credentials শুধু দরকার হলে', 'Vary: Origin', 'CORS ≠ authentication'] }) },
    },
  },
  mobile: {
    terms: [['APK/IPA', 'App-এর package — যে কেউ খুলে দেখতে পারে'], ['Decompile', 'App থেকে প্রায়-আসল code বের করা (jadx)'], ['Keystore/Keychain', 'OS-এর নিরাপদ গোপন ভাণ্ডার'], ['Root/Jailbreak', 'OS-এর সুরক্ষা ভেঙে পূর্ণ নিয়ন্ত্রণ'], ['Deep link', 'URL দিয়ে app-এর নির্দিষ্ট screen খোলা']],
    steps: {
      0: { analogy: 'তোমার app হলো দোকানে বিক্রি করা একটা খেলনা — কেনার পরে মালিক স্ক্রু খুলে ভেতরের সব যন্ত্রাংশ দেখতে পারে। খেলনার ভেতরে বাড়ির চাবি লুকিয়ে রাখা বোকামি।' },
      1: { compare: V({ title: '✖ App-এর ভেতরে', color: '#f87171', items: ['const STRIPE_SECRET = "sk_live…"', 'Admin API key', 'strings/jadx দিয়ে ১ মিনিটে বের'] }, { title: '✔ Backend-এ', color: '#4ade80', items: ['Secret শুধু server-এ', 'App user-এর token দিয়ে backend ডাকে', 'Public key-গুলোও domain/bundle restrict'] }) },
      2: { chain: [['🔑', 'Token'], ['🚫', 'SharedPreferences নয়'], ['🛡', 'flutter_secure_storage'], ['🔐', 'Keystore / Keychain']] },
    },
  },
  pinning: {
    terms: [['MITM', 'মাঝখানে বসে traffic পড়া/বদলানো'], ['User-installed CA', 'Phone-এ নিজে বসানো certificate — Burp এভাবেই কাজ করে'], ['Certificate pinning', 'App শুধু নির্দিষ্ট cert/public key বিশ্বাস করে'], ['SPKI hash', 'Public key-এর fingerprint'], ['Backup pin', 'Key বদলানোর জন্য আগে থেকে রাখা দ্বিতীয় pin']],
    steps: {
      0: { analogy: 'তুমি বন্ধুকে চিঠি দিচ্ছ, কিন্তু ডাকঘরের এক কর্মচারী প্রতিটি খাম খুলে পড়ে, আবার নতুন খামে ভরে পাঠায় — দুজনেই কিছু টের পাও না। এটাই Man-in-the-Middle।', chain: [['📱', 'App'], ['🦹', 'MITM proxy', 'নকল cert'], ['🏦', 'Server']] },
      1: { analogy: 'Pinning মানে app আগে থেকেই বন্ধুর হাতের লেখা চেনে। নকল চিঠি যত নিখুঁত সিলই দিক, হাতের লেখা না মিললে app কথা বলবে না।', compare: V({ title: '🔓 Pinning ছাড়া', items: ['OS-এর যেকোনো বিশ্বস্ত CA', 'User CA বসালে MITM সম্ভব'] }, { title: '📌 Pinning সহ', items: ['শুধু নির্দিষ্ট public key', 'নকল cert-এ connection বন্ধ', 'Backup pin + rotation পরিকল্পনা জরুরি'] }) },
    },
  },
  linux: {
    terms: [['root', 'Linux-এর সর্বশক্তিমান user'], ['sudo', 'অস্থায়ীভাবে root ক্ষমতা'], ['chmod 600', 'শুধু মালিক পড়তে/লিখতে পারে'], ['SUID', 'File-টা মালিকের ক্ষমতায় চলে — privilege escalation-এর পথ'], ['unattended-upgrades', 'নিজে থেকে security update']],
    steps: {
      0: { analogy: 'নতুন VPS চালু করার কয়েক মিনিটের মধ্যেই bot-রা দরজায় ধাক্কা দেয় — যেন নতুন দোকান খুলতেই পাড়ার সব চোর একবার করে দরজার তালা টেনে দেখে যায়।' },
      1: { analogy: 'Permission হলো বাড়ির চাবির গোছা: রান্নাঘরের চাবি রাঁধুনির কাছে, আলমারির চাবি শুধু মালিকের কাছে। সবাইকে মাস্টার-কি (root) দিলে একজনের ভুলে পুরো বাড়ি খোলা।', compare: V({ title: '✖', color: '#f87171', items: ['সব কিছু root হিসেবে চালানো', 'chmod 777', '.env সবার পড়ার যোগ্য'] }, { title: '✔', color: '#4ade80', items: ['App-এর আলাদা non-root user', 'chmod 600 .env', 'sudo শুধু দরকার হলে'] }) },
      3: { chain: [['🆕', 'apt upgrade'], ['🤖', 'unattended-upgrades'], ['🧹', 'অপ্রয়োজনীয় service বন্ধ'], ['🔍', 'ss -tlnp যাচাই']] },
    },
  },
  ssh: {
    terms: [['SSH key pair', 'Private key তোমার কাছে, public key server-এ'], ['ed25519', 'আধুনিক, ছোট, নিরাপদ key type'], ['PasswordAuthentication no', 'Password দিয়ে login বন্ধ'], ['fail2ban', 'বারবার ব্যর্থ IP-কে ban'], ['Bastion', 'একটি পাহারাদার server যার মাধ্যমে বাকিগুলোতে ঢোকা']],
    steps: {
      0: { analogy: 'SSH হলো server-এর সামনের দরজা, আর password হলো এমন তালা যার combination লাখো চোর দিনরাত ঘুরিয়ে দেখছে।' },
      1: { analogy: 'Key-based login = আঙুলের ছাপের তালা। Public key হলো দরজায় রাখা ছাপের নমুনা (সবাই দেখলেও ক্ষতি নেই), private key তোমার আঙুল — কখনো কাউকে দেবে না।', chain: [['🔑', 'ssh-keygen -t ed25519'], ['📤', 'ssh-copy-id'], ['🚪', 'authorized_keys'], ['🚫', 'Password বন্ধ']] },
      3: { compare: V({ title: '🧱 Network স্তর', items: ['Firewall-এ শুধু নিজের IP', 'VPN/Tailscale-এর পেছনে', 'Bastion host'] }, { title: '🛡 Login স্তর', items: ['root login বন্ধ', 'fail2ban', 'MFA (TOTP) বা hardware key'] }) },
    },
  },
  firewall: {
    terms: [['Firewall', 'নিয়ম অনুযায়ী traffic আটকায়/ছাড়ে'], ['Default deny', 'সব বন্ধ, শুধু দরকারিগুলো খোলা'], ['UFW', 'Ubuntu-র সহজ firewall'], ['nmap', 'কোন port খোলা তা খোঁজার tool'], ['Origin lockdown', 'Origin server শুধু Cloudflare IP থেকে traffic নেয়']],
    steps: {
      0: { analogy: 'Attacker-এর চোখে তোমার server একটা বিল্ডিং যার ৬৫,৫৩৫টি দরজা। nmap দিয়ে সে প্রতিটি দরজার হাতল ঘুরিয়ে দেখে কোনটা খোলা।' },
      1: { analogy: 'Default deny = গেটের দারোয়ানের হাতে একটা ছোট অতিথি তালিকা; তালিকায় নাম না থাকলে কেউ ঢুকবে না। উল্টোটা (default allow) মানে শুধু কালো তালিকার লোক আটকানো — নতুন চোর ঠিকই ঢুকে যায়।', chain: [['🚫', 'ufw default deny incoming'], ['🔑', 'allow 22 (নিজের IP)'], ['🌐', 'allow 80, 443'], ['✅', 'ufw enable']] },
      2: { compare: V({ title: '✖ Docker -p 5432:5432', color: '#f87171', items: ['iptables-এ নিজের rule বসায়', 'UFW deny থাকলেও internet থেকে খোলা!'] }, { title: '✔ -p 127.0.0.1:5432:5432', color: '#4ade80', items: ['শুধু localhost-এ bind', 'অথবা port publish না করে Docker network'] }) },
    },
  },
  nginx: {
    terms: [['Reverse proxy', 'App-এর সামনে বসে request সামলায়'], ['server_tokens off', 'Version লুকানো'], ['client_max_body_size', 'Upload-এর সর্বোচ্চ আকার'], ['limit_req', 'Nginx-স্তরের rate limit'], ['real_ip', 'Cloudflare-এর পেছনে আসল visitor IP']],
    steps: {
      0: { analogy: 'Nginx হলো অফিসের রিসেপশন: প্রতিটি অতিথি আগে এখানে আসে। রিসেপশনিস্ট ব্যাগের আকার দেখে (body size), বেশিবার এলে থামায় (rate limit), আর ভেতরের অফিসের ঠিকানা বাইরে বলে না।', chain: [['🌐', 'Visitor'], ['🔀', 'Nginx', 'TLS, header, limit'], ['⚙️', '127.0.0.1:3000', 'Go Fiber']] },
      2: { compare: V({ title: '✖ real_ip ছাড়া', color: '#f87171', items: ['সব request Cloudflare-এর IP থেকে আসে মনে হয়', 'Rate limit সবাইকে একসাথে আটকায়', 'Log অর্থহীন'] }, { title: '✔ real_ip সহ', color: '#4ade80', items: ['set_real_ip_from <CF ranges>', 'real_ip_header CF-Connecting-IP', 'শুধু CF range বিশ্বাস — নইলে header নকল'] }) },
    },
  },
  docker: {
    terms: [['Container', 'আলাদা করা process — VM নয়, একই kernel'], ['Container escape', 'Container থেকে host-এর নিয়ন্ত্রণ নেওয়া'], ['--privileged', 'প্রায় সব সুরক্ষা বন্ধ — বিপজ্জনক'], ['docker.sock', 'Docker-এর রিমোট কন্ট্রোল — mount করা = root দেওয়া'], ['distroless', 'Shell ছাড়া ক্ষুদ্র image']],
    steps: {
      0: { analogy: 'Container হলো একই বাড়ির আলাদা কাচের ঘর — দেয়াল আছে, কিন্তু ভিত (kernel) একই। Container-কে root, privileged বা docker.sock দিলে মানে কাচের ঘরের ভেতরে পুরো বাড়ির মাস্টার-কি রেখে দেওয়া।', chain: [['😈', 'App-এ RCE'], ['📦', 'Container root'], ['🔌', 'docker.sock mounted'], ['🖥️', 'Host-এ নতুন privileged container'], ['💥', 'পুরো server']] },
      2: { compare: V({ title: '✖', color: '#f87171', items: ['USER root', '--privileged', '-v /var/run/docker.sock', 'image-এ secret'] }, { title: '✔', color: '#4ade80', items: ['USER nonroot', '--cap-drop=ALL, read-only fs', 'no-new-privileges', 'Secret runtime-এ env/secret store থেকে'] }) },
    },
  },
  ddos: {
    terms: [['DDoS', 'হাজারো device থেকে একসাথে আক্রমণ করে service বন্ধ করা'], ['Volumetric', 'Bandwidth ভরিয়ে দেওয়া (Gbps)'], ['L7 / HTTP flood', 'দামি endpoint বারবার ডাকা'], ['Botnet', 'Hack করা হাজারো device-এর বাহিনী'], ['Origin IP', 'Cloudflare-এর পেছনের আসল server-এর IP']],
    steps: {
      0: { analogy: 'ছোট একটা দোকানে হঠাৎ ৫০০০ লোক ঢুকে শুধু দাম জিজ্ঞেস করছে, কেউ কিনছে না — আসল ক্রেতারা ঢুকতেই পারছে না।', compare: V({ title: '🌊 Volumetric (L3/4)', items: ['বিশাল bandwidth (UDP flood)', 'তোমার লাইন ভরে যায়', 'শুধু বড় network (Cloudflare) শোষণ করতে পারে'] }, { title: '🎯 Application (L7)', items: ['কম traffic, দামি request (search, login)', 'Server CPU/DB ভরে যায়', 'Rate limit, cache, WAF, challenge'] }) },
      1: { chain: [['🤖', 'Botnet'], ['☁️', 'Cloudflare anycast', '৩০০+ শহরে ছড়িয়ে'], ['🧹', 'WAF + rate limit + challenge'], ['✅', 'শুধু আসল traffic → origin']] },
      2: { analogy: 'দুর্গের সামনে বিশাল দেয়াল (Cloudflare), কিন্তু পেছনের গোপন দরজার ঠিকানা (origin IP) ফাঁস হলে শত্রু দেয়াল এড়িয়ে সরাসরি সেখানে আক্রমণ করে।' },
    },
  },
  tls: {
    terms: [['Flexible SSL', 'Browser↔Cloudflare encrypted, Cloudflare↔origin খোলা — বিপজ্জনক'], ['Full (strict)', 'দুই অংশই encrypted ও cert যাচাই'], ['HSTS', 'Browser-কে বলা “সবসময় HTTPS”'], ['DNSSEC', 'DNS উত্তরে digital signature'], ['CAA', 'কোন CA certificate দিতে পারবে']],
    steps: {
      0: { analogy: 'Flexible SSL হলো এমন courier যে শহরের ভেতরে তালা দেওয়া বাক্সে চিঠি আনে, কিন্তু তোমার অফিসের গেটে এসে খাম খুলে খোলা হাতে ভেতরে নিয়ে যায়।', compare: V({ title: '✖ Flexible', color: '#f87171', items: ['🔒 Browser → Cloudflare', '🔓 Cloudflare → origin (plaintext)', 'Redirect loop-এর সমস্যাও'] }, { title: '✔ Full (strict)', color: '#4ade80', items: ['🔒 Browser → Cloudflare', '🔒 Cloudflare → origin', 'Origin cert যাচাই (Origin CA cert)'] }) },
      1: { chain: [['🌐', 'প্রথম ভিজিট', 'HTTPS'], ['📜', 'HSTS header', 'max-age=1 বছর'], ['🔒', 'পরের সব ভিজিট', 'browser নিজে https'], ['🚫', 'SSL stripping অসম্ভব']] },
    },
  },
  postgres: {
    terms: [['Role', 'PostgreSQL-এর user/group'], ['Least privilege', 'শুধু দরকারি অনুমতি'], ['GRANT', 'অনুমতি দেওয়া'], ['pg_hba.conf', 'কে কোথা থেকে কীভাবে connect করতে পারবে'], ['scram-sha-256', 'আধুনিক password authentication']],
    steps: {
      0: { analogy: 'অফিসের প্রত্যেককে পুরো ভল্টের চাবি দিলে একজনের পকেট থেকে চাবি চুরি হলেই সব শেষ। Cashier পাবে শুধু cash drawer-এর চাবি — app পাবে শুধু নিজের table-এ SELECT/INSERT/UPDATE।' },
      1: { chain: [['👑', 'postgres (superuser)', 'শুধু admin কাজে'], ['🛠', 'migrator', 'DDL'], ['⚙️', 'app_rw', 'CRUD নির্দিষ্ট table'], ['📊', 'app_ro', 'শুধু SELECT (report)']] },
      2: { compare: V({ title: '✖', color: '#f87171', items: ["listen_addresses = '*'", 'pg_hba: 0.0.0.0/0 trust', 'Port 5432 internet-এ'] }, { title: '✔', color: '#4ade80', items: ['localhost/private IP', 'hostssl … scram-sha-256', 'শুধু app server-এর IP'] }) },
    },
  },
  redis: {
    terms: [['Redis', 'RAM-এ চলা দ্রুত key-value store'], ['requirepass / ACL', 'Password ও user অনুযায়ী অনুমতি'], ['protected-mode', 'Password ছাড়া বাইরের connection বন্ধ'], ['rename-command', 'বিপজ্জনক command (CONFIG, FLUSHALL) লুকানো'], ['CONFIG SET dir', 'Attacker-এর প্রিয় কৌশল — disk-এ file লেখা']],
    steps: {
      0: { analogy: 'Redis হলো ডেস্কের উপর খোলা নোটপ্যাড — খুব দ্রুত, কিন্তু অফিসের দরজা খোলা রাখলে পথচারী এসে পাতা ছিঁড়ে নেয়, মুছে দেয়, এমনকি নিজের নির্দেশ লিখে রেখে যায় (CONFIG SET → cron/SSH key)।', chain: [['🌐', '0.0.0.0:6379', 'password নেই'], ['😈', 'CONFIG SET dir /root/.ssh'], ['📝', 'SET + SAVE', 'নিজের SSH key'], ['🖥️', 'Server-এ SSH login']] },
      1: { compare: V({ title: '✖', color: '#f87171', items: ['bind 0.0.0.0', 'Password নেই', 'Root হিসেবে চলে'] }, { title: '✔', color: '#4ade80', items: ['bind 127.0.0.1 / private', 'ACL user + লম্বা password', 'CONFIG/FLUSHALL বন্ধ, non-root'] }) },
    },
  },
  secrets: {
    terms: [['Secret', 'Password, API key, token, private key'], ['.env', 'Local config file — git-এ কখনো নয়'], ['NEXT_PUBLIC_', 'এই prefix-এর env browser-এ চলে যায়!'], ['Rotation', 'Leak হলে/নিয়মিত নতুন secret'], ['Secret manager', 'Vault, Doppler, AWS Secrets Manager']],
    steps: {
      0: { analogy: 'Secret হলো বাড়ির চাবি। Code-এ লিখে রাখা = দরজার পাশে পেরেকে চাবি ঝুলিয়ে রাখা; GitHub-এ push = সেই ছবি পত্রিকায় ছাপানো। Bot-রা প্রতি মিনিটে GitHub স্ক্যান করে।', chain: [['💻', 'Code-এ key'], ['📤', 'git push'], ['🤖', 'Bot ৫ মিনিটে পায়'], ['💸', 'Cloud বিল / data চুরি']] },
      1: { compare: V({ title: '🌐 Browser-এ যায়', color: '#f87171', items: ['NEXT_PUBLIC_*', 'Client component-এ ব্যবহৃত সব', 'শুধু public key রাখো'] }, { title: '🔒 শুধু server-এ', color: '#4ade80', items: ['Prefix ছাড়া env', 'Server component / route handler', "import 'server-only'"] }) },
      2: { chain: [['🔄', 'আগে rotate'], ['🧹', 'History থেকে মোছো'], ['🔍', 'Log দেখো — অপব্যবহার হয়েছে?'], ['🛡', 'Pre-commit scanner']] },
    },
  },
  encryption: {
    terms: [['Encoding', 'রূপ বদল, গোপনীয়তা নেই (Base64)'], ['Hashing', 'এক-মুখী, ফেরানো যায় না (SHA-256, bcrypt)'], ['Encryption', 'চাবি দিয়ে বন্ধ ও খোলা (AES)'], ['Salt', 'প্রতিটি password-এ আলাদা random মান'], ['At rest / in transit', 'Disk-এ জমা / পথে চলমান data']],
    steps: {
      0: { compare: V({ title: '🔤 Encoding vs 🔐 Encryption', items: ['Base64: যে কেউ উল্টাতে পারে', 'AES: চাবি ছাড়া অসম্ভব'] }, { title: '#️⃣ Hashing', items: ['এক দিকের রাস্তা', 'Password, integrity check', 'একই input → একই hash'] }), analogy: 'Encoding = অন্য ভাষায় লেখা (অভিধান থাকলেই পড়া যায়)। Encryption = তালাবদ্ধ বাক্স (চাবি লাগবে)। Hashing = কাগজ ব্লেন্ডারে পিষে ফেলা — আবার কাগজ বানানো যায় না, কিন্তু একই কাগজ পিষলে একই মণ্ড।' },
      1: { chain: [['🔑', 'Password'], ['🧂', '+ random salt'], ['🐢', 'bcrypt/argon2', 'ইচ্ছা করে ধীর'], ['🗄️', 'শুধু hash জমা'], ['✅', 'Login-এ আবার hash করে মেলাও']] },
    },
  },
  backup: {
    terms: [['3-2-1', '৩ কপি, ২ ধরনের মাধ্যম, ১টি অন্য জায়গায়'], ['Immutable backup', 'কেউ (ransomware-ও) মুছতে/বদলাতে পারে না'], ['RPO', 'সর্বোচ্চ কতটা data হারানো চলবে'], ['RTO', 'কত সময়ে আবার চালু'], ['Restore test', 'Backup থেকে আসলে ফেরানো যায় কি না পরীক্ষা']],
    steps: {
      0: { analogy: 'Ransomware হলো এমন চোর যে তোমার খাতা তালাবদ্ধ করে চাবির জন্য টাকা চায়। যদি অন্য জায়গায় একই খাতার ফটোকপি থাকে, তুমি হেসে বলো “রেখে দাও”।' },
      1: { chain: [['📚', '৩টি কপি'], ['💽', '২ ধরনের মাধ্যম'], ['🌍', '১টি অন্য জায়গায়'], ['🧊', '১টি immutable/offline'], ['0️⃣', '০ restore error (পরীক্ষিত)']] },
      2: { analogy: 'RPO = শেষ কবে game save করেছিলে; RTO = crash-এর পরে আবার খেলায় ফিরতে কত সময়।' },
    },
  },
  headers: {
    terms: [['CSP', 'কোন উৎসের script/style চলবে'], ['HSTS', 'সবসময় HTTPS'], ['X-Frame-Options', 'Frame-এ খোলা নিষেধ'], ['X-Content-Type-Options', 'nosniff — ধরন অনুমান নয়'], ['Referrer-Policy', 'অন্য site-এ কতটা URL তথ্য যাবে']],
    steps: {
      0: { analogy: 'Security header হলো বাড়ির দরজায় ঝোলানো নিয়মপত্র যা browser (অতিথি) মেনে চলে: “শুধু সামনের দরজা দিয়ে আসবে” (HSTS), “বাইরের লোকের আনা খাবার খাবে না” (CSP), “জানালা দিয়ে উঁকি নিষেধ” (frame-ancestors)।', chain: [['🖥️', 'Server', 'response header'], ['📜', 'নিয়মপত্র'], ['🌐', 'Browser মেনে চলে'], ['🛡', 'XSS/clickjack/sniff কমে']] },
      1: { compare: V({ title: '🟥 Header ছাড়া', items: ['Grade F (securityheaders.com)', 'Inline script injection চলে', 'Frame করা যায়'] }, { title: '🟩 Header সহ', items: ['Grade A', "CSP nonce/strict-dynamic", 'next.config.js headers() বা middleware'] }) },
    },
  },
  deps: {
    terms: [['Dependency', 'অন্যের লেখা library যা তুমি ব্যবহার করো'], ['Supply chain attack', 'Library-র মাধ্যমে আক্রমণ'], ['CVE', 'প্রকাশিত দুর্বলতার নম্বর'], ['Lockfile', 'ঠিক কোন version install হবে তা স্থির'], ['Typosquatting', 'reacct-এর মতো কাছাকাছি নামের নকল package']],
    steps: {
      0: { analogy: 'তোমার বাড়ির ১০০০টি ইটের ৯৫০টি অন্যের বানানো। কোনো এক কারখানা ভুল (বা ইচ্ছাকৃত খারাপ) ইট পাঠালে পুরো দেয়াল ঝুঁকিতে — আর তুমি জানোই না কোন ইট কোথা থেকে এসেছে।', chain: [['📦', 'তোমার app'], ['📦', 'next'], ['📦', 'sub-dependency'], ['📦', 'sub-sub…'], ['☠️', 'একটি compromised package']] },
      1: { compare: V({ title: '🟦 Node / Next.js', items: ['npm audit', 'Dependabot / Renovate', 'npm ci + lockfile'] }, { title: '🐹 Go', items: ['govulncheck ./...', 'go.sum যাচাই', 'Trivy দিয়ে container scan'] }) },
    },
  },
  scanning: {
    terms: [['Intercepting proxy', 'Browser ও server-এর মাঝে বসে request দেখা/বদলানো (Burp, ZAP)'], ['Repeater', 'একই request বদলে বারবার পাঠানো'], ['DAST', 'চলমান app-এ বাইরে থেকে পরীক্ষা'], ['SAST', 'Source code পড়ে পরীক্ষা'], ['nmap', 'Port ও service খোঁজা']],
    steps: {
      0: { analogy: 'Burp/ZAP হলো ডাকঘরের এমন একটি টেবিল যেখানে তোমার প্রতিটি চিঠি থামে — তুমি খুলে পড়তে, বদলাতে, তারপর আবার পাঠাতে পারো। Attacker ঠিক এভাবেই কাজ করে, তাই তুমিও নিজের app এভাবে দেখো।', chain: [['🌐', 'Browser'], ['🛂', 'Burp proxy :8080'], ['✏️', 'Intercept / Repeater'], ['🖥️', 'তোমার server']] },
      1: { chain: [['🗺️', 'Map (spider)'], ['🔍', 'Passive scan'], ['🎯', 'Manual test', 'IDOR, authz'], ['⚡', 'Active scan (staging)'], ['📝', 'Report']] },
    },
  },
  logs: {
    terms: [['Access log', 'প্রতিটি HTTP request-এর রেকর্ড'], ['Auth log', 'Login সফল/ব্যর্থ'], ['IOC', 'Indicator of Compromise — আক্রমণের চিহ্ন'], ['SIEM', 'সব log এক জায়গায় এনে বিশ্লেষণ ও alert'], ['fail2ban', 'Log দেখে স্বয়ংক্রিয় ban']],
    steps: {
      0: { analogy: 'Log হলো দোকানের CCTV। চুরির পরে ফুটেজ না থাকলে কে, কখন, কীভাবে — কিছুই জানা যায় না। কিন্তু ক্যামেরায় যেন কাস্টমারের PIN না ধরা পড়ে (password/token log করবে না)।' },
      1: { compare: V({ title: '🚩 সন্দেহজনক pattern', color: '#f87171', items: ['এক IP থেকে শত শত 401, তারপর 200', "URL-এ ' OR 1=1, ../, <script>", 'রাত ৩টায় admin login নতুন দেশ থেকে'] }, { title: '✅ স্বাভাবিক', color: '#4ade80', items: ['ছড়িয়ে থাকা 404 (ভুল link)', 'Static file request', 'অফিস সময়ে পরিচিত IP'] }) },
      2: { chain: [['📜', 'Nginx/App/auth log'], ['📦', 'Collector', 'Loki/ELK'], ['🔍', 'Rule', 'fail2ban/Wazuh'], ['🔔', 'Alert']] },
    },
  },
  incident: {
    terms: [['Incident', 'নিরাপত্তা লঙ্ঘন বা তার সন্দেহ'], ['Containment', 'ক্ষতি ছড়ানো থামানো'], ['Eradication', 'Attacker-এর প্রবেশপথ ও চিহ্ন মুছে ফেলা'], ['Forensics', 'প্রমাণ সংরক্ষণ ও বিশ্লেষণ'], ['Post-mortem', 'দোষারোপহীন শিক্ষা-লিখন']],
    steps: {
      0: { analogy: 'Fire drill-এর মতো: আগুন লাগার আগেই ঠিক করা থাকে কে alarm বাজাবে, কে দরজা খুলবে, কোথায় জড়ো হবে। আগুন লাগার পরে পরিকল্পনা বানাতে বসলে দেরি হয়ে যায়।', chain: [['🧰', 'Preparation'], ['🔎', 'Detection'], ['🧱', 'Containment'], ['🧹', 'Eradication'], ['♻️', 'Recovery'], ['📝', 'Lessons learned']] },
      1: { compare: V({ title: '✖ আতঙ্কের ভুল', color: '#f87171', items: ['Server সাথে সাথে মুছে ফেলা (প্রমাণ শেষ)', 'Key rotate না করে শুধু bug fix', 'চুপচাপ থাকা'] }, { title: '✔ ঠান্ডা মাথায়', color: '#4ade80', items: ['Snapshot/log সংরক্ষণ', 'আগে সব credential rotate', 'Timeline লেখো, user-দের জানাও'] }) },
    },
  },
  capstone: {
    terms: [['Security audit', 'পুরো system-এর পরিকল্পিত নিরাপত্তা পরীক্ষা'], ['Finding', 'পাওয়া একটি দুর্বলতা'], ['Severity', 'Critical/High/Medium/Low'], ['Remediation', 'সমাধানের ধাপ'], ['Retest', 'Fix-এর পরে আবার যাচাই']],
    steps: {
      0: { chain: [['🔐', 'A01 Access control'], ['🔑', 'A02 Crypto'], ['💉', 'A03 Injection'], ['📐', 'A04 Design'], ['⚙️', 'A05 Misconfig'], ['📦', 'A06 Components']], analogy: 'OWASP Top 10 হলো ডাক্তারের checklist — প্রতিটি রোগী (app)-কে এই ১০টি সাধারণ রোগের জন্য অবশ্যই পরীক্ষা করা হয়।' },
      1: { chain: [['🎯', 'Scope'], ['🔍', 'Findings', 'প্রমাণ সহ'], ['🌡️', 'Severity'], ['🛠', 'Remediation'], ['🔁', 'Retest']] },
    },
  },
};
