import { ConfigProvider } from 'antd';
import frFR from 'antd/lib/locale/fr_FR';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import AjouterProduit from './pages/AjouterProduit'; // importez votre page
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProductEditPage from "./pages/ProductEditPage";
import UserDetail from './pages/UserDetail';
import UserUpdate from "./pages/UserUpdate"; // si utilisé
// Import des autres pages protégées
import AttributesPage from './pages/AttributesPage';
import BrandsPage from './pages/BrandsPage';
import CataloguePage from './pages/CataloguePage';
import CategoriesPage from './pages/CategoriesPage';
import MediaPage from './pages/MediaPage';
import ProductTypesPage from './pages/ProductTypesPage';
import ProfilePage from "./pages/ProfilePage";
import StockPage from './pages/StockPage';
import VariantsPage from './pages/VariantsPage';

import KeysPage from './pages/KeysPage';
import SectionsPage from './pages/SectionsPage';

import PermissionsPage from './pages/PermissionsPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';

import DeliveryPage from './pages/DeliveryPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
function App() {
  return (
    <ConfigProvider locale={frFR}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route publique pour la page de connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes privées protégées */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />

                      {/* Produits */}
                      <Route path="/products/catalogue" element={<CataloguePage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />

                      <Route path="/products/brands" element={<BrandsPage />} />
                      <Route path="/products/categories" element={<CategoriesPage />} />
                      <Route path="/products/types" element={<ProductTypesPage />} />
                      <Route path="/products/attributes" element={<AttributesPage />} />
                      <Route path="/products/inventories" element={<VariantsPage />} />
                      <Route path="/products/media" element={<MediaPage />} />
                      <Route path="/products/stock" element={<StockPage />} />
                      <Route path="/products/create" element={<AjouterProduit />} />
                      <Route path="/products/edit/:id" element={<ProductEditPage />} />
                      {/* Spécifications */}
                      <Route path="/specifications/sections" element={<SectionsPage />} />
                      <Route path="/specifications/keys" element={<KeysPage />} />

                      {/* Utilisateurs & rôles */}
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/users/:id" element={<UserDetail />} />
                       <Route path="/users/edit/:id" element={<UserUpdate />} />
                      <Route path="/roles" element={<RolesPage />} />
                      <Route path="/permissions" element={<PermissionsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
                      {/* Autres modules */}
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/payments" element={<PaymentsPage />} />
                      <Route path="/delivery" element={<DeliveryPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
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
