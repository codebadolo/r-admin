import { ConfigProvider } from 'antd';
import frFR from 'antd/lib/locale/fr_FR';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import PrivateRoute from './components/common/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';





import AjouterProduit from './pages/products/AjouterProduit';
import DashboardPage from './pages/layout/DashboardPage'; // si DashboardPage dans folder layout
import LoginPage from './pages/auth/LoginPage';
import ProductEditPage from './pages/products/ProductEditPage';
import UserDetail from './pages/users/UserDetail';
import UserUpdate from './pages/users/UserUpdate';
import AttributesPage from './pages/attributes/AttributesPage';
import BrandsPage from './pages/brands/BrandsPage';
import CataloguePage from './pages/products/CataloguePage';
import CategoriesPage from './pages/categories/CategoriesPage';
import MediaPage from './pages/products/ProduitMedia';   // si MediaPage déplacé sous products
import ProductTypesPage from './pages/products/ProductTypesPage';
import ProfilePage from './pages/users/ProfilePage'; // ou autre dossier si déplacé

import StockPage from './pages/stock/StockPage'; // déplacer selon où tu as mis StockPage
import VariantsPage from './pages/products/VariantsPage';

import KeysPage from './pages/products/KeysPage'; // si tu as ce dossier
import SectionsPage from './pages/attributes/SectionsPage';

import PermissionsPage from './pages/marketing/PermissionsPage'; // exemple
import RolesPage from './pages/roles/RolesPage';
import UsersPage from './pages/users/UsersPage';

import DeliveryPage from './pages/orders/DeliveryPage';
import OrdersPage from './pages/orders/OrdersPage';
import PaymentsPage from './pages/stock/PaymentsPage';

import ProductDetailPage from './pages/products/ProductDetailPage';
import ReportsPage from './pages/marketing/ReportsPage';
import SettingsPage from './pages/marketing/SettingsPage';

// Import des autres pages protégées


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
