// Phase 03 — API & Mobile Security
export default [
  {
    id: 'massassign',
    phase: 3,
    no: '16',
    icon: '🧩',
    title: 'REST API Security ও Mass Assignment',
    subtitle: 'Body-তে "role":"admin" পাঠালেই admin?',
    duration: '৩০ মিনিট',
    goals: ['OWASP API Top 10 পরিচিতি', 'Mass assignment / BOPLA', 'Excessive data exposure', 'DTO ও response shaping'],
    steps: [
      {
        title: 'OWASP API Security Top 10 (2023)',
        body: 'API-র নিজস্ব ঝুঁকির তালিকা আছে। শীর্ষ কয়েকটি:',
        points: ['API1 — BOLA (IDOR)', 'API2 — Broken Authentication', 'API3 — BOPLA (Mass assignment + Excessive data exposure)', 'API4 — Unrestricted Resource Consumption', 'API5 — Broken Function Level Authorization', 'API7 — SSRF', 'API8 — Security Misconfiguration'],
      },
      {
        title: 'Mass Assignment — আক্রমণটা বোঝো',
        body: 'Profile update endpoint পুরো JSON body সরাসরি User struct-এ bind করে DB-তে save করে। UI শুধু name ও bio পাঠায় — কিন্তু attacker নিজে "role":"admin", "balance":999999, "is_verified":true যোগ করে পাঠায়!',
        code: [
          { label: 'দুর্বল · Express + ORM', lang: 'js', kind: 'bad', text: 'app.patch(\'/api/me\', requireLogin, async (req, res) => {\n  // req.body-তে যা আছে সব সরাসরি database-এ 😱\n  await User.update(req.body, { where: { id: req.user.id } });\n  res.sendStatus(204);\n});\n// attacker পাঠায়: { "name": "Rafi", "role": "admin", "balance": 99999 }' },
          { label: 'নিরাপদ · শুধু অনুমোদিত field (zod)', lang: 'js', kind: 'good', text: 'import { z } from \'zod\';\n\nconst UpdateProfile = z.object({\n  name: z.string().min(1).max(50),\n  bio: z.string().max(300).optional(),\n}).strict();                     // অজানা field (role, balance) এলে error\n\napp.patch(\'/api/me\', requireLogin, async (req, res) => {\n  const input = UpdateProfile.parse(req.body);\n  await User.update(input, { where: { id: req.user.id } });\n  res.sendStatus(204);\n});' },
        ],
      },
      {
        title: 'Excessive Data Exposure',
        body: 'উল্টো দিকের সমস্যা: API পুরো DB object ফেরত দেয় (password_hash, reset_token, internal_note সহ), আর frontend শুধু name দেখায়। Attacker DevTools-এ পুরো response দেখে।',
        code: [{ label: 'Response-এ শুধু দরকারি field', lang: 'js', kind: 'good', text: 'const toPublicUser = (u) => ({ id: u.id, name: u.name });\nres.json(toPublicUser(user));   // password_hash, email কখনো বাইরে নয়' }],
        tip: 'Database-এর পুরো object সরাসরি res.json() করো না — শুধু দরকারি field বেছে আলাদা object বানাও (উপরের toPublicUser-এর মতো)।',
      },
    ],
    labs: [
      {
        type: 'request',
        title: 'Mass Assignment Lab',
        intro: 'PATCH /api/me দিয়ে profile update হয়। UI শুধু name পাঠায়। Body-তে অতিরিক্ত field যোগ করে নিজের role ও balance বদলাও।',
        server: 'api.shop.local',
        secureLabel: 'DTO allowlist (name, bio)',
        presets: [
          { name: 'নাম বদলাও', req: { method: 'PATCH', path: '/api/me', headers: 'Authorization: Bearer token_rahim_u7\nContent-Type: application/json', body: '{\n  "name": "Rahim Uddin"\n}' } },
          { name: 'Profile দেখো', req: { method: 'GET', path: '/api/me', headers: 'Authorization: Bearer token_rahim_u7', body: '' } },
        ],
        handler: 'massAssignApi',
        tasks: [
          { id: 'ok', text: 'নিজের নাম update করো' },
          { id: 'leak', text: 'GET /api/me response-এ ফাঁস হওয়া sensitive field খেয়াল করো (vulnerable mode)' },
          { id: 'role', text: 'Body-তে "role":"admin" যোগ করে নিজেকে admin বানাও' },
          { id: 'fixed', text: 'Secure mode-এ একই চেষ্টা — role অপরিবর্তিত থাকবে' },
        ],
      },
    ],
    quiz: [
      { q: 'Mass assignment প্রতিরোধের উপায়?', options: ['HTTPS', 'Input DTO-তে allowlisted field', 'Rate limit', 'CORS'], answer: 1, explain: 'শুধু নির্দিষ্ট field bind করো।' },
      { q: 'Frontend শুধু name দেখায় কিন্তু API password_hash পাঠায় — এটা কী?', options: ['Excessive data exposure', 'XSS', 'CSRF', 'কোনো সমস্যা নয়'], answer: 0, explain: 'Response DTO ব্যবহার করো।' },
    ],
    cheat: {
      category: 'API Security', severity: 'high',
      summary: 'Request body সরাসরি model-এ bind করলে attacker লুকানো field (role, balance) বদলায়।',
      rules: ['Input DTO + validation', 'শুধু অনুমোদিত field (zod .strict())', 'Response DTO — DB model সরাসরি নয়', 'password_hash-এর মতো field কখনো response-এ নয়'],
      checklist: ['প্রতিটি PATCH/PUT-এ role/is_admin/balance পাঠিয়ে test', 'API response-এ password_hash/token আছে?'],
      remember: 'যা পাঠাতে বলোনি তা গ্রহণ কোরো না; যা দেখানোর দরকার নেই তা পাঠিও না।',
    },
  },

  {
    id: 'jwt',
    phase: 3,
    no: '17',
    icon: '🎫',
    title: 'JWT Attacks — গভীরে',
    subtitle: 'alg:none, weak secret, algorithm confusion',
    duration: '৪০ মিনিট',
    goals: ['alg: none attack', 'দুর্বল HMAC secret brute-force', 'RS256 → HS256 algorithm confusion', 'Node.js-এ সঠিক JWT verification'],
    steps: [
      {
        title: 'JWT verification কোথায় ভুল হয়',
        body: 'JWT নিরাপদ শুধু তখনই যখন server signature সঠিকভাবে যাচাই করে। বেশিরভাগ JWT bug আসে library ভুলভাবে ব্যবহার থেকে — token-এর header-এ লেখা alg-কে বিশ্বাস করা।',
      },
      {
        title: 'Attack 1: alg = none',
        body: 'JWT spec-এ "none" algorithm আছে (unsigned token)। পুরনো/ভুল কনফিগার করা library header-এর alg পড়ে — none দেখলে signature যাচাই-ই করে না! Attacker payload-এ role: admin বসিয়ে signature খালি রেখে পাঠায়।',
        code: [{ label: 'Forged token', lang: 'text', kind: 'bad', text: 'base64({"alg":"none","typ":"JWT"}) . base64({"sub":"7","role":"admin"}) .\n                                                                   ↑ খালি signature' }],
      },
      {
        title: 'Attack 2: দুর্বল secret',
        body: 'HS256 secret যদি "secret", "123456" বা company নাম হয় — attacker একটি সত্যিকারের token নিয়ে offline-এ hashcat দিয়ে লাখো secret প্রতি সেকেন্ডে চেষ্টা করে। Secret মিললে যেকোনো token বানাতে পারে।',
        code: [{ label: 'Offline crack (নিজের lab-এ)', lang: 'bash', text: 'hashcat -m 16500 token.txt rockyou.txt' }],
      },
      {
        title: 'Attack 3: Algorithm confusion',
        body: 'Server RS256 (public/private key) ব্যবহার করে। Attacker header-এ alg: HS256 দেয় এবং server-এর PUBLIC key (যা সবাই জানে) দিয়ে HMAC sign করে। দুর্বল code একই key variable দিয়ে HS256 verify করলে token valid হয়ে যায়!',
      },
      {
        title: 'Node.js-এ সঠিক verification',
        body: '',
        code: [{ label: 'Node.js · jsonwebtoken', lang: 'js', kind: 'good', text: 'import jwt from \'jsonwebtoken\';\n\ntry {\n  const claims = jwt.verify(raw, process.env.JWT_SECRET, {  // secret: ≥ ৩২ random byte\n    algorithms: [\'HS256\'],   // alg pin করো — token-এর header-এর কথা বিশ্বাস নয়\n    issuer: \'api.example.com\',\n    audience: \'web\',\n  });                        // exp থাকলে মেয়াদও নিজেই যাচাই করে\n  req.user = claims;\n} catch {\n  return res.sendStatus(401);\n}' }],
        points: ['Algorithm server-এ pin (WithValidMethods)', 'Secret ≥ 256-bit random: openssl rand -base64 32', 'exp, iss, aud যাচাই', 'kid header-কে path/SQL-এ ব্যবহার নয়', 'Key rotation পরিকল্পনা'],
      },
    ],
    labs: [{ type: 'jwt', title: 'JWT Attack Lab', intro: 'Server-এর token verify কনফিগারেশন বদলে তিনটি আক্রমণ চালাও: alg:none, weak secret crack, payload tamper। আসল HMAC-SHA256 (WebCrypto) ব্যবহার হচ্ছে।', mode: 'attack' }],
    quiz: [
      { q: 'alg:none attack কীভাবে আটকাবে?', options: ['Token লম্বা করো', 'Server-এ allowed algorithm pin করো', 'HTTPS', 'Base64 বাদ দাও'], answer: 1, explain: 'Header-এর alg বিশ্বাস কোরো না।' },
      { q: 'HS256 secret কেমন হওয়া উচিত?', options: ['company নাম', '≥32 byte random', '6 অক্ষর', 'Email'], answer: 1, explain: 'Offline brute-force প্রতিরোধ।' },
      { q: 'Algorithm confusion-এ attacker কোন key দিয়ে sign করে?', options: ['Server-এর private key', 'Server-এর public key (HMAC secret হিসেবে)', 'নিজের key', 'কোনো key না'], answer: 1, explain: 'RS256 public key-কে HS256 secret হিসেবে।' },
    ],
    cheat: {
      category: 'API Security', severity: 'critical',
      summary: 'JWT-এর নিরাপত্তা = সঠিক verification। Header-এর alg বিশ্বাস করলে forge সম্ভব।',
      rules: ['WithValidMethods দিয়ে alg pin', 'Secret ≥ 32 random bytes', 'exp/iss/aud যাচাই', 'Short-lived access token', 'kid sanitize'],
      checklist: ['alg:none token পাঠিয়ে test', 'Secret কি .env-এ এবং শক্তিশালী?', 'Expired token reject হয়?'],
      commands: ['openssl rand -base64 32', 'jwt_tool (নিজের lab)'],
      remember: 'Token যা বলে তা নয় — server যা যাচাই করে তা-ই সত্য।',
    },
  },

  {
    id: 'oauth',
    phase: 3,
    no: '18',
    icon: '🔁',
    title: 'OAuth 2.0 ও OIDC Security',
    subtitle: '"Login with Google"-এর ভেতরের কথা',
    duration: '৪০ মিনিট',
    goals: ['Authorization Code flow', 'PKCE কেন দরকার', 'state parameter ও CSRF', 'redirect_uri manipulation'],
    steps: [
      {
        title: 'OAuth কী সমাধান করে?',
        body: 'OAuth 2.0 একটি authorization framework — একটি app-কে user-এর হয়ে অন্য service-এ সীমিত access দেয়, password শেয়ার ছাড়াই। OIDC (OpenID Connect) এর উপর identity layer যোগ করে (id_token) — "Login with Google" আসলে OIDC।',
      },
      {
        title: 'Authorization Code Flow + PKCE',
        body: 'আধুনিক মান (SPA ও mobile সহ সবার জন্য):',
        points: ['১. App একটি random code_verifier বানায়, তার SHA-256 = code_challenge', '২. User-কে Google-এ পাঠায়: client_id, redirect_uri, scope, state, code_challenge', '৩. User login ও consent দেয়', '৪. Google redirect_uri-তে ফেরত পাঠায় ?code=…&state=…', '৫. App state মিলিয়ে দেখে, তারপর code + code_verifier দিয়ে token নেয়', '৬. Google verifier hash করে challenge-এর সাথে মেলায় → access_token + id_token'],
      },
      {
        title: 'কোথায় ভুল হয়',
        body: '',
        points: ['state নেই → Login CSRF (attacker নিজের account-এ তোমাকে login করায়)', 'PKCE নেই → code intercept হলে (malicious app, log) token নেওয়া যায়', 'redirect_uri wildcard/prefix match → code attacker-এর domain-এ যায়', 'Implicit flow (token URL fragment-এ) → deprecated', 'id_token-এর aud/iss/nonce যাচাই না করা', 'Access token-কে authentication হিসেবে ব্যবহার'],
      },
      {
        title: 'সমাধান',
        body: '',
        points: ['সবসময় Authorization Code + PKCE (S256)', 'state (CSRF) ও nonce (replay) যাচাই', 'Provider-এ redirect_uri exact match register', 'id_token signature, iss, aud, exp যাচাই', 'Token backend-এ রাখো (BFF pattern) — browser-এ নয়', 'ন্যূনতম scope চাও'],
      },
    ],
    labs: [
      {
        type: 'flow',
        title: 'OAuth Flow Simulator',
        intro: 'সঠিক PKCE flow দেখো, তারপর দেখো PKCE ছাড়া intercept হওয়া code কীভাবে ব্যবহার হয় — এবং PKCE কীভাবে আটকায়।',
        nodes: [
          { id: 'user', label: 'User', icon: '🧑', sub: 'Browser' },
          { id: 'app', label: 'তোমার App', icon: '📱', sub: 'React + Node.js' },
          { id: 'evil', label: 'Attacker', icon: '😈', sub: 'Malicious app' },
          { id: 'idp', label: 'Google', icon: '🔐', sub: 'Auth Server' },
        ],
        modes: [
          { id: 'ok', name: 'Code + PKCE (সঠিক)', kind: 'normal', hops: [
            { from: 'app', to: 'app', label: 'verifier + challenge', desc: 'App একটি গোপন random code_verifier বানায় এবং SHA-256 করে code_challenge তৈরি করে। state-ও তৈরি করে session-এ রাখে।' },
            { from: 'app', to: 'idp', label: '/authorize?challenge&state', desc: 'User-কে Google-এ redirect করে। Verifier গোপন থাকে — শুধু hash পাঠানো হয়।' },
            { from: 'user', to: 'idp', label: 'login + consent', desc: 'User Google-এ login করে, permission দেয়।' },
            { from: 'idp', to: 'app', label: '?code=xyz&state=…', desc: 'Google authorization code ফেরত দেয় redirect_uri-তে। App state মিলিয়ে দেখে (CSRF প্রতিরোধ)।' },
            { from: 'app', to: 'idp', label: 'code + verifier', desc: 'Backend code ও আসল verifier পাঠায়।' },
            { from: 'idp', to: 'app', label: 'access + id_token ✓', desc: 'Google verifier hash করে challenge মেলায় → token দেয়। App id_token-এর iss/aud/nonce যাচাই করে।' },
          ] },
          { id: 'atk', name: 'PKCE ছাড়া — code চুরি', kind: 'attack', hops: [
            { from: 'app', to: 'idp', label: '/authorize (no PKCE)', desc: 'App PKCE ব্যবহার করে না।' },
            { from: 'idp', to: 'evil', label: 'myapp://cb?code=xyz', status: 'evil', desc: 'Mobile-এ attacker-এর app একই custom scheme (myapp://) register করেছে — redirect সে ধরে ফেলল!' },
            { from: 'evil', to: 'idp', label: 'code=xyz → token?', status: 'evil', desc: 'Public client — client_secret নেই। শুধু code দিয়েই token চায়।' },
            { from: 'idp', to: 'evil', label: 'access_token 😱', status: 'evil', desc: 'Attacker user-এর account-এ access পেয়ে গেল।' },
          ] },
          { id: 'def', name: 'PKCE দিয়ে রক্ষা', kind: 'defense', hops: [
            { from: 'app', to: 'idp', label: '/authorize + challenge', desc: 'এবার PKCE আছে।' },
            { from: 'idp', to: 'evil', label: 'code=xyz (চুরি)', status: 'evil', desc: 'Attacker আবারও code ধরে ফেলল।' },
            { from: 'evil', to: 'idp', label: 'code=xyz, no verifier', status: 'evil', desc: 'কিন্তু তার কাছে code_verifier নেই — সেটা শুধু আসল app-এর memory-তে।' },
            { from: 'idp', to: 'evil', label: '400 invalid_grant', status: 'blocked', desc: 'Challenge মেলেনি → token দেওয়া হলো না। চুরি করা code অকেজো।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'PKCE কী থেকে রক্ষা করে?', options: ['Authorization code interception', 'SQLi', 'DDoS', 'XSS'], answer: 0, explain: 'Verifier ছাড়া code অকেজো।' },
      { q: 'OAuth-এ state parameter-এর কাজ?', options: ['Token encrypt', 'CSRF প্রতিরোধ', 'Scope বাড়ানো', 'Refresh'], answer: 1, explain: 'Login CSRF ঠেকায়।' },
      { q: 'redirect_uri কীভাবে মেলানো উচিত?', options: ['Prefix match', 'Wildcard', 'Exact match', 'যেকোনো'], answer: 2, explain: 'নইলে code অন্য জায়গায় যায়।' },
    ],
    cheat: {
      category: 'Authentication', severity: 'high',
      summary: 'OAuth = delegated authorization; OIDC = identity। Code + PKCE + state + exact redirect_uri।',
      rules: ['Authorization Code + PKCE (S256)', 'state ও nonce যাচাই', 'redirect_uri exact match', 'id_token iss/aud/exp/signature যাচাই', 'Implicit flow নয়', 'BFF — token backend-এ'],
      checklist: ['state ছাড়া callback কি reject হয়?', 'redirect_uri বদলে test', 'Mobile-এ App Links / Universal Links'],
      remember: 'Code চুরি হতে পারে — PKCE থাকলে সেটা মূল্যহীন।',
    },
  },

  {
    id: 'apiabuse',
    phase: 3,
    no: '19',
    icon: '🚦',
    title: 'Rate Limiting ও API Abuse',
    subtitle: 'Unrestricted Resource Consumption',
    duration: '৩০ মিনিট',
    goals: ['Token bucket ও sliding window algorithm', 'Pagination abuse (limit=1000000)', 'Business logic abuse (OTP flood, coupon)', 'App, Redis ও CDN-এ limit'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'API-কে সীমাহীন ব্যবহার করতে দিলে: scraping (পুরো product catalog), SMS/OTP flood (তোমার Twilio বিল!), সস্তা endpoint দিয়ে DB বসিয়ে দেওয়া, coupon/gift-card brute-force।',
        points: ['GET /api/products?limit=1000000 → DB ও memory শেষ', 'POST /api/otp/send ১০,০০০ বার → SMS বিল', 'GraphQL nested query → exponential load', 'বড় file/regex → CPU'],
      },
      {
        title: 'Rate limit algorithm',
        body: 'Token Bucket: বালতিতে N টোকেন, প্রতি সেকেন্ডে r টোকেন যোগ হয়, প্রতিটি request একটি টোকেন খরচ করে। খালি হলে 429। Burst allow করে কিন্তু গড় হার সীমিত রাখে। Sliding window: শেষ X সেকেন্ডে কতগুলো request — আরও নির্ভুল।',
      },
      {
        title: 'স্তরে স্তরে limit',
        body: '',
        points: ['Cloudflare Rate Limiting Rules — edge-এ, origin-এ পৌঁছানোর আগেই', 'Nginx limit_req — প্রতি IP', 'App-এর rate limiter + Redis — প্রতি user/API key/endpoint', 'Business limit — প্রতি phone number দিনে ৫টি OTP', 'Pagination: limit সর্বোচ্চ 100 clamp', 'Timeout ও body size limit'],
        code: [{ label: 'Pagination clamp', lang: 'js', kind: 'good', text: 'let limit = parseInt(req.query.limit, 10) || 20;\nif (limit < 1 || limit > 100) limit = 20;' }],
      },
    ],
    labs: [{ type: 'tokenbucket', title: 'Token Bucket Visualizer', intro: 'Bucket-এর আকার ও refill rate বদলাও, তারপর normal user ও bot-এর traffic পাঠিয়ে দেখো কে 429 পায়। লক্ষ্য: bot-কে আটকাও কিন্তু normal user যেন কখনো ব্লক না হয়।' }],
    quiz: [
      { q: 'Token bucket-এ bucket খালি হলে কী ফেরত দেবে?', options: ['200', '429 Too Many Requests', '500', '301'], answer: 1, explain: 'Retry-After header সহ।' },
      { q: '?limit=1000000 সমস্যা কীভাবে সমাধান?', options: ['Server-side max clamp', 'Frontend-এ dropdown', 'HTTPS', 'Cache'], answer: 0, explain: 'Client মান বিশ্বাস নয়।' },
    ],
    cheat: {
      category: 'API Security', severity: 'high',
      summary: 'সীমাহীন API ব্যবহার → DoS, scraping, বিল বৃদ্ধি, brute-force।',
      rules: ['Cloudflare + Nginx + App — তিন স্তরে limit', 'Redis-backed limiter (multi-instance)', 'Pagination max clamp', 'Business-level limit (OTP/phone)', 'Timeout + body limit', '429 + Retry-After'],
      checklist: ['প্রতিটি expensive endpoint-এ limit আছে?', 'limit/size parameter clamp?', 'OTP/email send endpoint limit?'],
      remember: 'প্রতিটি request-এর একটা খরচ আছে — সীমা ঠিক করো।',
    },
  },

  {
    id: 'cors',
    phase: 3,
    no: '20',
    icon: '🌍',
    title: 'CORS Misconfiguration',
    subtitle: 'কোন site তোমার API-র response পড়তে পারবে',
    duration: '২৫ মিনিট',
    goals: ['Same-Origin Policy কী', 'CORS header কীভাবে কাজ করে', 'Origin reflection + credentials-এর বিপদ', 'Express-এ সঠিক CORS'],
    steps: [
      {
        title: 'Same-Origin Policy (SOP)',
        body: 'Browser-এর মৌলিক নিরাপত্তা: evil.com-এর JavaScript bank.com-এর response পড়তে পারবে না। Origin = scheme + host + port। CORS (Cross-Origin Resource Sharing) হলো SOP-কে নিয়ন্ত্রিতভাবে শিথিল করার উপায় — server বলে "এই origin আমার response পড়তে পারবে"।',
      },
      {
        title: 'বিপজ্জনক configuration',
        body: 'সবচেয়ে খারাপ: request-এর Origin header যা-ই হোক, সেটাই Access-Control-Allow-Origin-এ ফেরত দেওয়া, সাথে Allow-Credentials: true। তখন evil.com-এর JS user-এর cookie সহ API call করে private data পড়তে পারে।',
        code: [
          { label: 'দুর্বল', lang: 'js', kind: 'bad', text: 'import cors from \'cors\';\n\napp.use(cors({\n  origin: true,          // 😱 যে origin আসে, সেটাকেই অনুমতি\n  credentials: true,\n}));' },
          { label: 'নিরাপদ', lang: 'js', kind: 'good', text: 'app.use(cors({\n  origin: [\'https://app.example.com\', \'https://admin.example.com\'],\n  credentials: true,\n  methods: [\'GET\', \'POST\', \'PATCH\', \'DELETE\'],\n}));' },
        ],
        points: ['Origin reflection + credentials = সবচেয়ে বিপজ্জনক', '"null" origin allow করা (sandboxed iframe থেকে আসে)', 'Regex ভুল: example.com.evil.com মিলে যায়', '* + credentials browser নিজেই নিষেধ করে'],
      },
      {
        title: 'মনে রাখো',
        body: 'CORS একটি browser-side নিয়ম — এটা server-কে রক্ষা করে না। curl বা Postman CORS মানে না। CORS শুধু ঠিক করে অন্য origin-এর JS response পড়তে পারবে কিনা। Authentication ও authorization এখনো দরকার।',
      },
    ],
    labs: [{ type: 'cors', title: 'CORS Playground', intro: 'Server-এর CORS config বেছে নাও, তারপর বিভিন্ন origin থেকে request পাঠাও। দেখো কোন configuration-এ evil.com তোমার user-এর private data পড়ে ফেলে।' }],
    quiz: [
      { q: 'Origin-এর অংশ কোনগুলো?', options: ['Scheme + host + port', 'শুধু host', 'Host + path', 'IP'], answer: 0, explain: 'https://a.com:443।' },
      { q: 'সবচেয়ে বিপজ্জনক CORS কোনটি?', options: ['নির্দিষ্ট origin allowlist', 'Origin reflect + Allow-Credentials: true', 'CORS নেই', 'শুধু GET allow'], answer: 1, explain: 'যেকোনো site cookie সহ data পড়ে।' },
      { q: 'CORS কি curl থেকে API রক্ষা করে?', options: ['হ্যাঁ', 'না, এটা browser নিয়ম', 'শুধু POST-এ', 'HTTPS-এ'], answer: 1, explain: 'Server-side auth লাগবেই।' },
    ],
    cheat: {
      category: 'API Security', severity: 'high',
      summary: 'CORS ঠিক করে কোন origin-এর JS তোমার API response পড়তে পারবে।',
      rules: ['Explicit origin allowlist', 'Origin reflect কখনো নয়', '"null" origin নয়', 'Credentials শুধু প্রয়োজনে', 'CORS ≠ authentication'],
      checklist: ['curl -H "Origin: https://evil.com" -I api → ACAO কী আসে?'],
      commands: ['curl -s -I -H "Origin: https://evil.com" https://api.example.com/api/me'],
      remember: 'Allow-Origin-এ যাকে নাম দাও, সে তোমার user-এর data পড়তে পারে।',
    },
  },

  {
    id: 'mobile',
    phase: 3,
    no: '21',
    icon: '📱',
    title: 'Mobile: Insecure Storage ও API Key Exposure',
    subtitle: 'APK খুললেই সব দেখা যায়',
    duration: '৩৫ মিনিট',
    goals: ['Reverse engineering কতটা সহজ', 'APK/IPA-তে hardcoded secret', 'SharedPreferences vs Keystore/Keychain', 'Mobile app-এ secure storage (Keychain/Keystore)'],
    steps: [
      {
        title: 'App binary = public document',
        body: 'তোমার APK বা IPA যে কেউ ডাউনলোড করে খুলতে পারে। jadx, apktool, strings — কয়েক মিনিটে source code, string, asset সব বের হয়। Obfuscation দেরি করায়, থামায় না। তাই: app-এর ভেতরে রাখা কোনো কিছুই গোপন নয়।',
        code: [{ label: 'Reverse engineering (নিজের app)', lang: 'bash', text: 'apktool d app-release.apk\njadx-gui app-release.apk\nstrings libapp.so | grep -i "key\\|secret\\|https://"' }],
      },
      {
        title: 'Hardcoded API Key',
        body: 'Firebase config, Google Maps key সাধারণত public হতে পারে (restriction দিয়ে)। কিন্তু Stripe secret key, AWS key, OpenAI key, admin token — কখনো app-এ নয়। এগুলো backend-এ রাখো, app backend-কে call করবে।',
        code: [
          { label: 'দুর্বল · React Native', lang: 'js', kind: 'bad', text: 'const OPENAI_KEY = \'sk-live-9f8a7…\';   // 😱 app-এর ভেতরে secret\nfetch(\'https://api.openai.com/v1/…\', {\n  headers: { Authorization: `Bearer ${OPENAI_KEY}` },\n});' },
          { label: 'নিরাপদ', lang: 'js', kind: 'good', text: '// App → তোমার নিজের backend (user login সহ)\n// Backend → OpenAI (secret থাকে শুধু server-এর env-এ)\nfetch(\'https://api.example.com/ai/ask\', {\n  headers: { Authorization: `Bearer ${userAccessToken}` },\n});' },
        ],
      },
      {
        title: 'Insecure Local Storage',
        body: 'SharedPreferences (Android) ও UserDefaults (iOS) plain text XML/plist — rooted/jailbroken device-এ বা backup থেকে পড়া যায়।',
        code: [
          { label: 'দুর্বল', lang: 'js', kind: 'bad', text: 'import AsyncStorage from \'@react-native-async-storage/async-storage\';\nawait AsyncStorage.setItem(\'refresh_token\', token);   // 😱 সাধারণ, encrypt-হীন file' },
          { label: 'নিরাপদ', lang: 'js', kind: 'good', text: 'import * as SecureStore from \'expo-secure-store\';\nawait SecureStore.setItemAsync(\'refresh_token\', token);\n// iOS Keychain / Android Keystore ব্যবহার করে' },
        ],
        points: ['Token → Keystore/Keychain', 'Log-এ (print/debugPrint) token নয়', 'android:allowBackup="false"', 'Screenshot-এ sensitive screen: FLAG_SECURE', 'Clipboard-এ OTP/password নয়'],
      },
      {
        title: 'Rooted device ও Deep link',
        body: 'Root/jailbreak detection (Play Integrity API, App Attest) ঝুঁকি কমায়, কিন্তু bypass করা যায় — তাই আসল সুরক্ষা backend-এ। Deep link (myapp://reset?token=…) যেকোনো app/website trigger করতে পারে: deep link parameter-কে untrusted input ধরো, sensitive action-এর আগে user confirmation নাও, Android App Links / iOS Universal Links (verified domain) ব্যবহার করো।',
      },
    ],
    labs: [{ type: 'mobile', title: 'APK Inspector Lab', intro: 'একটি নমুনা "ShopBD" app-এর decompiled ফাইল ও device storage ঘেঁটে দেখো। ৫টি security সমস্যা খুঁজে বের করো এবং প্রতিটি ঠিক করো।' }],
    quiz: [
      { q: 'Stripe secret key কোথায় রাখা উচিত?', options: ['App-এর code-এ const হিসেবে', 'Obfuscated string', 'Backend server env', '.env bundled in app'], answer: 2, explain: 'App-এর ভেতরের সব কিছু extract করা যায়।' },
      { q: 'Mobile app-এ refresh token কোথায় রাখবে?', options: ['AsyncStorage / SharedPreferences', 'SecureStore (Keychain/Keystore)', 'Text file', 'SQLite plain'], answer: 1, explain: 'Keystore/Keychain।' },
      { q: 'Obfuscation কী করে?', options: ['Secret সম্পূর্ণ লুকায়', 'Reverse engineering কঠিন ও ধীর করে', 'Encryption', 'কিছুই না'], answer: 1, explain: 'থামায় না।' },
    ],
    cheat: {
      category: 'Mobile Security', severity: 'high',
      summary: 'App binary public — ভেতরের সব extract করা যায়। Device storage নিরাপদ নয়।',
      rules: ['Secret key backend-এ, app-এ নয়', 'Token → Keystore/Keychain (expo-secure-store)', 'allowBackup=false', 'Release-এ log বন্ধ', 'FLAG_SECURE sensitive screen-এ', 'Deep link input validate', 'Public key-তে restriction (package/SHA)'],
      checklist: ['jadx দিয়ে নিজের APK খুলে "key" খোঁজো', 'SharedPreferences-এ কী আছে?', 'Release build-এ debug log?'],
      commands: ['jadx-gui app.apk', 'adb shell run-as com.app cat shared_prefs/*.xml (debug build)'],
      remember: 'User-এর device তোমার নিয়ন্ত্রণে নেই।',
    },
  },

  {
    id: 'pinning',
    phase: 3,
    no: '22',
    icon: '📌',
    title: 'SSL Pinning ও Secure Communication',
    subtitle: 'MITM থেকে mobile app রক্ষা',
    duration: '৩০ মিনিট',
    goals: ['MITM কীভাবে হয়', 'Certificate validation', 'SSL/Certificate pinning', 'Pinning-এর ঝুঁকি ও backup pin'],
    steps: [
      {
        title: 'Man-in-the-Middle (MITM)',
        body: 'Attacker client ও server-এর মাঝে বসে (public Wi-Fi, ARP spoofing, malicious proxy)। App যদি certificate ঠিকমতো যাচাই না করে, attacker নিজের ভুয়া certificate দিয়ে সব traffic decrypt করে পড়তে ও বদলাতে পারে।',
        code: [{ label: 'মারাত্মক ভুল · Node.js', lang: 'js', kind: 'bad', text: 'import https from \'node:https\';\n\nconst agent = new https.Agent({ rejectUnauthorized: false });  // 😱 সব certificate valid!\n// একই ভুল: process.env.NODE_TLS_REJECT_UNAUTHORIZED = \'0\'' }],
      },
      {
        title: 'Certificate Pinning',
        body: 'সাধারণ TLS: device-এর বিশ্বস্ত যেকোনো CA-এর সই করা cert গ্রহণযোগ্য। কিন্তু user (বা malware) device-এ নিজের CA install করলে MITM সম্ভব। Pinning-এ app শুধু তোমার server-এর নির্দিষ্ট public key (SPKI hash) গ্রহণ করে।',
        points: ['Public key (SPKI) pin করো, পুরো cert নয় — renew সহজ', 'সবসময় backup pin রাখো (পরের key)', 'Pin ভুল হলে app সম্পূর্ণ বন্ধ — rollout সাবধানে', 'Android: network_security_config.xml-এ pin-set', 'Pentester Frida দিয়ে pinning bypass করতে পারে — তাই এটাও defense in depth'],
        code: [{ label: 'Android network_security_config.xml', lang: 'xml', kind: 'good', text: '<domain-config cleartextTrafficPermitted="false">\n  <domain includeSubdomains="true">api.example.com</domain>\n  <pin-set expiration="2027-06-01">\n    <pin digest="SHA-256">7HIpactkIAq2Y49orFOOQKurWxmmSFZhBCoQYcRhJ3Y=</pin>\n    <pin digest="SHA-256">fwza0LRMXouZHRC8Ei+4PyuldPDcf3UKgO/04cDM1oE=</pin>\n  </pin-set>\n</domain-config>' }],
      },
    ],
    labs: [
      {
        type: 'flow',
        title: 'MITM Simulator',
        intro: 'Public Wi-Fi-তে attacker বসে আছে। তিনটি পরিস্থিতি চালিয়ে দেখো।',
        nodes: [
          { id: 'app', label: 'Mobile App', icon: '📱', sub: 'Mobile app' },
          { id: 'mitm', label: 'Attacker Proxy', icon: '🕵️', sub: 'Public Wi-Fi' },
          { id: 'api', label: 'api.example.com', icon: '⚙️', sub: 'Node.js (Express)' },
        ],
        modes: [
          { id: 'bad', name: 'Cert validation বন্ধ', kind: 'attack', hops: [
            { from: 'app', to: 'mitm', label: 'TLS Hello', status: 'evil', desc: 'App ভাবছে সে api.example.com-এ কথা বলছে, কিন্তু Wi-Fi attacker traffic নিজের দিকে ঘুরিয়েছে।' },
            { from: 'mitm', to: 'app', label: 'fake cert', status: 'evil', desc: 'Attacker নিজের self-signed certificate দেখায়।' },
            { from: 'app', to: 'mitm', label: 'badCertificateCallback → true', status: 'evil', desc: 'App সব certificate গ্রহণ করে! Encrypted tunnel তৈরি হলো attacker-এর সাথে।' },
            { from: 'mitm', to: 'api', label: 'forward + read 👀', status: 'evil', desc: 'Attacker সব request decrypt করে পড়ে (password, token), তারপর আসল server-এ পাঠায়।' },
          ] },
          { id: 'std', name: 'সাধারণ TLS validation', kind: 'defense', hops: [
            { from: 'app', to: 'mitm', label: 'TLS Hello', status: 'evil', desc: 'একই attack।' },
            { from: 'mitm', to: 'app', label: 'fake cert', status: 'evil', desc: 'Self-signed cert।' },
            { from: 'app', to: 'app', label: 'untrusted CA ✖', status: 'blocked', desc: 'Device-এর trust store-এ এই CA নেই → connection বাতিল। কিন্তু device-এ attacker-এর CA install থাকলে (corporate proxy, malware) এটা pass করত।' },
          ] },
          { id: 'pin', name: 'Certificate Pinning', kind: 'defense', hops: [
            { from: 'mitm', to: 'app', label: 'cert from installed CA', status: 'evil', desc: 'এবার attacker device-এ নিজের CA install করিয়েছে — cert "trusted" দেখায়।' },
            { from: 'app', to: 'app', label: 'SPKI hash ≠ pin ✖', status: 'blocked', desc: 'App public key-এর SHA-256 hash pin-এর সাথে মেলায় — মেলে না → connection বাতিল।' },
            { from: 'app', to: 'api', label: 'আসল server ✓', desc: 'আসল network-এ pin মেলে, নিরাপদ connection।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'Pinning-এ কী pin করা ভালো?', options: ['পুরো certificate', 'Public key (SPKI) hash + backup', 'Domain নাম', 'IP'], answer: 1, explain: 'Cert renew হলেও key একই রাখা যায়।' },
      { q: 'badCertificateCallback => true কী করে?', options: ['নিরাপত্তা বাড়ায়', 'সব certificate গ্রহণ করে — MITM সম্ভব', 'Pinning', 'কিছু না'], answer: 1, explain: 'Production-এ কখনো নয়।' },
    ],
    cheat: {
      category: 'Mobile Security', severity: 'high',
      summary: 'Certificate যাচাই না করলে MITM। Pinning = শুধু তোমার key গ্রহণ।',
      rules: ['Cert validation কখনো বন্ধ নয়', 'cleartextTrafficPermitted=false', 'SPKI pin + backup pin + expiration', 'Pin rotation পরিকল্পনা', 'Sensitive data-র জন্য HTTPS ছাড়া কিছু নয়'],
      checklist: ['mitmproxy/Burp দিয়ে নিজের app intercept হয় কিনা test', 'Release-এ debug trust anchor নেই?'],
      commands: ['openssl s_client -connect api.example.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64'],
      remember: 'Encryption অর্থহীন যদি তুমি ভুল লোকের সাথে encrypt করো।',
    },
  },
];
