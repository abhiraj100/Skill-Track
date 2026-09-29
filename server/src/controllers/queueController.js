import crypto from "crypto";

// High-Concurrency In-Memory Queue Store (simulating Redis BullMQ cluster)
const jobQueue = {
  waiting: [],
  active: new Map(),
  completed: [],
  failed: [],
  dlq: []
};

// 4 Distributed Worker Pods
let workers = [
  { id: "worker-us-east-1", name: "Worker Pod 01 (us-east-1a)", status: "IDLE", currentJobId: null, processedCount: 1420, errorCount: 2, cpuPercent: 12, memoryMb: 184 },
  { id: "worker-us-east-2", name: "Worker Pod 02 (us-east-1b)", status: "IDLE", currentJobId: null, processedCount: 1390, errorCount: 1, cpuPercent: 14, memoryMb: 192 },
  { id: "worker-eu-west-1", name: "Worker Pod 03 (eu-west-1a)", status: "IDLE", currentJobId: null, processedCount: 1540, errorCount: 4, cpuPercent: 18, memoryMb: 210 },
  { id: "worker-batch-spot", name: "Worker Pod 04 (Spot Instance)", status: "IDLE", currentJobId: null, processedCount: 980, errorCount: 0, cpuPercent: 8, memoryMb: 160 }
];

// Pre-populate with initial historical stats
for (let i = 0; i < 15; i++) {
  jobQueue.completed.push({
    id: `job_init_${i}`,
    name: "CERTIFICATE_PDF_RENDER",
    priority: i % 2 === 0 ? "HIGH" : "NORMAL",
    workerId: workers[i % 4].id,
    durationMs: Math.floor(45 + Math.random() * 80),
    completedAt: new Date(Date.now() - (15 - i) * 60000).toISOString()
  });
}

// Background simulation ticker: Processes waiting jobs using idle workers
setInterval(() => {
  if (jobQueue.waiting.length === 0) return;

  // Find idle worker
  const idleWorker = workers.find((w) => w.status === "IDLE");
  if (!idleWorker) return;

  // Sort by priority (HIGH=1, NORMAL=2, BULK=3)
  jobQueue.waiting.sort((a, b) => a.priorityRank - b.priorityRank);
  const nextJob = jobQueue.waiting.shift();
  if (!nextJob) return;

  // Assign to worker
  nextJob.status = "ACTIVE";
  nextJob.startedAt = Date.now();
  nextJob.workerId = idleWorker.id;
  jobQueue.active.set(nextJob.id, nextJob);

  idleWorker.status = "PROCESSING";
  idleWorker.currentJobId = nextJob.id;
  idleWorker.cpuPercent = Math.min(95, idleWorker.cpuPercent + 25);

  // Simulate job completion after execution duration
  setTimeout(() => {
    jobQueue.active.delete(nextJob.id);
    const durationMs = Date.now() - nextJob.startedAt;

    if (nextJob.shouldFail) {
      nextJob.status = "FAILED";
      nextJob.error = "Downstream timeout / Memory limit exceeded";
      jobQueue.failed.push(nextJob);
      jobQueue.dlq.push(nextJob);
      idleWorker.errorCount += 1;
    } else {
      nextJob.status = "COMPLETED";
      nextJob.durationMs = durationMs;
      nextJob.completedAt = new Date().toISOString();
      jobQueue.completed.push(nextJob);
      if (jobQueue.completed.length > 100) jobQueue.completed.shift();
      idleWorker.processedCount += 1;
    }

    idleWorker.status = "IDLE";
    idleWorker.currentJobId = null;
    idleWorker.cpuPercent = Math.max(8, idleWorker.cpuPercent - 25);
  }, nextJob.simulatedExecutionMs || 120);
}, 200);

/**
 * 1. GET /api/queue/stats
 */
export const getQueueStats = async (_req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      waitingCount: jobQueue.waiting.length,
      activeCount: jobQueue.active.size,
      completedCount: jobQueue.completed.length,
      failedCount: jobQueue.failed.length,
      dlqCount: jobQueue.dlq.length,
      throughputRps: Math.floor(180 + Math.random() * 40),
      p95LatencyMs: 64.2
    },
    workers,
    recentCompleted: jobQueue.completed.slice(-8).reverse(),
    recentDlq: jobQueue.dlq.slice(-6).reverse()
  });
};

/**
 * 2. POST /api/queue/enqueue
 */
export const enqueueJobs = async (req, res) => {
  const { jobType = "CERTIFICATE_PDF_RENDER", count = 10, priority = "NORMAL", simulateFailures = false } = req.body;

  const priorityMap = { VIP: 1, HIGH: 1, NORMAL: 2, BULK: 3 };
  const priorityRank = priorityMap[priority] || 2;

  const enqueuedJobs = [];
  for (let i = 0; i < count; i++) {
    const job = {
      id: `job_${crypto.randomBytes(4).toString("hex")}`,
      name: jobType,
      priority,
      priorityRank,
      enqueuedAt: new Date().toISOString(),
      shouldFail: simulateFailures && i % 3 === 0,
      simulatedExecutionMs: Math.floor(80 + Math.random() * 120),
      payload: {
        certificateId: `ST-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        resolution: "300_DPI",
        encryption: "AES_256_GCM"
      }
    };
    jobQueue.waiting.push(job);
    enqueuedJobs.push(job);
  }

  res.status(201).json({
    success: true,
    enqueuedCount: enqueuedJobs.length,
    priority,
    totalWaitingInQueue: jobQueue.waiting.length,
    message: `Enqueued ${enqueuedJobs.length} jobs into ${priority} priority channel.`
  });
};

/**
 * 3. POST /api/queue/worker/kill
 */
export const killWorker = async (req, res) => {
  const { workerId = "worker-us-east-2" } = req.body;
  const worker = workers.find((w) => w.id === workerId);

  if (!worker) {
    return res.status(404).json({ success: false, message: "Worker not found" });
  }

  // Inject failure
  worker.status = "CRASHED_OOM";
  worker.cpuPercent = 0;

  // Stalled job lease recovery
  let recoveredJob = null;
  if (worker.currentJobId) {
    const stalledJob = jobQueue.active.get(worker.currentJobId);
    if (stalledJob) {
      jobQueue.active.delete(worker.currentJobId);
      stalledJob.status = "LEASE_RECOVERED";
      stalledJob.priorityRank = 1; // High priority re-enqueue
      jobQueue.waiting.unshift(stalledJob);
      recoveredJob = stalledJob.id;
    }
    worker.currentJobId = null;
  }

  // Auto-heal worker after 3 seconds
  setTimeout(() => {
    worker.status = "IDLE";
    worker.cpuPercent = 12;
  }, 3000);

  res.json({
    success: true,
    workerId,
    crashedState: "CRASHED_OOM",
    recoveredJob,
    summary: `Worker ${workerId} killed. Redlock lease heartbeat expired. Stalled job ${recoveredJob || "N/A"} rescued and re-queued.`
  });
};

/**
 * 4. POST /api/queue/dlq/retry
 */
export const retryDlqJobs = async (_req, res) => {
  const dlqCount = jobQueue.dlq.length;
  if (dlqCount === 0) {
    return res.json({ success: true, retriedCount: 0, message: "Dead Letter Queue is empty." });
  }

  while (jobQueue.dlq.length > 0) {
    const job = jobQueue.dlq.pop();
    job.shouldFail = false; // Resolved in replay
    job.status = "REPLAYED";
    job.priorityRank = 1;
    jobQueue.waiting.unshift(job);
  }

  res.json({
    success: true,
    retriedCount: dlqCount,
    message: `Replayed ${dlqCount} Dead Letter Queue jobs back into active processing with exponential backoff reset.`
  });
};
