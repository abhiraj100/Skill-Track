import React, { useState } from 'react';
import { 
  Layers, Box, Server, Play, Square, RotateCcw, AlertTriangle, 
  CheckCircle2, Terminal, Cpu, HardDrive, RefreshCw, Sparkles, 
  ExternalLink, ArrowRight, ShieldCheck, Activity, Database, Network
} from 'lucide-react';

const DOCKERFILE_LAYERS = [
  { id: 1, cmd: 'FROM node:20-alpine AS base', desc: 'Minimal Alpine Linux base OS with Node runtime', size: '128 MB', cached: true, type: 'base' },
  { id: 2, cmd: 'WORKDIR /app', desc: 'Create and set isolated container working directory', size: '0 B', cached: true, type: 'config' },
  { id: 3, cmd: 'COPY package*.json ./', desc: 'Copy package manifests for layer-cached dependencies', size: '42 KB', cached: true, type: 'copy' },
  { id: 4, cmd: 'RUN npm ci --only=production', desc: 'Deterministic dependency install without devDeps', size: '84 MB', cached: false, type: 'build' },
  { id: 5, cmd: 'COPY . .', desc: 'Copy application source code into image', size: '14 MB', cached: false, type: 'copy' },
  { id: 6, cmd: 'EXPOSE 5000', desc: 'Document container listening port binding', size: '0 B', cached: true, type: 'config' },
  { id: 7, cmd: 'USER node', desc: 'Drop root privileges for container security hardness', size: '0 B', cached: true, type: 'security' },
  { id: 8, cmd: 'CMD ["node", "src/server.js"]', desc: 'Default executable process inside container', size: '0 B', cached: true, type: 'cmd' }
];

const INITIAL_CONTAINERS = [
  { 
    id: 'c_nginx', 
    name: 'edge-reverse-proxy', 
    image: 'nginx:1.25-alpine', 
    ports: '80:80, 443:443', 
    status: 'running', 
    uptime: '14m', 
    cpu: '0.8%', 
    mem: '18 MB', 
    network: 'app-tier',
    role: 'SSL Termination & Rate Limiting'
  },
  { 
    id: 'c_api', 
    name: 'skilltrack-api', 
    image: 'skilltrack-api:v2.5', 
    ports: '5000:5000', 
    status: 'running', 
    uptime: '14m', 
    cpu: '3.2%', 
    mem: '142 MB', 
    network: 'app-tier',
    role: 'Express Microservices Backend'
  },
  { 
    id: 'c_redis', 
    name: 'redis-cache-broker', 
    image: 'redis:7.2-alpine', 
    ports: '6379:6379', 
    status: 'running', 
    uptime: '14m', 
    cpu: '1.1%', 
    mem: '32 MB', 
    network: 'app-tier',
    role: 'In-Memory Cache & Token Store'
  },
  { 
    id: 'c_pg', 
    name: 'postgres-primary-db', 
    image: 'postgres:16-alpine', 
    ports: '5432:5432', 
    status: 'running', 
    uptime: '14m', 
    cpu: '2.4%', 
    mem: '98 MB', 
    network: 'app-tier',
    role: 'Relational ACID Data Storage'
  }
];

export default function DockerLab() {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'dockerfile' | 'k8s'
  const [containers, setContainers] = useState(INITIAL_CONTAINERS);
  const [selectedContainer, setSelectedContainer] = useState(INITIAL_CONTAINERS[1]);
  const [hpaTrafficLoad, setHpaTrafficLoad] = useState(35); // 0 to 100%
  const [logs, setLogs] = useState([
    '[docker-compose] Creating network "app-tier" with driver "bridge"',
    '[docker-compose] Volume "pg_data" created',
    '[c_pg] database system is ready to accept connections on port 5432',
    '[c_redis] Ready to accept connections tcp: 6379',
    '[c_api] SkillTrack API listening on 0.0.0.0:5000 (MongoDB & Redis connected)',
    '[c_nginx] Configuration reloaded. Reverse proxy routing to http://c_api:5000'
  ]);

  // Calculate HPA Pods
  // 0-20% = 2 pods, 21-40% = 3 pods, 41-60% = 5 pods, 61-80% = 7 pods, 81-100% = 10 pods
  const podCount = hpaTrafficLoad <= 20 ? 2 :
                   hpaTrafficLoad <= 40 ? 3 :
                   hpaTrafficLoad <= 60 ? 5 :
                   hpaTrafficLoad <= 80 ? 8 : 10;

  const handleStartContainer = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'running' } : c));
    addLog(`[${id}] Container started (HEALTHY)`);
  };

  const handleStopContainer = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'stopped', cpu: '0%', mem: '0 MB' } : c));
    addLog(`[${id}] SIGTERM received. Graceful shutdown complete (EXIT 0)`);
  };

  const handleRestartContainer = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'restarting' } : c));
    addLog(`[${id}] Restarting container...`);
    setTimeout(() => {
      setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'running' } : c));
      addLog(`[${id}] Healthcheck passed. Container listening.`);
    }, 1200);
  };

  const handleInjectFault = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'unhealthy', cpu: '99.4%' } : c));
    addLog(`⚠️ [${id}] CRITICAL: Healthcheck failed! Uncaught Exception: OutOfMemory (OOMKilled)`);
  };

  const handleRestartAll = () => {
    setContainers(INITIAL_CONTAINERS);
    addLog('[docker-compose] All containers restarted cleanly.');
  };

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 30)]);
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-500/30">
              <Box className="w-3.5 h-3.5" /> Cloud-Native Infrastructure
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Docker & Kubernetes Container Studio
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Build production multi-stage Dockerfiles, orchestrate multi-service Compose fleets, inject container faults, and watch Kubernetes Horizontal Pod Autoscaling (HPA) adapt to traffic in real-time.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Active Engine</div>
              <div className="text-base font-bold text-white font-mono">Docker 26.1 & K8s v1.30</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> 4/4 Services Healthy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'compose'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Network className="w-4 h-4" /> Docker Compose Fleet ({containers.length})
        </button>
        <button
          onClick={() => setActiveTab('dockerfile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'dockerfile'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Multi-Stage Dockerfile Builder
        </button>
        <button
          onClick={() => setActiveTab('k8s')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'k8s'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Kubernetes HPA Autoscaler ({podCount} Pods)
        </button>
      </div>

      {/* TAB 1: DOCKER COMPOSE FLEET SIMULATOR */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl">
                docker-compose.yml (v3.9)
              </span>
              <span className="text-xs text-gray-400">Network: <code className="text-gray-300">app-tier (bridge)</code></span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleRestartAll}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium border border-gray-700 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restart Fleet
              </button>
              <button
                onClick={() => handleInjectFault('c_api')}
                className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/40 transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Inject OOM Crash
              </button>
            </div>
          </div>

          {/* Container Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {containers.map((c) => {
              const isRunning = c.status === 'running';
              const isUnhealthy = c.status === 'unhealthy';
              const isRestarting = c.status === 'restarting';
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContainer(c)}
                  className={`bg-gray-900/80 border rounded-2xl p-5 cursor-pointer transition-all shadow-xl relative overflow-hidden ${
                    selectedContainer.id === c.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{c.role}</span>
                      <h3 className="text-base font-bold text-white mt-1">{c.name}</h3>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{c.image}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      isRunning ? 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse' :
                      isUnhealthy ? 'bg-rose-500 shadow-md shadow-rose-500/50 animate-ping' :
                      isRestarting ? 'bg-amber-400 animate-spin' :
                      'bg-gray-600'
                    }`} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400 font-mono">
                      <span>Status:</span>
                      <span className={`font-bold uppercase ${
                        isRunning ? 'text-emerald-400' : 
                        isUnhealthy ? 'text-rose-400' : 
                        isRestarting ? 'text-amber-400' : 'text-gray-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-mono">
                      <span>Ports:</span>
                      <span className="text-gray-200">{c.ports}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-mono">
                      <span>CPU / Mem:</span>
                      <span className="text-gray-200">{c.cpu} / {c.mem}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between gap-1.5">
                    {isRunning ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStopContainer(c.id); }}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[11px] font-medium flex items-center gap-1"
                      >
                        <Square className="w-3 h-3 text-rose-400" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartContainer(c.id); }}
                        className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg text-[11px] font-medium flex items-center gap-1 border border-emerald-500/40"
                      >
                        <Play className="w-3 h-3 text-emerald-400" /> Start
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRestartContainer(c.id); }}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[11px] font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-blue-400" /> Restart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Compose Log Output */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-gray-400">
              <span className="flex items-center gap-2 text-white font-bold">
                <Terminal className="w-4 h-4 text-blue-400" /> Container Stdout & Health Logs
              </span>
              <span className="text-[11px] text-gray-500">Live Tail -n 50</span>
            </div>
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto text-gray-300">
              {logs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed ${
                  log.includes('⚠️') ? 'text-rose-400 font-bold' :
                  log.includes('started') || log.includes('passed') ? 'text-emerald-300' : 'text-gray-400'
                }`}>
                  <span className="text-gray-600 mr-2">{new Date().toISOString().substring(11, 19)}</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCKERFILE BUILDER & LAYER INSPECTOR */}
      {activeTab === 'dockerfile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Dockerfile Editor */}
          <div className="lg:col-span-7 bg-gray-950 border border-gray-800 rounded-2xl p-5 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" /> production.Dockerfile
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Multi-Stage Build (Target Size: 226 MB)
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {DOCKERFILE_LAYERS.map((layer) => (
                <div 
                  key={layer.id}
                  className="p-3 bg-gray-900/70 border border-gray-800/80 rounded-xl hover:border-blue-500/50 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-blue-300 font-bold">{layer.cmd}</div>
                    <div className="text-[11px] text-gray-400 font-sans">{layer.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
                      {layer.size}
                    </span>
                    <div className="text-[10px] mt-1 text-gray-500">
                      {layer.cached ? '⚡ CACHE HIT' : '🔄 REBUILD'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Optimization Insights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Image Size Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Base Alpine OS (node:20)</span>
                    <span className="font-mono">128 MB (56%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[56%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Production node_modules (npm ci)</span>
                    <span className="font-mono">84 MB (37%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[37%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>App Source & Assets</span>
                    <span className="font-mono">14 MB (7%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[7%]"></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-800 space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Best Practice Guardrails
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  ✓ Non-root user directive enabled (<code>USER node</code>)<br/>
                  ✓ Manifest caching avoids rebuilding dependencies on source code changes<br/>
                  ✓ Dev dependencies excluded via <code>--only=production</code> flag
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KUBERNETES HPA AUTOSCALING */}
      {activeTab === 'k8s' && (
        <div className="space-y-6">
          {/* Traffic Controller Slider */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">HPA Cluster Controller</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Horizontal Pod Autoscaler (HPA) Live Simulation</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Drag incoming traffic load. When average CPU exceeds 60%, the Kubernetes controller automatically scales deployment replicas.
                </p>
              </div>

              <div className="bg-gray-950 border border-gray-800 px-4 py-2.5 rounded-xl text-right">
                <div className="text-[11px] text-gray-400 font-mono">Current Replicas</div>
                <div className="text-2xl font-black text-blue-400 font-mono">{podCount} / 10 Pods</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-300 font-mono">
                <span>Simulated Request Load: {hpaTrafficLoad}%</span>
                <span>Avg Pod CPU: {Math.min(Math.round(hpaTrafficLoad * 1.1), 95)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={hpaTrafficLoad}
                onChange={(e) => setHpaTrafficLoad(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                <span>5k QPS (Baseline: 2 pods)</span>
                <span>50k QPS (Spike threshold)</span>
                <span>120k QPS (Max: 10 pods)</span>
              </div>
            </div>
          </div>

          {/* Pods Grid */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-400" />
              Active Kubernetes Deployment Pods (Namespace: <code>production</code>)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Array.from({ length: podCount }).map((_, i) => (
                <div 
                  key={i}
                  className="bg-gray-950 border border-blue-500/40 rounded-xl p-4 text-center space-y-2 relative shadow-lg"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto animate-pulse"></div>
                  <div className="font-mono text-xs font-bold text-white truncate">api-pod-{Math.random().toString(16).substring(2, 6)}</div>
                  <div className="text-[11px] text-gray-400">Node: worker-0{i % 3 + 1}</div>
                  <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded py-0.5 font-mono">
                    Ready 1/1
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
