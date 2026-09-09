import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const statuses = ["Applied","Assessment","Interview","Offer","Rejected"];

export default function Jobs() {
  const [jobs,setJobs]=useState([]);
  const [form,setForm]=useState({company:"",position:"",status:"Applied",jobUrl:"",notes:"",appliedDate:new Date().toISOString().slice(0,10),interviewDate:""});
  const [show,setShow]=useState(false);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("All");

  async function load(){const {data}=await api.get("/jobs");setJobs(data.jobs)}
  useEffect(()=>{load()},[]);

  async function add(e){e.preventDefault();try{await api.post("/jobs",{...form,interviewDate:form.interviewDate||undefined});setForm({company:"",position:"",status:"Applied",jobUrl:"",notes:"",appliedDate:new Date().toISOString().slice(0,10),interviewDate:""});setShow(false);load();toast.success("Application added")}catch(e){toast.error(e.response?.data?.message||"Could not add")}}
  async function update(id,status){try{await api.put(`/jobs/${id}`,{status});load();toast.success("Status updated")}catch{toast.error("Could not update status")}}
  async function remove(id){try{await api.delete(`/jobs/${id}`);load();toast.success("Application removed")}catch{toast.error("Could not remove application")}}

  const filteredJobs = useMemo(()=>jobs.filter(job => (filter === "All" || job.status === filter) && `${job.company} ${job.position}`.toLowerCase().includes(query.toLowerCase())),[jobs, filter, query]);
  const grouped = useMemo(()=>Object.fromEntries(statuses.map(s=>[s,filteredJobs.filter(j=>j.status===s)])),[filteredJobs]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="section-title">Job application tracker</h1><p className="mt-1 text-sm text-slate-500">Keep every application and next step in one place.</p></div><button onClick={()=>setShow(!show)} className="btn-primary"><Plus size={17}/>Add application</button></div>
    {show && <form onSubmit={add} className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4"><input required className="input" placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/><input required className="input" placeholder="Position" value={form.position} onChange={e=>setForm({...form,position:e.target.value})}/><select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select><input className="input" type="url" placeholder="Job URL (optional)" value={form.jobUrl} onChange={e=>setForm({...form,jobUrl:e.target.value})}/><label className="text-sm font-semibold text-slate-600">Applied date<input className="input mt-1" type="date" value={form.appliedDate} onChange={e=>setForm({...form,appliedDate:e.target.value})}/></label><label className="text-sm font-semibold text-slate-600">Interview date<input className="input mt-1" type="date" value={form.interviewDate} onChange={e=>setForm({...form,interviewDate:e.target.value})}/></label><textarea className="input sm:col-span-2 lg:col-span-4" placeholder="Notes and next steps" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><button className="btn-primary sm:w-fit">Save application</button></form>}
    <div className="flex flex-wrap gap-3"><div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className="input pl-9" placeholder="Search company or position" value={query} onChange={e=>setQuery(e.target.value)}/></div><select className="input w-auto" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{statuses.map(status=><option key={status}>{status}</option>)}</select></div>
    <div className="grid gap-4 xl:grid-cols-5">
      {statuses.map(status=><div key={status} className="min-w-0 rounded-2xl bg-slate-100/70 p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">{status}</h2><span className="badge bg-white text-slate-500">{grouped[status].length}</span></div><div className="space-y-3">{grouped[status].map(job=><div key={job._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold text-brand-600">{job.company}</p><h3 className="mt-1 text-sm font-bold">{job.position}</h3></div><button onClick={()=>remove(job._id)} aria-label={`Remove ${job.company} application`} className="text-slate-400 hover:text-red-500"><Trash2 size={15}/></button></div><select value={job.status} onChange={e=>update(job._id,e.target.value)} className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold">{statuses.map(s=><option key={s}>{s}</option>)}</select>{job.interviewDate&&<p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600"><CalendarDays size={14}/>Interview: {new Date(job.interviewDate).toLocaleDateString()}</p>}{job.jobUrl&&<a href={job.jobUrl} target="_blank" rel="noreferrer" className="mt-3 block truncate text-xs font-semibold text-brand-600 hover:underline">View job post</a>}{job.notes&&<p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{job.notes}</p>}</div>)}</div></div>)}
    </div>
    {!jobs.length && <div className="card p-10 text-center"><BriefcaseBusiness className="mx-auto text-brand-500"/><h3 className="mt-3 font-bold">No applications yet</h3><p className="mt-1 text-sm text-slate-500">Add your first application to start tracking your pipeline.</p></div>}
    {!!jobs.length && !filteredJobs.length && <div className="card p-10 text-center"><Search className="mx-auto text-brand-500"/><h3 className="mt-3 font-bold">No matching applications</h3><button className="mt-3 text-sm font-semibold text-brand-600" onClick={()=>{setQuery("");setFilter("All")}}>Clear filters</button></div>}
  </div>
}
