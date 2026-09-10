import { Flame, Plus, TimerReset } from "lucide-react";

const durations = [15, 25, 45];

export default function StudyGoal({ summary, logging, onLog }) {
  if (!summary) return <div className="card min-h-64 animate-pulse bg-slate-100" />;
  const percentage = Math.min(100, Math.round(summary.todayMinutes / summary.dailyGoal * 100));
  const max = Math.max(summary.dailyGoal, ...summary.weekly.map((day) => day.minutes), 1);
  const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" });

  return <section className="card overflow-hidden bg-gradient-to-br from-white via-white to-brand-50 p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-brand-600">Daily learning goal</p><h2 className="mt-1 text-xl font-extrabold">Keep your momentum</h2></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-500"><Flame size={21}/></div></div>
    <div className="mt-5 flex items-center gap-5"><div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#4f46e5 ${percentage * 3.6}deg, #e2e8f0 0deg)` }}><div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><strong className="text-xl">{percentage}%</strong><span className="text-[10px] font-semibold text-slate-500">TODAY</span></div></div><div><p className="text-2xl font-extrabold">{summary.todayMinutes}<span className="text-sm font-semibold text-slate-500"> / {summary.dailyGoal} min</span></p><p className="mt-1 text-sm text-slate-500">{summary.streak ? `${summary.streak}-day learning streak` : "Log a session to begin your streak"}</p></div></div>
    <div className="mt-6"><div className="flex h-16 items-end justify-between gap-2">{summary.weekly.map((day) => <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-[10px] font-semibold text-slate-400">{day.minutes || ""}</span><div className={`w-full max-w-6 rounded-t-md ${day.date === summary.weekly.at(-1).date ? "bg-brand-600" : "bg-brand-200"}`} style={{ height: `${Math.max(day.minutes ? 10 : 4, day.minutes / max * 100)}%` }}/><span className="text-[10px] font-semibold text-slate-500">{dayLabel(day.date)}</span></div>)}</div></div>
    <div className="mt-6 flex flex-wrap gap-2">{durations.map((minutes) => <button disabled={logging} onClick={() => onLog(minutes)} key={minutes} className="btn-secondary px-3 py-2 text-xs"><Plus size={14}/>{minutes} min</button>)}<span className="ml-auto inline-flex items-center gap-1 self-center text-xs font-semibold text-slate-500"><TimerReset size={14}/>Quick log</span></div>
  </section>;
}
