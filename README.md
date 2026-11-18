# Engineering Academy — বাংলায় দেখে-ছুঁয়ে শেখো

শিক্ষানবিশদের জন্য বাংলায় interactive প্রযুক্তি কোর্স — 3D animation, 2D diagram, হাতে-কলমে lab, quiz আর এক পাতার cheatsheet। কোনো পূর্ব অভিজ্ঞতা লাগে না, কোনো account লাগে না।

🔗 **Live:** https://sabuj0338.github.io/academy/

| কোর্স | Level | Lesson | Lab |
|---|---|---|---|
| 🌐 নেটওয়ার্কিং — Internet আসলে কীভাবে চলে? | একদম শুরু থেকে | ১২ | ৩২ |
| 🏗️ সিস্টেম ডিজাইন — বড় app কীভাবে বানানো হয়? | শুরু → মাঝারি | ১৬ | ৩৭ |
| 🛡️ সিকিউরিটি — App-কে কীভাবে সুরক্ষিত রাখব? | শুরু → উন্নত | ৪০ | ৪৭ |
| ☁️ ক্লাউড ও ডেভঅপস — App নিজে কীভাবে চালাব? | শুরু → মাঝারি | ১২ | ২৭ |

প্রতিটি lesson-এ: “সহজ কথায়” ব্যাখ্যা, নতুন শব্দের tooltip, উপমা, ধাপে ধাপে চলা diagram, পড়ার মাঝে “থামো, ভাবো” প্রশ্ন, interactive lab, quiz, mind map + flashcard দিয়ে ঝালাই, আর cheatsheet। Code উদাহরণ JavaScript (Node.js / Express / React Native)-এ।

## চালাও

Node.js 22.12 বা নতুন লাগবে।

```bash
npm install
npm run dev        # http://localhost:5173/academy/
npm run build      # dist/ — static HTML, যেকোনো static host-এ চলে
npm run preview    # build করা site দেখো
```

`main`-এ push করলেই `.github/workflows/deploy.yml` build করে GitHub Pages-এ deploy করে।

## কীভাবে বানানো

- **[Astro 6](https://astro.build)** — প্রতিটি কোর্স, lesson ও cheatsheet-এর নিজস্ব static page (`/courses/net/`, `/learn/net-dns/`, `/handbook/sec/`)। Lesson-এর লেখা build-এর সময়ই HTML-এ থাকে।
- **React islands** — lesson player, lab, 3D scene ও উপরের nav browser-এ interactive হয় (`client:load`)।
- **Tailwind CSS v4** — page ও layout। Design token (`src/styles.css`) Tailwind রঙে map করা (`bg-panel`, `text-muted`, `border-line` …), তাই light/dark theme নিজে থেকেই কাজ করে।
- **Three.js / react-three-fiber** — 3D globe, 3D sequence, 3D architecture।
- অগ্রগতি, XP ও streak browser-এর localStorage-এ। সব simulation browser-এর ভেতরে — কোনো আসল network request যায় না।

## গঠন

| Path | কী আছে |
|---|---|
| `src/pages/` | Astro route: `index`, `courses/[id]`, `learn/[id]`, `handbook/[id]`, `404` |
| `src/layouts/Base.astro` | `<head>`, theme, nav, footer |
| `src/views/` | Page-এর React island: Home, CoursesPage, CoursePage, HandbookPage |
| `src/components/LessonView.jsx` | Lesson player (পাঠ · ল্যাব · কুইজ · চিটশিট) |
| `src/components/blocks.jsx` | পাঠের ভেতরের visual block-এর renderer |
| `src/data/courses.js` | **কোর্সের তালিকা** — title, level, যা শিখবে, শুরুর আগে, unit |
| `src/data/curriculum.js` | কোর্স, phase ও lesson জোড়া লাগানো + helper |
| `src/data/net/`, `src/data/sd/`, `src/data/phase1-6.js`, `src/data/cd/` | চার কোর্সের lesson |
| `src/data/visuals/` | ধাপে বাড়তি visual block — lesson data না ছুঁয়ে উপর থেকে জোড়া হয় |
| `src/labs/` | Lab engine (`viz/`, `engines/`), security lab (`custom/`), আর কোর্স-ভিত্তিক terminal/audit preset (`presets/`) |
| `src/lib/progress.js`, `src/lib/nav.js` | অগ্রগতির store, আর সব URL এক জায়গায় |

### নতুন কোর্স যোগ করা

1. `src/data/<course>/`-এ lesson file বানাও (বিদ্যমান lesson-এর গঠন অনুসরণ করো) আর একটি `index.js`-এ phase ও lesson export করো।
2. `src/data/courses.js`-এ কোর্সের একটি object যোগ করো (id, icon, title, level, outcomes, prerequisites, units …)। `upcoming` থেকে তার “শীঘ্রই আসছে” কার্ড সরিয়ে দাও।
3. `src/data/curriculum.js`-এ নতুন কোর্সের phase ও lesson `phases` আর `lessons` তালিকায় জুড়ে দাও।

Catalog card, course page, syllabus path, lesson page, cheatsheet — সব নিজে থেকেই তৈরি হবে। বেশিরভাগ lab-এর জন্য code লাগে না: `map`, `seq3d`, `globe`, `classify`, `terminal` engine-এ শুধু data দিলেই চলে।

### পাঠের ভেতরের visual block

যেকোনো ধাপে (lesson data-তে সরাসরি, অথবা `src/data/visuals/{net,sd,sec}.js`-এ `lessonId → ধাপের index` দিয়ে) নিচের field যোগ করলেই visual তৈরি হয়:

| Field | কী দেখায় | গঠন |
|---|---|---|
| `seq` | কে কাকে কী বলছে — এক এক করে চলা বার্তা | `{ title, actors: [[icon, নাম]], msgs: [[from, to, label, ব্যাখ্যা, 'bad'\|'good'?]] }` |
| `anatomy` | একটি লাইন (URL, JWT, log, config) টুকরো করে ব্যাখ্যা | `{ title, parts: [[text, label, ব্যাখ্যা, kind?]], note? }` — label ফাঁকা হলে সাধারণ লেখা, `\n` দিলে নতুন লাইন |
| `bars` | সংখ্যার তুলনা | `{ title, items: [[label, value, দেখানো লেখা, kind?]], scale?: 'sqrt'\|'log', note? }` |
| `layers` | স্তরে স্তরে সাজানো ধারণা | `{ title, items: [[icon, শিরোনাম, ব্যাখ্যা]] }` |
| `ask` | পড়ার মাঝে “থামো, ভাবো” প্রশ্ন | `{ q, options, answer, why }` |
| `maps` | উপমার জিনিস ≈ আসল জিনিস | `[[উপমা, আসল]]` |

এছাড়া নিজে থেকেই হয়: `terms`-এর শব্দ body-তে দাগানো ও tooltip, `points`-এর “Label: ব্যাখ্যা” থেকে tile, `chain` থেকে চলমান journey, code-এ syntax রং, আর শেষে mind map + flashcard সহ “ঝালাই” পর্দা।

ধাপের সরাসরি link: `/learn/<id>/#<ধাপ নম্বর | recap | lab | quiz | cheat>`।
