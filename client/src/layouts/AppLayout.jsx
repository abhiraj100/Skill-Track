import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, LayoutDashboard, Menu, Sparkles, UserRound, X, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../store/auth";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/courses", "Courses", BookOpen],
  ["/career", "AI Career", Sparkles],
  ["/jobs", "Job Tracker", BriefcaseBusiness],
  ["/profile", "Profile", UserRound]
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><Sparkles size={18} /></span>
            <span>Skill<span className="text-brand-600">Track</span></span>
          </Link>

          <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`
              }><Icon size={17} />{label}</NavLink>
            ))}
            {user?.role === "admin" && <NavLink to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><ShieldCheck size={17}/>Admin</NavLink>}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.careerGoal}</p>
            </div>
            <button onClick={logout} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Logout"><LogOut size={17}/></button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white p-3 md:hidden">
            {links.map(([to, label, Icon]) => (
              <NavLink onClick={() => setOpen(false)} key={to} to={to} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Icon size={18}/>{label}</NavLink>
            ))}
            {user?.role === "admin" && <NavLink onClick={() => setOpen(false)} to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700"><ShieldCheck size={18}/>Admin</NavLink>}
            <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600"><LogOut size={18}/>Logout</button>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
