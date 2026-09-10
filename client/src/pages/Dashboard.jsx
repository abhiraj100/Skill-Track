import { useEffect, useState } from "react";
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, Flame, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../store/auth";
import { CourseCard, ProgressBar, StatCard } from "../components/ui";
import StudyGoal from "../components/StudyGoal";

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [study, setStudy] = useState(null);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/courses"), api.get("/courses/mine"), api.get("/jobs"), api.get("/progress/study-summary")])
      .then(([c,e,j,s]) => { setCourses(c.data.courses); setEnrollments(e.data.enrollments); setJobs(j.data.jobs); setStudy(s.data); })
      .catch(() => toast.error("Could not load your dashboard"));
  }, []);

  async function logStudyTime(minutes) {
    setLogging(true);
    try {
      await api.post("/progress/study-log", { minutes });
      const { data } = await api.get("/progress/study-summary");
      setStudy(data);
      toast.success(`${minutes} minutes added to your learning goal`);
    } catch (error) { toast.error(error.response?.data?.message || "Could not log study time"); }
    finally { setLogging(false); }
  }

  const completed = enrollments.filter(e => e.progress === 100).length;
  const avg = enrollments.length ? Math.round(enrollments.reduce((a,e)=>a+e.progress,0)/enrollments.length) : 0;

  return <div className="space-y-7">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-mint p-6 text-white shadow-xl sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="text-sm font-semibold text-white/70">Your career workspace</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Good evening, {user?.name?.split(" ")[0]} 👋</h1><p className="mt-3 max-w-2xl leading-7 text-white/80">Your current goal is <strong className="text-white">{user?.careerGoal}</strong>. Keep your momentum going with a focused learning plan.</p><div className="mt-6 flex flex-wrap gap-3"><Link className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700" to="/courses">Explore courses</Link><Link className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white" to="/career">Run AI analysis</Link></div></div>
        <div className="hidden rounded-3xl bg-white/10 p-5 lg:block"><Target size={48}/><p className="mt-5 text-sm text-white/70">Learning momentum</p><p className="mt-1 text-4xl font-extrabold">{avg}%</p></div>
      </div>
    </section>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Enrolled" value={enrollments.length} hint="active courses" icon={BookOpen}/>
      <StatCard label="Completed" value={completed} hint="finished courses" icon={Award}/>
      <StatCard label="Avg. progress" value={`${avg}%`} hint="across courses" icon={TrendingUp}/>
      <StatCard label="Applications" value={jobs.length} hint="tracked jobs" icon={BriefcaseBusiness}/>
    </section>

    <section className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="mb-4 flex items-end justify-between"><div><h2 className="section-title">Continue learning</h2><p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p></div><Link to="/courses" className="hidden text-sm font-semibold text-brand-600 sm:block">View all</Link></div>
        {enrollments.length ? <div className="space-y-3">{enrollments.slice(0,3).map(item => <div key={item._id} className="card flex gap-4 p-4"><img src={item.course.thumbnail} className="hidden h-24 w-32 rounded-xl object-cover sm:block"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.course.title}</h3><p className="mt-1 text-xs text-slate-500">{item.course.difficulty} · {item.course.duration}</p></div><span className="text-sm font-bold text-brand-600">{item.progress}%</span></div><div className="mt-4"><ProgressBar value={item.progress}/></div><Link to={`/courses/${item.course._id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">Continue <ArrowRight size={15}/></Link></div></div>)}</div> : <div className="card p-8 text-center"><Flame className="mx-auto text-coral"/><h3 className="mt-3 font-bold">Start your learning streak</h3><p className="mt-1 text-sm text-slate-500">Enroll in your first course and build momentum.</p><Link className="btn-primary mt-4" to="/courses">Browse courses</Link></div>}
      </div>

      <div className="space-y-7"><StudyGoal summary={study} logging={logging} onLog={logStudyTime}/><div><div className="mb-4"><h2 className="section-title">Recommended for you</h2><p className="mt-1 text-sm text-slate-500">Based on your career goal.</p></div><div className="space-y-3">{courses.slice(0,2).map(course => <Link key={course._id} to={`/courses/${course._id}`} className="card block p-4 transition hover:border-brand-200"><div className="flex items-center gap-3"><img src={course.thumbnail} className="h-16 w-20 rounded-xl object-cover"/><div className="min-w-0"><p className="text-xs font-semibold text-brand-600">{course.category}</p><h3 className="mt-1 line-clamp-2 text-sm font-bold">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.duration}</p></div></div></Link>)}</div></div></div>
    </section>
  </div>;
}
