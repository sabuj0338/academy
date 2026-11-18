// Cloud ও DevOps কোর্স — Lesson 05–08 (Compose, CI/CD, Terraform, Cloud networking)
const ask = (q, options, answer, why) => ({ q, options, answer, why });

export default [
  // ─────────────────────────────── 05 · Docker Compose
  {
    id: 'cd-compose',
    phase: 5,
    no: '05',
    icon: '🧩',
    title: 'Docker Compose — পুরো app এক command-এ',
    subtitle: 'Website, API, database, cache — অনেক container একসাথে জোড়া লাগানো',
    duration: '৪৫–৫৫ মিনিট',
    simple: 'আসল app মানে শুধু একটা container নয় — website, API, database, cache সব একসাথে। Compose হলো একটা তালিকা (YAML ফাইল): “এই চারটা container লাগবে, এভাবে জোড়া লাগাও।” তারপর এক command — docker compose up — আর পুরো app চালু।',
    goals: ['Multi-container app কেন আর কীভাবে', 'compose.yaml-এর গঠন: service, image, ports, volumes, environment', 'Service-গুলো নাম ধরে একে অপরকে কীভাবে খোঁজে', 'Healthcheck, restart আর dev বনাম production'],
    terms: [
      ['Service', 'Compose-এর ভেতরে একটা container-এর বর্ণনা (api, db, cache)'],
      ['compose.yaml', 'পুরো app-এর সব container-এর তালিকা ও setting'],
      ['Network', 'Compose-এর বানানো private network — service-গুলো নাম ধরে কথা বলে'],
      ['depends_on', 'কোন service আগে চালু হবে'],
      ['Healthcheck', 'Container সত্যিই কাজ করার মতো প্রস্তুত কিনা তার পরীক্ষা'],
      ['Restart policy', 'Crash করলে container নিজে আবার চালু হবে কিনা'],
    ],
    steps: [
      {
        title: 'একটা আসল app-এর টুকরোগুলো',
        body: 'একটা সাধারণ online দোকানে চারটা অংশ: সামনে nginx (web server), পেছনে Node.js API, data রাখার PostgreSQL, আর দ্রুত উত্তরের জন্য Redis cache। চারটা আলাদা `docker run` command মনে রাখা, network বানানো, কোনটা আগে চালু হবে খেয়াল রাখা — ঝামেলা আর ভুলের উৎস। Compose এগুলো একটা ফাইলে লিখে রাখে, যা Git-এ থাকে আর সবাই একইভাবে চালায়।',
        chain: [['🌐', 'Browser'], ['🧭', 'nginx', 'port 80'], ['⚙️', 'api', 'Node.js :3000'], ['🗄️', 'db', 'PostgreSQL'], ['⚡', 'cache', 'Redis']],
        analogy: 'Compose হলো বিয়ে বাড়ির পরিকল্পনার খাতা: “ডেকোরেটর ৪টায়, বাবুর্চি ৫টায় — গ্যাস আসার পরে, সাউন্ড সিস্টেম ৬টায়।” খাতা দেখে যে কেউ পুরো অনুষ্ঠান সাজাতে পারে, কাউকে আলাদা করে ফোন করতে হয় না।',
      },
      {
        title: 'compose.yaml পড়া',
        body: '`services`-এর নিচে প্রতিটা container একটা নাম পায় (api, db, cache)। প্রতিটার জন্য বলে দাও কোন image (বা `build: .` দিয়ে নিজের Dockerfile), কোন port বাইরে খুলবে, কোন environment variable লাগবে, কোন volume জুড়বে। YAML-এ indentation (ফাঁকা জায়গা) দিয়েই গঠন বোঝানো হয় — tab নয়, space।',
        code: [{ label: 'compose.yaml', lang: 'yaml', text: `services:
  api:
    build: .                       # এই folder-এর Dockerfile থেকে
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:\${DB_PASSWORD}@db:5432/shop
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: \${DB_PASSWORD}   # .env ফাইল থেকে আসে
      POSTGRES_DB: shop
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "app"]
      interval: 5s

  cache:
    image: redis:7

volumes:
  pgdata:` }],
        tip: '${DB_PASSWORD} লিখলে Compose পাশের `.env` ফাইল থেকে মান নেয়। .env থাকে .gitignore-এ — compose.yaml Git-এ যায়, password যায় না।',
      },
      {
        title: 'নাম ধরে খোঁজা — Compose-এর নিজস্ব network',
        body: 'Compose সব service-কে একটা private network-এ রাখে, আর প্রতিটা service-এর নাম সেখানে একটা ঠিকানা হিসেবে কাজ করে। তাই api-র connection string-এ শুধু `db:5432` লিখলেই PostgreSQL পাওয়া যায় — IP মনে রাখার দরকার নেই। আর db-র port বাইরে (ports:) খোলার দরকারই নেই; ভেতরের service-রা এমনিতেই পায়।',
        seq: {
          title: 'api থেকে database খোঁজা',
          actors: [['⚙️', 'api'], ['📒', 'Docker DNS'], ['🗄️', 'db']],
          msgs: [
            [0, 1, 'db কোথায়?', 'api-র connection string-এ শুধু “db” লেখা।'],
            [1, 0, '172.18.0.3', 'Compose নিজে নাম থেকে ভেতরের IP বলে দেয়।', 'good'],
            [0, 2, 'connect :5432', 'Private network-এর ভেতরে, বাইরের কেউ দেখতে পায় না।'],
            [2, 0, '✓ connected', 'বাইরের internet থেকে db-তে পৌঁছানোর কোনো পথ নেই — কারণ ports: দিয়ে খোলা হয়নি।', 'good'],
          ],
        },
        ask: ask('api container-এর ভেতর থেকে database-এ যেতে কোন host নাম লিখবে?', ['db', 'localhost', 'তোমার laptop-এর IP'], 0, 'Container-এর ভেতরে localhost মানে সেই container নিজেই — database সেখানে নেই। Compose-এ service-এর নামই ঠিকানা।'),
      },
      {
        title: 'চালানো, দেখা, থামানো',
        body: 'সব কিছু `docker compose` দিয়ে শুরু। একটা command-এ পুরো app চালু, একটায় সব log, একটায় সব বন্ধ। Volume আলাদাভাবে থাকে — `down` দিলেও data থাকে, যদি না -v দাও।',
        code: [{ label: 'প্রতিদিনের Compose', lang: 'bash', text: `docker compose up -d          # সব service পেছনে চালু
docker compose ps             # কে কেমন আছে
docker compose logs -f api    # api-র log লাইভ দেখো
docker compose exec db psql -U app shop   # db-র ভেতরে ঢোকো
docker compose up -d --build  # code বদলেছে — নতুন image বানিয়ে চালু
docker compose down           # সব থামাও (volume থাকে)
docker compose down -v        # ⚠ volume সহ — data মুছে যাবে` }],
        warn: '`docker compose down -v` টাইপ করার আগে দুবার ভাবো — -v মানে database-এর data সহ সব মুছে ফেলো।',
      },
      {
        title: 'Healthcheck, depends_on ও restart',
        body: '`depends_on` শুধু বলে “আগে db চালু করো” — কিন্তু PostgreSQL চালু হওয়া আর connection নেওয়ার জন্য প্রস্তুত হওয়ার মাঝে কয়েক সেকেন্ড লাগে। তাই healthcheck দিয়ে সত্যিকারের প্রস্তুতি যাচাই করো, আর api-কে বলো `condition: service_healthy`। `restart: unless-stopped` দিলে কোনো container crash করলে Docker নিজেই আবার চালু করে।',
        layers: {
          title: 'তিনটা পাহারাদার',
          items: [
            ['🩺', 'healthcheck', 'প্রতি ৫ সেকেন্ডে জিজ্ঞেস করে “তুমি কি সত্যিই কাজ করছ?” — যেমন pg_isready বা /health endpoint'],
            ['⏳', 'depends_on + service_healthy', 'db সুস্থ না হওয়া পর্যন্ত api শুরুই হয় না — প্রথম request-এ error আসে না'],
            ['🔁', 'restart: unless-stopped', 'Crash বা server restart হলে নিজে থেকে আবার চালু — রাত ৩টায় তোমাকে উঠতে হয় না'],
          ],
        },
      },
      {
        title: 'Dev বনাম production',
        body: 'একই compose.yaml দুই কাজে লাগে, কিন্তু setting আলাদা হওয়া উচিত। Development-এ code সরাসরি container-এ mount করো যাতে save করলেই reload হয়। Production-এ সব কিছু image থেকে, শুধু দরকারি port খোলা, secret বাইরে থেকে। Compose চলে একটা machine-এ — অনেক server জুড়ে চালাতে হলে Kubernetes (Lesson ৯)।',
        compare: [
          { title: '🛠️ Development', color: '#38bdf8', items: ['Code volume হিসেবে mount — save করলেই reload', 'Database-এর port খোলা (GUI tool-এর জন্য)', 'সহজ test password', 'Debug log চালু'] },
          { title: '🚀 Production', color: '#22c55e', items: ['শুধু image — mount নয়', 'শুধু nginx-এর 80/443 বাইরে', 'Secret .env বা secret manager থেকে', 'restart, healthcheck, resource limit'] },
        ],
        tip: 'compose.override.yaml ফাইল Compose নিজে থেকে পড়ে নেয় — dev-এর বাড়তি setting সেখানে রাখো, মূল ফাইল production-বান্ধব থাকে।',
      },
    ],
    labs: [
      {
        type: 'map',
        title: 'Compose network — ভেতরে কে কাকে দেখে?',
        intro: 'একটা compose app-এর চারটা service আর বাইরের দুনিয়া। স্বাভাবিক request, database restart, বাইরে থেকে সরাসরি database-এ ঢোকার চেষ্টা, আর healthcheck না থাকলে কী হয় — চারটা mode দেখো।',
        height: 340,
        zones: [{ x: 26, y: 6, w: 72, h: 88, label: 'Compose network (private)', color: '#38bdf8' }],
        nodes: [
          { id: 'user', x: 8, y: 30, icon: '🧑', label: 'User', sub: 'browser' },
          { id: 'hacker', x: 8, y: 75, icon: '😈', label: 'Internet scanner' },
          { id: 'web', x: 38, y: 30, icon: '🧭', label: 'nginx', sub: ':80 খোলা' },
          { id: 'api', x: 60, y: 30, icon: '⚙️', label: 'api', sub: 'Node.js :3000' },
          { id: 'db', x: 84, y: 30, icon: '🗄️', label: 'db', sub: 'PostgreSQL' },
          { id: 'cache', x: 60, y: 75, icon: '⚡', label: 'cache', sub: 'Redis' },
          { id: 'vol', x: 84, y: 75, icon: '💾', label: 'pgdata', sub: 'volume' },
        ],
        edges: [['user', 'web'], ['web', 'api'], ['api', 'db'], ['api', 'cache'], ['db', 'vol'], ['hacker', 'web']],
        modes: [
          { id: 'normal', name: 'স্বাভাবিক request', hops: [
            { path: ['user', 'web'], label: 'GET /products', desc: 'User শুধু nginx-কেই দেখতে পায় — একমাত্র খোলা port।' },
            { path: ['web', 'api'], label: 'proxy → api:3000', desc: 'nginx নাম ধরে api-কে পাঠায় — Compose-এর DNS।' },
            { path: ['api', 'cache'], label: 'cache miss', desc: 'Redis-এ নেই…' },
            { path: ['api', 'db'], label: 'SELECT …', desc: '…তাই db:5432 থেকে আনা হলো, আর cache-এ রাখা হলো।' },
            { path: ['api', 'web', 'user'], label: '200 OK', status: 'ok', desc: 'পুরো যাত্রা private network-এর ভেতরে।' },
          ] },
          { id: 'restart', name: 'db restart, data অক্ষত', hops: [
            { path: ['api', 'db'], label: 'db crash 💥', status: 'blocked', down: ['db'], desc: 'Database container হঠাৎ বন্ধ হয়ে গেল।' },
            { path: ['db', 'vol'], label: 'restart → volume জুড়ল', status: 'ok', desc: 'restart: unless-stopped — নতুন container চালু হয়ে একই pgdata volume নিল।' },
            { path: ['api', 'db'], label: 'আবার connected', status: 'ok', desc: 'সব order, সব user ঠিক আছে — কারণ data container-এ নয়, volume-এ ছিল।' },
          ] },
          { id: 'attack', name: 'বাইরে থেকে db-তে ঢোকার চেষ্টা', kind: 'attack', hops: [
            { path: ['hacker', 'web'], label: 'scan: 5432 খোলা?', status: 'blocked', desc: 'db-র port ports: দিয়ে বাইরে খোলা হয়নি — বাইরে থেকে শুধু 80 দেখা যায়।' },
            { path: ['hacker', 'web', 'api'], label: 'শুধু nginx পর্যন্ত', status: 'blocked', desc: 'Database ছোঁয়ার কোনো পথ নেই। শিক্ষা: যা বাইরে লাগে না, তা খুলবে না।' },
          ] },
          { id: 'nohealth', name: 'Healthcheck ছাড়া', kind: 'fail', hops: [
            { path: ['api', 'db'], label: 'connect… ECONNREFUSED', status: 'blocked', desc: 'db container চালু, কিন্তু PostgreSQL এখনো প্রস্তুত নয় — api শুরুতেই crash।' },
            { path: ['api', 'db'], label: 'service_healthy-এর অপেক্ষা', status: 'ok', desc: 'Healthcheck যোগ করার পর api অপেক্ষা করে, db প্রস্তুত হলে তবেই শুরু।' },
          ] },
        ],
      },
      {
        type: 'audit',
        preset: 'compose',
        title: 'compose.yaml review — production-এ যাওয়ার আগে',
        intro: 'একটা compose.yaml production server-এ চালানোর আগে review করো। সমস্যার প্রতিটা লাইনে ক্লিক করো — কেন বিপদ, আর কীভাবে ঠিক করবে।',
      },
    ],
    quiz: [
      { q: 'docker compose up -d কী করে?', options: ['compose.yaml-এর সব service পেছনে চালু করে', 'শুধু একটা container চালায়', 'Image মুছে দেয়', 'GitHub-এ push করে'], answer: 0, explain: 'এক command-এ পুরো app।' },
      { q: 'Compose-এ api থেকে database-এর ঠিকানা কী?', options: ['Service-এর নাম — db', 'localhost', 'Google-এর IP', 'Database-এর password'], answer: 0, explain: 'Compose network-এ নামই ঠিকানা।' },
      { q: 'depends_on-এর সাথে healthcheck কেন দরকার?', options: ['Container চালু মানেই database প্রস্তুত নয়', 'Image ছোট করতে', 'Port খুলতে', 'কোনো দরকার নেই'], answer: 0, explain: 'service_healthy দিলে সত্যিকারের প্রস্তুতির অপেক্ষা করে।' },
      { q: 'Production-এ database-এর port (5432) বাইরে খোলা উচিত?', options: ['না — শুধু ভেতরের service-দের দরকার', 'হ্যাঁ, সবসময়', 'হ্যাঁ, রাতে', 'শুধু weekend-এ'], answer: 0, explain: 'যা বাইরে লাগে না, তা খুলবে না।' },
      { q: 'docker compose down -v কী করে?', options: ['Container থামায় আর volume-ও মুছে দেয়', 'শুধু log মোছে', 'নতুন version আনে', 'কিছুই না'], answer: 0, explain: '-v = volume সহ — database-এর data চলে যায়।' },
    ],
    cheat: {
      category: 'Docker Compose',
      severity: 'core',
      summary: 'এক compose.yaml-এ পুরো app। Service-এর নামই ঠিকানা, database বাইরে খোলা নয়, data volume-এ, password .env থেকে, healthcheck + restart দিয়ে নিজে সামলায়।',
      rules: ['Database ও cache-এর port বাইরে খুলবে না', 'Password ${VAR} দিয়ে .env থেকে', 'Database-এ volume ও healthcheck', 'restart: unless-stopped', 'Image-এ নির্দিষ্ট tag'],
      checklist: ['ports: শুধু যা বাইরে লাগে?', '.env কি .gitignore-এ?', 'db-তে named volume?', 'api depends_on service_healthy?'],
      commands: ['docker compose up -d --build', 'docker compose ps', 'docker compose logs -f api', 'docker compose exec db psql -U app'],
      remember: 'Compose ফাইলটাই app-এর মানচিত্র — যে পড়বে, সে-ই চালাতে পারবে।',
    },
    related: ['docker', 'sd-architecture'],
  },

  // ─────────────────────────────── 06 · CI/CD
  {
    id: 'cd-cicd',
    phase: 6,
    no: '06',
    icon: '🔁',
    title: 'CI/CD — GitHub Actions দিয়ে automatic test ও deploy',
    subtitle: 'Push করলেই test, সবুজ হলেই deploy — হাতের ভুল ছাড়া',
    duration: '৫০–৬০ মিনিট',
    simple: 'CI/CD হলো একটা অক্লান্ত রোবট সহকারী। তুমি code push করলেই সে test চালায়, কিছু ভাঙলে সাথে সাথে জানায়, আর সব ঠিক থাকলে নিজেই website-এ নতুন version তুলে দেয় — রাত ৩টায়ও, কোনো ভুল ছাড়া।',
    goals: ['CI আর CD-র পার্থক্য', 'GitHub Actions workflow ফাইল পড়া ও লেখা', 'Secret নিরাপদে ব্যবহার', 'Pipeline ভাঙলে কী করবে, আর নিরাপদে deploy'],
    terms: [
      ['CI (Continuous Integration)', 'প্রতিটা push-এ নিজে থেকে build ও test'],
      ['CD (Continuous Delivery/Deployment)', 'Test পাস হলে নিজে থেকে deploy'],
      ['Pipeline', 'Code থেকে production পর্যন্ত ধাপের সারি'],
      ['Workflow', 'GitHub Actions-এর একটা YAML ফাইল — .github/workflows/'],
      ['Job', 'Workflow-এর একটা কাজ (test, build, deploy)'],
      ['Runner', 'যে machine-এ job চলে — প্রতিবার নতুন, পরিষ্কার VM'],
      ['Secret', 'Token বা password — repo-র setting-এ লুকিয়ে রাখা'],
    ],
    steps: [
      {
        title: 'হাতে deploy-এর বিপদ',
        body: 'হাতে deploy মানে: test চালাতে ভুলে যাওয়া, ভুল branch থেকে build, server-এ ঢুকে command টাইপে typo, আর “শুক্রবার বিকেলে deploy করে সপ্তাহান্ত নষ্ট”। প্রতিবার একই ধাপ মানুষ করলে কোনো না কোনোদিন ভুল হবেই। CI/CD সেই ধাপগুলো code-এ লিখে রাখে — প্রতিবার ঠিক একইভাবে চলে।',
        analogy: 'কারখানার assembly line-এর শেষে একজন quality inspector থাকে: প্রতিটা জিনিস পরীক্ষা না করে বাক্সে ওঠে না। CI সেই inspector, আর CD হলো conveyor belt যা পাস করা জিনিস সরাসরি দোকানে পৌঁছে দেয়।',
        compare: [
          { title: '🧑‍🔧 হাতে deploy', items: ['Test চালানো মনে থাকলে', 'প্রতিবার একটু আলাদা ধাপ', 'কে কী deploy করল অজানা', 'ভয়ে কদাচিৎ, বড় বড় release'] },
          { title: '🤖 CI/CD', items: ['প্রতিটা push-এ test', 'প্রতিবার হুবহু একই ধাপ', 'প্রতিটা deploy-এর log ও commit', 'ছোট, ঘন ঘন, নিরাপদ release'] },
        ],
      },
      {
        title: 'CI ও CD — দুই অংশ',
        body: 'Continuous Integration: প্রতিটা push আর pull request-এ code build হয়, lint আর test চলে — দলের সবার কাজ দিনে কয়েকবার main-এ মেশে, ভাঙলে সাথে সাথে ধরা পড়ে। Continuous Delivery: main সবসময় deploy-যোগ্য, এক click-এ production। Continuous Deployment: সেই click-ও লাগে না — সবুজ হলেই production।',
        chain: [['💻', 'git push'], ['🧹', 'Lint', 'ESLint'], ['🧪', 'Test', 'npm test'], ['📦', 'Build', 'Docker image'], ['🧫', 'Staging'], ['🚀', 'Production']],
      },
      {
        title: 'একটা workflow ফাইল পড়া',
        body: 'GitHub Actions-এর workflow থাকে repo-র `.github/workflows/` folder-এ, YAML-এ লেখা। একবার লিখে push করলেই GitHub নিজে থেকে চালাতে শুরু করে — আলাদা server বসাতে হয় না।',
        code: [{ label: '.github/workflows/ci.yml', lang: 'yaml', text: `name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test` }],
        layers: {
          title: 'Workflow-এর স্তরগুলো (উপর থেকে নিচে)',
          items: [
            ['⚡', 'on — কখন চলবে', 'push, pull_request, schedule (যেমন প্রতি রাতে), বা হাতে চালানো (workflow_dispatch)।'],
            ['🧱', 'jobs — কী কী কাজ', 'test, build, deploy — আলাদা job একসাথে চলতে পারে; needs দিয়ে ক্রম ঠিক হয়।'],
            ['🖥️', 'runs-on — কোথায়', 'GitHub-এর দেওয়া একটা ফাঁকা VM (runner) — প্রতিবার নতুন, পরিষ্কার।'],
            ['🪜', 'steps — ধাপগুলো', 'উপর থেকে নিচে চলে; একটা ব্যর্থ হলে পরেরগুলো বাদ।'],
            ['🧩', 'uses বনাম run', 'uses = অন্যের বানানো তৈরি action; run = নিজের shell command।'],
          ],
        },
      },
      {
        title: 'Secret — password কোথায় রাখবে',
        body: 'Deploy করতে token বা password লাগে — সেগুলো কখনো YAML-এ লিখবে না (repo-তে থাকলে সবাই দেখে)। Repo-র Settings → Secrets and variables → Actions-এ রাখো, আর workflow-এ `${{ secrets.NAME }}` দিয়ে ডাকো। GitHub log-এ secret-এর মান নিজে থেকেই *** দিয়ে ঢেকে দেয়।',
        code: [{ label: 'test পাস হলে তবেই deploy', lang: 'yaml', text: `  deploy:
    needs: test                     # test সবুজ হলে তবেই
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production         # চাইলে কারো approval চাওয়া যায়
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
        env:
          DEPLOY_TOKEN: \${{ secrets.DEPLOY_TOKEN }}` }],
        warn: 'Fork থেকে আসা pull request-এ GitHub secret দেয় না — নইলে অচেনা কেউ workflow বদলে তোমার secret চুরি করতে পারত। এই নিরাপত্তা নিয়ম বন্ধ করার চেষ্টা কোরো না।',
      },
      {
        title: 'Pipeline ভাঙলে কী করবে',
        body: 'লাল ✗ মানে দরজা বন্ধ — ভাঙা code main বা production-এ ঢুকবে না। এটা শাস্তি নয়, সুরক্ষা। কোন step লাল দেখো, তার log পড়ো, একই command নিজের laptop-এ চালিয়ে ভুলটা দেখো, ঠিক করে আবার push করো।',
        seq: {
          title: 'একটা ব্যর্থ test-এর গল্প',
          actors: [['👩‍💻', 'Developer'], ['🤖', 'GitHub Actions'], ['🚀', 'Production']],
          msgs: [
            [0, 1, 'push: নতুন discount feature', 'নতুন commit main-এর দিকে।'],
            [1, 1, 'npm test → 1 failed ✗', 'cart খালি থাকলে total ভুল আসছে।', 'bad'],
            [1, 0, '❌ লাল চিহ্ন + email', 'Deploy job চলেইনি — production নিরাপদ।', 'good'],
            [0, 0, 'npm test (নিজের laptop-এ)', 'একই ভুল দেখা গেল, ঠিক করা হলো।'],
            [0, 1, 'push: fix', 'নতুন commit।'],
            [1, 2, '✓ test পাস → deploy', 'এবার সব সবুজ — নতুন version production-এ।', 'good'],
          ],
        },
        ask: ask('Test ব্যর্থ হলে সবচেয়ে খারাপ “সমাধান” কোনটা?', ['Test-টা মুছে দিয়ে আবার push', 'Log পড়ে ভুল খুঁজে ঠিক করা', 'নিজের laptop-এ test চালিয়ে দেখা'], 0, 'Test মুছলে লাল চিহ্ন যায়, কিন্তু bug থেকেই যায় — সোজা user-এর কাছে।'),
      },
      {
        title: 'নিরাপদ deploy — staging, rollback, ছোট release',
        body: 'Deploy নিরাপদ করার কয়েকটা সহজ অভ্যাস আছে। লক্ষ্য একটাই: কিছু ভুল হলে যেন কয়েক user, কয়েক মিনিটের মধ্যে সীমিত থাকে, আর ফেরা যায় এক command-এ।',
        points: [
          '🧫 Staging: production-এর ছোট copy — আগে সেখানে deploy করে দেখো',
          '🏷️ Image-এর tag = commit-এর নাম: কোন code চলছে সবসময় জানা থাকে',
          '↩️ Rollback: আগের image-এ ফেরা এক command বা এক click-এ',
          '🐣 ছোট release: দিনে কয়েকটা ছোট deploy, মাসে একটা বিশাল deploy-এর চেয়ে নিরাপদ',
          '✋ Environment approval: production-এর আগে একজন মানুষের সম্মতি',
        ],
        tip: 'প্রশ্ন করো: “এই deploy খারাপ হলে আমি কত দ্রুত আগের অবস্থায় ফিরতে পারব?” উত্তর ৫ মিনিটের বেশি হলে আগে rollback-এর ব্যবস্থা করো।',
      },
    ],
    labs: [
      {
        type: 'map',
        title: 'GitHub Actions pipeline',
        intro: 'একটা commit-এর production পর্যন্ত যাত্রা — সব ঠিক থাকলে, lint ব্যর্থ হলে, আর খারাপ release-এর পর rollback। তিনটা mode দেখো।',
        height: 330,
        nodes: [
          { id: 'dev', x: 6, y: 50, icon: '👩‍💻', label: 'Developer' },
          { id: 'gh', x: 20, y: 50, icon: '🐙', label: 'GitHub', sub: 'push' },
          { id: 'lint', x: 34, y: 22, icon: '🧹', label: 'Lint' },
          { id: 'test', x: 34, y: 78, icon: '🧪', label: 'Test' },
          { id: 'build', x: 50, y: 50, icon: '📦', label: 'Build image', sub: 'tag = commit' },
          { id: 'reg', x: 64, y: 50, icon: '🗄️', label: 'Registry' },
          { id: 'stg', x: 78, y: 22, icon: '🧫', label: 'Staging' },
          { id: 'prod', x: 93, y: 50, icon: '🚀', label: 'Production' },
        ],
        edges: [['dev', 'gh'], ['gh', 'lint'], ['gh', 'test'], ['lint', 'build'], ['test', 'build'], ['build', 'reg'], ['reg', 'stg'], ['stg', 'prod'], ['reg', 'prod']],
        modes: [
          { id: 'happy', name: 'সব সবুজ', hops: [
            { path: ['dev', 'gh'], label: 'git push', desc: 'main-এ নতুন commit — workflow নিজে চালু।' },
            { paths: [['gh', 'lint'], ['gh', 'test']], label: 'lint + test', desc: 'দুটো job একসাথে চলে — সময় বাঁচে।' },
            { paths: [['lint', 'build'], ['test', 'build']], label: '✓ ✓ build', status: 'ok', desc: 'দুটোই সবুজ হলে তবেই Docker image বানানো।' },
            { path: ['build', 'reg', 'stg'], label: 'push + staging', desc: 'Image registry-তে, তারপর staging-এ deploy ও smoke test।' },
            { path: ['stg', 'prod'], label: 'approve → production', status: 'ok', desc: 'একজন approve করল — production-এ rolling deploy।' },
          ] },
          { id: 'lintfail', name: 'Lint ব্যর্থ', kind: 'fail', hops: [
            { path: ['dev', 'gh'], label: 'git push', desc: 'তাড়াহুড়োয় একটা অব্যবহৃত variable থেকে গেছে।' },
            { path: ['gh', 'lint'], label: '✗ ESLint error', status: 'blocked', desc: 'Lint job লাল।' },
            { path: ['lint', 'build'], label: 'build বাতিল', status: 'blocked', desc: 'needs: lint — তাই build, deploy কিছুই চলল না। Production-এ কিছুই বদলায়নি।' },
          ] },
          { id: 'rollback', name: 'খারাপ release → rollback', kind: 'fail', hops: [
            { path: ['reg', 'prod'], label: 'v1.6 deploy', desc: 'Test পাস করেছিল, কিন্তু production-এ নতুন checkout-এ error বাড়ছে।' },
            { path: ['reg', 'prod'], label: 'error 9% ⚠', status: 'evil', desc: 'Monitoring alert দিল — নতুন version-এ checkout ভাঙছে।' },
            { path: ['reg', 'prod'], label: 'rollback → v1.5', status: 'ok', desc: 'Registry-তে আগের image আছে — এক command-এ আগের version। তারপর শান্তভাবে bug খোঁজা।' },
          ] },
        ],
      },
      {
        type: 'terminal',
        preset: 'actions',
        title: 'লাল pipeline সবুজ করো',
        intro: 'তোমার শেষ push-এর পর GitHub Actions লাল। gh (GitHub CLI) দিয়ে কোন run ব্যর্থ দেখো, log পড়ো, নিজের machine-এ test চালাও, ঠিক করে push করো, আর সবুজ হতে দেখো।',
      },
    ],
    quiz: [
      { q: 'CI-এর মূল কাজ?', options: ['প্রতিটা push-এ নিজে থেকে build ও test', 'Server কেনা', 'Domain কেনা', 'Design বানানো'], answer: 0, explain: 'ভুল যত তাড়াতাড়ি ধরা পড়ে, তত সস্তা।' },
      { q: 'GitHub Actions-এর workflow ফাইল কোথায় থাকে?', options: ['.github/workflows/', 'node_modules/', '/etc/nginx/', 'README.md-তে'], answer: 0, explain: 'Repo-র ভেতরে, code-এর সাথে Git-এ।' },
      { q: 'Deploy token কোথায় রাখা উচিত?', options: ['Repo-র Actions secrets-এ', 'workflow YAML-এ সরাসরি', 'README-তে', 'Commit message-এ'], answer: 0, explain: 'secrets.NAME দিয়ে ব্যবহার, log-এ *** দিয়ে ঢাকা।' },
      { q: 'needs: test লিখলে কী হয়?', options: ['test job সফল হলে তবেই এই job চলে', 'test মুছে যায়', 'দুটো একসাথে চলে', 'কিছুই না'], answer: 0, explain: 'ক্রম ও শর্ত — ভাঙা code deploy হয় না।' },
      { q: 'খারাপ release-এর পর সবচেয়ে দ্রুত সমাধান?', options: ['আগের image-এ rollback, পরে bug খোঁজা', 'Production-এ বসে code edit', 'Server restart করে আশা করা', 'User-দের অপেক্ষা করতে বলা'], answer: 0, explain: 'আগে user-দের কষ্ট থামাও, তারপর তদন্ত।' },
    ],
    cheat: {
      category: 'CI/CD',
      severity: 'design',
      summary: 'Push → lint + test → build image (commit tag) → staging → production। Secret Actions secrets-এ। লাল মানে থামো, test মুছবে না। Rollback এক command-এ।',
      rules: ['প্রতিটা PR-এ CI বাধ্যতামূলক', 'needs দিয়ে test-এর পরে deploy', 'Secret শুধু secrets-এ', 'Image tag = commit SHA', 'ছোট, ঘন ঘন release'],
      checklist: ['main-এ branch protection + required checks?', 'Deploy job শুধু main থেকে?', 'Rollback পরীক্ষা করা?', 'Staging production-এর মতো?'],
      commands: ['gh run list --limit 5', 'gh run view <id> --log-failed', 'gh run watch', 'gh workflow run deploy.yml'],
      remember: 'যে কাজ দুবার হাতে করেছ, তৃতীয়বার pipeline-কে দাও।',
    },
    related: ['sd-deploy', 'deps'],
  },

  // ─────────────────────────────── 07 · Terraform
  {
    id: 'cd-iac',
    phase: 7,
    no: '07',
    icon: '🏗️',
    title: 'Infrastructure as Code — Terraform দিয়ে cloud বানানো',
    subtitle: 'Click করে নয়, code লিখে server, network, database',
    duration: '৫০–৬০ মিনিট',
    simple: 'Cloud console-এ click করে server বানালে তিন মাস পর কেউ মনে রাখে না কী কী বানানো হয়েছিল, কেন। IaC মানে বাড়ির নকশার মতো: কী কী লাগবে লিখে রাখো (code), তারপর Terraform সেই নকশা দেখে cloud-এ হুবহু বানিয়ে দেয় — যতবার চাও, ততবার একই রকম।',
    goals: ['ClickOps-এর সমস্যা আর IaC-এর সুবিধা', 'Declarative ভাষায় resource লেখা', 'terraform init → plan → apply', 'State, drift, variable ও module'],
    terms: [
      ['IaC', 'Infrastructure as Code — server, network লেখা code-এ'],
      ['Terraform', 'সবচেয়ে প্রচলিত IaC tool — অনেক cloud-এ চলে'],
      ['Provider', 'Terraform-এর plugin যা একটা নির্দিষ্ট cloud-এর সাথে কথা বলে (aws, google)'],
      ['Resource', 'একটা জিনিস যা থাকা চাই — VM, bucket, database'],
      ['Plan', 'Apply-এর আগে “কী কী বদলাবে” তার তালিকা'],
      ['State', 'Terraform-এর খাতা — code-এর কোন জিনিস cloud-এর কোন আসল জিনিস'],
      ['Drift', 'কেউ হাতে বদলানোয় code আর আসল অবস্থার অমিল'],
    ],
    steps: [
      {
        title: 'ClickOps-এর সমস্যা',
        body: 'Console-এ click করে বানানো infrastructure-কে মজা করে বলে “ClickOps”। সমস্যা: কেউ মনে রাখে না কোন setting কেন দেওয়া; staging আর production ধীরে ধীরে আলাদা হয়ে যায়; ভুল হলে কী বদলেছে বোঝার উপায় নেই; আর নতুন region-এ একই জিনিস বানাতে আবার শুরু থেকে click। IaC এগুলো code-এ রাখে — Git-এ ইতিহাস, PR-এ review, আর যতবার চাও হুবহু copy।',
        analogy: 'রাজমিস্ত্রিকে মুখে মুখে বলে বাড়ি বানানো বনাম স্থপতির নকশা হাতে দেওয়া। নকশা থাকলে একই বাড়ি দশটা বানানো যায়, আর কোথাও ফাটল দেখা দিলে নকশা মিলিয়ে বোঝা যায় কী বদলেছে।',
        compare: [
          { title: '🖱️ ClickOps', items: ['কে কী বানাল অজানা', 'Staging ≠ production', 'নতুন region-এ আবার click', 'ভুল হলে ফেরার উপায় কঠিন'] },
          { title: '📜 Infrastructure as Code', items: ['Git-এ পুরো ইতিহাস', 'একই code — একই পরিবেশ', 'নতুন region মানে নতুন variable', 'PR-এ review, plan দেখে apply'] },
        ],
      },
      {
        title: 'Declarative — “কী চাই” বলো, “কীভাবে” নয়',
        body: 'Terraform-এ তুমি ধাপ লেখো না (“প্রথমে এটা বানাও, তারপর ওটা”)। লেখো শেষ অবস্থাটা কেমন হওয়া চাই — “একটা bucket থাকবে, একটা small VM থাকবে”। Terraform নিজে হিসাব করে কী বানাতে, বদলাতে বা মুছতে হবে। একই code দুবার চালালে দ্বিতীয়বার কিছুই হয় না, কারণ যা চাওয়া হয়েছে তা আগেই আছে।',
        analogy: 'Restaurant-এ বলো “একটা ঠান্ডা কফি, চিনি কম” — কফি কীভাবে বানাবে সেটা রাঁধুনির কাজ। আবার বললে আরেকটা কফি আসে না; Terraform দেখে কফি আগেই টেবিলে আছে।',
        code: [{ label: 'main.tf', lang: 'hcl', text: `terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = "ap-southeast-1"            # Singapore
}

resource "aws_s3_bucket" "media" {
  bucket = "shopbd-media-2026"
}

resource "aws_instance" "api" {
  ami           = "ami-0abc123example"  # Ubuntu image-এর ID
  instance_type = "t3.small"
  tags = { Name = "shop-api" }
}` }],
        anatomy: {
          title: 'resource-এর প্রথম লাইন',
          parts: [
            ['resource', 'Block-এর ধরন', '“এই জিনিসটা থাকা চাই।”'],
            [' ', ''],
            ['"aws_instance"', 'Resource type', 'কোন provider-এর কোন জিনিস — এখানে AWS-এর virtual machine (EC2)।'],
            [' ', ''],
            ['"api"', 'তোমার দেওয়া নাম', 'Code-এর ভেতরে এটাকে ডাকার নাম: aws_instance.api'],
            [' {', ''],
          ],
        },
      },
      {
        title: 'init → plan → apply',
        body: 'Terraform-এর পুরো কাজ তিনটা command-এ। `init` provider নামায়। `plan` বলে কী কী বদলাবে — কিছু না বানিয়েই। `apply` আবার plan দেখিয়ে “yes” চায়, তারপর আসলে বানায়। Plan পড়া হলো Terraform-এর সবচেয়ে গুরুত্বপূর্ণ অভ্যাস।',
        seq: {
          title: 'প্রথমবার infrastructure বানানো',
          actors: [['🧑‍💻', 'তুমি'], ['🛠️', 'Terraform'], ['☁️', 'AWS']],
          msgs: [
            [0, 1, 'terraform init', 'AWS provider plugin নামানো হলো।'],
            [0, 1, 'terraform plan', '“কী বদলাবে” — শুধু দেখায়, কিছু বানায় না।'],
            [1, 2, 'এখন কী আছে?', 'State আর আসল cloud মিলিয়ে দেখে।'],
            [1, 0, 'Plan: 2 to add, 0 to change, 0 to destroy', 'পড়ে নিশ্চিত হও — বিশেষ করে “destroy”-এর সংখ্যা।', 'good'],
            [0, 1, 'terraform apply → yes', 'আবার plan দেখিয়ে সম্মতি চায়।'],
            [1, 2, 'create bucket, create instance', 'API call করে আসল জিনিস বানায়।'],
            [1, 1, 'terraform.tfstate হালনাগাদ', 'কী বানানো হলো তার হিসাব লেখা হলো।', 'good'],
          ],
        },
        warn: 'Plan-এ অপ্রত্যাশিত “destroy” বা “must be replaced” দেখলে থামো — বিশেষ করে database-এর পাশে। একটা ভুল apply-এ data সহ database মুছে যেতে পারে।',
      },
      {
        title: 'State — Terraform-এর খাতা',
        body: 'Terraform মনে রাখে code-এর কোন resource cloud-এর কোন আসল জিনিস — এই হিসাব থাকে state ফাইলে। দলে কাজ করলে state laptop-এ নয়, remote জায়গায় রাখো (যেমন S3 bucket, সাথে lock — যাতে দুজন একসাথে apply না করে)। State-এ password-ও থাকতে পারে, তাই এটা কখনো Git-এ নয়। কেউ console-এ হাতে কিছু বদলালে (drift) পরের plan সেটা ধরে ফেলে।',
        code: [{ label: 'Remote state', lang: 'hcl', text: `terraform {
  backend "s3" {
    bucket       = "shopbd-terraform-state"
    key          = "prod/terraform.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true      # একসাথে দুজন apply করতে পারবে না
  }
}` }],
        ask: ask('কেউ console-এ ঢুকে server-এর size হাতে বাড়িয়ে দিল। পরের terraform plan কী দেখাবে?', ['পার্থক্য (drift) — code-এর মানে ফিরিয়ে নিতে চাইবে', 'কিছুই না', 'Terraform ভেঙে যাবে'], 0, 'Code-ই সত্যের উৎস। হাতের বদল রাখতে চাইলে code-এ লিখে PR করো।'),
      },
      {
        title: 'Variable ও module — একই নকশা, অনেক জায়গায়',
        body: 'Variable দিয়ে একই code staging আর production-এ আলাদা মানে চালাও (ছোট server বনাম বড় server)। Module হলো নকশার পুনর্ব্যবহারযোগ্য অংশ — যেমন “একটা web server, তার security group আর disk সহ” — একবার লিখে বারবার ব্যবহার। Output দিয়ে বানানো জিনিসের তথ্য (যেমন IP) বের করে আনো।',
        code: [{ label: 'variable, module, output', lang: 'hcl', text: `variable "env" { type = string }

module "web" {
  source        = "./modules/web-server"
  name          = "shop-\${var.env}"
  instance_type = var.env == "prod" ? "t3.medium" : "t3.micro"
}

output "web_ip" { value = module.web.public_ip }` }, { label: 'চালানো', lang: 'bash', text: `terraform plan -var="env=staging"
terraform apply -var="env=prod"` }],
      },
      {
        title: 'IaC-এর ভালো অভ্যাস',
        body: 'Terraform-এর আসল শক্তি আসে দলের নিয়ম থেকে। Infrastructure-এর প্রতিটা বদল code review পায়, plan সবাই দেখে, আর console শুধু দেখার জায়গা।',
        points: [
          '🌿 সব বদল PR-এ: CI plan চালিয়ে PR-এ মন্তব্য করে, reviewer দেখে',
          '🤖 Apply CI থেকে: merge হলে pipeline apply করে — কারো laptop থেকে নয়',
          '🔒 State remote + lock: কখনো Git-এ নয়',
          '🏷️ সবকিছুতে tag: project, env, owner — খরচ হিসাব সহজ',
          '🧹 পরীক্ষার পরিবেশ শেষে terraform destroy — বিল বাঁচাও',
        ],
        tip: 'শুরুর জন্য: একটা ছোট জিনিস (একটা bucket) দিয়ে শুরু করো, plan পড়ার অভ্যাস করো, তারপর ধীরে ধীরে network আর server।',
      },
    ],
    labs: [
      {
        type: 'terminal',
        preset: 'terraform',
        title: 'Terraform playground',
        intro: 'Singapore region-এ একটা storage bucket আর একটা ছোট server বানাতে হবে। init, plan পড়ো, apply করো, state দেখো, কেউ হাতে কিছু বদলালে plan কী বলে দেখো, আর শেষে destroy। আটকে গেলে “help”।',
      },
      {
        type: 'classify',
        title: 'কোন জিনিস কোন ফাইলে লেখা হয়?',
        intro: 'DevOps-এ তিন রকম “code”। প্রতিটা কাজ সঠিক জায়গায় রাখো।',
        buckets: [{ id: 'tf', label: '🏗️ Terraform — cloud-এ কী থাকবে', color: '#a78bfa' }, { id: 'docker', label: '📦 Dockerfile — app-এর box', color: '#38bdf8' }, { id: 'ci', label: '⚙️ CI workflow — কখন কী চলবে', color: '#4ade80' }],
        items: [
          { text: 'Singapore region-এ একটা VM', bucket: 'tf', explain: 'Cloud resource — Terraform।' },
          { text: 'S3 bucket ও তার permission', bucket: 'tf', explain: 'Storage ও access — Terraform।' },
          { text: 'VPC ও subnet', bucket: 'tf', explain: 'Network — Terraform।' },
          { text: 'Managed database (RDS)', bucket: 'tf', explain: 'Cloud-এর database service — Terraform।' },
          { text: 'Node.js-এর version ও npm ci', bucket: 'docker', explain: 'App-এর পরিবেশ — Dockerfile।' },
          { text: 'Container কোন user হিসেবে চলবে', bucket: 'docker', explain: 'USER node — Dockerfile।' },
          { text: 'App কোন command দিয়ে শুরু হবে', bucket: 'docker', explain: 'CMD — Dockerfile।' },
          { text: 'Push হলে test চালাও', bucket: 'ci', explain: 'Trigger ও ধাপ — workflow।' },
          { text: 'main-এ merge হলে deploy', bucket: 'ci', explain: 'Workflow-এর deploy job।' },
          { text: 'প্রতি রাতে dependency scan', bucket: 'ci', explain: 'schedule trigger — workflow।' },
        ],
      },
    ],
    quiz: [
      { q: 'terraform plan কী করে?', options: ['কী কী বদলাবে দেখায় — কিছু বানায় না', 'সব মুছে দেয়', 'Server restart করে', 'Code compile করে'], answer: 0, explain: 'Plan পড়া = নিরাপদ apply।' },
      { q: 'Declarative মানে?', options: ['শেষ অবস্থা কেমন চাই তা লেখা', 'প্রতিটা ধাপ হাতে লেখা', 'GUI-তে click', 'Bash script'], answer: 0, explain: 'কীভাবে করবে Terraform নিজে ঠিক করে।' },
      { q: 'State ফাইল কোথায় রাখা উচিত?', options: ['Remote backend-এ lock সহ', 'Git repo-তে', 'Email-এ', 'Desktop-এ'], answer: 0, explain: 'দলের সবাই একই state, আর password থাকতে পারে — Git-এ নয়।' },
      { q: 'Console-এ হাতে বদলের ফলে code আর বাস্তবতার অমিলকে কী বলে?', options: ['Drift', 'Merge', 'Commit', 'Cache'], answer: 0, explain: 'Plan drift ধরে ফেলে।' },
      { q: 'একই নকশা staging ও production-এ ব্যবহারের উপায়?', options: ['Variable ও module', 'Code copy-paste', 'আলাদা cloud account-এ হাতে বানানো', 'সম্ভব নয়'], answer: 0, explain: 'একবার লেখো, মান বদলাও।' },
    ],
    cheat: {
      category: 'Infrastructure as Code',
      severity: 'design',
      summary: 'Infrastructure code-এ: init → plan (পড়ো!) → apply। State remote ও lock-সহ, Git-এ নয়। সব বদল PR-এ, apply CI থেকে। Drift মানে কেউ হাতে বদলেছে।',
      rules: ['Plan না পড়ে apply নয়', 'State remote + lock', 'Console-এ হাতে বদল নয়', 'Variable/module দিয়ে পুনর্ব্যবহার', 'সবকিছুতে tag'],
      checklist: ['Plan-এ অপ্রত্যাশিত destroy আছে?', 'State Git-এ নেই?', 'Provider version pin করা?', 'Test পরিবেশ destroy করা হয়েছে?'],
      commands: ['terraform init', 'terraform plan -out=plan.tfplan', 'terraform apply plan.tfplan', 'terraform destroy'],
      remember: 'নকশা আগে, ইট পরে — plan আগে, apply পরে।',
    },
    related: ['sd-deploy', 'sd-advanced'],
  },

  // ─────────────────────────────── 08 · Cloud networking
  {
    id: 'cd-cloudnet',
    phase: 8,
    no: '08',
    icon: '🏘️',
    title: 'Cloud networking — VPC, subnet ও load balancer',
    subtitle: 'Cloud-এ নিজের ঘেরা network: কে ভেতরে আসবে, কে আসবে না',
    duration: '৫০–৬০ মিনিট',
    simple: 'Cloud-এ তোমার server-গুলো একটা ঘেরা এলাকায় থাকে — VPC, যেন একটা gated community। সামনের গেটে দারোয়ান (load balancer) অতিথি নেয়; ভেতরের বাড়িগুলো (app, database) রাস্তা থেকে দেখাই যায় না। কে কোন দরজা দিয়ে ঢুকতে পারবে, সেটা ঠিক করে security group।',
    goals: ['VPC কী আর তার IP range', 'Public আর private subnet-এর পার্থক্য', 'Security group দিয়ে কে কোথায় ঢুকবে ঠিক করা', 'Load balancer, DNS আর NAT gateway'],
    terms: [
      ['VPC', 'Virtual Private Cloud — cloud-এর ভেতরে তোমার নিজস্ব, আলাদা network'],
      ['Subnet', 'VPC-র ভেতরের ছোট টুকরো — public বা private'],
      ['Internet gateway', 'VPC আর internet-এর মাঝের দরজা'],
      ['NAT gateway', 'Private server-কে বাইরে যেতে দেয়, বাইরে থেকে ঢুকতে দেয় না'],
      ['Security group', 'প্রতিটা server-এর নিজস্ব firewall — কোন port, কোথা থেকে'],
      ['Load balancer', 'সামনের দরজা — traffic সুস্থ server-গুলোতে ভাগ করে'],
      ['Private IP', 'শুধু VPC-র ভেতরে চলে এমন ঠিকানা (যেমন 10.0.2.15)'],
    ],
    steps: [
      {
        title: 'VPC — নিজের ঘেরা network',
        body: 'Cloud account খুললে তোমার server-গুলো অন্য লাখো customer-এর server-এর পাশে চলে — কিন্তু VPC সেগুলোকে একটা আলাদা, ঘেরা network-এ রাখে। VPC বানানোর সময় একটা IP range দাও, যেমন `10.0.0.0/16` — ৬৫,৫৩৬টা ঠিকানা। Networking কোর্সের subnet আর CIDR এখানেই কাজে লাগে।',
        analogy: 'VPC হলো দেয়াল-ঘেরা একটা আবাসিক এলাকা। ভেতরে রাস্তা (subnet), বাড়ি (server), আর এক-দুটো গেট। এলাকার বাইরের লোক ভেতরের বাড়ির নম্বর জানলেও গেট পেরোতে না পারলে কিছু করার নেই।',
        maps: [['🏘️ দেয়াল-ঘেরা এলাকা', 'VPC'], ['🛣️ ভেতরের রাস্তা', 'Subnet'], ['🚪 প্রধান গেট', 'Internet gateway'], ['💂 গেটের দারোয়ান', 'Load balancer + security group']],
      },
      {
        title: 'Public বনাম private subnet',
        body: 'Subnet-এর route table-এ internet gateway-র পথ থাকলে সেটা public — internet থেকে সেখানে পৌঁছানো যায়। না থাকলে private। নিয়মটা সহজ: শুধু যাদের internet-এর মুখোমুখি হতেই হবে (load balancer), তারা public-এ; বাকি সব — app server, database, cache — private-এ।',
        layers: {
          title: 'একটা ভালো VPC-র নকশা',
          items: [
            ['🌐', 'VPC 10.0.0.0/16', 'পুরো এলাকা — দুটো AZ জুড়ে'],
            ['🚪', 'Public subnet 10.0.1.0/24', 'Load balancer, NAT gateway — internet-মুখী'],
            ['⚙️', 'Private subnet 10.0.2.0/24', 'App server — শুধু load balancer থেকে traffic পায়'],
            ['🗄️', 'Private subnet 10.0.3.0/24', 'Database — শুধু app server থেকে'],
          ],
        },
        compare: [
          { title: '🚪 Public subnet', color: '#f59e0b', items: ['Internet gateway-র পথ আছে', 'Public IP পেতে পারে', 'Load balancer, NAT', 'যত কম জিনিস, তত ভালো'] },
          { title: '🔒 Private subnet', color: '#22c55e', items: ['Internet থেকে সরাসরি পৌঁছানো যায় না', 'শুধু private IP', 'App, database, cache, worker', 'বেশিরভাগ জিনিস এখানেই'] },
        ],
      },
      {
        title: 'Security group — প্রতিটা server-এর দারোয়ান',
        body: 'Security group হলো server-এর গায়ে লাগানো firewall: কোন port খোলা, আর কোথা থেকে। শুরুতে সব ঢোকা বন্ধ — তুমি যা খুলবে শুধু তাই খোলা। সবচেয়ে সুন্দর কৌশল: IP-এর বদলে অন্য security group-এর নাম দেওয়া — “database-এর 5432 শুধু app-sg থেকে”। নতুন app server এলে নিয়ম বদলাতে হয় না।',
        code: [{ label: 'তিন স্তরের নিয়ম', lang: 'text', text: `lb-sg   inbound  443   from 0.0.0.0/0    ← পুরো internet, শুধু HTTPS
app-sg  inbound  3000  from lb-sg        ← শুধু load balancer থেকে
db-sg   inbound  5432  from app-sg       ← শুধু app server থেকে
        (বাকি সব — বন্ধ)` }],
        ask: ask('Database-এর security group-এ “5432 from 0.0.0.0/0” লেখা থাকলে কী হবে?', ['পুরো internet database-এ connect করার চেষ্টা করতে পারবে', 'কিছুই হবে না', 'শুধু app connect করতে পারবে'], 0, '0.0.0.0/0 মানে “সব ঠিকানা”। Bot-রা কয়েক মিনিটের মধ্যেই খুঁজে পেয়ে password আন্দাজ শুরু করবে।'),
      },
      {
        title: 'Load balancer ও DNS',
        body: 'User তোমার domain খোলে → DNS বলে দেয় load balancer-এর ঠিকানা → load balancer সুস্থ app server-গুলোতে request ভাগ করে দেয় (System Design কোর্সের load balancing lesson-এ বিস্তারিত)। HTTPS certificate সাধারণত load balancer-এই বসে। App server দুটো আলাদা AZ-এ থাকলে একটা ভবন বন্ধ হলেও site চালু।',
        seq: {
          title: 'একটা request VPC-তে ঢোকে',
          actors: [['🧑', 'User'], ['📒', 'DNS'], ['⚖️', 'Load balancer'], ['⚙️', 'app (AZ-a)'], ['⚙️', 'app (AZ-b)']],
          msgs: [
            [0, 1, 'shop.example.com?', 'Browser আগে ঠিকানা জানতে চায়।'],
            [1, 0, 'load balancer-এর ঠিকানা', 'DNS-এ app server-এর নয়, LB-র ঠিকানা থাকে।'],
            [0, 2, 'HTTPS request', 'TLS এখানেই খোলা হয় — certificate LB-তে।'],
            [2, 3, '→ app-a', 'সুস্থ server-এ পাঠায়, private IP দিয়ে।'],
            [2, 4, 'পরের request → app-b', 'ভার ভাগাভাগি; একটা AZ বন্ধ হলেও অন্যটা চলে।', 'good'],
          ],
        },
      },
      {
        title: 'NAT — ভেতর থেকে বাইরে, কিন্তু বাইরে থেকে ভেতরে নয়',
        body: 'Private subnet-এর server-কেও মাঝে মাঝে internet লাগে — npm package নামাতে, OS update আনতে, payment API-তে call করতে। NAT gateway (public subnet-এ বসে) শুধু ভেতর থেকে শুরু হওয়া connection বাইরে যেতে দেয় আর উত্তর ফিরিয়ে আনে; বাইরে থেকে নতুন connection ঢুকতে দেয় না — Networking কোর্সের বাড়ির router-এর NAT-এর মতোই।',
        tip: 'Cloud-এর NAT gateway ঘণ্টা আর data — দুই হিসাবেই টাকা নেয়। ছোট শেখার project-এ খরচ খেয়াল রাখো, কাজ শেষে মুছে দাও।',
        ask: ask('Private subnet-এর app server npm install করতে পারছে না। কী নেই সম্ভবত?', ['NAT gateway-র পথ', 'Load balancer', 'Domain name'], 0, 'Private subnet-এর বাইরে যাওয়ার একমাত্র পথ NAT — সেটা না থাকলে internet নেই।'),
      },
    ],
    labs: [
      {
        type: 'map',
        title: 'VPC-র ভেতরে — কে কোথায় যেতে পারে',
        intro: 'একটা production VPC: public subnet-এ load balancer আর NAT, private subnet-এ দুটো app server আর database। স্বাভাবিক request, বাইরে থেকে database-এ আক্রমণ, ভেতর থেকে update নামানো, আর একটা AZ বন্ধ — চারটা mode দেখো।',
        height: 380,
        zones: [
          { x: 22, y: 4, w: 76, h: 92, label: 'VPC 10.0.0.0/16', color: '#38bdf8' },
          { x: 25, y: 10, w: 20, h: 80, label: 'Public subnet', color: '#f59e0b' },
          { x: 50, y: 10, w: 45, h: 80, label: 'Private subnets', color: '#22c55e' },
        ],
        nodes: [
          { id: 'user', x: 7, y: 25, icon: '🧑', label: 'User' },
          { id: 'atk', x: 7, y: 75, icon: '😈', label: 'Attacker' },
          { id: 'npm', x: 7, y: 50, icon: '📦', label: 'npm registry', sub: 'internet' },
          { id: 'lb', x: 35, y: 30, icon: '⚖️', label: 'Load balancer', sub: 'lb-sg: 443' },
          { id: 'nat', x: 35, y: 72, icon: '🔁', label: 'NAT gateway' },
          { id: 'app1', x: 62, y: 25, icon: '⚙️', label: 'app AZ-a', sub: '10.0.2.10' },
          { id: 'app2', x: 62, y: 72, icon: '⚙️', label: 'app AZ-b', sub: '10.0.2.20' },
          { id: 'db', x: 86, y: 48, icon: '🗄️', label: 'Database', sub: 'db-sg: 5432 ← app' },
        ],
        edges: [['user', 'lb'], ['lb', 'app1'], ['lb', 'app2'], ['app1', 'db'], ['app2', 'db'], ['app1', 'nat'], ['app2', 'nat'], ['nat', 'npm'], ['atk', 'lb']],
        modes: [
          { id: 'normal', name: 'স্বাভাবিক request', hops: [
            { path: ['user', 'lb'], label: 'HTTPS :443', desc: 'Internet থেকে শুধু load balancer দেখা যায়।' },
            { path: ['lb', 'app1'], label: '→ app :3000', desc: 'app-sg শুধু lb-sg থেকে 3000 নেয়।' },
            { path: ['app1', 'db'], label: 'SQL :5432', desc: 'db-sg শুধু app-sg থেকে 5432 নেয়।' },
            { path: ['db', 'app1', 'lb', 'user'], label: '200 OK', status: 'ok', desc: 'তিন স্তরের দরজা, প্রতিটা শুধু ঠিক লোকের জন্য খোলা।' },
          ] },
          { id: 'attack', name: 'বাইরে থেকে database-এ', kind: 'attack', hops: [
            { path: ['atk', 'lb'], label: 'scan :5432', status: 'blocked', desc: 'Database-এর কোনো public ঠিকানাই নেই — private subnet।' },
            { path: ['atk', 'lb', 'app1'], label: 'LB দিয়ে :3000?', status: 'blocked', desc: 'Load balancer শুধু 443 নেয় আর নিয়ম মেনে app-এ পাঠায় — সরাসরি app port-এ ঢোকা যায় না।' },
          ] },
          { id: 'egress', name: 'Private server-এর update', hops: [
            { path: ['app2', 'nat'], label: 'npm install', desc: 'Private server internet-এ যেতে চায়।' },
            { path: ['nat', 'npm'], label: 'বাইরে যাওয়া ✓', status: 'ok', desc: 'NAT ভেতর থেকে শুরু হওয়া connection বাইরে যেতে দেয়…' },
            { path: ['npm', 'nat', 'app2'], label: 'package ফেরত', status: 'ok', desc: '…আর উত্তর ফেরত আনে। কিন্তু বাইরে থেকে কেউ app2-তে নতুন connection শুরু করতে পারে না।' },
          ] },
          { id: 'azfail', name: 'AZ-a বন্ধ', kind: 'fail', down: ['app1'], hops: [
            { path: ['user', 'lb'], label: 'request', desc: 'AZ-a-তে বিদ্যুৎ বিভ্রাট — app1 বন্ধ।' },
            { path: ['lb', 'app1'], label: 'health check ✗', status: 'blocked', desc: 'Load balancer টের পেয়ে app1-কে তালিকা থেকে সরাল।' },
            { path: ['lb', 'app2', 'db'], label: '→ app AZ-b', status: 'ok', desc: 'সব traffic AZ-b-তে। User কিছুই টের পেল না।' },
          ] },
        ],
      },
      {
        type: 'classify',
        title: 'কোন জিনিস কোথায় বসাবে?',
        intro: 'প্রতিটা জিনিসের জন্য ঠিক করো: public subnet, private subnet, নাকি VPC-র বাইরে (internet-এ)।',
        buckets: [{ id: 'public', label: '🚪 Public subnet', color: '#f59e0b' }, { id: 'private', label: '🔒 Private subnet', color: '#22c55e' }, { id: 'outside', label: '🌍 VPC-র বাইরে', color: '#94a3b8' }],
        items: [
          { text: 'Load balancer', bucket: 'public', explain: 'Internet-এর সামনের দরজা।' },
          { text: 'NAT gateway', bucket: 'public', explain: 'বাইরে যাওয়ার জন্য internet gateway-র কাছে থাকতে হয়।' },
          { text: 'Node.js app server', bucket: 'private', explain: 'শুধু LB থেকে traffic।' },
          { text: 'PostgreSQL database', bucket: 'private', explain: 'সবচেয়ে মূল্যবান — সবচেয়ে ভেতরে।' },
          { text: 'Redis cache', bucket: 'private', explain: 'শুধু app ব্যবহার করে।' },
          { text: 'Background worker (email পাঠায়)', bucket: 'private', explain: 'বাইরে যায় NAT দিয়ে, কেউ ভেতরে আসে না।' },
          { text: 'User-এর browser', bucket: 'outside', explain: 'Internet-এ।' },
          { text: 'Payment gateway-র API', bucket: 'outside', explain: 'অন্য কোম্পানির service।' },
          { text: 'npm registry', bucket: 'outside', explain: 'Internet-এ — NAT দিয়ে পৌঁছাও।' },
        ],
      },
    ],
    quiz: [
      { q: 'VPC কী?', options: ['Cloud-এর ভেতরে নিজস্ব, আলাদা network', 'একটা database', 'একটা programming ভাষা', 'একটা domain'], answer: 0, explain: 'নিজের IP range, subnet আর নিয়ম।' },
      { q: 'Database কোন subnet-এ থাকা উচিত?', options: ['Private', 'Public', 'যেকোনোটা', 'VPC-র বাইরে'], answer: 0, explain: 'Internet থেকে সরাসরি পৌঁছানোর কারণ নেই।' },
      { q: '“5432 from app-sg” নিয়মের মানে?', options: ['শুধু app-sg-ওয়ালা server database-এ ঢুকতে পারে', 'সবাই ঢুকতে পারে', 'কেউ পারে না', 'App বন্ধ'], answer: 0, explain: 'IP নয়, ভূমিকা দিয়ে অনুমতি।' },
      { q: 'Private server-কে বাইরে যেতে দেয় কিন্তু বাইরে থেকে ঢুকতে দেয় না — কে?', options: ['NAT gateway', 'Load balancer', 'DNS', 'Volume'], answer: 0, explain: 'একমুখী দরজা।' },
      { q: 'দুটো AZ-এ app server রাখার লাভ?', options: ['একটা ভবন বন্ধ হলেও site চালু', 'খরচ শূন্য', 'Code দ্রুত লেখা যায়', 'Domain লাগে না'], answer: 0, explain: 'Load balancer সুস্থটায় পাঠায়।' },
    ],
    cheat: {
      category: 'Cloud Networking',
      severity: 'design',
      summary: 'VPC = নিজের network। Public subnet-এ শুধু load balancer ও NAT; app, database, cache private-এ। Security group-এ সব বন্ধ দিয়ে শুরু, অনুমতি দাও অন্য security group-এর নাম দিয়ে।',
      rules: ['Database কখনো public নয়', '0.0.0.0/0 শুধু LB-র 443-এ', 'Security group-এ IP নয়, sg-এর নাম', 'অন্তত দুটো AZ', 'Private-এর internet NAT দিয়ে'],
      checklist: ['কোন জিনিসে public IP আছে, কেন?', 'db-sg-তে 0.0.0.0/0 নেই?', 'Load balancer-এ health check?', 'NAT-এর খরচ দেখা হয়েছে?'],
      commands: ['aws ec2 describe-vpcs', 'aws ec2 describe-security-groups --group-ids sg-…', 'nc -zv 10.0.3.5 5432   # ভেতর থেকে পৌঁছায় কিনা'],
      remember: 'যত কম জিনিস internet দেখে, তত কম জিনিস internet আক্রমণ করতে পারে।',
    },
    related: ['net-ip', 'net-routing', 'sd-lb'],
  },
];
