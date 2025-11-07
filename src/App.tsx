import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import LiveSession from "./pages/LiveSession";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import CourseViewer from "./pages/CourseViewer";
import EducatorDashboard from "./pages/EducatorDashboard";
import Notifications from "./pages/Notifications";
import Forum from "./pages/Forum";
import ForumNewTopic from "./pages/ForumNewTopic";
import ForumTopic from "./pages/ForumTopic";
import StudyGroups from "./pages/StudyGroups";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/session" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/forum/new" element={<ProtectedRoute><ForumNewTopic /></ProtectedRoute>} />
            <Route path="/forum/:topicId" element={<ProtectedRoute><ForumTopic /></ProtectedRoute>} />
            <Route path="/study-groups" element={<ProtectedRoute><StudyGroups /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute><CourseViewer /></ProtectedRoute>} />
            <Route path="/educator" element={<ProtectedRoute allowedRoles={['educator']}><EducatorDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['educator', 'institution']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/institution" element={<ProtectedRoute allowedRoles={['institution']}><AdminDashboard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
