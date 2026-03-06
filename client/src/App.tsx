import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import { Layout } from './components/layout/Layout';
import { SupervisorLayout } from './components/layout/SupervisorLayout';
import { RoleSelect } from './pages/RoleSelect';
import { Dashboard } from './pages/Dashboard';
import { Contractors } from './pages/Contractors';
import { ContractorAgreements } from './pages/ContractorAgreements';
import { ContractorPayments } from './pages/ContractorPayments';
import { OperationalPlans } from './pages/OperationalPlans';
import { DailyReports } from './pages/DailyReports';
import { MonthlyReports } from './pages/MonthlyReports';
import { ContractDetails } from './pages/ContractDetails';
import { SupervisorPortal } from './pages/SupervisorPortal';

function AppRoutes() {
  const { role } = useRole();

  if (!role) {
    return (
      <Routes>
        <Route path="*" element={<RoleSelect />} />
      </Routes>
    );
  }

  if (role === 'supervisor') {
    return (
      <Routes>
        <Route element={<SupervisorLayout />}>
          <Route path="/supervisor" element={<SupervisorPortal />} />
        </Route>
        <Route path="*" element={<Navigate to="/supervisor" replace />} />
      </Routes>
    );
  }

  // Manager: full access
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="agreements" element={<ContractorAgreements />} />
        <Route path="payments" element={<ContractorPayments />} />
        <Route path="operational-plans" element={<OperationalPlans />} />
        <Route path="daily-reports" element={<DailyReports />} />
        <Route path="monthly-reports" element={<MonthlyReports />} />
        <Route path="contract-details" element={<ContractDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
