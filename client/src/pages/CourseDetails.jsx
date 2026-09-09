import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CirclePlay, Clock3, LockKeyhole, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { ProgressBar } from "../components/ui";

export default function CourseDetails() {
  const { id } = useParams();
  const [course,setCourse] = useState(null);
  const [enrollment,setEnrollment] = useState(null);
  const [selected,setSelected] = useState(0);
  const [quiz,setQuiz] = useState(null);
  const [answers,setAnswers] = useState([]);
  const [attempts,setAttempts] = useState([]);
  const [quizResult,setQuizResult] = useState(null);
  const [submittingQuiz,setSubmittingQuiz] = useState(false);

  async function load() {
    const [c,p,q] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/progress/${id}`).catch(()=>({data:{enrollment:null}})),
      api.get(`/quizzes/course/${id}`).catch(()=>({data:{quiz:null}}))
    ]);
    setCourse(c.data.course); setEnrollment(p.data.enrollment); setQuiz(q.data.quiz);
    if (q.data.quiz) {
      setAnswers(Array(q.data.quiz.questions.length).fill(null));
      const history = await api.get(`/quizzes/${q.data.quiz._id}/attempts`).catch(()=>({data:{attempts:[]}}));
      setAttempts(history.data.attempts);
    }
  }
  useEffect(()=>{load()},[id]);

  if (!course) return <div className="py-20 text-center text-slate-500">Loading course...</div>;

  async function enroll() {
    try { const {data}=await api.post(`/courses/${id}/enroll`); setEnrollment(data.enrollment); toast.success("Course added to your learning plan"); }
    catch(e){toast.error(e.response?.data?.message||"Please sign in first")}
  }

  async function toggleComplete() {
    if (!enrollment) return enroll();
    try {
      const lesson = course.lessons[selected];
      const {data}=await api.post("/progress/toggle",{courseId:id,lessonId:lesson._id});
      setEnrollment(data.enrollment);
      toast.success(data.completed ? "Lesson completed" : "Lesson marked incomplete");
    }
    catch(e){toast.error(e.response?.data?.message||"Could not update progress")}
  }

  async function submitQuiz() {
    if (answers.some((answer) => answer === null)) return toast.error("Answer every question first");
    setSubmittingQuiz(true);
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      setQuizResult(data);
      const history = await api.get(`/quizzes/${quiz._id}/attempts`);
      setAttempts(history.data.attempts);
      toast.success(`Quiz complete: ${data.percentage}%`);
    } catch (e) { toast.error(e.response?.data?.message || "Could not submit quiz"); }
    finally { setSubmittingQuiz(false); }
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
      <div className="card p-6 sm:p-8"><p className="text-sm font-semibold text-brand-600">Lesson {selected+1} of {course.lessons.length}</p><h2 className="mt-2 text-2xl font-bold">{course.lessons[selected].title}</h2><p className="mt-5 max-w-3xl leading-8 text-slate-600">{course.lessons[selected].content}</p><div className="mt-8 rounded-2xl bg-slate-50 p-5"><div className="flex items-start gap-3"><LockKeyhole size={19} className="mt-0.5 text-slate-500"/><div><p className="font-semibold">Practice task</p><p className="mt-1 text-sm leading-6 text-slate-500">Implement the concept in a small project and commit your work to Git. Practical repetition will improve retention.</p></div></div></div><button onClick={toggleComplete} className="btn-primary mt-7">{done(course.lessons[selected]._id)?"Mark lesson incomplete":"Mark lesson complete"}</button></div>
    </section>

    {quiz && <section className="card p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-brand-600"><Trophy size={19}/><p className="text-sm font-bold">Knowledge check</p></div><h2 className="mt-2 text-2xl font-bold">{quiz.title}</h2><p className="mt-1 text-sm text-slate-500">Complete all {quiz.questions.length} questions to test your understanding.</p></div>{attempts[0] && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">Latest score </span><strong>{Math.round(attempts[0].score / attempts[0].total * 100)}%</strong></div>}</div><div className="mt-7 space-y-6">{quiz.questions.map((question, questionIndex)=><fieldset key={question._id}><legend className="font-semibold">{questionIndex + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex)=><label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${answers[questionIndex]===optionIndex?"border-brand-400 bg-brand-50":"border-slate-200 hover:border-slate-300"}`}><input type="radio" name={question._id} checked={answers[questionIndex]===optionIndex} onChange={()=>setAnswers(answers.map((answer,index)=>index===questionIndex?optionIndex:answer))}/>{option}</label>)}</div></fieldset>)}</div><div className="mt-7 flex flex-wrap items-center gap-4"><button disabled={submittingQuiz} onClick={submitQuiz} className="btn-primary">{submittingQuiz ? "Submitting..." : "Submit quiz"}</button>{quizResult && <p className="font-semibold text-mint">You scored {quizResult.score}/{quizResult.total} ({quizResult.percentage}%).</p>}</div>{attempts.length > 1 && <p className="mt-5 text-xs text-slate-500">Previous attempts: {attempts.slice(1).map((attempt)=>`${Math.round(attempt.score / attempt.total * 100)}%`).join(" · ")}</p>}</section>}
  </div>;
}
