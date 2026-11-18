// Cloud ও DevOps কোর্স — Lesson 09–12 (Kubernetes, Monitoring, Security ও খরচ, Capstone)
const ask = (q, options, answer, why) => ({ q, options, answer, why });

export default [
  // ─────────────────────────────── 09 · Kubernetes
  {
    id: 'cd-k8s',
    phase: 9,
    no: '09',
    icon: '☸️',
    title: 'Kubernetes — অনেক container-এর সেনাপতি',
    subtitle: 'Cluster, pod, deployment, service — scale, update আর নিজে সেরে ওঠা',
    duration: '৫৫–৬৫ মিনিট',
    simple: 'Docker একটা box চালায়। কিন্তু ১০০টা box, ১০টা computer জুড়ে, কোনোটা মরে গেলে নতুন একটা — এটা সামলাতে একজন সেনাপতি লাগে। Kubernetes (ছোট করে K8s) সেই সেনাপতি: তুমি বলো “আমার app-এর ৩টা copy সবসময় চালু রাখো”, বাকিটা সে দেখে।',
    goals: ['Compose থেকে Kubernetes কেন আর কখন', 'Cluster, node, pod-এর সম্পর্ক', 'Deployment ও Service লেখা', 'kubectl দিয়ে scale, update, rollback আর debug'],
    terms: [
      ['Cluster', 'একসাথে কাজ করা কয়েকটা machine + তাদের নিয়ন্ত্রক'],
      ['Node', 'Cluster-এর একটা worker machine'],
      ['Pod', 'K8s-এর সবচেয়ে ছোট একক — এক বা একাধিক container'],
      ['Deployment', '“এই image-এর এতগুলো pod সবসময় চালু রাখো” — ঘোষণা'],
      ['Service', 'বদলাতে থাকা pod-গুলোর জন্য একটা স্থায়ী ঠিকানা'],
      ['Ingress', 'বাইরের HTTP traffic cluster-এর ভেতরের service-এ আনার নিয়ম'],
      ['kubectl', 'Kubernetes-এর সাথে কথা বলার command-line tool'],
    ],
    steps: [
      {
        title: 'Compose থেকে Kubernetes কেন?',
        body: 'Docker Compose এক machine-এ চমৎকার। কিন্তু সেই machine মরে গেলে সব বন্ধ, আর ভিড় বাড়লে আরও machine যোগ করার উপায় নেই। Kubernetes অনেক machine-কে একটা বড় computer-এর মতো চালায়: কোন container কোথায় বসবে ঠিক করে, কোনোটা পড়ে গেলে নতুন বসায়, ভিড়ে আরও copy চালায়, আর নতুন version আনে কোনো downtime ছাড়া।',
        analogy: 'Orchestra-র conductor নিজে বাজান না — কে কখন বাজাবে, কে চুপ থাকবে, কেউ অসুস্থ হলে কে তার জায়গায় বসবে, সেটা ঠিক করেন। Kubernetes container-দের conductor; বাজায় container, তাল রাখে K8s।',
        compare: [
          { title: '🧩 Docker Compose', items: ['এক machine', 'Machine মরলে সব বন্ধ', 'শেখা সহজ', 'ছোট project, dev-এর জন্য দারুণ'] },
          { title: '☸️ Kubernetes', items: ['অনেক machine এক cluster-এ', 'Node মরলে pod অন্যখানে', 'শিখতে ও চালাতে বেশি পরিশ্রম', 'বড়, বেশি ভিড়ের app'] },
        ],
      },
      {
        title: 'Cluster, node ও pod',
        body: 'একটা cluster-এর দুই অংশ: control plane (মস্তিষ্ক — কোথায় কী চলবে ঠিক করে, সব হিসাব রাখে) আর worker node (হাত-পা — container আসলে এখানে চলে)। Kubernetes container সরাসরি চালায় না, চালায় pod — এক বা একাধিক container-এর ছোট দল, যারা একসাথে জন্মায়, একসাথে মরে, একই IP ভাগ করে।',
        layers: {
          title: 'Cluster-এর ভেতরে (বড় থেকে ছোট)',
          items: [
            ['🧠', 'Control plane', 'Cluster-এর মস্তিষ্ক — scheduler, API server, হিসাবের খাতা (etcd)'],
            ['🖥️', 'Node', 'একটা worker machine (সাধারণত VM) — pod এখানে চলে'],
            ['🫛', 'Pod', 'সবচেয়ে ছোট একক — এক বা একাধিক container, একই IP'],
            ['📦', 'Container', 'তোমার Docker image থেকে চলা app'],
          ],
        },
      },
      {
        title: 'Deployment — “কী চাই” লিখে দাও',
        body: 'Terraform-এর মতোই Kubernetes declarative: তুমি YAML-এ লেখো কী চাই — “shop-api-এর ৩টা pod, এই image, এই port।” Kubernetes সারাক্ষণ মিলিয়ে দেখে কী চাওয়া হয়েছে আর আসলে কী চলছে, আর পার্থক্য মেটায় (reconcile loop)। একটা pod মরে গেলে চাওয়া ৩, আছে ২ — তাই নিজেই নতুন একটা বানায়।',
        code: [{ label: 'deployment.yaml', lang: 'yaml', text: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-api
spec:
  replicas: 3                          # সবসময় ৩টা copy
  selector:
    matchLabels: { app: shop-api }
  template:
    metadata:
      labels: { app: shop-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/shopbd/api:1.4.2
          ports: [{ containerPort: 3000 }]
          readinessProbe:              # প্রস্তুত হলে তবেই traffic
            httpGet: { path: /health, port: 3000 }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits: { memory: 256Mi }` }],
        ask: ask('একটা pod crash করল। Kubernetes কী করবে?', ['নতুন pod চালিয়ে আবার ৩টা করবে', 'কিছুই না — তোমাকে হাতে চালাতে হবে', 'পুরো cluster বন্ধ করবে'], 0, 'চাওয়া ৩, আছে ২ — reconcile loop পার্থক্য মেটায়। এটাই self-healing।'),
      },
      {
        title: 'Service — বদলাতে থাকা pod-এর স্থায়ী ঠিকানা',
        body: 'Pod আসে-যায়, প্রতিবার নতুন IP। অন্য app তাহলে কাকে ডাকবে? Service একটা স্থায়ী নাম ও ঠিকানা দেয় (যেমন `shop-api`) আর পেছনের সুস্থ pod-গুলোতে request ভাগ করে — ছোট একটা load balancer। বাইরের internet থেকে traffic আনতে Ingress (বা cloud-এর load balancer)।',
        chain: [['🌐', 'Internet'], ['🚪', 'Ingress', 'shop.example.com'], ['🎯', 'Service', 'shop-api'], ['🫛', 'Pod ×3', 'যে কয়টা সুস্থ']],
        code: [{ label: 'service.yaml', lang: 'yaml', text: `apiVersion: v1
kind: Service
metadata:
  name: shop-api
spec:
  selector: { app: shop-api }     # এই label-ওয়ালা সব pod
  ports:
    - port: 80
      targetPort: 3000` }],
      },
      {
        title: 'Scale, update ও rollback',
        body: 'kubectl দিয়ে চলমান cluster-কে প্রশ্ন করো আর নির্দেশ দাও। নতুন image দিলে Kubernetes rolling update করে — নতুন pod আগে চালু, প্রস্তুত হলে তবেই একটা পুরনো সরে যায়। কিছু ভুল হলে এক command-এ আগের version।',
        code: [{ label: 'প্রতিদিনের kubectl', lang: 'bash', text: `kubectl get pods                          # কোন pod কেমন আছে
kubectl describe pod <name>               # কেন চালু হচ্ছে না?
kubectl logs deploy/shop-api --tail=50    # log
kubectl scale deploy/shop-api --replicas=5
kubectl set image deploy/shop-api api=ghcr.io/shopbd/api:1.5.0
kubectl rollout status deploy/shop-api    # rolling update দেখো
kubectl rollout undo deploy/shop-api      # আগের version-এ ফেরো` }],
        seq: {
          title: 'Rolling update — downtime ছাড়া নতুন version',
          actors: [['🧠', 'Kubernetes'], ['🟦', 'পুরনো pod (v1)'], ['🟩', 'নতুন pod (v2)']],
          msgs: [
            [0, 2, 'v2 pod #১ চালু', 'নতুনটা আগে আসে।'],
            [2, 0, 'readiness ✓', 'সত্যিই প্রস্তুত হলে তবেই traffic পায়।', 'good'],
            [0, 1, 'v1 pod #১ বন্ধ', 'তারপর একটা পুরনো সরে যায়।'],
            [0, 2, 'v2 pod #২, #৩ …', 'এক এক করে — user কোনো downtime টের পায় না।'],
            [0, 0, 'v2-তে error বাড়ছে?', 'kubectl rollout undo — এক command-এ আগের v1।', 'bad'],
          ],
        },
      },
      {
        title: 'শুরুতেই Kubernetes লাগবে কি?',
        body: 'সৎ উত্তর: বেশিরভাগ নতুন project-এর লাগে না। Kubernetes শক্তিশালী, কিন্তু শিখতে, চালাতে আর পাহারা দিতে সময় ও টাকা লাগে। ছোট দলে PaaS বা একটা server-এ Compose অনেক বেশি কাজের। লাগলে নিজে cluster না বানিয়ে managed Kubernetes নাও (EKS, GKE, AKS, DigitalOcean) — control plane ওরা সামলায়।',
        points: [
          '✅ লাগতে পারে: অনেক service, অনেক দল, হঠাৎ বাড়া-কমা ভিড়, multi-AZ বাধ্যতামূলক',
          '🤔 হয়তো না: একটা app, ছোট দল, স্থির traffic',
          '🧰 শিখতে চাইলে: নিজের laptop-এ kind বা minikube — বিনামূল্যে, ঝুঁকি নেই',
          '☁️ Production-এ: managed Kubernetes, নিজে control plane নয়',
        ],
        ask: ask('দুজনের দল, একটা Node.js app, দিনে কয়েকশো user। কোনটা বুদ্ধিমানের?', ['PaaS বা একটা server-এ Compose', 'নিজের হাতে বানানো Kubernetes cluster', 'তিনটা cloud-এ তিনটা cluster'], 0, 'জটিলতা তখনই আনো যখন সমস্যাটা সত্যিই এসেছে।'),
      },
    ],
    labs: [
      {
        type: 'k8s',
        title: 'Kubernetes playground',
        intro: 'তিনটা node, একটা Deployment। Replica বাড়াও-কমাও, একটা node “মেরে” দেখো pod কোথায় যায়, নতুন version rollout করো, আর traffic বাড়িয়ে autoscaling দেখো। সব কাজ শেষ হলে lab সম্পূর্ণ।',
      },
      {
        type: 'terminal',
        preset: 'kubectl',
        title: 'kubectl দিয়ে অসুস্থ app সারাও',
        intro: 'Deploy-এর পর থেকে shop-api-র একটা pod বারবার crash করছে। kubectl দিয়ে কারণ খোঁজো, rollback করো, তারপর ভিড় সামলাতে scale করো। আটকে গেলে “help”।',
      },
    ],
    quiz: [
      { q: 'Kubernetes-এ সবচেয়ে ছোট চালানোর একক কী?', options: ['Pod', 'Node', 'Cluster', 'Service'], answer: 0, explain: 'Container চলে pod-এর ভেতরে।' },
      { q: 'Deployment-এ replicas: 3 মানে?', options: ['সবসময় ৩টা pod চালু রাখো', '৩ জন user', '৩টা cluster', '৩ সেকেন্ড অপেক্ষা'], answer: 0, explain: 'Desired state — K8s মিলিয়ে রাখে।' },
      { q: 'Service কেন দরকার?', options: ['বদলাতে থাকা pod-গুলোর জন্য স্থায়ী ঠিকানা', 'Image বানাতে', 'Log মুছতে', 'Node কিনতে'], answer: 0, explain: 'Pod-এর IP বদলায়, service-এর নাম বদলায় না।' },
      { q: 'readinessProbe-এর কাজ?', options: ['Pod সত্যিই প্রস্তুত হলে তবেই traffic পাঠানো', 'Pod মুছে দেওয়া', 'Image ছোট করা', 'Password রাখা'], answer: 0, explain: 'Rolling update-এ downtime এড়ায়।' },
      { q: 'নতুন version-এ সমস্যা — দ্রুততম উপায়?', options: ['kubectl rollout undo', 'Cluster মুছে নতুন বানানো', 'User-দের অপেক্ষা করতে বলা', 'Node restart'], answer: 0, explain: 'এক command-এ আগের version।' },
    ],
    cheat: {
      category: 'Kubernetes',
      severity: 'design',
      summary: 'Cluster = control plane + node। Deployment বলে কী চাই (image, replicas), K8s মিলিয়ে রাখে। Service দেয় স্থায়ী ঠিকানা। Readiness probe ছাড়া rolling update নয়। শুরুতে K8s বাধ্যতামূলক নয়।',
      rules: ['Readiness probe সবসময়', 'Resource request/limit সেট', 'Image tag নির্দিষ্ট, :latest নয়', 'Rollback এক command-এ', 'নিজে নয়, managed cluster'],
      checklist: ['kubectl get pods — সব Running?', 'CrashLoopBackOff হলে describe + logs', 'replicas ≥ 2?', 'HPA দরকার?'],
      commands: ['kubectl get pods -o wide', 'kubectl describe pod <name>', 'kubectl rollout undo deploy/<name>', 'kubectl scale deploy/<name> --replicas=5'],
      remember: 'তুমি বলো “কী চাই”, Kubernetes দেখে “কী আছে” — আর পার্থক্য মেটায়।',
    },
    related: ['sd-deploy', 'sd-lb', 'sd-scaling'],
  },

  // ─────────────────────────────── 10 · Monitoring
  {
    id: 'cd-observe',
    phase: 10,
    no: '10',
    icon: '📊',
    title: 'Monitoring ও alert — app ঠিক আছে তো?',
    subtitle: 'Log, metric, health check, alert আর incident-এর পরের শিক্ষা',
    duration: '৪৫–৫৫ মিনিট',
    simple: 'App চালু করে ঘুমাতে গেলে কীভাবে জানবে রাত ৩টায় site বন্ধ হয়ে গেছে? Monitoring হলো হাসপাতালের রোগীর monitor — হৃদস্পন্দন (request), জ্বর (error), রক্তচাপ (CPU) সারাক্ষণ মাপে, আর বিপদ হলে নার্সকে (তোমাকে) ডেকে তোলে।',
    goals: ['Log, metric আর trace-এর পার্থক্য', 'কী মাপবে — চারটা সোনালি সংকেত', 'Health check ও বাইরে থেকে uptime monitor', 'কাজের alert, SLO আর incident-এর পরের postmortem'],
    terms: [
      ['Monitoring', 'App ও server-এর অবস্থা সারাক্ষণ মাপা'],
      ['Log', 'প্রতিটা ঘটনার লেখা — কখন, কী, কার'],
      ['Metric', 'সময়ের সাথে বদলানো সংখ্যা — প্রতি সেকেন্ডে request, error %'],
      ['Alert', 'সীমা পেরোলে মানুষকে খবর দেওয়া'],
      ['Uptime check', 'বাইরে থেকে নিয়মিত site খুলে দেখা চালু কিনা'],
      ['SLO', 'Service Level Objective — নির্ভরযোগ্যতার লক্ষ্য, যেমন 99.9%'],
      ['Postmortem', 'Incident-এর পরে দোষারোপহীন বিশ্লেষণ — কেন হলো, কীভাবে আর না হয়'],
    ],
    steps: [
      {
        title: 'User-এর আগে তুমি জানবে',
        body: 'Monitoring ছাড়া সমস্যার খবর আসে user-এর রাগী message বা social media থেকে — ততক্ষণে ক্ষতি হয়ে গেছে। Monitoring থাকলে সমস্যা শুরু হওয়ার কয়েক মিনিটের মধ্যে তুমি জানো, কখন থেকে, কোন অংশে — আর অনেক সময় user টের পাওয়ার আগেই ঠিক।',
        analogy: 'হাসপাতালের monitor ছাড়া নার্সকে প্রতি ঘণ্টায় গিয়ে নাড়ি দেখতে হতো, আর মাঝের সময়ে কিছু হলে কেউ জানত না। Monitor সারাক্ষণ দেখে, আর বিপদে নিজেই ঘণ্টা বাজায়।',
        compare: [
          { title: '🙈 Monitoring ছাড়া', items: ['User জানায় — ঘণ্টা পরে', '“কখন থেকে?” অজানা', 'অনুমান করে debug', 'একই সমস্যা আবার'] },
          { title: '📊 Monitoring সহ', items: ['Alert আসে মিনিটে', 'Graph-এ ঠিক কখন শুরু', 'Log ও metric দেখে কারণ', 'Postmortem — আর না হয়'] },
        ],
      },
      {
        title: 'Log, metric, trace — তিন চোখ',
        body: 'তিনটা আলাদা জিনিস, তিনটা আলাদা প্রশ্নের উত্তর দেয়। শুরুতে log আর metric-ই যথেষ্ট; অনেক service হলে trace লাগে (System Design কোর্সের observability lesson-এ বিস্তারিত)।',
        points: [
          '📜 Log: “কী ঘটল?” — order 981-এর payment ব্যর্থ, কারণ card declined',
          '📈 Metric: “কতটা, কত দ্রুত?” — প্রতি সেকেন্ডে ২৪০ request, error 0.4%',
          '🧵 Trace: “কোথায় সময় গেল?” — একটা request API → database → payment ঘুরে কোথায় আটকাল',
        ],
        tip: 'Log লেখো JSON-এ (structured) — তাহলে “গত ১ ঘণ্টায় user 7-এর সব error” এক search-এ পাওয়া যায়। আর password বা card নম্বর কখনো log-এ নয়।',
      },
      {
        title: 'কী মাপবে — চারটা সোনালি সংকেত',
        body: 'সব কিছু মাপার দরকার নেই। Google-এর SRE দল চারটা সংকেতকে বলে “golden signals” — এগুলো দেখলেই বোঝা যায় user-রা কেমন অভিজ্ঞতা পাচ্ছে।',
        layers: {
          title: 'চারটা সোনালি সংকেত',
          items: [
            ['⏱️', 'Latency — কত সময় লাগছে', 'p95: ১০০ জনের মধ্যে সবচেয়ে ধীর ৫ জন বাদে বাকিরা কত দ্রুত উত্তর পেল — গড়ের চেয়ে অনেক সৎ সংখ্যা'],
            ['📈', 'Traffic — কত request', 'প্রতি সেকেন্ডে request — হঠাৎ কমে যাওয়াও বিপদের লক্ষণ (হয়তো কেউ ঢুকতেই পারছে না)'],
            ['❌', 'Errors — কতগুলো ব্যর্থ', '5xx response-এর শতকরা হার'],
            ['🫗', 'Saturation — কতটা ভরা', 'CPU, RAM, disk, database connection — ১০০% হওয়ার আগেই সতর্ক হও'],
          ],
        },
      },
      {
        title: 'Health check ও uptime monitor',
        body: 'App-এ একটা `/health` endpoint রাখো যা শুধু “বেঁচে আছি” নয়, database-এ পৌঁছানো যায় কিনা-ও দেখে। Load balancer আর Kubernetes এটা দিয়ে অসুস্থ server চেনে। আর একটা বাইরের uptime monitor (যেমন UptimeRobot, Better Stack) প্রতি মিনিটে এটা খুলে দেখে — পুরো server বন্ধ হলে ভেতরের monitoring-ও তো বন্ধ, তখন বাইরের চোখই একমাত্র ভরসা।',
        code: [{ label: 'Express · health endpoint', lang: 'js', text: `app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');            // database-এ পৌঁছানো যাচ্ছে?
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: 'db_down' });
  }
});` }],
      },
      {
        title: 'কাজের alert, অকাজের alert',
        body: 'Alert শুধু তখনই, যখন একজন মানুষের এখনই কিছু করা দরকার। “CPU এক মুহূর্তের জন্য 81%” নয় — “৫ মিনিট ধরে user-দের ৫%-এর বেশি request ব্যর্থ।” অপ্রয়োজনীয় alert-এ ভরে গেলে মানুষ সব alert উপেক্ষা করতে শেখে (alert fatigue) — তখন আসল বিপদটাও চোখ এড়ায়।',
        seq: {
          title: 'রাত ৩টার একটা incident',
          actors: [['📊', 'Monitoring'], ['📟', 'Alert'], ['🧑‍💻', 'On-call engineer'], ['⚙️', 'App']],
          msgs: [
            [0, 0, 'error rate 12% (৫ মিনিট ধরে)', 'সীমা ২% — অনেক বেশি।', 'bad'],
            [0, 1, 'alert fire', 'নিয়ম মিলে গেছে।'],
            [1, 2, '📱 phone বাজে', 'Slack, SMS বা call।'],
            [2, 0, 'dashboard দেখা', 'কখন থেকে? কোন endpoint? শেষ deploy কখন?'],
            [2, 3, 'শেষ release rollback', '১৫ মিনিট আগের deploy-এর পর থেকেই সমস্যা।', 'good'],
            [0, 0, 'error rate 0.3% ✓', 'Alert নিজে থেকে resolve হলো।', 'good'],
          ],
        },
        ask: ask('কোন alert সবচেয়ে কাজের?', ['“৫ মিনিট ধরে ৫%-এর বেশি request ব্যর্থ”', '“CPU এক মুহূর্তের জন্য 81%”', '“কেউ login করেছে”'], 0, 'User-দের উপর প্রভাব + কিছুক্ষণ ধরে চলছে = সত্যিই কাজ দরকার।'),
      },
      {
        title: 'SLO ও incident-এর পরের শিক্ষা',
        body: 'SLO হলো নির্ভরযোগ্যতার লক্ষ্য — যেমন “মাসে 99.9% request সফল।” 100% অসম্ভব আর অপ্রয়োজনীয়; লক্ষ্যের নিচের অংশটা তোমার “error budget” — নতুন feature আনার ঝুঁকি নেওয়ার জায়গা। আর প্রতিটা বড় incident-এর পর একটা postmortem লেখো: কী হলো, কেন, কীভাবে টের পেলাম, আর কী বদলালে আর হবে না। দোষ মানুষের নয়, ব্যবস্থার।',
        bars: { title: 'মাসে কতক্ষণ বন্ধ থাকা চলবে', scale: 'log', items: [['99%', 438, '~৭.৩ ঘণ্টা', 'bad'], ['99.9%', 43.8, '~৪৪ মিনিট'], ['99.99%', 4.4, '~৪ মিনিট', 'good']] },
        tip: 'Postmortem-এ প্রশ্ন “কে ভুল করল?” নয়, “ব্যবস্থা কেন ভুলটা হতে দিল?” — তাহলে মানুষ সৎভাবে বলে, আর আসল কারণ বেরিয়ে আসে।',
      },
    ],
    labs: [
      {
        type: 'map',
        title: 'Monitoring pipeline — সংকেত থেকে মানুষ পর্যন্ত',
        intro: 'App থেকে metric আর log কোথায় যায়, alert কীভাবে মানুষের phone-এ পৌঁছায়, আর পুরো server বন্ধ হলে বাইরের uptime monitor কেন দরকার — তিনটা mode দেখো।',
        height: 340,
        nodes: [
          { id: 'app', x: 8, y: 45, icon: '⚙️', label: 'App', sub: '/metrics, log' },
          { id: 'prom', x: 30, y: 22, icon: '📈', label: 'Metrics', sub: 'Prometheus' },
          { id: 'loki', x: 30, y: 72, icon: '📜', label: 'Logs', sub: 'Loki' },
          { id: 'graf', x: 52, y: 45, icon: '🖥️', label: 'Dashboard', sub: 'Grafana' },
          { id: 'alert', x: 70, y: 22, icon: '📟', label: 'Alertmanager' },
          { id: 'oncall', x: 90, y: 45, icon: '🧑‍💻', label: 'On-call' },
          { id: 'uptime', x: 70, y: 80, icon: '🛰️', label: 'Uptime monitor', sub: 'বাইরে থেকে' },
        ],
        edges: [['app', 'prom'], ['app', 'loki'], ['prom', 'graf'], ['loki', 'graf'], ['prom', 'alert'], ['alert', 'oncall'], ['uptime', 'app'], ['uptime', 'oncall'], ['graf', 'oncall']],
        modes: [
          { id: 'normal', name: 'স্বাভাবিক দিন', hops: [
            { paths: [['app', 'prom'], ['app', 'loki']], label: 'metric + log', desc: 'App প্রতি কয়েক সেকেন্ডে সংখ্যা দেয়, আর প্রতিটা ঘটনা লেখে।' },
            { paths: [['prom', 'graf'], ['loki', 'graf']], label: 'dashboard', status: 'ok', desc: 'সব এক জায়গায় — latency, traffic, error, saturation।' },
          ] },
          { id: 'incident', name: 'Error বাড়ল', kind: 'fail', hops: [
            { path: ['app', 'prom'], label: 'error 12%', status: 'evil', desc: 'নতুন release-এর পর checkout ব্যর্থ হচ্ছে।' },
            { path: ['prom', 'alert'], label: 'rule: >2% for 5m', desc: 'Alert-এর নিয়ম মিলে গেল।' },
            { path: ['alert', 'oncall'], label: '📱 page', desc: 'On-call engineer-এর phone বাজল।' },
            { path: ['oncall', 'graf'], label: 'কখন থেকে?', desc: 'Dashboard: ঠিক শেষ deploy-এর পর থেকে।' },
            { path: ['oncall', 'app'], label: 'rollback ✓', status: 'ok', desc: 'আগের version — error 0.3%। তারপর postmortem।' },
          ] },
          { id: 'down', name: 'পুরো server বন্ধ', kind: 'fail', down: ['app', 'prom', 'loki'], hops: [
            { path: ['app', 'prom'], label: 'কোনো সংকেত নেই', status: 'blocked', desc: 'Server-এর disk নষ্ট — app, ভেতরের monitoring সব বন্ধ। ভেতরের কেউ alert দিতে পারছে না!' },
            { path: ['uptime', 'app'], label: 'GET /health ✗', status: 'blocked', desc: 'বাইরের uptime monitor প্রতি মিনিটে চেষ্টা করে — উত্তর নেই।' },
            { path: ['uptime', 'oncall'], label: '📱 site down', status: 'ok', desc: 'বাইরের চোখই একমাত্র ভরসা হলো। শিক্ষা: monitoring-এর একটা অংশ সবসময় বাইরে রাখো।' },
          ] },
        ],
      },
      {
        type: 'terminal',
        preset: 'oncall',
        title: 'On-call: site বন্ধ কেন?',
        intro: 'Uptime monitor alert দিয়েছে: health check 503 দিচ্ছে। Server-এ ঢুকে কারণ খোঁজো আর ঠিক করো — নিচ থেকে উপরে, একটা একটা করে। আটকে গেলে “help”।',
      },
      {
        type: 'classify',
        title: 'Log, metric না trace?',
        intro: 'প্রতিটা প্রশ্নের উত্তর কোন জিনিস দেখে পাবে?',
        buckets: [{ id: 'log', label: '📜 Log', color: '#38bdf8' }, { id: 'metric', label: '📈 Metric', color: '#a78bfa' }, { id: 'trace', label: '🧵 Trace', color: '#4ade80' }],
        items: [
          { text: 'Order 981-এর payment কেন ব্যর্থ হলো?', bucket: 'log', explain: 'নির্দিষ্ট একটা ঘটনার বিবরণ — log।' },
          { text: 'User 7 গতকাল কী কী error পেয়েছে?', bucket: 'log', explain: 'নির্দিষ্ট user-এর ঘটনা — structured log-এ search।' },
          { text: 'কে admin panel-এ login করেছিল?', bucket: 'log', explain: 'Audit log।' },
          { text: 'গত ১ ঘণ্টায় error rate কত?', bucket: 'metric', explain: 'সময়ের সাথে সংখ্যা — metric।' },
          { text: 'Disk কত দ্রুত ভরছে?', bucket: 'metric', explain: 'Saturation metric।' },
          { text: 'p95 latency কি বাড়ছে?', bucket: 'metric', explain: 'Latency metric।' },
          { text: 'Checkout ধীর — API, database না payment service-এ সময় যাচ্ছে?', bucket: 'trace', explain: 'একটা request-এর পুরো পথ — trace।' },
          { text: 'কোন service অন্য service-কে কতবার ডাকছে?', bucket: 'trace', explain: 'Service-এর মধ্যের যোগাযোগ — trace।' },
        ],
      },
    ],
    quiz: [
      { q: 'চারটা golden signal কী কী?', options: ['Latency, traffic, errors, saturation', 'CPU, RAM, disk, GPU', 'Log, trace, alert, dashboard', 'Dev, staging, prod, test'], answer: 0, explain: 'User-এর অভিজ্ঞতার চারটা দিক।' },
      { q: 'বাইরের uptime monitor কেন দরকার?', options: ['পুরো server বন্ধ হলে ভেতরের monitoring-ও বন্ধ থাকে', 'দাম কম', 'Log লেখে', 'Code compile করে'], answer: 0, explain: 'ভেতরের চোখ অন্ধ হলে বাইরের চোখ।' },
      { q: 'কোনটা ভালো alert?', options: ['৫ মিনিট ধরে error rate ৫%-এর বেশি', 'CPU এক সেকেন্ডের জন্য 81%', 'প্রতিটা login', 'প্রতিটা deploy'], answer: 0, explain: 'User-এর উপর প্রভাব + স্থায়ী।' },
      { q: 'SLO 99.9% মানে মাসে মোটামুটি কতক্ষণ বন্ধ থাকা চলে?', options: ['~৪৪ মিনিট', '~৭ ঘণ্টা', 'একদম শূন্য', '~৩ দিন'], answer: 0, explain: '০.১% × ৩০ দিন ≈ ৪৩.৮ মিনিট।' },
      { q: 'Postmortem-এর মূল প্রশ্ন?', options: ['ব্যবস্থা কেন ভুলটা হতে দিল, কীভাবে আর না হয়', 'কে দোষী', 'কাকে বরখাস্ত করা হবে', 'কিছু না, ভুলে যাও'], answer: 0, explain: 'দোষারোপহীন — তাহলে সত্যিকারের কারণ বেরোয়।' },
    ],
    cheat: {
      category: 'Monitoring',
      severity: 'design',
      summary: 'Log = কী ঘটল, metric = কতটা, trace = কোথায় সময় গেল। Golden signals মাপো, /health রাখো, বাইরে uptime monitor। Alert শুধু user-এর উপর প্রভাব থাকলে। Incident-এর পর দোষারোপহীন postmortem।',
      rules: ['/health database-ও যাচাই করে', 'একটা uptime monitor বাইরে', 'Alert = মানুষের এখনই কিছু করা দরকার', 'Log-এ password/card নয়', 'প্রতিটা বড় incident-এ postmortem'],
      checklist: ['Error rate ও p95 latency-র alert আছে?', 'Disk ৮০%-এ সতর্কবার্তা?', 'Alert কার phone-এ যায়?', 'শেষ postmortem-এর কাজ শেষ?'],
      commands: ['curl -s localhost:3000/health', 'docker compose logs --since 10m api', 'kubectl logs deploy/shop-api --since=10m', 'df -h && free -h'],
      remember: 'যা মাপো না, তা ঠিক করতে পারো না।',
    },
    related: ['sd-observability', 'logs', 'incident'],
  },

  // ─────────────────────────────── 11 · Security ও খরচ
  {
    id: 'cd-secops',
    phase: 11,
    no: '11',
    icon: '🔐',
    title: 'Cloud security ও খরচ নিয়ন্ত্রণ',
    subtitle: 'IAM, least privilege, secret, MFA — আর বিলের উপর পাহারা',
    duration: '৫০–৬০ মিনিট',
    simple: 'Cloud account মানে এমন একটা ব্যাংক account যার chequebook-এর কোনো সীমা নেই। একটা ফাঁস হওয়া চাবি (access key) দিয়ে কেউ রাতারাতি শত শত server চালিয়ে crypto mining করতে পারে — বিল আসবে তোমার নামে। তাই দুটো কাজ: কে কী করতে পারবে সীমিত রাখো (IAM), আর খরচের উপর পাহারা বসাও (budget alert)।',
    goals: ['Cloud-এ সবচেয়ে বড় ঝুঁকিগুলো', 'IAM: user, role, policy আর least privilege', 'Access key-এর বদলে role, root account আর MFA', 'Budget alert ও খরচ কমানোর অভ্যাস'],
    terms: [
      ['IAM', 'Identity and Access Management — কে, কী, কোথায় করতে পারবে'],
      ['Policy', 'অনুমতির তালিকা — কোন কাজ, কোন জিনিসের উপর'],
      ['Role', 'App বা service-এর জন্য সাময়িক পরিচয় — চাবি নিজে নিজে বদলায়'],
      ['Least privilege', 'শুধু যতটুকু দরকার, ঠিক ততটুকু অনুমতি'],
      ['Access key', 'Cloud API-তে ঢোকার দীর্ঘমেয়াদি চাবি — ফাঁস হলে বিপদ'],
      ['MFA', 'Password ছাড়াও phone বা key দিয়ে দ্বিতীয় যাচাই'],
      ['Budget alert', 'খরচ একটা সীমা পেরোলে email/notification'],
    ],
    steps: [
      {
        title: 'সবচেয়ে বড় ঝুঁকি: ভুল setting আর ফাঁস চাবি',
        body: 'Cloud-এ বেশিরভাগ দুর্ঘটনা জটিল hacking নয় — সাধারণ ভুল: সবার জন্য খোলা storage bucket, public database, আর GitHub-এ ভুলে push হওয়া access key। Bot-রা সারাক্ষণ public repo খোঁজে; key পাওয়ার কয়েক মিনিটের মধ্যে ব্যবহার শুরু হয়ে যায়।',
        seq: {
          title: 'একটা ফাঁস হওয়া key-এর গল্প',
          actors: [['👩‍💻', 'Developer'], ['🐙', 'Public GitHub'], ['🤖', 'Bot'], ['☁️', 'Cloud account']],
          msgs: [
            [0, 1, 'git push (ভুলে .env সহ)', 'AKIA… দিয়ে শুরু হওয়া access key commit হয়ে গেল।', 'bad'],
            [2, 1, 'নতুন public commit scan', 'কয়েক মিনিটের মধ্যেই bot key খুঁজে পেল।', 'bad'],
            [2, 3, '১০০টা বড় server চালু করো', 'Crypto mining শুরু।', 'bad'],
            [3, 0, '💸 বিল: হাজার হাজার ডলার', 'পরের দিন সকালে email।', 'bad'],
            [0, 3, 'key বাতিল + budget alert', 'প্রতিকার: key কখনো code-এ নয়; ফাঁস হলে সাথে সাথে বাতিল; budget alert আগেই সতর্ক করত।', 'good'],
          ],
        },
      },
      {
        title: 'IAM — কে, কী, কোথায়',
        body: 'IAM-এ তিনটা জিনিস: user (মানুষ), role (app বা service-এর পরিচয়), আর policy (অনুমতির তালিকা)। Policy বলে কোন কাজ (Action) কোন জিনিসের উপর (Resource) করা যাবে। কিছু না লেখা মানেই নিষেধ। নিয়ম একটাই: least privilege — ঠিক যতটুকু দরকার, তার বেশি এক বিন্দুও না।',
        anatomy: {
          title: 'একটা IAM policy পড়া',
          parts: [
            ['{ "Effect": "Allow",', 'Effect', 'অনুমতি দাও (Allow) বা নিষেধ করো (Deny)। কিছু না লিখলে default নিষেধ।'],
            ['\n', ''],
            ['  "Action": ["s3:GetObject", "s3:PutObject"],', 'Action', 'ঠিক কোন কাজ — এখানে শুধু ফাইল পড়া ও রাখা। "s3:*" বা "*" মানে সব কাজ — বিপজ্জনক।', 'good'],
            ['\n', ''],
            ['  "Resource": "arn:aws:s3:::shopbd-media/*" }', 'Resource', 'কোন জিনিসের উপর — শুধু এই একটা bucket-এর ফাইল। "*" মানে account-এর সবকিছু।', 'good'],
          ],
        },
        ask: ask('ছবি upload করার app-এর কোন অনুমতি লাগবে?', ['শুধু নির্দিষ্ট bucket-এ s3:PutObject', 'AdministratorAccess — ঝামেলা কম', 'সব bucket-এ সব কাজ'], 0, 'App-এ bug থাকলে attacker ঠিক ততটুকুই পারবে যতটুকু app পারে। কম অনুমতি = কম ক্ষতি।'),
      },
      {
        title: 'Access key নয়, role ব্যবহার করো',
        body: 'Access key হলো দীর্ঘমেয়াদি চাবি — ফাইলে লেখা থাকে, ফাঁস হয়, বছরের পর বছর কাজ করে। Role-এ কোনো লেখা চাবি নেই: cloud server-এ role জুড়ে দিলে সে নিজে থেকে কয়েক ঘণ্টার সাময়িক চাবি পায়, যা নিজেই বদলায়। GitHub Actions থেকেও OIDC দিয়ে key ছাড়াই cloud-এ deploy করা যায়।',
        compare: [
          { title: '🔑 দীর্ঘমেয়াদি access key', color: '#ef4444', items: ['.env বা code-এ লেখা থাকে', 'ফাঁস হলে বছরের পর বছর কাজ করে', 'হাতে বদলাতে হয়', 'কে ব্যবহার করছে বোঝা কঠিন'] },
          { title: '🎭 Role / OIDC', color: '#22c55e', items: ['কোথাও লেখা চাবি নেই', 'সাময়িক চাবি, নিজে বদলায়', 'ঠিক কোন server/workflow পাবে তা নির্দিষ্ট', 'Audit log-এ পরিষ্কার'] },
        ],
      },
      {
        title: 'Root account, MFA ও secret',
        body: 'Cloud account খোলার পর প্রথম ঘণ্টায় কয়েকটা কাজ করে ফেলো — পরে মনে থাকে না, আর বিপদ আসে ঠিক তখনই।',
        points: [
          '👑 Root account: শুধু billing-এর মতো বিরল কাজে; দৈনন্দিন কাজে আলাদা user বা SSO',
          '📱 MFA: root আর সব মানুষের login-এ',
          '🗝️ Secret: Secrets Manager বা Parameter Store-এ — code বা image-এ নয়',
          '🪣 Storage bucket: public access block চালু রাখো',
          '🔐 Encryption: disk ও database-এ চালু (বেশিরভাগ জায়গায় এক click)',
          '📝 Audit log (যেমন CloudTrail): কে কী করল তার খাতা চালু রাখো',
        ],
        warn: 'Root account-এর access key কখনো বানাবে না। এই চাবি দিয়ে account-এর সবকিছু — billing সহ — নিয়ন্ত্রণ করা যায়, আর কোনো policy দিয়ে সীমিত করা যায় না।',
      },
      {
        title: 'খরচের পাহারা',
        body: 'Cloud-এর বিল চুপচাপ বাড়ে — ভুলে যাওয়া test server, মুছতে ভুলে যাওয়া disk, NAT gateway-র data। প্রথম দিনেই budget alert বসাও (যেমন মাসে ১০ ডলার পেরোলেই email)। সবকিছুতে tag দাও (project, env, owner) — তাহলে বিলে বোঝা যায় কোন টাকা কোথায় গেল।',
        ask: ask('শেখার জন্য cloud account খোলার পর প্রথম কাজ কোনটা?', ['MFA চালু আর budget alert বসানো', 'সবচেয়ে বড় server চালানো', 'Root access key বানিয়ে laptop-এ রাখা'], 0, 'দুটো কাজ, দশ মিনিট — আর বড় দুর্ঘটনা থেকে বাঁচা।'),
        bars: { title: 'একটা ছোট শেখার account-এ “রহস্যময়” বিলের সাধারণ উৎস (উদাহরণ)', items: [['ভুলে চালু রাখা server', 45, 'সবচেয়ে বেশি', 'bad'], ['মুছতে ভুলে যাওয়া disk/snapshot', 20, 'নিয়মিত'], ['NAT gateway', 20, 'ঘণ্টা + data'], ['Data transfer (egress)', 15, 'video/ছবি বেশি হলে']], note: 'সংখ্যাগুলো উদাহরণ — তোমার বিলের Cost Explorer দেখে আসল উৎস খোঁজো।' },
      },
      {
        title: 'খরচ কমানোর অভ্যাস',
        body: 'খরচ কমানো মানে কৃপণতা নয় — যা কাজে লাগছে না তার টাকা না দেওয়া। কয়েকটা অভ্যাস বেশিরভাগ বিল অনেক কমিয়ে দেয়।',
        points: [
          '🌙 Dev/test server রাতে ও ছুটিতে বন্ধ (schedule দিয়ে)',
          '📏 Right-size: সারা মাস CPU 5%? ছোট server নাও',
          '📈 Auto-scaling: ভিড়ে বাড়াও, ফাঁকায় কমাও',
          '🗄️ পুরনো log ও backup সস্তা storage class-এ',
          '🧹 অব্যবহৃত disk, snapshot, IP, load balancer মুছে ফেলো',
          '🌐 CDN দিয়ে ছবি/video দাও — egress কমে',
        ],
        tip: 'প্রতি মাসে ১৫ মিনিট বিল খুলে দেখো “সবচেয়ে বড় ৫টা খরচ কী, আর কেন?” — এই একটা অভ্যাসই অনেক টাকা বাঁচায়।',
      },
    ],
    labs: [
      {
        type: 'audit',
        preset: 'iam',
        title: 'IAM ও bucket policy review',
        intro: 'একটা startup-এর cloud setting review করো: app-এর IAM policy, storage bucket-এর policy আর deploy script। প্রতিটা বিপজ্জনক লাইনে ক্লিক করো — কেন ঝুঁকি, কীভাবে ঠিক করবে।',
      },
      {
        type: 'classify',
        title: 'টাকা বাঁচায়, টাকা নষ্ট, নাকি নিরাপত্তা ঝুঁকি?',
        intro: 'প্রতিটা অভ্যাস বা setting সঠিক বাক্সে রাখো।',
        buckets: [{ id: 'save', label: '💚 খরচ বাঁচায় / ভালো অভ্যাস', color: '#4ade80' }, { id: 'waste', label: '💸 টাকা নষ্ট', color: '#fbbf24' }, { id: 'risk', label: '🚨 নিরাপত্তা ঝুঁকি', color: '#f87171' }],
        items: [
          { text: 'Budget alert মাসে ২০ ডলারে', bucket: 'save', explain: 'বিপদের আগেই খবর।' },
          { text: 'Dev server রাত ১০টা থেকে সকাল ৮টা বন্ধ', bucket: 'save', explain: 'দিনের প্রায় অর্ধেক সময়ের বিল বাঁচে।' },
          { text: 'সব resource-এ project ও env tag', bucket: 'save', explain: 'কোন টাকা কোথায় — পরিষ্কার।' },
          { text: 'তিন মাস আগের test-এর snapshot এখনো আছে', bucket: 'waste', explain: 'চুপচাপ প্রতি মাসে বিল।' },
          { text: 'সারা মাস CPU 3% — বিশাল server', bucket: 'waste', explain: 'Right-size করো।' },
          { text: 'কোনো server-এ জুড়ে নেই এমন disk', bucket: 'waste', explain: 'Unattached volume — মুছে ফেলো।' },
          { text: 'App-এর policy-তে "Action": "*"', bucket: 'risk', explain: 'App ভাঙলে attacker পুরো account পায়।' },
          { text: 'Root account-এ MFA নেই', bucket: 'risk', explain: 'এক password-এই সব।' },
          { text: 'Access key GitHub repo-তে', bucket: 'risk', explain: 'Bot মিনিটে খুঁজে পায়।' },
        ],
      },
    ],
    quiz: [
      { q: 'Least privilege মানে?', options: ['শুধু যতটুকু দরকার ততটুকু অনুমতি', 'সবাইকে admin', 'কাউকে কোনো অনুমতি নয়', 'শুধু রাতে অনুমতি'], answer: 0, explain: 'কম অনুমতি = ভুল বা আক্রমণে কম ক্ষতি।' },
      { q: 'Cloud server-এ app চালাতে access key-এর চেয়ে ভালো কী?', options: ['Role — সাময়িক, নিজে বদলানো চাবি', 'Key code-এ লিখে রাখা', 'Root-এর key', 'Key email-এ পাঠানো'], answer: 0, explain: 'কোথাও লেখা চাবি নেই, তাই ফাঁসের ভয় নেই।' },
      { q: 'Policy-তে "Resource": "*" মানে?', options: ['Account-এর সবকিছুর উপর', 'কিছুই না', 'শুধু একটা bucket', 'শুধু আজকের জন্য'], answer: 0, explain: 'যতটা সম্ভব নির্দিষ্ট resource লেখো।' },
      { q: 'Access key ভুল করে public হয়ে গেলে প্রথম কাজ?', options: ['Key সাথে সাথে বাতিল (deactivate/delete)', 'Repo private করা — ব্যস', 'অপেক্ষা করা', 'নতুন account খোলা'], answer: 0, explain: 'Bot ইতিমধ্যে copy করেছে ধরে নাও।' },
      { q: 'বিলের অপ্রত্যাশিত বৃদ্ধি আগে টের পাওয়ার উপায়?', options: ['Budget alert', 'বড় server', 'Root access key', 'বেশি region'], answer: 0, explain: 'সীমা পেরোলেই email।' },
    ],
    cheat: {
      category: 'Cloud Security & Cost',
      severity: 'high',
      summary: 'IAM-এ least privilege, Action/Resource-এ "*" নয়। Access key নয় — role ও OIDC। Root-এ MFA, root key কখনো নয়। Secret secret manager-এ। প্রথম দিন budget alert, সবকিছুতে tag, অব্যবহৃত জিনিস মুছে ফেলো।',
      rules: ['Action বা Resource-এ "*" নয়', 'App-এর জন্য role, মানুষের জন্য MFA', 'Root শুধু billing-এ', 'Bucket-এ public access block', 'Budget alert + tag'],
      checklist: ['Root-এ MFA?', 'কোনো access key ৯০ দিনের বেশি পুরনো?', 'Public bucket আছে?', 'এই মাসের বড় ৫টা খরচ জানি?'],
      commands: ['aws iam list-access-keys --user-name <user>', 'aws s3api get-public-access-block --bucket <name>', 'aws ce get-cost-and-usage --time-period Start=2026-11-01,End=2026-11-30 --granularity MONTHLY --metrics UnblendedCost'],
      remember: 'Cloud-এ সবচেয়ে দামি ভুল হলো খোলা দরজা — আর খোলা বিল।',
    },
    related: ['secrets', 'encryption', 'sd-advanced'],
  },

  // ─────────────────────────────── 12 · Capstone
  {
    id: 'cd-capstone',
    phase: 12,
    no: '12',
    icon: '🏁',
    title: 'Capstone — idea থেকে production',
    subtitle: 'Git, Docker, CI/CD, Terraform, cloud, monitoring — সব জোড়া লাগানো',
    duration: '৬০–৭০ মিনিট',
    simple: 'এতক্ষণ শেখা সব টুকরো এবার জোড়া লাগাও: code লেখা (Git) → box-এ ভরা (Docker) → নিজে test ও deploy (CI/CD) → cloud-এ ঘর বানানো (Terraform, VPC) → চালানো (Kubernetes বা PaaS) → পাহারা (monitoring) → নিরাপত্তা ও খরচ। এই lesson-এ একটা ছোট online দোকানকে শুরু থেকে production পর্যন্ত নিয়ে যাবে।',
    goals: ['পুরো DevOps pipeline এক নজরে', 'App-এর বয়স অনুযায়ী ঠিক মাত্রার জটিলতা বাছা', 'Dev, staging, production আর একই image promote করা', 'Production-readiness checklist আর খারাপ দিনের মহড়া'],
    terms: [
      ['Production', 'আসল user-রা যেখানে app ব্যবহার করে'],
      ['Environment', 'App চালানোর আলাদা জায়গা — dev, staging, production'],
      ['Release', 'User-দের কাছে নতুন version পৌঁছানো'],
      ['Promote', 'Staging-এ পরীক্ষিত একই image production-এ পাঠানো'],
      ['Runbook', 'চেনা সমস্যায় ধাপে ধাপে কী করতে হবে তার লেখা'],
      ['Production readiness', 'আসল user আনার আগে যেসব ব্যবস্থা থাকা চাই'],
    ],
    steps: [
      {
        title: 'পুরো যাত্রা এক নজরে',
        body: 'একটা feature-এর জন্ম থেকে user-এর হাতে পৌঁছানো পর্যন্ত প্রতিটা ধাপ এই কোর্সের একটা lesson। কোনো ধাপ বাদ দিলে সমস্যাটা পরের কোনো ধাপে — আরও দামি হয়ে — ফিরে আসে।',
        chain: [['💻', 'Code', 'Git branch'], ['🐙', 'Pull request', 'review'], ['🧪', 'CI', 'lint + test'], ['📦', 'Image', 'registry'], ['🏗️', 'Infra', 'Terraform'], ['☸️', 'Run', 'K8s / PaaS'], ['📊', 'Monitor', 'alert']],
        analogy: 'রেস্টুরেন্টের রান্নাঘর: রেসিপি লেখা (code), মালিকের চেখে দেখা (review), রান্নার মান পরীক্ষা (CI), প্যাকেট করা (image), দোকান সাজানো (infra), খাবার পরিবেশন (deploy), আর খদ্দেরের মুখ দেখা (monitoring)। একটাও বাদ দিলে কোনো এক দিন খদ্দের অসুস্থ হবে।',
      },
      {
        title: 'ধাপে ধাপে বড় হও — শুরুতেই সব নয়',
        body: 'সবচেয়ে প্রচলিত ভুল: ১০ জন user-এর জন্য Netflix-এর মতো architecture বানানো। জটিলতা আনো ঠিক তখন, যখন সমস্যাটা আসে। প্রতিটা ধাপে নিচের জিনিসগুলো (Git, CI, monitoring, backup) কিন্তু সবসময় লাগে।',
        layers: {
          title: 'App-এর বয়স অনুযায়ী setup',
          items: [
            ['🌱', 'শুরু (০–হাজারখানেক user)', 'PaaS (Render, Railway) + managed database — git push-এই deploy, মাসে কয়েক ডলার'],
            ['🌿', 'বাড়ছে', 'একটা-দুটো VM-এ Docker Compose, Terraform দিয়ে infra, GitHub Actions দিয়ে deploy'],
            ['🌳', 'বড়', 'Managed Kubernetes, multi-AZ, autoscaling, আলাদা staging, on-call rotation'],
          ],
        },
        ask: ask('নতুন startup, দুজন developer, একশো user। কোন setup বুদ্ধিমানের?', ['PaaS + managed database', 'নিজস্ব ৩-node Kubernetes cluster', 'তিনটা region-এ সব কিছু'], 0, 'এখন দরকার দ্রুত feature বানানো। Infrastructure চালাতে সময় দিলে product পিছিয়ে পড়ে।'),
      },
      {
        title: 'Dev, staging, production',
        body: 'তিনটা আলাদা environment: dev (নিজের laptop, Compose), staging (production-এর ছোট copy, আসল user-এর data নয়), production (আসল user)। মূল নিয়ম: image একবারই build হয়, তারপর সেই একই image staging থেকে production-এ “promote” হয় — আবার build নয়। তাহলে যা test হয়েছে, ঠিক সেটাই চলে।',
        chain: [['💻', 'Dev', 'docker compose'], ['📦', 'Build একবার', 'shop-api:a1b2c3d'], ['🧫', 'Staging', 'একই image'], ['🚀', 'Production', 'একই image']],
        tip: 'Staging আর production-এর পার্থক্য যত কম, staging-এর পরীক্ষা তত বিশ্বাসযোগ্য — একই Terraform code, শুধু variable আলাদা।',
      },
      {
        title: 'Production-readiness checklist',
        body: 'আসল user আনার আগে নিচের তালিকা মিলিয়ে নাও। প্রতিটা লাইন এই কোর্সের কোনো না কোনো lesson থেকে।',
        points: [
          '🩺 Health check: /health database-ও দেখে, load balancer ব্যবহার করে',
          '📊 Monitoring: error rate, latency-র alert + বাইরের uptime monitor',
          '💾 Backup: স্বয়ংক্রিয়, আর restore অন্তত একবার পরীক্ষা করা',
          '🔑 Secret: secret manager-এ — code, image বা repo-তে নয়',
          '🔒 HTTPS ও network: database private subnet-এ, শুধু LB public',
          '↩️ Rollback: এক command-এ, আগে থেকে অনুশীলন করা',
          '💸 খরচ: budget alert, সবকিছুতে tag',
          '📖 Runbook: “site down হলে কী করব” লেখা আছে',
        ],
      },
      {
        title: 'খারাপ দিনের মহড়া',
        body: 'সব কিছু ঠিকঠাক থাকলেও একদিন খারাপ release যাবেই। ভালো DevOps মানে খারাপ দিন না আসা নয় — খারাপ দিনের প্রভাব ছোট রাখা আর দ্রুত সেরে ওঠা। নিচের গল্পে প্রতিটা ধাপ আগের কোনো lesson-এর।',
        seq: {
          title: 'একটা খারাপ release — শুরু থেকে শেষ',
          actors: [['🧑‍💻', 'Developer'], ['🤖', 'CI/CD'], ['☸️', 'Production'], ['📊', 'Monitoring'], ['📟', 'On-call']],
          msgs: [
            [0, 1, 'merge: v1.6 (নতুন checkout)', 'Review ও test পাস করেছে।'],
            [1, 2, 'canary deploy — ১০% traffic', 'প্রথমে অল্প কিছু user নতুন version পায়।'],
            [2, 3, 'checkout error 9%', 'Test-এ ধরা পড়েনি এমন একটা bug।', 'bad'],
            [3, 4, 'alert: error > 2% for 5m', 'On-call-এর phone বাজল।'],
            [4, 1, 'rollback → v1.5', 'এক command।', 'good'],
            [3, 4, 'error 0.2% ✓ resolved', 'মোট প্রভাব: ১০% user, ৬ মিনিট।', 'good'],
            [0, 0, 'postmortem + নতুন test', 'একই bug আর কখনো ফিরবে না।', 'good'],
          ],
        },
      },
      {
        title: 'এরপর কী?',
        body: 'DevOps শেখার সবচেয়ে ভালো উপায় নিজে একটা জিনিস শুরু থেকে শেষ পর্যন্ত চালানো। ছোট কিছু বানাও, আর এই কোর্সের প্রতিটা ধাপ তাতে প্রয়োগ করো।',
        points: [
          '🛠️ নিজের project: একটা ছোট Node.js app — Dockerfile, compose, GitHub Actions, একটা PaaS-এ deploy',
          '☁️ একটা cloud গভীরে: AWS, Google Cloud বা Azure-এর free tier দিয়ে Terraform-এ VPC + server',
          '☸️ Laptop-এ Kubernetes: kind বা minikube-এ নিজের app চালাও',
          '🏗️ System Design কোর্স: বড় হলে architecture কেমন হবে',
          '🛡️ Security কোর্স: যা বানালে, তাকে আক্রমণ থেকে বাঁচাও',
        ],
        tip: 'প্রতিটা ধাপ শেষে নিজেকে প্রশ্ন করো: “কাল সকালে এটা ভেঙে গেলে আমি কীভাবে জানব, আর কত দ্রুত ঠিক করব?”',
      },
    ],
    labs: [
      {
        type: 'map',
        title: 'Idea থেকে production — পুরো pipeline',
        intro: 'একটা online দোকানের পুরো DevOps ব্যবস্থা। প্রথম release, খারাপ release ও rollback, আর একটা AZ বন্ধ হওয়া — তিনটা mode দেখো।',
        height: 380,
        zones: [{ x: 58, y: 8, w: 40, h: 84, label: 'Cloud (Terraform দিয়ে বানানো)', color: '#22c55e' }],
        nodes: [
          { id: 'dev', x: 6, y: 50, icon: '👩‍💻', label: 'Developer' },
          { id: 'gh', x: 20, y: 25, icon: '🐙', label: 'GitHub', sub: 'PR + review' },
          { id: 'ci', x: 34, y: 25, icon: '🤖', label: 'CI/CD', sub: 'test, build' },
          { id: 'reg', x: 48, y: 50, icon: '🗄️', label: 'Registry', sub: 'image' },
          { id: 'tf', x: 20, y: 78, icon: '🏗️', label: 'Terraform', sub: 'infra code' },
          { id: 'lb', x: 66, y: 50, icon: '⚖️', label: 'Load balancer' },
          { id: 'podA', x: 82, y: 25, icon: '🫛', label: 'app AZ-a' },
          { id: 'podB', x: 82, y: 75, icon: '🫛', label: 'app AZ-b' },
          { id: 'mon', x: 94, y: 50, icon: '📊', label: 'Monitoring' },
        ],
        edges: [['dev', 'gh'], ['gh', 'ci'], ['ci', 'reg'], ['dev', 'tf'], ['tf', 'lb'], ['reg', 'podA'], ['reg', 'podB'], ['lb', 'podA'], ['lb', 'podB'], ['podA', 'mon'], ['podB', 'mon']],
        modes: [
          { id: 'first', name: 'প্রথম release', hops: [
            { path: ['dev', 'tf', 'lb'], label: 'terraform apply', desc: 'VPC, load balancer, cluster — সব code থেকে।' },
            { path: ['dev', 'gh', 'ci'], label: 'PR → merge', desc: 'Review আর সবুজ test-এর পরে main-এ।' },
            { path: ['ci', 'reg'], label: 'image a1b2c3d', desc: 'একবার build, commit-এর নামে tag।' },
            { paths: [['reg', 'podA'], ['reg', 'podB']], label: 'deploy', status: 'ok', desc: 'দুটো AZ-এ একই image।' },
            { paths: [['podA', 'mon'], ['podB', 'mon']], label: 'সব সবুজ', status: 'ok', desc: 'Monitoring চালু — user আসার আগেই।' },
          ] },
          { id: 'bad', name: 'খারাপ release → rollback', kind: 'fail', hops: [
            { path: ['reg', 'podA'], label: 'v1.6 canary', desc: 'প্রথমে শুধু একটা অংশে নতুন version।' },
            { path: ['podA', 'mon'], label: 'error 9%', status: 'evil', desc: 'Monitoring ধরে ফেলল।' },
            { path: ['mon', 'podA'], label: 'rollback → v1.5', status: 'ok', desc: 'আগের image registry-তে আছে — এক command-এ ফেরা। বাকি user কিছুই টের পায়নি।' },
          ] },
          { id: 'az', name: 'একটা AZ বন্ধ', kind: 'fail', down: ['podA'], hops: [
            { path: ['lb', 'podA'], label: 'health ✗', status: 'blocked', desc: 'AZ-a-তে বিদ্যুৎ বিভ্রাট।' },
            { path: ['lb', 'podB'], label: 'সব traffic AZ-b-তে', status: 'ok', desc: 'Multi-AZ-এর জন্যই site চালু।' },
            { path: ['podB', 'mon'], label: 'alert: capacity কম', desc: 'Monitoring জানাল — autoscaling AZ-b-তে আরও pod চালু করল।' },
          ] },
        ],
      },
      {
        type: 'classify',
        title: 'কোন ধাপ কোন সমস্যা ধরবে?',
        intro: 'প্রতিটা সমস্যা কোন পাহারাদার সবচেয়ে আগে ধরবে — test, মানুষের review, নাকি production monitoring?',
        buckets: [{ id: 'ci', label: '🧪 CI (test, lint, scan)', color: '#38bdf8' }, { id: 'review', label: '👀 Review (code বা plan)', color: '#a78bfa' }, { id: 'monitor', label: '📊 Monitoring ও alert', color: '#4ade80' }],
        items: [
          { text: 'যোগফল ভুল করা একটা function', bucket: 'ci', explain: 'Unit test-এর কাজ।' },
          { text: 'Dependency-তে জানা vulnerability', bucket: 'ci', explain: 'npm audit / scan।' },
          { text: 'অব্যবহৃত variable', bucket: 'ci', explain: 'Linter।' },
          { text: 'Terraform plan-এ database “destroy”', bucket: 'review', explain: 'মানুষের চোখে plan পড়া।' },
          { text: 'PR-এ hardcoded password', bucket: 'review', explain: 'Reviewer ধরে (secret scanner-ও সাহায্য করে)।' },
          { text: 'Security group-এ 0.0.0.0/0 থেকে database', bucket: 'review', explain: 'Infra code review।' },
          { text: 'রাত ৩টায় disk ১০০% ভরে যাওয়া', bucket: 'monitor', explain: 'Saturation alert।' },
          { text: 'নতুন release-এর পর error হঠাৎ বেড়ে যাওয়া', bucket: 'monitor', explain: 'Error rate alert।' },
          { text: 'SSL certificate-এর মেয়াদ শেষ হতে চলেছে', bucket: 'monitor', explain: 'বাইরের uptime/cert monitor।' },
        ],
      },
      {
        type: 'terminal',
        preset: 'devops',
        title: 'Ship it! — শেষ মহড়া',
        intro: 'একটা Node.js API-কে Docker image বানাও, চালাও, registry-তে push করো, Kubernetes-এ deploy করো, আর Terraform plan দেখো — পুরো কোর্স এক terminal-এ।',
      },
    ],
    quiz: [
      { q: 'একই image staging থেকে production-এ promote করার লাভ?', options: ['যা test হলো ঠিক সেটাই চলে', 'Build দ্রুত হয় — ব্যস', 'Production-এ test লাগে না', 'Staging মুছে ফেলা যায়'], answer: 0, explain: 'আবার build করলে ভিন্ন কিছু তৈরি হতে পারে।' },
      { q: 'নতুন, ছোট product-এর জন্য বুদ্ধিমানের setup?', options: ['PaaS + managed database', 'Multi-region Kubernetes', 'নিজের data center', 'কোনো CI নয়'], answer: 0, explain: 'জটিলতা আনো যখন দরকার।' },
      { q: 'Canary deploy-এর উদ্দেশ্য?', options: ['আগে অল্প user-কে নতুন version দিয়ে ঝুঁকি ছোট রাখা', 'সবাইকে একসাথে দেওয়া', 'Test বাদ দেওয়া', 'খরচ বাড়ানো'], answer: 0, explain: 'সমস্যা হলে কম মানুষ কম সময় ভোগে।' },
      { q: 'Backup থাকলেই কি যথেষ্ট?', options: ['না — restore পরীক্ষা না করলে জানোই না কাজ করে কিনা', 'হ্যাঁ', 'হ্যাঁ, যদি বড় হয়', 'Backup দরকারই নেই'], answer: 0, explain: 'Restore-এর মহড়াই আসল প্রমাণ।' },
      { q: 'খারাপ release-এর পর সঠিক ক্রম?', options: ['Rollback → শান্ত হয়ে কারণ খোঁজা → postmortem', 'Production-এ বসে debug', 'Postmortem আগে, rollback পরে', 'কিছু না করা'], answer: 0, explain: 'আগে user-দের কষ্ট থামাও।' },
    ],
    cheat: {
      category: 'DevOps Capstone',
      severity: 'design',
      summary: 'Git → PR → CI → image (একবার build) → staging → production → monitoring। App-এর বয়স অনুযায়ী জটিলতা। Health check, alert, পরীক্ষিত backup, secret manager, rollback, budget — আসল user আনার আগে।',
      rules: ['Image একবার build, তারপর promote', 'শুরুতে সহজ setup, দরকার হলে বড়', 'Canary/rolling + এক command-এ rollback', 'Backup-এর restore পরীক্ষা', 'প্রতিটা incident-এ postmortem'],
      checklist: ['Health check + uptime monitor?', 'Rollback অনুশীলন করা?', 'Restore পরীক্ষা করা?', 'Budget alert ও tag?', 'Runbook লেখা?'],
      commands: ['git switch -c feature && gh pr create', 'docker build -t app:$(git rev-parse --short HEAD) .', 'terraform plan', 'kubectl rollout undo deploy/app'],
      remember: 'ভালো DevOps মানে খারাপ দিন না আসা নয় — খারাপ দিন ছোট রাখা।',
    },
    related: ['capstone', 'sd-advanced'],
  },
];
