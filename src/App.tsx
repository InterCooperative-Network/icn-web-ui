import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import { GovernancePage } from './pages/GovernancePage';
import { AccountPage } from './pages/AccountPage';
import { NetworkPage } from './pages/NetworkPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="governance" element={<GovernancePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
