import { useState } from "react";
import { BrainCircuit, FileText, Loader2, Target, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";
import { SuccessRow } from "../components/ui";

function parse(value) {
  try { return JSON.parse(value); } catch { return null; }
}

export default function Career() {
  const { user } = useAuth();
  const [tab,setTab] = useState("skills");
  const [skills,setSkills] = useState(user?.skills?.join(", ") || "");
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [resumeText,setResumeText] = useState("");
  const [job,setJob] = useState("");

  async function analyzeSkills() {
    setLoading(true);
    try { const {data}=await api.post("/ai/skill-gap",{careerGoal:user?.careerGoal,skills:skills.split(",").map(s=>s.trim()).filter(Boolean)}); setResult(parse(data.result)); }
    catch(e){toast.error("Analysis failed")}
    finally{setLoading(false)}
  }

  async function analyzeResume() {
    setLoading(true);
    try { const {data}=await api.post("/ai/resume-analysis",{text:resumeText}); setResult(parse(data.result)); }
    catch(e){toast.error(e.response?.data?.message||"Analysis failed")}
    finally{setLoading(false)}
  }

  async function matchJob() {
    setLoading(true);
    try { const {data}=await api.post("/ai/job-match",{resume:resumeText,jobDescription:job}); setResult(parse(data.result)); }
    catch(e){toast.error("Matching failed")}
    finally{setLoading(false)}
  }

  return <div className="space-y-6">
    <section><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><BrainCircuit/></div><div><h1 className="section-title">AI Career Assistant</h1><p className="mt-1 text-sm text-slate-500">Turn your current skills into an actionable roadmap.</p></div></div></section>
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="card p-3"><button onClick={()=>setTab("skills")} className={`w-full rounded-xl p-3 text-left text-sm font-semibold ${tab==="skills"?"bg-brand-50 text-brand-700":"text-slate-600"}`}><Target className="mr-2 inline" size={17}/>Skill-gap analysis</button><button onClick={()=>setTab("resume")} className={`w-full rounded-xl p-3 text-left text-sm font-semibold ${tab==="resume"?"bg-brand-50 text-brand-700":"text-slate-600"}`}><FileText className="mr-2 inline" size={17}/>Resume analyzer</button><button onClick={()=>setTab("match")} className={`w-full rounded-xl p-3 text-left text-sm font-semibold ${tab==="match"?"bg-brand-50 text-brand-700":"text-slate-600"}`}><BrainCircuit className="mr-2 inline" size={17}/>Job match</button></div>

      <div className="space-y-5">
        <div className="card p-5 sm:p-7">
          {tab==="skills" && <><h2 className="text-xl font-bold">Find your skill gaps</h2><p className="mt-1 text-sm text-slate-500">Target: <strong>{user?.careerGoal}</strong></p><label className="mt-6 block text-sm font-semibold">Your skills</label><textarea className="input mt-2 min-h-32" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, JavaScript, Node.js, MongoDB..." /><button disabled={loading} onClick={analyzeSkills} className="btn-primary mt-4">{loading?<Loader2 className="animate-spin"/>:<BrainCircuit size={17}/>}Analyze my skills</button></>}
          {tab==="resume" && <><h2 className="text-xl font-bold">Resume analyzer</h2><p className="mt-1 text-sm text-slate-500">Paste resume text for a structured review. File upload can be connected to object storage later.</p><textarea className="input mt-6 min-h-56" value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste your resume text here..." /><button disabled={loading} onClick={analyzeResume} className="btn-primary mt-4"><UploadCloud size={17}/>{loading?"Analyzing...":"Analyze resume"}</button></>}
          {tab==="match" && <><h2 className="text-xl font-bold">Match your resume to a job</h2><textarea className="input mt-6 min-h-40" value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste resume text..." /><textarea className="input mt-3 min-h-40" value={job} onChange={e=>setJob(e.target.value)} placeholder="Paste the job description..." /><button disabled={loading} onClick={matchJob} className="btn-primary mt-4"><Target size={17}/>{loading?"Matching...":"Check match"}</button></>}
        </div>

        {result && <Result result={result} tab={tab}/>}
      </div>
    </div>
  </div>
}

function Result({result,tab}) {
  return <div className="card p-5 sm:p-7">
    {tab==="skills" && <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-brand-600">Career readiness</p><p className="mt-1 text-4xl font-extrabold">{result.score}%</p></div><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><Target/></div></div><div className="mt-6 grid gap-6 md:grid-cols-2"><div><h3 className="font-bold">Strengths</h3><div className="mt-3 space-y-2">{(result.strengths||[]).map(x=><SuccessRow key={x}>{x}</SuccessRow>)}</div></div><div><h3 className="font-bold">Skills to improve</h3><div className="mt-3 flex flex-wrap gap-2">{(result.gaps||[]).map(x=><span key={x} className="badge bg-orange-50 text-orange-700">{x}</span>)}</div></div></div><div className="mt-7"><h3 className="font-bold">Suggested roadmap</h3><div className="mt-3 space-y-3">{(result.roadmap||[]).map(x=><div key={x.order} className="rounded-xl border border-slate-100 p-4"><span className="text-xs font-bold text-brand-600">STEP {x.order}</span><p className="mt-1 font-semibold">{x.skill}</p><p className="mt-1 text-sm text-slate-500">{x.reason}</p></div>)}</div></div></>}
    {tab==="resume" && <><p className="text-sm font-semibold text-brand-600">Resume score</p><p className="mt-1 text-4xl font-extrabold">{result.score}/100</p><div className="mt-6 grid gap-6 md:grid-cols-2"><div><h3 className="font-bold">Strengths</h3><div className="mt-3 space-y-2">{(result.strengths||[]).map(x=><SuccessRow key={x}>{x}</SuccessRow>)}</div></div><div><h3 className="font-bold">Improvements</h3><div className="mt-3 space-y-2">{(result.improvements||[]).map(x=><div className="text-sm text-slate-600" key={x}>• {x}</div>)}</div></div></div><div className="mt-6"><h3 className="font-bold">Keywords</h3><div className="mt-3 flex flex-wrap gap-2">{(result.keywords||[]).map(x=><span className="badge bg-slate-100 text-slate-600" key={x}>{x}</span>)}</div></div></>}
    {tab==="match" && <><p className="text-sm font-semibold text-brand-600">Job match</p><p className="mt-1 text-4xl font-extrabold">{result.match}%</p><div className="mt-6 grid gap-6 md:grid-cols-2"><div><h3 className="font-bold">Matched skills</h3><div className="mt-3 flex flex-wrap gap-2">{(result.matched||[]).map(x=><span className="badge bg-emerald-50 text-emerald-700" key={x}>{x}</span>)}</div></div><div><h3 className="font-bold">Missing skills</h3><div className="mt-3 flex flex-wrap gap-2">{(result.missing||[]).map(x=><span className="badge bg-orange-50 text-orange-700" key={x}>{x}</span>)}</div></div></div><div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{result.recommendation}</div></>}
  </div>
}
