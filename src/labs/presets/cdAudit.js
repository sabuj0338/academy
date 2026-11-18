// Cloud ও DevOps কোর্সের config review lab — প্রতিটি লাইন string অথবা { t, bad: { why, fix } }
const B = (t, why, fix) => ({ t, bad: { why, fix } });

export default {
  // Lesson 05 · Docker Compose
  compose: {
    file: 'compose.yaml  (production server-এর জন্য)',
    lines: [
      'services:',
      '  api:',
      B('    image: shopbd/api:latest', ':latest — কোন version চলছে কেউ জানে না, আর খারাপ হলে কোন version-এ ফিরবে তাও অজানা।', '    image: shopbd/api:1.4.2'),
      '    ports: ["3000:3000"]',
      '    environment:',
      B('      DB_PASSWORD: SuperSecret123', 'Password সরাসরি ফাইলে — compose.yaml Git-এ যায়, তাই সবাই দেখে।', '      DB_PASSWORD: ${DB_PASSWORD}   # .env থেকে, আর .env থাকে .gitignore-এ'),
      '    depends_on: [db]',
      B('    # (restart নেই)', 'Crash করলে আর চালু হয় না — রাত ৩টায় site বন্ধ, কেউ জানেও না।', '    restart: unless-stopped'),
      '',
      '  db:',
      '    image: postgres:16',
      B('    ports: ["5432:5432"]', 'Database-এর port সব interface-এ খোলা — internet থেকে password আন্দাজের চেষ্টা শুরু হবে।', '    # ports বাদ — api নাম ধরে (db:5432) ভেতর থেকেই পায়'),
      B('    # (volumes নেই)', 'Container মুছলে বা নতুন image এলে সব order, সব user চিরতরে হারাবে।', '    volumes: ["pgdata:/var/lib/postgresql/data"]'),
      B('    # (healthcheck নেই)', 'api ভাবে db প্রস্তুত, কিন্তু PostgreSQL তখনো চালু হচ্ছে — শুরুতেই connection error।', '    healthcheck:\n      test: ["CMD", "pg_isready", "-U", "app"]\n      interval: 5s'),
      '',
      '  cache:',
      '    image: redis:7',
      B('    command: redis-server --protected-mode no', 'Redis-এর সুরক্ষা বন্ধ — কেউ পৌঁছাতে পারলে password ছাড়াই সব data পড়তে-লিখতে পারবে।', '    command: redis-server --requirepass ${REDIS_PASSWORD}'),
    ],
  },

  // Lesson 11 · Cloud security
  iam: {
    file: 'iam-policy.json  +  bucket-policy.json  +  deploy.sh',
    lines: [
      '// ── shop-api app-এর IAM policy ──',
      '{ "Statement": [{',
      '    "Effect": "Allow",',
      B('    "Action": "*",', 'সব service-এ সব কাজ — app-এ একটা bug মানেই attacker পুরো cloud account-এর মালিক।', '    "Action": ["s3:PutObject", "s3:GetObject"],'),
      B('    "Resource": "*"', 'Account-এর সব জিনিসের উপর — শুধু দরকারি bucket-টাই দেওয়া উচিত।', '    "Resource": "arn:aws:s3:::shopbd-media/*"'),
      '}] }',
      '',
      '// ── bucket-policy.json (shopbd-media) ──',
      '{ "Statement": [{',
      '    "Effect": "Allow",',
      B('    "Principal": "*",', 'যে কেউ — login ছাড়া পুরো internet।', '    "Principal": { "AWS": "arn:aws:iam::123456789012:role/shop-api" }'),
      B('    "Action": ["s3:GetObject", "s3:ListBucket"],', 'ListBucket সবার জন্য = যে কেউ সব ফাইলের তালিকা দেখে নামিয়ে নিতে পারে (invoice, ID card…)।', '    "Action": ["s3:GetObject"]   # public ছবি দরকার হলে শুধু CDN দিয়ে'),
      '    "Resource": ["arn:aws:s3:::shopbd-media", "arn:aws:s3:::shopbd-media/*"]',
      '}] }',
      '',
      '# ── deploy.sh ──',
      '#!/bin/bash',
      B('export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE', 'দীর্ঘমেয়াদি key script-এ — repo-তে গেলে bot কয়েক মিনিটে চুরি করে।', '# key নয় — GitHub Actions OIDC দিয়ে সাময়িক role'),
      B('export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'Secret key plain text-এ।', '# (মুছে ফেলো, আর এই key এখনই বাতিল করো)'),
      'aws s3 sync ./dist s3://shopbd-media/site',
      B('# root account দিয়ে চালানো হয়, MFA নেই', 'Root-এর ক্ষমতা সীমাহীন, আর MFA ছাড়া এক password-ই সব কিছুর চাবি।', '# আলাদা deploy role; root-এ MFA, root-এর key কখনো নয়'),
    ],
  },
};
