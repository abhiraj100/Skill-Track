import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  BookMarked,
  Boxes,
  Brain,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  Flame,
  FolderGit2,
  Globe,
  Headphones,
  Layers,
  MapPin,
  Medal,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
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
    Promise.all([
      api.get("/courses"),
      api.get("/courses/mine"),
      api.get("/jobs"),
      api.get("/progress/study-summary")
    ])
      .then(([c, e, j, s]) => {
        setCourses(c.data.courses || []);
        setEnrollments(e.data.enrollments || []);
        setJobs(j.data.jobs || []);
        setStudy(s.data);
      })
      .catch(() => toast.error("Could not load your dashboard"));
  }, []);

  async function logStudyTime(minutes) {
    setLogging(true);
    try {
      await api.post("/progress/study-log", { minutes });
      const { data } = await api.get("/progress/study-summary");
      setStudy(data);
      toast.success(`${minutes} minutes added to your learning goal`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not log study time");
    } finally {
      setLogging(false);
    }
  }

  const completed = enrollments.filter((e) => e.progress === 100).length;
  const avg = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length)
    : 0;

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-mint p-6 text-white shadow-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/70">Your unified career & learning workspace</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-white/80">
              Your active career track is <strong className="text-white">{user?.careerGoal}</strong>. Build real skills with interactive labs, system design simulations, community Q&A, and verified credentials.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-slate-100 shadow-sm" to="/system-design">
                System Design Arena
              </Link>
              <Link className="rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/30 backdrop-blur" to="/interview">
                AI Mock Interview
              </Link>
              <Link className="rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/30 backdrop-blur" to="/community">
                Community Forum
              </Link>
              <Link className="rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/30 backdrop-blur" to="/portfolio">
                My Portfolio
              </Link>
            </div>
          </div>
          <div className="hidden rounded-3xl bg-white/10 p-5 text-center lg:block">
            <Target size={44} className="mx-auto" />
            <p className="mt-4 text-xs text-white/70">Learning Momentum</p>
            <p className="mt-1 text-4xl font-extrabold">{avg}%</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Enrolled Courses" value={enrollments.length} hint="active tracks" icon={BookOpen} />
        <StatCard label="Completed" value={completed} hint="mastered courses" icon={Award} />
        <StatCard label="Avg. Progress" value={`${avg}%`} hint="across all courses" icon={TrendingUp} />
        <StatCard label="Job Pipeline" value={jobs.length} hint="tracked opportunities" icon={BriefcaseBusiness} />
      </section>

      {/* Flagship Interactive Feature Hub */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">Interactive Training Arena</h2>
            <p className="mt-1 text-sm text-slate-500">Accelerate your readiness with hands-on labs and simulations.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/system-design"
            className="card group flex flex-col justify-between overflow-hidden border-violet-100 p-5 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                <Boxes size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">System Design Arena</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Interactive architecture canvas, real case studies (TinyURL, Netflix), and QPS capacity calculator.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-violet-600">
              Open Studio <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/interview"
            className="card group flex flex-col justify-between overflow-hidden border-indigo-100 p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <BrainCircuit size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">AI Mock Interview</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Simulate role-specific interviews with instant speech-to-text, multi-criteria AI scoring, and model answers.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
              Launch Arena <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/community"
            className="card group flex flex-col justify-between overflow-hidden border-teal-100 p-5 transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                <MessagesSquare size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Community Discussions</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Peer Q&A channels, upvoting, accepted solutions, and project review showcase.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-600">
              Join Forum <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/codelab"
            className="card group flex flex-col justify-between overflow-hidden border-sky-100 p-5 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">
                <Code2 size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Code Lab & Algorithms</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                In-browser algorithm playground with live execution, custom test runner, and hints.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600">
              Open Code Lab <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/flashcards"
            className="card group flex flex-col justify-between overflow-hidden border-rose-100 p-5 transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white">
                <Brain size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Smart Flashcards</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Spaced repetition revision with 3D flip animations for JS quirks, React 18, and Big-O.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600">
              Review Decks <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/projects"
            className="card group flex flex-col justify-between overflow-hidden border-blue-100 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <FolderGit2 size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Capstone Studio</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Guided real-world portfolio projects: collaborative editor, task queue, and Stripe SaaS.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              View Capstones <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/roadmaps"
            className="card group flex flex-col justify-between overflow-hidden border-emerald-100 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <MapPin size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Visual Skill Trees</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Interactive tier-by-tier roadmaps for MERN, React Architect, Cloud Backend, and DevOps.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
              Explore Roadmaps <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/focus"
            className="card group flex flex-col justify-between overflow-hidden border-slate-200 p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                <Headphones size={20} />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Deep Focus & Audio</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pomodoro intervals with native synthesized ambient rain, alpha waves, and streak auto-sync.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-700">
              Start Focus <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* Middle Grid: Continue Learning + Daily Goals & Quick Tools */}
      <section className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="section-title">Continue learning</h2>
              <p className="mt-1 text-sm text-slate-500">Pick up right where you left off.</p>
            </div>
            <Link to="/courses" className="hidden text-sm font-semibold text-brand-600 sm:block">
              View all
            </Link>
          </div>

          {enrollments.length ? (
            <div className="space-y-3">
              {enrollments.slice(0, 3).map((item) => (
                <div key={item._id} className="card flex gap-4 p-4">
                  <img src={item.course.thumbnail} className="hidden h-24 w-32 rounded-xl object-cover sm:block" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{item.course.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.course.difficulty} · {item.course.duration}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-brand-600">{item.progress}%</span>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={item.progress} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Link to={`/courses/${item.course._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-brand-600">
                        Continue <ArrowRight size={15} />
                      </Link>
                      {item.progress === 100 && (
                        <Link to="/certificates" className="text-xs font-bold text-amber-600 hover:underline">
                          View Certificate 🏆
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Flame className="mx-auto text-coral" />
              <h3 className="mt-3 font-bold">Start your learning streak</h3>
              <p className="mt-1 text-sm text-slate-500">Enroll in your first course and build momentum.</p>
              <Link className="btn-primary mt-4" to="/courses">
                Browse courses
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: Study Goal + Quick Cards */}
        <div className="space-y-6">
          <StudyGoal summary={study} logging={logging} onLog={logStudyTime} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/portfolio"
              className="block rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-teal-700">
                    <Globe size={18} />
                    <span className="text-xs font-bold tracking-wide">PORTFOLIO</span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">Developer Profile</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Share your verified certificates, projects, and export your resume.
                  </p>
                </div>
                <ArrowRight className="mt-1 text-teal-700" />
              </div>
            </Link>

            <Link
              to="/certificates"
              className="block rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-bold tracking-wide">CREDENTIALS</span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">Course Certificates</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    View verified credentials or check authenticity via public verification hash.
                  </p>
                </div>
                <ArrowRight className="mt-1 text-amber-700" />
              </div>
            </Link>

            <Link
              to="/mind-gym"
              className="block overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-cyan-600 p-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white/70">
                    <BrainCircuit size={18} />
                    <span className="text-xs font-bold tracking-wide">MIND GYM</span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold">60-second brain break</h3>
                  <p className="mt-1 text-xs leading-5 text-white/80">Boost focus with a mental calculation sprint.</p>
                </div>
                <ArrowRight className="mt-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
