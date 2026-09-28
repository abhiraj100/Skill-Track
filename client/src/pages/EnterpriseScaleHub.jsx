import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Flame,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Lock,
  Network,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
  Unlock,
  Wifi,
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
  { id: "node-1", name: "Cache-Node-A", az: "us-east-1a", color: "#38bdf8", vnodes: 50, memoryUsedMb: 3420, capacityMb: 8192, status: "Healthy" },
  { id: "node-2", name: "Cache-Node-B", az: "us-east-1b", color: "#818cf8", vnodes: 50, memoryUsedMb: 3810, capacityMb: 8192, status: "Healthy" },
  { id: "node-3", name: "Cache-Node-C", az: "us-east-1c", color: "#34d399", vnodes: 50, memoryUsedMb: 3650, capacityMb: 8192, status: "Healthy" },
  { id: "node-4", name: "Cache-Node-D", az: "us-east-1d", color: "#fbbf24", vnodes: 50, memoryUsedMb: 3510, capacityMb: 8192, status: "Healthy" }
];

// SRE Disaster Recovery Scenarios
const SRE_INCIDENTS = [
  {
    id: "thread-exhaustion",
    title: "Cascading Failure: Thread Pool Exhaustion on Gateway",
    severity: "SEV-1 (Outage Risk)",
    service: "Envoy Gateway / Order Orchestrator",
    symptom: "HTTP 504 Gateway Timeouts spike from 0.01% to 14.8%. Tomcat worker thread count reaches 200/200 max cap.",
    rootCause: "A slow external downstream analytics endpoint blocks worker threads synchronously without connection timeout fencing.",
    mitigationSteps: [
      { step: 1, action: "Enable Circuit Breaker (Hystrix / Resilience4j) with 200ms timeout", completed: false },
      { step: 2, action: "Isolate downstream analytics calls into dedicated non-blocking thread pool", completed: false },
      { step: 3, action: "Scale Gateway Pods from 4 to 12 via Horizontal Pod Autoscaler (HPA)", completed: false },
      { step: 4, action: "Verify P99 latency recovery and drain hung sockets", completed: false }
    ],
    postMortem: {
      detectionTime: "14:22:10 UTC",
      mitigationTime: "14:25:52 UTC",
      mttr: "3m 42s",
      impactedUsers: "14,280 checkout requests affected",
      actionItems: [
        "Enforce strict 200ms connect/read timeout on all 3rd-party vendor SDKs",
        "Introduce bulkheading to isolate payment checkout threads from telemetry",
        "Add Prometheus alert rule for Tomcat busy worker thread ratio > 85%"
      ]
    }
  },
  {
    id: "split-brain",
    title: "Split-Brain Risk in Etcd / Raft Consensus Quorum",
    severity: "SEV-1 (Data Integrity)",
    service: "Etcd Cluster / Kubernetes Control Plane",
    symptom: "Cross-AZ network link between us-east-1a and us-east-1b experiences 800ms packet drops. Two nodes attempt leader election simultaneously.",
    rootCause: "Network partition divides 5-node consensus cluster into 2-node and 3-node components. Minority partition must not accept writes.",
    mitigationSteps: [
      { step: 1, action: "Verify Raft Quorum Fencing: Minority (2 nodes) transitions to read-only state", completed: false },
      { step: 2, action: "Enforce leader fencing token and reject stale generation term numbers", completed: false },
      { step: 3, action: "Re-route client writes strictly to Majority partition (3 nodes)", completed: false },
      { step: 4, action: "Heal network route and trigger log catch-up replication", completed: false }
    ],
    postMortem: {
      detectionTime: "08:14:02 UTC",
      mitigationTime: "08:18:17 UTC",
      mttr: "4m 15s",
      impactedUsers: "0 corrupted state entries (Quorum strictly protected)",
      actionItems: [
        "Audit AWS DirectConnect cross-AZ latency jitter metrics",
        "Enable Raft Pre-Vote protocol to suppress disruptive election campaigns",
        "Deploy redundant BGP mesh paths between us-east-1 availability zones"
      ]
    }
  },
  {
    id: "hot-shard",
    title: "Hot Partition Key in Distributed NoSQL Database",
    severity: "SEV-2 (Degradation)",
    service: "MongoDB Sharded Cluster / DynamoDB",
    symptom: "Shard 4 CPU spikes to 98% while Shards 1, 2, 3 remain idle at 12%. Write throughput throttled with HTTP 429.",
    rootCause: "High-volume celebrity tenant with 25M followers partitioned solely on tenant_id, overwhelming a single shard node.",
    mitigationSteps: [
      { step: 1, action: "Introduce Salted Partition Key: hash(tenant_id + '_' + random_salt(1..10))", completed: false },
      { step: 2, action: "Deploy Write-Behind Cache (Redis cluster) to absorb celebrity burst spikes", completed: false },
      { step: 3, action: "Scatter-Gather read fan-out across salted partitions in parallel", completed: false },
      { step: 4, action: "Validate even CPU load distribution across all 4 shards (<25% variance)", completed: false }
    ],
    postMortem: {
      detectionTime: "19:05:40 UTC",
      mitigationTime: "19:08:30 UTC",
      mttr: "2m 50s",
      impactedUsers: "2,400 write mutations throttled with HTTP 429",
      actionItems: [
        "Enforce compound sharding rule combining tenant_id and timestamp bucket",
        "Set up adaptive throttling on API Gateway per individual tenant tier",
        "Implement automatic shard heat-map telemetry dashboard"
      ]
    }
  }
];

export default function EnterpriseScaleHub() {
  const [activeTab, setActiveTab] = useState("telemetry"); // 'telemetry' | 'hashing' | 'rateLimit' | 'mesh' | 'kafkaLag' | 'dbSplit' | 'sre'

  // Distributed Tracing State
  const [selectedTrace, setSelectedTrace] = useState(TRACE_SCENARIOS[0]);
  const [selectedSpan, setSelectedSpan] = useState(TRACE_SCENARIOS[0].spans[0]);
  const [isSimulatingTrace, setIsSimulatingTrace] = useState(false);
  const [activePlaybackSpanId, setActivePlaybackSpanId] = useState(null);

  // Consistent Hashing State
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [vnodesPerNode, setVnodesPerNode] = useState(50);
  const [sampleKey, setSampleKey] = useState("user_session_token_948a7b1c");
  const [keyLookupResult, setKeyLookupResult] = useState(null);

  // Rate Limiter Simulator State
  const [rateLimitAlgo, setRateLimitAlgo] = useState("token-bucket"); // 'token-bucket' | 'sliding-window' | 'leaky-bucket'
  const [bucketCapacity, setBucketCapacity] = useState(30);
  const [refillRate, setRefillRate] = useState(10); // tokens per sec
  const [tokensRemaining, setTokensRemaining] = useState(30);
  const [rateLimitStats, setRateLimitStats] = useState({ allowed: 142, rejected: 12, lastResult: null });
  const [rateLimitLog, setRateLimitLog] = useState([]);

  // Service Mesh Circuit Breaker State
  const [circuitState, setCircuitState] = useState("CLOSED"); // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [injectError, setInjectError] = useState(false);
  const [meshLatency, setMeshLatency] = useState(14);
  const [meshRequestsTotal, setMeshRequestsTotal] = useState(250);
  const [meshFallbackTriggered, setMeshFallbackTriggered] = useState(0);

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
  const [readSplitRatio, setReadSplitRatio] = useState(85);

  // SRE Incident State
  const [activeIncident, setActiveIncident] = useState(SRE_INCIDENTS[0]);
  const [incidentSteps, setIncidentSteps] = useState(SRE_INCIDENTS[0].mitigationSteps);
  const [incidentResolved, setIncidentResolved] = useState(false);
  const [showPostMortemModal, setShowPostMortemModal] = useState(false);

  // Live Node Cluster Metrics
  const [clusterMetrics, setClusterMetrics] = useState(null);

  // Distributed Saga & Idempotency State
  const [sagaFailureStep, setSagaFailureStep] = useState("payment"); // 'none' | 'inventory' | 'payment' | 'dispatch'
  const [isExecutingSaga, setIsExecutingSaga] = useState(false);
  const [sagaTimeline, setSagaTimeline] = useState([
    { step: 1, service: "order-service", action: "CREATE_ORDER", status: "SUCCESS", isCompensation: false, details: "Order saga_9941 initialized in PENDING state" },
    { step: 2, service: "inventory-service", action: "RESERVE_STOCK", status: "SUCCESS", isCompensation: false, details: "Reserved 1 unit of SKU_SKILLTRACK_PRO (Lock TTL: 300s)" },
    { step: 3, service: "payment-service", action: "CHARGE_CARD", status: "FAILED", isCompensation: false, details: "Payment Gateway 504 Timeout / Insufficient Funds" },
    { step: 4, service: "inventory-service", action: "RELEASE_STOCK", status: "COMPENSATED", isCompensation: true, details: "Released reserved unit back to pool" },
    { step: 5, service: "order-service", action: "CANCEL_ORDER", status: "COMPENSATED", isCompensation: true, details: "Order saga_9941 marked as CANCELLED (Payment Failed)" }
  ]);
  const [sagaOutcome, setSagaOutcome] = useState("ROLLED_BACK");
  const [idempKey, setIdempKey] = useState("idemp_usr_9981a2");
  const [idempAmount, setIdempAmount] = useState(249.99);
  const [idempResult, setIdempResult] = useState(null);
  const [isTestingIdemp, setIsTestingIdemp] = useState(false);

  // CRDT & Vector Clocks State
  const [crdtRegions, setCrdtRegions] = useState([
    { id: "us-east-1", label: "US East (N. Virginia)", counterP: 14, counterN: 2, vectorClock: { "us-east": 8, "eu-west": 4, "ap-south": 2 } },
    { id: "eu-west-1", label: "EU West (Frankfurt)", counterP: 19, counterN: 3, vectorClock: { "us-east": 7, "eu-west": 9, "ap-south": 2 } },
    { id: "ap-southeast-1", label: "AP South (Singapore)", counterP: 12, counterN: 1, vectorClock: { "us-east": 6, "eu-west": 4, "ap-south": 5 } }
  ]);
  const [splitBrainActive, setSplitBrainActive] = useState(false);
  const [crdtConvergedResult, setCrdtConvergedResult] = useState({
    convergedValue: 16,
    convergedClock: { "us-east": 8, "eu-west": 9, "ap-south": 5 },
    lastSync: "Just now"
  });
  const [isSyncingCrdt, setIsSyncingCrdt] = useState(false);

  // Database Sharding State
  const [shardingKeyInput, setShardingKeyInput] = useState("usr_9941a8");
  const [shardingResult, setShardingResult] = useState({
    queryType: "POINT_LOOKUP",
    hashValue: 2748192014,
    targetShard: { id: 2, name: "shard-eu-primary-0", region: "eu-west-1" },
    latencyMs: 1.4,
    shardsContacted: 1,
    summary: "Point lookup routed directly to shard-eu-primary-0 via MurmurHash3(usr_9941a8) % 4."
  });
  const [isRoutingSharding, setIsRoutingSharding] = useState(false);
  const [reshardingStep, setReshardingStep] = useState(0); // 0 to 4
  const [isResharding, setIsResharding] = useState(false);

  // Cache Stampede & XFetch State
  const [stampedeStrategy, setStampedeStrategy] = useState("xfetch"); // 'naive_ttl' | 'mutex_lock' | 'xfetch'
  const [isSimulatingStampede, setIsSimulatingStampede] = useState(false);
  const [stampedeResult, setStampedeResult] = useState({
    strategy: "xfetch",
    concurrentRequests: 1000,
    dbQueries: 1,
    cacheHits: 1000,
    avgLatencyMs: 1.2,
    systemState: "OPTIMAL_ZERO_STAMPEDE",
    summary: "Probabilistic Early Expiration (XFetch) prevented 100% of cache stampede. Exactly 1 background refresh was triggered before TTL expired."
  });

  // Fetch live cluster metrics
  useEffect(() => {
    fetch("/api/scale/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClusterMetrics(data);
        }
      })
      .catch(() => {});
  }, []);

  // Saga Handler
  const handleExecuteSaga = async () => {
    setIsExecutingSaga(true);
    try {
      const res = await fetch("/api/scale/saga/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulateFailureStep: sagaFailureStep === "none" ? null : sagaFailureStep,
          amount: 249.99
        })
      });
      const data = await res.json();
      if (data.timeline) {
        setSagaTimeline(data.timeline);
        setSagaOutcome(data.outcome);
        if (data.outcome === "COMMITTED") {
          toast.success("Distributed Saga Committed across 4 services!");
        } else {
          toast.error("Saga Failed: Reverse compensations executed!");
        }
        setIsExecutingSaga(false);
        return;
      }
    } catch {}

    const mockTimeline = [
      { step: 1, service: "order-service", action: "CREATE_ORDER", status: "SUCCESS", isCompensation: false, details: "Order saga_demo initialized in PENDING state" }
    ];
    if (sagaFailureStep === "inventory") {
      mockTimeline.push({ step: 2, service: "inventory-service", action: "RESERVE_STOCK", status: "FAILED", isCompensation: false, details: "Out of Stock for SKU_SKILLTRACK_PRO" });
      mockTimeline.push({ step: 3, service: "order-service", action: "CANCEL_ORDER", status: "COMPENSATED", isCompensation: true, details: "Compensated: Cancelled Order saga_demo" });
      setSagaOutcome("ROLLED_BACK");
      toast.error("Saga Rolled Back: Inventory failure compensated.");
    } else if (sagaFailureStep === "payment") {
      mockTimeline.push({ step: 2, service: "inventory-service", action: "RESERVE_STOCK", status: "SUCCESS", isCompensation: false, details: "Reserved 1 unit of SKU_SKILLTRACK_PRO" });
      mockTimeline.push({ step: 3, service: "payment-service", action: "CHARGE_CARD", status: "FAILED", isCompensation: false, details: "504 Gateway Timeout on Stripe API" });
      mockTimeline.push({ step: 4, service: "inventory-service", action: "RELEASE_STOCK", status: "COMPENSATED", isCompensation: true, details: "Compensated: Released inventory lock" });
      mockTimeline.push({ step: 5, service: "order-service", action: "CANCEL_ORDER", status: "COMPENSATED", isCompensation: true, details: "Compensated: Cancelled Order saga_demo" });
      setSagaOutcome("ROLLED_BACK");
      toast.error("Saga Rolled Back: Payment failure compensated.");
    } else if (sagaFailureStep === "dispatch") {
      mockTimeline.push({ step: 2, service: "inventory-service", action: "RESERVE_STOCK", status: "SUCCESS", isCompensation: false, details: "Reserved 1 unit of SKU_SKILLTRACK_PRO" });
      mockTimeline.push({ step: 3, service: "payment-service", action: "CHARGE_CARD", status: "SUCCESS", isCompensation: false, details: "Charged $249.99 via Stripe" });
      mockTimeline.push({ step: 4, service: "fulfillment-service", action: "PROVISION_ACCESS", status: "FAILED", isCompensation: false, details: "License cluster synchronization failed" });
      mockTimeline.push({ step: 5, service: "payment-service", action: "REFUND_CHARGE", status: "COMPENSATED", isCompensation: true, details: "Compensated: Full refund issued to customer" });
      mockTimeline.push({ step: 6, service: "inventory-service", action: "RELEASE_STOCK", status: "COMPENSATED", isCompensation: true, details: "Compensated: Released inventory lock" });
      mockTimeline.push({ step: 7, service: "order-service", action: "CANCEL_ORDER", status: "COMPENSATED", isCompensation: true, details: "Compensated: Cancelled Order saga_demo" });
      setSagaOutcome("ROLLED_BACK");
      toast.error("Saga Rolled Back: License failure compensated.");
    } else {
      mockTimeline.push({ step: 2, service: "inventory-service", action: "RESERVE_STOCK", status: "SUCCESS", isCompensation: false, details: "Reserved 1 unit of SKU_SKILLTRACK_PRO" });
      mockTimeline.push({ step: 3, service: "payment-service", action: "CHARGE_CARD", status: "SUCCESS", isCompensation: false, details: "Charged $249.99 via Stripe" });
      mockTimeline.push({ step: 4, service: "fulfillment-service", action: "PROVISION_ACCESS", status: "SUCCESS", isCompensation: false, details: "SkillTrack Enterprise License provisioned" });
      setSagaOutcome("COMMITTED");
      toast.success("Distributed Saga Committed across 4 services!");
    }
    setSagaTimeline(mockTimeline);
    setIsExecutingSaga(false);
  };

  // Idempotency Handler
  const handleVerifyIdempotency = async (mode = "fresh") => {
    setIsTestingIdemp(true);
    let key = idempKey;
    let payload = { customerId: "usr_481", amount: idempAmount, plan: "ENTERPRISE_TEAM" };
    if (mode === "tamper") {
      payload.amount = 9999.00;
    }
    try {
      const res = await fetch("/api/scale/idempotency/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ idempotencyKey: key, payload })
      });
      const data = await res.json();
      setIdempResult(data);
      if (data.idempotentReplay) {
        toast.success("Idempotent Replay Cached: Served in 0ms with zero DB duplicate!");
      } else if (data.status === "IDEMPOTENCY_CONFLICT") {
        toast.error("422 Idempotency Conflict: Payload altered with reused key!");
      } else {
        toast.success("201 Created: Fresh transaction processed and key locked.");
      }
    } catch {
      if (mode === "replay") {
        setIdempResult({
          status: "CACHED_IDEMPOTENT_RESPONSE",
          idempotentReplay: true,
          idempotencyKey: key,
          responsePayload: { transactionId: "txn_77f481a", status: "COMPLETED", amount: idempAmount },
          message: "Duplicate request detected. Returned previously computed result with zero redundant DB side-effects."
        });
        toast.success("Idempotent Replay Cached: Served in 0ms!");
      } else if (mode === "tamper") {
        setIdempResult({
          status: "IDEMPOTENCY_CONFLICT",
          error: "Idempotency-Key reused with conflicting payload fingerprint (RFC 9421 violation).",
          expectedFingerprint: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          receivedFingerprint: "4a59a7f3b89098e94a8e98418abdf45678ab4889cdefa12401827498aefb8112"
        });
        toast.error("422 Idempotency Conflict: Payload altered with reused key!");
      } else {
        setIdempResult({
          status: "EXECUTED_FRESH",
          idempotentReplay: false,
          idempotencyKey: key,
          responsePayload: { transactionId: "txn_77f481a", status: "COMPLETED", amount: idempAmount },
          message: "First-time request executed and cached under atomic lock for 3600 seconds."
        });
        toast.success("201 Created: Fresh transaction processed.");
      }
    } finally {
      setIsTestingIdemp(false);
    }
  };

  // CRDT Regional Update Handler
  const handleUpdateCrdtRegion = (regionId, type, delta = 1) => {
    setCrdtRegions((prev) =>
      prev.map((r) => {
        if (r.id !== regionId) return r;
        const newP = type === "P" ? r.counterP + delta : r.counterP;
        const newN = type === "N" ? r.counterN + delta : r.counterN;
        const shortName = regionId === "us-east-1" ? "us-east" : regionId === "eu-west-1" ? "eu-west" : "ap-south";
        const newClock = { ...r.vectorClock, [shortName]: (r.vectorClock[shortName] || 0) + 1 };
        return { ...r, counterP: newP, counterN: newN, vectorClock: newClock };
      })
    );
  };

  // CRDT Sync Handler
  const handleSyncCrdt = async () => {
    setIsSyncingCrdt(true);
    try {
      const res = await fetch("/api/scale/crdt/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions: crdtRegions })
      });
      const data = await res.json();
      if (data.success) {
        setCrdtConvergedResult({
          convergedValue: data.convergedValue,
          convergedClock: data.convergedVectorClock,
          lastSync: "Just now"
        });
        toast.success("CRDT Converged! Evaluated join-semilattice across 3 regional masters.");
        setIsSyncingCrdt(false);
        return;
      }
    } catch {}

    const maxP = Math.max(...crdtRegions.map((r) => r.counterP));
    const maxN = Math.max(...crdtRegions.map((r) => r.counterN));
    const mergedClock = {};
    crdtRegions.forEach((r) => {
      Object.entries(r.vectorClock).forEach(([k, v]) => {
        mergedClock[k] = Math.max(mergedClock[k] || 0, v);
      });
    });
    setCrdtConvergedResult({
      convergedValue: maxP - maxN,
      convergedClock: mergedClock,
      lastSync: "Just now"
    });
    toast.success("CRDT Converged! Computed supremum over vector clocks.");
    setIsSyncingCrdt(false);
  };

  // Sharding Query Handler
  const handleRouteSharding = async (type = "POINT_LOOKUP") => {
    setIsRoutingSharding(true);
    try {
      const res = await fetch("/api/scale/sharding/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shardingKey: shardingKeyInput, queryType: type })
      });
      const data = await res.json();
      if (data.success) {
        setShardingResult(data);
        toast.success(type === "POINT_LOOKUP" ? "Point Lookup: Routed to single shard in 1.4ms" : "Scatter-Gather: Evaluated 4 shards in parallel");
        setIsRoutingSharding(false);
        return;
      }
    } catch {}

    if (type === "POINT_LOOKUP") {
      let hash = 0;
      for (let i = 0; i < shardingKeyInput.length; i++) {
        hash = (hash * 31 + shardingKeyInput.charCodeAt(i)) >>> 0;
      }
      const shardIdx = hash % 4;
      const shardNames = ["shard-us-primary-0", "shard-us-primary-1", "shard-eu-primary-0", "shard-ap-primary-0"];
      setShardingResult({
        queryType: "POINT_LOOKUP",
        hashValue: hash,
        targetShard: { id: shardIdx, name: shardNames[shardIdx], region: shardIdx < 2 ? "us-east-1" : shardIdx === 2 ? "eu-west-1" : "ap-southeast-1" },
        latencyMs: 1.4,
        shardsContacted: 1,
        summary: `Point query routed directly to ${shardNames[shardIdx]} in 1.4ms.`
      });
      toast.success("Point Lookup: Routed to single shard in 1.4ms");
    } else {
      setShardingResult({
        queryType: "SCATTER_GATHER",
        targetShard: "ALL_SHARDS",
        shardsContacted: 4,
        latencyMs: 26.2,
        aggregationOverheadMs: 4.2,
        summary: "Scatter-gather query fanned out across all 4 shards in parallel. Total latency: 26.2ms (slowest shard 22ms + aggregation 4.2ms)."
      });
      toast.success("Scatter-Gather: Dispatched across 4 shards in parallel.");
    }
    setIsRoutingSharding(false);
  };

  // Zero-Downtime Resharding Simulator
  const handleStartResharding = () => {
    if (isResharding) return;
    setIsResharding(true);
    setReshardingStep(1);
    toast("Phase 1: Dual-Write enabled to both 4-node & new 8-node cluster...", { icon: "🔄" });

    setTimeout(() => {
      setReshardingStep(2);
      toast("Phase 2: CDC Backfill streaming historical tables to new shards...", { icon: "📦" });

      setTimeout(() => {
        setReshardingStep(3);
        toast("Phase 3: Shadow Reads active — verifying 100% cryptographic checksum parity...", { icon: "🔍" });

        setTimeout(() => {
          setReshardingStep(4);
          setIsResharding(false);
          toast.success("Phase 4: Cutover complete! Zero dropped requests during 4-to-8 shard expansion.");
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Cache Stampede Simulator
  const handleSimulateStampede = async (strat) => {
    setStampedeStrategy(strat);
    setIsSimulatingStampede(true);
    try {
      const res = await fetch("/api/scale/cache-stampede/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: strat, concurrentRequests: 1000 })
      });
      const data = await res.json();
      if (data.success) {
        setStampedeResult(data);
        if (strat === "naive_ttl") {
          toast.error("Catastrophic Cache Stampede! 1,000 DB queries spiked CPU to 100%.");
        } else if (strat === "mutex_lock") {
          toast.success("Distributed Mutex: Only 1 query hit DB; 999 waited for cache.");
        } else {
          toast.success("XFetch Probabilistic Early Expiration: 100% cache hits at 1.2ms!");
        }
        setIsSimulatingStampede(false);
        return;
      }
    } catch {}

    if (strat === "naive_ttl") {
      setStampedeResult({
        strategy: "naive_ttl",
        concurrentRequests: 1000,
        dbQueries: 1000,
        cacheHits: 0,
        avgLatencyMs: 1840,
        systemState: "CRITICAL_COLLAPSE",
        summary: "Catastrophic Cache Stampede! 1,000 concurrent requests slammed MongoDB primary at TTL expiry. CPU spiked to 100%, latency jumped to 1,840ms."
      });
      toast.error("Catastrophic Cache Stampede! 1,000 DB queries spiked CPU to 100%.");
    } else if (strat === "mutex_lock") {
      setStampedeResult({
        strategy: "mutex_lock",
        concurrentRequests: 1000,
        dbQueries: 1,
        cacheHits: 999,
        avgLatencyMs: 8.4,
        systemState: "PROTECTED",
        summary: "Distributed Mutex (Redlock) prevented duplicate DB execution. Exactly 1 request regenerated key while 999 requests queued or read replica."
      });
      toast.success("Distributed Mutex: Exactly 1 query hit DB; 999 waited for lock.");
    } else {
      setStampedeResult({
        strategy: "xfetch",
        concurrentRequests: 1000,
        dbQueries: 1,
        cacheHits: 1000,
        avgLatencyMs: 1.2,
        systemState: "OPTIMAL_ZERO_STAMPEDE",
        summary: "Probabilistic Early Expiration (XFetch) prevented 100% of cache stampede. Exactly 1 asynchronous background refresh occurred while 1,000 requests hit hot cache at 1.2ms."
      });
      toast.success("XFetch Probabilistic Early Expiration: 100% cache hits at 1.2ms!");
    }
    setIsSimulatingStampede(false);
  };

  // Consistent hash key placement calculation
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
      ringPosition: ((unsignedHash % 360) + 360) % 360,
      targetNodeColor: targetNode.color || "#38bdf8"
    };
  };

  useEffect(() => {
    setKeyLookupResult(computeKeyPlacement(sampleKey, nodes));
  }, [sampleKey, nodes]);

  // Token Refill Interval for Rate Limiter
  useEffect(() => {
    const interval = setInterval(() => {
      setTokensRemaining((curr) => Math.min(bucketCapacity, curr + refillRate / 2));
    }, 500);
    return () => clearInterval(interval);
  }, [bucketCapacity, refillRate]);

  // Send request through rate limiter
  const sendRateLimitedRequest = (burstCount = 1) => {
    let newAllowed = 0;
    let newRejected = 0;
    const newLogs = [];

    let currentTokens = tokensRemaining;
    for (let i = 0; i < burstCount; i++) {
      if (currentTokens >= 1) {
        currentTokens -= 1;
        newAllowed++;
        newLogs.unshift({
          id: Math.random().toString(36).substring(7),
          time: new Date().toLocaleTimeString(),
          status: 200,
          msg: "HTTP 200 OK — Token allocated from bucket"
        });
      } else {
        newRejected++;
        newLogs.unshift({
          id: Math.random().toString(36).substring(7),
          time: new Date().toLocaleTimeString(),
          status: 429,
          msg: `HTTP 429 Too Many Requests — Retry-After: ${(1 / refillRate).toFixed(1)}s`
        });
      }
    }

    setTokensRemaining(currentTokens);
    setRateLimitStats((prev) => ({
      allowed: prev.allowed + newAllowed,
      rejected: prev.rejected + newRejected,
      lastResult: newRejected > 0 ? "429 Throttled" : "200 Allowed"
    }));
    setRateLimitLog((prev) => [...newLogs, ...prev].slice(0, 15));

    if (newRejected > 0) {
      toast.error(`${newRejected} request(s) rate-limited (HTTP 429)`, { id: "rate-limit-toast" });
    } else {
      toast.success(`${newAllowed} request(s) passed successfully!`, { id: "rate-limit-toast" });
    }
  };

  // Simulate Service Mesh Request with Circuit Breaker
  const sendMeshCall = () => {
    setMeshRequestsTotal((prev) => prev + 1);

    if (circuitState === "OPEN") {
      setMeshFallbackTriggered((prev) => prev + 1);
      setMeshLatency(0.4);
      toast("Circuit is OPEN. Fast-failing to fallback response (0.4ms)!", { icon: "🛡️" });
      return;
    }

    if (injectError) {
      const newFailures = consecutiveFailures + 1;
      setConsecutiveFailures(newFailures);
      setMeshLatency(280);

      if (newFailures >= 4) {
        setCircuitState("OPEN");
        toast.error("🚨 4 consecutive failures! Circuit Breaker TRIPPED to OPEN state!");
        setTimeout(() => {
          setCircuitState("HALF_OPEN");
          toast("Circuit entered HALF-OPEN state (probing downstream recovery)...", { icon: "🟡" });
        }, 5000);
      } else {
        toast.error(`Downstream timeout! Failures: ${newFailures}/4`);
      }
    } else {
      setConsecutiveFailures(0);
      setMeshLatency(Math.round(12 + Math.random() * 8));
      if (circuitState === "HALF_OPEN") {
        setCircuitState("CLOSED");
        toast.success("Downstream verified healthy! Circuit Breaker reset to CLOSED.");
      } else {
        toast.success("gRPC mTLS call passed via Envoy proxy!");
      }
    }
  };

  // Playback Trace Animation
  const playTraceSimulation = () => {
    if (isSimulatingTrace) return;
    setIsSimulatingTrace(true);
    toast.loading(`Simulating ${selectedTrace.name} execution flow...`, { id: "trace-sim" });

    selectedTrace.spans.forEach((span, idx) => {
      setTimeout(() => {
        setActivePlaybackSpanId(span.id);
        setSelectedSpan(span);
        if (idx === selectedTrace.spans.length - 1) {
          setTimeout(() => {
            setIsSimulatingTrace(false);
            setActivePlaybackSpanId(null);
            toast.success(`Trace completed in ${selectedTrace.totalDuration}ms!`, { id: "trace-sim" });
          }, 400);
        }
      }, idx * 350);
    });
  };

  const addCacheNode = () => {
    if (nodes.length >= 8) {
      return toast.error("Maximum 8 nodes in simulation cluster.");
    }
    const nextChar = String.fromCharCode(65 + nodes.length);
    const colorPalette = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981"];
    const newNode = {
      id: `node-${nodes.length + 1}`,
      name: `Cache-Node-${nextChar}`,
      az: `us-east-1${nextChar.toLowerCase()}`,
      color: colorPalette[nodes.length % colorPalette.length],
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
      toast.success(`🎉 ${activeIncident.title} MITIGATED! MTTR: ${activeIncident.postMortem.mttr}`);
    }
  };

  const switchIncident = (inc) => {
    setActiveIncident(inc);
    setIncidentSteps(inc.mitigationSteps.map((s) => ({ ...s, completed: false })));
    setIncidentResolved(false);
  };

  const copyPostMortemToClipboard = () => {
    const text = `# SRE Incident Post-Mortem: ${activeIncident.title}
**Severity:** ${activeIncident.severity}
**Impacted Service:** ${activeIncident.service}
**Detection Time:** ${activeIncident.postMortem.detectionTime}
**Resolution Time:** ${activeIncident.postMortem.mitigationTime}
**Mean Time to Resolution (MTTR):** ${activeIncident.postMortem.mttr}
**Customer Impact:** ${activeIncident.postMortem.impactedUsers}

---
### 1. Root Cause Analysis (RCA)
${activeIncident.rootCause}

### 2. Mitigation Runbook Executed
${incidentSteps.map((s) => `- [${s.completed ? "x" : " "}] Step ${s.step}: ${s.action}`).join("\n")}

### 3. Action Items & Preventive Tasks
${activeIncident.postMortem.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Post-Mortem report copied to clipboard!");
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
              High-concurrency OpenTelemetry waterfall tracing, 360° circular consistent hashing ring, Redis token bucket traffic shaping, Envoy service mesh circuit breakers, and SRE incident runbooks.
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
            <Layers size={14} /> Consistent Hashing 360° Ring
          </button>

          <button
            onClick={() => setActiveTab("rateLimit")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "rateLimit"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sliders size={14} /> Rate Limiter & Token Bucket
          </button>

          <button
            onClick={() => setActiveTab("mesh")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "mesh"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Network size={14} /> Service Mesh Circuit Breaker
          </button>

          <button
            onClick={() => setActiveTab("kafkaLag")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "kafkaLag"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Workflow size={14} /> Kafka Partition Lag
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
            onClick={() => setActiveTab("saga")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "saga"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <GitBranch size={14} /> Sagas & Idempotency
          </button>

          <button
            onClick={() => setActiveTab("crdt")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "crdt"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe size={14} /> Multi-Region CRDTs
          </button>

          <button
            onClick={() => setActiveTab("sharding")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "sharding"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Shuffle size={14} /> DB Sharding & Fan-Out
          </button>

          <button
            onClick={() => setActiveTab("stampede")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "stampede"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Flame size={14} /> Cache Stampede & XFetch
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={playTraceSimulation}
                    disabled={isSimulatingTrace}
                    className="rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play size={13} className={isSimulatingTrace ? "animate-spin" : ""} />
                    {isSimulatingTrace ? "Simulating..." : "Play Live Trace"}
                  </button>

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
                  const isPlaying = activePlaybackSpanId === span.id;

                  return (
                    <div
                      key={span.id}
                      onClick={() => setSelectedSpan(span)}
                      className={`group cursor-pointer rounded-xl p-2.5 transition border ${
                        isPlaying
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-400 scale-[1.01]"
                          : isSelected
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
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPlaying
                              ? "bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse"
                              : "bg-gradient-to-r from-sky-500 to-indigo-600"
                          }`}
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

      {/* TAB 2: CONSISTENT HASHING 360° RING VISUALIZER */}
      {activeTab === "hashing" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="text-indigo-600" size={18} /> 360° Circular Consistent Hashing Ring
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
                  <span
                    className="rounded px-2.5 py-0.5 font-bold text-white shadow-sm"
                    style={{ backgroundColor: keyLookupResult.targetNodeColor }}
                  >
                    {keyLookupResult.targetNode}
                  </span>
                  <span className="text-slate-400">Ring Degree: {keyLookupResult.ringPosition}°</span>
                </div>
              )}
            </div>

            {/* Visual 360 Degree SVG Ring Canvas */}
            <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-center">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Live Token Ring (0° to 359°)</p>
                <svg width="280" height="280" viewBox="0 0 360 360" className="overflow-visible">
                  {/* Outer Ring */}
                  <circle cx="180" cy="180" r="130" stroke="#334155" strokeWidth="4" fill="none" strokeDasharray="4 4" />

                  {/* Render Node Segments & Badges */}
                  {nodes.map((node, idx) => {
                    const angle = (idx / nodes.length) * 2 * Math.PI;
                    const x = 180 + 130 * Math.cos(angle);
                    const y = 180 + 130 * Math.sin(angle);
                    const isTarget = keyLookupResult?.targetNode === node.name;

                    return (
                      <g key={node.id}>
                        {/* Glow on target node */}
                        {isTarget && (
                          <circle cx={x} cy={y} r="22" fill={node.color} opacity="0.3" className="animate-ping" />
                        )}
                        <circle cx={x} cy={y} r="16" fill={node.color} stroke="#0f172a" strokeWidth="3" />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {String.fromCharCode(65 + idx)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Target Key Indicator on Ring */}
                  {keyLookupResult && (
                    <g>
                      {(() => {
                        const rad = (keyLookupResult.ringPosition * Math.PI) / 180;
                        const kx = 180 + 130 * Math.cos(rad);
                        const ky = 180 + 130 * Math.sin(rad);
                        return (
                          <>
                            <line x1="180" y1="180" x2={kx} y2={ky} stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
                            <circle cx={kx} cy={ky} r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                            <text x={kx} y={ky - 12} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">
                              Key Target ({keyLookupResult.ringPosition}°)
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Center Hub Indicator */}
                  <circle cx="180" cy="180" r="32" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="180" y="176" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    RING
                  </text>
                  <text x="180" y="190" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                    2³²-1
                  </text>
                </svg>
                <div className="mt-2 text-center text-[11px] text-slate-400">
                  <span className="text-rose-400 font-bold">●</span> Key Hash Point &nbsp;|&nbsp;
                  <span className="text-sky-400 font-bold">●</span> Clockwise Partition Assignment
                </div>
              </div>

              {/* Node Grid Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
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
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: node.color }} />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{node.name}</span>
                        </div>
                        <span className="text-[10px] font-mono rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-500">
                          {node.az}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                        <p>Virtual Nodes: <strong className="text-slate-800 dark:text-slate-200">{node.vnodes} vnodes</strong></p>
                        <p>RAM Allocated: <strong className="text-slate-800 dark:text-slate-200">{node.memoryUsedMb} MB</strong> / {node.capacityMb} MB</p>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: node.color,
                              width: `${(node.memoryUsedMb / node.capacityMb) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      {/* TAB 3: RATE LIMITER & TOKEN BUCKET SHAPER */}
      {activeTab === "rateLimit" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="text-amber-500" size={18} /> Distributed Rate Limiter & Token Bucket Shaper
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulate Redis Sliding Window and Token Bucket rate-limiting algorithms to protect backend clusters from DDoS and thundering herd spikes.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => sendRateLimitedRequest(1)}
                  className="rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-xs font-bold shadow hover:opacity-90 transition flex items-center gap-1.5"
                >
                  <SendIcon size={12} /> Send 1 Request
                </button>
                <button
                  onClick={() => sendRateLimitedRequest(15)}
                  className="rounded-xl bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-amber-500 transition flex items-center gap-1.5"
                >
                  <Zap size={12} /> Send 15 Requests (Burst)
                </button>
                <button
                  onClick={() => sendRateLimitedRequest(40)}
                  className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow hover:bg-rose-500 transition flex items-center gap-1.5"
                >
                  <Flame size={12} /> Send 40 Requests (Flood Spike)
                </button>
              </div>
            </div>

            {/* Token Bucket Meter & Sliders */}
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Visual Bucket Glass Container */}
              <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 flex flex-col items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Token Bucket Reservoir</p>

                <div className="relative mt-3 h-48 w-32 rounded-b-3xl border-b-4 border-l-4 border-r-4 border-slate-700 bg-slate-900/80 overflow-hidden flex flex-col justify-end p-1">
                  <div
                    className="w-full rounded-b-2xl bg-gradient-to-t from-sky-600 to-indigo-500 transition-all duration-300"
                    style={{ height: `${(tokensRemaining / bucketCapacity) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white text-sm drop-shadow">
                    {Math.round(tokensRemaining)} / {bucketCapacity}
                  </div>
                </div>

                <div className="mt-3 text-center text-xs font-mono text-slate-400">
                  Refill: <strong className="text-emerald-400">+{refillRate} tokens/sec</strong>
                </div>
              </div>

              {/* Controls & Metrics */}
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Allowed Requests (200)</p>
                    <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {rateLimitStats.allowed}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Throttled Requests (429)</p>
                    <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                      {rateLimitStats.rejected}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Last Status Response</p>
                    <p className={`mt-1 text-lg font-bold font-mono ${rateLimitStats.lastResult === "429 Throttled" ? "text-rose-500" : "text-emerald-500"}`}>
                      {rateLimitStats.lastResult || "Idle"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Max Burst Capacity:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{bucketCapacity} tokens</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={bucketCapacity}
                      onChange={(e) => setBucketCapacity(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Refill Velocity:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{refillRate} tokens/sec</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={refillRate}
                      onChange={(e) => setRefillRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Rate Limit Audit Stream */}
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300 border border-slate-800 max-h-36 overflow-y-auto">
                  <p className="text-[10px] uppercase text-slate-500 mb-1">Live HTTP Gateway Audit Stream</p>
                  {rateLimitLog.length === 0 ? (
                    <p className="text-slate-600 italic">Send requests above to inspect rate-limiting telemetry...</p>
                  ) : (
                    rateLimitLog.map((log) => (
                      <p key={log.id} className={log.status === 200 ? "text-emerald-400" : "text-rose-400 font-bold"}>
                        [{log.time}] {log.msg}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE MESH & CIRCUIT BREAKER TOPOLOGY */}
      {activeTab === "mesh" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Network className="text-indigo-600" size={18} /> Envoy Service Mesh & Circuit Breaker Topology
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Microservice-to-microservice mutual TLS (mTLS) with Hystrix/Resilience4j circuit breakers to prevent cascading outages.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInjectError(!injectError)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                    injectError
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <AlertOctagon size={13} />
                  {injectError ? "Error Injection Active (Failing)" : "Inject Downstream Timeout"}
                </button>
                <button
                  onClick={sendMeshCall}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition flex items-center gap-1.5"
                >
                  <SendIcon size={12} /> Dispatch RPC Request
                </button>
              </div>
            </div>

            {/* Circuit Breaker Status Indicator Bar */}
            <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px]">Circuit State:</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    circuitState === "CLOSED" ? "bg-emerald-500" : circuitState === "OPEN" ? "bg-rose-500 animate-ping" : "bg-amber-500"
                  }`} />
                  <strong className={`text-sm ${
                    circuitState === "CLOSED" ? "text-emerald-600 dark:text-emerald-400" : circuitState === "OPEN" ? "text-rose-600 dark:text-rose-400" : "text-amber-500"
                  }`}>
                    {circuitState}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px]">Consecutive Failures:</span>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {consecutiveFailures} / 4 (Threshold)
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px]">mTLS Latency:</span>
                <p className="mt-1 text-sm font-bold text-sky-600 dark:text-sky-400">
                  {meshLatency}ms
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px]">Fallback Responses:</span>
                <p className="mt-1 text-sm font-bold text-purple-600 dark:text-purple-400">
                  {meshFallbackTriggered}
                </p>
              </div>
            </div>

            {/* Interactive Visual Architecture Graph */}
            <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 text-xs font-mono text-slate-200 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Service Mesh Topology & SPIFFE/SPIRE Workload Identity</p>
              <div className="grid gap-4 sm:grid-cols-3 items-center text-center">
                {/* Gateway */}
                <div className="rounded-xl bg-slate-900 p-4 border border-sky-500/40 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-sky-400">
                    <Server size={16} /> <strong>Envoy Ingress Gateway</strong>
                  </div>
                  <p className="text-[10px] text-slate-400">spiffe://cluster.local/ns/prod/sa/gateway</p>
                  <span className="inline-block mt-2 rounded bg-sky-950 px-2 py-0.5 text-[10px] text-sky-300 font-bold">
                    mTLS Active (TLS 1.3)
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <span className="text-[10px] text-slate-400">gRPC Protobuf</span>
                  <ArrowRight size={20} className="text-sky-400 animate-pulse my-1" />
                  <span className="text-[10px] text-slate-400">{meshLatency}ms</span>
                </div>

                {/* Downstream Service with Circuit Breaker */}
                <div className={`rounded-xl p-4 border space-y-1 transition ${
                  circuitState === "OPEN"
                    ? "border-rose-500 bg-rose-950/40 text-rose-200"
                    : "border-emerald-500/40 bg-slate-900"
                }`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck size={16} className={circuitState === "OPEN" ? "text-rose-400" : "text-emerald-400"} />
                    <strong>Payment Service Pod</strong>
                  </div>
                  <p className="text-[10px] text-slate-400">spiffe://cluster.local/ns/prod/sa/payment</p>
                  <span className={`inline-block mt-2 rounded px-2 py-0.5 text-[10px] font-bold ${
                    circuitState === "OPEN" ? "bg-rose-900 text-rose-200" : "bg-emerald-950 text-emerald-300"
                  }`}>
                    Circuit: {circuitState}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KAFKA CONSUMER GROUP LAG MONITOR */}
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

      {/* TAB 6: DATABASE READ/WRITE SPLITTING & LAG */}
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

      {/* TAB 8: DISTRIBUTED SAGAS & IDEMPOTENCY KEY ENGINE */}
      {activeTab === "saga" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch className="text-amber-500" size={18} /> Distributed Saga Orchestration & Compensating Transactions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Overcomes 2-Phase Commit (2PC) blocking locks using orchestrated sagas with automated reverse compensating rollbacks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                  sagaOutcome === "COMMITTED"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                }`}>
                  Status: {sagaOutcome}
                </span>
              </div>
            </div>

            {/* Saga Controls & Chaos Failure Selector */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Inject Chaos Failure Scenario:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "none", label: "No Failure (Commit All)" },
                    { id: "inventory", label: "Inventory Out of Stock" },
                    { id: "payment", label: "Payment 504 Timeout" },
                    { id: "dispatch", label: "License Dispatch Crash" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSagaFailureStep(f.id)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center border transition ${
                        sagaFailureStep === f.id
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300"
                          : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sagaFailureStep === "none"
                    ? "All 4 microservices will succeed and commit forward transactions."
                    : `Simulating a fatal downstream fault. Saga Orchestrator will abort forward flow and fire reverse compensating transactions.`}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Execute Workflow:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Dispatches to Node.js orchestrator at <code>POST /api/scale/saga/execute</code>.
                  </p>
                </div>
                <button
                  onClick={handleExecuteSaga}
                  disabled={isExecutingSaga}
                  className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {isExecutingSaga ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                  {isExecutingSaga ? "Orchestrating..." : "Dispatch Distributed Saga"}
                </button>
              </div>
            </div>

            {/* Visual Forward & Reverse Compensating Flow Pipeline */}
            <div className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-300 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="uppercase text-[11px] tracking-wider text-slate-500 font-bold">
                  Saga Microservice Orchestration DAG
                </span>
                <span className="text-[11px] text-slate-400">
                  Pattern: Orchestrated Coordinator with Idempotent Outbox
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { name: "Order Service", stepName: "1. Create Order", icon: Database },
                  { name: "Inventory Service", stepName: "2. Reserve Stock", icon: Layers },
                  { name: "Payment Gateway", stepName: "3. Charge Card", icon: Zap },
                  { name: "Fulfillment Svc", stepName: "4. Provision License", icon: Server }
                ].map((svc, idx) => {
                  const stepEvents = sagaTimeline.filter((t) => t.service.includes(svc.name.toLowerCase().split(" ")[0]));
                  const hasFailed = stepEvents.some((e) => e.status === "FAILED");
                  const hasCompensated = stepEvents.some((e) => e.status === "COMPENSATED");
                  const hasSuccess = stepEvents.some((e) => e.status === "SUCCESS");

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl p-3.5 border transition ${
                        hasFailed
                          ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                          : hasCompensated
                          ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                          : hasSuccess
                          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{svc.stepName}</span>
                        <svc.icon size={13} />
                      </div>
                      <p className="mt-1 font-bold text-xs">{svc.name}</p>
                      <div className="mt-2 text-[10px]">
                        {hasFailed && <span className="text-rose-400 font-bold">● FAULT TRIGGERED</span>}
                        {hasCompensated && <span className="text-amber-400 font-bold">↩ COMPENSATED (REVERSED)</span>}
                        {hasSuccess && !hasCompensated && <span className="text-emerald-400 font-bold">✓ FORWARD COMMITTED</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Step Timeline Audit Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Live Transaction & Compensation Audit Trail:
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">#</th>
                      <th className="py-2.5 px-3 font-bold">Microservice</th>
                      <th className="py-2.5 px-3 font-bold">Action / RPC</th>
                      <th className="py-2.5 px-3 font-bold">Type</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                      <th className="py-2.5 px-3 font-bold">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {sagaTimeline.map((item, idx) => (
                      <tr key={idx} className={item.isCompensation ? "bg-amber-500/5" : ""}>
                        <td className="py-2 px-3">{item.step}</td>
                        <td className="py-2 px-3 font-bold">{item.service}</td>
                        <td className="py-2 px-3">{item.action}</td>
                        <td className="py-2 px-3">
                          {item.isCompensation ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold text-[10px]">
                              COMPENSATION
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-500 font-bold text-[10px]">
                              FORWARD
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {item.status === "SUCCESS" && <span className="text-emerald-500 font-bold">SUCCESS</span>}
                          {item.status === "FAILED" && <span className="text-rose-500 font-bold">FAILED</span>}
                          {item.status === "COMPENSATED" && <span className="text-amber-500 font-bold">COMPENSATED</span>}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500 dark:text-slate-400">{item.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Part 2: Idempotency-Key Fingerprint Workbench */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="text-indigo-600" size={16} /> RFC 9421 Idempotency Key Deduplication Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Guarantees that network retry floods (e.g. user double-clicking Submit or mobile reconnects) never result in duplicate billing.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Idempotency-Key Header:
                  </label>
                  <input
                    type="text"
                    value={idempKey}
                    onChange={(e) => setIdempKey(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 block">
                    Transaction Amount ($):
                  </label>
                  <input
                    type="number"
                    value={idempAmount}
                    onChange={(e) => setIdempAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Scenarios:</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Send fresh request, replay identical request, or simulate malicious payload alteration using the same idempotency key.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleVerifyIdempotency("fresh")}
                      disabled={isTestingIdemp}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                    >
                      1. Fresh Initial Call (201 Created)
                    </button>
                    <button
                      onClick={() => handleVerifyIdempotency("replay")}
                      disabled={isTestingIdemp}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                    >
                      2. Duplicate Replay (200 Cached HIT)
                    </button>
                    <button
                      onClick={() => handleVerifyIdempotency("tamper")}
                      disabled={isTestingIdemp}
                      className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                    >
                      3. Altered Payload Conflict (422 Tamper)
                    </button>
                  </div>
                </div>
              </div>

              {idempResult && (
                <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-indigo-400 font-bold uppercase">
                      Backend Atomic Response: {idempResult.status}
                    </span>
                    <span className="text-[10px] text-slate-500">RFC 9421 Compliance</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded-lg">
                    {JSON.stringify(idempResult, null, 2)}
                  </pre>
                  <p className="text-[11px] text-emerald-400">
                    💡 {idempResult.message || idempResult.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: MULTI-REGION CRDT & VECTOR CLOCKS */}
      {activeTab === "crdt" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="text-purple-500" size={18} /> Multi-Region Active-Active CRDTs & Vector Clock Conflict Resolver
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Conflict-Free Replicated Data Types guarantee mathematical convergence across multi-master global clouds without synchronous cross-Atlantic locks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSplitBrainActive(!splitBrainActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    splitBrainActive
                      ? "bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <ShieldAlert size={13} />
                  {splitBrainActive ? "Partition Active (Split-Brain)" : "Simulate Network Partition"}
                </button>
                <button
                  onClick={handleSyncCrdt}
                  disabled={isSyncingCrdt}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className={isSyncingCrdt ? "animate-spin" : ""} size={13} />
                  Gossip Sync CRDTs
                </button>
              </div>
            </div>

            {/* 3 Regional Master Nodes */}
            <div className="grid gap-4 sm:grid-cols-3">
              {crdtRegions.map((region) => {
                const regionalVal = region.counterP - region.counterN;
                const isSevered = splitBrainActive && region.id === "us-east-1";

                return (
                  <div
                    key={region.id}
                    className={`rounded-2xl border p-4 transition space-y-3 ${
                      isSevered
                        ? "border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Server size={14} className="text-purple-500" /> {region.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSevered
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {isSevered ? "Severed from EU" : "Healthy"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 space-y-1 text-center">
                      <p className="text-[11px] text-slate-500 font-medium">Local PN-Counter State</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {regionalVal}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        P: +{region.counterP} | N: -{region.counterN}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateCrdtRegion(region.id, "P", 1)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                      >
                        + Incr (+1)
                      </button>
                      <button
                        onClick={() => handleUpdateCrdtRegion(region.id, "N", 1)}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition"
                      >
                        - Decr (-1)
                      </button>
                    </div>

                    <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-purple-400 uppercase font-bold">Vector Clock V_t</span>
                      <p className="text-slate-400">
                        ⟨US: {region.vectorClock["us-east"]}, EU: {region.vectorClock["eu-west"]}, AP: {region.vectorClock["ap-south"]}⟩
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Convergence Result & Mathematics Panel */}
            <div className="rounded-xl bg-slate-950 p-5 font-mono text-xs text-slate-300 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Mathematical Join-Semilattice Convergence State
                </span>
                <span className="text-[11px] text-slate-400">
                  Join Supremum Function: ⊔(A, B, C)
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[11px]">Converged Counter Value (All 3 Continents):</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {crdtConvergedResult.convergedValue}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Value = max(P_all) - max(N_all) = {Math.max(...crdtRegions.map((r) => r.counterP))} - {Math.max(...crdtRegions.map((r) => r.counterN))} = {crdtConvergedResult.convergedValue}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400 text-[11px]">Global Converged Vector Clock:</p>
                  <p className="text-xl font-bold text-sky-400">
                    ⟨US: {crdtConvergedResult.convergedClock["us-east"]}, EU: {crdtConvergedResult.convergedClock["eu-west"]}, AP: {crdtConvergedResult.convergedClock["ap-south"]}⟩
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Partial Order: Mathematically monotonic, commutative, and idempotent. Zero data loss during split-brain reconnect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: DATABASE SHARDING & SCATTER-GATHER */}
      {activeTab === "sharding" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shuffle className="text-emerald-600" size={18} /> Database Horizontal Sharding & Scatter-Gather Engine
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Partition 100M+ records across 4 cluster shards. Benchmark single-shard lookups vs cross-shard scatter-gather fanout penalties.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartResharding}
                  disabled={isResharding}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className={isResharding ? "animate-spin" : ""} size={13} />
                  {isResharding ? "Resharding in Progress..." : "Simulate Zero-Downtime Cluster Expansion (4 to 8 Shards)"}
                </button>
              </div>
            </div>

            {/* 4 Shard Nodes Cards */}
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { name: "shard-us-primary-0", region: "us-east-1", records: "25.4M", disk: 68, host: "10.0.1.10" },
                { name: "shard-us-primary-1", region: "us-east-1", records: "26.1M", disk: 71, host: "10.0.1.11" },
                { name: "shard-eu-primary-0", region: "eu-west-1", records: "24.8M", disk: 64, host: "10.0.2.10" },
                { name: "shard-ap-primary-0", region: "ap-southeast-1", records: "25.2M", disk: 66, host: "10.0.3.10" }
              ].map((shard, idx) => {
                const isSelected = shardingResult?.targetShard?.name === shard.name || shardingResult?.targetShard === "ALL_SHARDS";

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 transition space-y-2 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20 shadow-md"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white font-mono">{shard.name}</span>
                      <span className="text-[10px] text-slate-500">{shard.region}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Records:</span>
                        <strong className="text-slate-900 dark:text-white">{shard.records}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Disk Used:</span>
                        <strong className="text-slate-900 dark:text-white">{shard.disk}%</strong>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${shard.disk}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono text-center pt-1">
                      IP: {shard.host}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Zero Downtime Resharding Progress */}
            {reshardingStep > 0 && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span>Zero-Downtime Migration: Scaling 4 Shards → 8 Shards</span>
                  <span>Phase {reshardingStep} of 4</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className={`p-2 rounded border text-center ${reshardingStep >= 1 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    1. Dual-Writes
                  </div>
                  <div className={`p-2 rounded border text-center ${reshardingStep >= 2 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    2. CDC Backfill
                  </div>
                  <div className={`p-2 rounded border text-center ${reshardingStep >= 3 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    3. Shadow Reads
                  </div>
                  <div className={`p-2 rounded border text-center ${reshardingStep >= 4 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
                    4. Cutover 100%
                  </div>
                </div>
              </div>
            )}

            {/* Query Dispatcher Workbench */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sharding Key (user_id):
                  </label>
                  <input
                    type="text"
                    value={shardingKeyInput}
                    onChange={(e) => setShardingKeyInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end gap-2">
                  <button
                    onClick={() => handleRouteSharding("POINT_LOOKUP")}
                    disabled={isRoutingSharding}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 text-xs shadow-sm transition"
                  >
                    Point Lookup (WHERE user_id = :id)
                  </button>
                  <button
                    onClick={() => handleRouteSharding("SCATTER_GATHER")}
                    disabled={isRoutingSharding}
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 text-xs shadow-sm transition"
                  >
                    Scatter-Gather (WHERE status = 'PENDING')
                  </button>
                </div>
              </div>

              {/* Sharding Result Output */}
              {shardingResult && (
                <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400">
                    <span>Query Type: {shardingResult.queryType}</span>
                    <span>Latency: {shardingResult.latencyMs}ms</span>
                  </div>
                  <p className="text-slate-300">{shardingResult.summary}</p>
                  <div className="flex gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Shards Contacted: <strong className="text-white">{shardingResult.shardsContacted}</strong></span>
                    {shardingResult.aggregationOverheadMs && (
                      <span>Scatter-Gather Overhead: <strong className="text-rose-400">+{shardingResult.aggregationOverheadMs}ms</strong></span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: CACHE STAMPEDE & THUNDERING HERD DEFENSE */}
      {activeTab === "stampede" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="text-rose-500" size={18} /> Cache Stampede & Thundering Herd Defense Lab
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulate 1,000 concurrent Virtual Users hitting a hot cache key at the moment of TTL expiration.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                  stampedeResult?.systemState === "OPTIMAL_ZERO_STAMPEDE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : stampedeResult?.systemState === "PROTECTED"
                    ? "bg-sky-500/10 text-sky-500 border-sky-500/30"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                }`}>
                  Health: {stampedeResult?.systemState}
                </span>
              </div>
            </div>

            {/* Defense Strategy Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: "naive_ttl",
                  title: "1. Naive Fixed TTL",
                  badge: "Vulnerable to Crash",
                  desc: "Zero protection. When the 60s TTL expires, all 1,000 concurrent requests miss cache and slam the database simultaneously.",
                  color: "border-rose-500/40 hover:border-rose-500"
                },
                {
                  id: "mutex_lock",
                  title: "2. Distributed Mutex (Redlock)",
                  badge: "Protected via Locking",
                  desc: "SETNX atomic lock. Exactly 1 worker regenerates the cache key while 999 requests wait on the lock or read fallback.",
                  color: "border-sky-500/40 hover:border-sky-500"
                },
                {
                  id: "xfetch",
                  title: "3. Probabilistic Early Expiration (XFetch)",
                  badge: "Zero Downtime (FAANG Standard)",
                  desc: "Logarithmic probability formulation refreshes key asynchronously before expiration. 0 requests hit database.",
                  color: "border-emerald-500/40 hover:border-emerald-500"
                }
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => handleSimulateStampede(strat.id)}
                  className={`rounded-2xl border p-4 text-left transition space-y-2 ${
                    stampedeStrategy === strat.id
                      ? "bg-slate-900 border-slate-950 text-white shadow-xl dark:bg-slate-800"
                      : `bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200 ${strat.color}`
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{strat.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10">{strat.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {strat.desc}
                  </p>
                  <div className="pt-2 text-xs font-bold text-indigo-500 flex items-center gap-1">
                    <Play size={12} /> Run 1,000 VU Benchmark
                  </div>
                </button>
              ))}
            </div>

            {/* Real-time Benchmark Metrics Display */}
            {stampedeResult && (
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[11px] text-slate-500">Virtual Users (RPS):</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">1,000 VUs</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[11px] text-slate-500">DB Queries Slammed:</p>
                  <p className={`text-xl font-black ${stampedeResult.dbQueries > 10 ? "text-rose-600" : "text-emerald-500"}`}>
                    {stampedeResult.dbQueries} queries
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[11px] text-slate-500">Cache Hits:</p>
                  <p className="text-xl font-black text-sky-500">{stampedeResult.cacheHits} / 1000</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-[11px] text-slate-500">Average Latency:</p>
                  <p className={`text-xl font-black ${stampedeResult.avgLatencyMs > 100 ? "text-rose-600" : "text-emerald-500"}`}>
                    {stampedeResult.avgLatencyMs}ms
                  </p>
                </div>
              </div>
            )}

            {/* Explanation & Logarithm Formula */}
            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-2">
              <span className="text-[11px] text-amber-400 uppercase font-bold">
                Algorithmic Principle: Optimal Probabilistic Cache Expiration (XFetch)
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Condition: -β · δ · ln(rand()) &gt; (TTL - elapsed). Where β &gt; 0 is the aggression factor, δ is compute time, and rand() ∈ (0, 1]. As the key approaches expiration, the probability of background recomputation smoothly approaches 1.0, ensuring 0 cache misses and 0 stampedes under extreme concurrency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SRE INCIDENT COMMAND & RUNBOOK */}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPostMortemModal(true)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 transition"
                >
                  <FileText size={13} /> View Post-Mortem Report
                </button>
                {incidentResolved && (
                  <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Outage Mitigated & SLA Restored
                  </span>
                )}
              </div>
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

      {/* SRE Post-Mortem Report Modal */}
      {showPostMortemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="text-rose-600" size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  SRE Post-Mortem Incident Report
                </h3>
              </div>
              <button
                onClick={() => setShowPostMortemModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/80 font-mono space-y-1">
                <p><strong>Incident Title:</strong> {activeIncident.title}</p>
                <p><strong>Severity:</strong> {activeIncident.severity}</p>
                <p><strong>Impacted Service:</strong> {activeIncident.service}</p>
                <p><strong>Detection Time:</strong> {activeIncident.postMortem.detectionTime}</p>
                <p><strong>Resolution Time:</strong> {activeIncident.postMortem.mitigationTime}</p>
                <p><strong>Mean Time to Resolution (MTTR):</strong> <strong className="text-emerald-500">{activeIncident.postMortem.mttr}</strong></p>
                <p><strong>Customer Impact:</strong> {activeIncident.postMortem.impactedUsers}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">1. Root Cause Analysis (RCA):</h4>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{activeIncident.rootCause}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">2. Action Items & Preventive Tasks:</h4>
                <ul className="mt-1 list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  {activeIncident.postMortem.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={copyPostMortemToClipboard}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-500 flex items-center gap-1.5 transition"
              >
                <Copy size={13} /> Copy Markdown
              </button>
              <button
                onClick={() => setShowPostMortemModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper inline icon for Send
function SendIcon({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
