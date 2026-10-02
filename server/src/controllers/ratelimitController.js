// server/src/controllers/ratelimitController.js
// Distributed Rate Limiting & High-Concurrency Traffic Shaper
// Implementing Sliding Window Counter, Token Bucket (Redis Lua), and Leaky Bucket

const BUCKET_CAPACITY = 20;
const REFILL_RATE_PER_SEC = 5;
const SLIDING_WINDOW_SEC = 60;
const SLIDING_WINDOW_LIMIT = 60;
const LEAKY_BUCKET_CAPACITY = 15;
const LEAK_RATE_PER_SEC = 5;

let rateLimiterState = {
  activeAlgorithm: "TOKEN_BUCKET", // 'TOKEN_BUCKET' | 'SLIDING_WINDOW' | 'LEAKY_BUCKET'
  tokenBucket: {
    capacity: BUCKET_CAPACITY,
    tokens: BUCKET_CAPACITY,
    refillRatePerSec: REFILL_RATE_PER_SEC,
    lastRefillTimeMs: Date.now()
  },
  slidingWindow: {
    windowSec: SLIDING_WINDOW_SEC,
    limit: SLIDING_WINDOW_LIMIT,
    previousCount: 42,
    currentCount: 15,
    windowStartMs: Date.now() - 25000
  },
  leakyBucket: {
    capacity: LEAKY_BUCKET_CAPACITY,
    queuedRequests: 2,
    leakRatePerSec: LEAK_RATE_PER_SEC,
    lastLeakTimeMs: Date.now()
  },
  metrics: {
    totalRequests: 148,
    acceptedRequests: 126,
    rejectedRequests: 22,
    lastBurstSize: 0,
    rejectionRatePercent: 14.8
  },
  trafficLog: [
    {
      id: "req_init_1",
      timestamp: new Date().toISOString(),
      clientIp: "192.168.1.101",
      tier: "PRO_API_KEY",
      algorithm: "TOKEN_BUCKET",
      status: 200,
      tokensRemaining: 18,
      latencyMs: 1.2
    }
  ]
};

function refillTokenBucket() {
  const now = Date.now();
  const elapsedSec = (now - rateLimiterState.tokenBucket.lastRefillTimeMs) / 1000;
  const tokensToAdd = elapsedSec * rateLimiterState.tokenBucket.refillRatePerSec;
  rateLimiterState.tokenBucket.tokens = Math.min(
    rateLimiterState.tokenBucket.capacity,
    rateLimiterState.tokenBucket.tokens + tokensToAdd
  );
  rateLimiterState.tokenBucket.lastRefillTimeMs = now;
}

function updateLeakyBucket() {
  const now = Date.now();
  const elapsedSec = (now - rateLimiterState.leakyBucket.lastLeakTimeMs) / 1000;
  const leaked = Math.floor(elapsedSec * rateLimiterState.leakyBucket.leakRatePerSec);
  if (leaked > 0) {
    rateLimiterState.leakyBucket.queuedRequests = Math.max(
      0,
      rateLimiterState.leakyBucket.queuedRequests - leaked
    );
    rateLimiterState.leakyBucket.lastLeakTimeMs = now;
  }
}

// GET /api/ratelimit/state
export const getRateLimiterState = (req, res) => {
  refillTokenBucket();
  updateLeakyBucket();
  res.json({
    success: true,
    data: rateLimiterState
  });
};

// POST /api/ratelimit/switch-algorithm
export const switchAlgorithm = (req, res) => {
  const { algorithm } = req.body;
  if (!["TOKEN_BUCKET", "SLIDING_WINDOW", "LEAKY_BUCKET"].includes(algorithm)) {
    return res.status(400).json({ success: false, message: "Invalid algorithm" });
  }

  rateLimiterState.activeAlgorithm = algorithm;
  res.json({
    success: true,
    message: `Switched active distributed rate limiting algorithm to ${algorithm}`,
    data: rateLimiterState
  });
};

// POST /api/ratelimit/blast (Simulate traffic burst)
export const blastTraffic = (req, res) => {
  const { count = 10, clientIp = "10.0.4.88", tier = "ENTERPRISE_API" } = req.body;
  const burstCount = Math.min(100, Math.max(1, parseInt(count, 10)));

  refillTokenBucket();
  updateLeakyBucket();

  let accepted = 0;
  let rejected = 0;
  const results = [];

  for (let i = 0; i < burstCount; i++) {
    let allowed = false;
    let tokensLeft = 0;
    let retryAfterSec = 0;

    if (rateLimiterState.activeAlgorithm === "TOKEN_BUCKET") {
      if (rateLimiterState.tokenBucket.tokens >= 1) {
        rateLimiterState.tokenBucket.tokens -= 1;
        allowed = true;
        tokensLeft = Math.floor(rateLimiterState.tokenBucket.tokens);
      } else {
        allowed = false;
        tokensLeft = 0;
        retryAfterSec = Math.ceil(1 / rateLimiterState.tokenBucket.refillRatePerSec);
      }
    } else if (rateLimiterState.activeAlgorithm === "SLIDING_WINDOW") {
      const now = Date.now();
      const elapsedWindowSec = (now - rateLimiterState.slidingWindow.windowStartMs) / 1000;
      const weight = Math.max(0, 1 - (elapsedWindowSec / rateLimiterState.slidingWindow.windowSec));
      const estimatedCount = rateLimiterState.slidingWindow.currentCount + (rateLimiterState.slidingWindow.previousCount * weight);

      if (estimatedCount < rateLimiterState.slidingWindow.limit) {
        rateLimiterState.slidingWindow.currentCount += 1;
        allowed = true;
        tokensLeft = Math.max(0, Math.floor(rateLimiterState.slidingWindow.limit - estimatedCount));
      } else {
        allowed = false;
        tokensLeft = 0;
        retryAfterSec = Math.ceil(rateLimiterState.slidingWindow.windowSec - elapsedWindowSec);
      }
    } else if (rateLimiterState.activeAlgorithm === "LEAKY_BUCKET") {
      if (rateLimiterState.leakyBucket.queuedRequests < rateLimiterState.leakyBucket.capacity) {
        rateLimiterState.leakyBucket.queuedRequests += 1;
        allowed = true;
        tokensLeft = rateLimiterState.leakyBucket.capacity - rateLimiterState.leakyBucket.queuedRequests;
      } else {
        allowed = false;
        tokensLeft = 0;
        retryAfterSec = Math.ceil(1 / rateLimiterState.leakyBucket.leakRatePerSec);
      }
    }

    if (allowed) accepted++;
    else rejected++;

    results.push({
      requestIndex: i + 1,
      status: allowed ? 200 : 429,
      statusText: allowed ? "OK" : "Too Many Requests",
      tokensRemaining: tokensLeft,
      retryAfterSec
    });
  }

  // Update metrics
  rateLimiterState.metrics.totalRequests += burstCount;
  rateLimiterState.metrics.acceptedRequests += accepted;
  rateLimiterState.metrics.rejectedRequests += rejected;
  rateLimiterState.metrics.lastBurstSize = burstCount;
  rateLimiterState.metrics.rejectionRatePercent = parseFloat(
    ((rateLimiterState.metrics.rejectedRequests / rateLimiterState.metrics.totalRequests) * 100).toFixed(1)
  );

  rateLimiterState.trafficLog.unshift({
    id: `burst_${Date.now()}`,
    timestamp: new Date().toISOString(),
    clientIp,
    tier,
    algorithm: rateLimiterState.activeAlgorithm,
    burstCount,
    accepted,
    rejected,
    status: rejected > 0 ? 429 : 200
  });

  if (rateLimiterState.trafficLog.length > 20) {
    rateLimiterState.trafficLog.pop();
  }

  res.json({
    success: true,
    message: `Blasted ${burstCount} requests via ${rateLimiterState.activeAlgorithm}: ${accepted} Allowed (200), ${rejected} Rate-Limited (429)`,
    summary: {
      burstCount,
      accepted,
      rejected,
      rejectionPercent: parseFloat(((rejected / burstCount) * 100).toFixed(1))
    },
    results: results.slice(0, 15), // Preview first 15 in response
    data: rateLimiterState
  });
};

// POST /api/ratelimit/reset
export const resetRateLimiter = (req, res) => {
  rateLimiterState = {
    activeAlgorithm: "TOKEN_BUCKET",
    tokenBucket: {
      capacity: BUCKET_CAPACITY,
      tokens: BUCKET_CAPACITY,
      refillRatePerSec: REFILL_RATE_PER_SEC,
      lastRefillTimeMs: Date.now()
    },
    slidingWindow: {
      windowSec: SLIDING_WINDOW_SEC,
      limit: SLIDING_WINDOW_LIMIT,
      previousCount: 42,
      currentCount: 15,
      windowStartMs: Date.now() - 25000
    },
    leakyBucket: {
      capacity: LEAKY_BUCKET_CAPACITY,
      queuedRequests: 2,
      leakRatePerSec: LEAK_RATE_PER_SEC,
      lastLeakTimeMs: Date.now()
    },
    metrics: {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      lastBurstSize: 0,
      rejectionRatePercent: 0
    },
    trafficLog: [
      {
        id: "req_reset_1",
        timestamp: new Date().toISOString(),
        clientIp: "127.0.0.1",
        tier: "RESET_BASELINE",
        algorithm: "TOKEN_BUCKET",
        status: 200,
        tokensRemaining: BUCKET_CAPACITY
      }
    ]
  };

  res.json({
    success: true,
    message: "Rate Limiter state reset to baseline parameters",
    data: rateLimiterState
  });
};
