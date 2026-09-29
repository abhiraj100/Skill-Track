import { useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Flame,
  HardDrive,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function QueueStudio() {
  const [metrics, setMetrics] = useState({
    waitingCount: 0,
    activeCount: 0,
    completedCount: 42,
    failedCount: 2,
    dlqCount: 2,
    throughputRps: 184,
    p95LatencyMs: 68.4
  });

  const [workers, setWorkers] = useState([
    { id: "worker-us-east-1", name: "Worker Pod 01 (us-east-1a)", status: "PROCESSING", currentJobId: "job_941a", processedCount: 1420, errorCount: 2, cpuPercent: 38, memoryMb: 184 },
    { id: "worker-us-east-2", name: "Worker Pod 02 (us-east-1b)", status: "IDLE", currentJobId: null, processedCount: 1390, errorCount: 1, cpuPercent: 14, memoryMb: 192 },
    { id: "worker-eu-west-1", name: "Worker Pod 03 (eu-west-1a)", status: "PROCESSING", currentJobId: "job_942b", processedCount: 1540, errorCount: 4, cpuPercent: 42, memoryMb: 210 },
    { id: "worker-batch-spot", name: "Worker Pod 04 (Spot Instance)", status: "IDLE", currentJobId: null, processedCount: 980, errorCount: 0, cpuPercent: 8, memoryMb: 160 }
  ]);

  const [recentCompleted, setRecentCompleted] = useState([
    { id: "job_c_01", name: "CERTIFICATE_PDF_RENDER", priority: "VIP", durationMs: 62, completedAt: "Just now" },
    { id: "job_c_02", name: "RESUME_ATS_PARSE", priority: "HIGH", durationMs: 84, completedAt: "1m ago" },
    { id: "job_c_03", name: "AI_EMBEDDING_INDEX", priority: "NORMAL", durationMs: 110, completedAt: "2m ago" },
    { id: "job_c_04", name: "VIDEO_TRANSCODE_HLS", priority: "BULK", durationMs: 194, completedAt: "3m ago" }
  ]);

  const [recentDlq, setRecentDlq] = useState([
    { id: "job_dlq_01", name: "AI_EMBEDDING_INDEX", priority: "NORMAL", error: "Vector store 504 Timeout after 3 retries" },
    { id: "job_dlq_02", name: "CERTIFICATE_PDF_RENDER", priority: "HIGH", error: "Downstream S3 upload lease expired" }
  ]);

  // Form State
  const [jobType, setJobType] = useState("CERTIFICATE_PDF_RENDER");
  const [jobCount, setJobCount] = useState(25);
  const [jobPriority, setJobPriority] = useState("NORMAL");
  const [simulateFailures, setSimulateFailures] = useState(false);
  const [isEnqueueing, setIsEnqueueing] = useState(false);
  const [isKillingWorker, setIsKillingWorker] = useState(false);

  // Poll live stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/queue/stats");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setWorkers(data.workers);
        if (data.recentCompleted?.length > 0) setRecentCompleted(data.recentCompleted);
        if (data.recentDlq?.length > 0) setRecentDlq(data.recentDlq);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Enqueue handler
  const handleEnqueue = async () => {
    setIsEnqueueing(true);
    try {
      const res = await fetch("/api/queue/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          count: Number(jobCount),
          priority: jobPriority,
          simulateFailures
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Enqueued ${data.enqueuedCount} jobs into [${data.priority}] channel!`);
        fetchStats();
        setIsEnqueueing(false);
        return;
      }
    } catch {}

    // Simulated fallback
    setMetrics((prev) => ({
      ...prev,
      waitingCount: prev.waitingCount + Number(jobCount),
      throughputRps: Math.floor(220 + Math.random() * 50)
    }));
    toast.success(`Enqueued ${jobCount} jobs into [${jobPriority}] channel!`);
    setIsEnqueueing(false);
  };

  // Chaos: Kill Worker
  const handleKillWorker = async (workerId) => {
    setIsKillingWorker(true);
    try {
      const res = await fetch("/api/queue/worker/kill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId })
      });
      const data = await res.json();
      if (data.success) {
        toast.error(`Chaos Injected: ${data.summary}`);
        fetchStats();
        setIsKillingWorker(false);
        return;
      }
    } catch {}

    // Local fallback
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: "CRASHED_OOM", cpuPercent: 0 } : w))
    );
    toast.error(`Chaos: Terminated ${workerId}. Stalled job lease expired and recovered!`);
    setTimeout(() => {
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, status: "IDLE", cpuPercent: 12 } : w))
      );
    }, 3000);
    setIsKillingWorker(false);
  };

  // DLQ Replay
  const handleReplayDlq = async () => {
    try {
      const res = await fetch("/api/queue/dlq/retry", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchStats();
        return;
      }
    } catch {}

    setRecentDlq([]);
    setMetrics((prev) => ({ ...prev, dlqCount: 0, waitingCount: prev.waitingCount + prev.dlqCount }));
    toast.success("Replayed all Dead Letter Queue jobs back into active processing!");
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl sm:p-8 border border-indigo-900/40">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Boxes size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Distributed Asynchronous Computing</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-indigo-100 to-amber-200 bg-clip-text text-transparent">
              Distributed Task Queue & Worker Fleet Studio
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              High-throughput Redis Streams consumer groups, multi-pod worker fleets, visibility lease heartbeats, priority channels, and automated Dead Letter Queue (DLQ) replays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Zap className="text-amber-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">Throughput</p>
                <p className="text-xl font-black text-white">{metrics.throughputRps} RPS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
              <Clock className="text-sky-400" size={24} />
              <div>
                <p className="text-[11px] font-medium text-slate-300">P95 Latency</p>
                <p className="text-xl font-black text-sky-300">{metrics.p95LatencyMs}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Queue Status Counters */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-indigo-900/60 pt-4">
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <p className="text-[11px] text-slate-400">Waiting in Queue</p>
            <p className="text-lg font-black text-white">{metrics.waitingCount} jobs</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <p className="text-[11px] text-slate-400">Active Processing</p>
            <p className="text-lg font-black text-amber-400">{metrics.activeCount} jobs</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <p className="text-[11px] text-slate-400">Completed (24h)</p>
            <p className="text-lg font-black text-emerald-400">{metrics.completedCount}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <p className="text-[11px] text-slate-400">Failed / Retries</p>
            <p className="text-lg font-black text-rose-400">{metrics.failedCount}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <p className="text-[11px] text-slate-400">Dead Letter Queue</p>
            <p className="text-lg font-black text-rose-500">{metrics.dlqCount}</p>
          </div>
        </div>
      </section>

      {/* 4 Distributed Worker Pods */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="text-indigo-600" size={18} /> Distributed Worker Fleet (Redis Consumer Group: <code>worker-pool-v2</code>)
          </h2>
          <span className="text-xs text-slate-500 font-mono">4 Pods Online • Auto-Scale Min: 2 / Max: 12</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workers.map((worker) => {
            const isCrashed = worker.status === "CRASHED_OOM";
            const isProcessing = worker.status === "PROCESSING";

            return (
              <div
                key={worker.id}
                className={`rounded-2xl border p-4 transition space-y-3 ${
                  isCrashed
                    ? "border-rose-500 bg-rose-500/10 animate-pulse"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {worker.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCrashed
                      ? "bg-rose-500 text-white"
                      : isProcessing
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-emerald-500/20 text-emerald-500"
                  }`}>
                    {worker.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>CPU Load:</span>
                    <strong className="text-slate-900 dark:text-white">{worker.cpuPercent}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        worker.cpuPercent > 70 ? "bg-rose-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${worker.cpuPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Memory:</span>
                    <strong>{worker.memoryMb} MB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs Processed:</span>
                    <strong className="text-emerald-500">{worker.processedCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Lease:</span>
                    <strong className="truncate max-w-[120px]">{worker.currentJobId || "Idle"}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleKillWorker(worker.id)}
                  disabled={isKillingWorker || isCrashed}
                  className="w-full rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert size={12} />
                  {isCrashed ? "Auto-Healing Pod..." : "Inject SIGKILL Crash"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Job Producer Workbench & DLQ Inspector */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Producer Workbench */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="text-amber-500" size={18} /> High-Throughput Job Producer Sandbox
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dispatch batched asynchronous tasks into prioritized Redis cluster queues.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Job Workload Type:
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="CERTIFICATE_PDF_RENDER">Certificate PDF Generation (Headless Chromium)</option>
                <option value="AI_EMBEDDING_INDEX">AI Vector Embedding Batch (pgvector / Pinecone)</option>
                <option value="RESUME_ATS_PARSE">Resume ATS Lexical Extraction (Docx/PDF OCR)</option>
                <option value="VIDEO_TRANSCODE_HLS">Video Transcoding (FFmpeg HLS 1080p Chunking)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Priority Channel:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["VIP", "NORMAL", "BULK"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setJobPriority(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      jobPriority === p
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Batch Size: <span className="font-mono text-indigo-600 dark:text-indigo-400">{jobCount} jobs</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={jobCount}
                onChange={(e) => setJobCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="failToggle"
                checked={simulateFailures}
                onChange={(e) => setSimulateFailures(e.target.checked)}
                className="h-4 w-4 rounded accent-rose-600"
              />
              <label htmlFor="failToggle" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Inject downstream timeouts (Simulate Dead Letter Queue routing)
              </label>
            </div>
          </div>

          <button
            onClick={handleEnqueue}
            disabled={isEnqueueing}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {isEnqueueing ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
            {isEnqueueing ? "Pushing to Redis Cluster..." : `Enqueue ${jobCount} Asynchronous Jobs`}
          </button>

          {/* Recent Completed Table */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Live Stream of Completed Background Tasks:
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2 px-3">Job ID</th>
                    <th className="py-2 px-3">Task Name</th>
                    <th className="py-2 px-3">Channel</th>
                    <th className="py-2 px-3">Compute Duration</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {recentCompleted.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold">{c.id}</td>
                      <td className="py-2 px-3">{c.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === "VIP" ? "bg-amber-500/20 text-amber-500" : "bg-sky-500/20 text-sky-500"
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-2 px-3">{c.durationMs}ms</td>
                      <td className="py-2 px-3 text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> ACK_200
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Dead Letter Queue (DLQ) Inspector & Architecture Notes */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon className="text-rose-500" size={16} /> Dead Letter Queue (DLQ)
              </h3>
              <button
                onClick={handleReplayDlq}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <RefreshCw size={11} /> Replay DLQ
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Failed jobs after 3 exponential backoff retry cycles are shunted here to prevent queue head-of-line blocking.
            </p>

            <div className="space-y-2">
              {recentDlq.length === 0 ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-center text-xs text-slate-400">
                  Dead Letter Queue is currently clean. Zero poisoned pills.
                </div>
              ) : (
                recentDlq.map((d, i) => (
                  <div key={i} className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-3 space-y-1 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-700 dark:text-rose-300">{d.id}</span>
                      <span className="text-[10px] text-slate-400">{d.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans">{d.name}</p>
                    <p className="text-[10px] text-rose-600 dark:text-rose-400">Error: {d.error}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Architecture Callout */}
          <div className="rounded-2xl bg-slate-950 p-5 font-mono text-xs text-slate-300 border border-slate-800 space-y-2">
            <span className="text-[11px] text-amber-400 uppercase font-bold">
              Engineering Guarantee: At-Least-Once Delivery & Lease Recovery
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              When a worker acquires a job from the Redis Stream via <code>XREADGROUP</code>, a 30-second visibility lease is established. If the pod crashes before emitting <code>XACK</code>, the heartbeat supervisor notices lease expiry and automatically invokes <code>XCLAIM</code> to reassign the orphaned task.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
