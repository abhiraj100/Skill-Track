// client/src/pages/LsmStudio.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Archive,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  FileCode,
  HardDrive,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function LsmStudio() {
  const [lsmState, setLsmState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Write inputs
  const [putKey, setPutKey] = useState("user:103");
  const [putVal, setPutVal] = useState('{"name":"Dan","tier":"Pro"}');

  // Query inputs
  const [queryKeyInput, setQueryKeyInput] = useState("user:101");
  const [queryResult, setQueryResult] = useState(null);

  const fetchLsmState = async () => {
    try {
      const res = await api.get("/lsm/state");
      setLsmState(res.data.data);
    } catch {
      // Fallback local mock state
      setLsmState({
        stats: {
          totalWrites: 12,
          totalReads: 28,
          bloomFilterFalsePositives: 0,
          bloomFilterZeroIoSkips: 42,
          diskBytesWrittenKb: 64.2
        },
        wal: [
          { seq: 101, op: "PUT", key: "user:101", value: '{"name":"Alice","tier":"Pro"}', ts: "2026-09-30T16:00:00Z" },
          { seq: 102, op: "PUT", key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', ts: "2026-09-30T16:02:00Z" },
          { seq: 103, op: "PUT", key: "metrics:qps", value: "84200", ts: "2026-09-30T16:05:00Z" }
        ],
        memtable: [
          { key: "metrics:qps", value: "84200", version: 3, tombstone: false },
          { key: "user:101", value: '{"name":"Alice","tier":"Pro"}', version: 1, tombstone: false },
          { key: "user:102", value: '{"name":"Bob","tier":"Enterprise"}', version: 2, tombstone: false }
        ],
        memtableThreshold: 4,
        levels: {
          L0: [
            {
              id: "sst_001",
              level: 0,
              createdAt: "2026-09-30T15:40:00Z",
              entries: [
                { key: "auth:token:jwt_88", value: "valid_signature", version: 1, tombstone: false },
                { key: "config:rate_limit", value: "10000", version: 1, tombstone: false },
                { key: "user:099", value: '{"name":"Zack","tier":"Free"}', version: 1, tombstone: false }
              ],
              bloomFilter: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
              sparseIndex: [
                { key: "auth:token:jwt_88", offset: 0 },
                { key: "user:099", offset: 2 }
              ]
            }
          ],
          L1: [
            {
              id: "sst_base_01",
              level: 1,
              createdAt: "2026-09-30T14:30:00Z",
              entries: [
                { key: "app:theme", value: "dark", version: 1, tombstone: false },
                { key: "billing:plan:pro", value: "$29/mo", version: 1, tombstone: false },
                { key: "cluster:region", value: "us-east-1", version: 1, tombstone: false }
              ],
              bloomFilter: [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0],
              sparseIndex: [
                { key: "app:theme", offset: 0 },
                { key: "cluster:region", offset: 2 }
              ]
            }
          ]
        },
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            action: "STORAGE_ENGINE_INITIALIZED",
            details: "LSM Tree Engine active: MemTable (Red-Black Sorted), WAL durability enabled, Leveled Compaction L0->L1."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLsmState();
  }, []);

  const handlePut = async () => {
    if (!putKey.trim() || !putVal.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/put", { key: putKey, value: putVal });
      toast.success(res.data.message || `Wrote ${putKey}`);
      setLsmState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to write key");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (keyToDelete) => {
    const targetKey = keyToDelete || putKey;
    if (!targetKey) return;
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/delete", { key: targetKey });
      toast.success(res.data.message || `Deleted ${targetKey} with Tombstone`);
      setLsmState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlush = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/flush");
      toast.success(res.data.message || "MemTable flushed to Level 0 SSTable");
      setLsmState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Flush failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompact = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/compact");
      toast.success(res.data.message || "Leveled Compaction completed!");
      setLsmState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Compaction failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!queryKeyInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/query", { key: queryKeyInput });
      setQueryResult(res.data);
      if (res.data.found) {
        toast.success(`Key '${queryKeyInput}' resolved from ${res.data.source}`);
      } else if (res.data.isDeleted) {
        toast.error(`Key '${queryKeyInput}' was deleted (Tombstone found in ${res.data.source})`);
      } else {
        toast("Key not found in any storage tier", { icon: "🔍" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Query failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/lsm/reset");
      toast.success("Storage engine reset to baseline");
      setLsmState(res.data.data);
      setQueryResult(null);
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Link to="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <span>Storage Engines</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">LSM Tree Storage Engine</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Log-Structured Merge (LSM) Tree Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Internal storage architecture of RocksDB, Cassandra & ClickHouse: MemTable in-memory skiplist, WAL durability, SSTable leveled compaction, and zero-I/O Bloom filters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchLsmState}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} className={actionLoading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={handleFlush}
            disabled={actionLoading || lsmState?.memtable?.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowDown size={14} />
            Flush MemTable to L0
          </button>
          <button
            onClick={handleCompact}
            disabled={actionLoading || lsmState?.levels?.L0?.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
          >
            <Archive size={14} />
            Run Leveled Compaction (L0 → L1)
          </button>
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-900/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Total Writes</span>
            <HardDrive size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {lsmState?.stats?.totalWrites || 0} Ops
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Written to WAL + MemTable ({lsmState?.stats?.diskBytesWrittenKb?.toFixed(1) || 0} KB)
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-900/30 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Bloom Filter Skips</span>
            <Zap size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {lsmState?.stats?.bloomFilterZeroIoSkips || 0} Zero-I/O
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Disk reads avoided entirely via Bloom filter probe
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 dark:border-purple-900/30 dark:from-slate-900 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">MemTable Threshold</span>
            <Cpu size={18} className="text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {lsmState?.memtable?.length || 0} / {lsmState?.memtableThreshold || 4} Entries
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Auto-flushes to L0 SSTable on 4th key insertion
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 dark:border-amber-900/30 dark:from-slate-900 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Disk SSTables</span>
            <Layers size={18} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {(lsmState?.levels?.L0?.length || 0) + (lsmState?.levels?.L1?.length || 0)} Files
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            L0: {lsmState?.levels?.L0?.length || 0} files · L1: {lsmState?.levels?.L1?.length || 0} files
          </p>
        </div>
      </div>

      {/* Interactive Write & Point Query Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Write (PUT / DELETE) Panel */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus size={18} className="text-blue-600" />
            Append-Only Write Path (WAL & MemTable)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential append to Write-Ahead Log (WAL) for durability, then sorted insertion into MemTable.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Key Identifier
              </label>
              <input
                type="text"
                value={putKey}
                onChange={(e) => setPutKey(e.target.value)}
                placeholder="e.g. user:103 or config:timeout"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Value Payload (JSON or String)
              </label>
              <input
                type="text"
                value={putVal}
                onChange={(e) => setPutVal(e.target.value)}
                placeholder='e.g. {"name":"Dan","tier":"Pro"}'
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handlePut}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={14} />
                PUT Key
              </button>
              <button
                onClick={() => handleDelete(putKey)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 size={14} />
                Write Tombstone Delete
              </button>
            </div>
          </div>
        </div>

        {/* Read (Point Query) Panel */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search size={18} className="text-emerald-600" />
            LSM Read Path & Bloom Filter Probe
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trace resolution hierarchy: MemTable (RAM) → L0 SSTables (Bloom Filter probe) → L1 Leveled Runs.
          </p>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={queryKeyInput}
              onChange={(e) => setQueryKeyInput(e.target.value)}
              placeholder="e.g. user:101 or app:theme"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              onClick={handleQuery}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Play size={14} />
              Execute Query Trace
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1">Try:</span>
            {["user:101", "metrics:qps", "auth:token:jwt_88", "app:theme", "missing:key"].map((k) => (
              <button
                key={k}
                onClick={() => setQueryKeyInput(k)}
                className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Query Trace Results */}
          {queryResult && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-850">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Target: <span className="text-emerald-600 dark:text-emerald-400">{queryKeyInput}</span>
                </span>
                <span className={`badge ${
                  queryResult.found
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                    : queryResult.isDeleted
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}>
                  {queryResult.found ? "RESOLVED HIT" : queryResult.isDeleted ? "DELETED (TOMBSTONE)" : "NOT FOUND"}
                </span>
              </div>

              {queryResult.found && (
                <div className="mt-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Resolved Value:</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold break-all">
                    {queryResult.value}
                  </span>
                </div>
              )}

              {/* Step-by-step resolution trace */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Tier Resolution Trace:</span>
                {queryResult.trace?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-slate-400 shrink-0">{idx + 1}.</span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">{step.target}</strong>:{" "}
                      <span className={`${
                        step.status?.includes("POSITIVE") || step.status?.includes("HIT")
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : step.status?.includes("NEGATIVE")
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-500"
                      }`}>
                        [{step.status}]
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{step.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Storage Architecture Canvas: MemTable & WAL */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* In-Memory MemTable */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu size={16} className="text-blue-600" />
                In-Memory MemTable (SkipList / Red-Black Tree)
              </h3>
              <p className="text-xs text-slate-500">
                Sorted key-value store in RAM. Capacity: {lsmState?.memtable?.length || 0}/4 entries.
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              RAM TIER
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {lsmState?.memtable?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                MemTable is empty. Flushed to Level 0 SSTable file!
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                    <th className="pb-2 font-semibold">Key (Sorted)</th>
                    <th className="pb-2 font-semibold">Value</th>
                    <th className="pb-2 font-semibold">Version</th>
                    <th className="pb-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {lsmState?.memtable?.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">{item.key}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">{item.value}</td>
                      <td className="py-2.5 text-slate-400">v{item.version}</td>
                      <td className="py-2.5 text-right">
                        {item.tombstone ? (
                          <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                            TOMBSTONE
                          </span>
                        ) : (
                          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Write-Ahead Log (WAL) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode size={16} className="text-amber-600" />
                Write-Ahead Log (WAL) On Disk
              </h3>
              <p className="text-xs text-slate-500">Append-only crash recovery log. Truncated upon MemTable flush.</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              DISK WAL
            </span>
          </div>

          <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {lsmState?.wal?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                WAL checkpointed and truncated. All state persisted to SSTables.
              </div>
            ) : (
              lsmState?.wal?.map((rec) => (
                <div
                  key={rec.seq}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs font-mono flex items-center justify-between dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">#{rec.seq}</span>
                    <span className={`font-bold ${rec.op === "DELETE" ? "text-rose-600" : "text-blue-600"}`}>
                      {rec.op}
                    </span>
                    <strong className="text-slate-900 dark:text-white">{rec.key}</strong>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{rec.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Disk SSTables: Level 0 and Level 1 */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          On-Disk SSTable Hierarchy & Leveled Compaction
        </h2>

        {/* Level 0 SSTables */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                Level 0 (L0) SSTables ({lsmState?.levels?.L0?.length || 0} Files)
              </h3>
              <p className="text-xs text-slate-500">Uncompacted flushes from MemTable. Keys may overlap across files.</p>
            </div>
            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
              L0 DISK TIER
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {lsmState?.levels?.L0?.map((sst) => (
              <div
                key={sst.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{sst.id}.sst</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sst.entries?.length} keys · Bloom Filter Active
                  </span>
                </div>

                {/* 16-Bit Bloom Filter Visualization */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>16-Bit Bloom Filter Array</span>
                    <span>k=3 hash functions</span>
                  </div>
                  <div className="grid grid-cols-16 gap-0.5">
                    {sst.bloomFilter?.map((bit, idx) => (
                      <div
                        key={idx}
                        title={`Bit index ${idx}: ${bit}`}
                        className={`h-5 rounded-xs text-[9px] font-mono flex items-center justify-center font-bold ${
                          bit === 1
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                        }`}
                      >
                        {bit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data entries in SSTable */}
                <div className="mt-3 space-y-1 text-xs font-mono">
                  {sst.entries?.map((e) => (
                    <div key={e.key} className="flex justify-between text-[11px]">
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{e.key}</span>
                      <span className="text-slate-500 truncate max-w-[130px]">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level 1 SSTables (Compacted) */}
        <div className="rounded-3xl border border-purple-200/80 bg-purple-50/30 p-5 shadow-sm dark:border-purple-900/30 dark:bg-purple-950/10">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Archive size={16} className="text-purple-600" />
                Level 1 (L1) Compacted Non-Overlapping Runs ({lsmState?.levels?.L1?.length || 0} Files)
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated runs sorted by key with dead tombstones permanently eliminated.
              </p>
            </div>
            <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs">
              L1 COMPACTED TIER
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {lsmState?.levels?.L1?.map((sst) => (
              <div
                key={sst.id}
                className="rounded-2xl border border-purple-200 bg-white p-4 dark:border-purple-900/40 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/40">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{sst.id}.sst</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                    Compacted Run · {sst.entries?.length} keys
                  </span>
                </div>

                {/* 16-Bit Bloom Filter Visualization */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>16-Bit Bloom Filter</span>
                    <span>Zero-I/O Negative Probe</span>
                  </div>
                  <div className="grid grid-cols-16 gap-0.5">
                    {sst.bloomFilter?.map((bit, idx) => (
                      <div
                        key={idx}
                        className={`h-5 rounded-xs text-[9px] font-mono flex items-center justify-center font-bold ${
                          bit === 1
                            ? "bg-purple-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                        }`}
                      >
                        {bit}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs font-mono">
                  {sst.entries?.map((e) => (
                    <div key={e.key} className="flex justify-between text-[11px]">
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{e.key}</span>
                      <span className="text-slate-500 truncate max-w-[130px]">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
