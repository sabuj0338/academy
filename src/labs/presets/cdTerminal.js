// Cloud ও DevOps কোর্সের terminal lab — সব সিমুলেটেড, কোনো আসল command চলে না।
// গঠন terminalPresets.js-এর মতো: { prompt, banner, help, init?, commands: [{ match, out, flag? }], missions: [{ id, text, check? }] }

const LS_LA = (s) => `total 24
drwxr-x--- 4 rafi rafi 4096 Nov 18 09:12 .
drwxr-xr-x 3 root root 4096 Oct  2 11:40 ..
${s.envFixed ? '-rw------- 1 rafi rafi  212 Nov 18 08:55 .env        ← এখন শুধু তুমি পড়তে পারো ✓' : '-rw-r--r-- 1 rafi rafi  212 Nov 18 08:55 .env        ← r-- r-- : সবাই পড়তে পারে! 😱'}
drwxr-xr-x 6 rafi rafi 4096 Nov 17 22:30 app
-rw-r--r-- 1 rafi rafi  118 Nov 18 08:40 notes.txt`;

const GIT_LOG = (s) => s.log.slice().reverse().map((c) => `${c.sha} ${c.branch === 'main' ? '' : '(' + c.branch + ') '}${c.msg}`).join('\n') || '(এখনো কোনো commit নেই)';
const sha = (s) => ['a1b2c3d', 'e4f5a6b', '9c8d7e6', 'f0e1d2c', '7b6a5c4', '3d2c1b0'][s.log.length % 6];

export default {
  // ─────────────────────────── Lesson 02 · Linux
  linux101: {
    prompt: 'rafi@web-01:~$',
    banner: 'Ubuntu 24.04 · web-01 — SSH দিয়ে ঢুকেছ।\n🚨 একটু আগে খবর এসেছে: “site খুলছে না!” চারপাশ ঘুরে দেখো, log পড়ো, কারণ খুঁজে ঠিক করো। "help" দেখো।',
    help: 'pwd\nls\nls -la\ncat notes.txt\nls /var/log/nginx\ntail /var/log/nginx/error.log\ndf -h\nfree -h\nsystemctl status nginx\njournalctl -u nginx -n 20\nsudo systemctl start nginx\ncurl -I localhost\nchmod 600 .env',
    init: (s) => { s.nginx = false; s.envFixed = false; },
    commands: [
      { match: /^pwd$/, out: '/home/rafi   ← তুমি এখন নিজের home folder-এ', flag: 'pwd' },
      { match: /^ls$/, out: 'app  notes.txt   (লুকানো ফাইল দেখতে: ls -la)', flag: 'ls' },
      { match: /^ls -(la|al|l -a|a -l)$/, out: (m, s) => LS_LA(s), flag: 'ls' },
      { match: /^cat notes\.txt$/, out: '- nginx রাতে maintenance-এর জন্য থামানো হয়েছিল (admin)\n- TODO: .env-এর permission ঠিক করতে হবে — এখন সবাই পড়তে পারে!' },
      { match: /^cat \.env$/, out: 'DATABASE_URL=postgres://app:••••••@db:5432/shop\n(এই ফাইলে password আছে — permission কড়া হওয়া উচিত)' },
      { match: /^cd( .*)?$/, out: '(folder বদলানো হলো। এই lab-এ পুরো path লিখে command চালাও — যেমন ls /var/log/nginx)' },
      { match: /^ls (-l )?\/var\/log\/?$/, out: 'apt  auth.log  journal  nginx  syslog  ufw.log' },
      { match: /^ls (-l )?\/var\/log\/nginx\/?$/, out: 'access.log  error.log' },
      { match: /^(tail|cat|less)( -n \d+| -f)? \/var\/log\/nginx\/error\.log$/, out: '2026/11/18 02:14:07 [notice] 912#912: signal 15 (SIGTERM) received from 1, exiting\n2026/11/18 02:14:07 [notice] 912#912: exit\n← রাত ২:১৪-এ কেউ nginx থামিয়েছে, আর আবার চালু হয়নি। Service-এর অবস্থা দেখো।', flag: 'logs' },
      { match: /^(tail|cat|less)( -n \d+)? \/var\/log\/nginx\/access\.log$/, out: '103.110.5.9 - - [18/Nov/2026:02:13:58] "GET / HTTP/1.1" 200 5120\n(02:14-এর পর আর কোনো লাইন নেই — কেউ ঢুকতেই পারছে না)' },
      { match: /^df -h$/, out: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   16G   24G  41% /\n✓ Disk ঠিক আছে — ভরে যায়নি', flag: 'disk' },
      { match: /^free -h$/, out: '               total   used   free\nMem:           3.8Gi  1.1Gi  2.4Gi\n✓ RAM-ও যথেষ্ট আছে', flag: 'disk' },
      { match: /^top$/, out: '(top চালু হলো…) CPU 3%, সবচেয়ে বেশি: node (2.1%) — অস্বাভাবিক কিছু নেই। (q দিয়ে বের হয়েছ)' },
      { match: /^(sudo )?systemctl status nginx$/, out: (m, s) => (s.nginx ? '● nginx.service - A high performance web server\n     Active: active (running) since Tue 2026-11-18 09:20:11' : '● nginx.service - A high performance web server\n     Active: inactive (dead) since Tue 2026-11-18 02:14:07\n← বন্ধ! ভাঙেনি — কেউ থামিয়েছিল।'), flag: 'status' },
      { match: /^(sudo )?journalctl -u nginx( -n \d+)?$/, out: 'Nov 18 02:14:06 web-01 systemd[1]: Stopping nginx.service…  (admin: maintenance)\nNov 18 02:14:07 web-01 systemd[1]: Stopped nginx.service.\n← maintenance শেষে কেউ আর চালু করেনি।', flag: 'status' },
      { match: /^systemctl (re)?start nginx$/, out: 'Failed to start nginx.service: Access denied\n← এটা admin-এর কাজ — সামনে sudo লাগবে।' },
      { match: /^sudo systemctl (re)?start nginx$/, out: (m, s) => { s.nginx = true; return '(কোনো output নেই = সফল)\nএবার যাচাই করো: curl -I localhost'; }, flag: 'start' },
      { match: /^(sudo )?systemctl enable nginx$/, out: 'Created symlink … → nginx.service\n✓ Server restart হলেও এখন nginx নিজে চালু হবে' },
      { match: /^curl( -I)? (http:\/\/)?localhost\/?$/, out: (m, s) => (s.nginx ? 'HTTP/1.1 200 OK\nServer: nginx\n✓ Site আবার চালু! 🎉' : 'curl: (7) Failed to connect to localhost port 80: Connection refused'), flag: 'curl' },
      { match: /^ps aux \| grep nginx$/, out: (m, s) => (s.nginx ? 'root   1204  nginx: master process\nwww-data 1205 nginx: worker process' : 'rafi   1388  grep nginx   ← শুধু grep নিজেই; nginx চলছে না') },
      { match: /^chmod 600 \.env$/, out: (m, s) => { s.envFixed = true; return '(সফল) — এবার ls -la দিয়ে দেখো'; }, flag: 'chmod' },
      { match: /^chmod/, out: 'chmod-এর সংখ্যা ভেবে দেখো: শুধু মালিক পড়বে-লিখবে = 600' },
      { match: /^whoami$/, out: 'rafi' },
      { match: /^sudo rm/, out: '✋ এই lab-এ rm বন্ধ — বাস্তবেও sudo rm লেখার আগে দুবার পড়ো।' },
    ],
    missions: [
      { id: 'where', text: 'কোথায় আছো আর কী কী আছে দেখো (pwd, ls -la)', check: (c, s) => s.flags.pwd && s.flags.ls },
      { id: 'logs', text: 'nginx-এর error log পড়ো (/var/log/nginx/error.log)' },
      { id: 'disk', text: 'Disk ও RAM ঠিক আছে কিনা দেখো (df -h)' },
      { id: 'status', text: 'nginx service-এর অবস্থা দেখো (systemctl status)' },
      { id: 'fixed', text: 'sudo দিয়ে nginx চালু করে curl দিয়ে যাচাই করো', check: (c, s) => s.nginx && /^curl/.test(c) },
      { id: 'chmod', text: '.env ফাইল শুধু নিজের জন্য করো (chmod 600)' },
    ],
  },

  // ─────────────────────────── Lesson 03 · Git
  git101: {
    prompt: 'rafi@laptop:~/shop$',
    banner: 'একটা ছোট online দোকানের folder — index.html আর app.js আছে, কিন্তু Git এখনো শুরু হয়নি।\nRepo শুরু করো, commit করো, branch-এ feature বানাও, merge করো, আর একটা conflict মেটাও। "help" দেখো।',
    help: 'git init\ngit status\ngit add .\ngit commit -m "First version"\ngit log --oneline\ngit switch -c add-cart\ncode app.js            (editor-এ খোলো — এই lab-এ খুললেই কিছু বদলায়)\ngit switch main\ngit merge add-cart\ngit merge price-update\ngit branch\ngit remote add origin https://github.com/rafi/shop.git\ngit push -u origin main',
    init: (s) => { Object.assign(s, { init: false, staged: false, dirty: true, branch: 'main', branches: ['main'], log: [], merged: false, conflict: false, resolved: false, conflictDone: false, remote: false, branchCommits: 0 }); },
    commands: [
      { match: /^git init$/, out: (m, s) => { s.init = true; return 'Initialized empty Git repository in /home/rafi/shop/.git/\n✓ এখন থেকে এই folder-এর ইতিহাস রাখা হবে'; }, flag: 'init' },
      { match: /^git status$/, out: (m, s) => {
        if (!s.init) return 'fatal: not a git repository\n← আগে git init';
        if (s.conflict && !s.resolved) return `On branch main\nYou have unmerged paths.\n  both modified:   app.js\n← app.js খুলে (code app.js) conflict মেটাও`;
        if (s.staged) return `On branch ${s.branch}\nChanges to be committed:\n  ${s.log.length ? 'modified:   app.js' : 'new file:   index.html\n  new file:   app.js'}\n← এবার git commit -m "…"`;
        if (s.dirty) return `On branch ${s.branch}\n${s.log.length ? 'Changes not staged for commit:\n  modified:   app.js' : 'Untracked files:\n  index.html\n  app.js'}\n← git add দিয়ে পরের commit-এ রাখো`;
        return `On branch ${s.branch}\nnothing to commit, working tree clean`;
      } },
      { match: /^git add (\.|-A|--all|app\.js|index\.html app\.js|app\.js index\.html)$/, out: (m, s) => {
        if (!s.init) return 'fatal: not a git repository';
        if (s.conflict && s.resolved) { s.staged = true; return '(conflict মেটানো app.js staged)'; }
        if (!s.dirty) return '(বদলানোর কিছু নেই)';
        s.staged = true; return '(staged — git status দিয়ে দেখো)';
      } },
      { match: /^git commit -m ["'](.+)["']$/, out: (m, s) => {
        if (!s.init) return 'fatal: not a git repository';
        if (!s.staged) return 'nothing added to commit\n← আগে git add';
        const id = sha(s);
        s.log.push({ sha: id, msg: m[1], branch: s.branch });
        s.staged = false; s.dirty = false;
        if (s.branch !== 'main') s.branchCommits++;
        if (s.conflict && s.resolved) { s.conflict = false; s.conflictDone = true; return `[main ${id}] ${m[1]}\n✓ Merge সম্পূর্ণ — conflict মেটানো হলো 🎉`; }
        return `[${s.branch}${s.log.length === 1 ? ' (root-commit)' : ''} ${id}] ${m[1]}\n ${s.log.length === 1 ? '2 files changed, 48 insertions(+)' : '1 file changed, 12 insertions(+)'}`;
      } },
      { match: /^git commit$/, out: '(editor খুলত) — এই lab-এ message সহ লেখো: git commit -m "কী আর কেন"' },
      { match: /^git log( --oneline)?( --graph)?$/, out: (m, s) => GIT_LOG(s) },
      { match: /^git (switch -c|checkout -b) (\S+)$/, out: (m, s) => {
        if (!s.log.length) return 'fatal: আগে অন্তত একটা commit করো';
        s.branch = m[2]; if (!s.branches.includes(m[2])) s.branches.push(m[2]);
        return `Switched to a new branch '${m[2]}'\n← এখানে যা করবে, main ছোঁবে না`;
      } },
      { match: /^git (switch|checkout) (\S+)$/, out: (m, s) => {
        if (!s.branches.includes(m[2])) return `fatal: invalid reference: ${m[2]}`;
        s.branch = m[2]; return `Switched to branch '${m[2]}'`;
      } },
      { match: /^git branch$/, out: (m, s) => [...s.branches, 'price-update'].filter((b, i, a) => a.indexOf(b) === i).map((b) => (b === s.branch ? '* ' : '  ') + b + (b === 'price-update' ? '   (teammate-এর branch)' : '')).join('\n') },
      { match: /^code app\.js$/, out: (m, s) => {
        if (s.conflict && !s.resolved) { s.resolved = true; return '<<<<<<< HEAD\nconst price = 100;\n=======\nconst price = 120;\n>>>>>>> price-update\n\n(editor-এ: দলের সিদ্ধান্ত ১২০ — চিহ্নগুলো মুছে শুধু "const price = 120;" রাখা হলো, save)\n← এবার git add app.js আর git commit'; }
        s.dirty = true;
        return s.branch === 'main' ? '(app.js-এ একটা ছোট পরিবর্তন save হলো)' : `(app.js-এ ${s.branch}-এর নতুন feature লেখা হলো — "addToCart()" function, save)`;
      } },
      { match: /^git merge (\S+)$/, out: (m, s) => {
        if (s.branch !== 'main') return '← আগে main-এ ফেরো: git switch main';
        if (m[1] === 'price-update') {
          if (!s.merged) return '← আগে নিজের feature branch merge করো, তারপর teammate-এরটা';
          s.conflict = true; return 'Auto-merging app.js\nCONFLICT (content): Merge conflict in app.js\nAutomatic merge failed; fix conflicts and then commit the result.\n← দুজনেই app.js-এর একই লাইন (দাম) বদলেছ। code app.js দিয়ে খোলো।';
        }
        if (!s.branches.includes(m[1])) return `merge: ${m[1]} - not something we can merge`;
        if (!s.branchCommits) return 'Already up to date.\n← ওই branch-এ নতুন commit নেই — আগে সেখানে কাজ করে commit করো';
        s.merged = true;
        return `Updating ${s.log[0].sha}..${s.log[s.log.length - 1].sha}\nFast-forward\n app.js | 12 ++++++++++++\n✓ ${m[1]}-এর কাজ এখন main-এ`;
      }, flag: 'mergecmd' },
      { match: /^git remote add origin (\S+)$/, out: (m, s) => { s.remote = true; return '(origin যোগ হলো — এখন push করা যাবে)'; } },
      { match: /^git push( -u origin \S+| origin \S+)?$/, out: (m, s) => {
        if (!s.remote) return 'fatal: No configured push destination.\n← আগে: git remote add origin https://github.com/rafi/shop.git';
        if (!s.log.length) return 'error: src refspec main does not match any (আগে commit করো)';
        s.pushed = true; return `To https://github.com/rafi/shop.git\n * [new branch]      ${s.branch} -> ${s.branch}\n✓ GitHub-এ পৌঁছে গেছে`;
      } },
    ],
    missions: [
      { id: 'init', text: 'Repo শুরু করো (git init)' },
      { id: 'first', text: 'প্রথম commit করো (git add → git commit -m)', check: (c, s) => s.log.length >= 1 },
      { id: 'branch', text: 'নতুন branch-এ একটা feature commit করো', check: (c, s) => s.branchCommits >= 1 },
      { id: 'merge', text: 'main-এ ফিরে feature branch merge করো', check: (c, s) => s.merged },
      { id: 'conflict', text: 'price-update merge করে conflict মেটাও', check: (c, s) => s.conflictDone },
      { id: 'push', text: 'GitHub-এ push করো', check: (c, s) => s.pushed },
    ],
  },

  // ─────────────────────────── Lesson 04 · Docker
  docker101: {
    prompt: 'you@laptop:~/shop$',
    banner: 'Docker install করা আছে। প্রথম container চালাও, nginx-কে browser-এ আনো, নিজের app-এর image বানাও, আর volume দিয়ে database-এর data বাঁচাও। "help" দেখো।',
    help: 'docker run hello-world\ndocker run -d -p 8080:80 --name web nginx:1.27\ndocker ps\ncurl localhost:8080\ndocker build -t shop-api:1.0 .\ndocker images\ndocker run -d -p 3000:3000 --name api shop-api:1.0\ncurl localhost:3000/health\ndocker logs api\ndocker volume create pgdata\ndocker run -d --name db -e POSTGRES_PASSWORD=change-me -v pgdata:/var/lib/postgresql/data postgres:16\ndocker rm -f db',
    init: (s) => { Object.assign(s, { web: false, api: false, db: false, dbVol: false, vol: false, builds: 0 }); },
    commands: [
      { match: /^docker run hello-world$/, out: 'Unable to find image \'hello-world:latest\' locally\nlatest: Pulling from library/hello-world\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n← image নেমেছে, container চলেছে, message দিয়েই থেমেছে', flag: 'hello' },
      { match: /^docker run -d -p 8080:80( --name web)? nginx(:1\.27)?$/, out: (m, s) => { s.web = true; return 'f3a9c2e1b7d4…\n← nginx পেছনে চলছে; তোমার 8080 → container-এর 80'; } },
      { match: /^docker run -p 8080:80( --name web)? nginx(:1\.27)?$/, out: '(terminal আটকে গেল — log দেখাচ্ছে…) Ctrl+C চাপলে container থেমে যায়।\n← -d দিয়ে পেছনে চালাও' },
      { match: /^docker ps( -a)?$/, out: (m, s) => {
        const rows = [s.web && 'f3a9c2e1b7d4  nginx:1.27     Up 2 minutes   0.0.0.0:8080->80/tcp     web', s.api && 'b81c0e2a9f13  shop-api:1.0   Up 30 seconds  0.0.0.0:3000->3000/tcp   api', s.db && `5d7e8f9a0b1c  postgres:16    Up 10 seconds  5432/tcp                 db${s.dbVol ? '' : '   ⚠ volume নেই'}`].filter(Boolean);
        return 'CONTAINER ID  IMAGE          STATUS         PORTS                    NAMES\n' + (rows.join('\n') || '(কোনো container চলছে না)');
      } },
      { match: /^curl (http:\/\/)?localhost:8080\/?$/, out: (m, s) => (s.web ? '<!DOCTYPE html>\n<title>Welcome to nginx!</title>\n<h1>Welcome to nginx!</h1>\n✓ Container-এর ভেতরের nginx তোমার 8080-এ!' : 'curl: (7) Failed to connect to localhost port 8080: Connection refused'), flag: 'curl8080' },
      { match: /^ls$/, out: 'Dockerfile  package.json  package-lock.json  server.js  .dockerignore' },
      { match: /^cat Dockerfile$/, out: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nUSER node\nCMD ["node", "server.js"]' },
      { match: /^docker build -t shop-api:1\.0 \.$/, out: (m, s) => {
        s.builds++;
        return s.builds === 1
          ? '[+] Building 18.2s (9/9) FINISHED\n => [1/5] FROM node:22-alpine\n => [2/5] WORKDIR /app\n => [3/5] COPY package*.json ./\n => [4/5] RUN npm ci --omit=dev          11.6s\n => [5/5] COPY . .\n => naming to docker.io/library/shop-api:1.0\n← আবার build করে দেখো কী হয়'
          : '[+] Building 1.1s (9/9) FINISHED\n => CACHED [2/5] WORKDIR /app\n => CACHED [3/5] COPY package*.json ./\n => CACHED [4/5] RUN npm ci --omit=dev\n => [5/5] COPY . .\n← package.json বদলায়নি — npm ci cache থেকে, ১৮ সেকেন্ড থেকে ১ সেকেন্ড!';
      }, flag: 'build' },
      { match: /^docker images$/, out: (m, s) => `REPOSITORY   TAG     SIZE\n${s.builds ? 'shop-api     1.0     148MB\n' : ''}nginx        1.27    192MB\nhello-world  latest  13kB` },
      { match: /^docker run -d -p 3000:3000( --name api)? shop-api:1\.0$/, out: (m, s) => { if (!s.builds) return 'Unable to find image \'shop-api:1.0\' locally\n← আগে docker build'; s.api = true; return 'b81c0e2a9f13…\n← তোমার নিজের app এখন container-এ'; } },
      { match: /^curl (http:\/\/)?localhost:3000\/health\/?$/, out: (m, s) => (s.api ? '{"status":"ok","uptime":12.4}\n✓ নিজের image থেকে চলা app উত্তর দিচ্ছে!' : 'curl: (7) Failed to connect to localhost port 3000'), flag: 'health' },
      { match: /^docker logs( -f)? (api|b81c0e2a9f13)$/, out: (m, s) => (s.api ? 'Server listening on :3000\nGET /health 200 2ms' : 'Error: No such container: api') },
      { match: /^docker exec -it (\S+) sh$/, out: (m, s) => `/app $  ← "${m[1]}" container-এর ভেতরে (exit দিয়ে বের হও)` },
      { match: /^docker volume create pgdata$/, out: (m, s) => { s.vol = true; return 'pgdata'; } },
      { match: /^docker volume ls$/, out: (m, s) => (s.vol ? 'DRIVER    VOLUME NAME\nlocal     pgdata' : 'DRIVER    VOLUME NAME') },
      { match: /^docker run -d --name db -e POSTGRES_PASSWORD=\S+ -v pgdata:\/var\/lib\/postgresql\/data postgres:16$/, out: (m, s) => { s.db = true; s.dbVol = true; return '5d7e8f9a0b1c…\n✓ Database-এর data এখন pgdata volume-এ'; }, flag: 'dbvol' },
      { match: /^docker run -d --name db -e POSTGRES_PASSWORD=\S+ postgres:16$/, out: (m, s) => { s.db = true; s.dbVol = false; return '5d7e8f9a0b1c…\n⚠ Volume ছাড়া! Container মুছলে data যাবে। -v pgdata:/var/lib/postgresql/data দিয়ে চালাও'; } },
      { match: /^docker rm -f db$/, out: (m, s) => { const had = s.dbVol; s.db = false; return had ? 'db\n✓ Container মুছল — কিন্তু data pgdata volume-এ নিরাপদ। নতুন container একই volume নিলে সব ফিরে আসবে।' : 'db\n💥 Volume ছিল না — সব data চিরতরে গেল!'; }, flag: 'rmdb' },
      { match: /^docker (stop|rm -f) (web|api)$/, out: (m, s) => { s[m[2]] = false; return m[2]; } },
    ],
    missions: [
      { id: 'hello', text: 'প্রথম container চালাও (hello-world)' },
      { id: 'nginx', text: 'nginx-কে 8080-এ চালিয়ে curl দিয়ে দেখো', check: (c, s) => s.web && s.flags.curl8080 },
      { id: 'cache', text: 'নিজের image build করো — দুবার, cache দেখো', check: (c, s) => s.builds >= 2 },
      { id: 'health', text: 'নিজের app চালিয়ে /health দেখো', check: (c, s) => s.api && /health/.test(c) },
      { id: 'volume', text: 'Volume সহ database চালাও, তারপর container মুছে দেখো data কোথায়', check: (c, s) => s.flags.dbvol && s.flags.rmdb },
    ],
  },

  // ─────────────────────────── Lesson 06 · CI/CD
  actions: {
    prompt: 'you@laptop:~/shop$',
    banner: '🔴 GitHub Actions: “CI” workflow ব্যর্থ হয়েছে (main, commit "Add discount")।\ngh (GitHub CLI) দিয়ে কারণ খোঁজো, ঠিক করো, push করে সবুজ করো। "help" দেখো।',
    help: 'gh run list\ngh run view 812\ngh run view 812 --log-failed\nnpm test\ncode src/cart.js       (editor-এ খোলো — এই lab-এ খুললেই ঠিক হয়)\ngit diff\ngit add src/cart.js\ngit commit -m "Fix total for empty cart"\ngit push\ngh run watch',
    init: (s) => { Object.assign(s, { fixed: false, staged: false, committed: false, pushed: false }); },
    commands: [
      { match: /^gh run list( --limit \d+)?$/, out: (m, s) => (s.pushed
        ? 'STATUS  TITLE                      WORKFLOW  BRANCH  EVENT  ID\n✓       Fix total for empty cart   CI        main    push   813\nX       Add discount               CI        main    push   812'
        : 'STATUS  TITLE                      WORKFLOW  BRANCH  EVENT  ID\nX       Add discount               CI        main    push   812\n✓       Update footer              CI        main    push   811'), flag: 'list' },
      { match: /^gh run view( 812)?$/, out: 'X main CI · 812\nJOBS\n✓ lint in 21s\nX test in 38s\n- deploy (skipped)   ← test লাল, তাই deploy চলেইনি — production নিরাপদ\n\nকোন test? দেখো: gh run view 812 --log-failed', flag: 'list' },
      { match: /^gh run view( 812)? --log-failed$/, out: 'test  Run npm test\n  FAIL tests/cart.test.js\n    ✕ total of an empty cart is 0\n      Expected: 0\n      Received: undefined\n        at tests/cart.test.js:8\n← খালি cart-এ total ভুল। src/cart.js দেখো', flag: 'log' },
      { match: /^npm test$/, out: (m, s) => (s.fixed
        ? 'PASS tests/cart.test.js\n  ✓ total of an empty cart is 0\n  ✓ total with discount\nTests: 7 passed, 7 total\n✓ নিজের machine-এ সবুজ'
        : 'FAIL tests/cart.test.js\n  ✕ total of an empty cart is 0\nTests: 1 failed, 6 passed, 7 total\n← CI-এর মতো একই ভুল — ভালো, এখন নিজের machine-এ ধরতে পারছ'), flag: 'test' },
      { match: /^(code|cat) src\/cart\.js$/, out: (m, s) => {
        if (m[1] === 'cat') return s.fixed ? 'export const total = (items) =>\n  items.reduce((sum, i) => sum + i.price * i.qty, 0);' : 'export const total = (items) =>\n  items.reduce((sum, i) => sum + i.price * i.qty);\n← reduce-এ শুরুর মান (0) নেই — খালি array-তে কিছুই ফেরে না';
        s.fixed = true;
        return '(editor) reduce-এর শেষে শুরুর মান 0 যোগ করে save করা হলো:\n- items.reduce((sum, i) => sum + i.price * i.qty);\n+ items.reduce((sum, i) => sum + i.price * i.qty, 0);\n← আগে npm test চালিয়ে নিশ্চিত হও';
      } },
      { match: /^git diff$/, out: (m, s) => (s.fixed ? 'diff --git a/src/cart.js b/src/cart.js\n-  items.reduce((sum, i) => sum + i.price * i.qty);\n+  items.reduce((sum, i) => sum + i.price * i.qty, 0);' : '(কোনো পরিবর্তন নেই)') },
      { match: /^git add (\.|-A|src\/cart\.js)$/, out: (m, s) => { if (!s.fixed) return '(বদলানোর কিছু নেই)'; s.staged = true; return '(staged)'; } },
      { match: /^git commit -m ["'](.+)["']$/, out: (m, s) => { if (!s.staged) return 'nothing added to commit'; s.committed = true; return `[main 4e7f21a] ${m[1]}\n 1 file changed, 1 insertion(+), 1 deletion(-)`; } },
      { match: /^git push$/, out: (m, s) => { if (!s.committed) return 'Everything up-to-date (আগে commit)'; s.pushed = true; return 'To github.com:you/shop.git\n   a91c3b2..4e7f21a  main -> main\n← push হতেই CI আবার চালু। দেখো: gh run watch'; }, flag: 'push' },
      { match: /^gh run watch( 813)?$/, out: (m, s) => (s.pushed
        ? 'Refreshing run status every 3 seconds…\n✓ lint   (19s)\n✓ test   (35s)\n✓ deploy (52s) → production\n✓ Run CI (813) completed with \'success\' 🎉'
        : 'X Run CI (812) completed with \'failure\'\n← আগে ঠিক করে push করো'), flag: 'watch' },
      { match: /^git rm tests\/cart\.test\.js$/, out: '✋ Test মুছলে লাল চিহ্ন যাবে, bug যাবে না — সোজা user-এর কাছে। এই lab-এ বন্ধ!' },
    ],
    missions: [
      { id: 'find', text: 'কোন run ব্যর্থ দেখো (gh run list / view)', check: (c, s) => s.flags.list },
      { id: 'log', text: 'ব্যর্থ step-এর log পড়ো (--log-failed)' },
      { id: 'fixtest', text: 'ঠিক করে নিজের machine-এ test সবুজ করো', check: (c, s) => s.fixed && /^npm test$/.test(c) },
      { id: 'push', text: 'Commit করে push করো', check: (c, s) => s.pushed },
      { id: 'green', text: 'নতুন run সবুজ হতে দেখো (gh run watch)', check: (c, s) => s.pushed && s.flags.watch },
    ],
  },

  // ─────────────────────────── Lesson 07 · Terraform
  terraform: {
    prompt: 'you@laptop:~/infra$',
    banner: 'Singapore region-এ একটা storage bucket আর একটা ছোট server বানাতে হবে — code (main.tf) লেখা আছে।\ninit → plan → apply, তারপর state, drift আর destroy। "help" দেখো।',
    help: 'ls\ncat main.tf\nterraform init\nterraform plan\nterraform apply\nterraform state list\nterraform output\nterraform destroy',
    init: (s) => { Object.assign(s, { inited: false, applied: false, drift: false, driftShown: false, driftFixed: false, destroyed: false }); },
    commands: [
      { match: /^ls$/, out: 'main.tf  outputs.tf' },
      { match: /^cat main\.tf$/, out: 'provider "aws" {\n  region = "ap-southeast-1"\n}\n\nresource "aws_s3_bucket" "media" {\n  bucket = "shopbd-media-2026"\n}\n\nresource "aws_instance" "api" {\n  ami           = "ami-0abc123example"\n  instance_type = "t3.small"\n  tags = { Name = "shop-api" }\n}' },
      { match: /^terraform init$/, out: (m, s) => { s.inited = true; return 'Initializing provider plugins...\n- Installing hashicorp/aws v5.82.0...\nTerraform has been successfully initialized!'; }, flag: 'init' },
      { match: /^terraform plan( -out=\S+)?$/, out: (m, s) => {
        if (!s.inited) return 'Error: Inconsistent dependency lock file\n  provider registry.terraform.io/hashicorp/aws: required but not installed\n← আগে terraform init';
        if (s.destroyed) return 'Plan: 2 to add, 0 to change, 0 to destroy.\n(সব মুছে ফেলা হয়েছে — আবার apply করলে নতুন করে বানাবে)';
        if (!s.applied) return 'Terraform will perform the following actions:\n\n  + aws_s3_bucket.media\n      bucket = "shopbd-media-2026"\n  + aws_instance.api\n      instance_type = "t3.small"\n\nPlan: 2 to add, 0 to change, 0 to destroy.\n← কিছুই বানানো হয়নি — শুধু দেখানো। পড়ে নিশ্চিত হয়ে apply করো।';
        if (s.drift) { s.driftShown = true; return '⚠ এর মধ্যে একজন teammate console-এ ঢুকে api server হাতে বড় করেছে!\n\n  ~ aws_instance.api\n      ~ instance_type = "t3.large" -> "t3.small"\n\nPlan: 0 to add, 1 to change, 0 to destroy.\n← Drift! Code-ই সত্যের উৎস — apply করলে code-এর মানে ফিরবে।'; }
        return 'No changes. Your infrastructure matches the configuration.\n✓ Code আর cloud হুবহু এক';
      }, flag: 'plan' },
      { match: /^terraform apply( -auto-approve| \S+\.tfplan)?$/, out: (m, s) => {
        if (!s.inited) return '← আগে terraform init';
        if (!s.applied || s.destroyed) { s.applied = true; s.destroyed = false; s.drift = true; return 'Plan: 2 to add, 0 to change, 0 to destroy.\nDo you want to perform these actions? Enter a value: yes\n\naws_s3_bucket.media: Creation complete after 2s\naws_instance.api: Creation complete after 31s [id=i-0abc123def]\n\nApply complete! Resources: 2 added, 0 changed, 0 destroyed.\n← এবার terraform state list দেখো, তারপর একটু পরে আবার plan'; }
        if (s.drift) {
          if (!s.driftShown) return '← আগে terraform plan দেখো — কিছু একটা বদলেছে কিনা';
          s.drift = false; s.driftFixed = true; return 'aws_instance.api: Modifying... [id=i-0abc123def]\naws_instance.api: Modifications complete after 48s\nApply complete! Resources: 0 added, 1 changed, 0 destroyed.\n✓ Code-এর মান (t3.small) ফিরল। হাতের বদল রাখতে চাইলে code-এ লিখে PR করো।';
        }
        return 'No changes. Apply complete! Resources: 0 added, 0 changed, 0 destroyed.';
      }, flag: 'apply' },
      { match: /^terraform state list$/, out: (m, s) => (s.applied && !s.destroyed ? 'aws_instance.api\naws_s3_bucket.media\n← Terraform-এর খাতা: code-এর এই নামগুলো cloud-এর আসল জিনিসের সাথে জোড়া' : '(state খালি)'), flag: 'state' },
      { match: /^terraform output$/, out: (m, s) => (s.applied && !s.destroyed ? 'api_public_ip = "13.212.48.91"\nbucket_name   = "shopbd-media-2026"' : '(কোনো output নেই)') },
      { match: /^terraform destroy( -auto-approve)?$/, out: (m, s) => { if (!s.applied || s.destroyed) return '(মোছার মতো কিছু নেই)'; s.destroyed = true; return 'Plan: 0 to add, 0 to change, 2 to destroy.\nEnter a value: yes\naws_instance.api: Destruction complete after 40s\naws_s3_bucket.media: Destruction complete after 1s\nDestroy complete! Resources: 2 destroyed.\n← শেখার পরিবেশ শেষে destroy = বিল বাঁচানো 💚'; }, flag: 'destroy' },
      { match: /^cat terraform\.tfstate$/, out: '{ "version": 4, "resources": [ … ] }\n⚠ এতে password বা গোপন তথ্যও থাকতে পারে — state কখনো Git-এ নয়, remote backend-এ রাখো।' },
    ],
    missions: [
      { id: 'init', text: 'terraform init' },
      { id: 'firstplan', text: 'Apply-এর আগে plan পড়ো', check: (c, s) => s.inited && !s.applied && /^terraform plan/.test(c) },
      { id: 'apply', text: 'Apply করে state list দেখো', check: (c, s) => s.applied && s.flags.state },
      { id: 'drift', text: 'আবার plan — drift ধরো আর apply করে ঠিক করো', check: (c, s) => s.driftFixed },
      { id: 'destroy', text: 'শেষে terraform destroy (বিল বাঁচাও)', check: (c, s) => s.destroyed },
    ],
  },

  // ─────────────────────────── Lesson 09 · kubectl
  kubectl: {
    prompt: 'you@laptop:~$',
    banner: '🚨 shop-api v1.5.0 deploy-এর পর থেকে একটা pod বারবার crash করছে, rollout আটকে আছে।\nkubectl দিয়ে কারণ খোঁজো, rollback করো, তারপর ভিড় সামলাতে scale করো। "help" দেখো।',
    help: 'kubectl get nodes\nkubectl get pods\nkubectl get deploy\nkubectl describe pod shop-api-7f4c9-xk2lp\nkubectl logs shop-api-7f4c9-xk2lp\nkubectl rollout status deploy/shop-api\nkubectl rollout history deploy/shop-api\nkubectl rollout undo deploy/shop-api\nkubectl scale deploy/shop-api --replicas=5',
    init: (s) => { Object.assign(s, { undo: false, replicas: 3 }); },
    commands: [
      { match: /^kubectl get nodes$/, out: 'NAME     STATUS   ROLES    AGE   VERSION\nnode-1   Ready    <none>   41d   v1.31.2\nnode-2   Ready    <none>   41d   v1.31.2\nnode-3   Ready    <none>   41d   v1.31.2\n✓ Machine-গুলো ঠিক আছে — সমস্যা app-এ' },
      { match: /^kubectl get pods( -o wide)?$/, out: (m, s) => {
        const old = Array.from({ length: s.replicas }, (_, i) => `shop-api-6d9b8-${['2xkqp', '9vfmz', 'h8wqt', 'p3n7c', 'r5t1y', 'w2e8u', 'k9j4m'][i]}   1/1   Running   0   2d`);
        return 'NAME                     READY  STATUS             RESTARTS  AGE\n' + old.join('\n') + (s.undo ? '' : '\nshop-api-7f4c9-xk2lp     0/1    CrashLoopBackOff   6         9m   ← নতুন v1.5.0');
      }, flag: 'pods' },
      { match: /^kubectl get (deploy|deployment|deployments)( shop-api)?$/, out: (m, s) => `NAME       READY   UP-TO-DATE   AVAILABLE   AGE\nshop-api   ${s.replicas}/${s.replicas}     ${s.undo ? s.replicas : 1}            ${s.replicas}           41d${s.undo ? '' : '\n← UP-TO-DATE 1 — নতুন version-এর মাত্র একটা pod, সেটাও অসুস্থ'}` },
      { match: /^kubectl describe pod shop-api-7f4c9-xk2lp$/, out: (m, s) => (s.undo ? 'Error from server (NotFound): pods "shop-api-7f4c9-xk2lp" not found  (rollback-এ মুছে গেছে)' : 'Name:     shop-api-7f4c9-xk2lp\nImage:    ghcr.io/shopbd/api:1.5.0\nState:    Waiting (CrashLoopBackOff)\nLast State: Terminated  Reason: Error  Exit Code: 1\nEvents:\n  Warning  BackOff  kubelet  Back-off restarting failed container api\n← container চালু হয়েই exit 1 — app-এর log দেখো'), flag: 'why' },
      { match: /^kubectl logs (shop-api-7f4c9-xk2lp|deploy\/shop-api)( --tail=\d+)?$/, out: (m, s) => (m[1].startsWith('deploy') || s.undo ? 'Server listening on :3000\nGET /health 200 1ms' : 'Error: Missing required environment variable PAYMENT_API_URL\n    at loadConfig (/app/config.js:14:11)\n← নতুন version-এ একটা নতুন setting লাগে, যেটা deploy-এ দেওয়া হয়নি।'), flag: 'why' },
      { match: /^kubectl rollout status deploy\/shop-api$/, out: (m, s) => (s.undo ? 'deployment "shop-api" successfully rolled out\n✓ সব pod সুস্থ' : 'Waiting for deployment "shop-api" rollout to finish: 1 out of 3 new replicas have been updated...\n(আটকে আছে — নতুন pod কখনো ready হচ্ছে না। পুরনো ৩টা চলছে বলে user-রা এখনো ঠিক আছে।)'), flag: 'status' },
      { match: /^kubectl rollout history deploy\/shop-api$/, out: 'REVISION  CHANGE-CAUSE\n1         image 1.4.2\n2         image 1.5.0   ← বর্তমান' },
      { match: /^kubectl rollout undo deploy\/shop-api$/, out: (m, s) => { s.undo = true; return 'deployment.apps/shop-api rolled back\n← আগের 1.4.2-এ ফেরা। এবার rollout status দেখো, তারপর শান্তভাবে PAYMENT_API_URL setting যোগ করে আবার deploy।'; }, flag: 'undo' },
      { match: /^kubectl scale deploy(ment)?\/shop-api --replicas=(\d+)$/, out: (m, s) => { const n = +m[2]; if (n < 1 || n > 7) return 'এই lab-এ ১ থেকে ৭-এর মধ্যে দাও'; s.replicas = n; return `deployment.apps/shop-api scaled\n← ${n}টা pod — kubectl get pods দিয়ে দেখো`; } },
      { match: /^kubectl get (svc|service|services)$/, out: 'NAME       TYPE        CLUSTER-IP     PORT(S)\nshop-api   ClusterIP   10.96.41.12    80/TCP\n← pod বদলালেও এই ঠিকানা বদলায় না' },
      { match: /^kubectl delete/, out: '✋ এই lab-এ delete বন্ধ — production-এ delete-এর আগে দুবার ভাবো।' },
    ],
    missions: [
      { id: 'look', text: 'Pod-গুলোর অবস্থা দেখো (kubectl get pods)', check: (c, s) => s.flags.pods },
      { id: 'why', text: 'অসুস্থ pod কেন crash করছে খোঁজো (describe / logs)' },
      { id: 'undo', text: 'আগের version-এ rollback করো' },
      { id: 'verify', text: 'Rollout status দিয়ে যাচাই করো', check: (c, s) => s.undo && /rollout status/.test(c) },
      { id: 'scale', text: 'ভিড় সামলাতে ৫টা replica করো', check: (c, s) => s.replicas >= 5 },
    ],
  },

  // ─────────────────────────── Lesson 10 · On-call
  oncall: {
    prompt: 'you@web-01:~/shop$',
    banner: '📟 Alert (02:47): "shop.example.com /health → 503" — ৫ মিনিট ধরে।\nServer-এ ঢুকেছ। নিচ থেকে উপরে কারণ খোঁজো আর ঠিক করো। "help" দেখো।',
    help: 'curl -s localhost:3000/health\ndocker compose ps\ndocker compose logs --tail=20 db\ndf -h\ndu -sh /var/log/app/*\nsudo truncate -s 0 /var/log/app/debug.log\ndocker compose restart db\nfree -h',
    init: (s) => { Object.assign(s, { freed: false, dbUp: false }); },
    commands: [
      { match: /^curl( -s)? (http:\/\/)?localhost:3000\/health\/?$/, out: (m, s) => (s.dbUp ? '{"status":"ok","uptime":4.2}\n✓ Site আবার সুস্থ! Alert নিজে থেকে resolve হবে। 🎉' : '{"status":"db_down"}   (HTTP 503)\n← App চলছে, কিন্তু database-এ পৌঁছাতে পারছে না'), flag: 'health' },
      { match: /^docker compose ps$/, out: (m, s) => `NAME     STATUS\napi      Up 3 days\ndb       ${s.dbUp ? 'Up 20 seconds (healthy)' : 'Restarting (1) 4 seconds ago   ← বারবার পড়ে যাচ্ছে!'}\ncache    Up 3 days`, flag: 'ps' },
      { match: /^docker compose logs( --tail=\d+)?( -f)? db$/, out: (m, s) => (s.dbUp ? 'database system is ready to accept connections' : 'PANIC:  could not write to file "pg_wal/xlogtemp.29": No space left on device\nLOG:  startup process was terminated\n← Disk ভরে গেছে!'), flag: 'cause' },
      { match: /^docker compose logs( --tail=\d+)? api$/, out: 'Error: connect ECONNREFUSED db:5432\nError: connect ECONNREFUSED db:5432\n← api ঠিক আছে, সমস্যা db-তে' },
      { match: /^df -h$/, out: (m, s) => `Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   ${s.freed ? '17G   23G  43%' : '40G     0 100%   ← একদম ভরা!'} /`, flag: 'disk' },
      { match: /^(sudo )?du -sh \/var\/log\/app\/\*$/, out: (m, s) => (s.freed ? '1.2G  /var/log/app/app.log\n0     /var/log/app/debug.log' : '1.2G  /var/log/app/app.log\n23G   /var/log/app/debug.log   ← debug log কেউ চালু রেখে গেছে, রোটেশন নেই'), flag: 'find' },
      { match: /^sudo truncate -s 0 \/var\/log\/app\/debug\.log$/, out: (m, s) => { s.freed = true; return '(debug.log খালি করা হলো — ২৩ GB মুক্ত)\n← এবার database আবার চালু করো'; }, flag: 'free' },
      { match: /^(sudo )?rm (-rf? )?\/var\/log\/app\/debug\.log$/, out: '⚠ চলমান process-এর খোলা ফাইল rm করলে disk-এর জায়গা প্রায়ই মুক্ত হয় না (process এখনো ধরে আছে)।\n← নিরাপদ উপায়: sudo truncate -s 0 /var/log/app/debug.log' },
      { match: /^docker compose restart db$/, out: (m, s) => { if (!s.freed) return 'Restarting db … done\n(কিন্তু কয়েক সেকেন্ড পরেই আবার Restarting — disk এখনো ভরা)'; s.dbUp = true; return 'Restarting db … done\n← compose ps আর /health দিয়ে যাচাই করো'; }, flag: 'restart' },
      { match: /^free -h$/, out: '               total   used   free\nMem:           3.8Gi  1.4Gi  2.1Gi\n✓ RAM ঠিক আছে' },
      { match: /^docker system prune/, out: '✋ Incident-এর মাঝে না বুঝে prune নয় — দরকারি image বা volume মুছে যেতে পারে। আগে কারণ খোঁজো (du -sh)।' },
    ],
    missions: [
      { id: 'health', text: 'উপসর্গ দেখো: /health কী বলছে?' },
      { id: 'ps', text: 'কোন service অসুস্থ? (docker compose ps)' },
      { id: 'cause', text: 'অসুস্থ service-এর log পড়ো' },
      { id: 'disk', text: 'Disk দেখো, কে জায়গা খাচ্ছে খোঁজো (df -h, du -sh)', check: (c, s) => s.flags.disk && s.flags.find },
      { id: 'fixed', text: 'জায়গা খালি করে db চালু করো, /health দিয়ে যাচাই', check: (c, s) => s.dbUp && /health/.test(c) },
    ],
  },
};
