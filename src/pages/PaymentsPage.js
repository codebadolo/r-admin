import { Table, Tag, Typography } from 'antd';

const { Title } = Typography;

const columns = [
  { title: 'Paiement ID', dataIndex: 'id', key: 'id' },
  { title: 'Commande ID', dataIndex: 'orderId', key: 'orderId' },
  { title: 'Montant (€)', dataIndex: 'amount', key: 'amount' },
  { title: 'Méthode', dataIndex: 'method', key: 'method' },
  {
    title: 'Statut',
    dataIndex: 'status',
    key: 'status',
    render: status => {
      let color = 'orange';
      if (status === 'Validé') color = 'green';
      else if (status === 'Refusé') color = 'red';
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

const data = [
  { key: 1, id: 'PAY001', orderId: 'CMD001', amount: 120, method: 'Orange Money', status: 'Validé' },
  { key: 2, id: 'PAY002', orderId: 'CMD002', amount: 250, method: 'Visa', status: 'En attente' },
];

const PaymentsPage = () => (
  <>
    <Title level={2}>Suivi des Paiements</Title>
    <Table columns={columns} dataSource={data} />
  </>
);

export default PaymentsPage;
