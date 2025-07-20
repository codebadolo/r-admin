import { Layout } from 'antd';
import SidebarMenu from './SidebarMenu';
import Topbar from './Topbar';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SidebarMenu />
      <Layout>
        <Topbar />
        <Content style={{ margin: 16 }}>
          <div
            style={{
              padding: 24,
              background: '#fff',
              minHeight: 360,
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
