import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { SupervisorLayout } from './components/layout/SupervisorLayout';
import { Login } from './pages/Login';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { Contractors } from './pages/Contractors';
import { ContractorAgreements } from './pages/ContractorAgreements';
import { ContractorPayments } from './pages/ContractorPayments';
import { Projects } from './pages/Projects';
import { DailyReports } from './pages/DailyReports';
import { MonthlyReports } from './pages/MonthlyReports';
import { ContractDetails } from './pages/ContractDetails';
import { SupervisorPortal } from './pages/SupervisorPortal';
import { Users } from './pages/Users';
// Dukamo Marketplace
import { DukamoRegister } from './pages/Dukamo/Register';
import { VerifyEmail } from './pages/Dukamo/VerifyEmail';
import { DukamoLanding } from './pages/Dukamo/Landing';
import { JobBoard } from './pages/Dukamo/JobBoard';
import { JobDetail } from './pages/Dukamo/JobDetail';
import { PostJob } from './pages/Dukamo/PostJob';
import { GigMarket } from './pages/Dukamo/GigMarket';
import { GigDetail } from './pages/Dukamo/GigDetail';
import { PostGig } from './pages/Dukamo/PostGig';
import { WorkerProfilePage } from './pages/Dukamo/WorkerProfile';
import { WorkerDashboard } from './pages/Dukamo/WorkerDashboard';
import { EmployerDashboard } from './pages/Dukamo/EmployerDashboard';
import { SkillsCenter } from './pages/Dukamo/SkillsCenter';
import { DiasporaHub } from './pages/Dukamo/DiasporaHub';
import { DukamoAnalytics } from './pages/Dukamo/Analytics';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/setup-status')
      .then(r => r.json())
      .then(d => setNeedsSetup(d.needs_setup))
      .catch(() => setNeedsSetup(false));
  }, []);

  if (loading || needsSetup === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (needsSetup) {
    return <Routes><Route path="*" element={<Setup />} /></Routes>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<DukamoRegister />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const isDukamoMode = import.meta.env.VITE_APP_MODE === 'dukamo';

  if (isDukamoMode) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DukamoLanding />} />
          <Route path="dukamo" element={<DukamoLanding />} />
          <Route path="dukamo/jobs" element={<JobBoard />} />
          <Route path="dukamo/jobs/post" element={<PostJob />} />
          <Route path="dukamo/jobs/:id" element={<JobDetail />} />
          <Route path="dukamo/gigs" element={<GigMarket />} />
          <Route path="dukamo/gigs/post" element={<PostGig />} />
          <Route path="dukamo/gigs/:id" element={<GigDetail />} />
          <Route path="dukamo/profile/:id" element={<WorkerProfilePage />} />
          <Route path="dukamo/dashboard/worker" element={<WorkerDashboard />} />
          <Route path="dukamo/dashboard/employer" element={<EmployerDashboard />} />
          <Route path="dukamo/skills" element={<SkillsCenter />} />
          <Route path="dukamo/diaspora" element={<DiasporaHub />} />
          <Route path="dukamo/analytics" element={<DukamoAnalytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  if (user.role === 'supervisor') {
    return (
      <Routes>
        <Route element={<SupervisorLayout />}>
          <Route path="/supervisor" element={<SupervisorPortal />} />
        </Route>
        <Route path="*" element={<Navigate to="/supervisor" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Operations routes */}
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="daily-reports" element={<DailyReports />} />
        <Route path="monthly-reports" element={<MonthlyReports />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="agreements" element={<ContractorAgreements />} />
        <Route path="payments" element={<ContractorPayments />} />
        <Route path="contract-details" element={<ContractDetails />} />
        <Route path="users" element={<Users />} />

        {/* Dukamo Marketplace routes */}
        <Route path="dukamo" element={<DukamoLanding />} />
        <Route path="dukamo/jobs" element={<JobBoard />} />
        <Route path="dukamo/jobs/post" element={<PostJob />} />
        <Route path="dukamo/jobs/:id" element={<JobDetail />} />
        <Route path="dukamo/gigs" element={<GigMarket />} />
        <Route path="dukamo/gigs/post" element={<PostGig />} />
        <Route path="dukamo/gigs/:id" element={<GigDetail />} />
        <Route path="dukamo/profile/:id" element={<WorkerProfilePage />} />
        <Route path="dukamo/dashboard/worker" element={<WorkerDashboard />} />
        <Route path="dukamo/dashboard/employer" element={<EmployerDashboard />} />
        <Route path="dukamo/skills" element={<SkillsCenter />} />
        <Route path="dukamo/diaspora" element={<DiasporaHub />} />
        <Route path="dukamo/analytics" element={<DukamoAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
