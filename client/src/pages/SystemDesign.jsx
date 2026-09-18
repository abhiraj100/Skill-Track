import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Database,
  Globe,
  HardDrive,
  Layers,
  Network,
  Radio,
  Server,
  ShieldAlert,
  Sparkles,
  Zap
} from "lucide-react";

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
  }
];

export default function SystemDesign() {
  const [activeTab, setActiveTab] = useState("cases"); // 'cases' | 'canvas' | 'calculator' | 'matrix'
  const [selectedCase, setSelectedCase] = useState(CASE_STUDIES[0]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Estimator State
  const [dau, setDau] = useState(10); // in millions
  const [requestsPerUser, setRequestsPerUser] = useState(25);
  const [readRatio, setReadRatio] = useState(90); // 90% read, 10% write
  const [payloadKb, setPayloadKb] = useState(2); // 2 KB

  // Calculations
  const totalDailyRequests = dau * 1_000_000 * requestsPerUser;
  const avgQps = Math.round(totalDailyRequests / 86400);
  const peakQps = Math.round(avgQps * 2.5);
  const readQps = Math.round(avgQps * (readRatio / 100));
  const writeQps = avgQps - readQps;
  const bandwidthMBs = ((avgQps * payloadKb) / 1024).toFixed(2);
  const dailyStorageGB = ((totalDailyRequests * payloadKb) / (1024 * 1024)).toFixed(2);
  const fiveYearStorageTB = ((dailyStorageGB * 365 * 5) / 1024).toFixed(1);
  const cacheRamGB = Math.round((dailyStorageGB * 0.2)); // 80/20 rule

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
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">System Design & Architecture Arena</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Master distributed systems design for Senior & Staff engineering interviews. Explore real-world architectures, component trade-offs, and run capacity estimators.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "cases", label: "Case Studies", icon: Layers },
              { id: "canvas", label: "Interactive Canvas", icon: Network },
              { id: "calculator", label: "Capacity Estimator", icon: Calculator },
              { id: "matrix", label: "Trade-offs Matrix", icon: Activity }
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

      {/* INTERACTIVE CANVAS TAB */}
      {activeTab === "canvas" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Standard Tiered Microservices Flow</h2>
              <p className="mt-1 text-xs text-slate-500">
                Click any architectural block to inspect its production responsibilities and failover patterns.
              </p>
            </div>

            {/* Architecture Node Graph */}
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

            {/* Component Detail Drawer */}
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
                  {selectedComponent === "cache" && "Redis Cluster provides in-memory sub-millisecond data reads with LRU eviction, distributed locking via Redlock, and Pub/Sub. Used to protect the primary DB from being hammered."}
                  {selectedComponent === "queue" && "Kafka decouples write spikes with append-only partitioned commit logs. Enables event-driven consumers, analytical streaming, and exactly-once processing semantics."}
                  {selectedComponent === "gateway" && "The API Gateway handles rate limiting, JWT token validation, SSL termination, and circuit breaking before requests ever hit microservices."}
                  {selectedComponent === "db" && "Primary transactional store with read replicas. Writes hit the master node while reads are load-balanced across replicas using connection pooling (PgBouncer)."}
                  {selectedComponent === "app" && "Stateless containerized pods running in Kubernetes (EKS). Scales up/down automatically based on CPU and request queue depth."}
                  {selectedComponent === "cdn" && "Caches static assets, media, and cacheable API responses at over 300 global edge locations, dropping latency to under 20ms."}
                  {selectedComponent === "client" && "Web browser or native iOS/Android client. Implements client-side caching, optimistic updates, and retry-with-backoff."}
                  {selectedComponent === "lb" && "Distributes incoming Layer 7 traffic with health check heartbeats and automatic failover."}
                  {selectedComponent === "storage" && "Provides 99.999999999% (11 9s) durability for media files, backups, and user uploads with lifecycle archiving."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAPACITY CALCULATOR TAB */}
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

      {/* MATRIX TAB */}
      {activeTab === "matrix" && (
        <div className="card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Distributed Systems Trade-off Decision Matrix</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fundamental principles to justify architectural choices in tech interviews.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <span className="badge bg-purple-50 text-purple-700 font-bold">CAP Theorem</span>
              <h3 className="font-bold text-slate-900">Consistency vs. Availability</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Network partitions (P) are inevitable in distributed networks. You must choose either CP (bank balances, inventory checkout) or AP (social feed likes, view counters, DNS).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <span className="badge bg-blue-50 text-blue-700 font-bold">Data Store</span>
              <h3 className="font-bold text-slate-900">SQL (Relational) vs. NoSQL</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose SQL when ACID transactions and complex joins are critical. Choose NoSQL (Key-Value / Document / Columnar) when queries are key-based, schema is dynamic, and horizontal auto-sharding is required.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 space-y-2">
              <span className="badge bg-emerald-50 text-emerald-700 font-bold">Transport Protocol</span>
              <h3 className="font-bold text-slate-900">REST vs. gRPC vs. WebSockets</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                REST is standard for public APIs. gRPC (HTTP/2 + Protobuf) is 7-10x faster for inter-microservice communication. WebSockets enable real-time bidirectional push for chats and collaborative tools.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
