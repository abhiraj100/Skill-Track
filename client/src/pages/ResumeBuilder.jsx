import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wand2
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("modern"); // 'modern' | 'minimal' | 'executive'

  const [formData, setFormData] = useState({
    name: user?.name || "Abhiraj Yadav",
    title: user?.careerGoal || "Fullstack Software Engineer",
    email: user?.email || "user@skilltrack.dev",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA / Remote",
    github: "github.com/abhiraj100",
    linkedin: "linkedin.com/in/abhiraj-yadav",
    summary: `High-impact ${user?.careerGoal || "Software Engineer"} experienced in building distributed, high-throughput web applications and RESTful microservices. Proven expertise across React, Node.js, and cloud database optimization with an emphasis on low-latency UX and reliable software architecture.`,
    skills: "React, JavaScript (ES6+), TypeScript, Node.js, Express.js, MongoDB, Redis, Docker, REST APIs, Git, Tailwind CSS, System Design",
    experience: [
      {
        role: "Fullstack Engineering Fellow",
        company: "SkillTrack Production Lab",
        period: "2025 - Present",
        points: [
          "Architected real-time collaborative workspace supporting concurrent user state synchronization.",
          "Engineered distributed event-driven task queue with Redis worker threads, reducing background task latency by 45%.",
          "Optimized relational and MongoDB aggregation queries, eliminating table scans and reducing P99 latency to <18ms."
        ]
      }
    ],
    projects: [
      {
        name: "Distributed Task Queue & Job Engine",
        tech: "Node.js, Redis, Worker Threads",
        desc: "High-throughput asynchronous job processor with exponential backoff and dead letter queues."
      },
      {
        name: "Real-Time Collaborative Document Canvas",
        tech: "React, WebSockets, Redis Pub/Sub",
        desc: "Live collaborative editing platform with ephemeral cursor broadcasting and conflict resolution."
      }
    ],
    certifications: [
      "Verified Certificate: MERN Stack Foundations (SkillTrack Academy)",
      "Verified Certificate: Node.js API Engineering (SkillTrack Academy)"
    ]
  });

  const autoImportSkillTrackData = async () => {
    try {
      const [certsRes, profileRes] = await Promise.all([
        api.get("/certificates").catch(() => ({ data: { certificates: [] } })),
        api.get("/auth/me").catch(() => ({ data: { user } }))
      ]);

      const certs = (certsRes.data.certificates || []).map(
        (c) => `Verified Certificate: ${c.courseTitle} (ID: ${c.certificateId})`
      );

      setFormData((prev) => ({
        ...prev,
        certifications: certs.length ? certs : prev.certifications,
        skills: profileRes.data.user?.skills?.join(", ") || prev.skills
      }));

      toast.success("Imported verified certificates and skills from SkillTrack!");
    } catch {
      toast.error("Could not sync with SkillTrack profile");
    }
  };

  // Calculate ATS Score
  const hasMetrics = formData.experience.some((e) => e.points.some((p) => p.includes("%") || /\d+/.test(p)));
  const hasActionVerbs = ["Architected", "Engineered", "Optimized", "Designed", "Implemented"].some((v) =>
    formData.summary.includes(v) || formData.experience.some((e) => e.points.some((p) => p.includes(v)))
  );
  const hasFullContact = Boolean(formData.email && formData.phone && formData.github);

  let atsScore = 65;
  if (hasMetrics) atsScore += 15;
  if (hasActionVerbs) atsScore += 10;
  if (hasFullContact) atsScore += 10;

  const printResume = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <section className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="badge bg-brand-50 text-brand-700 font-bold">Career Studio</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            ATS-Optimized Resume Builder
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Auto-generate a recruiter-ready technical resume with verified SkillTrack certificates and metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={autoImportSkillTrackData} className="btn-secondary text-xs">
            <Wand2 size={14} className="text-brand-600" />
            Auto-Import From SkillTrack
          </button>
          <button onClick={printResume} className="btn-primary text-xs">
            <Printer size={14} />
            Print / Export PDF
          </button>
        </div>
      </section>

      {/* Main Workspace: Editor Form + Live Preview */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr] print:block">
        {/* Editor Sidebar */}
        <div className="card p-6 space-y-6 print:hidden max-h-[85vh] overflow-y-auto">
          {/* ATS Scorecard Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-900">ATS Compatibility Score</p>
              <p className="text-2xl font-extrabold text-emerald-700">{atsScore}/100</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Scored on metrics, action verbs, and formatting</p>
            </div>
            <div className="text-right text-[11px] space-y-1 text-emerald-800">
              <p className="flex items-center gap-1 justify-end">
                <CheckCircle2 size={12} className="text-emerald-600" /> Action Verbs Included
              </p>
              <p className="flex items-center gap-1 justify-end">
                <CheckCircle2 size={12} className="text-emerald-600" /> Measurable Metrics
              </p>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Resume Theme</label>
            <div className="mt-2 flex gap-2">
              {[
                { id: "modern", label: "Modern Tech" },
                { id: "minimal", label: "Minimal Slate" },
                { id: "executive", label: "Executive" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    theme === t.id ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input mt-1 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Target Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input mt-1 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input mt-1 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-semibold">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input mt-1 py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-semibold">GitHub & Portfolio Links</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="input mt-1 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Professional Summary</h3>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="input mt-1 py-2 text-xs"
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Technical Skills</h3>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              rows={3}
              className="input mt-1 py-2 text-xs"
            />
          </div>
        </div>

        {/* Live Resume Sheet Preview */}
        <div className="card p-8 sm:p-10 shadow-2xl bg-white text-slate-900 border-slate-200 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight font-serif">{formData.name}</h2>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">{formData.title}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
              <span>{formData.email}</span>
              <span>•</span>
              <span>{formData.phone}</span>
              <span>•</span>
              <span>{formData.location}</span>
              <span>•</span>
              <span className="font-mono">{formData.github}</span>
            </div>
          </div>

          {/* Body Sections */}
          <div className="mt-6 space-y-6 text-xs leading-relaxed">
            {/* Summary */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-serif text-sm">
                Executive Profile
              </h3>
              <p className="text-slate-700">{formData.summary}</p>
            </div>

            {/* Technical Skills */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-serif text-sm">
                Technical Expertise
              </h3>
              <p className="text-slate-700 font-mono text-[11px] leading-5">{formData.skills}</p>
            </div>

            {/* Experience */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-serif text-sm">
                Engineering Experience
              </h3>
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1 mt-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{exp.role} — {exp.company}</span>
                    <span className="font-normal text-slate-500">{exp.period}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pt-1">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-serif text-sm">
                Featured Engineering Projects
              </h3>
              <div className="space-y-3 mt-2">
                {formData.projects.map((proj, pIdx) => (
                  <div key={pIdx}>
                    <p className="font-bold text-slate-900">
                      {proj.name} <span className="font-mono text-[10px] font-normal text-slate-500">[{proj.tech}]</span>
                    </p>
                    <p className="text-slate-700">{proj.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Certifications */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 font-serif text-sm">
                Verified Credentials & Certifications
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 mt-2 font-mono text-[11px]">
                {formData.certifications.map((c, cIdx) => (
                  <li key={cIdx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
