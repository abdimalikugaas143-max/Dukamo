import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contractors } from './pages/Contractors';
import { ContractorAgreements } from './pages/ContractorAgreements';
import { ContractorPayments } from './pages/ContractorPayments';
import { OperationalPlans } from './pages/OperationalPlans';
import { DailyReports } from './pages/DailyReports';
import { MonthlyReports } from './pages/MonthlyReports';
import { ContractDetails } from './pages/ContractDetails';

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
