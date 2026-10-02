// client/src/pages/RateLimitStudio.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RateLimitStudio() {
  const [rlState, setRlState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Blaster settings
  const [burstCount, setBurstCount] = useState(15);
  const [clientTier, setClientTier] = useState("ENTERPRISE_API");
  const [lastBurstResult, setLastBurstResult] = useState(null);

  const fetchState = async () => {
    try {
      const res = await api.get("/ratelimit/state");
      setRlState(res.data.data);
    } catch {
      // Mock fallback
      setRlState({
        activeAlgorithm: "TOKEN_BUCKET",
        tokenBucket: {
          capacity: 20,
          tokens: 14.5,
          refillRatePerSec: 5,
          lastRefillTimeMs: Date.now()
        },
        slidingWindow: {
          windowSec: 60,
          limit: 60,
          previousCount: 42,
          currentCount: 18,
          windowStartMs: Date.now() - 25000
        },
        leakyBucket: {
          capacity: 15,
          queuedRequests: 3,
          leakRatePerSec: 5,
          lastLeakTimeMs: Date.now()
        },
        metrics: {
          totalRequests: 148,
          acceptedRequests: 126,
          rejectedRequests: 22,
          lastBurstSize: 15,
          rejectionRatePercent: 14.8
        },
        trafficLog: [
          {
            id: "req_init_1",
            timestamp: new Date().toISOString(),
            clientIp: "192.168.1.101",
            tier: "ENTERPRISE_API",
            algorithm: "TOKEN_BUCKET",
            status: 200,
            tokensRemaining: 14,
            burstCount: 15,
            accepted: 14,
            rejected: 1
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchAlgorithm = async (algo) => {
    setActionLoading(true);
    try {
      const res = await api.post("/ratelimit/switch-algorithm", { algorithm: algo });
      toast.success(res.data.message);
      setRlState(res.data.data);
      setLastBurstResult(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to switch algorithm");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlast = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/ratelimit/blast", {
        count: burstCount,
        tier: clientTier,
        clientIp: "10.0.4.88"
      });
      setLastBurstResult(res.data);
      setRlState(res.data.data);
      if (res.data.summary?.rejected > 0) {
        toast.error(`Traffic shed: ${res.data.summary.rejected} requests rejected (HTTP 429)`);
      } else {
        toast.success(`Burst accepted: All ${res.data.summary.accepted} requests passed (HTTP 200)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Blast failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/ratelimit/reset");
      toast.success("Rate limiter reset to baseline");
      setRlState(res.data.data);
      setLastBurstResult(null);
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setActionLoading(false);
    }
  };

  const currentAlgorithm = rlState?.activeAlgorithm || "TOKEN_BUCKET";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Link to="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <span>SRE & Traffic Engineering</span>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-400">Distributed Rate Limiter</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Distributed Rate Limiting & Traffic Shaper Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Simulate sliding window log counters, distributed token buckets with Redis Lua atomic CAS, leaky bucket FIFO smoothing, and HTTP 429 Too Many Requests shedding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchState}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} className={actionLoading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Reset Quotas
          </button>
        </div>
      </div>

      {/* Algorithm Selector Switcher */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              id: "TOKEN_BUCKET",
              label: "Distributed Token Bucket",
              desc: "Redis Lua script atomic CAS · Allows bursts up to bucket capacity (20) with steady refill (5/s)",
              icon: Zap
            },
            {
              id: "SLIDING_WINDOW",
              label: "Sliding Window Counter",
              desc: "Weighted previous-window estimation · Smooth rate limiting without boundary reset spikes",
              icon: Clock
            },
            {
              id: "LEAKY_BUCKET",
              label: "Leaky Bucket Traffic Shaper",
              desc: "Constant-rate FIFO queue (5/s) · Converts bursty spike traffic into uniform smooth egress",
              icon: Gauge
            }
          ].map((item) => {
            const isSelected = currentAlgorithm === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSwitchAlgorithm(item.id)}
                className={`flex flex-col text-left rounded-2xl p-4 transition-all duration-200 ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Icon size={18} className={isSelected ? "text-white" : "text-amber-500"} />
                    {item.label}
                  </div>
                  {isSelected && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">ACTIVE</span>}
                </div>
                <p className={`mt-2 text-xs leading-relaxed ${isSelected ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-900/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Total Volume</span>
            <Activity size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {rlState?.metrics?.totalRequests || 0} Requests
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Last Burst: {rlState?.metrics?.lastBurstSize || 0} concurrent reqs
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-900/30 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Allowed (200 OK)</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {rlState?.metrics?.acceptedRequests || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Passed through upstream gateway filter
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 dark:border-rose-900/30 dark:from-slate-900 dark:to-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">Shed (HTTP 429)</span>
            <ShieldAlert size={18} className="text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {rlState?.metrics?.rejectedRequests || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Rejection Rate: <strong className="text-rose-600">{rlState?.metrics?.rejectionRatePercent || 0}%</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 dark:border-amber-900/30 dark:from-slate-900 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Available Quota</span>
            <Zap size={18} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {currentAlgorithm === "TOKEN_BUCKET"
              ? `${Math.floor(rlState?.tokenBucket?.tokens || 0)} / ${rlState?.tokenBucket?.capacity || 20}`
              : currentAlgorithm === "SLIDING_WINDOW"
              ? `${Math.max(0, 60 - (rlState?.slidingWindow?.currentCount || 0))} / 60`
              : `${15 - (rlState?.leakyBucket?.queuedRequests || 0)} / 15`}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Refill: +5 quota units / second
          </p>
        </div>
      </div>

      {/* Interactive High-QPS Traffic Blaster & Visual Architecture */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Blaster Form */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              High-QPS Burst Traffic Blaster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate high-concurrency request bursts against the active distributed rate limiter to inspect shedding behavior.
            </p>

            {/* Burst Count Slider */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider">Burst Size</span>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 font-mono text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {burstCount} Concurrent Requests
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={burstCount}
                onChange={(e) => setBurstCount(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 (Single)</span>
                <span>15 (Normal)</span>
                <span>30 (Spike)</span>
                <span>50 (Flood)</span>
              </div>
            </div>

            {/* Client Tier Switcher */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Client API Key Tier
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "FREE_TIER", label: "Free Tier", q: "Limit: 5" },
                  { id: "PRO_API_KEY", label: "Pro Tier", q: "Limit: 20" },
                  { id: "ENTERPRISE_API", label: "Enterprise", q: "Limit: 60" }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setClientTier(tier.id)}
                    className={`rounded-xl border p-2 text-center transition ${
                      clientTier === tier.id
                        ? "border-amber-500 bg-amber-50/50 text-amber-800 font-bold dark:bg-amber-950/30 dark:text-amber-300"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <div>{tier.label}</div>
                    <div className="text-[10px] opacity-75">{tier.q}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleBlast}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
            >
              <Play size={15} />
              Blast {burstCount} Requests Against {currentAlgorithm}
            </button>
          </div>
        </div>

        {/* Live Traffic Burst Result & HTTP Headers */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal size={18} className="text-indigo-600" />
            HTTP Gateway Response & Headers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated RFC 6585 rate limiting headers and status code breakdown.
          </p>

          {lastBurstResult ? (
            <div className="mt-4 space-y-4">
              {/* Summary Pill Bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    {lastBurstResult.summary?.accepted} Allowed
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80">HTTP 200 OK</div>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
                  <div className="text-xl font-black text-rose-700 dark:text-rose-400">
                    {lastBurstResult.summary?.rejected} Shed
                  </div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400/80">HTTP 429 Too Many Requests</div>
                </div>
              </div>

              {/* Wire Protocol Header Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>OUTGOING HTTP HEADERS</span>
                  <span className={lastBurstResult.summary?.rejected > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                    {lastBurstResult.summary?.rejected > 0 ? "429 TOO MANY REQUESTS" : "200 OK"}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div><span className="text-purple-400">X-RateLimit-Limit:</span> {currentAlgorithm === "TOKEN_BUCKET" ? "20" : "60"}</div>
                  <div><span className="text-purple-400">X-RateLimit-Remaining:</span> {lastBurstResult.results?.[lastBurstResult.results.length - 1]?.tokensRemaining || 0}</div>
                  <div><span className="text-purple-400">X-RateLimit-Reset:</span> {Math.floor(Date.now() / 1000) + 12}</div>
                  {lastBurstResult.summary?.rejected > 0 && (
                    <div className="text-rose-400 font-bold">
                      <span className="text-rose-300">Retry-After:</span> 4 seconds
                    </div>
                  )}
                  <div><span className="text-purple-400">X-RateLimit-Algorithm:</span> {currentAlgorithm}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 p-8 text-center text-xs text-slate-400">
              No burst active. Adjust the burst slider and click Blast to simulate high-QPS traffic!
            </div>
          )}
        </div>
      </div>

      {/* Real-time Traffic Event Log */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              Gateway Ingress Traffic Stream
            </h3>
            <p className="text-xs text-slate-500">Real-time edge firewall rate limiting evaluations</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {rlState?.trafficLog?.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs font-mono flex items-center justify-between dark:border-slate-800 dark:bg-slate-850"
            >
              <div className="flex items-center gap-3">
                <span className={`badge ${
                  item.status === 200
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                } font-bold text-[10px]`}>
                  {item.status === 200 ? "200 OK" : "429 SHED"}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{item.clientIp}</span>
                <span className="text-[11px] text-slate-400">[{item.tier}]</span>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span>Algo: <strong className="text-slate-700 dark:text-slate-300">{item.algorithm}</strong></span>
                {item.burstCount && (
                  <span>
                    Passed: <strong className="text-emerald-600">{item.accepted}</strong> / Shed: <strong className="text-rose-600">{item.rejected}</strong>
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
