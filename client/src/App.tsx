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
    return <Routes><Route path="*" element={<Login />} /></Routes>;
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
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="daily-reports" element={<DailyReports />} />
        <Route path="monthly-reports" element={<MonthlyReports />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="agreements" element={<ContractorAgreements />} />
        <Route path="payments" element={<ContractorPayments />} />
        <Route path="contract-details" element={<ContractDetails />} />
        <Route path="users" element={<Users />} />
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
