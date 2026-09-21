import React, { useState } from 'react';
import { 
  GitFork, Radio, Zap, AlertOctagon, CheckCircle2, RotateCcw, 
  Send, Server, ShieldAlert, Cpu, ArrowRight, Play, RefreshCw, 
  Layers, Filter, Clock, Check
} from 'lucide-react';

const TOPICS = [
  { id: 't_orders', name: 'orders.created', partitions: 3, retention: '7d', color: 'text-indigo-400', border: 'border-indigo-500/40' },
  { id: 't_payments', name: 'payments.succeeded', partitions: 3, retention: '30d', color: 'text-emerald-400', border: 'border-emerald-500/40' },
  { id: 't_notifications', name: 'notifications.dispatch', partitions: 2, retention: '24h', color: 'text-amber-400', border: 'border-amber-500/40' },
  { id: 't_dlq', name: 'dead-letter-queue.failed', partitions: 1, retention: '14d', color: 'text-rose-400', border: 'border-rose-500/40' }
];

const CONSUMER_GROUPS = [
  { id: 'cg_billing', name: 'billing-service-group', subscribedTopic: 'orders.created', lag: 0, status: 'Healthy', processedCount: 142 },
  { id: 'cg_inventory', name: 'inventory-allocator-group', subscribedTopic: 'orders.created', lag: 0, status: 'Healthy', processedCount: 142 },
  { id: 'cg_notifier', name: 'customer-email-group', subscribedTopic: 'notifications.dispatch', lag: 1, status: 'Healthy', processedCount: 98 }
];

export default function MicroservicesLab() {
  const [activeTab, setActiveTab] = useState('bus'); // 'bus' | 'dlq' | 'circuit'
  const [selectedTopic, setSelectedTopic] = useState('orders.created');
  const [customPayload, setCustomPayload] = useState('{\n  "orderId": "ORD-98214",\n  "customerId": "usr_882",\n  "amount": 199.99,\n  "currency": "USD"\n}');
  const [isPublishing, setIsPublishing] = useState(false);
  const [eventsLedger, setEventsLedger] = useState([
    { id: 'evt_1', topic: 'orders.created', partition: 1, offset: 1042, timestamp: '2m ago', status: 'ACKNOWLEDGED', payload: '{"orderId":"ORD-98210","amount":89.50}' },
    { id: 'evt_2', topic: 'payments.succeeded', partition: 0, offset: 531, timestamp: '1m ago', status: 'ACKNOWLEDGED', payload: '{"paymentId":"pm_771","status":"paid"}' }
  ]);

  // DLQ Simulator State
  const [simulateConsumerDown, setSimulateConsumerDown] = useState(false);
  const [dlqEvents, setDlqEvents] = useState([
    { id: 'dlq_1', originTopic: 'payments.succeeded', attempts: 3, lastError: '503 Service Unavailable: Gateway Timeout', timestamp: '5m ago', payload: '{"txnId":"txn_fail_991"}' }
  ]);

  // Circuit Breaker State
  // 'CLOSED' (Normal), 'OPEN' (Tripped), 'HALF-OPEN' (Testing)
  const [circuitState, setCircuitState] = useState('CLOSED');
  const [failureThreshold, setFailureThreshold] = useState(40); // 40%
  const [failureCount, setFailureCount] = useState(1);

  const handlePublishEvent = () => {
    setIsPublishing(true);
    setTimeout(() => {
      const newOffset = Math.floor(Math.random() * 800) + 1200;
      const assignedPartition = Math.floor(Math.random() * 3);
      const newEvent = {
        id: `evt_${Date.now()}`,
        topic: selectedTopic,
        partition: assignedPartition,
        offset: newOffset,
        timestamp: 'Just now',
        status: simulateConsumerDown && selectedTopic.includes('payment') ? 'RETRYING (1/3)' : 'ACKNOWLEDGED',
        payload: customPayload
      };

      setEventsLedger(prev => [newEvent, ...prev]);
      setIsPublishing(false);

      if (simulateConsumerDown && selectedTopic.includes('payment')) {
        setTimeout(() => {
          setDlqEvents(prev => [
            {
              id: `dlq_${Date.now()}`,
              originTopic: selectedTopic,
              attempts: 3,
              lastError: 'Circuit breaker tripped / Downstream unreachable',
              timestamp: 'Just now',
              payload: customPayload
            },
            ...prev
          ]);
        }, 1500);
      }
    }, 600);
  };

  const handleReplayDlq = (id) => {
    setDlqEvents(prev => prev.filter(e => e.id !== id));
    setEventsLedger(prev => [
      {
        id: `evt_replay_${Date.now()}`,
        topic: 'orders.created',
        partition: 0,
        offset: 9999,
        timestamp: 'Just now',
        status: 'ACKNOWLEDGED (REPLAYED)',
        payload: '{"replayed": true}'
      },
      ...prev
    ]);
  };

  const handleTripCircuit = () => {
    setCircuitState('OPEN');
    setFailureCount(12);
  };

  const handleResetCircuit = () => {
    setCircuitState('CLOSED');
    setFailureCount(0);
  };

  const handleProbeCircuit = () => {
    setCircuitState('HALF-OPEN');
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-purple-500/30">
              <Radio className="w-3.5 h-3.5" /> Event-Driven Systems
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Kafka & Microservices Event Bus Simulator
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Experience distributed pub/sub event streaming. Publish events across partitioned Kafka topics, observe consumer group fan-out, trigger dead-letter queue retries, and test resilient circuit breaker trip states.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Cluster Status</div>
              <div className="text-base font-bold text-white font-mono">3 Brokers • 4 Topics</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Zero Consumer Lag
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bus')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'bus'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" /> Kafka Event Bus ({TOPICS.length} Topics)
        </button>
        <button
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'dlq'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Dead Letter Queue & Retries ({dlqEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('circuit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'circuit'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" /> Circuit Breaker Pattern ({circuitState})
        </button>
      </div>

      {/* TAB 1: KAFKA EVENT STREAM BUS */}
      {activeTab === 'bus' && (
        <div className="space-y-6">
          {/* Event Publisher Bar */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              Event Producer Dispatcher
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase">Target Kafka Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-gray-950 text-gray-200 border border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                >
                  {TOPICS.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.partitions} partitions)</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">
                  Topic retention: 7 days. Keys automatically hashed across partitions.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-400 font-semibold uppercase">Event JSON Payload</label>
                  <button
                    onClick={handlePublishEvent}
                    disabled={isPublishing}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
                  >
                    {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publish to Topic
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-gray-950 text-gray-200 border border-gray-800 rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Topics & Consumer Groups Topology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Active Kafka Topics */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                Configured Message Topics
              </h3>

              <div className="space-y-3">
                {TOPICS.map(t => (
                  <div 
                    key={t.id}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className={`font-mono text-xs font-bold ${t.color}`}>{t.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {t.partitions} Partitions • Retention: {t.retention}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.partitions }).map((_, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded" title={`Partition ${i}`}>
                          P{i}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Subscribed Consumer Groups */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Active Consumer Groups
              </h3>

              <div className="space-y-3">
                {CONSUMER_GROUPS.map(cg => (
                  <div 
                    key={cg.id}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-white">{cg.name}</div>
                      <div className="text-[11px] text-purple-400 mt-0.5 font-mono">
                        Subscribed: {cg.subscribedTopic}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        {cg.status}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">{cg.processedCount} processed</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Message Stream Ledger */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-xl font-mono text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" /> Live Message Stream Ledger
              </span>
              <span className="text-gray-500 text-[11px]">Real-time append log</span>
            </div>

            <div className="space-y-2 mt-4 max-h-56 overflow-y-auto">
              {eventsLedger.map((evt) => (
                <div 
                  key={evt.id}
                  className="p-2.5 bg-gray-900/60 border border-gray-800/80 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">{evt.topic}</span>
                    <span className="text-gray-500">[P:{evt.partition} Off:{evt.offset}]</span>
                  </div>
                  <div className="text-gray-400 truncate max-w-xs">{evt.payload}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {evt.status}
                    </span>
                    <span className="text-[10px] text-gray-500">{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEAD LETTER QUEUE (DLQ) & RETRY POLICY */}
      {activeTab === 'dlq' && (
        <div className="space-y-6">
          {/* DLQ Configuration & Simulation Banner */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Fault Tolerance Simulator</span>
              <h3 className="text-base font-bold text-white mt-0.5">Dead Letter Queue (DLQ) & Exponential Retries</h3>
              <p className="text-xs text-gray-400 mt-1">
                Failing messages retry 3 times with exponential backoff before transferring to DLQ for diagnostic inspection.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer bg-gray-950 px-3 py-2 rounded-xl border border-gray-800">
                <input
                  type="checkbox"
                  checked={simulateConsumerDown}
                  onChange={(e) => setSimulateConsumerDown(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-0 bg-gray-800 border-gray-700"
                />
                <span className="font-semibold text-rose-300">Simulate Payment Service Down</span>
              </label>
            </div>
          </div>

          {/* DLQ Event Table */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-xl font-mono text-xs">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Unprocessed Poison Messages in DLQ ({dlqEvents.length})
            </h4>

            {dlqEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                All queues clear! Check "Simulate Payment Service Down" and publish an event to watch DLQ routing in action.
              </div>
            ) : (
              <div className="space-y-3">
                {dlqEvents.map(d => (
                  <div key={d.id} className="p-4 bg-gray-900/90 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 font-bold">{d.originTopic}</span>
                        <span className="text-gray-500">Attempts: {d.attempts}/3</span>
                      </div>
                      <div className="text-gray-400 text-[11px]">{d.lastError}</div>
                      <div className="text-gray-300 font-mono text-[11px] bg-gray-950 px-2 py-1 rounded max-w-md truncate">
                        {d.payload}
                      </div>
                    </div>

                    <button
                      onClick={() => handleReplayDlq(d.id)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Replay to Topic
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CIRCUIT BREAKER STATE MACHINE */}
      {activeTab === 'circuit' && (
        <div className="space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Resilience Pattern</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Circuit Breaker State Machine</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Prevents cascading system failure when a dependent microservice becomes unresponsive.
                </p>
              </div>

              {/* State Pill */}
              <div className={`px-5 py-2 rounded-2xl font-black text-sm tracking-wider font-mono border ${
                circuitState === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                circuitState === 'OPEN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                STATUS: {circuitState}
              </div>
            </div>

            {/* Tri-State Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border text-center space-y-2 ${
                circuitState === 'CLOSED' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-gray-950 border-gray-800 opacity-60'
              }`}>
                <div className="text-emerald-400 font-bold text-sm">1. CLOSED (Normal)</div>
                <p className="text-[11px] text-gray-400">All traffic permitted. Failure count monitored.</p>
              </div>

              <div className={`p-4 rounded-xl border text-center space-y-2 ${
                circuitState === 'OPEN' ? 'bg-rose-950/40 border-rose-500' : 'bg-gray-950 border-gray-800 opacity-60'
              }`}>
                <div className="text-rose-400 font-bold text-sm">2. OPEN (Tripped)</div>
                <p className="text-[11px] text-gray-400">Short-circuit: Fails fast immediately to protect resources.</p>
              </div>

              <div className={`p-4 rounded-xl border text-center space-y-2 ${
                circuitState === 'HALF-OPEN' ? 'bg-amber-950/40 border-amber-500' : 'bg-gray-950 border-gray-800 opacity-60'
              }`}>
                <div className="text-amber-400 font-bold text-sm">3. HALF-OPEN (Canary)</div>
                <p className="text-[11px] text-gray-400">Sends test probe requests to check downstream recovery.</p>
              </div>
            </div>

            {/* Controls */}
            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center gap-3">
              <button
                onClick={handleTripCircuit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <AlertOctagon className="w-3.5 h-3.5" /> Simulate Surge & Trip Breaker
              </button>
              <button
                onClick={handleProbeCircuit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Probe Canary (Half-Open)
              </button>
              <button
                onClick={handleResetCircuit}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Closed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
