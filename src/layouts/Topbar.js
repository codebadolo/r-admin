import { BellOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useState } from 'react';

const { Header } = Layout;
const { Text } = Typography;

const Topbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleMenuClick = ({ key }) => {
    setDropdownVisible(false);
    if (key === 'logout') {
      // TODO: implémenter déconnexion
      console.log('Déconnexion');
    } else if (key === 'settings') {
      // TODO: ouvrir paramètres
      console.log('Paramètres');
    } else if (key === 'profile') {
      // TODO: ouvrir profil utilisateur
      console.log('Profil');
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Paramètres
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Déconnexion
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px #f0f1f2',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: 20 }}>
        ROH Store - Tableau de bord
      </div>

      <Space size="large" align="center">
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
        </Badge>

        <Dropdown
          overlay={menu}
          trigger={['click']}
          onVisibleChange={setDropdownVisible}
          visible={dropdownVisible}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text strong>Jean Dupont</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Topbar;
