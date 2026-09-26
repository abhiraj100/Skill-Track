import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Eye,
  Flame,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
  Workflow,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

// Distributed OpenTelemetry Tracing Scenarios
const TRACE_SCENARIOS = [
  {
    id: "checkout",
    name: "POST /api/v1/orders/checkout",
    type: "High Concurrency E-Commerce Checkout",
    totalDuration: 184,
    status: "201 Created",
    spans: [
      { id: "span-1", name: "Cloudflare Edge Ingress & WAF Inspection", service: "edge-waf", start: 0, duration: 18, status: 200, depth: 0, details: "TLS 1.3 Termination, WAF rule pass, GeoIP: US-East" },
      { id: "span-2", name: "Envoy API Gateway Auth & Rate Limit Check", service: "api-gateway", start: 18, duration: 22, status: 200, depth: 1, details: "JWT HMAC-SHA256 verified, Token Bucket rate limit: 42/1000 RPS" },
      { id: "span-3", name: "Order Orchestrator (gRPC Dispatch)", service: "order-service", start: 40, duration: 130, status: 200, depth: 2, details: "Proto: OrderCheckoutRequest, Idempotency-Key: idemp_94f8b2" },
      { id: "span-4", name: "Redis Distributed Lock Acquisition (Redlock)", service: "redis-cluster", start: 46, duration: 14, status: 200, depth: 3, details: "SET order_lock:u_88471 NX PX 10000 -> OK across 3 masters" },
      { id: "span-5", name: "Inventory Reservation RPC", service: "inventory-service", start: 62, duration: 38, status: 200, depth: 3, details: "SKU_741 stock decremented: 48 -> 47 (Conditional Update)" },
      { id: "span-6", name: "Payment Gateway Integration (Stripe API)", service: "payment-gateway", start: 82, duration: 68, status: 200, depth: 3, details: "POST https://api.stripe.com/v1/payment_intents -> 200 OK (3D Secure bypass)" },
      { id: "span-7", name: "PostgreSQL Primary ACID Commit", service: "postgres-primary", start: 142, duration: 22, status: 200, depth: 3, details: "INSERT INTO orders (id, user_id, amount) VALUES ($1, $2, $3) RETURNING *" },
      { id: "span-8", name: "Kafka OrderEvents Topic Produce (ack=all)", service: "kafka-broker", start: 160, duration: 18, status: 200, depth: 3, details: "Topic: orders.v1, Partition: 2, MurmurHash3 routing key: order_94f8b2" }
    ]
  },
  {
    id: "feed",
    name: "GET /api/v1/user/feed?cursor=cur_883a",
    type: "Social Timeline Feed Fan-Out Query",
    totalDuration: 62,
    status: "200 OK",
    spans: [
      { id: "span-10", name: "Cloudflare Anycast CDN (Edge Cache Miss)", service: "edge-waf", start: 0, duration: 8, status: 200, depth: 0, details: "Edge Cache Miss -> Origin Shield Forward" },
      { id: "span-11", name: "API Gateway Reverse Proxy & Gzip Negotiation", service: "api-gateway", start: 8, duration: 12, status: 200, depth: 1, details: "Brotli Compression Handshake, Session Validated" },
      { id: "span-12", name: "Timeline Aggregator Service", service: "feed-service", start: 20, duration: 40, status: 200, depth: 2, details: "Hydrating Top 50 Posts for User 104829" },
      { id: "span-13", name: "Redis Cluster MGET (Celebrity Posts)", service: "redis-cluster", start: 24, duration: 16, status: 200, depth: 3, details: "Cache Hit: 48/50 keys resolved in memory in 1.4ms" },
      { id: "span-14", name: "PostgreSQL Read-Replica Fallback Query", service: "postgres-replica", start: 38, duration: 18, status: 200, depth: 3, details: "SELECT * FROM posts WHERE id IN ($1, $2) -> Index Scan" }
    ]
  },
  {
    id: "dispatch",
    name: "POST /api/v1/rides/dispatch-match",
    type: "Uber Geospatial Ride Match Query",
    totalDuration: 142,
    status: "200 OK",
    spans: [
      { id: "span-20", name: "Netty Net Gateway WebSocket Ingress", service: "edge-waf", start: 0, duration: 12, status: 200, depth: 0, details: "WSS Frame parsed: Lat: 37.7749, Lng: -122.4194" },
      { id: "span-21", name: "Geospatial Indexer (Uber H3 Hex Resolution 8)", service: "h3-spatial-service", start: 12, duration: 24, status: 200, depth: 1, details: "H3 Hexagon ID: 8828308281fffff, Ring Radius k=2 (19 Hexagons)" },
      { id: "span-22", name: "Driver Match Engine (Bipartite Graph Matching)", service: "dispatch-engine", start: 36, duration: 74, status: 200, depth: 2, details: "Kuhn-Munkres Hungarian Algorithm: 14 Available Drivers matched against 8 Requests" },
      { id: "span-23", name: "Redis Geospatial GEOSEARCH Driver Ping", service: "redis-cluster", start: 42, duration: 18, status: 200, depth: 3, details: "GEOSEARCH drivers:sf FROMLONLAT -122.4194 37.7749 BYRADIUS 3 km" },
      { id: "span-24", name: "Push Notification Delivery (Apple APNs / FCM)", service: "push-service", start: 110, duration: 28, status: 200, depth: 2, details: "Driver driver_992 accept window: 15 seconds" }
    ]
  }
];

// Consistent Hashing Nodes
const INITIAL_NODES = [
  { id: "node-1", name: "Cache-Node-A (us-east-1a)", vnodes: 50, memoryUsedMb: 3420, capacityMb: 8192, status: "Healthy" },
  { id: "node-2", name: "Cache-Node-B (us-east-1b)", vnodes: 50, memoryUsedMb: 3810, capacityMb: 8192, status: "Healthy" },
  { id: "node-3", name: "Cache-Node-C (us-east-1c)", vnodes: 50, memoryUsedMb: 3650, capacityMb: 8192, status: "Healthy" },
  { id: "node-4", name: "Cache-Node-D (us-east-1d)", vnodes: 50, memoryUsedMb: 3510, capacityMb: 8192, status: "Healthy" }
];

// SRE Disaster Recovery Scenarios
const SRE_INCIDENTS = [
  {
    id: "thread-exhaustion",
    title: "Cascading Failure: Thread Pool Exhaustion on Gateway",
    severity: "SEV-1 (Outage Risk)",
    symptom: "HTTP 504 Gateway Timeouts spike from 0.01% to 14.8%. Tomcat worker thread count reaches 200/200 max cap.",
    rootCause: "A slow external downstream analytics endpoint blocks worker threads synchronously without connection timeout fencing.",
    mitigationSteps: [
      { step: 1, action: "Enable Circuit Breaker (Hystrix / Resilience4j) with 200ms timeout", completed: false },
      { step: 2, action: "Isolate downstream analytics calls into dedicated non-blocking thread pool", completed: false },
      { step: 3, action: "Scale Gateway Pods from 4 to 12 via Horizontal Pod Autoscaler (HPA)", completed: false },
      { step: 4, action: "Verify P99 latency recovery and drain hung sockets", completed: false }
    ]
  },
  {
    id: "split-brain",
    title: "Split-Brain Risk in Etcd / Raft Consensus Quorum",
    severity: "SEV-1 (Data Integrity)",
    symptom: "Cross-AZ network link between us-east-1a and us-east-1b experiences 800ms packet drops. Two nodes attempt leader election simultaneously.",
    rootCause: "Network partition divides 5-node consensus cluster into 2-node and 3-node components. Minority partition must not accept writes.",
    mitigationSteps: [
      { step: 1, action: "Verify Raft Quorum Fencing: Minority (2 nodes) transitions to read-only state", completed: false },
      { step: 2, action: "Enforce leader fencing token and reject stale generation term numbers", completed: false },
      { step: 3, action: "Re-route client writes strictly to Majority partition (3 nodes)", completed: false },
      { step: 4, action: "Heal network route and trigger log catch-up replication", completed: false }
    ]
  },
  {
    id: "hot-shard",
    title: "Hot Partition Key in Distributed NoSQL Database",
    severity: "SEV-2 (Degradation)",
    symptom: "Shard 4 CPU spikes to 98% while Shards 1, 2, 3 remain idle at 12%. Write throughput throttled with HTTP 429.",
    rootCause: "High-volume celebrity tenant with 25M followers partitioned solely on tenant_id, overwhelming a single shard node.",
    mitigationSteps: [
      { step: 1, action: "Introduce Salted Partition Key: hash(tenant_id + '_' + random_salt(1..10))", completed: false },
      { step: 2, action: "Deploy Write-Behind Cache (Redis cluster) to absorb celebrity burst spikes", completed: false },
      { step: 3, action: "Scatter-Gather read fan-out across salted partitions in parallel", completed: false },
      { step: 4, action: "Validate even CPU load distribution across all 4 shards (<25% variance)", completed: false }
    ]
  }
];

export default function EnterpriseScaleHub() {
  const [activeTab, setActiveTab] = useState("telemetry"); // 'telemetry' | 'hashing' | 'kafkaLag' | 'dbSplit' | 'sre'

  // Distributed Tracing State
  const [selectedTrace, setSelectedTrace] = useState(TRACE_SCENARIOS[0]);
  const [selectedSpan, setSelectedSpan] = useState(TRACE_SCENARIOS[0].spans[0]);

  // Consistent Hashing State
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [vnodesPerNode, setVnodesPerNode] = useState(50);
  const [sampleKey, setSampleKey] = useState("user_session_token_948a7b1c");
  const [keyLookupResult, setKeyLookupResult] = useState(null);

  // Kafka Lag State
  const [kafkaLag, setKafkaLag] = useState([
    { partition: 0, logEndOffset: 148200, currentOffset: 147980, consumer: "consumer-pod-0 (10.0.1.12)", status: "Optimal" },
    { partition: 1, logEndOffset: 153400, currentOffset: 153390, consumer: "consumer-pod-1 (10.0.1.15)", status: "Optimal" },
    { partition: 2, logEndOffset: 198000, currentOffset: 188400, consumer: "consumer-pod-2 (10.0.1.22)", status: "Lagging (Warning)" },
    { partition: 3, logEndOffset: 142100, currentOffset: 142050, consumer: "consumer-pod-0 (10.0.1.12)", status: "Optimal" }
  ]);
  const [rebalancing, setRebalancing] = useState(false);

  // DB Read/Write Split State
  const [replicationLagMs, setReplicationLagMs] = useState(45);
  const [stickySessionWindow, setStickySessionWindow] = useState(true);
  const [readSplitRatio, setReadSplitRatio] = useState(85); // 85% to replicas, 15% to primary

  // SRE Incident State
  const [activeIncident, setActiveIncident] = useState(SRE_INCIDENTS[0]);
  const [incidentSteps, setIncidentSteps] = useState(SRE_INCIDENTS[0].mitigationSteps);
  const [incidentResolved, setIncidentResolved] = useState(false);

  // Run consistent hash key placement calculation
  const computeKeyPlacement = (keyStr, nodeList) => {
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      hash = ((hash << 5) - hash + keyStr.charCodeAt(i)) | 0;
    }
    const unsignedHash = Math.abs(hash);
    const assignedNodeIndex = unsignedHash % nodeList.length;
    const targetNode = nodeList[assignedNodeIndex];
    return {
      hash: unsignedHash,
      targetNode: targetNode.name,
      ringPosition: ((unsignedHash % 360) + 360) % 360
    };
  };

  useEffect(() => {
    setKeyLookupResult(computeKeyPlacement(sampleKey, nodes));
  }, [sampleKey, nodes]);

  const addCacheNode = () => {
    if (nodes.length >= 8) {
      return toast.error("Maximum 8 nodes in simulation cluster.");
    }
    const nextChar = String.fromCharCode(65 + nodes.length);
    const newNode = {
      id: `node-${nodes.length + 1}`,
      name: `Cache-Node-${nextChar} (us-east-1${nextChar.toLowerCase()})`,
      vnodes: vnodesPerNode,
      memoryUsedMb: Math.round(1800 + Math.random() * 1200),
      capacityMb: 8192,
      status: "Healthy"
    };
    setNodes([...nodes, newNode]);
    toast.success(`Added ${newNode.name}. Consistent hashing re-balanced ~${(100 / (nodes.length + 1)).toFixed(1)}% of keys.`);
  };

  const removeCacheNode = () => {
    if (nodes.length <= 2) {
      return toast.error("Minimum 2 nodes required for high availability.");
    }
    const removed = nodes[nodes.length - 1];
    setNodes(nodes.slice(0, -1));
    toast(`Removed ${removed.name}. Keys reassigned to clockwise neighbor.`, { icon: "⚠️" });
  };

  const triggerKafkaRebalance = () => {
    setRebalancing(true);
    toast.loading("Triggering Kafka Cooperative Sticky Rebalance Protocol...", { id: "rebalance" });
    setTimeout(() => {
      setKafkaLag([
        { partition: 0, logEndOffset: 148200, currentOffset: 148190, consumer: "consumer-pod-0", status: "Optimal" },
        { partition: 1, logEndOffset: 153400, currentOffset: 153395, consumer: "consumer-pod-1", status: "Optimal" },
        { partition: 2, logEndOffset: 198000, currentOffset: 197950, consumer: "consumer-pod-3 (Rebalanced)", status: "Optimal" },
        { partition: 3, logEndOffset: 142100, currentOffset: 142080, consumer: "consumer-pod-2", status: "Optimal" }
      ]);
      setRebalancing(false);
      toast.success("Partition 2 rebalanced to dedicated consumer-pod-3! Lag normalized.", { id: "rebalance" });
    }, 1400);
  };

  const toggleIncidentStep = (index) => {
    const updated = [...incidentSteps];
    updated[index].completed = !updated[index].completed;
    setIncidentSteps(updated);

    const allDone = updated.every((s) => s.completed);
    if (allDone && !incidentResolved) {
      setIncidentResolved(true);
      toast.success(`🎉 ${activeIncident.title} MITIGATED! MTTR: 3m 42s`);
    }
  };

  const switchIncident = (inc) => {
    setActiveIncident(inc);
    setIncidentSteps(inc.mitigationSteps.map((s) => ({ ...s, completed: false })));
    setIncidentResolved(false);
  };

  const totalKafkaLagCount = useMemo(() => {
    return kafkaLag.reduce((acc, p) => acc + (p.logEndOffset - p.currentOffset), 0);
  }, [kafkaLag]);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-2xl sm:p-8 border border-sky-900/40">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sky-400">
              <Server size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise Scale & SRE Telemetry Hub</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-sky-100 to-indigo-200 bg-clip-text text-transparent">
              Distributed Systems Command Center
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Real-time OpenTelemetry distributed waterfall tracing, consistent hashing cluster rings, Kafka consumer group lag inspectors, database read-write split routers, and live SRE disaster recovery runbooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Activity className="text-emerald-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">System Availability</p>
                <p className="text-xl font-black text-emerald-400">99.995%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Zap className="text-amber-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Peak Cluster QPS</p>
                <p className="text-xl font-black text-white">48,500 RPS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-sky-900/60 pt-4">
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "telemetry"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Activity size={14} /> OpenTelemetry APM Traces
          </button>

          <button
            onClick={() => setActiveTab("hashing")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "hashing"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Layers size={14} /> Consistent Hashing Ring
          </button>

          <button
            onClick={() => setActiveTab("kafkaLag")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "kafkaLag"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Workflow size={14} /> Kafka Partition Lag Monitor
          </button>

          <button
            onClick={() => setActiveTab("dbSplit")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "dbSplit"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Database size={14} /> DB Read/Write Split & Lag
          </button>

          <button
            onClick={() => setActiveTab("sre")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "sre"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ShieldAlert size={14} /> SRE Incident Runbook
          </button>
        </div>
      </section>

      {/* TAB 1: OPENTELEMETRY DISTRIBUTED TRACING WATERFALL */}
      {activeTab === "telemetry" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-sky-600" size={18} /> Distributed Request Tracing (OpenTelemetry)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    End-to-end request lifecycle with microservice span latencies, RPC metadata, and database execution times.
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {TRACE_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedTrace(sc);
                        setSelectedSpan(sc.spans[0]);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        selectedTrace.id === sc.id
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {sc.name.split(" ")[0]} {sc.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trace Summary Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-3.5 text-xs font-mono dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTrace.name}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {selectedTrace.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                  <span>Spans: <strong className="text-slate-700 dark:text-slate-200">{selectedTrace.spans.length}</strong></span>
                  <span>Total Duration: <strong className="text-sky-600 dark:text-sky-400">{selectedTrace.totalDuration}ms</strong></span>
                </div>
              </div>

              {/* Waterfall Timeline Graph */}
              <div className="mt-5 space-y-2.5">
                {selectedTrace.spans.map((span) => {
                  const leftPercent = (span.start / selectedTrace.totalDuration) * 100;
                  const widthPercent = Math.max((span.duration / selectedTrace.totalDuration) * 100, 3);
                  const isSelected = selectedSpan?.id === span.id;

                  return (
                    <div
                      key={span.id}
                      onClick={() => setSelectedSpan(span)}
                      className={`group cursor-pointer rounded-xl p-2.5 transition border ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/60 dark:border-sky-500 dark:bg-sky-950/40 shadow-sm"
                          : "border-slate-100 hover:border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate" style={{ paddingLeft: `${span.depth * 14}px` }}>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">L{span.depth}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {span.name}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-mono">
                            {span.service}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
                          {span.duration}ms
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
                          style={{
                            marginLeft: `${leftPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Span Inspector Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Eye size={14} /> Span Diagnostics
                </h3>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  HTTP {selectedSpan?.status || 200}
                </span>
              </div>

              {selectedSpan && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400">Operation Name:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{selectedSpan.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/80">
                      <span className="text-slate-400 text-[10px]">Service:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSpan.service}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/80">
                      <span className="text-slate-400 text-[10px]">Latency:</span>
                      <p className="font-bold text-sky-600 dark:text-sky-400">{selectedSpan.duration}ms</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400">Execution Telemetry & Query Payload:</span>
                    <pre className="mt-1 rounded-xl bg-slate-950 p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800 whitespace-pre-wrap leading-relaxed">
                      <code>{selectedSpan.details}</code>
                    </pre>
                  </div>

                  <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
                    <p className="font-bold flex items-center gap-1">
                      <Sparkles size={13} /> SRE Architecture Insight:
                    </p>
                    <p className="mt-1 leading-relaxed text-[11px]">
                      This span accounts for {((selectedSpan.duration / selectedTrace.totalDuration) * 100).toFixed(1)}% of total end-to-end request time. Downstream timeouts are fenced with a strict 250ms deadline propagation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSISTENT HASHING RING & REDIS CLUSTER */}
      {activeTab === "hashing" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="text-indigo-600" size={18} /> Consistent Hashing Distributed Ring Visualizer
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distributes keys across a 2³²-1 token ring using virtual nodes (vnodes) to prevent cache stampedes and minimize data migration when scaling nodes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={addCacheNode}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition flex items-center gap-1"
                >
                  <Server size={12} /> Add Cache Node (+1)
                </button>
                <button
                  onClick={removeCacheNode}
                  className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
                >
                  Remove Node (-1)
                </button>
              </div>
            </div>

            {/* Test Key Placement Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Test Cache Key:
              </label>
              <input
                type="text"
                value={sampleKey}
                onChange={(e) => setSampleKey(e.target.value)}
                className="flex-1 min-w-[240px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {keyLookupResult && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Target Node:</span>
                  <span className="rounded bg-indigo-100 px-2.5 py-0.5 font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                    {keyLookupResult.targetNode}
                  </span>
                  <span className="text-slate-400">Ring Degree: {keyLookupResult.ringPosition}°</span>
                </div>
              )}
            </div>

            {/* Node Grid Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nodes.map((node) => {
                const isTarget = keyLookupResult?.targetNode === node.name;
                return (
                  <div
                    key={node.id}
                    className={`rounded-2xl border p-4 transition ${
                      isTarget
                        ? "border-indigo-500 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-400"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{node.name}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      <p>Virtual Nodes: <strong className="text-slate-800 dark:text-slate-200">{node.vnodes} vnodes</strong></p>
                      <p>RAM Allocated: <strong className="text-slate-800 dark:text-slate-200">{node.memoryUsedMb} MB</strong> / {node.capacityMb} MB</p>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(node.memoryUsedMb / node.capacityMb) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Theoretical Math Callout */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs dark:border-indigo-900 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" /> Karger's Consistent Hashing Theorem:
              </p>
              <p className="leading-relaxed">
                When scaling from <strong>N = {nodes.length}</strong> to <strong>N+1 = {nodes.length + 1}</strong> nodes, only <strong>k / (N+1) = {(100 / (nodes.length + 1)).toFixed(1)}%</strong> of keys need migration. Under naive modulo hashing (hash(key) % N), up to <strong>~98%</strong> of cache keys are displaced, instigating instantaneous catastrophic database overload.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KAFKA CONSUMER GROUP LAG MONITOR */}
      {activeTab === "kafkaLag" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Workflow className="text-amber-500" size={18} /> Kafka Consumer Group Lag & Rebalance Engine
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitors unconsumed partition offsets (Lag = LogEndOffset - CurrentOffset) and simulates Cooperative Sticky rebalance protocols.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-mono font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Total Cluster Lag: {totalKafkaLagCount.toLocaleString()} msgs
                </div>
                <button
                  onClick={triggerKafkaRebalance}
                  disabled={rebalancing}
                  className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-500 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={rebalancing ? "animate-spin" : ""} />
                  {rebalancing ? "Rebalancing..." : "Trigger Sticky Rebalance"}
                </button>
              </div>
            </div>

            {/* Partition Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="p-3 font-bold">Partition ID</th>
                    <th className="p-3 font-bold">Log End Offset (LEO)</th>
                    <th className="p-3 font-bold">Committed Offset</th>
                    <th className="p-3 font-bold">Consumer Lag</th>
                    <th className="p-3 font-bold">Assigned Consumer Pod</th>
                    <th className="p-3 font-bold">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {kafkaLag.map((p) => {
                    const lag = p.logEndOffset - p.currentOffset;
                    const isHigh = lag > 2000;
                    return (
                      <tr key={p.partition} className={isHigh ? "bg-amber-50/40 dark:bg-amber-950/20" : ""}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">partition_{p.partition}</td>
                        <td className="p-3">{p.logEndOffset.toLocaleString()}</td>
                        <td className="p-3">{p.currentOffset.toLocaleString()}</td>
                        <td className={`p-3 font-bold ${isHigh ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {lag.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{p.consumer}</td>
                        <td className="p-3">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isHigh
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE READ/WRITE SPLITTING & LAG */}
      {activeTab === "dbSplit" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="text-emerald-600" size={18} /> Database Read-Write Splitting & Replica Router
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Routes heavy read volume across Read Replicas while safeguarding against stale reads with Master Sticky Pinning.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Simulated Replication Lag:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{replicationLagMs}ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={replicationLagMs}
                  onChange={(e) => setReplicationLagMs(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {replicationLagMs > 200 ? "⚠️ High lag! Background queries risk reading stale data." : "Normal asynchronous replication threshold."}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Read Traffic to Replicas:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{readSplitRatio}% Replicas / {100 - readSplitRatio}% Primary</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={readSplitRatio}
                  onChange={(e) => setReadSplitRatio(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Primary handles 100% of INSERT/UPDATE/DELETE + sticky post-write reads.
                </p>
              </div>
            </div>

            {/* Topology Diagram Preview */}
            <div className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-300 border border-slate-800 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Live Traffic Routing Topology</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-900 p-3 border border-emerald-500/30 text-emerald-300">
                  <p className="font-bold">Primary Master Node</p>
                  <p className="mt-1 text-[11px] text-slate-400">Writes: 100% | Sticky Reads: Active</p>
                  <p className="mt-2 text-base font-bold">1,850 Write QPS</p>
                </div>
                <div className="rounded-lg bg-slate-900 p-3 border border-sky-500/30 text-sky-300">
                  <p className="font-bold">Read-Replica-01 (AZ-1a)</p>
                  <p className="mt-1 text-[11px] text-slate-400">Lag: {replicationLagMs}ms | Load: ~42%</p>
                  <p className="mt-2 text-base font-bold">12,400 Read QPS</p>
                </div>
                <div className="rounded-lg bg-slate-900 p-3 border border-sky-500/30 text-sky-300">
                  <p className="font-bold">Read-Replica-02 (AZ-1b)</p>
                  <p className="mt-1 text-[11px] text-slate-400">Lag: {replicationLagMs + 12}ms | Load: ~44%</p>
                  <p className="mt-2 text-base font-bold">13,100 Read QPS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SRE INCIDENT COMMAND & RUNBOOK */}
      {activeTab === "sre" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="text-rose-600" size={18} /> SRE Incident Command & Disaster Recovery Runbook
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Execute live mitigation playbooks to resolve production SEV-1 outages and restore high-availability SLAs.
                </p>
              </div>

              {incidentResolved && (
                <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Outage Mitigated & SLA Restored
                </span>
              )}
            </div>

            {/* Incident Selector */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              {SRE_INCIDENTS.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => switchIncident(inc)}
                  className={`rounded-xl p-3 text-left transition border ${
                    activeIncident.id === inc.id
                      ? "border-rose-500 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/40"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60"
                  }`}
                >
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{inc.severity}</span>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 truncate">{inc.title}</p>
                </button>
              ))}
            </div>

            {/* Active Incident Details */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 dark:text-rose-200 text-sm">{activeIncident.title}</span>
                <span className="rounded bg-rose-200 px-2 py-0.5 font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 text-[10px]">
                  {activeIncident.severity}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Symptoms:</strong> {activeIncident.symptom}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Root Cause:</strong> {activeIncident.rootCause}
              </p>
            </div>

            {/* Interactive Runbook Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Interactive SRE Mitigation Runbook:
              </h3>
              {incidentSteps.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => toggleIncidentStep(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition ${
                    step.completed
                      ? "border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : "border-slate-200 hover:bg-slate-50 text-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${
                      step.completed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {step.step}
                    </span>
                    <span className={step.completed ? "line-through opacity-80" : "font-medium"}>
                      {step.action}
                    </span>
                  </div>
                  {step.completed && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
