import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import {
  RequireBusinessUnitLeader,
  RequireProductionOperator,
  RequireQualitySupervisor,
} from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import MyEntrysPage from './pages/MyEntrysPage';
import SaleHistoryPage from './pages/SaleHistoryPage';
import ProductionHistoryPage from './pages/ProductionHistoryPage';
import AuditLogPage from './pages/AuditLogPage';
import SummaryReportsPage from './pages/SummaryReportsPage';
import { apiClient } from './api/client';

function App() {
  useEffect(() => {
    apiClient
      .get('/api/Auth/me')
      .then((response) => {
        const { username, role } = response.data;
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
      })
      .catch(() =>{
        localStorage.removeItem('username');
        localStorage.removeItem('role');
      })
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<RequireProductionOperator />}>
            <Route path="/my-entrys" element={<MyEntrysPage />} />
          </Route>

          <Route element={<RequireQualitySupervisor />}>
            <Route path="/sale-history" element={<SaleHistoryPage />} />
            <Route path="/production-history" element={<ProductionHistoryPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>

          <Route element={<RequireBusinessUnitLeader />}>
            <Route path="/summary-reports" element={<SummaryReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;