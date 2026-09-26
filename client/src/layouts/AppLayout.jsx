import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Award,
  Bell,
  Binary,
  BookMarked,
  BookOpen,
  Box,
  Boxes,
  Brain,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  DollarSign,
  FileText,
  FolderGit2,
  Gauge,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessagesSquare,
  Moon,
  Palette,
  Radio,
  Rocket,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Table,
  Terminal,
  Trophy,
  UserRound,
  Users,
  X,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "7-Day Study Streak Active! 🔥", desc: "You're in the top 10% of learners this week. Keep up the momentum!", unread: true, time: "10m ago" },
    { id: 2, title: "New Challenge in Code Lab", desc: "Two Sum & Debounce challenge ready for practice.", unread: true, time: "2h ago" },
    { id: 3, title: "Community Upvote", desc: "Alex Rivera upvoted your response in Technical Q&A.", unread: false, time: "1d ago" },
    { id: 4, title: "Verified Certificate Ready", desc: "Claim your verified credential upon completing 100% course lessons.", unread: false, time: "2d ago" }
  ]);

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
  const notifRef = useRef(null);

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
    setNotifOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (practiceRef.current && !practiceRef.current.contains(e.target)) setPracticeOpen(false);
      if (learnRef.current && !learnRef.current.contains(e.target)) setLearnOpen(false);
      if (careerRef.current && !careerRef.current.contains(e.target)) setCareerOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const isLearnActive = ["/courses", "/roadmaps", "/system-design", "/scale-hub", "/query-lab", "/flashcards", "/notes", "/microservices-lab", "/erd-studio", "/perf-audit", "/design-system"].some((p) =>
    location.pathname.startsWith(p)
  );
  const isPracticeActive = ["/interview", "/codelab", "/focus", "/projects", "/mind-gym", "/terminal-lab", "/api-tester", "/docker-lab", "/cicd-pipeline", "/code-arena", "/cloud-architect", "/security-lab", "/regex-lab", "/load-tester"].some((p) =>
    location.pathname.startsWith(p)
  );
  const isCareerActive = ["/career", "/jobs", "/certificates", "/portfolio", "/resume-builder", "/achievements", "/salary-radar"].some((p) =>
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
                  setNotifOpen(false);
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
                      <p className="text-[11px] text-slate-500">Live traffic simulation & QPS</p>
                    </div>
                  </NavLink>
                  <NavLink to="/scale-hub" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Server size={17} className="mt-0.5 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold">Enterprise Scale & SRE Hub</p>
                      <p className="text-[11px] text-slate-500">OpenTelemetry, Hashing & SRE Runbook</p>
                    </div>
                  </NavLink>
                  <NavLink to="/query-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Database size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">SQL & Mongo Query Lab</p>
                      <p className="text-[11px] text-slate-500">In-browser database studio</p>
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
                  <NavLink to="/microservices-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Radio size={17} className="mt-0.5 text-purple-500" />
                    <div>
                      <p className="text-xs font-bold">Kafka & Event Bus</p>
                      <p className="text-[11px] text-slate-500">Pub/Sub streams & circuit breaker</p>
                    </div>
                  </NavLink>
                  <NavLink to="/erd-studio" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Table size={17} className="mt-0.5 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold">Database ERD Studio</p>
                      <p className="text-[11px] text-slate-500">Visual relational schema modeler</p>
                    </div>
                  </NavLink>
                  <NavLink to="/perf-audit" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Zap size={17} className="mt-0.5 text-teal-500" />
                    <div>
                      <p className="text-xs font-bold">Web Vitals & Performance</p>
                      <p className="text-[11px] text-slate-500">Core Web Vitals & asset waterfall</p>
                    </div>
                  </NavLink>
                  <NavLink to="/design-system" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Palette size={17} className="mt-0.5 text-purple-500" />
                    <div>
                      <p className="text-xs font-bold">Design Systems Studio</p>
                      <p className="text-[11px] text-slate-500">WCAG accessibility & tokens</p>
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
                  setNotifOpen(false);
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
                      <p className="text-xs font-bold">Capstone Studio</p>
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
                  <NavLink to="/terminal-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Terminal size={17} className="mt-0.5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold">Git & UNIX Terminal</p>
                      <p className="text-[11px] text-slate-500">Live SVG branch & commit graph</p>
                    </div>
                  </NavLink>
                  <NavLink to="/api-tester" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Code2 size={17} className="mt-0.5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">REST API Client Studio</p>
                      <p className="text-[11px] text-slate-500">In-browser request sandbox</p>
                    </div>
                  </NavLink>
                  <NavLink to="/docker-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Box size={17} className="mt-0.5 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold">Docker & Kubernetes</p>
                      <p className="text-[11px] text-slate-500">Containers & HPA scaling</p>
                    </div>
                  </NavLink>
                  <NavLink to="/cicd-pipeline" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Rocket size={17} className="mt-0.5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold">CI/CD Pipeline Studio</p>
                      <p className="text-[11px] text-slate-500">GitHub Actions DAG runner</p>
                    </div>
                  </NavLink>
                  <NavLink to="/code-arena" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Swords size={17} className="mt-0.5 text-rose-500" />
                    <div>
                      <p className="text-xs font-bold">1v1 Code Duel Arena</p>
                      <p className="text-[11px] text-slate-500">Real-time speed coding battles</p>
                    </div>
                  </NavLink>
                  <NavLink to="/cloud-architect" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Cloud size={17} className="mt-0.5 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold">Cloud Architect Studio</p>
                      <p className="text-[11px] text-slate-500">Topology & AWS cost estimator</p>
                    </div>
                  </NavLink>
                  <NavLink to="/security-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <ShieldAlert size={17} className="mt-0.5 text-rose-500" />
                    <div>
                      <p className="text-xs font-bold">OWASP Security Lab</p>
                      <p className="text-[11px] text-slate-500">SQLi, XSS & JWT pentest</p>
                    </div>
                  </NavLink>
                  <NavLink to="/regex-lab" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Binary size={17} className="mt-0.5 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold">Regex & ReDoS Lab</p>
                      <p className="text-[11px] text-slate-500">Pattern tester & backtracking</p>
                    </div>
                  </NavLink>
                  <NavLink to="/load-tester" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Gauge size={17} className="mt-0.5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">API Concurrency Load Tester</p>
                      <p className="text-[11px] text-slate-500">1,000 VUs & k6 script export</p>
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

            {/* Leaderboard Link */}
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Trophy size={16} className="text-amber-500" />
              Leaderboard
            </NavLink>

            {/* Study Buddy Link */}
            <NavLink
              to="/study-buddy"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Users size={16} className="text-teal-500" />
              Study Buddy
            </NavLink>

            {/* Career Dropdown */}
            <div className="relative" ref={careerRef}>
              <button
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setLearnOpen(false);
                  setPracticeOpen(false);
                  setNotifOpen(false);
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
                  <NavLink to="/resume-builder" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <FileText size={17} className="mt-0.5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold">ATS Resume Studio</p>
                      <p className="text-[11px] text-slate-500">Auto-import & PDF export</p>
                    </div>
                  </NavLink>
                  <NavLink to="/portfolio" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Globe size={17} className="mt-0.5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold">Developer Portfolio</p>
                      <p className="text-[11px] text-slate-500">Live shareable resume & stats</p>
                    </div>
                  </NavLink>
                  <NavLink to="/career" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Sparkles size={17} className="mt-0.5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold">AI Career Assistant</p>
                      <p className="text-[11px] text-slate-500">Skill gaps & outreach letters</p>
                    </div>
                  </NavLink>
                  <NavLink to="/jobs" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <BriefcaseBusiness size={17} className="mt-0.5 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold">Job Tracker</p>
                      <p className="text-[11px] text-slate-500">Pipeline & interview dates</p>
                    </div>
                  </NavLink>
                  <NavLink to="/salary-radar" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <DollarSign size={17} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Tech Salary Radar</p>
                      <p className="text-[11px] text-slate-500">Levels TC & RSU vesting</p>
                    </div>
                  </NavLink>
                  <NavLink to="/certificates" className="flex items-start gap-3 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Award size={17} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold">Certificates</p>
                      <p className="text-[11px] text-slate-500">Verified credentials & lookup</p>
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

          {/* Right Controls: Notifications + Dark Mode Toggle + Profile + Logout */}
          <div className="hidden items-center gap-2.5 md:flex">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 z-50 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-semibold text-brand-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-xl p-2.5 text-xs transition space-y-1 ${
                          n.unread
                            ? "bg-brand-50/70 border border-brand-100 dark:bg-brand-950/40 dark:border-brand-900"
                            : "bg-slate-50/60 dark:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <span className="text-[9px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Profile Pill */}
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

            {/* Logout */}
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
              <NavLink to="/leaderboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Trophy size={17} className="text-amber-500" /> Global Leaderboard
              </NavLink>
              <NavLink to="/study-buddy" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Users size={17} className="text-teal-500" /> Study Buddy Network
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
              <NavLink to="/scale-hub" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Server size={17} className="text-sky-500" /> Enterprise Scale & SRE Hub
              </NavLink>
              <NavLink to="/query-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Database size={17} /> SQL & Mongo Query Lab
              </NavLink>
              <NavLink to="/flashcards" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Brain size={17} /> Smart Flashcards
              </NavLink>
              <NavLink to="/microservices-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Radio size={17} className="text-purple-500" /> Kafka & Event Bus
              </NavLink>
              <NavLink to="/erd-studio" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Table size={17} className="text-blue-500" /> Database ERD Studio
              </NavLink>
              <NavLink to="/perf-audit" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Zap size={17} className="text-teal-500" /> Web Vitals & Performance
              </NavLink>
              <NavLink to="/design-system" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Palette size={17} className="text-purple-500" /> Design Systems Studio
              </NavLink>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Practice</p>
              <NavLink to="/docker-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Box size={17} className="text-blue-500" /> Docker & Kubernetes
              </NavLink>
              <NavLink to="/cicd-pipeline" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Rocket size={17} className="text-emerald-500" /> CI/CD Pipeline Studio
              </NavLink>
              <NavLink to="/code-arena" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Swords size={17} className="text-rose-500" /> 1v1 Code Duel Arena
              </NavLink>
              <NavLink to="/cloud-architect" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Cloud size={17} className="text-indigo-500" /> Cloud Architect Studio
              </NavLink>
              <NavLink to="/security-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <ShieldAlert size={17} className="text-rose-500" /> OWASP Security Lab
              </NavLink>
              <NavLink to="/regex-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Binary size={17} className="text-sky-500" /> Regex & ReDoS Lab
              </NavLink>
              <NavLink to="/load-tester" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Gauge size={17} className="text-amber-500" /> API Concurrency Load Tester
              </NavLink>
              <NavLink to="/terminal-lab" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Terminal size={17} className="text-emerald-500" /> Git & UNIX Terminal
              </NavLink>
              <NavLink to="/api-tester" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Code2 size={17} className="text-amber-500" /> REST API Client Studio
              </NavLink>
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
              <NavLink to="/resume-builder" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <FileText size={17} /> ATS Resume Studio
              </NavLink>
              <NavLink to="/portfolio" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Globe size={17} /> Live Portfolio
              </NavLink>
              <NavLink to="/salary-radar" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <DollarSign size={17} className="text-emerald-600" /> Tech Salary Radar
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
