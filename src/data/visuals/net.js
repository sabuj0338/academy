// Networking track — ধাপের বাড়তি visual। গঠন:
//   seq:     { title, actors: [[icon, নাম]], msgs: [[from, to, label, ব্যাখ্যা, 'bad'|'good'?]] }
//   anatomy: { title, parts: [[text, label, ব্যাখ্যা, 'bad'|'good'?]] }  (label ফাঁকা = সাধারণ লেখা)
//   bars:    { title, items: [[label, value, দেখানো লেখা, kind?]], scale?: 'sqrt'|'log' }
//   layers:  { title, items: [[icon, শিরোনাম, ব্যাখ্যা]] }
//   ask:     { q, options, answer, why }      maps: [[উপমার জিনিস, আসল জিনিস]]
export const ask = (q, options, answer, why) => ({ q, options, answer, why });

export default {
  'net-basics': {
    0: { maps: [['🛣️ পাড়ার রাস্তা', 'Network'], ['🏠 বাড়ি', 'Device / Node'], ['✉️ চিঠি', 'Data (packet)']] },
    3: {
      maps: [['🧑 তুমি (খদ্দের)', 'Client'], ['👨‍🍳 রান্নাঘর', 'Server'], ['📝 order', 'Request'], ['🍛 খাবার', 'Response']],
      seq: { title: 'একটি request-response চক্র', actors: [['💻', 'Client (browser)'], ['🖥️', 'Server']], msgs: [
        [0, 1, 'GET /video/42', 'Client সবসময় আগে কথা শুরু করে — “আমাকে ৪২ নম্বর video দাও”।'],
        [1, 1, 'খুঁজছে…', 'Server নিজের disk/database থেকে জিনিসটা খুঁজে বের করে।'],
        [1, 0, '200 OK + video', 'Server উত্তর পাঠায়। Server নিজে থেকে কখনো client-কে ডাকে না — সে শুধু উত্তর দেয়।', 'good'],
      ] },
    },
    4: { ask: ask('তোমার বাড়ির Wi-Fi router হঠাৎ নষ্ট হয়ে গেল। বাড়ির সব device-এর internet বন্ধ। এটা কোন topology-র দুর্বলতা?', ['⭐ Star — কেন্দ্র নষ্ট হলে সব বন্ধ', '🕸️ Mesh — বিকল্প পথ নেই', '💍 Ring — চক্র ভেঙে গেছে'], 0, 'বাড়ির network হলো Star — সবাই একটি কেন্দ্রে (router/switch) যুক্ত। কেন্দ্রই Single Point of Failure।') },
    5: { bars: { title: 'ঢাকা থেকে ping — দূরত্ব বাড়লে latency বাড়ে (আনুমানিক)', items: [['🏠 ঢাকার ভেতরে', 5, '~৫ ms', 'good'], ['🇸🇬 Singapore', 50, '~৫০ ms'], ['🇬🇧 London', 180, '~১৮০ ms'], ['🇺🇸 Virginia', 250, '~২৫০ ms', 'bad']] } },
  },
  'net-models': {
    1: { layers: { title: 'OSI-র ৭ তলা — উপর থেকে নিচে (যেকোনো তলায় mouse নাও)', items: [
      ['7️⃣', 'Application — HTTP, DNS, SSH', 'তুমি যে app ব্যবহার করো সে এখানে কথা বলে: “GET /index.html”।'],
      ['6️⃣', 'Presentation — TLS, encoding', 'Data-র রূপ বদল: encrypt করা, compress করা, UTF-8/JSON।'],
      ['5️⃣', 'Session', 'দুই পক্ষের কথোপকথন শুরু, চালু রাখা ও শেষ করা।'],
      ['4️⃣', 'Transport — TCP, UDP (port)', 'কোন app-এর কাছে যাবে (port), আর সব টুকরো ঠিকঠাক পৌঁছাল কি না।'],
      ['3️⃣', 'Network — IP (router)', 'এক network থেকে অন্য network-এ পথ খোঁজা — IP address দিয়ে।'],
      ['2️⃣', 'Data Link — Ethernet, Wi-Fi (switch)', 'একই network-এর ভেতরে পাশের device-এ পৌঁছানো — MAC address দিয়ে।'],
      ['1️⃣', 'Physical — তার, আলো, radio তরঙ্গ', 'আসল 0 আর 1 — তামার তারে বিদ্যুৎ, fiber-এ আলো, বাতাসে তরঙ্গ।'],
    ] } },
    3: { anatomy: { title: 'তারের উপর দিয়ে যাওয়া একটি frame — খামের ভেতর খাম', parts: [
      ['[ Ethernet header ', 'Layer 2', 'সবচেয়ে বাইরের খাম: কোন MAC থেকে কোন MAC-এ। প্রতিটি hop-এ (router পার হলে) এই খাম বদলে যায়।'],
      ['[ IP header ', 'Layer 3', 'উৎস ও গন্তব্যের IP address। পুরো যাত্রায় (NAT ছাড়া) এটা একই থাকে।'],
      ['[ TCP header ', 'Layer 4', 'উৎস ও গন্তব্য port, sequence number — কোন app-এর জন্য, আর টুকরোটা কত নম্বর।'],
      ['[ HTTP data ]]]', 'Layer 7', 'আসল চিঠি: “GET /index.html”। HTTPS হলে এই অংশটাই encrypt করা থাকে।'],
    ] } },
    4: { ask: ask('একটি device packet-এর শুধু MAC address দেখে সিদ্ধান্ত নেয়, IP address খোলেই না। সে কোন layer-এ কাজ করে?', ['Layer 2 — Switch', 'Layer 3 — Router', 'Layer 7 — Load balancer'], 0, 'Switch শুধু বাইরের খাম (Ethernet header-এর MAC) দেখে। Router এক ধাপ ভেতরে গিয়ে IP দেখে।') },
  },
  'net-ip': {
    1: { ask: ask('নিচের কোন IP-টা internet থেকে সরাসরি পৌঁছানো যায় না (private)?', ['192.168.1.10', '8.8.8.8', '142.250.193.14'], 0, '192.168.x.x, 10.x.x.x আর 172.16–31.x.x শুধু LAN-এর ভেতরের জন্য। লাখো বাড়িতে একই 192.168.1.10 আছে — তাই internet-এ এটা দিয়ে কাউকে খোঁজা যায় না।') },
    2: { anatomy: { title: 'একটি CIDR ঠিকানা পড়া', parts: [
      ['192.168.1', 'Network অংশ', 'প্রথম ২৪ bit — “কোন এলাকা/রাস্তা”। একই LAN-এর সব device-এর এই অংশ হুবহু এক।'],
      ['.', ''],
      ['10', 'Host অংশ', 'শেষ ৮ bit — “রাস্তার কত নম্বর বাড়ি”। ০ থেকে ২৫৫, তবে ০ (network) আর ২৫৫ (broadcast) সংরক্ষিত — ব্যবহারযোগ্য ২৫৪টি।'],
      ['/24', 'Prefix length', 'প্রথম কয়টি bit network অংশ তা বলে। /24 মানে subnet mask 255.255.255.0।'],
    ] } },
    3: { bars: { title: 'Prefix যত ছোট সংখ্যা, network তত বিশাল', scale: 'log', items: [['/32', 1, '১টি ঠিকানা'], ['/24', 256, '২৫৬'], ['/16', 65536, '৬৫,৫৩৬'], ['/8', 16777216, '১,৬৭,৭৭,২১৬']] } },
  },
  'net-devices': {
    2: {
      seq: { title: 'Switch কীভাবে শেখে কে কোথায়', actors: [['💻', 'PC-A'], ['🔀', 'Switch'], ['💻', 'PC-B'], ['💻', 'PC-C']], msgs: [
        [0, 1, 'frame → B-র MAC', 'PC-A একটি frame পাঠাল। Switch সাথে সাথে লিখে রাখল: “A আছে port 1-এ”।'],
        [1, 2, 'flood', 'B কোন port-এ তা Switch এখনো জানে না — তাই প্রথমবার সব port-এ পাঠায় (flood)।'],
        [1, 3, 'flood', 'PC-C-ও পেল, কিন্তু MAC মেলে না বলে ফেলে দিল।'],
        [2, 1, 'উত্তর → A', 'B উত্তর দিল। Switch শিখল: “B আছে port 2-এ”।'],
        [1, 0, 'শুধু A-কে', 'এখন থেকে A↔B-র কথা শুধু ওই দুই port-এ যায়। C আর কিছুই শোনে না — hub-এর সাথে এটাই পার্থক্য।', 'good'],
      ] },
      ask: ask('Hub-এর জায়গায় Switch বসালে কোন সুবিধাটা সবচেয়ে বড়?', ['Message শুধু যার জন্য, তার port-এই যায়', 'Internet-এর গতি দ্বিগুণ হয়', 'IP address লাগে না'], 0, 'Hub সবাইকে সব পাঠায় (ধীর + যে কেউ আড়ি পাততে পারে)। Switch MAC table দেখে শুধু সঠিক port-এ পাঠায়।'),
    },
  },
  'net-protocols': {
    0: { seq: { title: 'TCP three-way handshake', actors: [['💻', 'Client'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'SYN  seq=100', '“হ্যালো, শুনতে পাচ্ছ? আমি ১০০ থেকে গোনা শুরু করব।”'],
      [1, 0, 'SYN-ACK  seq=300, ack=101', '“পাচ্ছি (ACK)। তুমি আমাকে পাচ্ছ? আমি ৩০০ থেকে গুনব (SYN)।”'],
      [0, 1, 'ACK  ack=301', '“পাচ্ছি।” — এখন দুই দিকই নিশ্চিত যে অন্যজন শুনতে ও বলতে পারে। Connection তৈরি।', 'good'],
      [0, 1, 'data: GET /', 'এবার আসল data যায়।'],
      [1, 0, 'ACK', 'প্রতিটি টুকরোর প্রাপ্তিস্বীকার। ACK না এলে client আবার পাঠায় (retransmit)।'],
    ] } },
    1: { ask: ask('Client একটি টুকরো পাঠাল, কিন্তু কোনো ACK ফিরল না। TCP কী করবে?', ['কিছুক্ষণ অপেক্ষা করে আবার পাঠাবে', 'টুকরোটা বাদ দিয়ে পরেরটায় যাবে', 'Connection সাথে সাথে ভেঙে দেবে'], 0, 'এটাই retransmission — TCP-র নির্ভরযোগ্যতার মূল। টুকরো বাদ দিয়ে এগিয়ে যাওয়াটা UDP-র স্বভাব।') },
    4: { seq: { title: 'ARP — IP থেকে MAC খোঁজা', actors: [['💻', 'তোমার PC'], ['📢', 'LAN-এর সবাই'], ['📡', 'Router 192.168.1.1']], msgs: [
      [0, 1, 'Who has 192.168.1.1?', 'Broadcast — LAN-এর সবাইকে চিৎকার করে জিজ্ঞেস: “এই IP কার? তোমার MAC বলো!”'],
      [2, 0, 'আমার! MAC = aa:bb:cc…', 'শুধু আসল মালিক (router) উত্তর দেয়।', 'good'],
      [0, 0, 'ARP cache-এ লিখে রাখল', 'PC কয়েক মিনিটের জন্য মনে রাখে, যাতে বারবার জিজ্ঞেস করতে না হয়।'],
      [1, 0, '“আমার!” (মিথ্যা উত্তর)', 'সমস্যা: ARP কাউকে যাচাই করে না। LAN-এর যে কেউ মিথ্যা উত্তর দিয়ে তোমার traffic নিজের কাছে টেনে নিতে পারে — ARP spoofing।', 'bad'],
    ] } },
  },
  'net-dns': {
    0: { anatomy: { title: 'একটি domain নাম — ডান থেকে বামে পড়তে হয়', parts: [
      ['www', 'Subdomain', 'Domain-এর মালিক যত খুশি বানাতে পারে: www, api, mail, shop…'],
      ['.', ''],
      ['example', 'Domain (SLD)', 'যে নামটা তুমি registrar থেকে কেনো।'],
      ['.', ''],
      ['com', 'TLD', 'Top-Level Domain — .com, .org, .bd, .dev। প্রতিটি TLD-র আলাদা server আছে।'],
      ['.', 'Root', 'শেষের অদৃশ্য dot — পুরো DNS গাছের শিকড়। পৃথিবীতে ১৩টি root server ঠিকানা (a–m)।'],
    ] } },
    2: { seq: { title: 'প্রথমবার example.com খুললে পর্দার আড়ালে', actors: [['💻', 'তুমি'], ['🏃', 'Resolver'], ['🌳', 'Root'], ['🏷️', '.com TLD'], ['📒', 'Authoritative']], msgs: [
      [0, 1, 'example.com-এর IP?', 'তোমার device ISP-র বা 1.1.1.1-এর মতো resolver-কে জিজ্ঞেস করে। বাকি দৌড়ঝাঁপ resolver-ই করে।'],
      [1, 2, 'example.com?', 'Resolver প্রথমে root server-কে জিজ্ঞেস করে।'],
      [2, 1, '.com-কে জিজ্ঞেস করো', 'Root উত্তর জানে না, কিন্তু জানে .com-এর দায়িত্বে কে।'],
      [1, 3, 'example.com?', 'এবার .com TLD server-কে।'],
      [3, 1, 'ওর nameserver ns1…', 'TLD বলে দেয় example.com-এর নিজস্ব (authoritative) server কোনটা।'],
      [1, 4, 'example.com?', 'শেষ প্রশ্ন — আসল মালিকের কাছে।'],
      [4, 1, 'A 93.184.216.34', 'আসল উত্তর, সাথে TTL (কতক্ষণ মনে রাখা যাবে)।', 'good'],
      [1, 0, '93.184.216.34', 'Resolver উত্তর দেয় এবং cache করে রাখে — পরের জন পাবে ১ ms-এ।', 'good'],
    ] } },
    3: { ask: ask('তোমার domain-এ আসা email কোন server-এ যাবে — সেটা কোন DNS record বলে?', ['MX', 'A', 'CNAME'], 0, 'MX = Mail eXchanger। A record নামকে IPv4-এ, আর CNAME এক নামকে আরেক নামে map করে।') },
  },
  'net-ports': {
    2: { anatomy: { title: 'একটি TCP connection-এর পরিচয় — 5-tuple', parts: [
      ['TCP', 'Protocol', 'TCP নাকি UDP — একই port number দুই protocol-এ আলাদা জিনিস।'],
      ['  ', ''],
      ['192.168.1.10', 'Source IP', 'তোমার device-এর ঠিকানা।'],
      [':', ''],
      ['51234', 'Source port', 'OS প্রতিটি নতুন connection-এ একটি সাময়িক (ephemeral) port দেয় — তাই একই site-এ ১০টি tab খুললেও গুলিয়ে যায় না।'],
      ['  →  ', ''],
      ['142.250.193.14', 'Destination IP', 'Server-এর ঠিকানা।'],
      [':', ''],
      ['443', 'Destination port', 'Server-এর কোন app — 443 মানে HTTPS।'],
    ] } },
    3: { ask: ask('PostgreSQL-কে 127.0.0.1:5432-এ bind করলে কারা connect করতে পারবে?', ['শুধু ওই একই machine-এর program', 'একই LAN-এর সব device', 'পুরো internet'], 0, '127.0.0.1 (loopback) মানে “শুধু আমি নিজে”। 0.0.0.0 মানে “সব network interface” — firewall না থাকলে পুরো পৃথিবী।') },
  },
  'net-routing': {
    1: { anatomy: { title: 'routing table-এর একটি লাইন', parts: [
      ['10.20.0.0/16', 'গন্তব্য network', 'Packet-এর destination IP এই সীমার ভেতরে পড়লে এই নিয়ম খাটবে।'],
      [' via ', ''],
      ['192.168.1.254', 'Next hop', 'নিজে পৌঁছাতে পারব না — packet-টা এই পাশের router-এর হাতে দাও।'],
      [' dev ', ''],
      ['eth0', 'Interface', 'কোন network card/তার দিয়ে বের হবে।'],
    ] } },
    2: { ask: ask('Packet যাবে 10.1.2.3-এ। Table-এ তিনটি route-ই মেলে। কোনটা জিতবে?', ['10.1.2.0/24', '10.1.0.0/16', '10.0.0.0/8'], 0, 'Longest Prefix Match — সবচেয়ে লম্বা prefix (/24) মানে সবচেয়ে নির্দিষ্ট ঠিকানা, তাই সেটাই জেতে। 0.0.0.0/0 (default route) সবার শেষে।') },
    4: { seq: { title: 'NAT — router ঠিকানা বদলে দেয়', actors: [['💻', 'PC 192.168.1.10'], ['📡', 'Router (NAT)'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'src 192.168.1.10:51000', 'PC private IP দিয়ে packet পাঠায়।'],
      [1, 1, 'table: 40001 ↔ .10:51000', 'Router একটি নতুন port বেছে NAT table-এ লিখে রাখে।'],
      [1, 2, 'src 203.0.113.5:40001', 'বাইরে যায় router-এর public IP দিয়ে। Server জানেই না ভেতরে কোন PC।'],
      [2, 1, 'dst 203.0.113.5:40001', 'Server উত্তর পাঠায় public IP-তে।'],
      [1, 0, 'dst 192.168.1.10:51000', 'Router table দেখে সঠিক PC-কে ফেরত দেয়।', 'good'],
      [2, 1, 'নতুন connection →', 'বাইরে থেকে কেউ নিজে শুরু করলে table-এ entry নেই — router ফেলে দেয়। তাই বাড়ির PC-তে server চালাতে port forwarding লাগে।', 'bad'],
    ] } },
  },
  'net-http': {
    0: { anatomy: { title: 'একটি URL-এর প্রতিটি টুকরো', parts: [
      ['https', 'Scheme', 'কোন protocol — https মানে TLS দিয়ে encrypt করা HTTP।'],
      ['://', ''],
      ['api.shop.com', 'Host', 'DNS দিয়ে এটা IP হয়; TLS certificate-ও এই নামের সাথে মেলানো হয়।'],
      [':', ''],
      ['443', 'Port', 'না লিখলে https-এ 443, http-তে 80 ধরে নেয়।'],
      ['/products/42', 'Path', 'Server-এর কোন resource চাই।'],
      ['?page=2&sort=price', 'Query', 'বাড়তি parameter। মনে রেখো: এগুলো server log ও browser history-তে থেকে যায় — গোপন কিছু এখানে নয়।'],
      ['#reviews', 'Fragment', 'শুধু browser-এর জন্য (page-এর কোন অংশে scroll) — server-এ যায়ই না।'],
    ] } },
    2: { seq: { title: 'HTTP/2 — একটাই connection, অনেক stream পাশাপাশি', actors: [['🌐', 'Browser'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'stream 1: GET /index.html', 'একটিমাত্র TCP+TLS connection খোলা হয়েছে।'],
      [0, 1, 'stream 3: GET /app.css', 'আগেরটার উত্তরের জন্য অপেক্ষা না করেই পরের request।'],
      [0, 1, 'stream 5: GET /app.js', 'তিনটি request একসাথে উড়ছে।'],
      [1, 0, 'stream 3: css (ছোট, আগে শেষ)', 'যেটা আগে তৈরি, সেটা আগে আসে — লাইনে দাঁড়াতে হয় না।', 'good'],
      [1, 0, 'stream 1 + 5: টুকরো টুকরো মিশিয়ে', 'বড় response-গুলো frame-এ ভেঙে মিশিয়ে পাঠায় (multiplexing)।', 'good'],
    ] } },
    4: { seq: { title: 'WebSocket — HTTP দিয়ে শুরু, তারপর দরজা খোলা', actors: [['🌐', 'Browser'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'GET /chat  Upgrade: websocket', 'সাধারণ HTTP request, সাথে অনুরোধ: “protocol বদলাই?”'],
      [1, 0, '101 Switching Protocols', 'Server রাজি। এই TCP connection এখন আর HTTP নয়।', 'good'],
      [0, 1, '“হাই!”', 'Client যখন খুশি পাঠাতে পারে…'],
      [1, 0, '“রাফি typing…”', '…আর server-ও নিজে থেকে পাঠাতে পারে — request ছাড়াই। এটাই HTTP-র সাথে বড় পার্থক্য।', 'good'],
      [1, 0, '“নতুন message”', 'Connection খোলা থাকে যতক্ষণ না কেউ বন্ধ করে।'],
    ] } },
  },
  'net-tls': {
    0: { seq: { title: 'TLS ছাড়া (HTTP) — মাঝের যে কেউ পড়তে পারে', actors: [['🧑', 'তুমি'], ['🕵️', 'ক্যাফের Wi-Fi'], ['🏦', 'Bank']], msgs: [
      [0, 1, 'password=1234', 'তোমার data Wi-Fi router, ISP — অনেক হাত ঘুরে যায়।'],
      [1, 1, '👀 পড়ে নিল', 'খোলা পোস্টকার্ডের মতো — পথের যে কেউ পড়তে পারে।', 'bad'],
      [1, 2, 'password=1234 (বা বদলানো!)', 'শুধু পড়া নয় — মাঝপথে বদলেও দিতে পারে। Bank টেরই পাবে না।', 'bad'],
    ] } },
    2: { seq: { title: 'TLS 1.3 handshake', actors: [['🌐', 'Browser'], ['🖥️', 'Server']], msgs: [
      [0, 1, 'ClientHello + key share', '“আমি এই cipher-গুলো পারি, আর এই নাও আমার অর্ধেক চাবি।”'],
      [1, 0, 'ServerHello + key share', 'Server তার অর্ধেক চাবি দেয়। দুই অর্ধেক মিলিয়ে দুজনেই একই গোপন session key হিসাব করে — চাবিটা নিজে কখনো তারে যায় না।'],
      [1, 0, 'Certificate + signature 🔒', '“আমি সত্যিই shop.com — এই যে CA-র সই করা প্রমাণ।” এই অংশ থেকেই সব encrypted।', 'good'],
      [0, 0, 'certificate যাচাই', 'Browser দেখে: নাম মেলে? মেয়াদ আছে? বিশ্বস্ত CA সই করেছে?'],
      [0, 1, 'Finished + GET / 🔒', 'মাত্র ১ round trip-এ প্রস্তুত — সাথে সাথেই encrypted request।', 'good'],
    ] } },
    4: { ask: ask('Attacker মাঝখানে বসে নিজের বানানো certificate দেখাল। Browser কেন সেটা মানবে না?', ['কোনো বিশ্বস্ত CA সেটায় সই করেনি', 'Certificate-টা বেশি ছোট', 'Attacker-এর internet ধীর'], 0, 'Browser-এর ভেতরে বিশ্বস্ত CA-দের তালিকা আছে। shop.com নামে CA-র সই পেতে হলে domain-এর মালিকানা প্রমাণ করতে হয় — যা attacker পারে না।') },
  },
  'net-troubleshoot': {
    0: { layers: { title: '“Site খুলছে না” — নিচ থেকে উপরে এক এক করে পরীক্ষা', items: [
      ['🔌', '১. Link — তার/Wi-Fi যুক্ত?', '`ip a` — interface UP আছে? IP পেয়েছে? এটা না হলে উপরের কিছুই চলবে না।'],
      ['📡', '২. Gateway — router পর্যন্ত যাচ্ছে?', '`ping 192.168.1.1` — না গেলে সমস্যা তোমার LAN-এই।'],
      ['🌍', '৩. Internet — বাইরে যাচ্ছে?', '`ping 1.1.1.1` — IP দিয়ে গেলে routing ঠিক আছে।'],
      ['📒', '৪. DNS — নাম থেকে IP হচ্ছে?', '`dig example.com` — IP-তে ping যায় কিন্তু নামে যায় না? তাহলে দোষ DNS-এর।'],
      ['🚪', '৫. Port — server শুনছে?', '`nc -vz example.com 443` — refused মানে app বন্ধ, timeout মানে firewall।'],
      ['🔒', '৬. TLS ও HTTP', '`curl -v https://example.com` — certificate ঠিক? status code কত?'],
    ] } },
    3: { ask: ask('`curl` বলছে “Connection refused”। সবচেয়ে সম্ভাব্য কারণ কী?', ['Server-এ পৌঁছেছে, কিন্তু ওই port-এ কোনো app শুনছে না', 'DNS নামটা খুঁজে পায়নি', 'মাঝপথে firewall চুপচাপ packet ফেলে দিচ্ছে'], 0, 'Refused মানে server নিজেই RST পাঠিয়ে “না” বলেছে — অর্থাৎ network ঠিক, app চালু নেই বা ভুল port। Firewall drop করলে হতো timeout; DNS সমস্যায় হতো “Could not resolve host”।') },
  },
  'net-advanced': {
    1: { anatomy: { title: 'VPN tunnel-এর ভেতরের packet', parts: [
      ['[ বাইরের IP: তুমি → VPN server ', 'বাইরের খাম', 'ISP আর Wi-Fi মালিক শুধু এটুকুই দেখে — তুমি একটা VPN server-এর সাথে কথা বলছ।'],
      ['[ 🔒 ', ''],
      ['ভেতরের IP: তুমি → আসল site', 'ভেতরের খাম (encrypted)', 'আসল গন্তব্য encrypt করা — পথের কেউ জানে না তুমি কোথায় যাচ্ছ।', 'good'],
      [' | ', ''],
      ['data', 'আসল data (encrypted)', 'VPN server খাম খুলে এটা আসল site-এ পাঠায়। মনে রেখো: এখন VPN কোম্পানি সব দেখতে পায় — বিশ্বাসটা শুধু ISP থেকে তাদের কাছে সরল।', 'good'],
      [' ]]', ''],
    ] } },
    3: { bars: { title: 'ঢাকার user-এর কাছে একটি ছবি পৌঁছাতে সময় (আনুমানিক)', items: [['🇺🇸 Origin (Virginia) থেকে', 250, '~২৫০ ms', 'bad'], ['🇸🇬 CDN edge (Singapore)', 50, '~৫০ ms'], ['🇧🇩 CDN edge (ঢাকা)', 8, '~৮ ms', 'good']] } },
    4: { ask: ask('Cloudflare-এর 1.1.1.1 একই IP পৃথিবীর শত শত শহর থেকে ঘোষণা করা হয়। ঢাকা থেকে ping করলে কোনটায় পৌঁছাবে?', ['Network-এর হিসেবে সবচেয়ে কাছেরটায়', 'সবসময় আমেরিকার মূল server-এ', 'এলোমেলোভাবে যেকোনো একটায়'], 0, 'এটাই Anycast — BGP routing নিজে থেকেই সবচেয়ে ছোট পথের ঘোষণাটা বেছে নেয়। একটা location ডুবে গেলে traffic পাশেরটায় চলে যায়।') },
  },
};
