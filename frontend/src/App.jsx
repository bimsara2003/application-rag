import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import StudentSupport from "./pages/StudentSupport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ThemeToggle from "./components/ThemeToggle";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTicketDetail from "./pages/admin/AdminTicketDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminKnowledgeBase from "./pages/admin/AdminKnowledgeBase";
import StudentTicketDetail from "./pages/StudentTicketDetail";
import StudentProfile from "./pages/StudentProfile";
import KnowledgeBase from "./pages/KnowledgeBase";
import FloatingChat from "./components/FloatingChat";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student-support" element={<StudentSupport />} />

      {/* Student Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket/:id"
        element={
          <ProtectedRoute>
            <StudentTicketDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ticket/:id"
        element={
          <AdminRoute>
            <AdminTicketDetail />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/knowledge-base"
        element={
          <AdminRoute>
            <AdminKnowledgeBase />
          </AdminRoute>
        }
      />

      {/* Student Knowledge Base */}
      <Route
        path="/knowledge-base"
        element={
          <ProtectedRoute>
            <KnowledgeBase />
          </ProtectedRoute>
        }
      />

      {/* Student Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ThemeToggle />
        <FloatingChat />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
