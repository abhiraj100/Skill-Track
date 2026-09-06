import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";

export function Login() {
  const [values, setValues] = useState({ email: "user@skilltrack.dev", password: "User@123" });
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try { await login(values); toast.success("Welcome back!"); navigate("/dashboard"); }
    catch (e) { toast.error(e.response?.data?.message || "Login failed"); }
  }

  return <AuthShell title="Welcome back" subtitle="Continue building your skills and career.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><input className="input" type="email" value={values.email} onChange={e => setValues({...values,email:e.target.value})}/></Field>
      <Field label="Password"><div className="relative"><input className="input pr-11" type={show?"text":"password"} value={values.password} onChange={e => setValues({...values,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-3 text-slate-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>
      <button className="btn-primary w-full">Sign in</button>
      <p className="text-center text-sm text-slate-500">New here? <Link className="font-semibold text-brand-600" to="/register">Create an account</Link></p>
    </form>
  </AuthShell>;
}

export function Register() {
  const [values, setValues] = useState({ name:"", email:"", password:"", careerGoal:"MERN Stack Developer" });
  const { register } = useAuth();
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    try { await register(values); toast.success("Account created!"); navigate("/dashboard"); }
    catch (e) { toast.error(e.response?.data?.message || "Registration failed"); }
  }
  return <AuthShell title="Create your account" subtitle="Build a learning path around your career goal.">
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name"><input required className="input" value={values.name} onChange={e=>setValues({...values,name:e.target.value})}/></Field>
      <Field label="Email"><input required className="input" type="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})}/></Field>
      <Field label="Career goal"><select className="input" value={values.careerGoal} onChange={e=>setValues({...values,careerGoal:e.target.value})}><option>MERN Stack Developer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Software Engineer</option></select></Field>
      <Field label="Password"><input required minLength="6" className="input" type="password" value={values.password} onChange={e=>setValues({...values,password:e.target.value})}/></Field>
      <button className="btn-primary w-full">Create account</button>
      <p className="text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-brand-600" to="/login">Sign in</Link></p>
    </form>
  </AuthShell>;
}

function Field({label,children}) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label> }

function AuthShell({title,subtitle,children}) {
 return <div className="grid min-h-screen lg:grid-cols-2">
  <div className="hidden bg-gradient-to-br from-brand-800 via-brand-700 to-mint p-12 text-white lg:flex lg:flex-col lg:justify-between">
    <Link to="/login" className="flex items-center gap-2 font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Sparkles/></span>SkillTrack</Link>
    <div className="max-w-xl"><p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-white/70">Learn. Improve. Get hired.</p><h1 className="text-5xl font-extrabold leading-tight">One workspace for your learning and career journey.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-white/80">Track courses, discover skill gaps, analyze your resume and manage applications from one responsive platform.</p></div>
    <p className="text-sm text-white/60">SkillTrack portfolio project · MERN Stack</p>
  </div>
  <div className="flex items-center justify-center bg-slate-50 p-5 sm:p-8"><div className="w-full max-w-md"><div className="mb-7 lg:hidden"><Link to="/login" className="flex items-center gap-2 font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><Sparkles size={18}/></span>SkillTrack</Link></div><div className="card p-6 sm:p-8"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p><div className="mt-6">{children}</div></div></div></div>
 </div>
}
