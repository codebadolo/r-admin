import { Table, Tag, Typography } from 'antd';

const { Title } = Typography;

const columns = [
  { title: 'Commande ID', dataIndex: 'id', key: 'id' },
  { title: 'Client', dataIndex: 'client', key: 'client' },
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Montant (€)', dataIndex: 'amount', key: 'amount' },
  {
    title: 'Statut',
    dataIndex: 'status',
    key: 'status',
    render: status => {
      let color = 'blue';
      if (status === 'Livré') color = 'green';
      else if (status === 'Annulé') color = 'red';
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

const data = [
  { key: 1, id: 'CMD001', client: 'Jean Dupont', date: '2025-06-15', amount: 120, status: 'En cours' },
  { key: 2, id: 'CMD002', client: 'Marie Curie', date: '2025-06-13', amount: 250, status: 'Livré' },
];

const OrdersPage = () => (
  <>
    <Title level={2}>Gestion des Commandes</Title>
    <Table columns={columns} dataSource={data} />
  </>
);

export default OrdersPage;
