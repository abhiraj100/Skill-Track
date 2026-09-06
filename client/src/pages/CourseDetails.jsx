import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CirclePlay, Clock3, LockKeyhole } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { ProgressBar } from "../components/ui";

export default function CourseDetails() {
  const { id } = useParams();
  const [course,setCourse] = useState(null);
  const [enrollment,setEnrollment] = useState(null);
  const [selected,setSelected] = useState(0);

  async function load() {
    const [c,p] = await Promise.all([api.get(`/courses/${id}`), api.get(`/progress/${id}`).catch(()=>({data:{enrollment:null}}))]);
    setCourse(c.data.course); setEnrollment(p.data.enrollment);
  }
  useEffect(()=>{load()},[id]);

  if (!course) return <div className="py-20 text-center text-slate-500">Loading course...</div>;

  async function enroll() {
    try { const {data}=await api.post(`/courses/${id}/enroll`); setEnrollment(data.enrollment); toast.success("Course added to your learning plan"); }
    catch(e){toast.error(e.response?.data?.message||"Please sign in first")}
  }

  async function complete() {
    if (!enrollment) return enroll();
    try { const {data}=await api.post("/progress/complete",{courseId:id,lessonId:course.lessons[selected]._id}); setEnrollment(data.enrollment); toast.success("Lesson completed"); }
    catch(e){toast.error(e.response?.data?.message||"Could not update progress")}
  }

  const done = id => enrollment?.completedLessons?.some(x=>x.toString()===id);

  return <div className="space-y-6">
    <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={17}/>Back to courses</Link>
    <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <div className="grid lg:grid-cols-[1.1fr_.9fr]">
        <img src={course.thumbnail} className="h-full min-h-[260px] w-full object-cover"/>
        <div className="p-6 sm:p-8"><span className="badge bg-brand-50 text-brand-700">{course.category}</span><h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{course.title}</h1><p className="mt-4 leading-7 text-slate-500">{course.description}</p><div className="mt-5 flex flex-wrap gap-2">{course.skills.map(s=><span className="badge bg-slate-100 text-slate-600" key={s}>{s}</span>)}</div><div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500"><span>{course.difficulty}</span><span className="flex items-center gap-1"><Clock3 size={15}/>{course.duration}</span><span>{course.lessons.length} lessons</span></div>{enrollment ? <div className="mt-7"><div className="flex justify-between text-sm font-semibold"><span>Your progress</span><span className="text-brand-600">{enrollment.progress}%</span></div><div className="mt-2"><ProgressBar value={enrollment.progress}/></div></div> : <button onClick={enroll} className="btn-primary mt-7">Enroll in course</button>}</div>
      </div>
    </section>

    <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="card p-3"><h2 className="px-3 py-2 font-bold">Course content</h2>{course.lessons.map((lesson,i)=><button key={lesson._id} onClick={()=>setSelected(i)} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${selected===i?"bg-brand-50":"hover:bg-slate-50"}`}><span className={`mt-0.5 ${done(lesson._id)?"text-mint":"text-slate-400"}`}>{done(lesson._id)?<CheckCircle2 size={18}/>:<CirclePlay size={18}/>}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{i+1}. {lesson.title}</span><span className="mt-1 block text-xs text-slate-500">{lesson.duration}</span></span></button>)}</div>
      <div className="card p-6 sm:p-8"><p className="text-sm font-semibold text-brand-600">Lesson {selected+1} of {course.lessons.length}</p><h2 className="mt-2 text-2xl font-bold">{course.lessons[selected].title}</h2><p className="mt-5 max-w-3xl leading-8 text-slate-600">{course.lessons[selected].content}</p><div className="mt-8 rounded-2xl bg-slate-50 p-5"><div className="flex items-start gap-3"><LockKeyhole size={19} className="mt-0.5 text-slate-500"/><div><p className="font-semibold">Practice task</p><p className="mt-1 text-sm leading-6 text-slate-500">Implement the concept in a small project and commit your work to Git. Practical repetition will improve retention.</p></div></div></div><button onClick={complete} className="btn-primary mt-7">{done(course.lessons[selected]._id)?"Completed":"Mark lesson complete"}</button></div>
    </section>
  </div>;
}
