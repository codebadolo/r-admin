import { Card, List, Tag, Typography } from 'antd';

const { Title } = Typography;

const deliveries = [
  { id: 1, mode: 'Express', status: 'En cours', cost: 15, estimated: '2025-06-25' },
  { id: 2, mode: 'Standard', status: 'Livré', cost: 5, estimated: '2025-06-20' },
];

const DeliveryPage = () => (
  <>
    <Title level={2}>Gestion des Livraisons</Title>
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={deliveries}
      renderItem={item => (
        <List.Item>
          <Card title={`Livraison #${item.id}`}>
            <p>Mode : {item.mode}</p>
            <p>Statut : <Tag color={item.status === 'Livré' ? 'green' : 'orange'}>{item.status}</Tag></p>
            <p>Coût : {item.cost} €</p>
            <p>Date estimée : {item.estimated}</p>
          </Card>
        </List.Item>
      )}
    />
  </>
);

export default DeliveryPage;
