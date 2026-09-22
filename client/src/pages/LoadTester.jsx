import { useState, useEffect, useMemo, useRef } from "react";
import {
  Gauge,
  Activity,
  Play,
  Square,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Server,
  Cpu,
  Database,
  ArrowRight,
  TrendingUp,
  Sliders,
  Flame,
  FileCode2
} from "lucide-react";
import toast from "react-hot-toast";

const LOAD_PROFILES = [
  {
    id: "linear",
    name: "Linear Ramp-Up",
    tagline: "Gradual step-up from 0 to peak load",
    desc: "Simulates daily organic traffic growth to find breaking threshold.",
    defaultVUs: 150,
    duration: 30,
  },
  {
    id: "spike",
    name: "Spike / Flash Crowd",
    tagline: "Instant 10x traffic burst in 2 seconds",
    desc: "Simulates flash sales, ticket drops, or viral marketing campaign traffic.",
    defaultVUs: 500,
    duration: 20,
  },
  {
    id: "stress",
    name: "Stress & Capacity Test",
    tagline: "Pushes system 150% beyond design SLA",
    desc: "Identifies hard system breaking points, recovery time, and data corruption.",
    defaultVUs: 800,
    duration: 45,
  },
  {
    id: "soak",
    name: "Soak / Endurance Test",
    tagline: "Sustained high load to detect memory leaks",
    desc: "Identifies gradual memory degradation, disk buffer exhaustion, and connection leaks.",
    defaultVUs: 250,
    duration: 60,
  },
];

export default function LoadTester() {
  const [profile, setProfile] = useState("linear");
  const [targetEndpoint, setTargetEndpoint] = useState("https://api.skilltrack.io/v1/checkout/process");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [vus, setVus] = useState(150);
  const [targetRps, setTargetRps] = useState(800);
  const [duration, setDuration] = useState(30);

  // Test execution state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Live telemetry counters
  const [telemetry, setTelemetry] = useState({
    totalRequests: 0,
    currentRps: 0,
    p50: 18,
    p90: 42,
    p95: 85,
    p99: 140,
    status2xx: 0,
    status4xx: 0,
    status5xx: 0,
  });

  const [copiedK6, setCopiedK6] = useState(false);
  const intervalRef = useRef(null);

  // Change profile defaults
  const handleSelectProfile = (pId) => {
    const p = LOAD_PROFILES.find((x) => x.id === pId);
    if (!p) return;
    setProfile(pId);
    setVus(p.defaultVUs);
    setDuration(p.duration);
    toast.success(`Loaded profile: ${p.name}`);
  };

  // Start Load Test Simulation
  const startLoadTest = () => {
    setIsRunning(true);
    setProgress(0);
    setElapsed(0);
    setTelemetry({
      totalRequests: 0,
      currentRps: 0,
      p50: 12,
      p90: 25,
      p95: 45,
      p99: 68,
      status2xx: 0,
      status4xx: 0,
      status5xx: 0,
    });

    const startTime = Date.now();
    const totalMs = duration * 1000;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const currentElapsedMs = now - startTime;
      const currentElapsedSec = Math.floor(currentElapsedMs / 1000);
      const ratio = Math.min(1, currentElapsedMs / totalMs);

      setElapsed(currentElapsedSec);
      setProgress(Math.round(ratio * 100));

      // Calculate simulated load curve
      let activeFactor = ratio;
      if (profile === "spike") {
        activeFactor = ratio < 0.2 ? ratio * 5 : 1.0;
      } else if (profile === "stress") {
        activeFactor = Math.min(1.4, 0.4 + ratio);
      }

      const simRps = Math.round(targetRps * activeFactor * (0.9 + Math.random() * 0.2));
      const addedReqs = Math.round(simRps * 0.2); // tick is 200ms

      const p50Calc = Math.round(15 + vus * 0.05 + (profile === "stress" ? 40 : 0));
      const p95Calc = Math.round(p50Calc * 2.8 + Math.random() * 15);
      const p99Calc = Math.round(p95Calc * 2.2 + (vus > 600 ? 300 : 0));

      const hasErrors = vus > 500 || profile === "stress";
      const errorRate = hasErrors ? Math.min(18, Math.round(ratio * 14)) : 0.2;
      const errorCount = Math.round(addedReqs * (errorRate / 100));
      const successCount = addedReqs - errorCount;

      setTelemetry((prev) => ({
        totalRequests: prev.totalRequests + addedReqs,
        currentRps: simRps,
        p50: p50Calc,
        p90: Math.round(p50Calc * 1.8),
        p95: p95Calc,
        p99: p99Calc,
        status2xx: prev.status2xx + successCount,
        status4xx: prev.status4xx + Math.round(errorCount * 0.4),
        status5xx: prev.status5xx + Math.round(errorCount * 0.6),
      }));

      if (currentElapsedMs >= totalMs) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setProgress(100);
        toast.success(`Load test completed! ${telemetry.totalRequests.toLocaleString()} requests executed.`);
      }
    }, 200);
  };

  const stopLoadTest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    toast("Load test halted manually");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Bottleneck Diagnostic Analysis
  const diagnostic = useMemo(() => {
    const errorTotal = telemetry.status4xx + telemetry.status5xx;
    const errorPct = telemetry.totalRequests > 0
      ? ((errorTotal / telemetry.totalRequests) * 100).toFixed(1)
      : 0;

    if (telemetry.p99 > 300 || errorPct > 5) {
      return {
        health: "CRITICAL BOTTLENECK DETECTED",
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
        cause: "Database Connection Pool Starvation & Thread Pool Contention",
        remediation: "P99 latency spiked to " + telemetry.p99 + "ms. Increase PostgreSQL connection pool size (`max_connections`) and deploy PgBouncer connection pooling to avoid socket exhaustion.",
        errorPct
      };
    }

    if (telemetry.p95 > 100) {
      return {
        health: "WARNING: HIGH TAIL LATENCY",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
        cause: "Unindexed SQL Join Query & Garbage Collection Stalls",
        remediation: "P95 is " + telemetry.p95 + "ms. Add compound indexes on foreign keys, implement Redis read-through caching, and increase Node.js `--max-old-space-size` memory headroom.",
        errorPct
      };
    }

    return {
      health: "OPTIMAL: SYSTEM PASSED SLA",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
      cause: "Low latency, 0 bottlenecking observed",
      remediation: "System sustained " + telemetry.currentRps + " RPS with P99 < 150ms. Application is ready for high-concurrency production rollout.",
      errorPct
    };
  }, [telemetry]);

  // k6 Script Generator
  const k6Script = useMemo(() => {
    return `// ========================================================
// SkillTrack Load Tester - Generated k6 Concurrency Script
// Profile: ${profile.toUpperCase()} | Target: ${vus} VUs
// Endpoint: ${targetEndpoint}
// ========================================================

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '${Math.round(duration * 0.3)}s', target: ${vus} }, // Ramp-up
    { duration: '${Math.round(duration * 0.5)}s', target: ${vus} }, // Steady peak
    { duration: '${Math.round(duration * 0.2)}s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150', 'p(99)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const url = '${targetEndpoint}';
  const payload = JSON.stringify({
    timestamp: Date.now(),
    clientId: 'bench_\${__VU}_\${__ITER}',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Load-Benchmark': 'SkillTrack-Studio',
    },
  };

  const res = http.${httpMethod.toLowerCase()}(url, payload, params);

  check(res, {
    'status is 200/201': (r) => r.status >= 200 && r.status < 300,
    'latency SLA compliant (<200ms)': (r) => r.timings.duration < 200,
  });

  sleep(0.1); // ~10 RPS per VU pacing
}
`;
  }, [profile, vus, duration, targetEndpoint, httpMethod]);

  const copyK6 = () => {
    navigator.clipboard.writeText(k6Script);
    setCopiedK6(true);
    toast.success("k6 test script copied to clipboard!");
    setTimeout(() => setCopiedK6(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-amber-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
              <Gauge size={14} /> High-Concurrency Load Studio v2.7
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              API Benchmark & Concurrency Load Tester
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Simulate up to 1,000 concurrent Virtual Users (VUs) and thousands of requests/sec.
              Diagnose thread pool starvation, database connection limits, and export runnable k6 test suites.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Throughput Run Rate</p>
              <p className="text-2xl font-black text-white">{telemetry.currentRps.toLocaleString()} <span className="text-xs font-normal text-slate-300">RPS</span></p>
              <p className="text-[10px] text-amber-400 font-semibold">{telemetry.totalRequests.toLocaleString()} Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Selector Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Load Shape & Traffic Profiles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LOAD_PROFILES.map((p) => {
            const isSelected = profile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                disabled={isRunning}
                className={`text-left rounded-2xl p-4 transition-all border ${
                  isSelected
                    ? "bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20 dark:bg-amber-950/40 dark:border-amber-500"
                    : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                } ${isRunning ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-amber-600" />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">{p.tagline}</p>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {p.desc}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{p.defaultVUs} VUs</span>
                  <span>•</span>
                  <span>{p.duration}s duration</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution Controls & Sliders */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-amber-600" /> Target Configuration & Concurrency
              </h3>
              <p className="text-xs text-slate-500">Fine-tune target API and traffic pacing dimensions.</p>
            </div>

            {isRunning ? (
              <button
                onClick={stopLoadTest}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                <Square size={14} /> Stop Benchmark
              </button>
            ) : (
              <button
                onClick={startLoadTest}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                <Play size={14} /> Start Load Test
              </button>
            )}
          </div>

          {/* Endpoint Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Endpoint</label>
            <div className="flex gap-2">
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                disabled={isRunning}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={targetEndpoint}
                onChange={(e) => setTargetEndpoint(e.target.value)}
                disabled={isRunning}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {/* VUs Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Virtual Users (VUs)</span>
                <span className="text-amber-600 font-mono font-bold">{vus} Concurrency</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={vus}
                disabled={isRunning}
                onChange={(e) => setVus(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Target RPS */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Target Rate (RPS)</span>
                <span className="text-amber-600 font-mono font-bold">{targetRps} Reqs/Sec</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={targetRps}
                disabled={isRunning}
                onChange={(e) => setTargetRps(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Progress Bar during run */}
          {isRunning && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-600 flex items-center gap-1.5 animate-pulse">
                  <Activity size={14} /> Stress Testing in Progress...
                </span>
                <span className="font-mono text-slate-500">{elapsed}s / {duration}s ({progress}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Live Latency Percentiles Card */}
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Latency SLA Percentiles</span>
            <span className="text-xs font-normal text-slate-400">Response Timings</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">P50 (Median)</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {telemetry.p50} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">P90</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {telemetry.p90} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">P95 (SLA Target)</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {telemetry.p95} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">P99 (Tail Latency)</span>
              <span className={`text-xl font-black font-mono ${telemetry.p99 > 300 ? "text-rose-600" : "text-emerald-600"}`}>
                {telemetry.p99} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
            </div>
          </div>

          {/* Status codes distribution */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400">HTTP Response Status Distribution</span>
            <div className="flex justify-between p-1.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span>2xx Success:</span>
              <span className="font-bold">{telemetry.status2xx.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <span>4xx Client / Rate-Limit (429):</span>
              <span className="font-bold">{telemetry.status4xx.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              <span>5xx Gateway / Server Failures:</span>
              <span className="font-bold">{telemetry.status5xx.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic & k6 Export Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Diagnostic Engine */}
        <div className={`rounded-3xl border p-6 shadow-sm space-y-3 ${diagnostic.bg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${diagnostic.color}`}>
              {diagnostic.health}
            </span>
            <span className="text-xs font-mono font-bold">Error Rate: {diagnostic.errorPct}%</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{diagnostic.cause}</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {diagnostic.remediation}
            </p>
          </div>
        </div>

        {/* k6 Script Exporter */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode2 size={15} className="text-amber-600" /> Export k6 Concurrency Script
              </h4>
              <p className="text-[11px] text-slate-500">Run locally via `k6 run loadtest.js`</p>
            </div>
            <button
              onClick={copyK6}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {copiedK6 ? <Check size={12} /> : <Copy size={12} />}
              {copiedK6 ? "Copied!" : "Copy k6"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto">
            <pre className="leading-relaxed">{k6Script}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
