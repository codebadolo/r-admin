import {
  BarChartOutlined,
  CarOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ShopOutlined,
  UserOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './SidebarMenu.css';
import { useAuth } from '../hooks/useAuth';
const { Sider } = Layout;
const { SubMenu } = Menu;

const SidebarMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  // Check if user has any of the given roles (match by role.name)
  const hasRole = (...roleNames) => {
    if (!user?.roles_detail) return false;  // Adjust if your user object has roles as 'roles_detail'
    return roleNames.some((roleName) =>
      user.roles_detail.some((r) => r.name === roleName)
    );
  };

  useEffect(() => {
    // Open menu section corresponding to current path
    const path = location.pathname;
    if (path.startsWith('/products')) setOpenKeys(['products']);
    else if (path.startsWith('/specifications')) setOpenKeys(['specifications']);
    else if (
      path.startsWith('/users') ||
      path.startsWith('/roles') ||
      path.startsWith('/permissions') ||
      path.startsWith('/profile') ||
      path.startsWith('/connections')
    )
      setOpenKeys(['users']);
    else if (path.startsWith('/orders') || path.startsWith('/payments') || path.startsWith('/delivery'))
      setOpenKeys(['logistics']);
    else if (path.startsWith('/promotions') || path.startsWith('/coupons'))
      setOpenKeys(['promotions']);
    else if (path.startsWith('/marketing') || path.startsWith('/newsletters'))
      setOpenKeys(['marketing']);
    else setOpenKeys([]);
  }, [location.pathname]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  if (loading) {
    return (
      <Sider collapsible collapsed={collapsed} trigger={null} width={260} style={{ minHeight: '100vh' }}>
        <div className="sidebar-logo" style={{ padding: '16px', color: 'white', textAlign: 'center' }}>
          <Spin tip="Chargement..." />
        </div>
      </Sider>
    );
  }

  return (
    <Sider collapsible collapsed={collapsed} trigger={null} width={260} style={{ minHeight: '100vh' }}>
      <div
        className="sidebar-logo"
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}
        title="Accueil"
      >
        {!collapsed && (
          <>
            <img src="/logo192.png" alt="Logo" style={{ height: 40, cursor: 'pointer' }} />
            <span style={{ marginLeft: 8, fontWeight: 'bold', color: 'white', userSelect: 'none' }}>ROH Store</span>
          </>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapsed();
          }}
          style={{ fontSize: 18, cursor: 'pointer', color: 'white' }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={({ key }) => navigate(key)}
        inlineCollapsed={collapsed}
      >
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          Tableau de bord
        </Menu.Item>

        {(hasRole('SuperAdmin', 'Gestionnaire Produit', 'Admin')) && (
          <SubMenu key="products" icon={<ShopOutlined />} title="Produits">
            <Menu.Item key="/products/catalogue">Catalogue</Menu.Item>
            {(hasRole('SuperAdmin', 'Gestionnaire Produit', 'Admin')) && <Menu.Item key="/products/brands">Marques</Menu.Item>}
            <Menu.Item key="/products/categories">Catégories</Menu.Item>
    
            <Menu.Item key="/products/attributes">Attributs</Menu.Item>
            <Menu.Item key="/products/media">Documents & Images</Menu.Item>
            <Menu.Item key="/products/stock">Stock</Menu.Item>
            {(hasRole('SuperAdmin', 'Gestionnaire Produit')) && (
              <>
                <Menu.Item key="/products/create">Ajouter produit</Menu.Item>
                <Menu.Item key="/products/edit/:id" style={{ display: 'none' }} />
              </>
            )}
          </SubMenu>
        )}

        {(hasRole('SuperAdmin', 'Commercial', 'Client')) && (
          <SubMenu key="users" icon={<UserOutlined />} title="Utilisateurs & Profils">
            <Menu.Item key="/users">Liste utilisateurs</Menu.Item>
            <Menu.Item key="/roles">Gestion rôles</Menu.Item>
            <Menu.Item key="/permissions">Permissions</Menu.Item>
            <Menu.Item key="/profile">Mon profil</Menu.Item>
            <Menu.Item key="/addresses">Gestion des adresses</Menu.Item>
            <Menu.Item key="/connections">Historique connexions</Menu.Item>
          </SubMenu>
        )}

        {(hasRole('SuperAdmin', 'OperateurLogistique', 'GestionnaireProduit')) && (
          <SubMenu key="logistics" icon={<CarOutlined />} title="Logistique & Commandes">
            <Menu.Item key="/orders">Commandes</Menu.Item>
            <Menu.Item key="/payments">Paiements</Menu.Item>
            <Menu.Item key="/delivery">Livraison</Menu.Item>
          </SubMenu>
        )}

        {(hasRole('SuperAdmin', 'ResponsableMarketing')) && (
          <SubMenu key="marketing" icon={<MailOutlined />} title="Marketing & Promotions">
            <Menu.Item key="/promotions">Promotions</Menu.Item>
            <Menu.Item key="/coupons">Coupons</Menu.Item>
            <Menu.Item key="/campaigns">Campagnes marketing</Menu.Item>
            <Menu.Item key="/newsletters">Newsletters</Menu.Item>
            <Menu.Item key="/banners">Bannières marketing</Menu.Item>
          </SubMenu>
        )}

        {(hasRole('SuperAdmin', 'ResponsableMarketing', 'GestionnaireProduit')) && (
          <Menu.Item key="/reports" icon={<BarChartOutlined />}>
            Statistiques & Rapports
          </Menu.Item>
        )}

        {(hasRole('SuperAdmin', 'Admin')) && (
          <Menu.Item key="/settings" icon={<SettingOutlined />}>
            Paramètres
          </Menu.Item>
        )}
      </Menu>
    </Sider>
  );
};

export default SidebarMenu;
