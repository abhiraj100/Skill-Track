// client/src/pages/GossipStudio.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Globe,
  HelpCircle,
  Megaphone,
  Network,
  Play,
  Radio,
  RefreshCw,
  Server,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  SignalZero,
  Users,
  Wifi,
  WifiOff,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function GossipStudio() {
  const [gossipState, setGossipState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rumorInput, setRumorInput] = useState("SERVICE_DISCOVERY: payment-worker-v3");

  const fetchState = async () => {
    try {
      const res = await api.get("/gossip/state");
      setGossipState(res.data.data);
    } catch {
      // Mock fallback
      setGossipState({
        round: 14,
        protocolPeriodMs: 1000,
        subgroupSizeK: 3,
        nodes: [
          { id: "node-a", host: "10.0.1.10", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 1.4 },
          { id: "node-b", host: "10.0.1.11", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 2.1 },
          { id: "node-c", host: "10.0.1.12", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 1.8 },
          { id: "node-d", host: "10.0.1.13", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 3.2 },
          { id: "node-e", host: "10.0.1.14", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 2.5 },
          { id: "node-f", host: "10.0.1.15", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 1.9 },
          { id: "node-g", host: "10.0.1.16", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 2.7 },
          { id: "node-h", host: "10.0.1.17", port: 7946, status: "ALIVE", incarnation: 1, lastSeenRound: 14, pingRttMs: 3.0 }
        ],
        stats: {
          totalPingsSent: 112,
          indirectPingReqs: 8,
          falsePositiveAverted: 6,
          disseminationRoundsToFullSync: 3
        },
        recentRumors: [
          {
            id: "rumor_1",
            originNode: "node-a",
            payload: "SERVICE_JOIN: payment-worker-v3",
            infectedCount: 8,
            completed: true,
            timestamp: new Date().toISOString()
          }
        ],
        events: [
          {
            round: 14,
            timestamp: new Date().toISOString(),
            type: "GOSSIP_ROUND_COMPLETED",
            details: "Round #14: All 8 nodes confirmed ALIVE via direct and indirect SWIM pings."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleStep = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/gossip/step");
      setGossipState(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to execute gossip step");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFailNode = async (nodeId) => {
    setActionLoading(true);
    try {
      const res = await api.post("/gossip/fail-node", { nodeId });
      setGossipState(res.data.data);
      toast.error(`Injected outage on ${nodeId}: Transitioned to SUSPECT via Ping-Req`);
    } catch (err) {
      toast.error("Failed to fail node");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecoverNode = async (nodeId) => {
    setActionLoading(true);
    try {
      const res = await api.post("/gossip/recover-node", { nodeId });
      setGossipState(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to recover node");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastRumor = async () => {
    if (!rumorInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post("/gossip/rumor", { message: rumorInput });
      setGossipState(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to broadcast rumor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/gossip/reset");
      setGossipState(res.data.data);
      toast.success("SWIM Gossip cluster reset to healthy baseline");
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setActionLoading(false);
    }
  };

  const aliveCount = gossipState?.nodes?.filter((n) => n.status === "ALIVE").length || 0;
  const suspectCount = gossipState?.nodes?.filter((n) => n.status === "SUSPECT").length || 0;
  const deadCount = gossipState?.nodes?.filter((n) => n.status === "DEAD").length || 0;

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
            <span>Distributed Systems</span>
            <span>/</span>
            <span className="text-teal-600 dark:text-teal-400">SWIM Gossip Protocol</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            SWIM Gossip Protocol & Cluster Membership Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Decentralized peer-to-peer discovery, infection-style rumor mongering (O(log N) dissemination), and indirect Ping-Req failure detection with suspicion refutation.
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
            onClick={handleStep}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            <Play size={14} />
            Step Gossip Round (+1)
          </button>
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Reset Cluster
          </button>
        </div>
      </div>

      {/* Stats Telemetry */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 dark:border-teal-900/30 dark:from-slate-900 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">Gossip Round</span>
            <Activity size={18} className="text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            Round #{gossipState?.round || 1}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Period: {gossipState?.protocolPeriodMs || 1000}ms per peer cycle
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 dark:border-emerald-900/30 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Cluster Health</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {aliveCount} / 8 Alive
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Suspect: <strong className="text-amber-600">{suspectCount}</strong> · Dead: <strong className="text-rose-600">{deadCount}</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-900/30 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Indirect Ping-Reqs</span>
            <Network size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {gossipState?.stats?.indirectPingReqs || 0} Probes
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Subgroup size: k={gossipState?.subgroupSizeK || 3} random intermediaries
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 dark:border-purple-900/30 dark:from-slate-900 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">Dissemination Speed</span>
            <Zap size={18} className="text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            O(log N) = 3 Steps
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            False-Positives Averted: <strong className="text-purple-700 dark:text-purple-300">{gossipState?.stats?.falsePositiveAverted || 0}</strong>
          </p>
        </div>
      </div>

      {/* Epidemic Rumor Broadcast Form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone size={18} className="text-teal-600" />
          Epidemic Rumor Mongering Dissemination
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Broadcast arbitrary metadata or cluster state changes. SWIM spreads the rumor infectiously to all nodes in $O(\log N)$ rounds with $O(1)$ network load.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={rumorInput}
            onChange={(e) => setRumorInput(e.target.value)}
            placeholder="e.g. SERVICE_JOIN: auth-replica-4 or CONFIG: max_conns=1000"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            onClick={handleBroadcastRumor}
            disabled={actionLoading || !rumorInput.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            <Share2 size={14} />
            Disseminate Rumor (3 Rounds)
          </button>
        </div>
      </div>

      {/* 8-Node Mesh Topology Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Peer-to-Peer Cluster Membership (8 Nodes)
          </h2>
          <span className="text-xs text-slate-500">Click Fail to simulate network partition / crash</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gossipState?.nodes?.map((node) => {
            const isAlive = node.status === "ALIVE";
            const isSuspect = node.status === "SUSPECT";
            const isDead = node.status === "DEAD";

            return (
              <div
                key={node.id}
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  isDead
                    ? "border-rose-300 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 opacity-70"
                    : isSuspect
                    ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 ring-1 ring-amber-400"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Server size={16} className={isAlive ? "text-teal-600" : isSuspect ? "text-amber-600" : "text-rose-600"} />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{node.id}</span>
                  </div>
                  <span className={`badge ${
                    isAlive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : isSuspect
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  } font-mono font-bold text-[10px]`}>
                    {node.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{node.host}:{node.port}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Incarnation:</span>
                    <strong className="text-teal-600 dark:text-teal-400">#{node.incarnation}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ping RTT:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{node.pingRttMs}ms</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Seen:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Round #{node.lastSeenRound}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  {isAlive ? (
                    <button
                      onClick={() => handleFailNode(node.id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    >
                      Fail Node →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRecoverNode(node.id)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Refute & Recover →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Stream */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-teal-600" />
              SWIM Gossip Protocol Events & Failure Detector Audit
            </h3>
            <p className="text-xs text-slate-500">Real-time trace of Ping-Req delegations, suspicion timers, and refutations</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
          {gossipState?.events?.map((evt, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-850"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {evt.type} [Round #{evt.round}]
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                {evt.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
