// Phase 04 — Server & Deployment Security
export default [
  {
    id: 'linux',
    phase: 4,
    no: '23',
    icon: '🐧',
    title: 'Linux Server Hardening',
    subtitle: 'নতুন VPS-এর প্রথম ৩০ মিনিট',
    duration: '৪০ মিনিট',
    goals: ['Non-root user ও sudo', 'File permission ও SUID', 'Automatic security update', 'অপ্রয়োজনীয় service বন্ধ'],
    steps: [
      {
        title: 'নতুন server = লক্ষ্যবস্তু',
        body: 'নতুন VPS internet-এ আসার কয়েক মিনিটের মধ্যেই bot SSH-এ password guessing শুরু করে। তাই deploy-এর আগে hardening করো।',
        points: ['১. System update', '২. Non-root sudo user', '৩. SSH key-only login', '৪. Firewall (UFW)', '৫. Automatic security update', '৬. Fail2ban', '৭. অপ্রয়োজনীয় service বন্ধ'],
      },
      {
        title: 'User ও Permission',
        body: 'App কখনো root হিসেবে চালাবে না। প্রতিটি service-এর নিজস্ব user, ন্যূনতম permission। Linux permission: owner/group/others × read/write/execute।',
        code: [{ label: 'Setup', lang: 'bash', kind: 'good', text: 'adduser deploy && usermod -aG sudo deploy\nuseradd --system --no-create-home --shell /usr/sbin/nologin appsvc\nchown -R appsvc:appsvc /opt/app\nchmod 600 /opt/app/.env          # শুধু owner পড়তে পারে\nchmod 750 /opt/app' }],
        warn: 'chmod 777 = যে কেউ পড়তে, লিখতে, চালাতে পারে। এটা "permission error ঠিক করার" সমাধান নয় — এটা নতুন দুর্বলতা।',
      },
      {
        title: 'Privilege escalation-এর পথ খোঁজো',
        body: 'Attacker app user হিসেবে ঢুকলে root হতে চায়। সাধারণ পথ: SUID binary, world-writable script যা root cron চালায়, sudo NOPASSWD, পুরনো kernel।',
        code: [{ label: 'Audit commands', lang: 'bash', text: 'find / -perm -4000 -type f 2>/dev/null     # SUID\nfind / -perm -o+w -type f 2>/dev/null -not -path "/proc/*"\nsudo -l\ncat /etc/crontab; ls -la /etc/cron.d' }],
      },
      {
        title: 'Update ও service',
        body: '',
        code: [{ label: 'Ubuntu', lang: 'bash', kind: 'good', text: 'apt update && apt upgrade -y\napt install unattended-upgrades fail2ban -y\ndpkg-reconfigure --priority=low unattended-upgrades\nss -tulpn                              # কোন port কে শুনছে\nsystemctl disable --now <unused-service>' }],
        tip: 'Lynis দিয়ে পুরো server audit: sudo lynis audit system',
      },
    ],
    labs: [{ type: 'terminal', title: 'Hardening Terminal', intro: 'একটি সদ্য তৈরি (দুর্বল) VPS-এ তুমি logged in। Mission অনুযায়ী সমস্যা খুঁজে ঠিক করো। "help" দিয়ে শুরু।', preset: 'harden' }],
    quiz: [
      { q: '.env ফাইলের জন্য উপযুক্ত permission?', options: ['777', '644', '600', '755'], answer: 2, explain: 'শুধু owner read/write।' },
      { q: 'SUID binary খোঁজার command?', options: ['find / -perm -4000', 'ls -suid', 'chmod +s', 'ps aux'], answer: 0, explain: 'SUID bit = 4000।' },
      { q: 'কোন port কোন process শুনছে দেখার command?', options: ['ss -tulpn', 'ls -la', 'whoami', 'df -h'], answer: 0, explain: 'netstat-এর আধুনিক বিকল্প।' },
    ],
    cheat: {
      category: 'Server Security', severity: 'high',
      summary: 'Least privilege, update, ন্যূনতম service, সঠিক permission।',
      rules: ['Root হিসেবে app নয় — আলাদা system user', 'chmod 600 .env, 777 কখনো নয়', 'unattended-upgrades', 'fail2ban', 'অপ্রয়োজনীয় service বন্ধ'],
      checklist: ['ss -tulpn', 'find / -perm -4000', 'sudo -l', 'lynis audit system'],
      commands: ['sudo lynis audit system', 'ss -tulpn', 'last -a | head'],
      remember: 'প্রতিটি অতিরিক্ত permission একটি অতিরিক্ত দরজা।',
    },
  },

  {
    id: 'ssh',
    phase: 4,
    no: '24',
    icon: '🔑',
    title: 'SSH Security',
    subtitle: 'Server-এর সামনের দরজা',
    duration: '৩০ মিনিট',
    goals: ['Password vs key authentication', 'sshd_config hardening', 'Fail2ban', 'Bastion / Tailscale'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Port 22 খোলা যেকোনো server-এ প্রতিদিন হাজারো automated login চেষ্টা আসে (root/123456, admin/admin, ubuntu/ubuntu)। Password login চালু থাকলে একটি দুর্বল password-ই যথেষ্ট।',
        code: [{ label: '/var/log/auth.log', lang: 'text', text: 'Failed password for root from 45.83.12.9 port 51122 ssh2\nFailed password for invalid user admin from 45.83.12.9 port 51130 ssh2\nFailed password for invalid user oracle from 103.21.4.7 port 40022 ssh2' }],
      },
      {
        title: 'Key-based authentication',
        body: 'Ed25519 key pair: private key তোমার laptop-এ (passphrase সহ), public key server-এর ~/.ssh/authorized_keys-এ। Brute-force কার্যত অসম্ভব।',
        code: [{ label: 'Laptop-এ', lang: 'bash', kind: 'good', text: 'ssh-keygen -t ed25519 -C "sabuj@laptop"\nssh-copy-id deploy@server-ip' }],
      },
      {
        title: 'sshd_config hardening',
        body: 'Key কাজ করছে নিশ্চিত হওয়ার পরে (নতুন terminal-এ test করে!) password বন্ধ করো:',
        code: [{ label: '/etc/ssh/sshd_config.d/hardening.conf', lang: 'conf', kind: 'good', text: 'PermitRootLogin no\nPasswordAuthentication no\nKbdInteractiveAuthentication no\nPubkeyAuthentication yes\nMaxAuthTries 3\nAllowUsers deploy\nX11Forwarding no\nLoginGraceTime 20' }],
        warn: 'Config বদলানোর পর পুরনো session বন্ধ করবে না — নতুন terminal থেকে login test করো। নইলে নিজেকেই lock out করবে।',
      },
      {
        title: 'আরও স্তর',
        body: '',
        points: ['Fail2ban — বারবার ব্যর্থ IP স্বয়ংক্রিয় ban', 'UFW-তে SSH শুধু নির্দিষ্ট IP থেকে', 'Tailscale/WireGuard — SSH public internet-এ খোলাই রাখো না', 'Port বদলানো (2222) — শুধু noise কমায়, security নয়', 'SSH key-তে passphrase + ssh-agent'],
      },
    ],
    labs: [{ type: 'audit', title: 'sshd_config Audit', intro: 'এই production server-এর sshd_config-এ ৬টি দুর্বল লাইন আছে। প্রতিটি সন্দেহজনক লাইনে ক্লিক করো। সব খুঁজে পেলে "Fix apply" চাপো।', preset: 'sshd' }],
    quiz: [
      { q: 'SSH-এ সবচেয়ে কার্যকর brute-force প্রতিরোধ?', options: ['Port বদলানো', 'Key-only auth (PasswordAuthentication no)', 'লম্বা banner', 'Root password লম্বা করা'], answer: 1, explain: 'Password না থাকলে guessing অর্থহীন।' },
      { q: 'sshd config বদলের পর প্রথমে কী করবে?', options: ['সব session বন্ধ', 'নতুন terminal থেকে login test', 'Reboot', 'কিছু না'], answer: 1, explain: 'Lock-out এড়াও।' },
    ],
    cheat: {
      category: 'Server Security', severity: 'critical',
      summary: 'SSH = server-এর সামনের দরজা। Key-only, no root, limited users।',
      rules: ['PasswordAuthentication no', 'PermitRootLogin no', 'AllowUsers deploy', 'MaxAuthTries 3', 'Fail2ban', 'VPN/Tailscale-এর পেছনে SSH', 'Ed25519 key + passphrase'],
      checklist: ['sudo sshd -T | grep -i "password\\|root"', 'grep "Failed password" /var/log/auth.log | wc -l'],
      commands: ['ssh-keygen -t ed25519', 'sudo sshd -t && sudo systemctl reload ssh', 'sudo fail2ban-client status sshd'],
      remember: 'Password দিয়ে SSH = দরজায় কম্বিনেশন তালা।',
    },
  },

  {
    id: 'firewall',
    phase: 4,
    no: '25',
    icon: '🧱',
    title: 'Firewall ও Port Scanning',
    subtitle: 'UFW + Nmap দিয়ে নিজের server দেখো',
    duration: '৩৫ মিনিট',
    goals: ['Nmap দিয়ে নিজের open port দেখা', 'UFW default deny', 'Docker-UFW bypass সমস্যা', 'Cloudflare-only origin'],
    steps: [
      {
        title: 'Attacker-এর চোখে তোমার server',
        body: 'Nmap দিয়ে attacker দেখে কোন port খোলা ও কোন service কোন version-এ চলছে। খোলা PostgreSQL (5432), Redis (6379), Docker API (2375), Grafana (3000) — এসব সরাসরি internet-এ থাকা মারাত্মক।',
        code: [{ label: 'নিজের server scan (বাইরে থেকে)', lang: 'bash', text: 'nmap -sV -p- your-server-ip\nnmap -sV --top-ports 1000 your-server-ip' }],
        warn: 'শুধু নিজের বা লিখিত অনুমতি আছে এমন server scan করবে।',
      },
      {
        title: 'UFW — Default Deny',
        body: 'নীতি: সব incoming বন্ধ, শুধু প্রয়োজনীয়টা খোলা। নিয়ম ক্রমানুসারে মেলে।',
        code: [{ label: 'UFW setup', lang: 'bash', kind: 'good', text: 'ufw default deny incoming\nufw default allow outgoing\nufw allow from 203.0.113.10 to any port 22 proto tcp   # অফিস IP\nufw allow 443/tcp\nufw enable\nufw status numbered' }],
      },
      {
        title: 'Docker UFW-কে bypass করে!',
        body: 'docker run -p 5432:5432 করলে Docker নিজে iptables-এ নিয়ম যোগ করে — UFW-এর "deny" উপেক্ষা করে port internet-এ খুলে যায়। অনেক database এভাবে leak হয়েছে।',
        code: [
          { label: 'দুর্বল · docker-compose', lang: 'yaml', kind: 'bad', text: 'postgres:\n  ports:\n    - "5432:5432"     # 0.0.0.0:5432 — সারা internet!' },
          { label: 'নিরাপদ', lang: 'yaml', kind: 'good', text: 'postgres:\n  ports:\n    - "127.0.0.1:5432:5432"   # শুধু localhost\n  # অথবা ports বাদ দাও — internal docker network যথেষ্ট' },
        ],
      },
      {
        title: 'Cloudflare-only origin',
        body: 'Cloudflare ব্যবহার করলে 80/443 শুধু Cloudflare-এর IP range থেকে allow করো। নইলে attacker তোমার origin IP জেনে Cloudflare (WAF, DDoS protection) এড়িয়ে সরাসরি আক্রমণ করবে। আরও ভালো: Cloudflare Tunnel — কোনো inbound port-ই খোলা লাগে না।',
      },
    ],
    labs: [{ type: 'firewall', title: 'Firewall Lab — Scan, Rule, Defend', intro: 'প্রথমে তোমার server scan করো এবং খোলা port দেখো। তারপর firewall rule লিখে শুধু প্রয়োজনীয় traffic allow করো এবং traffic simulation চালাও।' }],
    quiz: [
      { q: 'Docker -p 5432:5432 করলে UFW deny থাকলেও কী হয়?', options: ['Port বন্ধ থাকে', 'Docker iptables দিয়ে port খুলে দেয়', 'Docker চলে না', 'শুধু IPv6 খোলে'], answer: 1, explain: '127.0.0.1:5432:5432 bind করো।' },
      { q: 'UFW-এর নিরাপদ default?', options: ['allow incoming', 'deny incoming, allow outgoing', 'deny all', 'allow all'], answer: 1, explain: 'Default deny।' },
      { q: 'Cloudflare ব্যবহার করলে origin-এ 443 কার জন্য খোলা উচিত?', options: ['সবার', 'শুধু Cloudflare IP range', 'শুধু localhost', 'কারো না'], answer: 1, explain: 'নইলে CF bypass।' },
    ],
    cheat: {
      category: 'Server Security', severity: 'critical',
      summary: 'Default deny। শুধু প্রয়োজনীয় port, প্রয়োজনীয় source থেকে।',
      rules: ['ufw default deny incoming', 'SSH শুধু নির্দিষ্ট IP/VPN', 'DB/Redis কখনো public নয়', 'Docker port 127.0.0.1-এ bind', 'Origin শুধু Cloudflare IP / Tunnel'],
      checklist: ['বাইরে থেকে nmap -p- server', 'ufw status numbered', 'docker ps — PORTS কলামে 0.0.0.0?'],
      commands: ['nmap -sV -p- server-ip', 'sudo ufw status verbose', 'sudo ss -tulpn'],
      remember: 'যে port খোলা নেই, তাকে আক্রমণ করা যায় না।',
    },
  },

  {
    id: 'nginx',
    phase: 4,
    no: '26',
    icon: '🔀',
    title: 'Nginx Security',
    subtitle: 'Reverse proxy hardening',
    duration: '৩৫ মিনিট',
    goals: ['Information leak বন্ধ', 'Security header', 'Rate limit ও body size', 'Alias traversal ও dotfile'],
    steps: [
      {
        title: 'Nginx তোমার প্রথম application layer',
        body: 'Cloudflare-এর পরে Nginx প্রথম যেখানে তোমার নিয়ম চলে। ভুল config এখানে পুরো app-কে ঝুঁকিতে ফেলে।',
        points: ['server_tokens on → "nginx/1.18.0" — attacker CVE খোঁজে', 'autoindex on → directory listing', 'location /.git, /.env block নেই', 'client_max_body_size অসীম → DoS', 'Security header নেই'],
      },
      {
        title: 'নিরাপদ server block',
        body: '',
        code: [{ label: '/etc/nginx/sites-available/api', lang: 'nginx', kind: 'good', text: 'limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n\nserver {\n    listen 443 ssl http2;\n    server_name api.example.com;\n    server_tokens off;\n    client_max_body_size 5m;\n\n    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header X-Frame-Options "DENY" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n    location ~ /\\. { deny all; }          # .git, .env\n\n    location / {\n        limit_req zone=api burst=20 nodelay;\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}' }],
      },
      {
        title: 'Real IP ও Cloudflare',
        body: 'Cloudflare-এর পেছনে $remote_addr = Cloudflare IP। set_real_ip_from (Cloudflare range) + real_ip_header CF-Connecting-IP দিয়ে আসল IP নাও — কিন্তু শুধু Cloudflare range থেকে বিশ্বাস করো, নইলে attacker header জাল করবে।',
      },
    ],
    labs: [{ type: 'audit', title: 'nginx.conf Audit', intro: 'এই production nginx config-এ ৭টি নিরাপত্তা সমস্যা আছে। খুঁজে বের করো।', preset: 'nginx' }],
    quiz: [
      { q: 'server_tokens off কী করে?', options: ['TLS বন্ধ', 'Response-এ nginx version লুকায়', 'Token auth', 'Cache বন্ধ'], answer: 1, explain: 'Information disclosure কমায়।' },
      { q: 'location ~ /\\. { deny all; } কী আটকায়?', options: ['সব PHP', '.git, .env-এর মতো dotfile', 'Image', 'API'], answer: 1, explain: 'Hidden file access।' },
    ],
    cheat: {
      category: 'Server Security', severity: 'high',
      summary: 'Nginx = তোমার প্রথম নিয়ন্ত্রিত layer। Leak বন্ধ, header যোগ, limit দাও।',
      rules: ['server_tokens off', 'autoindex off', 'location ~ /\\. deny', 'client_max_body_size', 'limit_req', 'Security headers always', 'real_ip শুধু CF range থেকে'],
      checklist: ['sudo nginx -t', 'curl -I → Server header?', 'curl https://site/.git/HEAD → 403?'],
      commands: ['sudo nginx -t && sudo systemctl reload nginx', 'curl -sI https://example.com'],
      remember: 'Default config production-এর জন্য নয়।',
    },
  },

  {
    id: 'docker',
    phase: 4,
    no: '27',
    icon: '🐳',
    title: 'Docker Security',
    subtitle: 'Container মানেই isolated নয়',
    duration: '৩৫ মিনিট',
    goals: ['Root container-এর ঝুঁকি', 'docker.sock mount = host root', 'Image-এ secret', 'Minimal image ও scanning'],
    steps: [
      {
        title: 'Container escape-এর পথ',
        body: 'Container একই kernel share করে। ভুল config-এ container থেকে host-এর পূর্ণ নিয়ন্ত্রণ নেওয়া যায়:',
        points: ['--privileged → প্রায় সব kernel capability', '/var/run/docker.sock mount → container থেকে নতুন privileged container চালিয়ে host root', 'Root user + kernel bug', 'Host path (/) mount'],
      },
      {
        title: 'নিরাপদ Dockerfile (Node.js)',
        body: 'Multi-stage build: compile আলাদা stage-এ, final image-এ শুধু binary।',
        code: [{ label: 'Dockerfile', lang: 'dockerfile', kind: 'good', text: '# ধাপ ১: dependency install (build-এর জন্য)\nFROM node:22-alpine AS build\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --omit=dev\nCOPY src ./src\n\n# ধাপ ২: ছোট, shell-হীন runtime image\nFROM gcr.io/distroless/nodejs22-debian12:nonroot\nWORKDIR /app\nCOPY --from=build /app /app\nUSER nonroot\nEXPOSE 3000\nCMD ["src/server.js"]' }],
        points: ['Distroless/alpine — shell নেই, attack surface কম', 'USER nonroot', '.dockerignore-এ .env, .git', 'Image-এ secret নয় (ENV/ARG/COPY .env) — runtime-এ inject', 'Image tag pin (digest)'],
      },
      {
        title: 'Runtime hardening',
        body: '',
        code: [{ label: 'docker-compose.yml', lang: 'yaml', kind: 'good', text: 'services:\n  api:\n    image: myapi@sha256:…\n    read_only: true\n    cap_drop: [ALL]\n    security_opt: ["no-new-privileges:true"]\n    env_file: .env.production\n    networks: [backend]\n    deploy:\n      resources: { limits: { memory: 512M, cpus: "1" } }' }],
        tip: 'Image scan: trivy image myapi:latest — পরিচিত CVE খুঁজে দেয়।',
      },
    ],
    labs: [{ type: 'audit', title: 'Dockerfile + Compose Audit', intro: 'একটি team-এর deploy config। ৭টি বিপজ্জনক লাইন খুঁজে বের করো।', preset: 'docker' }],
    quiz: [
      { q: 'docker.sock container-এ mount করলে কী হয়?', options: ['কিছু না', 'Container host-এ root-সমতুল্য ক্ষমতা পায়', 'Network ধীর', 'Log বন্ধ'], answer: 1, explain: 'নতুন privileged container চালাতে পারে।' },
      { q: 'Secret image-এ রাখলে সমস্যা কী?', options: ['Image বড় হয়', 'Image layer থেকে যে কেউ বের করতে পারে', 'Build ধীর', 'কোনো সমস্যা নেই'], answer: 1, explain: 'docker history / layer extract।' },
    ],
    cheat: {
      category: 'Server Security', severity: 'high',
      summary: 'Container একই kernel share করে। Root, privileged, docker.sock = host ঝুঁকি।',
      rules: ['USER nonroot', '--privileged নয়', 'docker.sock mount নয়', 'Image-এ secret নয়', 'cap_drop ALL, no-new-privileges, read_only', 'Port 127.0.0.1-এ bind', 'Distroless + trivy scan'],
      checklist: ['docker inspect → User খালি = root', 'trivy image app:latest', 'docker history --no-trunc app'],
      commands: ['trivy image myapi:latest', 'docker run --rm -it --cap-drop ALL --read-only …'],
      remember: 'Container = আলাদা ঘর, কিন্তু একই ভিত।',
    },
  },

  {
    id: 'ddos',
    phase: 4,
    no: '28',
    icon: '🌊',
    title: 'DDoS ও Cloudflare Protection',
    subtitle: 'Traffic বন্যা থেকে বাঁচো',
    duration: '৩০ মিনিট',
    goals: ['L3/L4 vs L7 DDoS', 'Cloudflare proxy, WAF, rate limit, Under Attack mode', 'Origin IP লুকানো', 'Cache দিয়ে load কমানো'],
    steps: [
      {
        title: 'DDoS-এর ধরন',
        body: 'Distributed Denial of Service = হাজারো device (botnet) থেকে একসাথে traffic পাঠিয়ে সেবা বন্ধ করা।',
        points: ['Volumetric (L3/L4) — UDP flood, SYN flood: bandwidth ভরিয়ে দেয়', 'Protocol — SYN flood, connection table শেষ', 'Application (L7) — HTTP flood: দামি endpoint (/search, /login) বারবার call — কম traffic-এই server বসে যায়'],
      },
      {
        title: 'Cloudflare কীভাবে রক্ষা করে',
        body: 'Cloudflare-এর বিশাল network volumetric attack শুষে নেয়। L7-এর জন্য তোমাকে নিয়ম ঠিক করতে হবে:',
        points: ['Proxy (কমলা মেঘ) চালু — origin IP লুকানো', 'WAF Managed Rules', 'Rate Limiting Rules (/api/login: 10/min/IP)', 'Bot Fight Mode / Turnstile', 'Under Attack Mode — JS challenge', 'Cache Rules — static ও public API cache'],
      },
      {
        title: 'Origin IP leak — সব শেষ',
        body: 'Cloudflare থাকলেও যদি attacker তোমার origin IP জানে, সে সরাসরি আক্রমণ করবে। Leak-এর পথ: পুরনো DNS record (history), mail server-এর MX/SPF, subdomain যা proxy-ড নয় (dev.example.com), SSRF, error page।',
        tip: 'Origin firewall-এ শুধু Cloudflare IP allow করো, অথবা Cloudflare Tunnel (cloudflared) ব্যবহার করো।',
      },
    ],
    labs: [{ type: 'ddos', title: 'DDoS War Room', intro: 'তোমার server-এ L7 HTTP flood চলছে! Cloudflare-এর প্রতিরক্ষা এক এক করে চালু করো এবং দেখো server load ও আসল user-এর অভিজ্ঞতা কীভাবে বদলায়।' }],
    quiz: [
      { q: 'কম traffic-এ দামি endpoint বারবার call করা কোন DDoS?', options: ['Volumetric', 'Application layer (L7)', 'Physical', 'DNS'], answer: 1, explain: 'HTTP flood।' },
      { q: 'Cloudflare থাকলেও সরাসরি আক্রমণ কখন সম্ভব?', options: ['Origin IP leak হলে', 'HTTPS থাকলে', 'Cache চালু থাকলে', 'কখনো না'], answer: 0, explain: 'Origin firewall + Tunnel।' },
    ],
    cheat: {
      category: 'Infrastructure', severity: 'high',
      summary: 'Volumetric attack Cloudflare শুষে নেয়; L7 attack-এর জন্য rule ও rate limit লাগে।',
      rules: ['সব DNS record proxied (কমলা)', 'Origin শুধু CF IP / Tunnel', 'Rate Limiting Rules', 'WAF managed rules', 'Cache static/public', 'Origin IP ইতিহাস থেকে সরাতে IP বদলাও'],
      checklist: ['dig +short subdomain → CF IP?', 'Origin IP সরাসরি curl → block?', 'Expensive endpoint তালিকা ও limit'],
      remember: 'Origin IP গোপন = Cloudflare কার্যকর।',
    },
  },

  {
    id: 'tls',
    phase: 4,
    no: '29',
    icon: '🔒',
    title: 'TLS ও DNS Security',
    subtitle: 'HTTPS ঠিকমতো, শেষ পর্যন্ত',
    duration: '৩০ মিনিট',
    goals: ['Cloudflare SSL mode: Flexible vs Full (strict)', 'HSTS', 'TLS version ও cipher', 'DNS: CAA, DNSSEC, registrar lock'],
    steps: [
      {
        title: 'Cloudflare SSL mode — সবচেয়ে সাধারণ ভুল',
        body: 'Browser → Cloudflare অংশ সবসময় HTTPS। কিন্তু Cloudflare → origin অংশ mode-এর উপর নির্ভর করে:',
        points: ['Off — কোথাও encryption নেই', 'Flexible — CF → origin সাধারণ HTTP! Browser 🔒 দেখায় কিন্তু অর্ধেক পথ plain text 😱', 'Full — HTTPS, কিন্তু origin cert যাচাই নয় (self-signed চলে)', 'Full (strict) — HTTPS + valid cert (Cloudflare Origin CA বা Let\'s Encrypt) ✓'],
      },
      {
        title: 'HSTS ও TLS config',
        body: 'HSTS browser-কে বলে "এই site-এ সবসময় HTTPS, কখনো HTTP নয়" — SSL stripping আটকায়।',
        code: [{ label: 'Nginx TLS', lang: 'nginx', kind: 'good', text: 'ssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers off;\nssl_session_tickets off;\nadd_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;' }],
        tip: 'Test: ssllabs.com/ssltest — লক্ষ্য A+।',
      },
      {
        title: 'DNS Security',
        body: 'Domain হাতছাড়া হলে সবকিছু শেষ — attacker নতুন cert নিয়ে তোমার নামে site চালাতে পারে।',
        points: ['Registrar account-এ 2FA + registrar lock', 'CAA record — শুধু নির্দিষ্ট CA cert দিতে পারবে', 'DNSSEC', 'Dangling CNAME (মুছে ফেলা Heroku/S3-এ point করা) → subdomain takeover', 'Cloudflare API token-এ ন্যূনতম permission'],
        code: [{ label: 'CAA record', lang: 'text', kind: 'good', text: 'example.com.  CAA 0 issue "letsencrypt.org"\nexample.com.  CAA 0 issue "pki.goog"' }],
      },
    ],
    labs: [
      {
        type: 'flow',
        title: 'Cloudflare SSL Mode Simulator',
        intro: 'প্রতিটি SSL mode-এ login request কোথায় encrypted আর কোথায় plain text — দেখো।',
        nodes: [
          { id: 'b', label: 'Browser', icon: '🧑‍💻', sub: '🔒 দেখায়' },
          { id: 'isp', label: 'ISP / Wi-Fi', icon: '📶', sub: 'পথ ১' },
          { id: 'cf', label: 'Cloudflare', icon: '☁️', sub: 'Edge' },
          { id: 'dc', label: 'Datacenter link', icon: '🛰️', sub: 'পথ ২' },
          { id: 'o', label: 'Origin Nginx', icon: '🖥️', sub: 'তোমার server' },
        ],
        modes: [
          { id: 'flex', name: 'Flexible ⚠', kind: 'attack', hops: [
            { from: 'b', to: 'isp', label: '🔒 TLS', desc: 'Browser → Cloudflare encrypted। Browser-এ তালা দেখা যাচ্ছে, user নিশ্চিন্ত।' },
            { from: 'isp', to: 'cf', label: '🔒 TLS', desc: 'এই অংশ নিরাপদ।' },
            { from: 'cf', to: 'dc', label: 'HTTP plain 👀', status: 'evil', desc: 'Flexible mode: Cloudflare origin-এ সাধারণ HTTP-তে পাঠায়! Password plain text-এ।' },
            { from: 'dc', to: 'o', label: 'password=… (plain)', status: 'evil', desc: 'পথের যে কেউ (hosting network, compromised router) পড়তে পারে। আর origin HTTPS redirect করলে infinite redirect loop-ও হয়।' },
          ] },
          { id: 'full', name: 'Full', kind: 'normal', hops: [
            { from: 'b', to: 'cf', label: '🔒 TLS', desc: 'Browser → CF encrypted।' },
            { from: 'cf', to: 'o', label: '🔒 TLS (cert unchecked)', desc: 'Encrypted, কিন্তু Cloudflare origin cert যাচাই করে না — self-signed বা expired cert-ও চলে। MITM তাত্ত্বিকভাবে সম্ভব।' },
          ] },
          { id: 'strict', name: 'Full (strict) ✓', kind: 'defense', hops: [
            { from: 'b', to: 'cf', label: '🔒 TLS', desc: 'Browser → CF encrypted।' },
            { from: 'cf', to: 'o', label: '🔒 TLS + valid cert ✓', desc: 'Origin-এ Cloudflare Origin CA বা Let\'s Encrypt cert। Cloudflare যাচাই করে। End-to-end নিরাপদ।' },
            { from: 'o', to: 'b', label: 'HSTS header', desc: 'Origin HSTS পাঠায় — browser ভবিষ্যতে কখনো HTTP চেষ্টাই করবে না।' },
          ] },
        ],
      },
    ],
    quiz: [
      { q: 'Cloudflare Flexible mode-এ CF → origin কেমন?', options: ['HTTPS strict', 'Plain HTTP', 'VPN', 'SSH'], answer: 1, explain: 'অর্ধেক পথ unencrypted।' },
      { q: 'HSTS কী আটকায়?', options: ['SSL stripping / HTTP downgrade', 'SQLi', 'XSS', 'DDoS'], answer: 0, explain: 'Browser সবসময় HTTPS।' },
      { q: 'CAA record কী করে?', options: ['Email routing', 'কোন CA cert দিতে পারবে নির্ধারণ', 'IP সেট', 'Cache'], answer: 1, explain: 'অননুমোদিত cert issuance কমায়।' },
    ],
    cheat: {
      category: 'Infrastructure', severity: 'high',
      summary: 'End-to-end TLS: Full (strict) + HSTS + TLS 1.2/1.3। Domain = মূল সম্পদ।',
      rules: ['Cloudflare SSL: Full (strict)', 'HSTS includeSubDomains', 'TLS 1.2+ only', 'Registrar 2FA + lock', 'CAA record', 'Dangling DNS record মুছে ফেলো'],
      checklist: ['ssllabs.com A+', 'dig CAA example.com', 'সব CNAME-এর target এখনো তোমার?'],
      commands: ['openssl s_client -connect example.com:443 -tls1_1   # fail হওয়া উচিত', 'dig +short CAA example.com'],
      remember: '🔒 browser-এ দেখা মানেই পুরো পথ encrypted নয়।',
    },
  },
];
