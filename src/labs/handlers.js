// সিমুলেটেড backend — RequestLab-এর জন্য। সবকিছু browser-এর ভেতরে চলে, কোনো আসল network call নেই।
// প্রতিটি handler: (req, secure, state) => { status, headers, body, done: [taskIds], note }

const USERS = { token_rahim_u7: { id: 7, name: 'Rahim', role: 'user' } };

function parse(req) {
  const u = new URL('http://lab' + (req.path.startsWith('/') ? req.path : '/' + req.path));
  const headers = {};
  (req.headers || '').split('\n').forEach((l) => {
    const i = l.indexOf(':');
    if (i > 0) headers[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
  });
  const auth = headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const user = USERS[token] || null;
  let json = null;
  if (req.body && req.body.trim()) {
    try { json = JSON.parse(req.body); } catch { json = undefined; }
  }
  return { method: req.method.toUpperCase(), path: u.pathname, query: u.searchParams, rawQuery: u.search, headers, user, json };
}

const R = (status, body, extra = {}) => ({ status, body, headers: { 'Content-Type': 'application/json', ...(extra.headers || {}) }, done: extra.done || [], note: extra.note });

function normalize(p) {
  const out = [];
  p.split('/').forEach((seg) => {
    if (seg === '' || seg === '.') return;
    if (seg === '..') out.pop();
    else out.push(seg);
  });
  return '/' + out.join('/');
}

export const handlers = {
  ordersApi(req, secure, state) {
    const r = parse(req);
    state.orders ??= { 1001: { id: 1001, user_id: 7, item: 'Mechanical Keyboard', total: 4500 }, 1042: { id: 1042, user_id: 12, item: 'iPhone 15 (Karim)', total: 145000 } };
    if (!r.user) return R(401, { error: 'unauthorized' }, { done: ['401'], note: 'Token নেই → server চেনে না তুমি কে। এটা authentication failure (401)।' });
    const m = r.path.match(/^\/api\/orders\/(\d+)$/);
    if (!m) return R(404, { error: 'not found' });
    const o = state.orders[m[1]];
    if (!o) return R(404, { error: 'order not found' }, { note: 'Order আর নেই (হয়তো মুছে ফেলা হয়েছে)।' });
    const own = o.user_id === r.user.id;
    if (r.method === 'GET') {
      if (secure && !own) return R(404, { error: 'order not found' }, { note: 'Ownership check: এই order তোমার নয় → 404 (existence-ও লুকানো)।' });
      return R(200, o, { done: own ? ['ok'] : [], note: own ? 'নিজের order — ঠিক আছে।' : '⚠ অন্যের order দেখা গেল! Authorization নেই।' });
    }
    if (r.method === 'DELETE') {
      if (secure && !own) return R(403, { error: 'forbidden' }, { done: ['403'], note: '✅ Server-side check: order.user_id ≠ তোমার id → 403 Forbidden। HTTP method বদলালেও permission পাওয়া যায় না।' });
      delete state.orders[m[1]];
      return { status: 204, body: '', headers: {}, done: own ? [] : ['pwn'], note: own ? 'নিজের order মুছলে।' : '💥 অন্য user (Karim)-এর order মুছে ফেললে! Backend শুধু login চেক করেছে, ownership নয়।' };
    }
    return R(405, { error: 'method not allowed' });
  },

  adminApi(req, secure) {
    const r = parse(req);
    if (!r.user) return R(401, { error: 'unauthorized' });
    if (r.path === '/api/me') return R(200, { id: 7, name: 'Rahim', role: 'user' }, { done: ['me'] });
    if (r.path.startsWith('/api/admin')) {
      const headerRole = r.headers['x-user-role'];
      const role = secure ? r.user.role : headerRole || r.user.role;
      if (role !== 'admin') {
        return R(403, { error: 'forbidden: admin only' }, { done: secure && headerRole ? ['fixed', '403'] : ['403'], note: secure && headerRole ? '✅ Secure mode: role নেওয়া হয় server-side session থেকে — X-User-Role header উপেক্ষিত।' : 'তুমি সাধারণ user → 403।' });
      }
      return R(200, { users: [{ id: 1, email: 'ceo@shop.local', role: 'admin' }, { id: 7, email: 'rahim@mail.com', role: 'user' }, { id: 12, email: 'karim@mail.com', role: 'user' }] }, { done: ['pwn'], note: '💥 Backend client-controlled header থেকে role পড়েছে! যে কেউ admin হতে পারে।' });
    }
    return R(404, { error: 'not found' });
  },

  invoiceApi(req, secure) {
    const r = parse(req);
    if (!r.user) return R(401, { error: 'unauthorized' });
    const inv = {
      5: { id: 5, user_id: 1, name: 'CEO — Tanvir Ahmed', amount: 2500000, note: 'FLAG{b0la_1s_api_numb3r_0ne}' },
      1001: { id: 1001, user_id: 7, name: 'Rahim', amount: 4500, phone: '01711-xxxxxx' },
      1002: { id: 1002, user_id: 9, name: 'Nusrat Jahan', amount: 12900, phone: '01819-552211', address: 'মিরপুর ১০, ঢাকা' },
      1003: { id: 1003, user_id: 12, name: 'Karim', amount: 145000, phone: '01911-334455', address: 'আগ্রাবাদ, চট্টগ্রাম' },
    };
    if (r.path === '/api/me/invoices') return R(200, [inv[1001]], { done: ['own'], note: '/api/me pattern — client ID পাঠায়ই না, server session থেকে নেয়। IDOR-এর সুযোগই নেই।' });
    const m = r.path.match(/^\/api\/invoices\/(\d+)$/);
    if (!m) return R(404, { error: 'not found' });
    const i = inv[m[1]];
    if (!i) return R(404, { error: 'invoice not found' });
    const own = i.user_id === 7;
    if (secure && !own) return R(404, { error: 'invoice not found' }, { done: ['fixed'], note: '✅ WHERE id=$1 AND user_id=$2 → কোনো row নেই → 404।' });
    const done = own ? ['own'] : ['other'];
    if (i.id === 5) done.push('flag');
    return R(200, i, { done, note: own ? 'তোমার invoice।' : `💥 ${i.name}-এর invoice ফাঁস — নাম, ফোন, ঠিকানা!` });
  },

  ssrfApi(req, secure) {
    const r = parse(req);
    if (r.path !== '/api/preview') return R(404, { error: 'not found' });
    const raw = r.query.get('url') || '';
    let t;
    try { t = new URL(raw); } catch { return R(400, { error: 'invalid url' }); }
    const host = t.hostname.replace(/^\[|\]$/g, '');
    const loopbackish = /^(localhost|127\.\d+\.\d+\.\d+|127\.1|127\.0\.1|0\.0\.0\.0|0|::1|2130706433|0x7f000001|017700000001|localtest\.me)$/i.test(host);
    const meta = host === '169.254.169.254' || host === '2852039166';
    const priv = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    if (secure) {
      const allow = ['example.com', 'github.com', 'www.youtube.com', 'youtube.com'];
      if (t.protocol !== 'https:' || !allow.includes(host)) {
        const bypassTry = loopbackish && host !== 'localhost';
        return R(400, { error: 'URL not allowed' }, { done: bypassTry || meta ? ['bypass'] : [], note: bypassTry ? `✅ "${host}" ছদ্মবেশে loopback — কিন্তু allowlist-এ নেই, আর resolve-করা IP private হলেও বাতিল হতো।` : '✅ Allowlist-এ নেই → বাতিল।' });
      }
      return R(200, { title: 'Example Domain', fetched: raw }, { done: ['ok'] });
    }
    if (meta) {
      if (t.pathname.includes('security-credentials')) {
        const creds = t.pathname.endsWith('/') ? 'shop-ec2-role' : { AccessKeyId: 'ASIA5EXAMPLEKEY', SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE', Token: 'IQoJb3JpZ2luX2VjE…', Expiration: '2026-11-10T18:00:00Z' };
        return R(200, { title: '(raw)', content: creds }, { done: ['meta'], note: typeof creds === 'string' ? 'Role নাম পাওয়া গেছে। এবার URL-এর শেষে role নাম যোগ করো।' : '💥 AWS temporary credential চুরি! এখন attacker তোমার S3, RDS-এ ঢুকতে পারে।' });
      }
      return R(200, { title: '(raw)', content: 'ami-id\nhostname\niam/\ninstance-id\nlocal-ipv4\npublic-keys/' }, { note: 'Metadata service সাড়া দিয়েছে। iam/security-credentials/ দেখো।' });
    }
    if (loopbackish || priv) {
      if (t.port === '8080' && t.pathname.startsWith('/admin')) return R(200, { title: 'Internal Admin Panel', content: '<h1>ShopBD Admin</h1> Users: 18,422 · [Delete user] [Export DB] [Refund]' }, { done: ['internal'], note: '💥 Internet থেকে লুকানো admin panel — তোমার server attacker-এর হয়ে খুলে দিল।' });
      if (t.port === '6379') return R(200, { title: '(raw)', content: '-ERR wrong number of arguments\r\n+OK' }, { note: 'Internal Redis সাড়া দিয়েছে!' });
      return R(502, { error: 'connection refused' }, { note: 'Internal host, কিন্তু ওই port-এ কিছু নেই। 8080/admin চেষ্টা করো।' });
    }
    return R(200, { title: host === 'example.com' ? 'Example Domain' : `Preview of ${host}`, fetched: raw }, { done: ['ok'] });
  },

  traversalApi(req, secure) {
    const r = parse(req);
    if (r.path !== '/api/download') return R(404, { error: 'not found' });
    const rawParam = (r.rawQuery.match(/[?&]file=([^&]*)/) || [])[1] || '';
    const file = r.query.get('file') || '';
    const FS = {
      '/app/uploads/invoice-1001.pdf': '%PDF-1.7 … Invoice #1001 · Rahim · ৳4,500',
      '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndeploy:x:1000:1000::/home/deploy:/bin/bash\npostgres:x:113:120::/var/lib/postgresql:/bin/bash',
      '/app/.env': 'DATABASE_URL=postgres://app_rw:Sup3rS3cret@10.0.0.4:5432/shop\nJWT_SECRET=please-change-me\nSTRIPE_SECRET_KEY=sk_live_51Hx…',
      '/etc/shadow': null,
    };
    if (secure) {
      const base = file.split(/[\\/]/).pop();
      if (base !== file || file.includes('..')) {
        return { status: 400, body: { error: 'invalid file name' }, headers: { 'Content-Type': 'application/json' }, done: /%2e|%2f|\.\./i.test(rawParam + file) ? ['fixed'] : [], note: `✅ filepath.Base("${file}") = "${base}" ≠ input → বাতিল। Encoding decode হওয়ার পরে যাচাই হয়, তাই %2e%2e%2f-ও ধরা পড়ে।` };
      }
    }
    const full = normalize('/app/uploads/' + file);
    if (!(full in FS)) return R(404, { error: 'file not found', resolved: secure ? undefined : full }, { note: secure ? '' : `Server খুঁজেছে: ${full}` });
    if (FS[full] === null) return R(500, { error: 'permission denied' }, { note: 'App root হিসেবে চলছে না — /etc/shadow পড়তে পারল না। Least privilege কাজ করছে!' });
    const done = full === '/app/uploads/invoice-1001.pdf' ? ['ok'] : full === '/etc/passwd' ? ['passwd'] : full === '/app/.env' ? ['env'] : [];
    return { status: 200, body: FS[full], headers: { 'Content-Type': 'application/octet-stream' }, done, note: done[0] === 'ok' ? '' : `💥 Resolved path: ${full} — uploads folder থেকে বেরিয়ে গেছে!` };
  },

  redirectApi(req, secure) {
    const r = parse(req);
    if (r.path !== '/login/callback') return R(404, { error: 'not found' });
    const next = r.query.get('next') || '/dashboard';
    const external = /^([a-z]+:)?\/\//i.test(next) || next.startsWith('/\\') || /^[a-z]+:/i.test(next);
    if (secure) {
      const ok = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') && !external;
      const loc = ok ? next : '/dashboard';
      return { status: 302, headers: { Location: loc }, body: '', done: ok ? (loc === '/dashboard' ? ['ok'] : []) : ['fixed'], note: ok ? '' : `✅ "${next}" নিরাপদ relative path নয় → /dashboard-এ fallback।` };
    }
    return { status: 302, headers: { Location: next }, body: '', done: external ? ['evil'] : next === '/dashboard' ? ['ok'] : [], note: external ? '💥 Login-এর পরে user চলে গেল attacker-এর site-এ — URL শুরু হয়েছিল তোমার বিশ্বস্ত domain দিয়ে!' : '' };
  },

  massAssignApi(req, secure, state) {
    const r = parse(req);
    if (!r.user) return R(401, { error: 'unauthorized' });
    state.u ??= { id: 7, name: 'Rahim', bio: '', email: 'rahim@mail.com', role: 'user', balance: 120, is_verified: false, password_hash: '$2b$12$KIX9pQe…f3', reset_token: 'rt_8d1c5b2e', internal_note: 'chargeback risk' };
    const u = state.u;
    if (r.path !== '/api/me') return R(404, { error: 'not found' });
    if (r.method === 'GET') {
      if (secure) return R(200, { id: u.id, name: u.name, bio: u.bio, role: u.role });
      return R(200, u, { done: ['leak'], note: '⚠ Excessive data exposure: password_hash, reset_token, internal_note — frontend দেখায় না, কিন্তু response-এ আছে!' });
    }
    if (r.method === 'PATCH' || r.method === 'PUT') {
      if (r.json === undefined) return R(400, { error: 'invalid JSON' });
      const b = r.json || {};
      const done = [];
      if (secure) {
        if (typeof b.name === 'string') { u.name = b.name.slice(0, 50); done.push('ok'); }
        if (typeof b.bio === 'string') u.bio = b.bio.slice(0, 300);
        const ignored = Object.keys(b).filter((k) => !['name', 'bio'].includes(k));
        if (ignored.length) done.push('fixed');
        return R(200, { id: u.id, name: u.name, bio: u.bio, role: u.role }, { done, note: ignored.length ? `✅ DTO allowlist: ${ignored.join(', ')} উপেক্ষিত। role এখনো "${u.role}"।` : '' });
      }
      const before = u.role;
      Object.assign(u, b);
      if ('name' in b) done.push('ok');
      if (u.role === 'admin' && before !== 'admin') done.push('role');
      return R(200, u, { done, note: done.includes('role') ? '💥 Body সরাসরি model-এ bind হয়েছে — তুমি এখন admin!' : '' });
    }
    return R(405, { error: 'method not allowed' });
  },
  // System Design — API design: versioning + idempotency
  paymentsApi(req, secure, state) {
    const r = parse(req);
    state.pay ??= { list: [], keys: {}, balance: 5000 };
    const S = state.pay;
    let m;
    if (r.method === 'GET' && (m = r.path.match(/^\/api\/(v1|v2)\/products\/(\d+)$/))) {
      if (m[2] !== '1') return R(404, { error: 'product not found' });
      if (m[1] === 'v1') return R(200, { id: 1, name: 'Mechanical Keyboard', price: 4500 }, { done: ['v1'], note: 'v1: price একটি সংখ্যা। পুরনো mobile app এটাই বোঝে।' });
      return R(200, { id: 1, name: 'Mechanical Keyboard', price: { amount: 4500, currency: 'BDT' } }, { done: ['v2'], note: 'v2: price এখন object। Breaking change — তাই নতুন version (/v2), যাতে পুরনো app না ভাঙে।' });
    }
    if (r.method === 'GET' && r.path === '/api/v1/payments') return R(200, { balance: S.balance, payments: S.list });
    if (r.method === 'POST' && r.path === '/api/v1/payments') {
      if (!r.json || !r.json.amount) return R(400, { error: 'amount required' });
      const key = r.headers['idempotency-key'];
      if (secure && !key) return R(400, { error: 'Idempotency-Key header required' }, { note: 'Secure mode: প্রতিটি payment request-এ একটি unique key দিতে হবে (যেমন UUID)।' });
      if (secure && S.keys[key]) return R(200, S.keys[key], { headers: { 'Idempotent-Replayed': 'true' }, done: ['idem'], note: '✅ একই Idempotency-Key → server আগের ফলাফলই ফেরত দিল, দ্বিতীয়বার টাকা কাটেনি!' });
      const p = { id: 'pay_' + (S.list.length + 1), amount: r.json.amount, status: 'captured' };
      S.list.push(p);
      S.balance -= r.json.amount;
      if (key) S.keys[key] = p;
      const dup = S.list.filter((x) => x.amount === p.amount).length > 1;
      return R(201, { ...p, balance_left: S.balance }, { done: dup && !secure ? ['dup', 'created'] : ['created'], note: dup && !secure ? '💥 Network timeout-এর পরে app retry করল → একই payment দুইবার! ব্যালান্স দেখো।' : '201 Created — নতুন resource তৈরি হলো।' });
    }
    return R(404, { error: 'not found' });
  },
};
