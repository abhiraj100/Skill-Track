import { useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Flame,
  Gauge,
  HeartPulse,
  Network,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Terminal,
  WifiOff,
  Zap,
  ZapOff
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ChaosStudio() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  // Sliders state
  const [latency, setLatency] = useState(0);
  const [packetLoss, setPacketLoss] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [dbExhausted, setDbExhausted] = useState(false);
  const [memoryPressure, setMemoryPressure] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [runningScenario, setRunningScenario] = useState("");

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const { data } = await api.get("/chaos/status");
      setStatus(data);
    } catch {
      // Ignore background poll errors
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFaults = async () => {
    setIsApplying(true);
    try {
      const { data } = await api.post("/chaos/inject", {
        networkLatencyMs: latency,
        packetLossRate: packetLoss / 100,
        downstreamErrorRate: errorRate / 100,
        dbConnectionPoolExhausted: dbExhausted,
        memoryPressureActive: memoryPressure
      });
      setStatus((prev) => ({ ...prev, ...data }));
      toast.success("Fault vectors injected into service mesh!");
    } catch {
      toast.error("Failed to inject faults");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRunScenario = async (scenarioId) => {
    setRunningScenario(scenarioId);
    try {
      const { data } = await api.post("/chaos/run-scenario", { scenarioId });
      setStatus((prev) => ({ ...prev, ...data }));
      toast.success(`Executed scenario: ${data.scenarioName}`);
    } catch {
      toast.error("Scenario execution failed");
    } finally {
      setRunningScenario("");
    }
  };

  const handleReset = async () => {
    setLatency(0);
    setPacketLoss(0);
    setErrorRate(0);
    setDbExhausted(false);
    setMemoryPressure(false);
    try {
      const { data } = await api.post("/chaos/reset");
      setStatus((prev) => ({ ...prev, ...data }));
      toast.success("All chaos vectors neutralized. Service mesh nominal!");
    } catch {
      toast.error("Failed to reset chaos");
    }
  };

  const healthScore = status?.healthScore ?? 100;
  const cbStatus = status?.circuitBreaker?.status ?? "CLOSED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 p-6 text-white shadow-xl sm:p-8 border border-rose-500/30">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-300">
              <Flame size={18} className="animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise Architecture Module 29</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-white via-rose-100 to-rose-300 bg-clip-text text-transparent">
              Chaos Engineering & Resilience Simulator
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-100/80">
              Simulate Netflix Chaos Monkey & Toxiproxy fault injections. Test system resilience under network jitter, downstream cascading 503 outages, circuit breaker trips, adaptive concurrency queue shedding, and self-healing convergence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReset}
              className="rounded-xl border border-rose-300/30 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Neutralize All Faults
            </button>
            <button
              onClick={loadStatus}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Mesh
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Health Radar & Circuit Breaker Ribbon */}
      <div className="grid gap-4 sm:grid-cols-4">
        {/* Health Score Gauge */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">System Resilience Score</p>
            <p className={`mt-1 font-mono text-3xl font-black ${
              healthScore >= 80 ? "text-emerald-500" : healthScore >= 45 ? "text-amber-500" : "text-rose-500"
            }`}>
              {healthScore}%
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {status?.systemState || "OPTIMAL"}
            </p>
          </div>
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            healthScore >= 80 ? "bg-emerald-500/10 text-emerald-500" : healthScore >= 45 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500 animate-pulse"
          }`}>
            <HeartPulse size={28} />
          </div>
        </div>

        {/* Circuit Breaker Status */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Circuit Breaker Mesh</p>
            <p className="mt-1 font-mono text-xl font-black">
              {cbStatus === "CLOSED" ? (
                <span className="text-emerald-600 dark:text-emerald-400">CLOSED (Normal)</span>
              ) : cbStatus === "HALF_OPEN" ? (
                <span className="text-amber-600 dark:text-amber-400">HALF-OPEN (Probing)</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">OPEN (Shedding)</span>
              )}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Trips: {status?.circuitBreaker?.tripCount || 0} | Fallback Hits: {status?.circuitBreaker?.fallbackResponsesServed || 0}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {cbStatus === "OPEN" ? <ZapOff size={28} className="text-rose-500" /> : <ShieldCheck size={28} className="text-emerald-500" />}
          </div>
        </div>

        {/* Little's Law Concurrency Limiter */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Adaptive Backpressure</p>
            <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
              {status?.concurrencyLimiter?.queueSheddedRequests || 0}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Little&apos;s Law Shedded Requests
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Sliders size={28} />
          </div>
        </div>

        {/* Microservices Node Health */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Distributed Mesh Pods</p>
            <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
              {status?.services?.filter((s) => s.status === "HEALTHY").length || 6} / {status?.services?.length || 6}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Service Mesh Nodes Operational
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Network size={28} />
          </div>
        </div>
      </div>

      {/* Pre-packaged Chaos Scenarios */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertOctagon size={16} className="text-rose-600" /> Automated Enterprise Chaos Scenarios
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Execute automated chaos experiments replicating real-world high-severity production incidents.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => handleRunScenario("SCENARIO_AUTH_CASCADE")}
            disabled={runningScenario !== ""}
            className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-left hover:border-rose-400 hover:shadow-md transition dark:border-rose-900/40 dark:bg-rose-950/20"
          >
            <div>
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                SCENARIO A
              </span>
              <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                Cascading Downstream IAM Outage
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Injects 85% downstream errors into Auth service. Tests circuit breaker tripping to OPEN and fallback cache engagement.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
              Run Experiment <ArrowRight size={12} />
            </span>
          </button>

          <button
            onClick={() => handleRunScenario("SCENARIO_TRANS_PACIFIC_SPIKE")}
            disabled={runningScenario !== ""}
            className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-left hover:border-amber-400 hover:shadow-md transition dark:border-amber-900/40 dark:bg-amber-950/20"
          >
            <div>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                SCENARIO B
              </span>
              <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                Trans-Pacific Fiber Cut (Latency)
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Adds 1200ms round-trip latency and 25% packet jitter. Verifies Little&apos;s Law concurrency queue shedding.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Run Experiment <ArrowRight size={12} />
            </span>
          </button>

          <button
            onClick={() => handleRunScenario("SCENARIO_DB_STORM")}
            disabled={runningScenario !== ""}
            className="flex flex-col justify-between rounded-2xl border border-purple-200 bg-purple-50/50 p-4 text-left hover:border-purple-400 hover:shadow-md transition dark:border-purple-900/40 dark:bg-purple-950/20"
          >
            <div>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
                SCENARIO C
              </span>
              <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                Database Pool Exhaustion Storm
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                Starves database connection pool to 0 available sockets. Tests fast-failing non-blocking fallbacks.
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
              Run Experiment <ArrowRight size={12} />
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Dials vs Microservices Topology */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive Fault Injection Dials (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sliders size={15} className="text-rose-600" /> Fine-Grained Fault Injection Dials
            </h3>

            {/* Latency Dial */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Added RPC Latency</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">+{latency} ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={latency}
                onChange={(e) => setLatency(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-rose-600 dark:bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0ms (Nominal)</span>
                <span>1000ms</span>
                <span>2000ms (Severe)</span>
              </div>
            </div>

            {/* Packet Loss Dial */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Simulated Packet Loss</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{packetLoss}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={packetLoss}
                onChange={(e) => setPacketLoss(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-rose-600 dark:bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>25%</span>
                <span>50% (Catastrophic)</span>
              </div>
            </div>

            {/* Downstream Error Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Downstream 503 Outage Rate</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{errorRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={errorRate}
                onChange={(e) => setErrorRate(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-rose-600 dark:bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>50% (Circuit Trips)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Exhaust DB Connection Pool</span>
                <input
                  type="checkbox"
                  checked={dbExhausted}
                  onChange={(e) => setDbExhausted(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trigger Heap Memory Pressure</span>
                <input
                  type="checkbox"
                  checked={memoryPressure}
                  onChange={(e) => setMemoryPressure(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleApplyFaults}
                disabled={isApplying}
                className="w-full rounded-2xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
              >
                <Flame size={14} /> {isApplying ? "Injecting..." : "Inject Fault Vectors into Mesh"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Service Mesh Topology & Telemetry (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Server size={15} className="text-cyan-500" /> Distributed Service Mesh Topology ({status?.services?.length || 6})
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {status?.services?.map((svc) => (
                <div
                  key={svc.id}
                  className={`rounded-2xl border p-3.5 transition ${
                    svc.status === "HEALTHY"
                      ? "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                      : svc.status === "DEGRADED"
                      ? "border-amber-200/60 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                      : "border-rose-300 bg-rose-50/30 dark:border-rose-900 dark:bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {svc.name}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      svc.status === "HEALTHY"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : svc.status === "DEGRADED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}>
                      {svc.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Latency:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{svc.latencyMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Log */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-950 p-5 shadow-sm text-slate-300 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 mb-3">
              <Terminal size={14} /> Chaos Daemon Telemetry Audit Trail
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 font-mono text-[11px]">
              {status?.telemetryLog?.map((log, idx) => (
                <div key={idx} className="border-b border-slate-800/80 pb-1.5 last:border-0">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-rose-400 font-bold">{log.event}</span>
                  </div>
                  <p className="mt-0.5 text-slate-300">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
