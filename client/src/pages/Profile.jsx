import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";

export default function Profile() {
  const {user,updateProfile}=useAuth();
  const [name,setName]=useState(user?.name||"");
  const [goal,setGoal]=useState(user?.careerGoal||"");
  const [skills,setSkills]=useState(user?.skills?.join(", ")||"");

  useEffect(()=>{setName(user?.name||"");setGoal(user?.careerGoal||"");setSkills(user?.skills?.join(", ")||"")},[user]);

  async function save(e){e.preventDefault();try{await updateProfile({name,careerGoal:goal,skills:skills.split(",").map(s=>s.trim()).filter(Boolean)});toast.success("Profile updated")}catch(e){toast.error("Could not update profile")}}

  return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="section-title">Profile</h1><p className="mt-1 text-sm text-slate-500">Keep your career goal and skills current for better recommendations.</p></div><form onSubmit={save} className="card p-5 sm:p-8"><div className="flex items-center gap-4 border-b border-slate-100 pb-6"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><UserRound/></div><div><h2 className="font-bold">{user?.email}</h2><p className="text-sm text-slate-500">Role: {user?.role}</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold">Name</span><input className="input" value={name} onChange={e=>setName(e.target.value)}/></label><label><span className="mb-2 block text-sm font-semibold">Career goal</span><select className="input" value={goal} onChange={e=>setGoal(e.target.value)}><option>MERN Stack Developer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Software Engineer</option></select></label><label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Skills</span><textarea className="input min-h-28" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, JavaScript, Node.js..."/></label></div><button className="btn-primary mt-6">Save changes</button></form></div>
}
