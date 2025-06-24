import { List, Tag, Typography } from 'antd';

const { Title } = Typography;

const permissions = [
  { id: 1, name: 'Voir produits', description: 'Peut consulter les produits', level: 'Lecture' },
  { id: 2, name: 'Modifier commandes', description: 'Peut modifier les commandes', level: 'Écriture' },
];

const PermissionsPage = () => (
  <>
    <Title level={2}>Gestion des Permissions</Title>
    <List
      itemLayout="horizontal"
      dataSource={permissions}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            title={item.name}
            description={item.description}
          />
          <Tag color={item.level === 'Écriture' ? 'volcano' : 'blue'}>{item.level}</Tag>
        </List.Item>
      )}
    />
  </>
);

export default PermissionsPage;
