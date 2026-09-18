import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Award,
  BookMarked,
  BookOpen,
  Boxes,
  Brain,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  FolderGit2,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessagesSquare,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
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
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("skilltrack_theme") === "dark";
    } catch {
      return false;
    }
  });

  const { user, logout } = useAuth();
  const location = useLocation();

  const practiceRef = useRef(null);
  const learnRef = useRef(null);
  const careerRef = useRef(null);

  // Apply dark mode class to root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skilltrack_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skilltrack_theme", "light");
    }
  }, [darkMode]);

  // Close dropdowns on route change
  useEffect(() => {
    setPracticeOpen(false);
    setLearnOpen(false);
    setCareerOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (practiceRef.current && !practiceRef.current.contains(e.target)) setPracticeOpen(false);
      if (learnRef.current && !learnRef.current.contains(e.target)) setLearnOpen(false);
      if (careerRef.current && !careerRef.current.contains(e.target)) setCareerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLearnActive = ["/courses", "/roadmaps", "/system-design", "/flashcards", "/notes"].some((p) =>
    location.pathname.startsWith(p)
  );
  const isPracticeActive = ["/interview", "/codelab", "/focus", "/projects", "/mind-gym"].some((p) =>
    location.pathname.startsWith(p)
  );
  const isCareerActive = ["/career", "/jobs", "/certificates", "/portfolio", "/achievements"].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className={`page-shell ${darkMode ? "dark bg-slate-950 text-slate-100" : ""}`}>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
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
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isLearnActive || learnOpen
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen size={16} />
                Learn
                <ChevronDown size={14} className={`transition-transform duration-200 ${learnOpen ? "rotate-180" : ""}`} />
              </button>

              {learnOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50 dark:border-slate-800 dark:bg-slate-900">
                  <NavLink to="/courses" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <BookOpen size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold">Courses</p>
                      <p className="text-[11px] text-slate-500">Curated lessons & quizzes</p>
                    </div>
                  </NavLink>
                  <NavLink to="/roadmaps" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <MapPin size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold">Career Roadmaps</p>
                      <p className="text-[11px] text-slate-500">Interactive visual skill trees</p>
                    </div>
                  </NavLink>
                  <NavLink to="/system-design" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Boxes size={17} className="mt-0.5 text-violet-600" />
                    <div>
                      <p className="text-xs font-bold">System Design Arena</p>
                      <p className="text-[11px] text-slate-500">Architecture canvas & QPS math</p>
                    </div>
                  </NavLink>
                  <NavLink to="/flashcards" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Brain size={17} className="mt-0.5 text-rose-600" />
                    <div>
                      <p className="text-xs font-bold">Smart Flashcards</p>
                      <p className="text-[11px] text-slate-500">Spaced repetition revision</p>
                    </div>
                  </NavLink>
                  <NavLink to="/notes" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <BookMarked size={17} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold">Study Notes</p>
                      <p className="text-[11px] text-slate-500">Key takeaways & bookmarks</p>
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
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isPracticeActive || practiceOpen
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <BrainCircuit size={16} />
                Practice
                <ChevronDown size={14} className={`transition-transform duration-200 ${practiceOpen ? "rotate-180" : ""}`} />
              </button>

              {practiceOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50 dark:border-slate-800 dark:bg-slate-900">
                  <NavLink to="/interview" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <BrainCircuit size={17} className="mt-0.5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold">AI Mock Interview</p>
                      <p className="text-[11px] text-slate-500">Voice & text interview arena</p>
                    </div>
                  </NavLink>
                  <NavLink to="/codelab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Code2 size={17} className="mt-0.5 text-sky-600" />
                    <div>
                      <p className="text-xs font-bold">Code Lab</p>
                      <p className="text-[11px] text-slate-500">In-browser algorithm test runner</p>
                    </div>
                  </NavLink>
                  <NavLink to="/projects" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <FolderGit2 size={17} className="mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold">Capstone Projects</p>
                      <p className="text-[11px] text-slate-500">Guided portfolio builds</p>
                    </div>
                  </NavLink>
                  <NavLink to="/focus" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Headphones size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Focus Station</p>
                      <p className="text-[11px] text-slate-500">Pomodoro & ambient soundscapes</p>
                    </div>
                  </NavLink>
                  <NavLink to="/mind-gym" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Zap size={17} className="mt-0.5 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold">Mind Gym</p>
                      <p className="text-[11px] text-slate-500">Mental math sprint</p>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Community Link */}
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <MessagesSquare size={16} />
              Community
            </NavLink>

            {/* Career Dropdown */}
            <div className="relative" ref={careerRef}>
              <button
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setLearnOpen(false);
                  setPracticeOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isCareerActive || careerOpen
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <BriefcaseBusiness size={16} />
                Career
                <ChevronDown size={14} className={`transition-transform duration-200 ${careerOpen ? "rotate-180" : ""}`} />
              </button>

              {careerOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50 dark:border-slate-800 dark:bg-slate-900">
                  <NavLink to="/career" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Sparkles size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold">AI Career Assistant</p>
                      <p className="text-[11px] text-slate-500">Skill gaps & outreach letters</p>
                    </div>
                  </NavLink>
                  <NavLink to="/portfolio" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Globe size={17} className="mt-0.5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold">Developer Portfolio</p>
                      <p className="text-[11px] text-slate-500">Live shareable resume & stats</p>
                    </div>
                  </NavLink>
                  <NavLink to="/jobs" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <BriefcaseBusiness size={17} className="mt-0.5 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold">Job Tracker</p>
                      <p className="text-[11px] text-slate-500">Pipeline & interview dates</p>
                    </div>
                  </NavLink>
                  <NavLink to="/certificates" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Award size={17} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold">Certificates</p>
                      <p className="text-[11px] text-slate-500">Verified credentials & lookup</p>
                    </div>
                  </NavLink>
                  <NavLink to="/achievements" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <ShieldCheck size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Badges</p>
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
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <ShieldCheck size={16} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Controls: Dark Mode Toggle + Profile + Logout */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <NavLink
              to="/portfolio"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 px-3 py-1.5 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.careerGoal}</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <UserRound size={15} />
              </span>
            </NavLink>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white p-4 space-y-4 md:hidden max-h-[85vh] overflow-y-auto dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.careerGoal}</p>
              </div>
              <button onClick={logout} className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Main</p>
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <LayoutDashboard size={17} /> Dashboard
              </NavLink>
              <NavLink to="/community" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <MessagesSquare size={17} /> Community Forum
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Learn</p>
              <NavLink to="/courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <BookOpen size={17} /> Courses
              </NavLink>
              <NavLink to="/roadmaps" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <MapPin size={17} /> Career Roadmaps
              </NavLink>
              <NavLink to="/system-design" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Boxes size={17} /> System Design Arena
              </NavLink>
              <NavLink to="/flashcards" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Brain size={17} /> Smart Flashcards
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Practice</p>
              <NavLink to="/interview" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <BrainCircuit size={17} className="text-indigo-600" /> AI Mock Interview
              </NavLink>
              <NavLink to="/codelab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Code2 size={17} className="text-sky-600" /> Code Lab
              </NavLink>
              <NavLink to="/projects" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <FolderGit2 size={17} className="text-blue-600" /> Capstone Studio
              </NavLink>
              <NavLink to="/focus" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Headphones size={17} className="text-emerald-600" /> Focus Station
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Career</p>
              <NavLink to="/portfolio" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Globe size={17} /> Live Portfolio
              </NavLink>
              <NavLink to="/career" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Sparkles size={17} /> AI Career Assistant
              </NavLink>
              <NavLink to="/jobs" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <BriefcaseBusiness size={17} /> Job Tracker
              </NavLink>
              <NavLink to="/certificates" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Award size={17} /> Certificates
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
