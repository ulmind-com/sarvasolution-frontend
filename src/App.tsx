import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "./components/layout/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Genealogy from "./pages/dashboard/Genealogy";
import Store from "./pages/dashboard/Store";
import Wallet from "./pages/dashboard/Wallet";
import UpdateProfile from "./pages/dashboard/UpdateProfile";
import ChangePassword from "./pages/dashboard/ChangePassword";
import CappingReport from "./pages/dashboard/CappingReport";
import IncomeReport from "./pages/dashboard/IncomeReport";

// Admin
import AdminLayout from "./components/layout/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import UserManagement from "./pages/admin/UserManagement";
import PayoutRequests from "./pages/admin/PayoutRequests";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Overview />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/genealogy" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Genealogy />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/store" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Store />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/wallet" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Wallet />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <UpdateProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/change-password" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChangePassword />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/capping" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CappingReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/incomes/:type" element={
        <ProtectedRoute>
          <DashboardLayout>
            <IncomeReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <AdminHome />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <UserManagement />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payouts" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <PayoutRequests />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
