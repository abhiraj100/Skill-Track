import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import api from "../services/api";
import { CourseCard } from "../components/ui";

export default function Courses() {
  const [courses,setCourses] = useState([]);
  const [search,setSearch] = useState("");
  const [difficulty,setDifficulty] = useState("All");
  const [category,setCategory] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get("/courses", { params: { search, difficulty, category } }).then(({data})=>setCourses(data.courses));
    }, 250);
    return () => clearTimeout(timer);
  }, [search,difficulty,category]);

  const categories = ["All", ...new Set(courses.map(c=>c.category))];

  return <div className="space-y-6">
    <section><h1 className="section-title">Explore courses</h1><p className="mt-1 text-sm text-slate-500">Build practical skills through structured learning paths.</p></section>
    <div className="card p-3 sm:p-4"><div className="grid gap-3 md:grid-cols-[1fr_180px_180px]"><div className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input className="input pl-10" placeholder="Search React, Node, MongoDB..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="relative"><SlidersHorizontal className="absolute left-3 top-3.5 text-slate-400" size={17}/><select className="input pl-10" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div></div>
    <p className="text-sm font-semibold text-slate-500">{courses.length} course{courses.length!==1?"s":""} found</p>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{courses.map(c=><CourseCard key={c._id} course={c}/>)}</div>
  </div>
}
