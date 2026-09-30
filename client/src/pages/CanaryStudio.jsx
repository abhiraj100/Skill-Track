import { useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  Layers,
  Network,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Zap,
  ZapOff
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function CanaryStudio() {
  const [loading, setLoading] = useState(true);
  const [canaryData, setCanaryData] = useState(null);
  const [trafficCount, setTrafficCount] = useState(100);
  const [injectAnomaly, setInjectAnomaly] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const { data } = await api.get("/canary/status");
      setCanaryData(data);
    } catch {
      // Ignore background poll errors
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeight = async (weight, stage) => {
    try {
      const { data } = await api.post("/canary/rollout/update", {
        trafficWeightCanary: weight,
        stage
      });
      toast.success(data.message);
      await loadStatus();
    } catch {
      toast.error("Failed to update rollout weight");
    }
  };

  const handleToggleFlag = async (flagKey, currentEnabled, currentPercent) => {
    try {
      const { data } = await api.post("/canary/flags/toggle", {
        flagKey,
        enabled: !currentEnabled,
        rolloutPercent: !currentEnabled ? (currentPercent === 0 ? 50 : currentPercent) : 0
      });
      toast.success(data.message);
      await loadStatus();
    } catch {
      toast.error("Failed to update feature flag");
    }
  };

  const handleSimulateBurst = async () => {
    setSimulating(true);
    try {
      const { data } = await api.post("/canary/simulate-traffic", {
        requestCount: trafficCount,
        injectCanaryAnomaly: injectAnomaly
      });

      if (data.burstSummary?.autoRollbackTriggered) {
        toast.error("WATCHDOG TRIGGERED: High error rate detected in canary! Auto-rolled back 100% to baseline.");
      } else {
        toast.success(`Dispatched ${trafficCount} requests across baseline and canary.`);
      }
      setCanaryData((prev) => ({ ...prev, ...data }));
    } catch {
      toast.error("Traffic simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const handleEmergencyAbort = async () => {
    try {
      const { data } = await api.post("/canary/abort");
      toast.error("EMERGENCY ABORT: All traffic shifted to Stable Baseline!");
      await loadStatus();
    } catch {
      toast.error("Abort command failed");
    }
  };

  const deployment = canaryData?.deployment || {};
  const watchdog = canaryData?.watchdog || {};
  const telemetry = canaryData?.telemetry || {};
  const flags = canaryData?.featureFlags || [];
  const canaryWeight = deployment.trafficWeightCanary || 0;
  const isAborted = deployment.stage === "ABORTED_ROLLED_BACK";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 text-white shadow-xl sm:p-8 border border-emerald-500/30">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <GitBranch size={18} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise Architecture Module 31</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
              Canary Deployments & Dynamic Feature Flags
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100/80">
              Argo Rollouts & LaunchDarkly-style progressive release engine. Orchestrate automated multi-phase canary traffic splitting (10% → 25% → 50% → 100%), monitor watchdog error gates with instant auto-rollback, and manage multivariate feature flags.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEmergencyAbort}
              className="rounded-xl border border-rose-400/40 bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition flex items-center gap-1.5"
            >
              <AlertOctagon size={14} /> Emergency 1-Click Abort
            </button>
            <button
              onClick={() => handleUpdateWeight(100, "FULL_PROMOTION")}
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} /> Promote 100% to Production
            </button>
            <button
              onClick={loadStatus}
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Progressive Rollout Stepper Ribbon */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Deployment Stage</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>{deployment.stage || "CANARY_PILOT_10"}</span>
              {isAborted && (
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  AUTO-ROLLED BACK BY WATCHDOG
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">BASELINE (STABLE)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{100 - canaryWeight}% Traffic</span>
            </div>
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">CANARY (v2.0.0-rc.3)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{canaryWeight}% Traffic</span>
            </div>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: "0% Off (Baseline Only)", weight: 0, stage: "OFF" },
            { label: "10% Pilot Stage", weight: 10, stage: "CANARY_PILOT_10" },
            { label: "25% Early Adopters", weight: 25, stage: "CANARY_25" },
            { label: "50% Half-Split", weight: 50, stage: "CANARY_50" },
            { label: "100% Full Promotion", weight: 100, stage: "FULL_PROMOTION" }
          ].map((s) => {
            const isActive = canaryWeight === s.weight && !isAborted;
            return (
              <button
                key={s.weight}
                onClick={() => handleUpdateWeight(s.weight, s.stage)}
                className={`rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/30"
                    : "border-slate-200/80 bg-slate-50/50 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {s.weight}%
                </span>
                <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {s.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Traffic Weight Visual Progress Bar */}
        <div className="pt-2">
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex dark:bg-slate-800">
            <div
              style={{ width: `${100 - canaryWeight}%` }}
              className="h-full bg-slate-400 transition-all duration-300"
              title={`Baseline: ${100 - canaryWeight}%`}
            />
            <div
              style={{ width: `${canaryWeight}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              title={`Canary: ${canaryWeight}%`}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Traffic Burst Simulator vs Watchdog & Feature Flags */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Traffic Simulator & Watchdog (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Traffic Simulator Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Play size={14} className="text-emerald-600" /> Live Traffic Split Burst Simulator
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Concurrent Requests</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{trafficCount} Reqs</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={trafficCount}
                onChange={(e) => setTrafficCount(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-800"
              />
            </div>

            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Simulate Canary Error Spike (&gt;3.5% Threshold)
              </span>
              <input
                type="checkbox"
                checked={injectAnomaly}
                onChange={(e) => setInjectAnomaly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <button
              onClick={handleSimulateBurst}
              disabled={simulating}
              className="w-full rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              <Zap size={14} className={simulating ? "animate-spin" : ""} />
              {simulating ? "Dispatching Traffic Burst..." : "Dispatch Simulated Traffic"}
            </button>

            {/* Telemetry Summary */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Total Dispatched:</span>
                <span className="font-bold text-slate-900 dark:text-white">{telemetry.totalRequests || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Routed:</span>
                <span>{telemetry.baselineRouted || 0} ({telemetry.baselineP99Ms || 0}ms P99)</span>
              </div>
              <div className="flex justify-between">
                <span>Canary Routed:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {telemetry.canaryRouted || 0} ({telemetry.canaryP99Ms || 0}ms P99)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Canary Errors:</span>
                <span className={telemetry.canaryErrors > 0 ? "text-rose-600 font-bold" : "text-slate-500"}>
                  {telemetry.canaryErrors || 0} Errors
                </span>
              </div>
            </div>
          </div>

          {/* Watchdog Status Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> Automated Rollback Watchdog
              </h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                watchdog.autoRollbackTriggered ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
              }`}>
                {watchdog.autoRollbackTriggered ? "TRIPPED" : "ARMED"}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Monitors error rates and P99 latency every 10 seconds. Automatically trips circuit and sets canary weight to 0% if error rate exceeds 3.5% or P99 breaches 350ms.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Error Threshold</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">&lt; {watchdog.errorThresholdPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">P99 Latency Ceiling</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">&lt; {watchdog.p99LatencyCeilingMs} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Feature Flags Matrix (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders size={16} className="text-emerald-600" /> Dynamic Feature Flags Matrix ({flags.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target cohorts by User ID Hash Ring, Geolocation, or Custom Role Tags.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className={`rounded-2xl border p-4 transition ${
                    flag.enabled
                      ? "border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                      : "border-slate-200/80 bg-slate-50/50 opacity-70 dark:border-slate-800 dark:bg-slate-900/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFlag(flag.key, flag.enabled, flag.rolloutPercent)}
                        className={`text-lg transition ${flag.enabled ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {flag.enabled ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                      </button>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {flag.name}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500">{flag.key}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {flag.strategy}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {flag.rolloutPercent}% Rollout
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {flag.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800/80 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Target Cohorts:</span>
                      {flag.targetGroups?.map((g, idx) => (
                        <span key={idx} className="rounded-full bg-slate-200/80 px-2 py-0.5 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {g}
                        </span>
                      ))}
                    </div>

                    <span className="font-mono text-slate-400">
                      {flag.enabled ? "Active in Mesh" : "Disabled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
