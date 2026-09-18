import { useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FolderGit2,
  Github,
  Globe,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal
} from "lucide-react";
import toast from "react-hot-toast";
import { ProgressBar } from "../components/ui";

const CAPSTONE_PROJECTS = [
  {
    id: "collab-editor",
    title: "Real-Time Collaborative Document Canvas",
    difficulty: "Advanced",
    stack: ["React", "WebSockets", "Node.js", "Redis"],
    tagline: "Google Docs / Notion style multi-user live editing with presence indicators and conflict resolution.",
    description: "Build an end-to-end real-time collaborative workspace. Multiple users can edit documents simultaneously, see each other's live cursor selections, and sync state without desynchronization.",
    milestones: [
      { id: "m1", title: "WebSocket Gateway & Room Management", desc: "Setup socket namespaces and room join/leave protocols in Express." },
      { id: "m2", title: "User Presence & Ephemeral Cursors", desc: "Broadcast cursor coordinates and active user color badges via Redis Pub/Sub." },
      { id: "m3", title: "Conflict Resolution / Operational Sync", desc: "Implement character diffing or last-write-wins delta syncing to prevent data loss." },
      { id: "m4", title: "Document Persistence & Auto-Save", desc: "Debounce automatic database writes to MongoDB without blocking real-time socket delivery." }
    ]
  },
  {
    id: "task-queue",
    title: "Distributed Event-Driven Task Queue",
    difficulty: "Advanced",
    stack: ["Node.js", "Redis", "Worker Threads", "Express"],
    tagline: "High-throughput asynchronous job processor with concurrency limits and exponential backoff.",
    description: "Design a production background job processing engine similar to BullMQ or Celery. Handle heavy workloads like PDF generation, video encoding, and bulk email notifications safely outside the HTTP request lifecycle.",
    milestones: [
      { id: "m1", title: "Redis Atomic Job Queueing", desc: "Push jobs to Redis lists and sets using atomic Lua scripts." },
      { id: "m2", title: "Worker Fleet & Concurrency Controls", desc: "Spawn dedicated Node.js worker processes that pull and execute jobs concurrently." },
      { id: "m3", title: "Exponential Backoff & Dead Letter Queue (DLQ)", desc: "Automatically retry failed network tasks with jitter; push terminal failures to DLQ for inspection." },
      { id: "m4", title: "Live Real-Time Monitoring Dashboard", desc: "Expose job metrics (active, completed, failed, latency) to an admin dashboard." }
    ]
  },
  {
    id: "saas-platform",
    title: "Full-Stack SaaS Platform with Stripe Billing",
    difficulty: "Intermediate",
    stack: ["React", "Express", "Stripe API", "MongoDB"],
    tagline: "Production multi-tenant SaaS application with subscription tiers and secure webhook handling.",
    description: "Build a complete B2B SaaS web application featuring team workspaces, role-based access control (Owner, Editor, Viewer), Stripe checkout billing, and webhook signature verification.",
    milestones: [
      { id: "m1", title: "Multi-Tenant Workspace Architecture", desc: "Design MongoDB schemas associating team members, permissions, and workspace slugs." },
      { id: "m2", title: "Stripe Subscriptions & Customer Portal", desc: "Integrate Stripe Checkout sessions and self-serve billing cancellation." },
      { id: "m3", title: "Cryptographic Webhook Handlers", desc: "Verify stripe-signature headers to reliably handle invoice.payment_succeeded." },
      { id: "m4", title: "Role-Based Route Authorization", desc: "Protect sensitive admin operations using Express middleware guards." }
    ]
  }
];

export default function ProjectsStudio() {
  const [selectedProject, setSelectedProject] = useState(CAPSTONE_PROJECTS[0]);
  const [completedMilestones, setCompletedMilestones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_capstone_milestones")) || {};
    } catch {
      return {};
    }
  });

  const [submissions, setSubmissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_capstone_submissions")) || {};
    } catch {
      return {};
    }
  });

  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const toggleMilestone = (milestoneId) => {
    setCompletedMilestones((prev) => {
      const updated = { ...prev, [milestoneId]: !prev[milestoneId] };
      localStorage.setItem("skilltrack_capstone_milestones", JSON.stringify(updated));
      return updated;
    });
  };

  const activeProjectCompletedCount = selectedProject.milestones.filter(
    (m) => completedMilestones[m.id]
  ).length;
  const activeProgress = Math.round(
    (activeProjectCompletedCount / selectedProject.milestones.length) * 100
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return toast.error("Please provide your GitHub repository URL");

    const submissionData = {
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl.trim(),
      submittedAt: new Date().toLocaleDateString()
    };

    const updated = { ...submissions, [selectedProject.id]: submissionData };
    setSubmissions(updated);
    localStorage.setItem("skilltrack_capstone_submissions", JSON.stringify(updated));
    toast.success("Capstone submitted for review! Portfolio badge unlocked 🚀");
  };

  const isSubmitted = Boolean(submissions[selectedProject.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <FolderGit2 size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Production Portfolio Capstones</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Guided Capstone Projects Studio</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Build impressive portfolio pieces that recruiters and engineering managers love. Each capstone includes complete architectural specs, milestones, and verification checks.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <Award size={24} className="text-amber-300" />
            <div>
              <p className="text-xs text-slate-300">Submitted Capstones</p>
              <p className="text-xl font-bold">{Object.keys(submissions).length} / {CAPSTONE_PROJECTS.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Project Selector List */}
        <div className="space-y-3">
          <div className="card p-3 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-2">Available Projects</p>
            {CAPSTONE_PROJECTS.map((p) => {
              const isSelected = selectedProject.id === p.id;
              const hasSubmitted = Boolean(submissions[p.id]);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`w-full rounded-xl p-3 text-left transition ${
                    isSelected
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-600">{p.difficulty}</span>
                    {hasSubmitted && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 size={12} /> Submitted
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-bold text-xs text-slate-900 line-clamp-1">{p.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.stack.slice(0, 3).map((s) => (
                      <span key={s} className="badge bg-slate-100 text-[9px] text-slate-500">
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Project Details & Milestones */}
        <div className="space-y-5">
          <div className="card p-6 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="badge bg-brand-50 text-brand-700 font-bold">{selectedProject.difficulty} Capstone</span>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedProject.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedProject.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.stack.map((tech) => (
                  <span key={tech} className="badge bg-slate-100 text-slate-700 text-xs font-semibold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900">Project Overview</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{selectedProject.description}</p>
            </div>

            {/* Milestones Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Milestone Progress ({activeProgress}%)</h3>
                <span className="text-xs text-slate-500">{activeProjectCompletedCount} / {selectedProject.milestones.length} Done</span>
              </div>
              <ProgressBar value={activeProgress} />

              <div className="mt-4 space-y-2.5">
                {selectedProject.milestones.map((m, idx) => {
                  const isDone = Boolean(completedMilestones[m.id]);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(m.id)}
                      className={`cursor-pointer rounded-2xl border p-4 text-xs transition flex items-start gap-3 ${
                        isDone ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`grid h-5 w-5 place-items-center rounded-lg border shrink-0 mt-0.5 ${
                        isDone ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isDone && "✓"}
                      </span>
                      <div className="flex-1">
                        <p className={`font-bold ${isDone ? "text-emerald-900" : "text-slate-800"}`}>
                          Phase {idx + 1}: {m.title}
                        </p>
                        <p className="mt-0.5 text-slate-500 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Portal */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Rocket size={16} className="text-brand-600" />
                Submit Project For Portfolio Verification
              </div>

              {isSubmitted ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Project Successfully Submitted!
                  </p>
                  <p>GitHub Repository: <a href={submissions[selectedProject.id].githubUrl} target="_blank" rel="noreferrer" className="underline font-mono">{submissions[selectedProject.id].githubUrl}</a></p>
                  {submissions[selectedProject.id].demoUrl && (
                    <p>Live Demo: <a href={submissions[selectedProject.id].demoUrl} target="_blank" rel="noreferrer" className="underline font-mono">{submissions[selectedProject.id].demoUrl}</a></p>
                  )}
                  <p className="text-[11px] text-emerald-600 pt-1">Badge awarded on your public developer portfolio.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Github size={13} /> GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/your-username/my-project"
                      className="input mt-1 py-2 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Globe size={13} /> Live Deployment URL (Vercel / Render)
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://my-project.vercel.app"
                      className="input mt-1 py-2 text-xs"
                    />
                  </div>

                  <button type="submit" className="btn-primary text-xs px-5 py-2.5">
                    Submit Capstone Project
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
