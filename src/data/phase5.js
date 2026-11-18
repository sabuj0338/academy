// Phase 05 — Database & Data Security
export default [
  {
    id: 'postgres',
    phase: 5,
    no: '30',
    icon: '🐘',
    title: 'PostgreSQL Security ও Least Privilege',
    subtitle: 'App-কে superuser দিও না',
    duration: '৩৫ মিনিট',
    goals: ['Role ও privilege model', 'pg_hba.conf', 'App user-এর ন্যূনতম অনুমতি', 'SQLi হলে ক্ষতির পরিধি কমানো'],
    steps: [
      {
        title: 'কেন least privilege?',
        body: 'ধরো তোমার app-এ একটি SQLi bug আছে। App যদি postgres superuser হিসেবে connect করে — attacker সব database পড়বে, টেবিল মুছবে, এমনকি COPY … TO PROGRAM দিয়ে server-এ OS command চালাবে! App user-এর শুধু নিজের টেবিলে SELECT/INSERT/UPDATE থাকলে ক্ষতি অনেক সীমিত।',
      },
      {
        title: 'Role design',
        body: 'তিনটি আলাদা role:',
        code: [{ label: 'SQL', lang: 'sql', kind: 'good', text: "-- Migration-এর জন্য (শুধু deploy-এর সময়)\nCREATE ROLE app_owner LOGIN PASSWORD '…';\nALTER DATABASE shop OWNER TO app_owner;\n\n-- Runtime app\nCREATE ROLE app_rw LOGIN PASSWORD '…' NOSUPERUSER NOCREATEDB NOCREATEROLE;\nGRANT CONNECT ON DATABASE shop TO app_rw;\nGRANT USAGE ON SCHEMA public TO app_rw;\nGRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;\nREVOKE CREATE ON SCHEMA public FROM PUBLIC;\n\n-- Reporting / analytics\nCREATE ROLE app_ro LOGIN PASSWORD '…';\nGRANT SELECT ON orders, products TO app_ro;" }],
        points: ['Row Level Security (RLS) — multi-tenant app-এ অতিরিক্ত স্তর', 'Audit log টেবিলে app_rw-এর শুধু INSERT'],
      },
      {
        title: 'Network ও authentication',
        body: '',
        code: [{ label: 'pg_hba.conf', lang: 'conf', kind: 'good', text: '# TYPE  DATABASE  USER     ADDRESS        METHOD\nlocal   all       postgres                 peer\nhost    shop      app_rw   172.18.0.0/16  scram-sha-256\nhostssl shop      app_ro   10.0.0.0/24    scram-sha-256\n# কখনো: host all all 0.0.0.0/0 trust' }],
        points: ['listen_addresses = \'localhost\' বা private IP', 'scram-sha-256 (md5 নয়, trust কখনো নয়)', 'Remote connection-এ SSL', 'log_connections, pgaudit'],
      },
    ],
    labs: [
      { type: 'audit', title: 'pg_hba.conf + Grants Audit', intro: 'এই PostgreSQL setup-এ ৬টি বিপজ্জনক লাইন খুঁজে বের করো।', preset: 'postgres' },
      { type: 'terminal', title: 'Privilege Impact Simulator (psql)', intro: 'App-এ SQLi আছে ধরে নাও। দুটি role দিয়ে attacker-এর query চালিয়ে দেখো ক্ষতির পার্থক্য। "help" দেখো।', preset: 'psql' },
    ],
    quiz: [
      { q: 'pg_hba.conf-এ "trust" method মানে?', options: ['শক্তিশালী auth', 'Password ছাড়াই connect', 'SSL বাধ্যতামূলক', 'শুধু local'], answer: 1, explain: 'Production-এ কখনো নয়।' },
      { q: 'Superuser app account-এ SQLi হলে সবচেয়ে খারাপ কী?', options: ['Slow query', 'COPY TO PROGRAM দিয়ে OS command', 'Index নষ্ট', 'কিছু না'], answer: 1, explain: 'Database থেকে server takeover।' },
    ],
    cheat: {
      category: 'Database Security', severity: 'critical',
      summary: 'App user-এর শুধু প্রয়োজনীয় টেবিলে CRUD। Superuser কখনো নয়।',
      rules: ['আলাদা role: owner (migration), rw (app), ro (report)', 'NOSUPERUSER NOCREATEDB NOCREATEROLE', 'REVOKE CREATE ON SCHEMA public FROM PUBLIC', 'pg_hba: scram-sha-256, নির্দিষ্ট CIDR', 'listen_addresses private', 'RLS multi-tenant-এ'],
      checklist: ['\\du — কার superuser?', 'SHOW listen_addresses;', 'pg_hba-তে trust / 0.0.0.0/0?'],
      commands: ["psql -c '\\du'", 'sudo -u postgres psql -c "SHOW hba_file;"'],
      remember: 'Bug থাকবেই — privilege ঠিক করে দেয় ক্ষতি কতটা।',
    },
  },

  {
    id: 'redis',
    phase: 5,
    no: '31',
    icon: '🟥',
    title: 'Redis Security',
    subtitle: 'Password ছাড়া Redis = খোলা server',
    duration: '৩০ মিনিট',
    goals: ['Exposed Redis-এর পরিণতি', 'requirepass ও ACL', 'Dangerous command rename', 'Network isolation'],
    steps: [
      {
        title: 'আক্রমণটা বোঝো',
        body: 'Redis ডিফল্টে ভেবেছিল "শুধু বিশ্বস্ত network-এ থাকবে"। Internet-এ খোলা, password-হীন Redis পেলে attacker: সব session/cache পড়ে (session hijack), FLUSHALL দিয়ে মুছে দেয়, আর CONFIG SET dir/dbfilename দিয়ে ~/.ssh/authorized_keys বা cron ফাইলে লিখে server-এ ঢুকে পড়ে।',
        code: [{ label: 'Attacker (নিজের lab-এ বোঝার জন্য)', lang: 'bash', kind: 'bad', text: 'redis-cli -h victim-ip\n> KEYS session:*\n> CONFIG SET dir /root/.ssh\n> CONFIG SET dbfilename authorized_keys\n> SET x "\\n\\nssh-ed25519 AAAA… attacker\\n\\n"\n> SAVE' }],
        warn: 'Shodan-এ হাজারো unauthenticated Redis পাওয়া যায় — অনেকগুলো cryptominer-এ আক্রান্ত।',
      },
      {
        title: 'সমাধান',
        body: '',
        code: [{ label: 'redis.conf', lang: 'conf', kind: 'good', text: 'bind 127.0.0.1 -::1\nprotected-mode yes\nport 6379\nrequirepass <openssl rand -base64 32>\n\n# Redis 6+ ACL\nuser default off\nuser app on >StrongPass ~session:* ~cache:* +@read +@write -@dangerous\n\nrename-command FLUSHALL ""\nrename-command CONFIG ""\nrename-command DEBUG ""' }],
        points: ['bind localhost / private network', 'protected-mode yes', 'ACL user প্রতি app', 'Dangerous command বন্ধ', 'Redis non-root user হিসেবে', 'TLS (Redis 6+) remote হলে', 'Docker-এ ports expose নয়'],
      },
    ],
    labs: [
      { type: 'terminal', title: 'Exposed Redis Simulator', intro: 'একটি ভুল config-এর Redis internet-এ খোলা। প্রথমে attacker হিসেবে দেখো কী সম্ভব, তারপর secure করো। "help" দেখো।', preset: 'redis' },
      { type: 'audit', title: 'redis.conf Audit', intro: '৫টি সমস্যা খুঁজে বের করো।', preset: 'redisconf' },
    ],
    quiz: [
      { q: 'Exposed Redis-এ CONFIG SET dir/dbfilename দিয়ে attacker কী করতে পারে?', options: ['শুধু data পড়া', 'যেকোনো path-এ ফাইল লিখে server access', 'কিছুই না', 'Redis update'], answer: 1, explain: 'authorized_keys / cron।' },
      { q: 'Redis 6+-এ per-user permission দেয় কোনটি?', options: ['ACL', 'requirepass', 'bind', 'SAVE'], answer: 0, explain: 'user … +@read ~key:*' },
    ],
    cheat: {
      category: 'Database Security', severity: 'critical',
      summary: 'Unauthenticated Redis = data চুরি + server takeover।',
      rules: ['bind 127.0.0.1 / private', 'protected-mode yes', 'requirepass + ACL', 'FLUSHALL/CONFIG/DEBUG rename', 'Non-root', 'Docker port expose নয়'],
      checklist: ['বাইরে থেকে redis-cli -h ip PING → NOAUTH/timeout?', 'CONFIG GET bind'],
      commands: ['redis-cli -a $PASS ACL LIST', 'nmap -p 6379 server-ip'],
      remember: 'Redis-কে কখনো internet দেখতে দিও না।',
    },
  },

  {
    id: 'secrets',
    phase: 5,
    no: '32',
    icon: '🤫',
    title: 'Secret Management',
    subtitle: '.env, git history ও leaked key',
    duration: '৩০ মিনিট',
    goals: ['Secret কোথায় কোথায় leak হয়', 'Git history-তে থেকে যাওয়া secret', 'gitleaks দিয়ে scan', 'Rotation ও secret manager'],
    steps: [
      {
        title: 'Secret কোথায় leak হয়',
        body: 'GitHub-এ প্রতিদিন লাখো secret push হয় — bot কয়েক সেকেন্ডের মধ্যে AWS key খুঁজে crypto mining শুরু করে।',
        points: ['.env commit (এবং পরে মুছলেও history-তে থেকে যায়!)', 'Frontend bundle-এ NEXT_PUBLIC_ দিয়ে secret', 'Docker image layer', 'Log ও error message', 'CI/CD log-এ echo $SECRET', 'Slack/ChatGPT-এ paste'],
      },
      {
        title: 'Frontend-এর বিশেষ সতর্কতা',
        body: 'NEXT_PUBLIC_ prefix দেওয়া env variable build-এর সময় browser bundle-এ ঢুকে যায় — সবাই দেখতে পারে। Secret কখনো NEXT_PUBLIC_ নয়; শুধু server component / API route-এ ব্যবহার করো।',
        code: [
          { label: 'দুর্বল', lang: 'bash', kind: 'bad', text: 'NEXT_PUBLIC_STRIPE_SECRET=sk_live_…' },
          { label: 'নিরাপদ', lang: 'bash', kind: 'good', text: 'STRIPE_SECRET_KEY=sk_live_…            # server only\nNEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_live_…  # public হওয়ার জন্যই বানানো' },
        ],
      },
      {
        title: 'Leak হলে কী করবে',
        body: 'ক্রম গুরুত্বপূর্ণ:',
        points: ['১. সাথে সাথে key ROTATE/revoke করো (git থেকে মোছা দ্বিতীয় কাজ)', '২. Provider-এর log-এ অপব্যবহার দেখো', '৩. git filter-repo / BFG দিয়ে history পরিষ্কার', '৪. Pre-commit hook (gitleaks) যোগ করো', '৫. GitHub secret scanning + push protection চালু'],
        tip: 'Secret manager: Doppler, Infisical, AWS Secrets Manager, HashiCorp Vault, বা অন্তত sops দিয়ে encrypted .env।',
      },
    ],
    labs: [{ type: 'terminal', title: 'Secret Hunt — Repository Scan', intro: 'Team-এর repository-তে leaked secret আছে বলে সন্দেহ। git ও gitleaks command দিয়ে খুঁজে বের করো এবং সঠিক response দাও। "help" দেখো।', preset: 'secrets' }],
    quiz: [
      { q: 'Secret git-এ push হলে প্রথম কাজ?', options: ['git rm .env', 'Key rotate/revoke', 'Repo private করা', 'কাউকে না বলা'], answer: 1, explain: 'History-তে থেকে যায়, clone হয়ে গেছে হয়তো।' },
      { q: 'NEXT_PUBLIC_ env variable কোথায় যায়?', options: ['শুধু server', 'Browser bundle-এ', 'Database', 'কোথাও না'], answer: 1, explain: 'সবাই পড়তে পারে।' },
    ],
    cheat: {
      category: 'Data Security', severity: 'critical',
      summary: 'Secret code, image, bundle, log-এ নয়। Leak হলে আগে rotate।',
      rules: ['.env .gitignore-এ', 'Secret কখনো NEXT_PUBLIC_ নয়', 'gitleaks pre-commit', 'GitHub push protection', 'Secret manager', 'Leak → rotate → audit → history clean'],
      checklist: ['gitleaks detect --source .', 'git log -p | grep -i "secret\\|key="', 'Build bundle-এ grep sk_live'],
      commands: ['gitleaks detect --source . -v', 'git filter-repo --path .env --invert-paths'],
      remember: 'Git কখনো ভোলে না।',
    },
  },

  {
    id: 'encryption',
    phase: 5,
    no: '33',
    icon: '🧊',
    title: 'Encryption at Rest ও in Transit',
    subtitle: 'Hashing, encryption, key management',
    duration: '৩৫ মিনিট',
    goals: ['Encoding vs Hashing vs Encryption', 'Password hashing (argon2/bcrypt)', 'AES-GCM দিয়ে field-level encryption', 'Key management'],
    steps: [
      {
        title: 'তিনটি আলাদা জিনিস',
        body: 'অনেকে গুলিয়ে ফেলে:',
        points: ['Encoding (Base64) — শুধু format বদল, কোনো গোপনীয়তা নেই, যে কেউ decode করে', 'Hashing (SHA-256, bcrypt) — একমুখী, ফেরানো যায় না; integrity ও password-এর জন্য', 'Encryption (AES, RSA) — key দিয়ে ফেরানো যায়; গোপনীয়তার জন্য'],
      },
      {
        title: 'Password: hash, encrypt নয়',
        body: 'Password কখনো encrypt বা plain রাখবে না — slow, salted hash ব্যবহার করো। SHA-256 খুব দ্রুত (GPU-তে বিলিয়ন/সেকেন্ড) — password-এর জন্য খারাপ।',
        code: [{ label: 'Node.js · bcrypt', lang: 'js', kind: 'good', text: 'import bcrypt from \'bcrypt\';\n\nconst hash = await bcrypt.hash(password, 12);   // DB-তে শুধু এটা রাখো\nconst ok = await bcrypt.compare(input, hash);   // login-এর সময় মিলিয়ে দেখো\n// অথবা argon2id (npm: argon2)' }],
      },
      {
        title: 'At rest vs in transit',
        body: 'In transit = network-এ চলার সময় (TLS)। At rest = disk/backup-এ থাকার সময়। Disk encryption (LUKS, cloud volume encryption) চুরি হওয়া disk থেকে রক্ষা করে, কিন্তু চলমান DB-তে SQLi থেকে নয়। অতি sensitive field (NID, phone, bank account) application-level-এ AES-256-GCM দিয়ে encrypt করো।',
        code: [{ label: 'Node.js · AES-256-GCM', lang: 'js', kind: 'good', text: 'import crypto from \'node:crypto\';\n\nconst iv = crypto.randomBytes(12);                              // প্রতিবার নতুন nonce!\nconst cipher = crypto.createCipheriv(\'aes-256-gcm\', key, iv);   // 32-byte key, env/KMS থেকে\nconst ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);\nconst stored = Buffer.concat([iv, cipher.getAuthTag(), ct]);    // তিনটিই একসাথে রাখো' }],
        warn: 'Key আর encrypted data একই জায়গায় রাখলে encryption অর্থহীন। Key → KMS/secret manager।',
      },
    ],
    labs: [{ type: 'encrypt', title: 'Crypto Workbench', intro: 'আসল WebCrypto দিয়ে: Base64 vs SHA-256 vs AES-GCM তুলনা করো, একটি database row encrypt করে "চুরি হওয়া disk dump" দেখো, এবং nonce পুনঃব্যবহারের বিপদ বোঝো।' }],
    quiz: [
      { q: 'Password সংরক্ষণে কোনটি?', options: ['AES encrypt', 'Base64', 'bcrypt/argon2', 'SHA-256 একবার'], answer: 2, explain: 'Slow + salted hash।' },
      { q: 'Base64 কী?', options: ['Encryption', 'Hashing', 'Encoding — কোনো গোপনীয়তা নেই', 'Signature'], answer: 2, explain: 'যে কেউ decode করে।' },
      { q: 'AES-GCM-এ একই key-তে nonce পুনঃব্যবহার করলে?', options: ['সমস্যা নেই', 'নিরাপত্তা ভেঙে পড়ে', 'ধীর হয়', 'Compression হয়'], answer: 1, explain: 'প্রতিবার নতুন random nonce।' },
    ],
    cheat: {
      category: 'Data Security', severity: 'high',
      summary: 'Encoding ≠ Hashing ≠ Encryption। Password → argon2/bcrypt। Sensitive field → AES-GCM।',
      rules: ['Password: argon2id / bcrypt(12)', 'In transit: TLS সব জায়গায় (DB connection-ও)', 'At rest: disk + backup encryption', 'Field-level AES-256-GCM sensitive data-এ', 'নতুন nonce প্রতিবার', 'Key → KMS / secret manager'],
      checklist: ['DB-তে plain password/NID আছে?', 'Backup encrypted?', 'sslmode=require DB connection-এ?'],
      remember: 'Encryption-এর শক্তি = key-এর গোপনীয়তা।',
    },
  },

  {
    id: 'backup',
    phase: 5,
    no: '34',
    icon: '💾',
    title: 'Backup ও Recovery',
    subtitle: 'Ransomware-এর বিরুদ্ধে শেষ প্রতিরক্ষা',
    duration: '২৫ মিনিট',
    goals: ['৩-২-১ নিয়ম', 'Immutable / offline backup', 'Restore test', 'RPO ও RTO'],
    steps: [
      {
        title: 'Backup কেন security বিষয়?',
        body: 'Ransomware, ভুল DROP TABLE, compromised server, cloud account ban — সব ক্ষেত্রেই শেষ ভরসা backup। কিন্তু attacker জানে — তাই সে আগে backup খুঁজে মুছে দেয়। একই server-এ বা একই credential দিয়ে access করা যায় এমন backup = কোনো backup না।',
      },
      {
        title: '৩-২-১(-১-০) নিয়ম',
        body: '',
        points: ['৩টি কপি data-র', '২টি ভিন্ন মাধ্যমে', '১টি offsite (অন্য provider/region)', '১টি immutable/offline (S3 Object Lock, R2 + lifecycle)', '০ error — নিয়মিত restore test'],
        code: [{ label: 'PostgreSQL backup', lang: 'bash', kind: 'good', text: 'pg_dump -Fc -U app_owner shop | age -r age1… > shop-$(date +%F).dump.age\nrclone copy shop-*.dump.age r2:backups/ --s3-no-check-bucket\n# R2/S3 bucket-এ Object Lock / write-only credential' }],
      },
      {
        title: 'RPO ও RTO',
        body: 'RPO (Recovery Point Objective) = সর্বোচ্চ কতক্ষণের data হারাতে রাজি (প্রতি ঘণ্টায় backup → RPO ১ ঘণ্টা)। RTO (Recovery Time Objective) = কত দ্রুত আবার চালু করতে হবে। Restore কখনো test না করলে তুমি জানো না তোমার RTO কত।',
        tip: 'Backup credential write-only রাখো — server compromise হলেও attacker পুরনো backup মুছতে পারবে না।',
      },
    ],
    labs: [{ type: 'backup', title: 'Ransomware Drill', intro: 'তোমার backup strategy সাজাও (কোথায়, কত ঘন ঘন, কী ধরনের)। তারপর ransomware আক্রমণ চালাও এবং দেখো কতটা data ফেরত পাও।' }],
    quiz: [
      { q: '৩-২-১-এ "১" কী?', options: ['১টি password', '১টি offsite কপি', '১ দিন', '১টি server'], answer: 1, explain: 'অন্য জায়গায় একটি কপি।' },
      { q: 'RPO কী মাপে?', options: ['চালু হতে সময়', 'সর্বোচ্চ data loss-এর সময়সীমা', 'Backup size', 'CPU'], answer: 1, explain: 'RTO = সময়, RPO = data।' },
    ],
    cheat: {
      category: 'Data Security', severity: 'high',
      summary: 'Backup = ransomware ও দুর্ঘটনার শেষ প্রতিরক্ষা — যদি attacker নাগাল না পায়।',
      rules: ['৩-২-১-১-০', 'Encrypted backup (age/gpg)', 'Write-only / immutable storage', 'আলাদা credential ও account', 'মাসিক restore test', 'RPO/RTO লিখে রাখো'],
      checklist: ['শেষ সফল restore কবে?', 'Server compromise হলে backup মুছতে পারবে?'],
      commands: ['pg_dump -Fc', 'pg_restore -d test_restore shop.dump'],
      remember: 'Restore test করা হয়নি এমন backup = আশা, পরিকল্পনা নয়।',
    },
  },
];
