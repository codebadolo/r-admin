import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, List, Typography } from 'antd';

const { Title } = Typography;

const roles = [
  { id: 1, name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
  { id: 2, name: 'Vendeur', description: 'Gestion des produits et commandes' },
];

const RolesPage = () => (
  <>
    <Title level={2}>Gestion des Rôles</Title>
    <List
      itemLayout="horizontal"
      dataSource={roles}
      renderItem={item => (
        <List.Item
          actions={[
            <Button key="edit" icon={<EditOutlined />} type="primary" size="small" />,
            <Button key="delete" icon={<DeleteOutlined />} type="danger" size="small" />,
          ]}
        >
          <List.Item.Meta
            title={item.name}
            description={item.description}
          />
        </List.Item>
      )}
    />
  </>
);

export default RolesPage;
