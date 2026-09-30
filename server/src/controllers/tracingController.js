import crypto from "crypto";

// In-Memory Distributed Trace Storage
let traceStore = [];

// Helper: Calculate Critical Path in a Trace Span DAG
function calculateCriticalPath(spans) {
  // Map spans by ID
  const spanMap = new Map();
  spans.forEach((s) => spanMap.set(s.spanId, { ...s, children: [] }));

  // Build parent-child relationships
  let rootSpan = null;
  spans.forEach((s) => {
    if (s.parentSpanId && spanMap.has(s.parentSpanId)) {
      spanMap.get(s.parentSpanId).children.push(s.spanId);
    } else {
      rootSpan = s;
    }
  });

  // Longest path search from root
  const criticalSpanIds = new Set();
  function findLongestPath(currentId) {
    const node = spanMap.get(currentId);
    if (!node || node.children.length === 0) {
      return { duration: node ? node.durationMs : 0, path: [currentId] };
    }

    let maxChild = { duration: 0, path: [] };
    for (const childId of node.children) {
      const res = findLongestPath(childId);
      if (res.duration > maxChild.duration) {
        maxChild = res;
      }
    }

    return {
      duration: node.durationMs + maxChild.duration,
      path: [currentId, ...maxChild.path]
    };
  }

  if (rootSpan) {
    const result = findLongestPath(rootSpan.spanId);
    result.path.forEach((id) => criticalSpanIds.add(id));
  }

  return spans.map((s) => ({
    ...s,
    isCriticalPath: criticalSpanIds.has(s.spanId)
  }));
}

// Seed high-fidelity distributed traces
function seedDefaultTraces() {
  traceStore = [
    {
      traceId: "tr-7f9a1c8b3e2d4091a1b2c3d4e5f60718",
      name: "POST /api/courses/enroll (Distributed Saga Workflow)",
      rootService: "edge-api-gateway",
      totalDurationMs: 248.5,
      statusCode: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      spans: [
        {
          spanId: "sp-root-001",
          parentSpanId: null,
          serviceName: "edge-api-gateway",
          operationName: "HTTP POST /api/courses/enroll",
          startOffsetMs: 0.0,
          durationMs: 248.5,
          statusCode: 200,
          tags: {
            "http.method": "POST",
            "http.status_code": 200,
            "net.peer.ip": "192.168.1.104",
            "component": "reverse-proxy"
          }
        },
        {
          spanId: "sp-auth-002",
          parentSpanId: "sp-root-001",
          serviceName: "iam-auth-service",
          operationName: "VerifyJWT & EnforceRBAC",
          startOffsetMs: 3.2,
          durationMs: 18.4,
          statusCode: 200,
          tags: {
            "jwt.algorithm": "RS256",
            "rbac.role": "student",
            "opa.decision": "ALLOW"
          }
        },
        {
          spanId: "sp-redis-003",
          parentSpanId: "sp-auth-002",
          serviceName: "cache-redis-cluster",
          operationName: "MGET session:token:user_8842",
          startOffsetMs: 5.1,
          durationMs: 2.1,
          statusCode: 200,
          tags: {
            "db.system": "redis",
            "db.statement": "MGET session:token:user_8842",
            "cache.hit": true
          }
        },
        {
          spanId: "sp-saga-004",
          parentSpanId: "sp-root-001",
          serviceName: "saga-orchestrator",
          operationName: "ExecuteEnrollmentSaga",
          startOffsetMs: 23.6,
          durationMs: 215.8,
          statusCode: 200,
          tags: {
            "saga.id": "SAGA-ENROLL-8842",
            "saga.steps": 3,
            "idempotency.key": "idemp_5f8a9b2c"
          }
        },
        {
          spanId: "sp-shard-005",
          parentSpanId: "sp-saga-004",
          serviceName: "db-sharded-primary (Shard 02)",
          operationName: "UPDATE course_seats SET reserved = reserved + 1",
          startOffsetMs: 28.4,
          durationMs: 38.6,
          statusCode: 200,
          tags: {
            "db.system": "postgresql",
            "db.shard": "shard_02",
            "db.partition_key": "course_c3"
          }
        },
        {
          spanId: "sp-billing-006",
          parentSpanId: "sp-saga-004",
          serviceName: "payment-stripe-gateway",
          operationName: "POST /v1/payment_intents/confirm",
          startOffsetMs: 72.1,
          durationMs: 142.3,
          statusCode: 200,
          tags: {
            "http.method": "POST",
            "peer.service": "stripe_external_api",
            "payment.amount_usd": 49.0
          }
        },
        {
          spanId: "sp-kafka-007",
          parentSpanId: "sp-saga-004",
          serviceName: "kafka-event-bus",
          operationName: "Produce event.course.enrolled",
          startOffsetMs: 218.4,
          durationMs: 18.2,
          statusCode: 200,
          tags: {
            "messaging.system": "kafka",
            "messaging.destination": "events.enrollment",
            "kafka.partition": 3
          }
        }
      ]
    },
    {
      traceId: "tr-e2b4c68019a34df28901bc456789def0",
      name: "GET /api/certificates/verify (Merkle Batch Audit)",
      rootService: "edge-api-gateway",
      totalDurationMs: 64.2,
      statusCode: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      spans: [
        {
          spanId: "sp-root-101",
          parentSpanId: null,
          serviceName: "edge-api-gateway",
          operationName: "HTTP GET /api/certificates/verify",
          startOffsetMs: 0.0,
          durationMs: 64.2,
          statusCode: 200,
          tags: { "http.method": "GET", "component": "reverse-proxy" }
        },
        {
          spanId: "sp-cert-102",
          parentSpanId: "sp-root-101",
          serviceName: "certificate-ledger-service",
          operationName: "QueryBatchSignatures",
          startOffsetMs: 4.5,
          durationMs: 56.8,
          statusCode: 200,
          tags: { "merkle.batch_size": 3, "rfc": "6962" }
        },
        {
          spanId: "sp-crypto-103",
          parentSpanId: "sp-cert-102",
          serviceName: "crypto-hashing-engine",
          operationName: "ComputeMerkleBinaryTreeRoot",
          startOffsetMs: 18.2,
          durationMs: 38.4,
          statusCode: 200,
          tags: { "crypto.algorithm": "SHA-256", "leaves_count": 3 }
        }
      ]
    },
    {
      traceId: "tr-99887766554433221100aabbccddeeff",
      name: "POST /api/jobs/apply (Downstream Degraded Timeout)",
      rootService: "edge-api-gateway",
      totalDurationMs: 524.0,
      statusCode: 504,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      spans: [
        {
          spanId: "sp-root-201",
          parentSpanId: null,
          serviceName: "edge-api-gateway",
          operationName: "HTTP POST /api/jobs/apply",
          startOffsetMs: 0.0,
          durationMs: 524.0,
          statusCode: 504,
          tags: { "http.method": "POST", "error": true, "http.status_code": 504 }
        },
        {
          spanId: "sp-ats-202",
          parentSpanId: "sp-root-201",
          serviceName: "ats-resume-scanner",
          operationName: "ParsePDF & ExtractKeywords",
          startOffsetMs: 6.2,
          durationMs: 512.4,
          statusCode: 504,
          tags: {
            "error": true,
            "error.message": "Downstream RPC timed out after 500ms deadline",
            "circuit_breaker.state": "TRIPPED_TO_OPEN"
          }
        },
        {
          spanId: "sp-cb-203",
          parentSpanId: "sp-root-201",
          serviceName: "envoy-circuit-breaker",
          operationName: "FallbackToCacheOrQueue",
          startOffsetMs: 518.9,
          durationMs: 4.8,
          statusCode: 200,
          tags: { "circuit_breaker.fallback_invoked": true, "fallback.cache_hit": true }
        }
      ]
    }
  ];

  // Annotate critical paths
  traceStore = traceStore.map((t) => ({
    ...t,
    spans: calculateCriticalPath(t.spans)
  }));
}

// Initial seed
seedDefaultTraces();

// GET /api/tracing/traces
export const getTraces = async (req, res) => {
  const { service, minDuration, status: filterStatus } = req.query;

  let filtered = [...traceStore];
  if (service) {
    filtered = filtered.filter((t) =>
      t.spans.some((s) => s.serviceName.toLowerCase().includes(service.toLowerCase()))
    );
  }
  if (minDuration) {
    const minMs = parseFloat(minDuration);
    filtered = filtered.filter((t) => t.totalDurationMs >= minMs);
  }
  if (filterStatus === "error") {
    filtered = filtered.filter((t) => t.statusCode >= 400);
  } else if (filterStatus === "success") {
    filtered = filtered.filter((t) => t.statusCode < 400);
  }

  // Calculate summaries
  const summaries = filtered.map((t) => ({
    traceId: t.traceId,
    name: t.name,
    rootService: t.rootService,
    totalDurationMs: t.totalDurationMs,
    statusCode: t.statusCode,
    spanCount: t.spans.length,
    timestamp: t.timestamp,
    criticalPathDurationMs: t.spans
      .filter((s) => s.isCriticalPath)
      .reduce((acc, s) => acc + s.durationMs, 0)
  }));

  return res.status(200).json({
    success: true,
    totalTraces: summaries.length,
    traces: summaries
  });
};

// GET /api/tracing/trace/:traceId
export const getTraceById = async (req, res) => {
  const { traceId } = req.params;
  const trace = traceStore.find((t) => t.traceId === traceId);

  if (!trace) {
    return res.status(404).json({
      success: false,
      message: `Trace with ID '${traceId}' not found.`
    });
  }

  return res.status(200).json({
    success: true,
    trace
  });
};

// POST /api/tracing/simulate
export const simulateTrace = async (req, res) => {
  const { routeName, induceBottleneck } = req.body;

  const traceId = `tr-${crypto.randomBytes(16).toString("hex")}`;
  const isSlow = Boolean(induceBottleneck);
  const baseLatency = isSlow ? 640 : 85;

  const spans = [
    {
      spanId: `sp-${crypto.randomBytes(4).toString("hex")}`,
      parentSpanId: null,
      serviceName: "edge-api-gateway",
      operationName: routeName || "POST /api/scale/crdt/sync",
      startOffsetMs: 0.0,
      durationMs: baseLatency + (isSlow ? 45 : 12),
      statusCode: isSlow ? 503 : 200,
      tags: { "http.method": "POST", "simulated": true }
    },
    {
      spanId: `sp-${crypto.randomBytes(4).toString("hex")}`,
      parentSpanId: null,
      serviceName: "crdt-vector-clock-engine",
      operationName: "JoinSemilatticeMerge",
      startOffsetMs: 4.2,
      durationMs: isSlow ? 580 : 38,
      statusCode: isSlow ? 503 : 200,
      tags: {
        "crdt.vector_clocks": 4,
        "bottleneck_detected": isSlow,
        "bottleneck_reason": isSlow ? "Simulated Lock Contention under High Concurrency" : "Nominal"
      }
    }
  ];

  spans[1].parentSpanId = spans[0].spanId;

  const newTrace = {
    traceId,
    name: routeName || "POST /api/scale/crdt/sync",
    rootService: "edge-api-gateway",
    totalDurationMs: spans[0].durationMs,
    statusCode: isSlow ? 503 : 200,
    timestamp: new Date().toISOString(),
    spans: calculateCriticalPath(spans)
  };

  traceStore.unshift(newTrace);
  if (traceStore.length > 50) traceStore.pop();

  return res.status(201).json({
    success: true,
    message: `Distributed trace '${traceId}' simulated and recorded.`,
    trace: newTrace
  });
};

// POST /api/tracing/reset
export const resetTraces = async (_req, res) => {
  seedDefaultTraces();
  return res.status(200).json({
    success: true,
    message: "Trace store reset to baseline production traces.",
    totalTraces: traceStore.length
  });
};
