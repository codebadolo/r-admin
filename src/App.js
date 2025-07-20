import { ConfigProvider } from 'antd';
import frFR from 'antd/lib/locale/fr_FR';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage'; // <-- Page d'accueil publique

import AjouterProduit from './pages/AjouterProduit';
import AttributesPage from './pages/AttributesPage';
import BrandsPage from './pages/BrandsPage';
import CataloguePage from './pages/CataloguePage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import DeliveryPage from './pages/DeliveryPage';
import KeysPage from './pages/KeysPage';
import LoginPage from './pages/LoginPage';
import MediaPage from './pages/MediaPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import PermissionsPage from './pages/PermissionsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductEditPage from "./pages/ProductEditPage";
import ProductTypesPage from './pages/ProductTypesPage';
import ReportsPage from './pages/ReportsPage';
import RolesPage from './pages/RolesPage';
import SectionsPage from './pages/SectionsPage';
import SettingsPage from './pages/SettingsPage';
import StockPage from './pages/StockPage';
import UserDetail from './pages/UserDetail';
import UsersPage from './pages/UsersPage';
import VariantsPage from './pages/VariantsPage';

function App() {
  return (
    <ConfigProvider locale={frFR}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Page d’accueil publique - accessible sans login */}
            <Route path="/" element={<HomePage />} />

            {/* Page de connexion publique */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes privées sous PrivateRoute */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/" element={<DashboardPage />} />

                      {/* Produits */}
                      <Route path="products/catalogue" element={<CataloguePage />} />
                      <Route path="products/:id" element={<ProductDetailPage />} />
                      <Route path="products/brands" element={<BrandsPage />} />
                      <Route path="products/categories" element={<CategoriesPage />} />
                      <Route path="products/types" element={<ProductTypesPage />} />
                      <Route path="products/attributes" element={<AttributesPage />} />
                      <Route path="products/inventories" element={<VariantsPage />} />
                      <Route path="products/media" element={<MediaPage />} />
                      <Route path="products/stock" element={<StockPage />} />
                      <Route path="products/create" element={<AjouterProduit />} />
                      <Route path="products/edit/:id" element={<ProductEditPage />} />

                      {/* Spécifications */}
                      <Route path="specifications/sections" element={<SectionsPage />} />
                      <Route path="specifications/keys" element={<KeysPage />} />

                      {/* Utilisateurs & rôles */}
                      <Route path="users" element={<UsersPage />} />
                      <Route path="users/:id" element={<UserDetail />} />
                      <Route path="roles" element={<RolesPage />} />
                      <Route path="permissions" element={<PermissionsPage />} />

                      {/* Autres modules */}
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="payments" element={<PaymentsPage />} />
                      <Route path="delivery" element={<DeliveryPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
