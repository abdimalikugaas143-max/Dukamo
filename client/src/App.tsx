import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
// Auth pages
import { Login } from './pages/Login';
import { Setup } from './pages/Setup';
import { DukamoRegister } from './pages/Dukamo/Register';
import { VerifyEmail } from './pages/Dukamo/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
// Dukamo Marketplace
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
import { Messages } from './pages/Dukamo/Messages';
import { GlobalTalent } from './pages/Dukamo/GlobalTalent';
import { Referrals } from './pages/Dukamo/Referrals';
import { OnboardingWizard } from './pages/Dukamo/OnboardingWizard';
import { AdminDashboard } from './pages/Dukamo/AdminDashboard';
import { Payments } from './pages/Dukamo/Payments';
import { Users } from './pages/Users';

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
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Shared Dukamo routes (all authenticated roles)
  const sharedRoutes = (
    <>
      <Route path="jobs" element={<JobBoard />} />
      <Route path="jobs/post" element={<PostJob />} />
      <Route path="jobs/:id" element={<JobDetail />} />
      <Route path="gigs" element={<GigMarket />} />
      <Route path="gigs/post" element={<PostGig />} />
      <Route path="gigs/:id" element={<GigDetail />} />
      <Route path="profile/:id" element={<WorkerProfilePage />} />
      <Route path="skills" element={<SkillsCenter />} />
      <Route path="diaspora" element={<DiasporaHub />} />
      <Route path="global" element={<GlobalTalent />} />
      <Route path="messages" element={<Messages />} />
      <Route path="referrals" element={<Referrals />} />
      <Route path="payments" element={<Payments />} />
    </>
  );

  if (user.role === 'admin') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<DukamoAnalytics />} />
          {sharedRoutes}
          <Route path="dashboard/worker" element={<WorkerDashboard />} />
          <Route path="dashboard/employer" element={<EmployerDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === 'worker') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={user.profile_complete ? <WorkerDashboard /> : <OnboardingWizard />} />
          <Route path="onboarding" element={<OnboardingWizard />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          {sharedRoutes}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === 'employer') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={user.profile_complete ? <EmployerDashboard /> : <OnboardingWizard />} />
          <Route path="onboarding" element={<OnboardingWizard />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="analytics" element={<DukamoAnalytics />} />
          {sharedRoutes}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return <Routes><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
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
