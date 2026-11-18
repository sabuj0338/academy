// TerminalLab-এর জন্য সিমুলেটেড পরিবেশ। কোনো আসল command চলে না।
// commands: [{ match: RegExp, out: string | (m, state) => string }]
// missions: [{ id, text, check: (cmd, state) => bool }]

export const terminalPresets = {
  recon: {
    prompt: 'you@kali:~$',
    banner: 'Recon lab — target: shop.local (তোমার নিজের lab app)\nটিপ: curl -I, curl <url>, cat, grep ব্যবহার করো। "help" লিখে সব command দেখো।',
    help: 'curl -I https://shop.local\ncurl https://shop.local/robots.txt\ncurl https://shop.local/<path>\ncurl -s https://crt.sh/?q=shop.local\ngrep <word> <file>\nclear',
    commands: [
      { match: /^curl\s+(-s\s+)?-I\s+https?:\/\/shop\.local\/?$/, out: 'HTTP/2 200\nserver: nginx/1.18.0 (Ubuntu)\nx-powered-by: Next.js\ncontent-type: text/html; charset=utf-8\nset-cookie: sid=9f2…; Path=/', flag: 'headers' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/robots\.txt$/, out: 'User-agent: *\nDisallow: /internal-admin-2024/\nDisallow: /api/v1/debug\nSitemap: https://shop.local/sitemap.xml', flag: 'robots' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/\.git\/(HEAD|config)$/, out: (m) => (m[2] === 'HEAD' ? 'ref: refs/heads/main' : '[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = https://github.com/shopbd/web.git'), flag: 'git' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/\.env$/, out: '404 Not Found  (ভালো! .env web root-এ নেই)' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/_next\/static\/chunks\/main\.js\.map$/, out: '{"version":3,"sources":["webpack://src/lib/api.ts","webpack://src/app/admin/page.tsx"],\n"sourcesContent":["export const API = \\"https://api.shop.local\\";\\n// TODO remove before prod\\nexport const STAGING_KEY = \\"stg_live_88af…\\";", …]}', flag: 'sourcemap' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/_next\/static\/chunks\/main\.js$/, out: '(minified)…fetch("/api/v1/orders")…fetch("/api/v1/admin/export")…\n//# sourceMappingURL=main.js.map', flag: 'js' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/?$/, out: '<!DOCTYPE html><html><head><script src="/_next/static/chunks/main.js"></script>…' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/internal-admin-2024\/?$/, out: 'HTTP 200 — <title>Admin Login</title> (কোনো rate limit / 2FA নেই)' },
      { match: /^curl\s+(-s\s+)?https?:\/\/shop\.local\/api\/v1\/debug$/, out: '{"env":"production","db_host":"10.0.0.4","go_version":"go1.21.0","uptime":"41d"}' },
      { match: /^curl\s+(-s\s+)?["']?https?:\/\/crt\.sh\/\?q=(%25\.)?shop\.local["']?$/, out: 'shop.local\nwww.shop.local\napi.shop.local\nstaging.shop.local      ← staging, হয়তো auth ছাড়া!\ngrafana.shop.local      ← monitoring dashboard', flag: 'subdomain' },
      { match: /^curl\s+.*$/, out: '404 Not Found' },
    ],
    missions: [
      { id: 'headers', text: 'Response header থেকে server version খুঁজে বের করো (curl -I)' },
      { id: 'robots', text: 'robots.txt থেকে লুকানো admin path বের করো' },
      { id: 'js', text: 'Homepage-এর JS bundle খোলো (main.js)' },
      { id: 'sourcemap', text: 'Source map (.js.map) থেকে leaked key খুঁজে বের করো' },
      { id: 'git', text: 'Exposed .git folder পরীক্ষা করো (/.git/HEAD বা /.git/config)' },
      { id: 'subdomain', text: 'crt.sh দিয়ে subdomain খোঁজো' },
    ],
  },

  harden: {
    prompt: 'root@vps-01:~#',
    banner: 'Ubuntu 24.04 LTS — নতুন VPS। কয়েকটি সমস্যা আছে।\n"help" লিখে command দেখো।',
    help: 'apt update && apt upgrade -y\nls -la /opt/app\nchmod <mode> <file>\nfind / -perm -4000 -type f 2>/dev/null\nchmod u-s <file>\nss -tulpn\nsystemctl disable --now <service>\nadduser deploy\nusermod -aG sudo deploy\napt install unattended-upgrades fail2ban -y\nclear',
    init: (s) => { s.env = '777'; s.suid = true; s.telnet = true; s.updated = false; s.user = false; s.sudo = false; s.uu = false; },
    commands: [
      { match: /^apt(-get)? update( && apt(-get)? upgrade -y)?$/, out: (m, s) => { if (m[0].includes('upgrade')) { s.updated = true; return 'Get:1 http://archive.ubuntu.com noble-security InRelease\n…\n47 upgraded, 0 newly installed.\nopenssl, openssh-server, sudo — security patch প্রয়োগ হয়েছে ✓'; } return 'Reading package lists… 47 packages can be upgraded.'; } },
      { match: /^apt(-get)? upgrade( -y)?$/, out: (m, s) => { s.updated = true; return '47 upgraded ✓'; } },
      { match: /^ls -la? \/opt\/app\/?$/, out: (m, s) => `total 24\ndrwxr-xr-x 3 root root 4096 .\n-rwxr-xr-x 1 root root 9.1M api\n-${s.env === '600' ? 'rw-------' : 'rwxrwxrwx'} 1 root root  412 .env   ${s.env === '600' ? '✓' : '← সবাই পড়তে-লিখতে পারে!'}\ndrwxr-xr-x 2 root root 4096 uploads` },
      { match: /^chmod (\d{3}) \/opt\/app\/\.env$/, out: (m, s) => { s.env = m[1]; return m[1] === '600' || m[1] === '400' ? '✓ এখন শুধু owner পড়তে পারে' : `permission ${m[1]} সেট হলো (600 বা 400 হওয়া উচিত)`; } },
      { match: /^find \/ -perm -(4000|u=s) -type f( 2>\/dev\/null)?$/, out: (m, s) => '/usr/bin/sudo\n/usr/bin/passwd\n/usr/bin/su\n/usr/bin/mount' + (s.suid ? '\n/usr/local/bin/backup-tool     ← অস্বাভাবিক! কেউ SUID দিয়েছে' : '') },
      { match: /^chmod (u-s|-s|0?755) \/usr\/local\/bin\/backup-tool$/, out: (m, s) => { s.suid = false; return '✓ SUID bit সরানো হলো'; } },
      { match: /^ss -tulpn$|^netstat -tulpn$/, out: (m, s) => 'Netid State  Local Address:Port  Process\ntcp   LISTEN 0.0.0.0:22          sshd\ntcp   LISTEN 127.0.0.1:3000      api\n' + (s.telnet ? 'tcp   LISTEN 0.0.0.0:23          inetd (telnet)   ← plain text remote login!' : '') },
      { match: /^systemctl disable --now (inetd|telnet|openbsd-inetd)(\.service)?$/, out: (m, s) => { s.telnet = false; return `Removed /etc/systemd/system/multi-user.target.wants/${m[1]}.service ✓`; } },
      { match: /^adduser deploy$/, out: (m, s) => { s.user = true; return 'Adding user `deploy\' …\nNew password: ********\npasswd: password updated successfully ✓'; } },
      { match: /^usermod -aG sudo deploy$/, out: (m, s) => { if (!s.user) return 'usermod: user \'deploy\' does not exist'; s.sudo = true; return '✓ deploy এখন sudo group-এ'; } },
      { match: /^apt(-get)? install (-y )?unattended-upgrades( fail2ban)?( -y)?$/, out: (m, s) => { s.uu = true; return 'Setting up unattended-upgrades …\n' + (m[3] ? 'Setting up fail2ban … sshd jail enabled ✓\n' : '') + '✓ Security update এখন স্বয়ংক্রিয়'; } },
      { match: /^whoami$/, out: 'root' },
      { match: /^sudo -l$/, out: 'User root may run the following commands: (ALL : ALL) ALL' },
    ],
    missions: [
      { id: 'upd', text: 'System update ও upgrade করো', check: (c, s) => s.updated },
      { id: 'env', text: '/opt/app/.env-এর permission ঠিক করো (ls দিয়ে দেখো)', check: (c, s) => s.env === '600' || s.env === '400' },
      { id: 'suid', text: 'অস্বাভাবিক SUID binary খুঁজে SUID সরাও', check: (c, s) => !s.suid },
      { id: 'port', text: 'Listening port দেখো এবং telnet (inetd) service বন্ধ করো', check: (c, s) => !s.telnet },
      { id: 'user', text: '"deploy" নামে non-root user বানাও এবং sudo দাও', check: (c, s) => s.user && s.sudo },
      { id: 'uu', text: 'unattended-upgrades (ও fail2ban) install করো', check: (c, s) => s.uu },
    ],
  },

  psql: {
    prompt: 'shop=>',
    banner: 'App-এ SQLi bug আছে। Attacker যা চাইবে তা ধরে নাও এখানে চলবে।\nপ্রথমে "\\c superuser" (দুর্বল setup), তারপর "\\c app_rw" (least privilege) দিয়ে একই query চালাও।\nCommands: \\c <role>, \\du, SELECT …, DROP TABLE users;, COPY … TO PROGRAM …, help',
    help: '\\c superuser   |   \\c app_rw\n\\du\nSELECT * FROM users;\nSELECT * FROM pg_shadow;\nDROP TABLE orders;\nCOPY (SELECT 1) TO PROGRAM \'id\';\nCREATE TABLE x(a int);',
    init: (s) => { s.role = 'superuser'; s.tried = {}; },
    commands: [
      { match: /^\\c (superuser|postgres|app_rw)$/i, out: (m, s) => { s.role = m[1].toLowerCase() === 'app_rw' ? 'app_rw' : 'superuser'; return `You are now connected as "${s.role === 'app_rw' ? 'app_rw' : 'postgres'}".`; } },
      { match: /^\\du$/, out: ' Role name | Attributes\n-----------+-----------------------------------\n postgres  | Superuser, Create role, Create DB\n app_rw    | (none)' },
      { match: /^select \* from users;?$/i, out: (m, s) => { s.tried[s.role + 'users'] = 1; return ' id | email            | password_hash\n----+------------------+--------------\n  1 | ceo@shop.local   | $2b$12$…\n  7 | rahim@mail.com   | $2b$12$…\n(18422 rows)\n' + (s.role === 'app_rw' ? 'ℹ app_rw-এরও users টেবিলে SELECT আছে (app-এর দরকার) — তাই SQLi সবসময় ক্ষতিকর। Least privilege ক্ষতি সীমিত করে, শূন্য করে না।' : ''); } },
      { match: /^select \* from pg_shadow;?$/i, out: (m, s) => { s.tried[s.role + 'shadow'] = 1; return s.role === 'app_rw' ? 'ERROR:  permission denied for view pg_shadow ✓' : ' usename  | passwd\n----------+------------------------------\n postgres | SCRAM-SHA-256$4096:…\n app_rw   | SCRAM-SHA-256$4096:…   💥 সব DB user-এর hash!'; } },
      { match: /^drop table \w+;?$/i, out: (m, s) => { s.tried[s.role + 'drop'] = 1; return s.role === 'app_rw' ? 'ERROR:  must be owner of table orders ✓' : 'DROP TABLE  💥 orders টেবিল চিরতরে গেল।'; } },
      { match: /^copy .* to program .*;?$/i, out: (m, s) => { s.tried[s.role + 'rce'] = 1; return s.role === 'app_rw' ? 'ERROR:  permission denied to COPY to or from an external program ✓\nHINT: Only roles with privileges of the "pg_execute_server_program" role may COPY to or from an external program.' : 'uid=113(postgres) gid=120(postgres) groups=120(postgres)\n💥 Database থেকে server-এ OS command চলছে (RCE)!'; } },
      { match: /^create table .*;?$/i, out: (m, s) => (s.role === 'app_rw' ? 'ERROR:  permission denied for schema public ✓' : 'CREATE TABLE') },
    ],
    missions: [
      { id: 'su-rce', text: 'Superuser হিসেবে COPY … TO PROGRAM দিয়ে OS command চালাও', check: (c, s) => s.tried.superuserrce },
      { id: 'su-drop', text: 'Superuser হিসেবে একটি টেবিল DROP করো', check: (c, s) => s.tried.superuserdrop },
      { id: 'rw', text: '\\c app_rw দিয়ে connect করো', check: (c, s) => s.role === 'app_rw' },
      { id: 'rw-rce', text: 'app_rw হিসেবে একই RCE ও DROP চেষ্টা করো — ব্যর্থ হতে দেখো', check: (c, s) => s.tried.app_rwrce && s.tried.app_rwdrop },
    ],
  },

  redis: {
    prompt: 'attacker@vps:~$',
    banner: 'Target: 203.0.113.50 (তোমার নিজের lab Redis, ভুল config)\nপ্রথমে attacker হিসেবে: redis-cli -h 203.0.113.50\nতারপর defender হিসেবে: "secure" লিখে config ঠিক করো এবং আবার চেষ্টা করো। "help"',
    help: 'nmap -p 6379 203.0.113.50\nredis-cli -h 203.0.113.50 PING\nredis-cli -h 203.0.113.50 KEYS *\nredis-cli -h 203.0.113.50 GET session:7f3a\nredis-cli -h 203.0.113.50 CONFIG SET dir /root/.ssh\nredis-cli -h 203.0.113.50 FLUSHALL\nsecure',
    init: (s) => { s.secure = false; s.t = {}; },
    commands: [
      { match: /^nmap -p ?6379 203\.0\.113\.50$/, out: (m, s) => (s.secure ? 'PORT     STATE    SERVICE\n6379/tcp filtered redis ✓' : 'PORT     STATE SERVICE\n6379/tcp open  redis   ← internet-এ খোলা!') },
      { match: /^redis-cli -h 203\.0\.113\.50 (.+)$/i, out: (m, s) => {
        if (s.secure) { s.t.blocked = 1; return 'Could not connect to Redis at 203.0.113.50:6379: Connection timed out ✓\n(bind 127.0.0.1 + firewall — বাইরে থেকে পৌঁছানোই যায় না)'; }
        const c = m[1].trim();
        if (/^ping$/i.test(c)) { s.t.ping = 1; return 'PONG   ← password ছাড়াই উত্তর!'; }
        if (/^keys \*$/i.test(c)) { s.t.keys = 1; return '1) "session:7f3a"\n2) "session:91bc"\n3) "cache:product:22"\n4) "otp:01711xxxxxx"'; }
        if (/^get session:\w+$/i.test(c)) { s.t.sess = 1; return '"{\\"user_id\\":1,\\"role\\":\\"admin\\",\\"exp\\":1794400000}"   💥 admin session — cookie-তে বসালেই admin!'; }
        if (/^config set dir/i.test(c)) { s.t.cfg = 1; return 'OK   💥 এখন dbfilename authorized_keys করে SAVE দিলে attacker SSH key লিখে ফেলবে।'; }
        if (/^flushall$/i.test(c)) { s.t.flush = 1; return 'OK   💥 সব session ও cache মুছে গেল — সব user logged out।'; }
        return '(error) ERR unknown command';
      } },
      { match: /^secure$/i, out: (m, s) => { s.secure = true; return 'redis.conf আপডেট:\n  bind 127.0.0.1 -::1\n  protected-mode yes\n  requirepass ********************************\n  rename-command CONFIG ""\n  rename-command FLUSHALL ""\nufw deny 6379 ✓\nsystemctl restart redis ✓'; } },
    ],
    missions: [
      { id: 'ping', text: 'Password ছাড়া PING করো', check: (c, s) => s.t.ping },
      { id: 'sess', text: 'KEYS * দিয়ে key দেখো এবং একটি session চুরি করো', check: (c, s) => s.t.keys && s.t.sess },
      { id: 'cfg', text: 'CONFIG SET dir দিয়ে বোঝো কীভাবে file লেখা যায়', check: (c, s) => s.t.cfg },
      { id: 'secure', text: '"secure" দিয়ে Redis ঠিক করো এবং আবার connect চেষ্টা করো', check: (c, s) => s.secure && s.t.blocked },
    ],
  },

  secrets: {
    prompt: 'you@laptop:~/shopbd$',
    banner: 'Repository: shopbd (React + Node.js)। কেউ একটি secret push করেছিল।\n"help" দেখো।',
    help: 'ls -la\ncat .gitignore\ngit log --oneline\ngit show <commit>\ngitleaks detect --source .\ngrep -r "NEXT_PUBLIC_" .env*\nrotate stripe\nrotate aws\necho ".env" >> .gitignore',
    init: (s) => { s.gi = false; s.r = {}; s.t = {}; },
    commands: [
      { match: /^ls -la?$/, out: 'drwxr-xr-x  .git\n-rw-r--r--  .env.local\n-rw-r--r--  .env.example\n-rw-r--r--  .gitignore\ndrwxr-xr-x  web/\ndrwxr-xr-x  api/' },
      { match: /^cat \.gitignore$/, out: (m, s) => 'node_modules\n.next\ndist' + (s.gi ? '\n.env\n.env.*\n!.env.example' : '\n               ← .env নেই!') },
      { match: /^git log( --oneline)?$/, out: '9c1e2aa fix: checkout bug\n4b7d0f1 remove env file\na13f9e2 add payment integration\n77de001 init' },
      { match: /^git show a13f9e2$/, out: (m, s) => { s.t.found = 1; return 'commit a13f9e2  add payment integration\n+++ b/.env\n+STRIPE_SECRET_KEY=sk_live_51Hx9EXAMPLEa8Kq\n+AWS_ACCESS_KEY_ID=AKIA5EXAMPLE7Q\n+AWS_SECRET_ACCESS_KEY=wJalrX…EXAMPLE\n💥 পরের commit-এ মুছলেও এটা history-তে চিরকাল আছে।'; } },
      { match: /^git show 4b7d0f1$/, out: 'commit 4b7d0f1  remove env file\n--- a/.env\n(deleted)   ← মুছেছে, কিন্তু history-তে রয়ে গেছে' },
      { match: /^git show \w+$/, out: '(এই commit-এ secret নেই)' },
      { match: /^gitleaks detect( --source \.)?( -v)?$/, out: (m, s) => { s.t.leaks = 1; return 'Finding:     STRIPE_SECRET_KEY=sk_live_51Hx9…\nRuleID:      stripe-access-token\nCommit:      a13f9e2\n\nFinding:     AWS_ACCESS_KEY_ID=AKIA5EXAMPLE7Q\nRuleID:      aws-access-token\nCommit:      a13f9e2\n\nFinding:     NEXT_PUBLIC_MAPS_SECRET=ms_9f…\nFile:        .env.local\n\n3 leaks found'; } },
      { match: /^grep -r "?NEXT_PUBLIC_"? \.env\*?$/, out: (m, s) => { s.t.np = 1; return '.env.local:NEXT_PUBLIC_API_URL=https://api.shop.local\n.env.local:NEXT_PUBLIC_MAPS_SECRET=ms_9f…   ← "SECRET" কিন্তু browser bundle-এ যাবে!'; } },
      { match: /^rotate (stripe|aws)$/i, out: (m, s) => { s.r[m[1].toLowerCase()] = 1; return `✓ ${m[1]} dashboard-এ পুরনো key revoke, নতুন key তৈরি ও secret manager-এ রাখা হলো।\n✓ ${m[1] === 'aws' ? 'CloudTrail' : 'Stripe logs'}-এ অপব্যবহারের চিহ্ন খোঁজা হচ্ছে…`; } },
      { match: /^echo "?\.env"? >> \.gitignore$/, out: (m, s) => { s.gi = true; return ''; } },
    ],
    missions: [
      { id: 'find', text: 'git log ও git show দিয়ে leaked secret-এর commit খুঁজে বের করো', check: (c, s) => s.t.found },
      { id: 'leaks', text: 'gitleaks দিয়ে পুরো repository scan করো', check: (c, s) => s.t.leaks },
      { id: 'np', text: 'NEXT_PUBLIC_ দিয়ে browser-এ যাওয়া secret খুঁজে বের করো', check: (c, s) => s.t.np },
      { id: 'rotate', text: 'Stripe ও AWS key rotate করো (সবার আগে!)', check: (c, s) => s.r.stripe && s.r.aws },
      { id: 'gi', text: '.env কে .gitignore-এ যোগ করো', check: (c, s) => s.gi },
    ],
  },
  // ───────── Networking track
  ipnet: {
    prompt: 'you@laptop:~$',
    banner: 'তোমার laptop-এর network দেখো। "help" লিখলে command তালিকা।',
    help: 'ip addr\nip route\nping -c 3 192.168.1.1\nping -c 3 8.8.8.8\ncurl ifconfig.me\ntraceroute google.com\nip -6 addr',
    commands: [
      { match: /^(ip (a|addr)( show)?|ifconfig)$/, out: '1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8 scope host lo\n2: wlan0: <BROADCAST,MULTICAST,UP>\n    link/ether aa:bb:cc:00:00:05\n    inet 192.168.1.5/24 brd 192.168.1.255 scope global dynamic wlan0   ← private IP (DHCP থেকে)\n    inet6 fe80::a8bb:ccff:fe00:5/64 scope link', flag: 'addr' },
      { match: /^ip -6 (a|addr)$/, out: '2: wlan0\n    inet6 2400:c600:1234:5::a/64 scope global   ← public IPv6!\n    inet6 fe80::a8bb:ccff:fe00:5/64 scope link    ← link-local', flag: 'v6' },
      { match: /^(ip (r|route)|route -n|netstat -rn)$/, out: 'default via 192.168.1.1 dev wlan0      ← default gateway (router)\n192.168.1.0/24 dev wlan0 proto kernel   ← নিজের LAN, সরাসরি', flag: 'route' },
      { match: /^ping( -c \d+)? 192\.168\.1\.1$/, out: 'PING 192.168.1.1: 56 data bytes\n64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=2.1 ms\n64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.8 ms\n--- 0% packet loss, avg 1.9 ms (বাড়ির ভেতরে, খুব কাছে)', flag: 'pinggw' },
      { match: /^ping( -c \d+)? (8\.8\.8\.8|google\.com)$/, out: 'PING 8.8.8.8: 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=38.4 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=37.9 ms\n--- 0% packet loss, avg 38 ms (internet পার হয়ে)', flag: 'ping' },
      { match: /^curl (-s )?(ifconfig\.me|icanhazip\.com|api\.ipify\.org)$/, out: '103.110.5.9      ← এটাই তোমার public IP (router-এর WAN)। laptop-এর 192.168.1.5 বাইরে কেউ দেখে না — NAT!', flag: 'public' },
      { match: /^(traceroute|tracert|mtr -r) google\.com$/, out: 'traceroute to google.com (142.250.193.14), 30 hops max\n 1  192.168.1.1     1.9 ms   বাড়ির router\n 2  100.64.12.1     6.2 ms   ISP (CGNAT)\n 3  103.4.145.9     8.0 ms   ISP core, ঢাকা\n 4  * * *                    (ICMP বন্ধ — স্বাভাবিক)\n 5  72.14.215.85   35.1 ms   Google edge, সিঙ্গাপুর\n 6  142.250.193.14 37.6 ms   google.com', flag: 'trace' },
    ],
    missions: [
      { id: 'addr', text: 'নিজের private IP ও subnet খুঁজে বের করো (ip addr)' },
      { id: 'route', text: 'Default gateway কোনটি? (ip route)' },
      { id: 'pinggw', text: 'Router-কে ping করো' },
      { id: 'ping', text: 'Internet (8.8.8.8)-কে ping করো — latency তুলনা করো' },
      { id: 'public', text: 'নিজের public IP দেখো' },
      { id: 'trace', text: 'google.com পর্যন্ত পথের প্রতিটি router দেখো (traceroute)' },
    ],
  },
  dig: {
    prompt: 'you@laptop:~$',
    banner: 'DNS lab — dig দিয়ে domain-এর সব record খুঁজে দেখো।',
    help: 'dig shop.example.com A\ndig shop.example.com AAAA\ndig www.shop.example.com CNAME\ndig shop.example.com MX\ndig shop.example.com NS\ndig shop.example.com TXT\ndig +trace shop.example.com\nnslookup shop.example.com',
    commands: [
      { match: /^dig (\+short )?shop\.example\.com( A)?$/, out: ';; ANSWER SECTION:\nshop.example.com.   300   IN   A   203.0.113.10\n\n;; Query time: 24 msec  (TTL 300 = ৫ মিনিট cache থাকবে)', flag: 'a' },
      { match: /^dig shop\.example\.com AAAA$/, out: ';; ANSWER SECTION:\nshop.example.com.   300   IN   AAAA   2001:db8::10   ← IPv6 ঠিকানা', flag: 'aaaa' },
      { match: /^dig www\.shop\.example\.com( CNAME)?$/, out: ';; ANSWER SECTION:\nwww.shop.example.com.  3600  IN  CNAME  shop.example.com.   ← ডাকনাম (alias)\nshop.example.com.      300   IN  A      203.0.113.10', flag: 'cname' },
      { match: /^dig shop\.example\.com MX$/, out: ';; ANSWER SECTION:\nshop.example.com.  3600  IN  MX  10 mx1.mailhost.net.   ← email কোথায় যাবে (কম সংখ্যা = আগে)\nshop.example.com.  3600  IN  MX  20 mx2.mailhost.net.', flag: 'mx' },
      { match: /^dig shop\.example\.com NS$/, out: ';; ANSWER SECTION:\nshop.example.com.  86400  IN  NS  ada.ns.cloudflare.com.   ← কে এই domain-এর "আসল" উত্তরদাতা\nshop.example.com.  86400  IN  NS  bob.ns.cloudflare.com.', flag: 'ns' },
      { match: /^dig shop\.example\.com TXT$/, out: ';; ANSWER SECTION:\nshop.example.com. 3600 IN TXT "v=spf1 include:mailhost.net -all"   ← email spoofing ঠেকাতে SPF\nshop.example.com. 3600 IN TXT "google-site-verification=abc123"', flag: 'txt' },
      { match: /^dig \+trace shop\.example\.com$/, out: '.                    518400 IN NS  a.root-servers.net.     ① Root: ".com কে জানে? TLD server-কে জিজ্ঞেস করো"\ncom.                 172800 IN NS  a.gtld-servers.net.     ② .com TLD: "example.com-এর NS হলো cloudflare"\nexample.com.          86400 IN NS  ada.ns.cloudflare.com.  ③ Authoritative: আসল উত্তর ↓\nshop.example.com.       300 IN A   203.0.113.10', flag: 'trace' },
      { match: /^nslookup shop\.example\.com$/, out: 'Server:   1.1.1.1\nAddress:  1.1.1.1#53\n\nNon-authoritative answer:   ← resolver-এর cache থেকে\nName:    shop.example.com\nAddress: 203.0.113.10', flag: 'ns2' },
      { match: /^dig .*/, out: ';; status: NXDOMAIN  — এমন domain/record নেই। নামের বানান দেখো।' },
    ],
    missions: [
      { id: 'a', text: 'A record — IPv4 ঠিকানা' },
      { id: 'cname', text: 'www-এর CNAME (alias) দেখো' },
      { id: 'mx', text: 'MX — email server খুঁজে বের করো' },
      { id: 'ns', text: 'NS — কোন DNS provider authoritative?' },
      { id: 'trace', text: 'dig +trace দিয়ে root → TLD → authoritative যাত্রা দেখো' },
    ],
  },
  ports: {
    prompt: 'you@server:~$',
    banner: 'এই server-এ কোন port-এ কে শুনছে (listening)? আর কোন connection চলছে?',
    help: 'ss -tlnp\nss -tn state established\nss -ulnp\ncurl -I http://localhost:3000\nnc -zv localhost 5432\nsudo lsof -i :443',
    commands: [
      { match: /^(sudo )?(ss|netstat) -(tlnp|tulpn|tlpn|ltnp)$/, out: 'State   Local Address:Port   Process\nLISTEN  0.0.0.0:22           sshd        ← SSH (সবার জন্য খোলা)\nLISTEN  0.0.0.0:80           nginx\nLISTEN  0.0.0.0:443          nginx       ← HTTPS\nLISTEN  127.0.0.1:3000       go-fiber    ← শুধু localhost (ভালো! nginx এর মাধ্যমে আসে)\nLISTEN  127.0.0.1:6379       redis\nLISTEN  0.0.0.0:5432         postgres    ⚠ সবার জন্য খোলা! 127.0.0.1 হওয়া উচিত', flag: 'listen' },
      { match: /^(sudo )?ss -tn( state established)?$/, out: 'State  Local:Port          Peer:Port\nESTAB  10.0.0.4:443         103.110.5.9:51544    ← একজন visitor\nESTAB  10.0.0.4:443         37.111.2.80:60211    ← আরেকজন, একই 443 port!\nESTAB  127.0.0.1:41822      127.0.0.1:3000       ← nginx → Node app\nESTAB  10.0.0.4:22          103.110.5.9:50022    ← তোমার SSH\n\n💡 একই server port-এ হাজার connection — কারণ socket = (src IP, src port, dst IP, dst port, protocol) — ৫টি মিলেই আলাদা।', flag: 'estab' },
      { match: /^(sudo )?ss -ulnp$/, out: 'State   Local Address:Port   Process\nUNCONN  127.0.0.53:53        systemd-resolved   ← DNS (UDP)\nUNCONN  0.0.0.0:51820        wireguard          ← VPN (UDP)', flag: 'udp' },
      { match: /^curl -I http:\/\/localhost:3000\/?$/, out: 'HTTP/1.1 200 OK\nContent-Type: application/json\nX-Powered-By: Express', flag: 'curl' },
      { match: /^nc -zv localhost 5432$/, out: 'Connection to localhost 5432 port [tcp/postgresql] succeeded!', flag: 'nc' },
      { match: /^nc -zv localhost (\d+)$/, out: (m) => `nc: connect to localhost port ${m[1]} (tcp) failed: Connection refused  ← কেউ শুনছে না` },
      { match: /^sudo lsof -i :443$/, out: 'COMMAND  PID  USER  FD  TYPE  NODE NAME\nnginx    812  root  6u  IPv4  TCP *:https (LISTEN)\nnginx    813  www   6u  IPv4  TCP 10.0.0.4:https->103.110.5.9:51544 (ESTABLISHED)', flag: 'lsof' },
    ],
    missions: [
      { id: 'listen', text: 'Listening TCP port-গুলো দেখো — কোনটা বিপজ্জনকভাবে খোলা?' },
      { id: 'estab', text: 'Established connection দেখো — একই port-এ অনেক client' },
      { id: 'udp', text: 'UDP port-গুলোও দেখো' },
      { id: 'nc', text: 'nc দিয়ে একটি port খোলা কি না যাচাই করো' },
    ],
  },
  troubleshoot: {
    prompt: 'you@laptop:~$',
    banner: '🚨 Incident: "shop.example.com খুলছে না!" — নিচ থেকে উপরে (bottom-up) layer ধরে সমস্যা খোঁজো।',
    help: 'ping -c 3 8.8.8.8\ndig +short shop.example.com\nping -c 3 shop.example.com\ncurl -I https://shop.example.com\nnc -zv shop.example.com 443\nssh shop "ss -tlnp | grep 443"\nssh shop "systemctl status nginx"\nssh shop "sudo systemctl start nginx"\nsudo tcpdump -i any port 443 -c 5',
    init: (s) => { s.nginx = false; },
    commands: [
      { match: /^ping( -c \d+)? 8\.8\.8\.8$/, out: '64 bytes from 8.8.8.8: ttl=117 time=38 ms ×3 — 0% loss\n✓ L3: আমার internet ঠিক আছে', flag: 'net' },
      { match: /^dig( \+short)? shop\.example\.com$/, out: '203.0.113.10\n✓ DNS ঠিক আছে — নাম থেকে IP পাওয়া যাচ্ছে', flag: 'dns' },
      { match: /^ping( -c \d+)? shop\.example\.com$/, out: '64 bytes from 203.0.113.10: ttl=52 time=44 ms ×3\n✓ Server-টা বেঁচে আছে (ICMP পৌঁছায়)', flag: 'ping' },
      { match: /^curl (-I |-v )?https:\/\/shop\.example\.com\/?$/, out: (m, s) => (s.nginx ? 'HTTP/2 200\nserver: nginx\n✓ Site আবার চালু! 🎉' : 'curl: (7) Failed to connect to shop.example.com port 443: Connection refused\n✖ Server আছে, কিন্তু 443-এ কেউ শুনছে না!'), flag: 'curl' },
      { match: /^nc -zv shop\.example\.com 443$/, out: (m, s) => (s.nginx ? 'succeeded!' : 'nc: connect to port 443 (tcp) failed: Connection refused'), flag: 'nc' },
      { match: /^ssh shop "?ss -tlnp( \| grep 443)?"?$/, out: (m, s) => (s.nginx ? 'LISTEN 0.0.0.0:443 nginx' : '(কিছুই নেই — 443-এ কোনো process listening না)'), flag: 'status' },
      { match: /^ssh shop "?systemctl status nginx"?$/, out: (m, s) => (s.nginx ? '● nginx.service — active (running)' : '● nginx.service - A high performance web server\n   Active: failed (Result: exit-code)\n   nginx: [emerg] unknown directive "ssl_certificat" in /etc/nginx/sites-enabled/shop:12\n✖ Config-এ টাইপো! (ধরো তুমি ঠিক করে দিলে)'), flag: 'status' },
      { match: /^ssh shop "?sudo systemctl (re)?start nginx"?$/, out: (m, s) => { s.nginx = true; return '(config ঠিক করা হলো) nginx -t: syntax is ok\n● nginx started'; }, flag: 'fix' },
      { match: /^sudo tcpdump -i any port 443( -c \d+)?$/, out: (m, s) => (s.nginx ? '12:01:03 IP 192.168.1.5.51544 > 203.0.113.10.443: Flags [S]\n12:01:03 IP 203.0.113.10.443 > 192.168.1.5.51544: Flags [S.]   ← SYN-ACK ফিরে এলো\n12:01:03 IP 192.168.1.5.51544 > 203.0.113.10.443: Flags [.]' : '12:00:41 IP 192.168.1.5.51544 > 203.0.113.10.443: Flags [S]\n12:00:41 IP 203.0.113.10.443 > 192.168.1.5.51544: Flags [R.]   ← RST! server বলছে "এখানে কেউ নেই"'), flag: 'tcpdump' },
    ],
    missions: [
      { id: 'net', text: 'আগে নিজের internet যাচাই (ping 8.8.8.8)' },
      { id: 'dns', text: 'DNS ঠিক আছে কি? (dig)' },
      { id: 'curl', text: 'HTTP/TLS layer-এ কী error? (curl)' },
      { id: 'status', text: 'Server-এ ঢুকে কারণ খুঁজে বের করো (ss / systemctl status)' },
      { id: 'fixed', text: 'ঠিক করে curl দিয়ে আবার যাচাই করো', check: (c, s) => s.nginx && /^curl/.test(c) },
    ],
  },
  devops: {
    prompt: 'you@ci:~/shop$',
    banner: 'Docker → registry → Kubernetes। একটি Node.js API ship করো।',
    help: 'docker build -t shop-api:v2 .\ndocker run -d -p 3000:3000 shop-api:v2\ndocker ps\ndocker push registry.example.com/shop-api:v2\nkubectl apply -f deploy.yaml\nkubectl get pods\nkubectl rollout status deploy/shop-api\nkubectl rollout undo deploy/shop-api\nterraform plan',
    commands: [
      { match: /^docker build -t shop-api:v2 \.$/, out: '[+] Building 21.4s\n => [build 1/4] FROM node:22-alpine\n => [build 4/4] RUN npm ci --omit=dev\n => [stage-2 1/2] FROM gcr.io/distroless/nodejs22-debian12   ← ছোট, নিরাপদ runtime image\n => exporting to image shop-api:v2 (132MB)', flag: 'build' },
      { match: /^docker run -d -p 3000:3000 shop-api:v2$/, out: 'a3f9c2e1b7d4  ← container চালু (host-এর 3000 → container-এর 3000)', flag: 'run' },
      { match: /^docker ps$/, out: 'CONTAINER ID  IMAGE         STATUS         PORTS\na3f9c2e1b7d4  shop-api:v2   Up 8 seconds   0.0.0.0:3000->3000/tcp', flag: 'ps' },
      { match: /^docker push registry\.example\.com\/shop-api:v2$/, out: 'v2: digest: sha256:9b1e…f04 size: 1162  ← এখন যেকোনো server এই image টেনে নিতে পারবে', flag: 'push' },
      { match: /^kubectl apply -f deploy\.yaml$/, out: 'deployment.apps/shop-api configured\nservice/shop-api unchanged\nhorizontalpodautoscaler.autoscaling/shop-api unchanged', flag: 'apply' },
      { match: /^kubectl get pods$/, out: 'NAME                        READY  STATUS             AGE\nshop-api-7d9f8b6c5-2xkqp    1/1    Running            2d\nshop-api-7d9f8b6c5-9vfmz    1/1    Running            2d\nshop-api-6c4d7a9e1-h8wqt    0/1    ContainerCreating  3s   ← নতুন v2 pod আসছে', flag: 'pods' },
      { match: /^kubectl rollout status deploy\/shop-api$/, out: 'Waiting for deployment "shop-api" rollout to finish: 1 of 3 updated replicas are available...\nWaiting … 2 of 3 updated replicas are available...\ndeployment "shop-api" successfully rolled out ✅', flag: 'rollout' },
      { match: /^kubectl rollout undo deploy\/shop-api$/, out: 'deployment.apps/shop-api rolled back  ← খারাপ release হলে ১ command-এ আগের version', flag: 'undo' },
      { match: /^terraform plan$/, out: 'Terraform will perform the following actions:\n  + aws_s3_bucket.media        will be created\n  ~ aws_instance.api           instance_type: "t3.small" → "t3.medium"\nPlan: 1 to add, 1 to change, 0 to destroy.  ← infrastructure-ও code (IaC), review করে তারপর apply', flag: 'tf' },
    ],
    missions: [
      { id: 'build', text: 'Docker image build করো' },
      { id: 'ps', text: 'Container চালিয়ে docker ps দিয়ে দেখো', check: (c, s) => s.flags.run && s.flags.ps },
      { id: 'push', text: 'Registry-তে push করো' },
      { id: 'rollout', text: 'Kubernetes-এ apply করে rollout status দেখো', check: (c, s) => s.flags.apply && s.flags.rollout },
      { id: 'tf', text: 'Terraform plan দেখো (Infrastructure as Code)' },
    ],
  },
};
