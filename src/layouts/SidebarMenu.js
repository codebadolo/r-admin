import {
  BarChartOutlined,
  CarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './SidebarMenu.css';

const { Sider } = Layout;
const { SubMenu } = Menu;

const SidebarMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  useEffect(() => {
    if (location.pathname.startsWith('/products')) setOpenKeys(['products']);
    else if (location.pathname.startsWith('/specifications')) setOpenKeys(['specifications']);
    else if (
      location.pathname.startsWith('/users') ||
      location.pathname.startsWith('/roles') ||
      location.pathname.startsWith('/permissions')
    )
      setOpenKeys(['users']);
    else setOpenKeys([]);
  }, [location.pathname]);

  const onOpenChange = keys => {
    setOpenKeys(keys);
  };

  const hasRole = roleName => user?.roles?.includes(roleName);

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
        <div onClick={e => { e.stopPropagation(); toggleCollapsed(); }} style={{ fontSize: 18, cursor: 'pointer', color: 'white' }}>
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

        {(hasRole('Admin') || hasRole('Vendeur')) && (
          <SubMenu key="products" icon={<ShopOutlined />} title="Produits">
            <Menu.Item key="/products/catalogue">Catalogue</Menu.Item>
            {hasRole('Admin') && <Menu.Item key="/products/brands">Marques</Menu.Item>}
            <Menu.Item key="/products/categories">Catégories</Menu.Item>
         
          
            <Menu.Item key="/products/stock">Stock</Menu.Item>
          </SubMenu>
        )}

     

        {hasRole('Admin') && (
          <SubMenu key="users" icon={<UserOutlined />} title="Utilisateurs & Rôles">
            <Menu.Item key="/users">Utilisateurs</Menu.Item>
            <Menu.Item key="/roles">Rôles</Menu.Item>
            <Menu.Item key="/permissions">Permissions</Menu.Item>
          </SubMenu>
        )}

        {(hasRole('Admin') || hasRole('Vendeur')) && (
          <>
            <Menu.Item key="/orders" icon={<ShoppingCartOutlined />}>
              Commandes
            </Menu.Item>

            <Menu.Item key="/payments" icon={<CreditCardOutlined />}>
              Paiements
            </Menu.Item>

            <Menu.Item key="/delivery" icon={<CarOutlined />}>
              Livraison
            </Menu.Item>

            <Menu.Item key="/reports" icon={<BarChartOutlined />}>
              Statistiques & Rapports
            </Menu.Item>

            <Menu.Item key="/settings" icon={<SettingOutlined />}>
              Paramètres
            </Menu.Item>
          </>
        )}
      </Menu>
    </Sider>
  );
};

export default SidebarMenu;
