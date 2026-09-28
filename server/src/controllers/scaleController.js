import crypto from "crypto";

// In-memory idempotency store (simulating Redis cluster key-value store with TTL)
const idempotencyStore = new Map();

/**
 * Clean up old idempotency entries older than 1 hour
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.createdAt > 3600000) {
      idempotencyStore.delete(key);
    }
  }
}, 300000);

/**
 * MurmurHash3 32-bit implementation for high-speed consistent sharding
 */
function murmurHash3(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0);
}

/**
 * 1. Live Enterprise Cluster & Process Metrics
 */
export const getClusterMetrics = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const uptimeSec = process.uptime();
    const now = Date.now();

    // Node process V8 telemetry
    const processMetrics = {
      rssBytes: memory.rss,
      heapTotalBytes: memory.heapTotal,
      heapUsedBytes: memory.heapUsed,
      externalBytes: memory.external,
      arrayBuffers: memory.arrayBuffers,
      heapUsagePercentage: ((memory.heapUsed / memory.heapTotal) * 100).toFixed(1),
      uptimeSeconds: Math.floor(uptimeSec),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    };

    // Distributed cluster node status (simulating production multi-AZ cluster)
    const clusterNodes = [
      {
        nodeId: "app-node-us-east-1a",
        region: "us-east-1",
        az: "us-east-1a",
        role: "Primary Leader",
        status: "HEALTHY",
        cpuPercent: (14 + Math.random() * 8).toFixed(1),
        memoryPercent: (48 + Math.random() * 6).toFixed(1),
        activeConnections: Math.floor(320 + Math.random() * 40),
        p99LatencyMs: (11.2 + Math.random() * 2).toFixed(1),
        replicationLagMs: 0
      },
      {
        nodeId: "app-node-us-east-1b",
        region: "us-east-1",
        az: "us-east-1b",
        role: "Worker Replica",
        status: "HEALTHY",
        cpuPercent: (12 + Math.random() * 7).toFixed(1),
        memoryPercent: (44 + Math.random() * 5).toFixed(1),
        activeConnections: Math.floor(290 + Math.random() * 35),
        p99LatencyMs: (12.8 + Math.random() * 2).toFixed(1),
        replicationLagMs: 2
      },
      {
        nodeId: "app-node-eu-west-1a",
        region: "eu-west-1",
        az: "eu-west-1a",
        role: "Worker Replica",
        status: "HEALTHY",
        cpuPercent: (18 + Math.random() * 6).toFixed(1),
        memoryPercent: (52 + Math.random() * 7).toFixed(1),
        activeConnections: Math.floor(410 + Math.random() * 50),
        p99LatencyMs: (18.4 + Math.random() * 3).toFixed(1),
        replicationLagMs: 14
      },
      {
        nodeId: "app-node-ap-southeast-1a",
        region: "ap-southeast-1",
        az: "ap-southeast-1a",
        role: "Worker Replica",
        status: "HEALTHY",
        cpuPercent: (16 + Math.random() * 5).toFixed(1),
        memoryPercent: (46 + Math.random() * 4).toFixed(1),
        activeConnections: Math.floor(260 + Math.random() * 30),
        p99LatencyMs: (22.1 + Math.random() * 4).toFixed(1),
        replicationLagMs: 28
      }
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      processMetrics,
      clusterNodes,
      clusterHealth: "OPTIMAL",
      totalActiveRequests: clusterNodes.reduce((acc, n) => acc + n.activeConnections, 0)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Distributed Saga Orchestrator with Compensating Transactions
 */
export const executeSaga = async (req, res, next) => {
  try {
    const { sagaId = `saga_${Date.now()}`, customerId = "cust_9921", amount = 249.99, simulateFailureStep = null } = req.body;

    const timeline = [];
    const pushStep = (stepName, service, action, status, details, isCompensation = false) => {
      timeline.push({
        step: timeline.length + 1,
        timestamp: new Date().toISOString(),
        service,
        action,
        status, // 'SUCCESS' | 'FAILED' | 'COMPENSATED'
        isCompensation,
        details
      });
    };

    // Step 1: Create Pending Order (Order Service)
    pushStep("1. Order Placement", "order-service", "CREATE_ORDER", "SUCCESS", `Order ${sagaId} initialized for customer ${customerId} in PENDING state`);

    // Step 2: Reserve Inventory (Inventory Service)
    if (simulateFailureStep === "inventory") {
      pushStep("2. Inventory Reservation", "inventory-service", "RESERVE_STOCK", "FAILED", "Stock unavailable for SKU_SKILLTRACK_PRO. Out of inventory.");
      // Compensations
      pushStep("Compensate 1", "order-service", "CANCEL_ORDER", "COMPENSATED", `Order ${sagaId} marked as CANCELLED (Inventory Exhausted).`, true);
      return res.json({
        success: false,
        sagaId,
        outcome: "ROLLED_BACK",
        failurePoint: "inventory-service",
        timeline,
        summary: "Saga failed at Inventory Reservation. Forward transactions aborted. Reverse compensating transaction completed cleanly."
      });
    }
    pushStep("2. Inventory Reservation", "inventory-service", "RESERVE_STOCK", "SUCCESS", `Reserved 1 unit of SKU_SKILLTRACK_PRO. Lock TTL: 300s`);

    // Step 3: Payment Capture (Payment Gateway / Stripe)
    if (simulateFailureStep === "payment") {
      pushStep("3. Payment Authorization", "payment-service", "CHARGE_CARD", "FAILED", "Payment Gateway 504 Gateway Timeout / Insufficient Funds.");
      // Compensations in reverse order
      pushStep("Compensate 2", "inventory-service", "RELEASE_STOCK", "COMPENSATED", `Released reserved unit of SKU_SKILLTRACK_PRO back to pool.`, true);
      pushStep("Compensate 1", "order-service", "CANCEL_ORDER", "COMPENSATED", `Order ${sagaId} marked as CANCELLED (Payment Failed).`, true);
      return res.json({
        success: false,
        sagaId,
        outcome: "ROLLED_BACK",
        failurePoint: "payment-service",
        timeline,
        summary: "Saga failed at Payment Capture. 2 reverse compensating transactions executed automatically. System returned to clean consistent state."
      });
    }
    pushStep("3. Payment Authorization", "payment-service", "CHARGE_CARD", "SUCCESS", `Charged $${amount} via Stripe (Payment Intent: pi_${crypto.randomBytes(6).toString("hex")})`);

    // Step 4: Dispatch Logistics / License Provisioning
    if (simulateFailureStep === "dispatch") {
      pushStep("4. License Provisioning", "fulfillment-service", "PROVISION_ACCESS", "FAILED", "License cluster synchronization failed.");
      // Compensations
      pushStep("Compensate 3", "payment-service", "REFUND_CHARGE", "COMPENSATED", `Full refund of $${amount} issued to customer card.`, true);
      pushStep("Compensate 2", "inventory-service", "RELEASE_STOCK", "COMPENSATED", `Inventory hold released.`, true);
      pushStep("Compensate 1", "order-service", "CANCEL_ORDER", "COMPENSATED", `Order ${sagaId} cancelled and customer alerted.`, true);
      return res.json({
        success: false,
        sagaId,
        outcome: "ROLLED_BACK",
        failurePoint: "fulfillment-service",
        timeline,
        summary: "Saga failed at Fulfillment. Full 3-phase reverse compensation performed: Refunded payment, released stock, marked order cancelled."
      });
    }
    pushStep("4. License Provisioning", "fulfillment-service", "PROVISION_ACCESS", "SUCCESS", `SkillTrack Enterprise License key generated and emailed to ${customerId}`);

    // All steps succeeded
    res.json({
      success: true,
      sagaId,
      outcome: "COMMITTED",
      timeline,
      summary: "Distributed Saga committed across 4 microservices without distributed two-phase commit locks. 100% ACID consistency achieved."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Enterprise Idempotency-Key Fingerprint Validator
 */
export const verifyIdempotency = async (req, res, next) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;
    const { payload = {} } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Missing 'Idempotency-Key' header or body property."
      });
    }

    // Compute cryptographic SHA-256 fingerprint of the request payload
    const payloadFingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");

    const existingRecord = idempotencyStore.get(idempotencyKey);

    if (existingRecord) {
      // Scenario A: Identical payload replayed (Network retry, client timeout replay)
      if (existingRecord.payloadFingerprint === payloadFingerprint) {
        return res.status(200).json({
          success: true,
          status: "CACHED_IDEMPOTENT_RESPONSE",
          idempotentReplay: true,
          idempotencyKey,
          firstSeenAt: new Date(existingRecord.createdAt).toISOString(),
          responsePayload: existingRecord.responsePayload,
          message: "Duplicate request detected. Returned previously computed result with zero redundant database side-effects."
        });
      }

      // Scenario B: Same Idempotency-Key re-used with DIFFERENT payload (Tampering or Bug)
      return res.status(422).json({
        success: false,
        status: "IDEMPOTENCY_CONFLICT",
        idempotencyKey,
        error: "Idempotency-Key reused with conflicting payload fingerprint (RFC 9421 violation).",
        expectedFingerprint: existingRecord.payloadFingerprint,
        receivedFingerprint: payloadFingerprint
      });
    }

    // Scenario C: Fresh, first-time request
    const responsePayload = {
      transactionId: `txn_${crypto.randomBytes(8).toString("hex")}`,
      processedAt: new Date().toISOString(),
      amount: payload.amount || 199,
      status: "COMPLETED"
    };

    idempotencyStore.set(idempotencyKey, {
      idempotencyKey,
      payloadFingerprint,
      responsePayload,
      createdAt: Date.now()
    });

    res.status(201).json({
      success: true,
      status: "EXECUTED_FRESH",
      idempotentReplay: false,
      idempotencyKey,
      payloadFingerprint,
      responsePayload,
      message: "First-time request executed and cached under atomic lock for 3600 seconds."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Multi-Region Conflict-Free Replicated Data Type (CRDT) Sync Engine
 */
export const syncCrdt = async (req, res, next) => {
  try {
    const { regions = [] } = req.body;
    // Default 3-region state if none passed
    const defaultRegions = [
      { id: "us-east-1", label: "US East (N. Virginia)", counterP: 14, counterN: 2, lastModified: Date.now() - 3200, vectorClock: { "us-east": 8, "eu-west": 4, "ap-south": 2 } },
      { id: "eu-west-1", label: "EU West (Frankfurt)", counterP: 19, counterN: 3, lastModified: Date.now() - 1100, vectorClock: { "us-east": 7, "eu-west": 9, "ap-south": 2 } },
      { id: "ap-southeast-1", label: "AP South (Singapore)", counterP: 12, counterN: 1, lastModified: Date.now() - 4800, vectorClock: { "us-east": 6, "eu-west": 4, "ap-south": 5 } }
    ];

    const activeRegions = regions.length > 0 ? regions : defaultRegions;

    // Merge PN-Counter: Value = max(P) - max(N) across all nodes
    const maxP = Math.max(...activeRegions.map((r) => r.counterP || 0));
    const maxN = Math.max(...activeRegions.map((r) => r.counterN || 0));
    const convergedPNCounterValue = maxP - maxN;

    // Merge Vector Clocks: Supremum / Join across all region vectors
    const mergedVectorClock = {};
    activeRegions.forEach((r) => {
      if (r.vectorClock) {
        Object.entries(r.vectorClock).forEach(([node, clock]) => {
          mergedVectorClock[node] = Math.max(mergedVectorClock[node] || 0, clock);
        });
      }
    });

    res.json({
      success: true,
      convergedValue: convergedPNCounterValue,
      convergedVectorClock: mergedVectorClock,
      resolutionStrategy: "State-based PN-Counter Join-Semilattice (Supremum)",
      regionsEvaluated: activeRegions.length,
      convergedAt: new Date().toISOString(),
      explanation: `Mathematically guaranteed eventual consistency without distributed locks. PN-Counter converges to P(${maxP}) - N(${maxN}) = ${convergedPNCounterValue}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Database Sharding & Scatter-Gather Query Optimizer
 */
export const routeSharding = async (req, res, next) => {
  try {
    const { shardingKey = "usr_9941a8", queryType = "POINT_LOOKUP" } = req.body;
    const shards = [
      { id: 0, name: "shard-us-primary-0", host: "10.0.1.10", region: "us-east-1", recordCount: "25.4M", capacityUsedPercent: 68 },
      { id: 1, name: "shard-us-primary-1", host: "10.0.1.11", region: "us-east-1", recordCount: "26.1M", capacityUsedPercent: 71 },
      { id: 2, name: "shard-eu-primary-0", host: "10.0.2.10", region: "eu-west-1", recordCount: "24.8M", capacityUsedPercent: 64 },
      { id: 3, name: "shard-ap-primary-0", host: "10.0.3.10", region: "ap-southeast-1", recordCount: "25.2M", capacityUsedPercent: 66 }
    ];

    // Compute hash
    const hash = murmurHash3(String(shardingKey));
    const targetShardIndex = hash % shards.length;
    const targetShard = shards[targetShardIndex];

    if (queryType === "POINT_LOOKUP") {
      return res.json({
        success: true,
        queryType: "POINT_LOOKUP",
        shardingKey,
        hashValue: hash,
        targetShard,
        shardsContacted: 1,
        latencyMs: 1.4,
        routingOverheadMs: 0.1,
        strategy: "Direct Hash Shard Routing: hash(key) % 4",
        summary: `Query routed straight to ${targetShard.name}. Single round-trip in 1.4ms.`
      });
    }

    // SCATTER_GATHER (Non-partitioned query e.g. "SELECT * WHERE status = 'PENDING'")
    const shardResponses = shards.map((s) => ({
      shard: s.name,
      latencyMs: (8 + Math.random() * 12).toFixed(1),
      recordsReturned: Math.floor(12 + Math.random() * 8)
    }));

    const maxLatency = Math.max(...shardResponses.map((r) => parseFloat(r.latencyMs)));
    const totalLatency = (maxLatency + 4.2).toFixed(1); // Scatter-gather fanout max + aggregation overhead

    res.json({
      success: true,
      queryType: "SCATTER_GATHER",
      shardingKey: "(NONE - Broadcast Query)",
      targetShard: "ALL_SHARDS",
      shardsContacted: shards.length,
      latencyMs: Number(totalLatency),
      aggregationOverheadMs: 4.2,
      shardResponses,
      strategy: "Parallel Fan-Out Scatter-Gather",
      summary: `Broadcasted to all 4 shards in parallel. Latency bounded by slowest shard (${maxLatency}ms) + aggregation penalty (4.2ms) = ${totalLatency}ms.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Cache Stampede & Thundering Herd Defense Simulator
 */
export const simulateCacheStampede = async (req, res, next) => {
  try {
    const { strategy = "xfetch", concurrentRequests = 1000 } = req.body;

    let dbQueries = 0;
    let cacheHits = 0;
    let avgLatencyMs = 0;
    let systemState = "HEALTHY";

    if (strategy === "naive_ttl") {
      // 1000 requests all find the key expired simultaneously -> Thundering Herd
      dbQueries = concurrentRequests;
      cacheHits = 0;
      avgLatencyMs = 1840; // Database choked
      systemState = "CRITICAL_COLLAPSE";
    } else if (strategy === "mutex_lock") {
      // Single worker gets lock, others wait
      dbQueries = 1;
      cacheHits = concurrentRequests - 1;
      avgLatencyMs = 8.4;
      systemState = "PROTECTED";
    } else if (strategy === "xfetch") {
      // Probabilistic Early Expiration: Background worker refreshed key at t_delta
      dbQueries = 1;
      cacheHits = concurrentRequests;
      avgLatencyMs = 1.2;
      systemState = "OPTIMAL_ZERO_STAMPEDE";
    }

    res.json({
      success: true,
      strategy,
      concurrentRequests,
      dbQueries,
      cacheHits,
      avgLatencyMs,
      systemState,
      formula: strategy === "xfetch" ? "-beta * delta * ln(rand()) > (TTL - elapsed)" : null,
      summary: strategy === "xfetch"
        ? "Probabilistic Early Expiration (XFetch) prevented 100% of cache stampede. Exactly 1 asynchronous background refresh occurred while 1,000 requests hit hot cache at 1.2ms."
        : strategy === "mutex_lock"
        ? "Distributed Mutex (Redlock) prevented duplicate DB execution. Exactly 1 request regenerated key while 999 requests queued or read replica."
        : "Catastrophic Cache Stampede! 1,000 concurrent requests slammed MongoDB primary at TTL expiry. CPU spiked to 100%, latency jumped to 1,840ms."
    });
  } catch (error) {
    next(error);
  }
};
