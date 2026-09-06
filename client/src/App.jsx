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
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function Protected({ children, admin=false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">Loading SkillTrack...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function Router() {
 return <Routes>
  <Route path="/login" element={<Login/>}/>
  <Route path="/register" element={<Register/>}/>
  <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
  <Route element={<Protected><AppLayout/></Protected>}>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/courses" element={<Courses/>}/>
    <Route path="/courses/:id" element={<CourseDetails/>}/>
    <Route path="/career" element={<Career/>}/>
    <Route path="/jobs" element={<Jobs/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/admin" element={<Protected admin><Admin/></Protected>}/>
  </Route>
  <Route path="*" element={<NotFound/>}/>
 </Routes>
}

export default function App(){return <AuthProvider><Router/></AuthProvider>}
