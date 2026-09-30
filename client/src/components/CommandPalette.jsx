import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Binary,
  BookMarked,
  BookOpen,
  Box,
  Boxes,
  Brain,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Cloud,
  Code2,
  CornerDownLeft,
  Database,
  DollarSign,
  FileText,
  Flame,
  FolderGit2,
  Gauge,
  GitBranch,
  GitCommit,
  Globe,
  Headphones,
  LayoutDashboard,
  Layers,
  MapPin,
  MessagesSquare,
  Network,
  Palette,
  Play,
  Radio,
  Rocket,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Swords,
  Table,
  Terminal,
  Trophy,
  Users,
  X,
  Zap
} from "lucide-react";

export const COMMAND_ITEMS = [
  // Flagship Studios & Labs
  {
    id: "scale-hub",
    title: "Enterprise Scale & SRE Hub",
    category: "Flagship Studios",
    desc: "Consistent hashing ring, token bucket rate limiter, mTLS service mesh, and OpenTelemetry trace player.",
    path: "/scale-hub",
    icon: Server,
    color: "text-sky-500 bg-sky-50 dark:bg-sky-950/50",
    keywords: "consistent hash ring rate limiter token bucket opentelemetry mtls circuit breaker spiffe spire sre runbook incident postmortem saga crdt sharding stampede"
  },
  {
    id: "scale-saga",
    title: "Distributed Sagas & Idempotency Engine",
    category: "Flagship Studios",
    desc: "Compensating transactions state machine, 2PC alternatives, and RFC 9421 cryptographic Idempotency-Key validation.",
    path: "/scale-hub",
    icon: GitBranch,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "saga 2pc two phase commit compensating transaction rollback idempotency key deduplication outbox pattern"
  },
  {
    id: "scale-crdt",
    title: "Multi-Region Active-Active CRDTs",
    category: "Flagship Studios",
    desc: "Join-semilattice conflict resolution, vector clocks, and cross-Atlantic split-brain partition tolerance.",
    path: "/scale-hub",
    icon: Globe,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
    keywords: "crdt vector clocks multi region active active dynamo spanner split brain eventual consistency join semilattice"
  },
  {
    id: "scale-sharding",
    title: "Database Sharding & Scatter-Gather",
    category: "Flagship Studios",
    desc: "4-node horizontal partition router, MurmurHash3 point queries, fan-out scatter-gather latency, and zero-downtime resharding.",
    path: "/scale-hub",
    icon: Shuffle,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "database sharding horizontal partition scatter gather fanout murmurhash cdc dual write cutover"
  },
  {
    id: "scale-stampede",
    title: "Cache Stampede & XFetch Defense Lab",
    category: "Flagship Studios",
    desc: "Thundering herd 1,000 VU stress-test, distributed mutex locks, and probabilistic early expiration algorithm.",
    path: "/scale-hub",
    icon: Flame,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    keywords: "cache stampede thundering herd xfetch probabilistic early expiration redis redlock ttl dogpiling"
  },
  {
    id: "queue-studio",
    title: "Distributed Task Queue Studio",
    category: "Flagship Studios",
    desc: "Redis Streams BullMQ worker fleet, priority channels (VIP/Bulk), lease recovery, and DLQ replay.",
    path: "/queue-studio",
    icon: Boxes,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "queue task worker fleet bullmq celery redis streams dlq dead letter queue lease timeout stalled job"
  },
  {
    id: "iam-studio",
    title: "Zero-Trust IAM & OPA Policy Studio",
    category: "Flagship Studios",
    desc: "Multi-tenant tenant isolation, least-privilege RBAC/ABAC matrix, and Open Policy Agent Rego engine.",
    path: "/iam-studio",
    icon: ShieldCheck,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
    keywords: "iam zero trust rbac abac opa open policy agent rego least privilege fido2 mfa multi tenant authz"
  },
  {
    id: "event-sourcing",
    title: "Event Sourcing & CQRS Audit Studio",
    category: "Flagship Studios",
    desc: "Immutable append-only event ledger, optimistic concurrency, time-travel state reconstruction, and CQRS projections.",
    path: "/event-sourcing",
    icon: GitCommit,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50",
    keywords: "event sourcing cqrs event store time travel aggregate replay snapshot martin fowler greg young kafka cdc"
  },
  {
    id: "chaos-studio",
    title: "Chaos Engineering & Resilience Simulator",
    category: "Flagship Studios",
    desc: "Simian Army fault injection, packet loss, 503 cascades, circuit breaker tripping, and adaptive concurrency throttling.",
    path: "/chaos-studio",
    icon: Flame,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    keywords: "chaos monkey simian army toxiproxy fault injection packet loss latency jitter circuit breaker resilience"
  },
  {
    id: "tracing-studio",
    title: "Distributed Tracing & W3C Span Studio",
    category: "Flagship Studios",
    desc: "OpenTelemetry span waterfalls, critical path latency DAG analysis, and multi-hop RPC correlation.",
    path: "/tracing-studio",
    icon: Network,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50",
    keywords: "distributed tracing opentelemetry jaeger zipkin w3c traceparent span waterfall latency critical path"
  },
  {
    id: "canary-studio",
    title: "Canary Deployments & Feature Flags Studio",
    category: "Flagship Studios",
    desc: "Progressive multi-phase rollout (10/25/50/100%), automated watchdog rollback gates, and multivariate feature flags.",
    path: "/canary-studio",
    icon: GitBranch,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "canary deployment rollout launchdarkly unleash argo rollouts feature flags watchdog traffic split blast radius"
  },
  {
    id: "system-design",
    title: "System Design Arena",
    category: "Flagship Studios",
    desc: "Chaos Monkey fault injector, CAP/PACELC matrix, Uber/Twitter case studies, and QPS capacity calculator.",
    path: "/system-design",
    icon: Boxes,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-950/50",
    keywords: "chaos monkey cap pacelc tinyurl netflix whatsapp uber twitter rate limiter architecture topology"
  },
  {
    id: "interview",
    title: "AI Mock Interview Simulator",
    category: "Flagship Studios",
    desc: "Voice question reading (TTS), candidate webcam mirror HUD, STAR method rubric, and downloadable dossiers.",
    path: "/interview",
    icon: BrainCircuit,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50",
    keywords: "ai interview voice tts text to speech webcam mirror star method rubric speed drill dossier faang behavioral"
  },
  {
    id: "codelab",
    title: "Algorithmic Code Lab & Big-O",
    category: "Flagship Studios",
    desc: "In-browser algorithmic execution, static AST Big-O analysis, memory profiler, and test harness.",
    path: "/codelab",
    icon: Code2,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "two sum sliding window algorithms data structures big o complexity test runner javascript python"
  },
  {
    id: "docker-lab",
    title: "Docker & Kubernetes Studio",
    category: "Flagship Studios",
    desc: "Multi-stage Dockerfile layer builder, Compose fleet simulator, and HPA pod auto-scaling.",
    path: "/docker-lab",
    icon: Box,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
    keywords: "docker kubernetes k8s pods hpa dockerfile multi-stage container compose fleet yaml"
  },
  {
    id: "microservices-lab",
    title: "Microservices & Event Bus Lab",
    category: "Flagship Studios",
    desc: "Kafka pub/sub streaming, distributed saga orchestration, and circuit breaker health telemetry.",
    path: "/microservices-lab",
    icon: Radio,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
    keywords: "kafka event bus pubsub saga pattern event sourcing microservices grpc dead letter queue"
  },
  {
    id: "cicd-pipeline",
    title: "CI/CD Pipeline Simulator",
    category: "Flagship Studios",
    desc: "GitHub Actions workflow simulator, automated matrix testing, and canary blue/green deployments.",
    path: "/cicd-pipeline",
    icon: Rocket,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    keywords: "ci cd continuous integration deployment canary blue green automated testing build artifacts"
  },
  {
    id: "code-arena",
    title: "Code Arena (Live Duels)",
    category: "Flagship Studios",
    desc: "Real-time algorithmic speed races against competitive bot and human peer archetypes.",
    path: "/code-arena",
    icon: Swords,
    color: "text-red-500 bg-red-50 dark:bg-red-950/50",
    keywords: "code arena 1v1 duels algorithmic race multiplayer speed battle leetcode duel"
  },
  {
    id: "cloud-architect",
    title: "Cloud Infrastructure Architect",
    category: "Flagship Studios",
    desc: "AWS multi-region VPC design, ALB auto-scaling, RDS Aurora failover, and Terraform exporter.",
    path: "/cloud-architect",
    icon: Cloud,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "cloud aws vpc alb terraform aurora rds multi-region high availability architecture"
  },
  {
    id: "security-lab",
    title: "DevSecOps & Security Lab",
    category: "Flagship Studios",
    desc: "Zero Trust architecture, OWASP Top 10 defenses, JWT forgery attack analyzer, and RBAC matrix.",
    path: "/security-lab",
    icon: ShieldAlert,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50",
    keywords: "security devsecops zero trust owasp jwt sqli xss cors rbac encryption vulnerability"
  },
  {
    id: "query-lab",
    title: "SQL & Mongo Query Lab",
    category: "Flagship Studios",
    desc: "In-browser database studio with EXPLAIN query plan analyzer, index optimizer, and schema viewer.",
    path: "/query-lab",
    icon: Database,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-950/50",
    keywords: "sql postgresql mongodb explain analyze query optimizer b-tree index foreign keys aggregation"
  },
  {
    id: "erd-studio",
    title: "Database ERD Studio",
    category: "Flagship Studios",
    desc: "Visual relational database schema modeler with auto-generated SQL DDL migration scripts.",
    path: "/erd-studio",
    icon: Table,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    keywords: "erd entity relationship diagram schema modeling foreign keys ddl sql migrations tables"
  },
  {
    id: "load-tester",
    title: "Distributed Load Tester",
    category: "Flagship Studios",
    desc: "Traffic generator simulating thousands of concurrent virtual users, P99 latency curves, and HTTP 5xx spikes.",
    path: "/load-tester",
    icon: Gauge,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50",
    keywords: "load testing k6 stress testing rps concurrency p99 latency throughput bottleneck"
  },
  {
    id: "perf-audit",
    title: "Web Vitals & Performance Audit",
    category: "Flagship Studios",
    desc: "Lighthouse Core Web Vitals audit: LCP, FID, CLS, TTFB, and waterfall bundle visualizer.",
    path: "/perf-audit",
    icon: Zap,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "performance web vitals lcp cls fid ttfb lighthouse bundle size critical path"
  },
  {
    id: "design-system",
    title: "Design Systems & Token Studio",
    category: "Flagship Studios",
    desc: "Design tokens, color contrast calculator (WCAG AAA), and accessible UI component kit.",
    path: "/design-system",
    icon: Palette,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
    keywords: "design system tokens wcag accessibility typography colors components buttons ui ux"
  },
  {
    id: "api-tester",
    title: "REST API Client Studio",
    category: "Flagship Studios",
    desc: "In-browser HTTP sandbox: headers, payload editor, latency timing, status codes, and test collections.",
    path: "/api-tester",
    icon: Code2,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    keywords: "postman api tester rest http request get post put delete headers response status"
  },
  {
    id: "terminal-lab",
    title: "Git & UNIX Terminal Lab",
    category: "Flagship Studios",
    desc: "Practice Git branching, rebase, and merge conflicts with a real-time SVG visual commit graph.",
    path: "/terminal-lab",
    icon: Terminal,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "git branch merge rebase terminal bash unix shell commit graph cli"
  },
  {
    id: "regex-lab",
    title: "Regex Lab & Visualizer",
    category: "Flagship Studios",
    desc: "Regular expression pattern builder, syntax highlighter, capture group inspector, and cheat sheet.",
    path: "/regex-lab",
    icon: Binary,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50",
    keywords: "regex regular expression pattern match capture groups flags tokens validation"
  },

  // Learning & Pedagogy
  {
    id: "dashboard",
    title: "Main Dashboard",
    category: "Learning & Progress",
    desc: "High-level overview of enrolled courses, study goals, activity streaks, and active pipeline.",
    path: "/dashboard",
    icon: LayoutDashboard,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-950/50",
    keywords: "home dashboard overview metrics progress stats streak momentum"
  },
  {
    id: "courses",
    title: "Course Catalog & Curricula",
    category: "Learning & Progress",
    desc: "Structured, full-stack video and text curricula across React, Node, Kafka, and Cloud.",
    path: "/courses",
    icon: BookOpen,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-950/50",
    keywords: "courses catalog lessons react node typescript distributed systems cloud"
  },
  {
    id: "roadmaps",
    title: "Career Roadmaps & Skill Trees",
    category: "Learning & Progress",
    desc: "Tier-by-tier visual mastery roadmaps for MERN, System Architect, Cloud, and SRE.",
    path: "/roadmaps",
    icon: MapPin,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "roadmaps skill tree career path milestones fullstack devops architect"
  },
  {
    id: "certificates",
    title: "Cryptographic Certificates",
    category: "Learning & Progress",
    desc: "Verified student credentials with SHA-256 signatures, instant claim sandbox, and LinkedIn sharing.",
    path: "/certificates",
    icon: Award,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "certificates verify credentials claim diploma linkedin sha256 hash abhiraj yadav"
  },
  {
    id: "focus",
    title: "Deep Focus & Audio Station",
    category: "Learning & Progress",
    desc: "Customizable Pomodoro timer, native synthesized rain & white noise, and focus analytics.",
    path: "/focus",
    icon: Headphones,
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800",
    keywords: "focus pomodoro timer ambient sound rain binaural beats deep work productivity"
  },
  {
    id: "flashcards",
    title: "Smart Spaced Flashcards",
    category: "Learning & Progress",
    desc: "Active recall with Leitner spaced repetition for JavaScript quirks, React 18, and Big-O.",
    path: "/flashcards",
    icon: Brain,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    keywords: "flashcards spaced repetition leitner active recall revision study decks"
  },
  {
    id: "notes",
    title: "Study Notes & Cheat Sheets",
    category: "Learning & Progress",
    desc: "Personal engineering notes, architectural summaries, and code snippets.",
    path: "/notes",
    icon: BookMarked,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    keywords: "notes study notes cheat sheets bookmarks key takeaways markdown"
  },
  {
    id: "mind-gym",
    title: "Mind Gym Cognitive Trainer",
    category: "Learning & Progress",
    desc: "Mental agility drills: fast math, memory sprint, and pattern recognition for interview prep.",
    path: "/mind-gym",
    icon: BrainCircuit,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
    keywords: "mind gym mental math memory cognitive agility brain training speed drills"
  },
  {
    id: "study-buddy",
    title: "Study Buddy & Peer Pairing",
    category: "Learning & Progress",
    desc: "Connect with engineering peers, join study squads, and run collaborative mock sessions.",
    path: "/study-buddy",
    icon: Users,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
    keywords: "study buddy peer pairing study squad collaboration friends group study"
  },
  {
    id: "projects",
    title: "Capstone Projects Studio",
    category: "Learning & Progress",
    desc: "Production-grade portfolio projects: collaborative editor, task queue, and Stripe SaaS.",
    path: "/projects",
    icon: FolderGit2,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    keywords: "capstone projects studio portfolio real world apps fullstack github showcase"
  },

  // Career Acceleration
  {
    id: "resume-builder",
    title: "ATS Resume Studio",
    category: "Career Acceleration",
    desc: "Build ATS-optimized resumes with live keyword density check, tailored templates, and PDF export.",
    path: "/resume-builder",
    icon: FileText,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    keywords: "resume ats score cv builder templates export pdf keywords career jobs"
  },
  {
    id: "portfolio",
    title: "Live Developer Portfolio",
    category: "Career Acceleration",
    desc: "Shareable public profile showcasing verified skills, certificates, code streak, and projects.",
    path: "/portfolio",
    icon: Globe,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
    keywords: "portfolio profile public link resume showcase achievements public stats"
  },
  {
    id: "salary-radar",
    title: "Tech Salary & Leveling Radar",
    category: "Career Acceleration",
    desc: "FAANG & tier-1 startup compensation calculator: base pay, RSU equity vesting, and leveling benchmarks.",
    path: "/salary-radar",
    icon: DollarSign,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "salary radar levels tc total compensation base rsu stock options equity faang"
  },
  {
    id: "jobs",
    title: "Job Application Tracker",
    category: "Career Acceleration",
    desc: "Kanban pipeline tracking applications from Wishlist, Applied, Interviewing, to Offers.",
    path: "/jobs",
    icon: BriefcaseBusiness,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800",
    keywords: "jobs tracker applications pipeline kanban interviews offers salaries"
  },
  {
    id: "career",
    title: "AI Career Advisor",
    category: "Career Acceleration",
    desc: "Skill gap analysis, personalized roadmap recommendations, and recruiter cold outreach generation.",
    path: "/career",
    icon: Sparkles,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-950/50",
    keywords: "ai career advisor skill gap analysis cover letter recruiter cold email goals"
  },
  {
    id: "community",
    title: "Community Discussion Forum",
    category: "Community & Rewards",
    desc: "Ask technical questions, upvote high-quality answers, and share architectural tips.",
    path: "/community",
    icon: MessagesSquare,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
    keywords: "community forum discussions q&a peer help solutions answers upvote"
  },
  {
    id: "leaderboard",
    title: "Global Engineering Leaderboard",
    category: "Community & Rewards",
    desc: "Compete across 7 tiered leagues (Bronze to Legend), maintain streaks, and claim rewards.",
    path: "/leaderboard",
    icon: Trophy,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "leaderboard rankings leagues bronze gold legend rewards points streak"
  },
  {
    id: "achievements",
    title: "Achievements & Badges",
    category: "Community & Rewards",
    desc: "Unlock gamified milestone badges for completing courses, solving algorithms, and consistency.",
    path: "/achievements",
    icon: Award,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    keywords: "achievements badges milestones gamification medals trophies xp"
  },

  // Instant Quick Actions
  {
    id: "action-verify-cert",
    title: "Verify Credential Signature",
    category: "Quick Actions",
    desc: "Instant cryptographic lookup using certificate ID or SHA-256 verification hash.",
    path: "/certificates?verify=1",
    icon: ShieldCheck,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "verify certificate signature hash check authentication valid"
  },
  {
    id: "action-speed-drill",
    title: "Start FAANG 90s Speed Drill",
    category: "Quick Actions",
    desc: "Launch high-pressure 90-second mock interview question with countdown timer.",
    path: "/interview",
    icon: Zap,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    keywords: "fast mock interview drill countdown practice questions"
  },
  {
    id: "action-token-bucket",
    title: "Simulate 500k QPS Token Bucket",
    category: "Quick Actions",
    desc: "Visualize distributed rate limiter refill dynamics and RFC-compliant HTTP 429 response.",
    path: "/scale-hub",
    icon: Gauge,
    color: "text-sky-500 bg-sky-50 dark:bg-sky-950/50",
    keywords: "token bucket rate limiter burst capacity rps test traffic"
  },
  {
    id: "action-chaos-fault",
    title: "Inject Chaos Monkey DB Sever Fault",
    category: "Quick Actions",
    desc: "Simulate sudden database connection loss and trigger automated circuit breaker trip.",
    path: "/system-design",
    icon: AlertTriangle,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
    keywords: "chaos monkey fault injection break database test resilience"
  },
  {
    id: "action-two-sum",
    title: "Solve Two Sum in Code Lab",
    category: "Quick Actions",
    desc: "Open Two Sum algorithm with Hash Map starter code and O(N) AST analysis.",
    path: "/codelab",
    icon: Play,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    keywords: "solve two sum hash map code test run leetcode"
  }
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  // Handle keyboard events inside palette
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        navigate(filtered[selectedIndex].path);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search size={20} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search across all 43+ studios, labs, algorithms & tools (e.g. SRE, STAR, Two Sum, Docker)..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mr-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <kbd className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-2xl p-3 text-left transition ${
                      isSelected
                        ? "bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-200 dark:bg-brand-950/60 dark:text-brand-100 dark:ring-brand-800"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl flex-shrink-0 ${item.color}`}>
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 flex-shrink-0">
                      {isSelected ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-100/70 dark:bg-brand-900/50 px-2 py-1 rounded-lg">
                          Jump <CornerDownLeft size={12} />
                        </span>
                      ) : (
                        <ArrowRight size={14} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No matching studios or tools found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching for &quot;Kafka&quot;, &quot;Docker&quot;, &quot;Two Sum&quot;, &quot;Certificate&quot;, or &quot;Rate Limiter&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">esc</kbd> Dismiss
            </span>
          </div>
          <span className="font-semibold text-slate-400">
            {filtered.length} features available
          </span>
        </div>
      </div>
    </div>
  );
}
