// client/src/pages/RaftStudio.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Crown,
  Database,
  Flame,
  Globe,
  HelpCircle,
  Network,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Split,
  Terminal,
  Wifi,
  WifiOff,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RaftStudio() {
  const [raftState, setRaftState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commandInput, setCommandInput] = useState("SET config.cluster_shards=8");
  const [selectedNodeId, setSelectedNodeId] = useState("node-1");

  const fetchRaftState = async () => {
    try {
      const res = await api.get("/raft/state");
      setRaftState(res.data.data);
    } catch {
      // Fallback state if server is offline
      setRaftState({
        term: 1,
        quorumSize: 3,
        partitionActive: false,
        partitions: null,
        leaderId: "node-1",
        healthyNodeCount: 5,
        nodes: [
          {
            id: "node-1", role: "LEADER", term: 1, votedFor: "node-1", votesReceived: 3, status: "HEALTHY", heartbeatTimerMs: 50,
            log: [
              { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
              { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
            ],
            commitIndex: 2, lastApplied: 2
          },
          {
            id: "node-2", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 180,
            log: [
              { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
              { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
            ],
            commitIndex: 2, lastApplied: 2
          },
          {
            id: "node-3", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 220,
            log: [
              { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
              { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
            ],
            commitIndex: 2, lastApplied: 2
          },
          {
            id: "node-4", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 195,
            log: [
              { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
              { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
            ],
            commitIndex: 2, lastApplied: 2
          },
          {
            id: "node-5", role: "FOLLOWER", term: 1, votedFor: "node-1", votesReceived: 0, status: "HEALTHY", heartbeatTimerMs: 240,
            log: [
              { index: 1, term: 1, command: "CONFIG cluster.init=true", committed: true },
              { index: 2, term: 1, command: "SET shard.replicas=3", committed: true }
            ],
            commitIndex: 2, lastApplied: 2
          }
        ],
        auditEvents: [
          {
            timestamp: new Date().toISOString(),
            type: "CLUSTER_INITIALIZED",
            details: "5-node Raft consensus cluster initialized with Quorum=3, Term=1, Leader=node-1"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaftState();
    const interval = setInterval(fetchRaftState, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleReplicate = async () => {
    if (!commandInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post("/raft/replicate", { command: commandInput });
      toast.success(res.data.message || "Command proposed to Raft leader");
      setRaftState(res.data.data || res.data.cluster);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || "Quorum failure in minority partition!");
        if (err.response.data.cluster) {
          setRaftState(err.response.data.cluster);
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to replicate command");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCrashLeader = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/raft/crash-leader");
      toast.success(res.data.message || "Leader crashed. Election triggered!");
      setRaftState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not crash leader");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartitionToggle = async () => {
    setActionLoading(true);
    try {
      if (raftState?.partitionActive) {
        const res = await api.post("/raft/heal-partition");
        toast.success(res.data.message || "Partition healed!");
        setRaftState(res.data.data);
      } else {
        const res = await api.post("/raft/partition");
        toast.success(res.data.message || "Network partition simulated!");
        setRaftState(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Partition action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecoverNode = async (nodeId) => {
    setActionLoading(true);
    try {
      const res = await api.post("/raft/recover-node", { nodeId });
      toast.success(res.data.message || `Node ${nodeId} recovered`);
      setRaftState(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Recovery failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/raft/reset");
      toast.success("Raft cluster reset to initial state");
      setRaftState(res.data.data);
    } catch (err) {
      toast.error("Failed to reset cluster");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedNode = raftState?.nodes?.find((n) => n.id === selectedNodeId) || raftState?.nodes?.[0];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Link to="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <span>Distributed Systems</span>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-400">Raft Consensus Studio</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Raft Consensus & Leader Election Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Simulate Stanford Raft consensus, randomized heartbeat timeouts, majority quorum replication ($Q = \lfloor N/2 \rfloor + 1$), and split-brain partition isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchRaftState}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} className={actionLoading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={handleCrashLeader}
            disabled={actionLoading || !raftState?.leaderId}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
          >
            <Flame size={14} />
            Crash Leader
          </button>
          <button
            onClick={handlePartitionToggle}
            disabled={actionLoading}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition ${
              raftState?.partitionActive
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {raftState?.partitionActive ? <Wifi size={14} /> : <Split size={14} />}
            {raftState?.partitionActive ? "Heal Partition" : "Simulate Partition (2 vs 3)"}
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

      {/* Cluster Status Telemetry Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 dark:border-amber-900/30 dark:from-slate-900 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Current Term</span>
            <Crown size={18} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            Term #{raftState?.term || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Leader: <strong className="text-amber-700 dark:text-amber-300">{raftState?.leaderId || "ELECTING..."}</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-900/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Consensus Quorum</span>
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {raftState?.quorumSize || 3} of 5 Nodes
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Formula: $\lfloor 5/2 \rfloor + 1 = 3$ votes required
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-900/30 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Healthy Replicas</span>
            <Server size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {raftState?.nodes?.filter((n) => n.status === "HEALTHY").length || 0} / 5 Online
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Fault Tolerance: tolerates 2 simultaneous node crashes
          </p>
        </div>

        <div className={`rounded-2xl border p-4 transition ${
          raftState?.partitionActive
            ? "border-rose-300 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Partition Status</span>
            {raftState?.partitionActive ? <WifiOff size={18} className="text-rose-600" /> : <Wifi size={18} className="text-emerald-600" />}
          </div>
          <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
            {raftState?.partitionActive ? "SPLIT-BRAIN FENCE ACTIVE" : "NETWORK CONNECTED"}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {raftState?.partitionActive ? "Minority (2) isolated from Majority (3)" : "Full mesh connectivity across all 5 nodes"}
          </p>
        </div>
      </div>

      {/* Propose Command Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Propose State Machine Command</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Writes are routed exclusively to the active Raft Leader and committed only after majority quorum confirmation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCommandInput("SET config.cluster_shards=8")}
              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            >
              Preset: Shards
            </button>
            <button
              onClick={() => setCommandInput("SET cache.policy=LFU_EXPONENTIAL")}
              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            >
              Preset: Cache Policy
            </button>
            <button
              onClick={() => setCommandInput("UPDATE auth.token_ttl=3600")}
              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            >
              Preset: Auth TTL
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Terminal size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. SET config.replication_factor=3"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={handleReplicate}
            disabled={actionLoading || !commandInput.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
          >
            <Play size={14} />
            Replicate to Quorum
          </button>
        </div>
      </div>

      {/* 5-Node Interactive Visual Cluster */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Distributed 5-Node Consensus Topology
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click any node to inspect its local replicated log
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {raftState?.nodes?.map((node) => {
            const isLeader = node.role === "LEADER";
            const isCrashed = node.status === "CRASHED";
            const isSelected = selectedNodeId === node.id;
            const inMinority = raftState?.partitionActive && raftState?.partitions?.minority.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 relative ${
                  isSelected
                    ? "ring-2 ring-amber-500 shadow-md"
                    : "hover:border-slate-300 dark:hover:border-slate-700"
                } ${
                  isCrashed
                    ? "border-rose-200 bg-rose-50/50 opacity-60 dark:border-rose-900/30 dark:bg-rose-950/10"
                    : isLeader
                    ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Server size={16} className={isLeader ? "text-amber-600" : "text-slate-500"} />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{node.id}</span>
                  </div>
                  {isLeader ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      <Crown size={11} /> Leader
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {node.role}
                    </span>
                  )}
                </div>

                {/* Node Status Indicator */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Status</span>
                  <span className={`font-bold text-[11px] ${
                    isCrashed ? "text-rose-600" : inMinority ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {isCrashed ? "CRASHED" : inMinority ? "PARTITIONED" : "HEALTHY"}
                  </span>
                </div>

                {/* Term & Commit Index */}
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Term:</span>
                    <strong className="text-slate-900 dark:text-white">#{node.term}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Commit Index:</span>
                    <strong className="text-slate-900 dark:text-white">{node.commitIndex}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Log Length:</span>
                    <strong className="text-slate-900 dark:text-white">{node.log.length} entries</strong>
                  </div>
                </div>

                {/* Heartbeat pulse */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Heartbeat / Timeout</span>
                    <span>{node.heartbeatTimerMs}ms</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLeader ? "bg-amber-500 animate-pulse w-full" : "bg-emerald-500 w-3/4"
                      }`}
                    />
                  </div>
                </div>

                {/* Node Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  {isCrashed ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecoverNode(node.id);
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Recover Node →
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      {isSelected ? "● Inspected" : "Click to view"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Log & Audit Stream */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Local Replicated Log Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database size={16} className="text-amber-600" />
                Local Log: <span className="font-mono text-amber-600">{selectedNode?.id}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Current commit index: {selectedNode?.commitIndex} · Applied: {selectedNode?.lastApplied}
              </p>
            </div>
            <span className={`badge ${
              selectedNode?.role === "LEADER"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            } text-xs font-mono font-bold`}>
              {selectedNode?.role}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="pb-2 font-semibold">Index</th>
                  <th className="pb-2 font-semibold">Term</th>
                  <th className="pb-2 font-semibold">Command</th>
                  <th className="pb-2 text-right font-semibold">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {selectedNode?.log?.map((entry) => (
                  <tr key={entry.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">#{entry.index}</td>
                    <td className="py-2.5 text-slate-500">T{entry.term}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200 font-semibold">{entry.command}</td>
                    <td className="py-2.5 text-right">
                      {entry.committed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={13} /> COMMITTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={13} /> UNCOMMITTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Raft Event Stream */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" />
                Cluster Event & Consensus Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Real-time election triggers, quorum acks, and network partition alerts</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {raftState?.auditEvents?.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-850"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {evt.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
