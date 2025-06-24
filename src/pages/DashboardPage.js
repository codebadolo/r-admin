import { DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Table, Typography } from 'antd';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const { Title } = Typography;

// Données exemples pour graphiques
const salesData = [
  { date: '2025-06-01', ventes: 4000 },
  { date: '2025-06-02', ventes: 3000 },
  { date: '2025-06-03', ventes: 5000 },
  { date: '2025-06-04', ventes: 4000 },
  { date: '2025-06-05', ventes: 6000 },
  { date: '2025-06-06', ventes: 7000 },
  { date: '2025-06-07', ventes: 8000 },
];

// Données exemples pour tableau
const ordersData = [
  { key: 1, orderId: 'CMD001', client: 'Jean Dupont', date: '2025-06-15', amount: 120, status: 'En cours' },
  { key: 2, orderId: 'CMD002', client: 'Marie Curie', date: '2025-06-13', amount: 250, status: 'Livré' },
  { key: 3, orderId: 'CMD003', client: 'Paul Martin', date: '2025-06-14', amount: 180, status: 'Annulé' },
];

const columns = [
  { title: 'Commande ID', dataIndex: 'orderId', key: 'orderId' },
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
      return <span style={{ color }}>{status}</span>;
    },
  },
];

const DashboardPage = () => (
  <>
    <Title level={2}>Tableau de bord</Title>

    <Row gutter={16}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="Produits en stock" value={120} prefix={<ShoppingCartOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="Utilisateurs actifs" value={75} prefix={<UserOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="Chiffre d'affaires (€)" value={15000} prefix={<DollarOutlined />} precision={2} />
        </Card>
      </Col>
    </Row>

    <Row gutter={24} style={{ marginTop: 24 }}>
      <Col xs={24} lg={12} style={{ height: 300 }}>
        <Card title="Évolution des ventes">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ventes" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Commandes récentes">
          <Table columns={columns} dataSource={ordersData} pagination={{ pageSize: 5 }} />
        </Card>
      </Col>
    </Row>
  </>
);

export default DashboardPage;
