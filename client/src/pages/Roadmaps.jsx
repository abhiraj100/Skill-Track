import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  ExternalLink,
  Layers,
  MapPin,
  Sparkles,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProgressBar } from "../components/ui";

const ROADMAPS = {
  mern: {
    title: "Full-Stack MERN Architect",
    badge: "Most Popular",
    desc: "From JavaScript core to distributed MERN applications with modern state and cloud deployments.",
    color: "from-cyan-600 to-blue-700",
    tiers: [
      {
        tier: "Tier 1: Foundations",
        description: "Core programming and web protocols",
        nodes: [
          {
            id: "js-core",
            title: "Modern JavaScript (ES6+)",
            category: "Language",
            desc: "Closures, prototypes, async/await, event loop, and immutable data patterns.",
            checklist: ["Master arrow functions & destructuring", "Understand Promises and async/await", "Deep dive into JS Event Loop"],
            courseId: null
          },
          {
            id: "git-github",
            title: "Git & Version Control",
            category: "Tooling",
            desc: "Branching strategies, rebasing, pull requests, resolving merge conflicts, and release tagging.",
            checklist: ["Feature branching workflow", "Interactive rebasing", "Squashing commits"],
            courseId: null
          }
        ]
      },
      {
        tier: "Tier 2: Frontend Engineering",
        description: "Declarative UIs and predictive state",
        nodes: [
          {
            id: "react-core",
            title: "React Fundamentals & Hooks",
            category: "Frontend",
            desc: "Component lifecycle, useState, useEffect, custom hooks, and JSX rendering mechanics.",
            checklist: ["Building reusable custom hooks", "Optimizing effect dependency arrays", "Controlled vs uncontrolled forms"],
            courseId: "mern-foundations"
          },
          {
            id: "state-mgmt",
            title: "State Management & Routing",
            category: "Frontend",
            desc: "React Router, Redux Toolkit or Zustand, and server caching with React Query.",
            checklist: ["Configuring Redux slices", "Client-side nested routing", "Optimistic UI mutations"],
            courseId: "adv-react"
          },
          {
            id: "tailwind-css",
            title: "Tailwind CSS & Design Systems",
            category: "Design",
            desc: "Utility-first design tokens, responsive breakpoints, dark mode, and micro-animations.",
            checklist: ["Configuring custom theme colors", "Accessible contrast ratios", "Responsive layouts"],
            courseId: null
          }
        ]
      },
      {
        tier: "Tier 3: Backend & Persistence",
        description: "Scalable APIs and data design",
        nodes: [
          {
            id: "express-apis",
            title: "Node.js & Express REST APIs",
            category: "Backend",
            desc: "Middleware pipelines, controllers, routing, error handling, and request validation.",
            checklist: ["Global error middleware", "Input validation with Joi/Zod", "Rate limiting and CORS configuration"],
            courseId: "node-api"
          },
          {
            id: "mongodb-mongoose",
            title: "MongoDB Schema Design & Mongoose",
            category: "Database",
            desc: "Document modeling, indexing strategies, aggregation pipelines, and transactions.",
            checklist: ["Designing compound indexes", "Writing aggregation pipelines", "ACID multi-document transactions"],
            courseId: "mern-foundations"
          }
        ]
      },
      {
        tier: "Tier 4: Security & Scalability",
        description: "Hardening production apps",
        nodes: [
          {
            id: "jwt-auth",
            title: "JWT & Role-Based Auth (RBAC)",
            category: "Security",
            desc: "Stateless authentication, refresh tokens, password hashing with bcrypt, and role guards.",
            checklist: ["Implementing HttpOnly refresh cookies", "Token expiry rotation", "Role-based route authorization"],
            courseId: "node-api"
          },
          {
            id: "docker-deploy",
            title: "Docker & Cloud Deployment",
            category: "DevOps",
            desc: "Containerizing MERN services, multi-stage builds, reverse proxies (Nginx), and CI/CD.",
            checklist: ["Writing optimized Dockerfiles", "Deploying to Render or AWS ECS", "Configuring SSL and domain routing"],
            courseId: null
          }
        ]
      }
    ]
  },
  frontend: {
    title: "React & Modern Frontend Architect",
    badge: "High Demand",
    desc: "Deep dive into frontend performance, rendering patterns, accessibility, and architectural design.",
    color: "from-brand-600 to-indigo-700",
    tiers: [
      {
        tier: "Tier 1: JavaScript & TypeScript Mastery",
        description: "Types and runtime behavior",
        nodes: [
          {
            id: "ts-basics",
            title: "TypeScript Generics & Types",
            category: "Language",
            desc: "Type inference, discriminated unions, generic constraints, and utility types.",
            checklist: ["Generics with React props", "Utility types: Partial, Pick, Omit", "Strict type checking"],
            courseId: null
          }
        ]
      },
      {
        tier: "Tier 2: React Architecture",
        description: "Fiber, rendering and state",
        nodes: [
          {
            id: "react-internals",
            title: "React Fiber & VDOM Diffing",
            category: "Core React",
            desc: "Understanding concurrent features, useTransition, useDeferredValue, and render phase vs commit phase.",
            checklist: ["Profiling renders with React DevTools", "Preventing unnecessary re-renders", "Concurrent UI updates"],
            courseId: "adv-react"
          }
        ]
      }
    ]
  },
  backend: {
    title: "Backend Cloud & Microservices",
    badge: "Enterprise",
    desc: "High-throughput APIs, message queues, distributed caching, and microservice architectures.",
    color: "from-emerald-600 to-teal-800",
    tiers: [
      {
        tier: "Tier 1: Architecture & Data",
        description: "Clean architecture and caching",
        nodes: [
          {
            id: "clean-arch",
            title: "Clean API Architecture",
            category: "Design",
            desc: "Repository patterns, service layer separation, dependency injection, and decoupled domain logic.",
            checklist: ["Decoupling business logic from framework", "Domain-driven design basics", "Unit testing controllers"],
            courseId: "node-api"
          },
          {
            id: "redis-caching",
            title: "Redis In-Memory Caching",
            category: "Performance",
            desc: "Key eviction strategies, session stores, rate limiting, and pub/sub message brokers.",
            checklist: ["Cache-aside pattern", "Setting TTLs effectively", "Handling cache stampedes"],
            courseId: null
          }
        ]
      }
    ]
  }
};

export default function Roadmaps() {
  const [activeRoadmapKey, setActiveRoadmapKey] = useState("mern");
  const [masteredNodes, setMasteredNodes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_mastered_nodes")) || {};
    } catch {
      return {};
    }
  });
  const [activeModalNode, setActiveModalNode] = useState(null);

  const roadmap = ROADMAPS[activeRoadmapKey];

  // Calculate total nodes and mastered count
  const allNodes = roadmap.tiers.flatMap((t) => t.nodes);
  const totalCount = allNodes.length;
  const masteredCount = allNodes.filter((n) => masteredNodes[n.id]).length;
  const progressPercent = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;

  const toggleMastery = (id) => {
    setMasteredNodes((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem("skilltrack_mastered_nodes", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${roadmap.color} p-6 text-white shadow-xl sm:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Visual Learning Pathways</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{roadmap.title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">{roadmap.desc}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold text-white/70">Pathway Mastery</p>
            <p className="mt-1 text-4xl font-extrabold">{progressPercent}%</p>
            <p className="mt-1 text-xs text-white/80">
              {masteredCount} of {totalCount} milestones completed
            </p>
          </div>
        </div>
      </section>

      {/* Pathway Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROADMAPS).map(([key, r]) => {
          const isActive = key === activeRoadmapKey;
          return (
            <button
              key={key}
              onClick={() => setActiveRoadmapKey(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers size={16} />
              {r.title.split(" ")[0]}
              <span className="text-xs font-normal opacity-70">({r.badge})</span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>Overall Roadmap Progress</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      {/* Visual Roadmap Tiers */}
      <div className="space-y-8">
        {roadmap.tiers.map((tier, tierIdx) => (
          <div key={tierIdx} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700">
                0{tierIdx + 1}
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{tier.tier}</h2>
                <p className="text-xs text-slate-500">{tier.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tier.nodes.map((node) => {
                const isMastered = Boolean(masteredNodes[node.id]);
                return (
                  <div
                    key={node.id}
                    className={`card group relative flex flex-col justify-between p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      isMastered ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="badge bg-slate-100 text-[11px] font-semibold text-slate-600">
                          {node.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMastery(node.id);
                          }}
                          className={`rounded-lg p-1 transition ${
                            isMastered ? "text-emerald-600" : "text-slate-300 hover:text-slate-500"
                          }`}
                          title={isMastered ? "Mark as Incomplete" : "Mark as Mastered"}
                        >
                          {isMastered ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                      </div>
                      <h3 className="mt-3 font-bold text-slate-900">{node.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{node.desc}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setActiveModalNode(node)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        Explore Concepts <ChevronRight size={14} />
                      </button>
                      {isMastered && (
                        <span className="text-[11px] font-bold text-emerald-600">Mastered ✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Node Detail Modal */}
      {activeModalNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg space-y-5 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge bg-brand-50 text-brand-700">{activeModalNode.category}</span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{activeModalNode.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalNode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-600">{activeModalNode.desc}</p>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Core Objectives</h4>
              <ul className="mt-2 space-y-2 text-xs text-slate-700">
                {activeModalNode.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 text-brand-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  toggleMastery(activeModalNode.id);
                  setActiveModalNode(null);
                }}
                className={`btn-primary text-xs ${
                  masteredNodes[activeModalNode.id] ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                {masteredNodes[activeModalNode.id] ? "Mark as Incomplete" : "Mark as Mastered ✓"}
              </button>

              <Link to="/courses" className="text-xs font-semibold text-brand-600 hover:underline">
                Find Related Course →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
