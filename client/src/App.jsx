import React, { Component, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth";
import AppLayout from "./layouts/AppLayout";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Career from "./pages/Career";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import MindGym from "./pages/MindGym";
import StudyNotes from "./pages/StudyNotes";
import Achievements from "./pages/Achievements";
import MockInterview from "./pages/MockInterview";
import CodeLab from "./pages/CodeLab";
import Roadmaps from "./pages/Roadmaps";
import FocusStation from "./pages/FocusStation";
import Certificates from "./pages/Certificates";
import SystemDesign from "./pages/SystemDesign";
import Community from "./pages/Community";
import Flashcards from "./pages/Flashcards";
import ProjectsStudio from "./pages/ProjectsStudio";
import PortfolioView from "./pages/PortfolioView";
import QueryLab from "./pages/QueryLab";
import ResumeBuilder from "./pages/ResumeBuilder";
import ApiTester from "./pages/ApiTester";
import TerminalLab from "./pages/TerminalLab";
import Leaderboard from "./pages/Leaderboard";
import StudyBuddy from "./pages/StudyBuddy";
import DockerLab from "./pages/DockerLab";
import MicroservicesLab from "./pages/MicroservicesLab";
import CicdPipeline from "./pages/CicdPipeline";
import CodeArena from "./pages/CodeArena";
import NotFound from "./pages/NotFound";

const Admin = lazy(() => import("./pages/Admin"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("SkillTrack UI caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div className="max-w-md bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <h2 className="text-xl font-bold">Dashboard recovered</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || "An unexpected rendering issue occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/dashboard";
              }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        Loading SkillTrack...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/system-design" element={<SystemDesign />} />
        <Route path="/query-lab" element={<QueryLab />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/codelab" element={<CodeLab />} />
        <Route path="/projects" element={<ProjectsStudio />} />
        <Route path="/focus" element={<FocusStation />} />
        <Route path="/community" element={<Community />} />
        <Route path="/career" element={<Career />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/portfolio" element={<PortfolioView />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/api-tester" element={<ApiTester />} />
        <Route path="/terminal-lab" element={<TerminalLab />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/study-buddy" element={<StudyBuddy />} />
        <Route path="/docker-lab" element={<DockerLab />} />
        <Route path="/microservices-lab" element={<MicroservicesLab />} />
        <Route path="/cicd-pipeline" element={<CicdPipeline />} />
        <Route path="/code-arena" element={<CodeArena />} />
        <Route path="/mind-gym" element={<MindGym />} />
        <Route path="/notes" element={<StudyNotes />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <Protected admin>
              <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading analytics...</div>}>
                <Admin />
              </Suspense>
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </AuthProvider>
  );
}
