import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Award,
  BookMarked,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Zap
} from "lucide-react";
import { useAuth } from "../store/auth";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const practiceRef = useRef(null);
  const learnRef = useRef(null);
  const careerRef = useRef(null);

  // Close dropdowns on route change
  useEffect(() => {
    setPracticeOpen(false);
    setLearnOpen(false);
    setCareerOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (practiceRef.current && !practiceRef.current.contains(e.target)) setPracticeOpen(false);
      if (learnRef.current && !learnRef.current.contains(e.target)) setLearnOpen(false);
      if (careerRef.current && !careerRef.current.contains(e.target)) setCareerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLearnActive = ["/courses", "/roadmaps", "/notes"].some((p) => location.pathname.startsWith(p));
  const isPracticeActive = ["/interview", "/codelab", "/focus", "/mind-gym"].some((p) => location.pathname.startsWith(p));
  const isCareerActive = ["/career", "/jobs", "/certificates", "/achievements"].some((p) => location.pathname.startsWith(p));

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 font-extrabold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20">
              <Sparkles size={18} />
            </span>
            <span className="text-lg">
              Skill<span className="text-brand-600">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>

            {/* Learn Dropdown */}
            <div className="relative" ref={learnRef}>
              <button
                onClick={() => {
                  setLearnOpen(!learnOpen);
                  setPracticeOpen(false);
                  setCareerOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isLearnActive || learnOpen
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BookOpen size={16} />
                Learn
                <ChevronDown size={14} className={`transition-transform duration-200 ${learnOpen ? "rotate-180" : ""}`} />
              </button>

              {learnOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <NavLink
                    to="/courses"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <BookOpen size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Courses</p>
                      <p className="text-[11px] text-slate-500">Curated lessons & quizzes</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/roadmaps"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <MapPin size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Career Roadmaps</p>
                      <p className="text-[11px] text-slate-500">Interactive visual skill trees</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/notes"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <BookMarked size={17} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Study Notes</p>
                      <p className="text-[11px] text-slate-500">Key takeaways & revision</p>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Practice Dropdown */}
            <div className="relative" ref={practiceRef}>
              <button
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setLearnOpen(false);
                  setCareerOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isPracticeActive || practiceOpen
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BrainCircuit size={16} />
                Practice
                <span className="rounded-full bg-brand-100 px-1.5 py-0.2 text-[10px] font-bold text-brand-700">NEW</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${practiceOpen ? "rotate-180" : ""}`} />
              </button>

              {practiceOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <NavLink
                    to="/interview"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <BrainCircuit size={17} className="mt-0.5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">AI Mock Interview</p>
                      <p className="text-[11px] text-slate-500">Voice & text interview simulation</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/codelab"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Code2 size={17} className="mt-0.5 text-sky-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Code Lab</p>
                      <p className="text-[11px] text-slate-500">In-browser algorithm test runner</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/focus"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Headphones size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Focus Station</p>
                      <p className="text-[11px] text-slate-500">Pomodoro & ambient soundscapes</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/mind-gym"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Zap size={17} className="mt-0.5 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Mind Gym</p>
                      <p className="text-[11px] text-slate-500">Speed calculation sprint</p>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Career Dropdown */}
            <div className="relative" ref={careerRef}>
              <button
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setLearnOpen(false);
                  setPracticeOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isCareerActive || careerOpen
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BriefcaseBusiness size={16} />
                Career
                <ChevronDown size={14} className={`transition-transform duration-200 ${careerOpen ? "rotate-180" : ""}`} />
              </button>

              {careerOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <NavLink
                    to="/career"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Sparkles size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">AI Career Assistant</p>
                      <p className="text-[11px] text-slate-500">Skill gaps & outreach letters</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <BriefcaseBusiness size={17} className="mt-0.5 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Job Tracker</p>
                      <p className="text-[11px] text-slate-500">Pipeline & interview dates</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/certificates"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Award size={17} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Certificates</p>
                      <p className="text-[11px] text-slate-500">Verified credentials & lookup</p>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/achievements"
                    className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Badges</p>
                      <p className="text-[11px] text-slate-500">Milestones & achievements</p>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <ShieldCheck size={16} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden items-center gap-3 md:flex">
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 px-3 py-1.5 transition hover:bg-slate-50"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.careerGoal}</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <UserRound size={15} />
              </span>
            </NavLink>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-rose-600"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-slate-600 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white p-4 space-y-4 md:hidden max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.careerGoal}</p>
              </div>
              <button onClick={logout} className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Main</p>
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <LayoutDashboard size={17} /> Dashboard
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Learn</p>
              <NavLink to="/courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <BookOpen size={17} /> Courses
              </NavLink>
              <NavLink to="/roadmaps" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <MapPin size={17} /> Career Roadmaps
              </NavLink>
              <NavLink to="/notes" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <BookMarked size={17} /> Study Notes
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Practice</p>
              <NavLink to="/interview" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <BrainCircuit size={17} className="text-indigo-600" /> AI Mock Interview
              </NavLink>
              <NavLink to="/codelab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Code2 size={17} className="text-sky-600" /> Code Lab
              </NavLink>
              <NavLink to="/focus" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Headphones size={17} className="text-emerald-600" /> Focus Station
              </NavLink>
              <NavLink to="/mind-gym" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Zap size={17} className="text-purple-600" /> Mind Gym
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Career</p>
              <NavLink to="/career" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Sparkles size={17} /> AI Career Assistant
              </NavLink>
              <NavLink to="/jobs" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <BriefcaseBusiness size={17} /> Job Tracker
              </NavLink>
              <NavLink to="/certificates" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Award size={17} /> Certificates
              </NavLink>
              <NavLink to="/achievements" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <ShieldCheck size={17} /> Badges
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <UserRound size={17} /> Profile
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
