import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Bug,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  Flame,
  Globe,
  HardDrive,
  HelpCircle,
  Layers,
  Network,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Sliders,
  Sparkles,
  Trophy,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "../components/ui";

const CASE_STUDIES = [
  {
    id: "tinyurl",
    title: "Design TinyURL (URL Shortener)",
    difficulty: "Medium",
    traffic: "500M URLs/month · 10:1 Read-to-Write",
    summary: "High-throughput URL shortener with sub-10ms redirect latency, custom aliases, and 99.99% availability.",
    requirements: {
      functional: [
        "Given a long URL, generate a unique 7-character short URL (e.g., tinyurl.com/a9Z1x3)",
        "Redirect users to the original long URL with minimum latency (301 Permanent vs 302 Temporary)",
        "Allow users to specify optional custom aliases and link expiration dates"
      ],
      nonFunctional: [
        "High availability (99.99%) — redirects must almost never fail",
        "Sub-15ms redirect latency worldwide",
        "Short URLs should be non-predictable to prevent enumeration"
      ]
    },
    components: [
      { name: "Global DNS / CDN", role: "Routes incoming requests to nearest edge POP and caches hot redirects." },
      { name: "Load Balancer (Nginx/Envoy)", role: "Distributes incoming traffic across stateless URL redirect workers." },
      { name: "Key Generation Service (KGS)", role: "Pre-generates Base62 7-character hashes into an in-memory ring buffer to eliminate DB collisions." },
      { name: "Redis In-Memory Cache", role: "Stores 20% most frequently accessed URLs (80/20 rule) with LRU eviction." },
      { name: "NoSQL Key-Value DB (DynamoDB / Cassandra)", role: "Stores short_hash -> long_url mapping with billions of rows, partitioned by hash prefix." }
    ],
    deepDive: "Why Base62? [a-z, A-Z, 0-9] provides 62 characters. With a 7-character string, 62^7 ≈ 3.5 trillion distinct URLs, easily supporting 100 years of scale without collision."
  },
  {
    id: "netflix",
    title: "Design Netflix (Video Streaming & CDN)",
    difficulty: "Hard",
    traffic: "250M Subscribers · Peak 100Tbps Bandwidth",
    summary: "Global video streaming platform handling adaptive bitrate video transcoding, global metadata, and edge caching.",
    requirements: {
      functional: [
        "Upload master video files and transcode into multiple resolutions & formats (HLS/DASH 1080p, 4K, mobile)",
        "Stream video smoothly without buffering across fluctuating network bandwidth",
        "Track user viewing position for seamless cross-device resume"
      ],
      nonFunctional: [
        "Zero video stuttering / adaptive bitrate ladder switching within 1 segment",
        "Low latency content recommendation updates",
        "Scalable distributed storage capable of exabyte-scale video chunks"
      ]
    },
    components: [
      { name: "Ingestion & Transcoder Worker Pool", role: "Splits video into 2-4s chunks; encodes concurrently across bitrates and codecs (H.264, AV1)." },
      { name: "Open Connect / CDN Edge Appliances", role: "Deploys custom cache servers directly inside ISP networks worldwide to deliver 95%+ traffic locally." },
      { name: "Microservices Fleet (Control Plane)", role: "User auth, subscription checks, video catalog, and playback session tokens." },
      { name: "Cassandra User Playback DB", role: "Records bookmark offsets every 5 seconds; optimized for high write-rate time-series tracking." }
    ],
    deepDive: "Adaptive Bitrate Streaming (ABR): The video player measures connection bandwidth per chunk and dynamically downloads higher or lower resolution chunks without interrupting audio."
  },
  {
    id: "whatsapp",
    title: "Design Real-Time Chat (WhatsApp / Discord)",
    difficulty: "Hard",
    traffic: "2B Daily Users · 100B Messages/day",
    summary: "Low-latency bidirectional messaging system with end-to-end encryption, read receipts, and offline queues.",
    requirements: {
      functional: [
        "1-on-1 and group chat messaging with real-time delivery",
        "Message delivery statuses: Sent (✓), Delivered (✓✓), Read (blue ✓✓)",
        "Store messages for offline users and push immediately upon reconnection"
      ],
      nonFunctional: [
        "Real-time delivery under 100ms globally",
        "Zero message loss (at-least-once delivery with client deduping)",
        "End-to-End Encryption (Signal Protocol)"
      ]
    },
    components: [
      { name: "WebSocket Gateway Servers", role: "Maintains millions of persistent TCP/WebSocket connections using epoll/kqueue." },
      { name: "Session Registry (Redis Cluster)", role: "Maps active UserID -> specific Gateway Server Hostname so routing knows which socket to push to." },
      { name: "Message Broker / Queue (Kafka / RabbitMQ)", role: "Buffers incoming messages and routes group messages fan-out." },
      { name: "Offline Inbox DB (Cassandra/ScyllaDB)", role: "Appends messages for offline recipients; deletes or moves to cold archive once delivered." }
    ],
    deepDive: "WebSocket vs Polling: Long polling introduces high HTTP header overhead and socket tear-downs. Persistent WebSockets keep a single TCP channel open with minimal framing bytes."
  },
  {
    id: "rate-limiter",
    title: "Design a Distributed Rate Limiter",
    difficulty: "Medium",
    traffic: "500k QPS Public API Gateways",
    summary: "Prevent API abuse, DDoS attacks, and resource starvation across distributed multi-region server clusters.",
    requirements: {
      functional: [
        "Limit requests per client IP or API token (e.g. 100 requests / minute)",
        "Return HTTP 429 Too Many Requests with X-RateLimit-Reset headers when quota breached"
      ],
      nonFunctional: [
        "Extremely low latency overhead (<2ms added per request)",
        "Accurate counting across horizontal cluster nodes",
        "Memory efficiency: handle 50M active API keys concurrently"
      ]
    },
    components: [
      { name: "API Gateway Middleware", role: "Intercepts request before business logic, checks rate limiter, and attaches headers." },
      { name: "Redis Cluster with Lua Scripting", role: "Atomic increment and TTL verification in a single round-trip to prevent race conditions." },
      { name: "Sliding Window Log / Counter", role: "Tracks timestamps in a Redis Sorted Set (ZADD / ZREMRANGEBYSCORE) for precise windowing." }
    ],
    deepDive: "Race Condition Defense: Multiple concurrent requests could read counter = 99 and allow both through. Atomic Lua scripts executed directly in Redis ensure thread-safe increment-and-check."
  },
  {
    id: "uber",
    title: "Design Uber (Geospatial Ride Dispatch & Real-Time Driver Matching)",
    difficulty: "Hard",
    traffic: "20M Active Drivers · 1M Driver Pings/Sec",
    summary: "Real-time geospatial dispatch matching nearest drivers with riders in under 1 second using spatial indexing.",
    requirements: {
      functional: [
        "Track real-time driver GPS coordinates pinged every 4 seconds",
        "Given rider pickup location, find top 10 available drivers within a 3km radius",
        "Handle trip dispatch state machine (Requested -> Dispatched -> Arrived -> In-Trip -> Completed)"
      ],
      nonFunctional: [
        "Sub-1000ms driver search latency globally",
        "High availability — riders must be able to hail a ride even during regional failover",
        "Battery & bandwidth efficiency on mobile driver clients"
      ]
    },
    components: [
      { name: "Location Ingestion Gateway (Netty / Go)", role: "Ingests 1M UDP/WebSocket location pings/sec; terminates connections efficiently." },
      { name: "Geospatial Index Cluster (Uber H3 / QuadTree)", role: "Partitions earth into hierarchical hexagonal cells (H3 Resolution 8); enables O(1) neighboring cell lookups." },
      { name: "Dispatch Matchmaking Engine (Ringpop)", role: "Consistent hashing ring coordinating distributed locks on available drivers to prevent double-booking." },
      { name: "Persistent Trip Store (Cassandra / DynamoDB)", role: "Time-series append store tracking GPS trip routes and billing audit logs." }
    ],
    deepDive: "Why Uber H3 Hexagons over Geohash? All neighboring hexagon cells are equidistant from the center cell (unlike square Geohashes where diagonals are 1.414x further), eliminating directional bias in radius queries."
  },
  {
    id: "twitter",
    title: "Design Twitter / X (Celebrity Fan-Out & Real-Time Timelines)",
    difficulty: "Hard",
    traffic: "350M DAU · 500M Tweets/Day · 50k Reads/Sec",
    summary: "Distributed timeline architecture solving the 'Justin Bieber Problem' through hybrid Fan-Out on Write and Fan-Out on Read.",
    requirements: {
      functional: [
        "Users can publish tweets (text, images, links) up to 280 characters",
        "Users can view a real-time Home Timeline aggregating recent tweets from accounts they follow",
        "Support search by hashtag and full-text keyword"
      ],
      nonFunctional: [
        "Sub-200ms timeline load latency globally",
        "High availability (AP model) — slight timeline lag is acceptable over total outage",
        "Scalable fan-out capable of handling users with 100M+ followers"
      ]
    },
    components: [
      { name: "Timeline Cache (Redis Cluster)", role: "Pre-computed lists of 800 tweet IDs per active user stored in Redis in-memory Lists." },
      { name: "Fan-Out Service Worker Fleet", role: "For standard users (<25k followers), pushes new tweet IDs into all follower timeline caches on write." },
      { name: "Celebrity Read-Merge Engine", role: "For celebrity accounts (>1M followers), skips fan-out on write; dynamically merges celebrity tweets at read time." },
      { name: "Tweet Repository (Distributed Document Store)", role: "Stores raw tweet text, media URLs, and metadata partitioned by Tweet ID." }
    ],
    deepDive: "The Celebrity Problem (Fan-Out on Write Failure): If an account with 100M followers tweets, fan-out on write requires 100 million Redis writes simultaneously, choking message queues. Twitter solves this via a hybrid model: fan-out for ordinary users, merge-on-read for celebrities."
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "When scaling a database cluster to handle 100,000 read QPS and 5,000 write QPS, what is the most cost-effective first architectural step?",
    options: [
      "Shard the database across 10 physical machines",
      "Introduce a Redis Cache-Aside layer with read replicas",
      "Switch immediately from PostgreSQL to Cassandra",
      "Increase CPU and RAM on the single primary database instance"
    ],
    answer: 1,
    explanation: "With a 20:1 read-to-write ratio, caching 80% of hot reads in Redis and offloading remaining reads to read replicas shields the primary DB at a fraction of sharding complexity."
  },
  {
    question: "Why are Lua scripts preferred over standard multi-command transactions (MULTI/EXEC) when implementing a Rate Limiter in Redis?",
    options: [
      "Lua scripts execute asynchronously without blocking",
      "Lua scripts execute atomically on the Redis single thread, eliminating race conditions without distributed locks",
      "Lua scripts compress the data stored in memory",
      "Lua scripts do not require Redis memory keys"
    ],
    answer: 1,
    explanation: "Lua scripts run atomically within Redis's single execution thread, guaranteeing that increment and TTL checks occur without interference from concurrent requests."
  },
  {
    question: "In a real-time messaging app like WhatsApp, why is Cassandra or ScyllaDB preferred over a relational SQL database for message storage?",
    options: [
      "Cassandra provides ACID multi-table transactions",
      "Cassandra uses an append-only LSM tree architecture optimized for sequential high-write throughput and automatic horizontal partitioning",
      "Cassandra has built-in WebSocket servers",
      "Cassandra eliminates the need for any caching"
    ],
    answer: 1,
    explanation: "Log-Structured Merge (LSM) trees convert random writes into sequential disk writes, allowing Cassandra to effortlessly ingest billions of messages daily without B-tree page lock contention."
  },
  {
    question: "What is the primary danger of using consistent hashing WITHOUT virtual nodes (vnodes)?",
    options: [
      "Keys cannot be partitioned",
      "Non-uniform data distribution where one physical node receives a disproportionate traffic load (hotspotting)",
      "Hash collisions between strings",
      "Inability to use replica nodes"
    ],
    answer: 1,
    explanation: "Without virtual nodes, a few unlucky hash positions can lead to massive skew where a single physical machine receives 60%+ of all requests. Virtual nodes distribute thousands of points per machine across the ring."
  }
];

export default function SystemDesign() {
  const [activeTab, setActiveTab] = useState("simulator"); // 'simulator' | 'cases' | 'canvas' | 'chaos' | 'cap' | 'calculator' | 'quiz'
  
  // Chaos Engineering State
  const [chaosEvent, setChaosEvent] = useState(null); // 'redis_crash' | 'db_sever' | 'partition' | 'oom'
  const [chaosLogs, setChaosLogs] = useState([]);
  const [isMitigated, setIsMitigated] = useState(false);
  const [chaosTimer, setChaosTimer] = useState(0);

  // CAP Theorem State
  const [capScenario, setCapScenario] = useState("banking"); // 'banking' | 'social' | 'collab' | 'ecommerce'
  const [selectedCase, setSelectedCase] = useState(CASE_STUDIES[0]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Live Simulator State
  const [qps, setQps] = useState(25000); // 25k QPS
  const [hasRedis, setHasRedis] = useState(true);
  const [appPods, setAppPods] = useState(4);
  const [hasReplicas, setHasReplicas] = useState(true);
  const [hasKafka, setHasKafka] = useState(true);
  const [isSpike, setIsSpike] = useState(false);

  // Estimator State
  const [dau, setDau] = useState(10);
  const [requestsPerUser, setRequestsPerUser] = useState(25);
  const [readRatio, setReadRatio] = useState(90);
  const [payloadKb, setPayloadKb] = useState(2);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Live Simulator Telemetry Calculations
  const effectiveQps = isSpike ? qps * 10 : qps;
  const podCapacity = 8000; // each pod can handle 8k QPS
  const totalPodCapacity = appPods * podCapacity;
  const appCpu = Math.min(100, Math.round((effectiveQps / totalPodCapacity) * 100));

  // If Redis is disabled, 100% of read traffic hits DB!
  const dbDirectTraffic = hasRedis ? effectiveQps * 0.15 : effectiveQps;
  const dbCapacity = hasReplicas ? 40000 : 15000;
  const dbCpu = Math.min(100, Math.round((dbDirectTraffic / dbCapacity) * 100));

  const isDbOverloaded = dbCpu >= 95;
  const isAppOverloaded = appCpu >= 95;

  let latencyMs = 8;
  if (!hasRedis) latencyMs += 45;
  if (dbCpu > 70) latencyMs += Math.round((dbCpu - 70) * 1.5);
  if (appCpu > 80) latencyMs += Math.round((appCpu - 80) * 2);
  if (isDbOverloaded) latencyMs = 1250;

  const errorRate = isDbOverloaded ? 28.5 : isAppOverloaded ? 14.2 : 0.01;

  let healthStatus = "Optimal";
  let healthColor = "text-emerald-500";
  if (isDbOverloaded || isAppOverloaded) {
    healthStatus = "CRITICAL OUTAGE (504 Gateway Timeout)";
    healthColor = "text-rose-600";
  } else if (latencyMs > 50) {
    healthStatus = "Elevated Latency";
    healthColor = "text-amber-500";
  }

  // Estimator Calculations
  const totalDailyRequests = dau * 1_000_000 * requestsPerUser;
  const avgQps = Math.round(totalDailyRequests / 86400);
  const peakQps = Math.round(avgQps * 2.5);
  const readQps = Math.round(avgQps * (readRatio / 100));
  const writeQps = avgQps - readQps;
  const bandwidthMBs = ((avgQps * payloadKb) / 1024).toFixed(2);
  const dailyStorageGB = ((totalDailyRequests * payloadKb) / (1024 * 1024)).toFixed(2);
  const fiveYearStorageTB = ((dailyStorageGB * 365 * 5) / 1024).toFixed(1);
  const cacheRamGB = Math.round(dailyStorageGB * 0.2);

  const handleAnswer = (optionIdx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    setShowExplanation(true);
    if (optionIdx === QUIZ_QUESTIONS[quizIndex].answer) {
      setQuizScore((s) => s + 1);
      toast.success("Correct architecture choice!");
    } else {
      toast.error("Suboptimal design pattern.");
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-300">
              <Boxes size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Architecture Studio</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">System Design & Live Traffic Arena</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Master distributed systems architecture for Senior & Staff engineering interviews. Simulate real-time traffic spikes, stress-test bottleneck resilience, and solve production case studies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "simulator", label: "Live Traffic Simulator", icon: Zap },
              { id: "cases", label: "Case Studies", icon: Layers },
              { id: "canvas", label: "Architecture Canvas", icon: Network },
              { id: "chaos", label: "Chaos Monkey Lab", icon: Flame },
              { id: "cap", label: "CAP / PACELC Matrix", icon: ShieldAlert },
              { id: "calculator", label: "Scale Estimator", icon: Calculator },
              { id: "quiz", label: "System Design Quiz", icon: HelpCircle }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    activeTab === t.id
                      ? "bg-white text-slate-900 shadow-md"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE TRAFFIC SIMULATOR TAB */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          {/* Telemetry Dashboard Banner */}
          <div className="card p-6 sm:p-7 border-brand-200/80 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">System Telemetry & Health</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-3 w-3 rounded-full animate-ping ${isDbOverloaded ? "bg-rose-500" : "bg-emerald-500"}`} />
                  <h2 className={`text-xl font-extrabold ${healthColor}`}>{healthStatus}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSpike(!isSpike)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition shadow-md ${
                    isSpike
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <Flame size={15} />
                  {isSpike ? "Release 10x Spike (Active!)" : "Simulate 10x Spike (Black Friday)"}
                </button>
                <button
                  onClick={() => {
                    setQps(25000);
                    setHasRedis(true);
                    setAppPods(4);
                    setHasReplicas(true);
                    setHasKafka(true);
                    setIsSpike(false);
                  }}
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
                  title="Reset Simulator"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Incoming Traffic</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {effectiveQps.toLocaleString()} <span className="text-xs font-normal text-slate-500">QPS</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Requests per second</p>
              </div>

              <div className={`rounded-2xl border p-4 ${latencyMs > 100 ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-xs text-slate-500">P99 Latency</p>
                <p className={`mt-1 text-2xl font-extrabold ${latencyMs > 100 ? "text-rose-600" : "text-slate-900"}`}>
                  {latencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{latencyMs < 20 ? "Ultra-low edge speed" : "SLA Breached!"}</p>
              </div>

              <div className={`rounded-2xl border p-4 ${appCpu > 85 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-xs text-slate-500">App Fleet CPU ({appPods} Pods)</p>
                <p className={`mt-1 text-2xl font-extrabold ${appCpu > 85 ? "text-amber-600" : "text-slate-900"}`}>
                  {appCpu}%
                </p>
                <div className="mt-2"><ProgressBar value={appCpu} /></div>
              </div>

              <div className={`rounded-2xl border p-4 ${dbCpu > 85 ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-xs text-slate-500">Database Engine Load</p>
                <p className={`mt-1 text-2xl font-extrabold ${dbCpu > 85 ? "text-rose-600" : "text-slate-900"}`}>
                  {dbCpu}%
                </p>
                <div className="mt-2"><ProgressBar value={dbCpu} /></div>
              </div>
            </div>

            {/* Outage Warning Alert */}
            {isDbOverloaded && (
              <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">CRITICAL ARCHITECTURAL BOTTLENECK: Database Connection Exhaustion!</p>
                  <p className="mt-1 leading-relaxed">
                    Direct read traffic exceeded primary database IOPS limits. Without Redis cache, incoming queries triggered a connection storm.
                    <strong> Fix: Enable Redis Caching or add Read Replicas below to restore service.</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls & Animated SVG Flow */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Live Interactive Canvas */}
            <div className="card p-6 sm:p-7 space-y-6">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Network size={16} className="text-brand-600" />
                Live Architecture Topology
              </h3>

              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white space-y-6 relative overflow-hidden">
                {/* Visual Flow Stages */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="rounded-xl border border-sky-500/40 bg-sky-950/60 p-3 text-center min-w-[110px]">
                    <Globe size={18} className="mx-auto text-sky-400 mb-1" />
                    <p className="font-bold text-white">Clients</p>
                    <p className="text-[10px] text-sky-300">{effectiveQps.toLocaleString()} QPS</p>
                  </div>

                  <div className="text-slate-600 font-bold">➔</div>

                  <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/60 p-3 text-center min-w-[110px]">
                    <Network size={18} className="mx-auto text-indigo-400 mb-1" />
                    <p className="font-bold text-white">Edge CDN / LB</p>
                    <p className="text-[10px] text-indigo-300">SSL + Cache</p>
                  </div>

                  <div className="text-slate-600 font-bold">➔</div>

                  <div className={`rounded-xl border p-3 text-center min-w-[110px] transition ${
                    appCpu > 85 ? "border-rose-500 bg-rose-950/60" : "border-blue-500/40 bg-blue-950/60"
                  }`}>
                    <Server size={18} className="mx-auto text-blue-400 mb-1" />
                    <p className="font-bold text-white">{appPods} App Pods</p>
                    <p className="text-[10px] text-blue-300">{appCpu}% CPU</p>
                  </div>

                  <div className="text-slate-600 font-bold">➔</div>

                  <div className={`rounded-xl border p-3 text-center min-w-[110px] transition ${
                    hasRedis ? "border-emerald-500/50 bg-emerald-950/60" : "border-slate-800 bg-slate-900 opacity-40"
                  }`}>
                    <Zap size={18} className="mx-auto text-emerald-400 mb-1" />
                    <p className="font-bold text-white">Redis Cache</p>
                    <p className="text-[10px] text-emerald-300">{hasRedis ? "Active (<2ms)" : "DISABLED"}</p>
                  </div>

                  <div className="text-slate-600 font-bold">➔</div>

                  <div className={`rounded-xl border p-3 text-center min-w-[110px] transition ${
                    isDbOverloaded ? "border-rose-500 bg-rose-950/80 animate-pulse" : "border-purple-500/40 bg-purple-950/60"
                  }`}>
                    <Database size={18} className="mx-auto text-purple-400 mb-1" />
                    <p className="font-bold text-white">Postgres DB</p>
                    <p className="text-[10px] text-purple-300">{dbCpu}% Load</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/80 p-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Packet Flow: Client ➔ Cloudflare Edge ➔ Envoy Gateway ➔ Node.js ➔ Redis / DB</span>
                  <span className="text-emerald-400 font-bold">Streaming telemetry</span>
                </div>
              </div>
            </div>

            {/* Architecture Controls Panel */}
            <div className="card p-6 space-y-5">
              <h3 className="font-bold text-slate-900 text-sm">System Capacity Controls</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Base Traffic Load</span>
                    <span className="font-mono text-brand-600">{qps.toLocaleString()} QPS</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={qps}
                    onChange={(e) => setQps(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>App Cluster Replicas</span>
                    <span className="font-mono text-brand-600">{appPods} Container Pods</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={appPods}
                    onChange={(e) => setAppPods(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500" /> Redis In-Memory Cache</span>
                    <input
                      type="checkbox"
                      checked={hasRedis}
                      onChange={(e) => setHasRedis(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-1.5"><Database size={14} className="text-purple-500" /> DB Read Replicas (x3)</span>
                    <input
                      type="checkbox"
                      checked={hasReplicas}
                      onChange={(e) => setHasReplicas(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
                    <span className="flex items-center gap-1.5"><Radio size={14} className="text-teal-500" /> Kafka Async Write Buffer</span>
                    <input
                      type="checkbox"
                      checked={hasKafka}
                      onChange={(e) => setHasKafka(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE STUDIES TAB */}
      {activeTab === "cases" && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="card space-y-2 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-2">System Problems</p>
            {CASE_STUDIES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setSelectedComponent(null);
                }}
                className={`w-full rounded-xl p-3 text-left transition ${
                  selectedCase.id === c.id
                    ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${c.difficulty === "Hard" ? "text-rose-600" : "text-amber-600"}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-400">{c.traffic.split("·")[0]}</span>
                </div>
                <h3 className="mt-1 text-xs font-bold text-slate-900">{c.title}</h3>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <div className="card p-6 sm:p-7 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="badge bg-brand-50 text-brand-700 font-bold">{selectedCase.difficulty} Level</span>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{selectedCase.title}</h2>
                  <p className="mt-1 text-xs font-mono text-slate-500">Scale: {selectedCase.traffic}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">Executive Summary</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedCase.summary}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider">Functional Requirements</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-indigo-800">
                    {selectedCase.requirements.functional.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">Non-Functional Requirements</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-800">
                    {selectedCase.requirements.nonFunctional.map((nf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{nf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">Core Architecture Components</h3>
                <div className="mt-3 space-y-2">
                  {selectedCase.components.map((comp, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Server size={14} className="text-brand-600" />
                        {comp.name}
                      </p>
                      <p className="mt-1 text-slate-600 leading-relaxed">{comp.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <p className="font-bold text-amber-800 flex items-center gap-1.5">
                  <Sparkles size={14} /> Senior Interviewer Deep Dive
                </p>
                <p className="mt-1 leading-relaxed text-amber-800">{selectedCase.deepDive}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARCHITECTURE CANVAS TAB */}
      {activeTab === "canvas" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Standard Tiered Microservices Flow</h2>
              <p className="mt-1 text-xs text-slate-500">
                Click any architectural block to inspect its production responsibilities and failover patterns.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 overflow-x-auto">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { id: "client", label: "Client Apps (Web/Mobile)", icon: Globe, color: "border-sky-300 bg-sky-50 text-sky-800" },
                  { id: "cdn", label: "Edge CDN (Cloudflare / Fastly)", icon: Network, color: "border-indigo-300 bg-indigo-50 text-indigo-800" },
                  { id: "lb", label: "Load Balancer (AWS ALB)", icon: Activity, color: "border-purple-300 bg-purple-50 text-purple-800" }
                ].map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedComponent(node.id)}
                    className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition hover:scale-105 ${node.color} ${
                      selectedComponent === node.id ? "ring-2 ring-brand-500 shadow-md" : ""
                    }`}
                  >
                    <node.icon size={18} />
                    <span>{node.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-slate-400 font-bold text-sm">↓ SSL Termination & Reverse Proxy</div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { id: "gateway", label: "API Gateway (Kong/Envoy)", icon: ShieldAlert, color: "border-amber-300 bg-amber-50 text-amber-800" },
                  { id: "app", label: "Stateless App Fleet (Node/Go)", icon: Server, color: "border-blue-300 bg-blue-50 text-blue-800" },
                  { id: "cache", label: "Redis Cluster (Distributed Cache)", icon: Zap, color: "border-rose-300 bg-rose-50 text-rose-800" }
                ].map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedComponent(node.id)}
                    className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition hover:scale-105 ${node.color} ${
                      selectedComponent === node.id ? "ring-2 ring-brand-500 shadow-md" : ""
                    }`}
                  >
                    <node.icon size={18} />
                    <span>{node.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-slate-400 font-bold text-sm">↓ Async Event Pipeline & Persistence Layer</div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { id: "queue", label: "Message Broker (Apache Kafka)", icon: Radio, color: "border-teal-300 bg-teal-50 text-teal-800" },
                  { id: "db", label: "Sharded DB (PostgreSQL / Mongo)", icon: Database, color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
                  { id: "storage", label: "Object Store (AWS S3 / Blob)", icon: HardDrive, color: "border-slate-300 bg-slate-50 text-slate-800" }
                ].map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedComponent(node.id)}
                    className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-bold transition hover:scale-105 ${node.color} ${
                      selectedComponent === node.id ? "ring-2 ring-brand-500 shadow-md" : ""
                    }`}
                  >
                    <node.icon size={18} />
                    <span>{node.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedComponent && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 animate-in fade-in space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-brand-900 uppercase">
                    Component Deep Dive: {selectedComponent.toUpperCase()}
                  </h3>
                  <button onClick={() => setSelectedComponent(null)} className="text-xs text-slate-500">
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedComponent === "cache" && "Redis Cluster provides in-memory sub-millisecond data reads with LRU eviction, distributed locking via Redlock, and Pub/Sub."}
                  {selectedComponent === "queue" && "Kafka decouples write spikes with append-only partitioned commit logs. Enables event-driven consumers and analytical streaming."}
                  {selectedComponent === "gateway" && "The API Gateway handles rate limiting, JWT token validation, SSL termination, and circuit breaking."}
                  {selectedComponent === "db" && "Primary transactional store with read replicas. Writes hit the master node while reads are distributed across replicas."}
                  {selectedComponent === "app" && "Stateless containerized pods running in Kubernetes. Scales horizontally based on CPU and request depth."}
                  {selectedComponent === "cdn" && "Caches static assets and cacheable API responses at global edge locations."}
                  {selectedComponent === "client" && "Browser/mobile client implementing optimistic updates and retry-with-backoff."}
                  {selectedComponent === "lb" && "Distributes incoming Layer 7 traffic with health check heartbeats."}
                  {selectedComponent === "storage" && "Provides 11 9s durability for media files and backups with lifecycle tiering."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAOS MONKEY & FAULT INJECTION LAB */}
      {activeTab === "chaos" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 space-y-6 border-rose-200">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="badge bg-rose-100 text-rose-800 font-bold flex items-center gap-1.5">
                  <Skull size={14} /> Chaos Engineering Suite (Netflix Simian Army Mode)
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Failure Injection & Resiliency Sandbox</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Simulate cascading outages in production distributed systems. Measure Blast Radius, observe self-healing circuit breakers, and execute recovery playbooks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {chaosEvent && (
                  <button
                    onClick={() => {
                      setChaosEvent(null);
                      setIsMitigated(false);
                      setChaosLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✅ System Restored: All failure modes cleared, cluster healthy.`]);
                      toast.success("Chaos event cleared!");
                    }}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow"
                  >
                    <RotateCcw size={14} /> Reset Cluster
                  </button>
                )}
              </div>
            </div>

            {/* Chaos Injection Buttons */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">1. Select Failure Injection Vector:</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    id: "redis_crash",
                    title: "Kill Redis Cluster",
                    desc: "Simulates sudden in-memory node failure triggering Cache Stampede against DB.",
                    severity: "CRITICAL",
                    color: "border-rose-200 bg-rose-50/60 hover:border-rose-400 text-rose-900"
                  },
                  {
                    id: "db_sever",
                    title: "Sever DB Replication",
                    desc: "Simulates network split between primary writer and read replica nodes.",
                    severity: "HIGH",
                    color: "border-amber-200 bg-amber-50/60 hover:border-amber-400 text-amber-900"
                  },
                  {
                    id: "partition",
                    title: "500ms Network Partition",
                    desc: "Injects cross-region WAN packet loss and latency spikes across microservices.",
                    severity: "HIGH",
                    color: "border-purple-200 bg-purple-50/60 hover:border-purple-400 text-purple-900"
                  },
                  {
                    id: "oom",
                    title: "Pod Memory Leak (OOM)",
                    desc: "Simulates memory leak causing Kubernetes pods to crash in CrashLoopBackOff.",
                    severity: "MEDIUM",
                    color: "border-sky-200 bg-sky-50/60 hover:border-sky-400 text-sky-900"
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setChaosEvent(item.id);
                      setIsMitigated(false);
                      setChaosLogs((prev) => [
                        ...prev,
                        `[${new Date().toLocaleTimeString()}] 💥 CHAOS INJECTED: ${item.title}. Blast radius expanding...`
                      ]);
                      toast.error(`Chaos Injected: ${item.title}!`);
                    }}
                    className={`rounded-2xl border p-4 text-left transition hover:scale-[1.02] shadow-sm ${item.color} ${
                      chaosEvent === item.id ? "ring-2 ring-rose-500 shadow-md font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{item.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border">{item.severity}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed opacity-80">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Blast Radius Display */}
            {chaosEvent && (
              <div className="rounded-2xl border border-rose-300 bg-slate-950 p-6 text-white space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                    <h4 className="font-extrabold text-base text-rose-400">
                      ACTIVE OUTAGE: {chaosEvent.toUpperCase()}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">P99 Latency: <strong className="text-rose-400">{isMitigated ? "14ms" : "1,450ms"}</strong></span>
                    <span className="text-slate-400">Error Rate: <strong className="text-rose-400">{isMitigated ? "0.01%" : "38.2%"}</strong></span>
                    <span className="text-slate-400">Health: <strong className={isMitigated ? "text-emerald-400" : "text-rose-500"}>{isMitigated ? "MITIGATED" : "DEGRADED"}</strong></span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 font-mono">
                  {chaosEvent === "redis_crash" && (
                    <p className="text-rose-300">
                      ⚠️ Cache Stampede detected! 100% of read traffic ({effectiveQps.toLocaleString()} QPS) bypassed cache and slammed database thread pool. Database CPU at 99%.
                    </p>
                  )}
                  {chaosEvent === "db_sever" && (
                    <p className="text-amber-300">
                      ⚠️ Primary-Replica heartbeat severed! Read queries routed to replica are 14,200ms behind master. Stale data served to clients.
                    </p>
                  )}
                  {chaosEvent === "partition" && (
                    <p className="text-purple-300">
                      ⚠️ Cross-datacenter link dropped. Raft quorum election triggered. Non-quorum partition rejecting write requests with HTTP 503.
                    </p>
                  )}
                  {chaosEvent === "oom" && (
                    <p className="text-sky-300">
                      ⚠️ Node memory exhausted. Linux OOM-Killer terminated container process. Pod entered CrashLoopBackOff state.
                    </p>
                  )}
                </div>

                {/* Mitigation Playbook Action */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Automated Engineering Playbook:</span>
                  {!isMitigated ? (
                    <button
                      onClick={() => {
                        setIsMitigated(true);
                        setChaosLogs((prev) => [
                          ...prev,
                          `[${new Date().toLocaleTimeString()}] 🛡️ PLAYBOOK EXECUTED: Automated self-healing mitigation activated. P99 restored.`
                        ]);
                        toast.success("Self-healing playbook executed! Service restored.");
                      }}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
                    >
                      <ShieldCheck size={14} />
                      {chaosEvent === "redis_crash" && "Execute: Enable Mutex Lock & Warm Cache"}
                      {chaosEvent === "db_sever" && "Execute: Promote Standby Replica to Primary"}
                      {chaosEvent === "partition" && "Execute: Trip Circuit Breaker & Fallback Stale"}
                      {chaosEvent === "oom" && "Execute: Scale Pod Limits & Enable Heap GC Dump"}
                    </button>
                  ) : (
                    <span className="badge bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono text-xs flex items-center gap-1.5">
                      <Check size={14} /> Mitigated & Self-Healed Successfully
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Telemetry Console Log */}
            {chaosLogs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Live Incident Command Log:</p>
                {chaosLogs.map((log, idx) => (
                  <p key={idx} className="leading-relaxed">{log}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAP THEOREM & PACELC MATRIX */}
      {activeTab === "cap" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <span className="badge bg-indigo-50 text-indigo-700 font-bold flex items-center gap-1.5">
                <Compass size={14} /> Distributed Consensus Theory
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-900">CAP Theorem & PACELC Interactive Decision Matrix</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Eric Brewer's CAP Theorem proves a distributed data store can guarantee at most 2 out of 3: Consistency (C), Availability (A), and Partition Tolerance (P). In real networks with latency, PACELC extends this trade-off during normal operations.
              </p>
            </div>

            {/* Workload Scenario Buttons */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                Select Production Business Workload:
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "banking", title: "Core Banking Ledger", profile: "CP System (Strict Consistency)", db: "CockroachDB / Spanner" },
                  { id: "social", title: "Social Media Like Stream", profile: "AP System (Eventual Consistency)", db: "Cassandra / DynamoDB" },
                  { id: "collab", title: "Collaborative Doc Editor", profile: "CRDT / Hybrid AP", db: "Redis + Yjs WebSocket" },
                  { id: "ecommerce", title: "Flash Sale Inventory", profile: "CP with Distributed Lock", db: "Redis Redlock + Postgres" }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setCapScenario(w.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      capScenario === w.id
                        ? "border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-900">{w.title}</p>
                    <p className="text-xs text-brand-600 font-semibold mt-1">{w.profile}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Recommended: {w.db}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CAP Analysis Deep Dive Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-bold text-base text-slate-900">
                  Architectural Evaluation: {capScenario === "banking" && "Core Banking & Financial Ledger"}
                  {capScenario === "social" && "Social Media Engagement & Like Counter"}
                  {capScenario === "collab" && "Real-Time Collaborative Whiteboard / Document"}
                  {capScenario === "ecommerce" && "E-Commerce Limited Flash Inventory"}
                </h3>
                <span className="badge bg-purple-100 text-purple-800 font-bold font-mono">
                  {capScenario === "banking" && "Strict CP · Linearizable Reads"}
                  {capScenario === "social" && "High-Availability AP · CRDT Counters"}
                  {capScenario === "collab" && "PACELC (PA/EL) · Eventual Merging"}
                  {capScenario === "ecommerce" && "Strict CP · Two-Phase Commit / Sagas"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {capScenario === "banking" &&
                  "In financial transactions, money cannot be duplicated or spent twice. If a network partition occurs between datacenter East and West, the system MUST reject writes rather than risk inconsistent balances. Uses Paxos/Raft consensus with synchronized atomic clocks (TrueTime API) to ensure serializability."}
                {capScenario === "social" &&
                  "If a user likes a post, it does not matter if a friend sees 1,042 likes while another sees 1,043 for a few seconds. The priority is 99.999% availability: likes must never fail. Writes are acknowledged immediately to local quorum and replicated asynchronously using Conflict-Free Replicated Data Types (PN-Counters)."}
                {capScenario === "collab" &&
                  "Users must be able to type offline without network lag. When network recovers, changes are merged deterministically using Operational Transformation (OT) or State-based CRDTs without central lock contention."}
                {capScenario === "ecommerce" &&
                  "If 100,000 customers try to purchase 100 available concert tickets, overselling results in legal liability and brand damage. The system utilizes distributed mutexes (Redis Redlock / ZooKeeper) and pessimistic row-level locking to guarantee zero inventory oversell."}
              </p>

              {/* Database Comparison Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 font-bold">Database Engine</th>
                      <th className="py-2.5 font-bold">CAP Classification</th>
                      <th className="py-2.5 font-bold">PACELC Profile</th>
                      <th className="py-2.5 font-bold">Optimal Production Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-white transition">
                      <td className="py-2 font-bold text-slate-900">Google Cloud Spanner</td>
                      <td><span className="badge bg-blue-50 text-blue-700 font-bold">CP (Consistent)</span></td>
                      <td className="font-mono text-slate-600">PC / EC</td>
                      <td className="text-slate-600">Global financial transactions & multi-region inventory</td>
                    </tr>
                    <tr className="hover:bg-white transition">
                      <td className="py-2 font-bold text-slate-900">Apache Cassandra / ScyllaDB</td>
                      <td><span className="badge bg-emerald-50 text-emerald-700 font-bold">AP (Available)</span></td>
                      <td className="font-mono text-slate-600">PA / EL</td>
                      <td className="text-slate-600">High-write IoT telemetry, message inboxes & time-series</td>
                    </tr>
                    <tr className="hover:bg-white transition">
                      <td className="py-2 font-bold text-slate-900">PostgreSQL (Single Master)</td>
                      <td><span className="badge bg-purple-50 text-purple-700 font-bold">CA (LAN only)</span></td>
                      <td className="font-mono text-slate-600">PC / EC</td>
                      <td className="text-slate-600">Relational business applications with strict ACID guarantees</td>
                    </tr>
                    <tr className="hover:bg-white transition">
                      <td className="py-2 font-bold text-slate-900">Amazon DynamoDB</td>
                      <td><span className="badge bg-amber-50 text-amber-700 font-bold">Configurable (AP/CP)</span></td>
                      <td className="font-mono text-slate-600">PA / EL (Default)</td>
                      <td className="text-slate-600">Serverless microservices with single-digit millisecond scale</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTIMATOR TAB */}
      {activeTab === "calculator" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          <div className="card p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Traffic & Scale Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Daily Active Users (DAU)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dau}
                    onChange={(e) => setDau(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="font-mono text-sm font-bold text-brand-600">{dau}M</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Actions / Requests per User / Day</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={requestsPerUser}
                    onChange={(e) => setRequestsPerUser(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="font-mono text-sm font-bold text-brand-600">{requestsPerUser}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Read vs. Write Ratio</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={readRatio}
                    onChange={(e) => setReadRatio(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="font-mono text-sm font-bold text-brand-600">{readRatio}% Reads</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Average Payload Size (KB)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={payloadKb}
                    onChange={(e) => setPayloadKb(Number(e.target.value))}
                    className="flex-1 accent-brand-600"
                  />
                  <span className="font-mono text-sm font-bold text-brand-600">{payloadKb} KB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Estimated Production Load</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Average QPS</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{avgQps.toLocaleString()} req/s</p>
                <p className="mt-1 text-[11px] text-slate-400">Total daily requests / 86,400s</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Peak QPS (2.5x buffer)</p>
                <p className="mt-1 text-2xl font-extrabold text-brand-600">{peakQps.toLocaleString()} req/s</p>
                <p className="mt-1 text-[11px] text-slate-400">Target for auto-scaling capacity</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Ingress Bandwidth</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{bandwidthMBs} MB/s</p>
                <p className="mt-1 text-[11px] text-slate-400">Network throughput needed</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Daily Storage Growth</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">{dailyStorageGB} GB/day</p>
                <p className="mt-1 text-[11px] text-slate-400">5-Year Growth: <strong>{fiveYearStorageTB} TB</strong></p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-xs text-brand-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Zap size={14} /> 80/20 Rule Cache Memory Recommendation
              </p>
              <p className="leading-relaxed">
                Caching 20% of daily active read data requires approximately <strong>{cacheRamGB} GB RAM</strong>. A 3-node Redis cluster with 16GB memory instances will easily handle this traffic with headroom.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ ARENA TAB */}
      {activeTab === "quiz" && (
        <div className="card p-6 sm:p-8 space-y-6">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="badge bg-purple-50 text-purple-700 font-bold">Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">System Design Architectural Challenge</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Current Score</p>
                  <p className="font-extrabold text-lg text-brand-600">{quizScore} / {quizIndex + (selectedAnswer !== null ? 1 : 0)}</p>
                </div>
              </div>

              <p className="text-base font-semibold text-slate-800 leading-relaxed">
                {QUIZ_QUESTIONS[quizIndex].question}
              </p>

              <div className="space-y-3">
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, optIdx) => {
                  let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
                  if (selectedAnswer !== null) {
                    if (optIdx === QUIZ_QUESTIONS[quizIndex].answer) {
                      btnStyle = "border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold";
                    } else if (optIdx === selectedAnswer) {
                      btnStyle = "border-rose-400 bg-rose-50 text-rose-900";
                    }
                  }
                  return (
                    <button
                      key={optIdx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswer(optIdx)}
                      className={`w-full rounded-2xl border p-4 text-left text-xs sm:text-sm transition flex items-start gap-3 ${btnStyle}`}
                    >
                      <span className="font-bold text-slate-400 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-xs text-brand-900 space-y-2 animate-in fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles size={15} /> Principal Architect Breakdown:
                  </p>
                  <p className="leading-relaxed">{QUIZ_QUESTIONS[quizIndex].explanation}</p>
                  <div className="pt-2 flex justify-end">
                    <button onClick={nextQuizQuestion} className="btn-primary text-xs px-4 py-2">
                      {quizIndex + 1 < QUIZ_QUESTIONS.length ? "Next Challenge" : "See Final Score"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-purple-100 text-purple-600">
                <Trophy size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Quiz Challenge Completed!</h2>
              <p className="text-sm text-slate-500">You scored {quizScore} out of {QUIZ_QUESTIONS.length} on advanced distributed systems.</p>
              <button onClick={resetQuiz} className="btn-primary text-xs px-6 py-2.5">
                Retake Challenge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
