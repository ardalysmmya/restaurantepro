import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthGuard from '../components/auth/AuthGuard';
import StoreSelectorPage from '../pages/admin/StoreSelector/StoreSelectorPage';
import DashboardPage from '../pages/admin/Dashboard/DashboardPage';
import POSPage from '../pages/admin/POS/POSPage';
import KDSPage from '../pages/admin/KDS/KDSPage';
import MenuEngineeringPage from '../pages/admin/MenuEngineering/MenuEngineeringPage';
import InventoryPage from '../pages/admin/Inventory/InventoryPage';
import RecipesPage from '../pages/admin/Recipes/RecipesPage';
import CRMPage from '../pages/admin/CRM/CRMPage';
import DigitalMenuPage from '../pages/admin/DigitalMenu/DigitalMenuPage';
import ReportsPage from '../pages/admin/Reports/ReportsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route path="/" element={<AuthGuard><StoreSelectorPage /></AuthGuard>} />
      <Route path="/store/:storeId" element={<AuthGuard><AdminLayout /></AuthGuard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="kds" element={<KDSPage />} />
        <Route path="menu-engineering" element={<MenuEngineeringPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="crm" element={<CRMPage />} />
        <Route path="digital-menu" element={<DigitalMenuPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
