import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Filter,
  Flame,
  GitBranch,
  Layers,
  Network,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Share2,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function TracingStudio() {
  const [loading, setLoading] = useState(true);
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [selectedSpan, setSelectedSpan] = useState(null);
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    loadTraces();
  }, [filterService, filterStatus]);

  const loadTraces = async () => {
    setLoading(true);
    try {
      let query = "";
      const params = [];
      if (filterService) params.push(`service=${encodeURIComponent(filterService)}`);
      if (filterStatus !== "all") params.push(`status=${filterStatus}`);
      if (params.length > 0) query = `?${params.join("&")}`;

      const { data } = await api.get(`/tracing/traces${query}`);
      setTraces(data.traces || []);
      if (data.traces && data.traces.length > 0) {
        // Load detailed first trace
        loadTraceDetail(data.traces[0].traceId);
      }
    } catch {
      toast.error("Failed to load distributed traces");
    } finally {
      setLoading(false);
    }
  };

  const loadTraceDetail = async (traceId) => {
    try {
      const { data } = await api.get(`/tracing/trace/${traceId}`);
      setSelectedTrace(data.trace);
      if (data.trace.spans && data.trace.spans.length > 0) {
        setSelectedSpan(data.trace.spans[0]);
      }
    } catch {
      toast.error("Failed to load trace detail");
    }
  };

  const handleSimulateTrace = async (induceSlowdown = false) => {
    setIsSimulating(true);
    try {
      const { data } = await api.post("/tracing/simulate", {
        routeName: induceSlowdown
          ? "POST /api/scale/crdt/sync (Vector Clock Contention)"
          : "POST /api/scale/saga/execute (Multi-Region Commit)",
        induceBottleneck: induceSlowdown
      });
      toast.success(data.message);
      await loadTraces();
      if (data.trace) {
        setSelectedTrace(data.trace);
        setSelectedSpan(data.trace.spans[0]);
      }
    } catch {
      toast.error("Failed to simulate trace");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetTraces = async () => {
    try {
      const { data } = await api.post("/tracing/reset");
      toast.success(data.message);
      await loadTraces();
    } catch {
      toast.error("Failed to reset traces");
    }
  };

  const copyTraceId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success("Trace ID copied to clipboard!");
  };

  const totalDuration = selectedTrace?.totalDurationMs || 1;

  // Compute service color badges
  const getServiceColor = (serviceName = "") => {
    const s = serviceName.toLowerCase();
    if (s.includes("gateway")) return "text-cyan-500 bg-cyan-500/10 border-cyan-500/30";
    if (s.includes("iam") || s.includes("auth")) return "text-purple-500 bg-purple-500/10 border-purple-500/30";
    if (s.includes("db") || s.includes("shard")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (s.includes("redis") || s.includes("cache")) return "text-rose-500 bg-rose-500/10 border-rose-500/30";
    if (s.includes("payment") || s.includes("stripe")) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    if (s.includes("kafka") || s.includes("queue")) return "text-indigo-500 bg-indigo-500/10 border-indigo-500/30";
    return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl sm:p-8 border border-cyan-500/30">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Network size={18} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise Architecture Module 30</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              Distributed Tracing & W3C Span Waterfall Studio
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-cyan-100/80">
              Inspect multi-hop RPC span waterfalls conforming to OpenTelemetry & W3C TraceContext standards. Measure P50/P90/P99 latency percentiles, diagnose DAG critical path bottlenecks, and trace cross-service message propagation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulateTrace(false)}
              disabled={isSimulating}
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition flex items-center gap-1.5"
            >
              <Play size={14} /> Simulate RPC Trace
            </button>
            <button
              onClick={() => handleSimulateTrace(true)}
              disabled={isSimulating}
              className="rounded-xl border border-amber-400/30 bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition flex items-center gap-1.5"
            >
              <AlertCircle size={14} /> Inject Latency Anomaly
            </button>
            <button
              onClick={handleResetTraces}
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </section>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ingested Traces</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
            {traces.length}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Buffered in telemetry store</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Selected Trace Duration</p>
          <p className="mt-1 font-mono text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {selectedTrace?.totalDurationMs ? `${selectedTrace.totalDurationMs} ms` : "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">End-to-end user perceived latency</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Span Depth</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
            {selectedTrace?.spans?.length || 0} Spans
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Across distributed microservices</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Trace Propagation Standard</p>
          <p className="mt-1 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            W3C TraceContext RFC 7230
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            traceparent & tracestate
          </p>
        </div>
      </div>

      {/* Main Grid: Trace Selector vs Waterfall Gantt */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Trace List (4 Cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Filter size={14} /> Filter Traces
              </h2>
              <span className="text-[10px] font-mono text-slate-400">{traces.length} Results</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Services</option>
                <option value="gateway">API Gateway</option>
                <option value="iam">IAM Auth</option>
                <option value="saga">Saga Orchestrator</option>
                <option value="db">Sharded DB</option>
                <option value="kafka">Kafka Bus</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="success">Success (2xx)</option>
                <option value="error">Errors (5xx)</option>
              </select>
            </div>

            {/* Trace List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {traces.map((t) => {
                const isSelected = selectedTrace?.traceId === t.traceId;
                const isError = t.statusCode >= 400;

                return (
                  <div
                    key={t.traceId}
                    onClick={() => loadTraceDetail(t.traceId)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/20 dark:border-cyan-500 dark:bg-cyan-950/30"
                        : "border-slate-200/80 bg-slate-50/50 hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                        {t.traceId.slice(0, 14)}...
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                        isError
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        HTTP {t.statusCode}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {t.name}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                      <span>{t.spanCount} spans</span>
                      <span className={`font-bold ${isError ? "text-rose-600" : "text-cyan-600 dark:text-cyan-400"}`}>
                        {t.totalDurationMs} ms
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Gantt Waterfall Chart & Critical Path (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          {selectedTrace ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
              {/* Trace Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                      selectedTrace.statusCode >= 400
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      HTTP {selectedTrace.statusCode}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedTrace.name}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>Trace ID: {selectedTrace.traceId}</span>
                    <button
                      onClick={() => copyTraceId(selectedTrace.traceId)}
                      className="text-cyan-600 hover:text-cyan-500"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Duration</p>
                  <p className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                    {selectedTrace.totalDurationMs} ms
                  </p>
                </div>
              </div>

              {/* Waterfall Gantt Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Microservice Span Hierarchy (Critical Path Highlighted)</span>
                  <span className="font-mono text-[10px]">0ms → {totalDuration}ms</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedTrace.spans?.map((span, idx) => {
                    const isSelected = selectedSpan?.spanId === span.spanId;
                    const leftPercent = Math.min(95, Math.max(0, (span.startOffsetMs / totalDuration) * 100));
                    const widthPercent = Math.max(3, (span.durationMs / totalDuration) * 100);

                    return (
                      <div
                        key={span.spanId}
                        onClick={() => setSelectedSpan(span)}
                        className={`cursor-pointer rounded-xl border p-2.5 transition ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-50/30 ring-1 ring-cyan-500/20 dark:border-cyan-500 dark:bg-cyan-950/20"
                            : "border-slate-200/60 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-950/40"
                        } ${span.isCriticalPath ? "border-l-4 border-l-rose-500" : ""}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate max-w-[280px]">
                            <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${getServiceColor(span.serviceName)}`}>
                              {span.serviceName}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                              {span.operationName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            {span.isCriticalPath && (
                              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                                CRITICAL PATH
                              </span>
                            )}
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {span.durationMs} ms
                            </span>
                          </div>
                        </div>

                        {/* Gantt Bar Visualization */}
                        <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                          <div
                            style={{
                              marginLeft: `${leftPercent}%`,
                              width: `${widthPercent}%`
                            }}
                            className={`h-full rounded-full transition-all ${
                              span.isCriticalPath
                                ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-sm"
                                : span.statusCode >= 400
                                ? "bg-rose-500"
                                : "bg-cyan-500"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Span Attributes Inspector */}
              {selectedSpan && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-950 p-4 text-slate-200 shadow-sm dark:border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-cyan-400 font-bold">Span Inspector: {selectedSpan.spanId}</span>
                    <span className="text-slate-400">{selectedSpan.durationMs} ms ({((selectedSpan.durationMs / totalDuration) * 100).toFixed(1)}% of trace)</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Service:</span>{" "}
                      <span className="text-slate-200">{selectedSpan.serviceName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Operation:</span>{" "}
                      <span className="text-slate-200">{selectedSpan.operationName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Offset:</span>{" "}
                      <span className="text-slate-200">{selectedSpan.startOffsetMs} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>{" "}
                      <span className={selectedSpan.statusCode >= 400 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                        {selectedSpan.statusCode}
                      </span>
                    </div>
                  </div>

                  {selectedSpan.tags && (
                    <div className="border-t border-slate-800/80 pt-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">OpenTelemetry Span Attributes</p>
                      <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto bg-black/40 p-2 rounded-xl">
                        {JSON.stringify(selectedSpan.tags, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
              Select a distributed trace from the left panel to inspect the span waterfall.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
