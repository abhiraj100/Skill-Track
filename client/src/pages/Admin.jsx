import { useEffect, useState } from "react";
import { BarChart3, BookOpen, BriefcaseBusiness, Users } from "lucide-react";
import api from "../services/api";
import { StatCard } from "../components/ui";

export default function Admin() {
  const [stats,setStats]=useState(null);
  useEffect(()=>{api.get("/admin/stats").then(({data})=>setStats(data.stats))},[]);
  if(!stats)return <div className="py-20 text-center text-slate-500">Loading analytics...</div>;
  return <div className="space-y-7"><div><h1 className="section-title">Admin dashboard</h1><p className="mt-1 text-sm text-slate-500">High-level platform activity.</p></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Users" value={stats.users} icon={Users}/><StatCard label="Courses" value={stats.courses} icon={BookOpen}/><StatCard label="Enrollments" value={stats.enrollments} icon={BarChart3}/><StatCard label="Applications" value={stats.applications} icon={BriefcaseBusiness}/></div><div className="card p-6"><h2 className="font-bold">Platform snapshot</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Metric label="Course enrollment activity" value={stats.enrollments}/><Metric label="Career applications tracked" value={stats.applications}/></div></div></div>
}
function Metric({label,value}){return <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>}
