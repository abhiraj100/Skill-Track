import { lazy, Suspense } from "react";
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
import NotFound from "./pages/NotFound";

const Admin = lazy(() => import("./pages/Admin"));

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
      <Router />
    </AuthProvider>
  );
}
