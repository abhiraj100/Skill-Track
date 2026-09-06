import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon size={20} /></div>}
      </div>
    </div>
  );
}

export function ProgressBar({ value = 0 }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <img src={course.thumbnail} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="badge bg-brand-50 text-brand-700">{course.category}</span>
          <span className="text-xs text-slate-500">{course.difficulty}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.skills?.slice(0, 3).map(skill => <span key={skill} className="badge bg-slate-100 text-slate-600">{skill}</span>)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500"><Clock3 size={15} /> {course.duration}</span>
          <span className="flex items-center gap-1 font-semibold text-brand-600">View <ArrowRight size={15} /></span>
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="card flex flex-col items-center justify-center p-8 text-center">
      <Sparkles className="text-brand-500" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SuccessRow({ children }) {
  return <div className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-mint" />{children}</div>;
}
