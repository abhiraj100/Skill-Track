import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";

export default function PortfolioView() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const capstoneSubmissions = (() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_capstone_submissions")) || {};
    } catch {
      return {};
    }
  })();

  const solvedChallenges = (() => {
    try {
      return JSON.parse(localStorage.getItem("skilltrack_solved_challenges")) || {};
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    Promise.all([
      api.get("/certificates").catch(() => ({ data: { certificates: [] } })),
      api.get("/courses/mine").catch(() => ({ data: { enrollments: [] } }))
    ]).then(([certsRes, enrollRes]) => {
      setCertificates(certsRes.data.certificates || []);
      setEnrollments(enrollRes.data.enrollments || []);
      setLoading(false);
    });
  }, []);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Public portfolio link copied to clipboard!");
  };

  const printResume = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <span className="badge bg-brand-50 text-brand-700 font-bold">Public Developer Profile</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Live Developer Portfolio</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={copyShareLink} className="btn-secondary text-xs">
            <Share2 size={14} /> Share Link
          </button>
          <button onClick={printResume} className="btn-primary text-xs">
            <Printer size={14} /> Print / Export PDF Resume
          </button>
        </div>
      </div>

      {/* Portfolio Card Container */}
      <div className="card overflow-hidden border-slate-200 shadow-xl print:border-none print:shadow-none">
        {/* Cover / Banner */}
        <div className="h-40 bg-gradient-to-r from-brand-700 via-indigo-700 to-teal-700 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-slate-900 text-3xl font-extrabold text-white shadow-lg">
              {user?.name?.slice(0, 2).toUpperCase() || "DEV"}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-8 pt-16 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">{user?.name}</h2>
              <p className="mt-1 text-base font-semibold text-brand-600">{user?.careerGoal || "Fullstack Engineer"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Verified SkillTrack Member</span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="badge bg-emerald-50 text-emerald-700 font-bold py-1 px-3">
                Open to Opportunities
              </span>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Technical Skill Set</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(user?.skills || ["React", "JavaScript", "TypeScript", "Node.js", "Express.js", "MongoDB", "REST APIs", "Git", "System Design"]).map((s) => (
                <span key={s} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Certificates */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              Verified Credentials & Certificates ({certificates.length})
            </h3>
            {certificates.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {certificates.map((cert) => (
                  <div key={cert._id} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{cert.courseTitle}</span>
                      <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">Verified ✓</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Issued on {new Date(cert.issueDate).toLocaleDateString()} by {cert.instructor}</p>
                    <p className="font-mono text-[10px] text-slate-400">Certificate ID: {cert.certificateId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
                Actively pursuing course mastery. Complete 100% of any enrolled course to showcase verified credentials here.
              </div>
            )}
          </div>

          {/* Capstone Projects */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Code2 size={16} className="text-brand-600" />
              Featured Capstone Projects ({Object.keys(capstoneSubmissions).length})
            </h3>
            {Object.keys(capstoneSubmissions).length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(capstoneSubmissions).map(([projectId, sub]) => (
                  <div key={projectId} className="rounded-2xl border border-slate-200 p-4 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900 capitalize">{projectId.replace("-", " ")}</h4>
                    <p className="text-[11px] text-slate-500">Verified submission on {sub.submittedAt}</p>
                    <div className="flex gap-3 pt-1 text-xs text-brand-600 font-semibold">
                      <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                        <Github size={13} /> Source Code
                      </a>
                      {sub.demoUrl && (
                        <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                          <ExternalLink size={13} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
                Capstone portfolio submissions in progress in the Projects Studio.
              </div>
            )}
          </div>

          {/* Education & Training Tracks */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GraduationCap size={16} className="text-indigo-600" />
              Continuous Learning & Coursework
            </h3>
            <div className="mt-3 space-y-2">
              {enrollments.slice(0, 3).map((e) => (
                <div key={e._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{e.course.title}</p>
                    <p className="text-[11px] text-slate-400">{e.course.category} · {e.course.difficulty}</p>
                  </div>
                  <span className="font-mono font-bold text-brand-600">{e.progress}% Progress</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
