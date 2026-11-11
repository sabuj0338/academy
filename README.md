# Engineering Academy — বাংলায় Networking · System Design · Security

Interactive (2D + 3D + framer-motion) Software Engineering Masterclass — তিনটি learning track, একই শেখার ছন্দে:
Concept → Visual Simulation → Real-world Example → Hands-on Practice → Cheatsheet → Assessment।

| Track | Phase | Lesson | Lab |
|---|---|---|---|
| 🌐 Computer Networking | ১২ | ১২ | ৩২ |
| 🏗️ System Design | ১৬ | ১৬ | ৩৭ |
| 🛡️ Application & Infrastructure Security | ৬ | ৪০ | ৪৭ |

প্রতিটি lesson-এ: “সহজ কথায়” ব্যাখ্যা (১৪ বছরের ছাত্রও যেন বোঝে), মূল শব্দের tooltip, উপমা (analogy), animated chain/compare diagram, interactive lab, quiz ও pocket cheatsheet। Lesson-গুলো track-এর মধ্যে link করা (যেমন Networking-এর TLS ↔ Security-এর TLS hardening)।

## চালাও

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ — যেকোনো static host-এ deploy করা যায়
```

## গঠন

| Path | কী আছে |
|---|---|
| `src/data/curriculum.js` | তিনটি track, phase, lesson-এর কেন্দ্র; cross-track scenario map |
| `src/data/net/` | Networking track (12 phase) |
| `src/data/sd/` | System Design track (16 phase) |
| `src/data/phase1-6.js`, `simple.js` | Security track ও তার “সহজ কথায়” ব্যাখ্যা |
| `src/labs/viz/` | নতুন visual engine: Map (2D architecture flow), Seq3D (3D sequence diagram), Globe (3D পৃথিবী), Encapsulation, Subnet, TCP vs UDP, Wireshark, Routing/NAT, Keys (আসল WebCrypto), Estimate, Scale, Cache, Load Balancer, Shard, Queue, Circuit Breaker, CAP, Transaction, Index, Trace, Kubernetes |
| `src/labs/engines/` | Flow, Arch3D, Request, Audit, Terminal, Classify |
| `src/labs/custom/` | Security-specific lab (SQLi, XSS, JWT, …) |
| `src/labs/handlers.js`, `terminalPresets.js` | সিমুলেটেড backend ও terminal |

নতুন lesson যোগ করতে track-এর data file-এ একটি object যোগ করো। বেশিরভাগ ক্ষেত্রে `map`, `seq3d`, `globe`, `classify`, `terminal` engine-এ শুধু data দিলেই নতুন lab তৈরি হয় — code লাগে না।

অগ্রগতি browser-এর localStorage-এ থাকে। সব simulation browser-এর ভেতরে — কোনো আসল network request যায় না।
