import { useState } from "react";
import {
  BrainCircuit,
  Check,
  Copy,
  FileText,
  Loader2,
  Mail,
  Send,
  Sparkles,
  Target,
  UploadCloud
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";
import { SuccessRow } from "../components/ui";

function parse(value) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

export default function Career() {
  const { user } = useAuth();
  const [tab, setTab] = useState("skills");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [job, setJob] = useState("");

  // Cover Letter & Outreach state
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState(user?.careerGoal || "Fullstack Engineer");
  const [tone, setTone] = useState("Professional & Confident");
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  async function analyzeSkills() {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/skill-gap", {
        careerGoal: user?.careerGoal,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean)
      });
      setResult(parse(data.result));
    } catch (e) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeResume() {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/resume-analysis", { text: resumeText });
      setResult(parse(data.result));
    } catch (e) {
      toast.error(e.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function matchJob() {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/job-match", { resume: resumeText, jobDescription: job });
      setResult(parse(data.result));
    } catch (e) {
      toast.error("Matching failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateOutreach() {
    if (!companyName.trim()) return toast.error("Please enter the company name");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/cover-letter", {
        candidateName: user?.name || "Candidate",
        careerGoal: user?.careerGoal || "Software Engineer",
        skills: user?.skills || skills.split(",").map((s) => s.trim()).filter(Boolean),
        companyName,
        jobTitle,
        jobDescription: job,
        tone
      });
      setResult(parse(data.result));
      toast.success("Outreach materials generated!");
    } catch (e) {
      toast.error("Outreach generation failed");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "letter") {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
            <BrainCircuit />
          </div>
          <div>
            <h1 className="section-title">AI Career Assistant</h1>
            <p className="mt-1 text-sm text-slate-500">
              Turn your current skills into actionable career moves, resume optimization, and high-converting outreach.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="card space-y-1 p-3">
          <button
            onClick={() => { setTab("skills"); setResult(null); }}
            className={`w-full rounded-xl p-3 text-left text-sm font-semibold transition ${
              tab === "skills" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Target className="mr-2 inline" size={17} />
            Skill-gap analysis
          </button>
          <button
            onClick={() => { setTab("resume"); setResult(null); }}
            className={`w-full rounded-xl p-3 text-left text-sm font-semibold transition ${
              tab === "resume" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileText className="mr-2 inline" size={17} />
            Resume analyzer
          </button>
          <button
            onClick={() => { setTab("match"); setResult(null); }}
            className={`w-full rounded-xl p-3 text-left text-sm font-semibold transition ${
              tab === "match" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BrainCircuit className="mr-2 inline" size={17} />
            Job match
          </button>
          <button
            onClick={() => { setTab("outreach"); setResult(null); }}
            className={`w-full rounded-xl p-3 text-left text-sm font-semibold transition ${
              tab === "outreach" ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Mail className="mr-2 inline" size={17} />
            Cover Letter & Cold Email
          </button>
        </div>

        <div className="space-y-5">
          <div className="card p-5 sm:p-7">
            {tab === "skills" && (
              <>
                <h2 className="text-xl font-bold">Find your skill gaps</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Target: <strong>{user?.careerGoal}</strong>
                </p>
                <label className="mt-6 block text-sm font-semibold">Your skills</label>
                <textarea
                  className="input mt-2 min-h-32"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, JavaScript, Node.js, MongoDB..."
                />
                <button
                  disabled={loading}
                  onClick={analyzeSkills}
                  className="btn-primary mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={17} />}
                  Analyze my skills
                </button>
              </>
            )}

            {tab === "resume" && (
              <>
                <h2 className="text-xl font-bold">Resume analyzer</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Paste resume text for structured scoring, strengths, and keyword suggestions.
                </p>
                <textarea
                  className="input mt-6 min-h-56"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                />
                <button
                  disabled={loading}
                  onClick={analyzeResume}
                  className="btn-primary mt-4"
                >
                  <UploadCloud size={17} />
                  {loading ? "Analyzing..." : "Analyze resume"}
                </button>
              </>
            )}

            {tab === "match" && (
              <>
                <h2 className="text-xl font-bold">Match your resume to a job</h2>
                <textarea
                  className="input mt-6 min-h-36"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume text..."
                />
                <textarea
                  className="input mt-3 min-h-36"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="Paste the job description..."
                />
                <button
                  disabled={loading}
                  onClick={matchJob}
                  className="btn-primary mt-4"
                >
                  <Target size={17} />
                  {loading ? "Matching..." : "Check match"}
                </button>
              </>
            )}

            {tab === "outreach" && (
              <>
                <h2 className="text-xl font-bold">AI Cover Letter & Cold Email Generator</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Generate hyper-tailored application materials matching your skills to any target role.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, Airbnb, Google"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Target Role Title</label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-700">Outreach Tone</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Professional & Confident", "Enthusiastic & Growth-Minded", "Direct & Technical"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          tone === t
                            ? "bg-brand-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-700">
                    Job Description snippet (optional, enhances tailoring)
                  </label>
                  <textarea
                    className="input mt-1 min-h-24"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="Paste key responsibilities or requirements..."
                  />
                </div>

                <button
                  disabled={loading}
                  onClick={generateOutreach}
                  className="btn-primary mt-5"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                  {loading ? "Crafting outreach..." : "Generate Cover Letter & InMail"}
                </button>
              </>
            )}
          </div>

          {result && <Result result={result} tab={tab} onCopy={copyToClipboard} copiedLetter={copiedLetter} copiedEmail={copiedEmail} />}
        </div>
      </div>
    </div>
  );
}

function Result({ result, tab, onCopy, copiedLetter, copiedEmail }) {
  return (
    <div className="card space-y-6 p-5 sm:p-7 animate-in fade-in">
      {tab === "skills" && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-600">Career readiness</p>
              <p className="mt-1 text-4xl font-extrabold">{result.score}%</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600">
              <Target />
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Strengths</h3>
              <div className="mt-3 space-y-2">
                {(result.strengths || []).map((x) => (
                  <SuccessRow key={x}>{x}</SuccessRow>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Skills to improve</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(result.gaps || []).map((x) => (
                  <span key={x} className="badge bg-orange-50 text-orange-700">
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-7">
            <h3 className="font-bold">Suggested roadmap</h3>
            <div className="mt-3 space-y-3">
              {(result.roadmap || []).map((x) => (
                <div key={x.order} className="rounded-xl border border-slate-100 p-4">
                  <span className="text-xs font-bold text-brand-600">STEP {x.order}</span>
                  <p className="mt-1 font-semibold">{x.skill}</p>
                  <p className="mt-1 text-sm text-slate-500">{x.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "resume" && (
        <>
          <p className="text-sm font-semibold text-brand-600">Resume score</p>
          <p className="mt-1 text-4xl font-extrabold">{result.score}/100</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Strengths</h3>
              <div className="mt-3 space-y-2">
                {(result.strengths || []).map((x) => (
                  <SuccessRow key={x}>{x}</SuccessRow>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Improvements</h3>
              <div className="mt-3 space-y-2">
                {(result.improvements || []).map((x) => (
                  <div className="text-sm text-slate-600" key={x}>
                    • {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-bold">Keywords</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(result.keywords || []).map((x) => (
                <span className="badge bg-slate-100 text-slate-600" key={x}>
                  {x}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "match" && (
        <>
          <p className="text-sm font-semibold text-brand-600">Job match</p>
          <p className="mt-1 text-4xl font-extrabold">{result.match}%</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Matched skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(result.matched || []).map((x) => (
                  <span className="badge bg-emerald-50 text-emerald-700" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Missing skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(result.missing || []).map((x) => (
                  <span className="badge bg-orange-50 text-orange-700" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {result.recommendation}
          </div>
        </>
      )}

      {tab === "outreach" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Tailored Cover Letter</h3>
              <button
                onClick={() => onCopy(result.coverLetter, "letter")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copiedLetter ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedLetter ? "Copied" : "Copy Letter"}
              </button>
            </div>
            <div className="mt-3 whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800">
              {result.coverLetter}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Direct Recruiter Cold Email / InMail</h3>
              <button
                onClick={() => onCopy(result.coldEmail, "email")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedEmail ? "Copied" : "Copy InMail"}
              </button>
            </div>
            <div className="mt-3 whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-relaxed text-slate-800">
              {result.coldEmail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
