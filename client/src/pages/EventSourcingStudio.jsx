import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Eye,
  FileCode,
  Flame,
  GitBranch,
  GitCommit,
  History,
  Layers,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const EVENT_PRESETS = [
  {
    label: "Promotion to Principal Architect",
    eventType: "RolePromotionConferred",
    payload: {
      newTitle: "Principal Distributed Systems Architect",
      level: "L6 / Staff II",
      approvedBy: "Engineering VP Council",
      promotionBonusUSD: 50000
    }
  },
  {
    label: "FAANG Benchmark Mastery",
    eventType: "SkillMasteryAchieved",
    payload: {
      skill: "Event Sourcing & CQRS Auditability",
      proficiencyScore: 100,
      evaluator: "SkillTrack Staff Review Panel"
    }
  },
  {
    label: "Secondary Equity RSU Grant",
    eventType: "CompensationOfferReceived",
    payload: {
      company: "Apex Cloud Infrastructure",
      role: "Lead Systems Architect",
      totalCompensationUSD: 440000,
      baseSalary: 230000,
      rsuEquityGrant: 180000,
      signingBonus: 30000
    }
  },
  {
    label: "Cryptographic Attestation Seal",
    eventType: "CredentialIssued",
    payload: {
      certificateId: "ST-2026-CQRS-9921",
      courseTitle: "High-Throughput Event-Driven Systems & CQRS",
      grade: "Mastery (100%)",
      merkleLeafHash: "a7f5d8120b4c89e4726bf690045d312bc891048e77a1c89304bdfe499120de88"
    }
  }
];

export default function EventSourcingStudio() {
  const [loading, setLoading] = useState(true);
  const [streamData, setStreamData] = useState(null);
  const [selectedAggregate, setSelectedAggregate] = useState("AGG-STUDENT-8842");
  const [selectedSequence, setSelectedSequence] = useState(5);
  const [replayedState, setReplayedState] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeTab, setActiveTab] = useState("projected"); // 'projected' | 'raw' | 'projections'

  // New Event Form State
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [customEventType, setCustomEventType] = useState("RolePromotionConferred");
  const [customPayload, setCustomPayload] = useState(JSON.stringify(EVENT_PRESETS[0].payload, null, 2));
  const [expectedVersion, setExpectedVersion] = useState("");
  const [isAppending, setIsAppending] = useState(false);

  useEffect(() => {
    loadStream();
  }, [selectedAggregate]);

  const loadStream = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/stream/${selectedAggregate}`);
      setStreamData(data);
      setSelectedSequence(data.latestSequence || 1);
      setExpectedVersion(data.latestSequence?.toString() || "0");
      setReplayedState(data.materializedState);
    } catch {
      toast.error("Failed to load event stream");
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (targetSeq) => {
    setIsReplaying(true);
    setSelectedSequence(targetSeq);
    try {
      const { data } = await api.post("/events/replay", {
        aggregateId: selectedAggregate,
        targetSequence: targetSeq
      });
      setReplayedState(data.reconstructedState);
      toast.success(`Time-traveled to sequence #${targetSeq}`);
    } catch {
      toast.error("Replay execution failed");
    } finally {
      setIsReplaying(false);
    }
  };

  const handleAppendEvent = async (e) => {
    e?.preventDefault();
    setIsAppending(true);

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(customPayload);
      } catch {
        toast.error("Invalid JSON payload");
        setIsAppending(false);
        return;
      }

      const body = {
        aggregateId: selectedAggregate,
        aggregateType: "CandidateCareerProfile",
        eventType: customEventType,
        payload: parsedPayload,
        expectedVersion: expectedVersion ? parseInt(expectedVersion, 10) : undefined
      };

      const { data } = await api.post("/events/append", body);
      toast.success(data.message || "Event appended to immutable ledger!");
      await loadStream();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(`Optimistic Concurrency Conflict! Current version is #${err.response?.data?.currentVersion}`);
      } else {
        toast.error(err.response?.data?.message || "Failed to append event");
      }
    } finally {
      setIsAppending(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const { data } = await api.post("/events/snapshot", { aggregateId: selectedAggregate });
      toast.success(data.message);
      await loadStream();
    } catch {
      toast.error("Failed to create snapshot");
    }
  };

  const handleResetLedger = async () => {
    try {
      const { data } = await api.post("/events/reset");
      toast.success(data.message);
      await loadStream();
    } catch {
      toast.error("Failed to reset ledger");
    }
  };

  const onSelectPreset = (idx) => {
    setSelectedPresetIdx(idx);
    const p = EVENT_PRESETS[idx];
    setCustomEventType(p.eventType);
    setCustomPayload(JSON.stringify(p.payload, null, 2));
  };

  const latestSeq = streamData?.latestSequence || 1;
  const isHistorical = selectedSequence < latestSeq;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8 border border-indigo-500/20">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <GitCommit size={18} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Enterprise Architecture Module 28</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              Event Sourcing & CQRS Audit Ledger
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-200/80">
              Model domain aggregates via append-only immutable event streams. Features cryptographic SHA-256 block chaining, optimistic concurrency version fencing, snapshot compaction, and zero-loss time-travel state reconstruction.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCreateSnapshot}
              className="rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition flex items-center gap-1.5"
            >
              <Database size={14} /> Compact Snapshot
            </button>
            <button
              onClick={handleResetLedger}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Reset Ledger
            </button>
            <button
              onClick={loadStream}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Aggregate Stream</p>
          <p className="mt-1 font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
            {selectedAggregate}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Target Domain Entity</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Stream Version</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
            #{streamData?.latestSequence || 0}
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">Optimistic lock version</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Snapshot Status</p>
          <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
            {streamData?.snapshot ? `Seq #${streamData.snapshot.snapshotSequence} (${streamData.snapshot.eventCountCompacted} compacted)` : "No Snapshot"}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">O(1) rehydration checkpoint</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cryptographic Head Hash</p>
          <p className="mt-1 font-mono text-xs text-indigo-600 dark:text-indigo-400 truncate max-w-full">
            {streamData?.headHash || "0".repeat(64)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">SHA-256 sequence digest</p>
        </div>
      </div>

      {/* Time-Travel Scrubber Bar */}
      <div className="rounded-3xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Time-Travel State Replayer (Sequence Scrubber)
            </h3>
            {isHistorical && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Viewing Historical Sequence #{selectedSequence} of #{latestSeq}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReplay(latestSeq)}
              disabled={!isHistorical}
              className="rounded-xl border border-indigo-200 bg-white px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-400 transition"
            >
              Jump to Latest Head (#{latestSeq})
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="font-mono text-xs font-bold text-slate-500">Seq #1</span>
          <input
            type="range"
            min={1}
            max={Math.max(1, latestSeq)}
            value={selectedSequence}
            onChange={(e) => handleReplay(parseInt(e.target.value, 10))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-800"
          />
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Seq #{selectedSequence}
          </span>
        </div>
      </div>

      {/* Main Grid: Event Stream vs Materialized State */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Append-Only Event Log (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Layers size={15} /> Append-Only Immutable Event Log ({streamData?.events?.length || 0})
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Lock Policy: Optimistic Concurrency
            </span>
          </div>

          {/* Event Stream Cards */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {streamData?.events?.map((evt) => {
              const isSelected = evt.sequence === selectedSequence;
              const isFutureInReplay = evt.sequence > selectedSequence;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleReplay(evt.sequence)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                      : isFutureInReplay
                      ? "border-slate-200/50 bg-slate-50/50 opacity-40 dark:border-slate-800 dark:bg-slate-900/40"
                      : "border-slate-200/80 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/80"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                        #{evt.sequence}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {evt.eventType}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {evt.aggregateType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <Clock size={11} /> {new Date(evt.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed">{JSON.stringify(evt.payload, null, 2)}</pre>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <span className="truncate max-w-[200px]">Prev: {evt.previousHash.slice(0, 16)}...</span>
                    <span className="truncate max-w-[200px] text-indigo-600 dark:text-indigo-400">
                      Digest: {evt.hash.slice(0, 16)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Append Event Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600" /> Append New Domain Event
            </h3>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {EVENT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPreset(idx)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
                    selectedPresetIdx === idx
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAppendEvent} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Event Type Name</label>
                  <input
                    type="text"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Expected Version (Optimistic Lock)
                  </label>
                  <input
                    type="number"
                    value={expectedVersion}
                    onChange={(e) => setExpectedVersion(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Event Payload (JSON)</label>
                <textarea
                  rows={3}
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAppending}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <Plus size={14} /> {isAppending ? "Committing..." : "Commit Event to Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Reconstructed Materialized State (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Eye size={15} /> CQRS Projected State (Seq #{selectedSequence})
            </h2>
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px]">
              <button
                onClick={() => setActiveTab("projected")}
                className={`rounded-md px-2 py-0.5 font-semibold transition ${
                  activeTab === "projected" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`rounded-md px-2 py-0.5 font-semibold transition ${
                  activeTab === "raw" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {activeTab === "projected" ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-5">
              {/* Profile Card */}
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Aggregated Candidate Entity
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {replayedState?.studentName || "Pending Creation"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {replayedState?.careerTrack || "Unspecified Track"}
                </p>
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Verified Skills ({replayedState?.skills?.length || 0})
                </p>
                <div className="space-y-1.5">
                  {replayedState?.skills?.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs font-medium dark:bg-slate-800/60"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{s.skill}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {s.score}% Mastery
                      </span>
                    </div>
                  ))}
                  {(!replayedState?.skills || replayedState.skills.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No skills registered at this sequence</p>
                  )}
                </div>
              </div>

              {/* Certificates */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Credentials ({replayedState?.certificates?.length || 0})
                </p>
                <div className="space-y-1.5">
                  {replayedState?.certificates?.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-2.5 text-xs dark:border-amber-900/40 dark:bg-amber-950/20"
                    >
                      <div className="flex justify-between items-center font-bold text-amber-900 dark:text-amber-200">
                        <span>{c.course}</span>
                        <span className="font-mono text-[10px]">{c.grade}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">
                        Leaf: {c.hash}
                      </p>
                    </div>
                  ))}
                  {(!replayedState?.certificates || replayedState.certificates.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No credentials issued at this sequence</p>
                  )}
                </div>
              </div>

              {/* Offers */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Total Compensation Offers ({replayedState?.offers?.length || 0})
                </p>
                <div className="space-y-1.5">
                  {replayedState?.offers?.map((o, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-emerald-50/50 border border-emerald-200/50 p-2.5 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{o.company}</p>
                        <p className="text-[10px] text-slate-500">{o.role}</p>
                      </div>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ${(o.tc || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!replayedState?.offers || replayedState.offers.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No offers recorded at this sequence</p>
                  )}
                </div>
              </div>

              {/* Security Audit Log */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Security Token Rotations ({replayedState?.securityAuditLog?.length || 0})
                </p>
                <div className="space-y-1">
                  {replayedState?.securityAuditLog?.map((l, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-50 p-2 text-[10px] font-mono dark:bg-slate-800/60">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{l.fingerprint}</span>: {l.reason}
                    </div>
                  ))}
                  {(!replayedState?.securityAuditLog || replayedState.securityAuditLog.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No security events logged at this sequence</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-slate-950 p-5 text-slate-200 shadow-sm dark:border-slate-800">
              <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
                {JSON.stringify(replayedState, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
