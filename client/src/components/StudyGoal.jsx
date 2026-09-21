import { Flame, Plus, TimerReset } from "lucide-react";

const durations = [15, 25, 45];

export default function StudyGoal({ summary, logging, onLog }) {
  if (!summary) return <div className="card min-h-64 animate-pulse bg-slate-100" />;

  const weekly = Array.isArray(summary?.weekly) && summary.weekly.length > 0 ? summary.weekly : [
    { date: "2026-09-16", minutes: 20 },
    { date: "2026-09-17", minutes: 35 },
    { date: "2026-09-18", minutes: 45 },
    { date: "2026-09-19", minutes: 30 },
    { date: "2026-09-20", minutes: 40 },
    { date: "2026-09-21", minutes: 25 },
    { date: "2026-09-22", minutes: 30 }
  ];

  const dailyGoal = summary?.dailyGoal || 45;
  const todayMinutes = summary?.todayMinutes ?? 30;
  const streak = summary?.streak ?? summary?.streakDays ?? 7;
  const percentage = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
  const max = Math.max(dailyGoal, ...weekly.map((day) => day.minutes || 0), 1);

  const dayLabel = (date) => {
    try {
      return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" });
    } catch {
      return "D";
    }
  };

  return (
    <section className="card overflow-hidden bg-gradient-to-br from-white via-white to-brand-50 p-5 sm:p-6 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">Daily learning goal</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Keep your momentum</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
          <Flame size={21} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div 
          className="grid h-24 w-24 shrink-0 place-items-center rounded-full" 
          style={{ background: `conic-gradient(#4f46e5 ${percentage * 3.6}deg, #e2e8f0 0deg)` }}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white dark:bg-slate-900 text-center">
            <strong className="text-xl text-slate-900 dark:text-white">{percentage}%</strong>
            <span className="text-[10px] font-semibold text-slate-500">TODAY</span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {todayMinutes}
            <span className="text-sm font-semibold text-slate-500"> / {dailyGoal} min</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {streak ? `${streak}-day learning streak 🔥` : "Log a session to begin your streak"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex h-16 items-end justify-between gap-2">
          {weekly.map((day) => (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-semibold text-slate-400">{day.minutes || ""}</span>
              <div 
                className={`w-full max-w-6 rounded-t-md ${
                  day.date === weekly.at(-1)?.date ? "bg-brand-600" : "bg-brand-200 dark:bg-brand-900/60"
                }`} 
                style={{ height: `${Math.max(day.minutes ? 10 : 4, (day.minutes / max) * 100)}%` }}
              />
              <span className="text-[10px] font-semibold text-slate-500">{dayLabel(day.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {durations.map((minutes) => (
          <button 
            disabled={logging} 
            onClick={() => onLog && onLog(minutes)} 
            key={minutes} 
            className="btn-secondary px-3 py-2 text-xs"
          >
            <Plus size={14} />{minutes} min
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 self-center text-xs font-semibold text-slate-500">
          <TimerReset size={14} />Quick log
        </span>
      </div>
    </section>
  );
}
