// Chaos Engineering & Resilience Simulator State
let chaosState = {
  networkLatencyMs: 0,
  packetLossRate: 0,
  downstreamErrorRate: 0,
  dbConnectionPoolExhausted: false,
  memoryPressureActive: false,
  circuitBreaker: {
    status: "CLOSED", // "CLOSED" | "OPEN" | "HALF_OPEN"
    failureThreshold: 3,
    currentFailures: 0,
    tripCount: 0,
    lastTripTime: null,
    cooldownMs: 8000,
    fallbackResponsesServed: 0
  },
  concurrencyLimiter: {
    activeTokens: 20,
    maxCapacity: 20,
    queueSheddedRequests: 0,
    backpressureTripped: false
  },
  services: [
    { id: "api-gateway", name: "Edge API Gateway", status: "HEALTHY", latencyMs: 12 },
    { id: "auth-service", name: "IAM & OAuth2 Service", status: "HEALTHY", latencyMs: 24 },
    { id: "catalog-service", name: "Course Catalog Engine", status: "HEALTHY", latencyMs: 18 },
    { id: "db-primary", name: "Primary DB Cluster (Shards 01-04)", status: "HEALTHY", latencyMs: 4 },
    { id: "cache-redis", name: "Distributed Redis Redlock", status: "HEALTHY", latencyMs: 1.2 },
    { id: "worker-fleet", name: "BullMQ Worker Fleet (4 Pods)", status: "HEALTHY", latencyMs: 35 }
  ],
  telemetryLog: [
    {
      timestamp: new Date().toISOString(),
      event: "CHAOS_DAEMON_INITIALIZED",
      details: "Baseline healthy state verified. All 6 distributed services operational."
    }
  ]
};

// Calculate overall system health score (0 to 100)
function calculateHealthScore() {
  let score = 100;
  if (chaosState.networkLatencyMs > 0) {
    score -= Math.min(30, Math.floor(chaosState.networkLatencyMs / 50));
  }
  if (chaosState.packetLossRate > 0) {
    score -= Math.floor(chaosState.packetLossRate * 35);
  }
  if (chaosState.downstreamErrorRate > 0) {
    score -= Math.floor(chaosState.downstreamErrorRate * 35);
  }
  if (chaosState.dbConnectionPoolExhausted) score -= 30;
  if (chaosState.memoryPressureActive) score -= 20;
  if (chaosState.circuitBreaker.status === "OPEN") score -= 15;
  return Math.max(5, score);
}

// Update service health based on active faults
function refreshServiceStatuses() {
  const baseLatency = chaosState.networkLatencyMs;

  chaosState.services.forEach((s) => {
    let svcLatency = s.id === "cache-redis" ? 1.2 : s.id === "db-primary" ? 4 : 20;
    svcLatency += baseLatency;

    if (chaosState.packetLossRate > 0.3 || chaosState.downstreamErrorRate > 0.4) {
      if (s.id === "auth-service" || s.id === "catalog-service") {
        s.status = "CRITICAL";
      } else {
        s.status = "DEGRADED";
      }
    } else if (chaosState.networkLatencyMs > 500 || chaosState.dbConnectionPoolExhausted) {
      s.status = s.id === "db-primary" && chaosState.dbConnectionPoolExhausted ? "OUTAGE" : "DEGRADED";
    } else {
      s.status = "HEALTHY";
    }
    s.latencyMs = Math.round(svcLatency * (0.9 + Math.random() * 0.2));
  });

  // Circuit breaker state machine evaluation
  if (chaosState.downstreamErrorRate >= 0.5) {
    chaosState.circuitBreaker.currentFailures += 1;
    if (chaosState.circuitBreaker.currentFailures >= chaosState.circuitBreaker.failureThreshold) {
      if (chaosState.circuitBreaker.status !== "OPEN") {
        chaosState.circuitBreaker.status = "OPEN";
        chaosState.circuitBreaker.tripCount += 1;
        chaosState.circuitBreaker.lastTripTime = new Date().toISOString();
        chaosState.telemetryLog.unshift({
          timestamp: new Date().toISOString(),
          event: "CIRCUIT_BREAKER_TRIPPED_OPEN",
          details: `Failure threshold (${chaosState.circuitBreaker.failureThreshold}) breached. Downstream calls shed; serving fallback cache.`
        });
      }
      chaosState.circuitBreaker.fallbackResponsesServed += Math.floor(10 + Math.random() * 25);
    }
  } else if (chaosState.circuitBreaker.status === "OPEN") {
    // Check if cooldown elapsed
    chaosState.circuitBreaker.status = "HALF_OPEN";
    chaosState.circuitBreaker.currentFailures = 0;
    chaosState.telemetryLog.unshift({
      timestamp: new Date().toISOString(),
      event: "CIRCUIT_BREAKER_HALF_OPEN",
      details: "Cooldown elapsed. Probing downstream service with canary requests."
    });
  } else if (chaosState.circuitBreaker.status === "HALF_OPEN" && chaosState.downstreamErrorRate === 0) {
    chaosState.circuitBreaker.status = "CLOSED";
    chaosState.telemetryLog.unshift({
      timestamp: new Date().toISOString(),
      event: "CIRCUIT_BREAKER_CLOSED",
      details: "Canary requests succeeded. Normal traffic flow restored."
    });
  }

  // Keep telemetry log bounded
  if (chaosState.telemetryLog.length > 50) {
    chaosState.telemetryLog = chaosState.telemetryLog.slice(0, 50);
  }
}

// GET /api/chaos/status
export const getChaosStatus = async (_req, res) => {
  refreshServiceStatuses();
  const healthScore = calculateHealthScore();

  return res.status(200).json({
    success: true,
    healthScore,
    systemState: healthScore > 80 ? "OPTIMAL" : healthScore > 40 ? "DEGRADED_RESILIENT" : "SEVERE_BLAST_RADIUS",
    chaosState: {
      networkLatencyMs: chaosState.networkLatencyMs,
      packetLossRate: chaosState.packetLossRate,
      downstreamErrorRate: chaosState.downstreamErrorRate,
      dbConnectionPoolExhausted: chaosState.dbConnectionPoolExhausted,
      memoryPressureActive: chaosState.memoryPressureActive
    },
    circuitBreaker: chaosState.circuitBreaker,
    concurrencyLimiter: chaosState.concurrencyLimiter,
    services: chaosState.services,
    telemetryLog: chaosState.telemetryLog
  });
};

// POST /api/chaos/inject
export const injectFault = async (req, res) => {
  const {
    networkLatencyMs,
    packetLossRate,
    downstreamErrorRate,
    dbConnectionPoolExhausted,
    memoryPressureActive
  } = req.body;

  if (networkLatencyMs !== undefined) chaosState.networkLatencyMs = Math.max(0, parseInt(networkLatencyMs, 10));
  if (packetLossRate !== undefined) chaosState.packetLossRate = Math.min(1, Math.max(0, parseFloat(packetLossRate)));
  if (downstreamErrorRate !== undefined) chaosState.downstreamErrorRate = Math.min(1, Math.max(0, parseFloat(downstreamErrorRate)));
  if (dbConnectionPoolExhausted !== undefined) chaosState.dbConnectionPoolExhausted = Boolean(dbConnectionPoolExhausted);
  if (memoryPressureActive !== undefined) chaosState.memoryPressureActive = Boolean(memoryPressureActive);

  chaosState.telemetryLog.unshift({
    timestamp: new Date().toISOString(),
    event: "FAULT_INJECTION_APPLIED",
    details: `Latency: +${chaosState.networkLatencyMs}ms | Packet Loss: ${Math.round(chaosState.packetLossRate * 100)}% | Downstream Err: ${Math.round(chaosState.downstreamErrorRate * 100)}% | DBPoolExhausted: ${chaosState.dbConnectionPoolExhausted}`
  });

  refreshServiceStatuses();
  const healthScore = calculateHealthScore();

  return res.status(200).json({
    success: true,
    message: "Fault parameters injected into distributed system mesh",
    healthScore,
    chaosState: {
      networkLatencyMs: chaosState.networkLatencyMs,
      packetLossRate: chaosState.packetLossRate,
      downstreamErrorRate: chaosState.downstreamErrorRate,
      dbConnectionPoolExhausted: chaosState.dbConnectionPoolExhausted,
      memoryPressureActive: chaosState.memoryPressureActive
    },
    circuitBreaker: chaosState.circuitBreaker,
    services: chaosState.services
  });
};

// POST /api/chaos/run-scenario
export const runScenario = async (req, res) => {
  const { scenarioId } = req.body;

  let scenarioName = "Custom Chaos Run";
  switch (scenarioId) {
    case "SCENARIO_AUTH_CASCADE":
      scenarioName = "Cascading Downstream IAM Outage";
      chaosState.downstreamErrorRate = 0.85;
      chaosState.networkLatencyMs = 450;
      chaosState.circuitBreaker.currentFailures = 4;
      chaosState.circuitBreaker.status = "OPEN";
      chaosState.circuitBreaker.tripCount += 1;
      chaosState.circuitBreaker.lastTripTime = new Date().toISOString();
      chaosState.circuitBreaker.fallbackResponsesServed += 128;
      break;

    case "SCENARIO_TRANS_PACIFIC_SPIKE":
      scenarioName = "Trans-Pacific Regional Fiber Cut (High Latency)";
      chaosState.networkLatencyMs = 1200;
      chaosState.packetLossRate = 0.25;
      chaosState.concurrencyLimiter.queueSheddedRequests += 42;
      chaosState.concurrencyLimiter.backpressureTripped = true;
      break;

    case "SCENARIO_DB_STORM":
      scenarioName = "Thundering Herd Database Pool Exhaustion";
      chaosState.dbConnectionPoolExhausted = true;
      chaosState.networkLatencyMs = 600;
      chaosState.downstreamErrorRate = 0.3;
      break;

    default:
      return res.status(400).json({
        success: false,
        message: "Invalid scenarioId. Options: SCENARIO_AUTH_CASCADE, SCENARIO_TRANS_PACIFIC_SPIKE, SCENARIO_DB_STORM"
      });
  }

  chaosState.telemetryLog.unshift({
    timestamp: new Date().toISOString(),
    event: "CHAOS_EXPERIMENT_INITIATED",
    details: `Executed automated chaos scenario: '${scenarioName}'. Observing resilience telemetry.`
  });

  refreshServiceStatuses();
  const healthScore = calculateHealthScore();

  return res.status(200).json({
    success: true,
    scenarioId,
    scenarioName,
    healthScore,
    circuitBreaker: chaosState.circuitBreaker,
    services: chaosState.services,
    telemetryLog: chaosState.telemetryLog
  });
};

// POST /api/chaos/reset
export const resetChaos = async (_req, res) => {
  chaosState.networkLatencyMs = 0;
  chaosState.packetLossRate = 0;
  chaosState.downstreamErrorRate = 0;
  chaosState.dbConnectionPoolExhausted = false;
  chaosState.memoryPressureActive = false;
  chaosState.circuitBreaker.status = "CLOSED";
  chaosState.circuitBreaker.currentFailures = 0;
  chaosState.concurrencyLimiter.backpressureTripped = false;

  chaosState.telemetryLog.unshift({
    timestamp: new Date().toISOString(),
    event: "CHAOS_TEARDOWN_RESET",
    details: "All artificial faults cleared. Distributed service mesh returned to 100% nominal state."
  });

  refreshServiceStatuses();

  return res.status(200).json({
    success: true,
    message: "All chaos faults cleared and circuit breakers reset to CLOSED",
    healthScore: 100,
    services: chaosState.services
  });
};
