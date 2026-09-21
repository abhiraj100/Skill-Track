import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Play, CheckCircle2, XCircle, Clock, Terminal, 
  FileCode, ShieldCheck, Box, Server, Rocket, Sparkles, 
  RotateCcw, Download, Copy, AlertTriangle, Check
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'stage_1', name: 'Checkout Repo', cmd: 'actions/checkout@v4', duration: '2s', icon: GitBranch, log: 'Cloning into /home/runner/work/skilltrack...\nHEAD is now at a1b2c3d "feat: production microservices v2.5"' },
  { id: 'stage_2', name: 'Node.js & Cache', cmd: 'actions/setup-node@v4', duration: '3s', icon: Box, log: 'Resolved node 20.12.0 from cache\nRestoring ~/.npm cache from hash: 8f92ab1c (CACHE HIT)' },
  { id: 'stage_3', name: 'Lint & Style', cmd: 'npm run lint', duration: '5s', icon: CheckCircle2, log: 'eslint --ext .js,.jsx src/\n✔ 0 errors, 0 warnings found\nPrettier formatting validated across 142 files.' },
  { id: 'stage_4', name: 'Unit & E2E Tests', cmd: 'npm test -- --ci', duration: '8s', icon: Terminal, log: 'PASS src/__tests__/auth.test.js\nPASS src/__tests__/api.test.js\nPASS src/__tests__/systemDesign.test.js\nTest Suites: 8 passed, 8 total\nTests: 48 passed, 48 total\nCoverage: 94.2% statements' },
  { id: 'stage_5', name: 'Security Scan', cmd: 'aquasecurity/trivy-action', duration: '4s', icon: ShieldCheck, log: 'Scanning container filesystem for CVEs...\nDetected dependencies: 342\nTotal vulnerabilities: 0 CRITICAL, 0 HIGH, 2 LOW (accepted)\nSecurity gate passed with code 0.' },
  { id: 'stage_6', name: 'Docker Build & Push', cmd: 'docker/build-push-action@v5', duration: '12s', icon: Box, log: 'Building image skilltrack/app:v2.5\nStep 1/8 : FROM node:20-alpine\n---> Using cache 4b91f1a\nPushing image to ghcr.io/skilltrack/app:v2.5 (digest: sha256:7e8a9f)' },
  { id: 'stage_7', name: 'Deploy to Staging', cmd: 'kubectl apply -k ./k8s/staging', duration: '6s', icon: Server, log: 'deployment.apps/skilltrack-api configured\nservice/skilltrack-api unchanged\nWaiting for deployment rollout to finish: 3 of 3 updated replicas are available...' },
  { id: 'stage_8', name: 'Canary Production', cmd: 'helm upgrade --install canary', duration: '7s', icon: Rocket, log: 'Initiating 10% canary traffic rollout...\nTraffic metrics: 0% 5xx errors, P99 latency: 18ms\nPromoting to 100% stable production rollout complete!' }
];

const DEFAULT_YAML = `name: Production CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Code Quality & Lint
        run: npm run lint

      - name: Execute Automated Test Suite
        run: npm test -- --ci --coverage

      - name: Vulnerability & Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/skilltrack/api:latest

      - name: Deploy Kubernetes Manifests
        run: kubectl apply -k ./k8s/production
`;

export default function CicdPipeline() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'yaml'
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(PIPELINE_STAGES.length - 1);
  const [selectedStage, setSelectedStage] = useState(PIPELINE_STAGES[3]);
  const [yamlContent, setYamlContent] = useState(DEFAULT_YAML);
  const [copied, setCopied] = useState(false);

  // Trigger simulated pipeline run
  const handleTriggerPipeline = () => {
    setIsRunning(true);
    setCurrentStepIdx(0);
    setSelectedStage(PIPELINE_STAGES[0]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < PIPELINE_STAGES.length) {
        setCurrentStepIdx(step);
        setSelectedStage(PIPELINE_STAGES[step]);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1400);
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-indigo-950/60 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/30">
              <Rocket className="w-3.5 h-3.5" /> Automated Delivery
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              CI/CD Pipeline & GitHub Actions Studio
            </h1>
            <p className="text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Experience modern GitOps and automated software delivery. Trigger simulated multi-stage DAG pipelines, monitor live step execution, inspect build logs, and craft production GitHub Actions workflows.
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Pipeline Status</div>
              <div className="text-base font-bold text-white font-mono">Run #842 - Passed</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> Total Duration: 47s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Rocket className="w-4 h-4" /> Live DAG Runner ({PIPELINE_STAGES.length} Stages)
        </button>
        <button
          onClick={() => setActiveTab('yaml')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'yaml'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" /> Workflow YAML Editor (.github/workflows)
        </button>
      </div>

      {/* TAB 1: VISUAL DAG RUNNER */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl">
                Commit: <code>a1b2c3d</code> (main)
              </span>
              <span className="text-xs text-gray-400">Trigger: <code className="text-gray-300">push</code></span>
            </div>

            <button
              onClick={handleTriggerPipeline}
              disabled={isRunning}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Trigger Pipeline (git push main)
                </>
              )}
            </button>
          </div>

          {/* Horizontal DAG Stages Flow */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              Directed Acyclic Graph (DAG) Execution Flow
            </h3>

            <div className="flex items-center min-w-[900px] gap-2">
              {PIPELINE_STAGES.map((stage, idx) => {
                const StageIcon = stage.icon;
                const isCurrent = isRunning && currentStepIdx === idx;
                const isPassed = !isRunning || currentStepIdx > idx;
                const isPending = isRunning && currentStepIdx < idx;
                const isSelected = selectedStage.id === stage.id;

                return (
                  <React.Fragment key={stage.id}>
                    <div
                      onClick={() => setSelectedStage(stage)}
                      className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                        isSelected ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-gray-800'
                      } ${
                        isCurrent ? 'bg-amber-500/10 border-amber-500/50' :
                        isPassed ? 'bg-gray-950/80 hover:border-gray-700' :
                        'bg-gray-950/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1.5">
                        {isCurrent ? (
                          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                        ) : isPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <StageIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{stage.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{stage.duration}</div>
                    </div>

                    {idx < PIPELINE_STAGES.length - 1 && (
                      <div className={`h-0.5 w-4 ${isPassed ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Console Logs Viewer */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Stage Logs: {selectedStage.name}</span>
                <span className="text-gray-500 text-[11px]">({selectedStage.cmd})</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Duration: {selectedStage.duration}
              </span>
            </div>

            <div className="p-3 bg-gray-900/60 rounded-xl mt-3 text-gray-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {selectedStage.log}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: YAML WORKFLOW EDITOR */}
      {activeTab === 'yaml' && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
            <span className="font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" /> .github/workflows/production-ci.yml
            </span>

            <button
              onClick={handleCopyYaml}
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied YAML!' : 'Copy Workflow'}
            </button>
          </div>

          <textarea
            rows={18}
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            className="w-full bg-gray-900/80 text-emerald-300 font-mono text-xs p-4 rounded-xl border border-gray-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
