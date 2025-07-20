import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography
} from "antd";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Title } = Typography;

// --- Données fictives enrichies ---

const stats = {
  totalProducts: 500,
  activeProducts: 420,
  totalStocks: 1500,
  users: 1200,
  premiumClients: 220,
  revenue: 158000,
  totalOrders: 150,
  ordersPending: 10,
  ordersDelivered: 120,
};

// Courbe CA/semaine
const salesData = [
  { date: "2025-07-14", ca: 7300 },
  { date: "2025-07-15", ca: 8200 },
  { date: "2025-07-16", ca: 6300 },
  { date: "2025-07-17", ca: 9700 },
  { date: "2025-07-18", ca: 12000 },
  { date: "2025-07-19", ca: 10650 },
  { date: "2025-07-20", ca: 9900 },
];

// Pie chart commandes par statut
const ordersPie = [
  { name: "En cours", value: stats.ordersPending },
  { name: "Livré", value: stats.ordersDelivered },
  { name: "Annulé", value: stats.totalOrders - stats.ordersPending - stats.ordersDelivered },
];
const COLORS = ["#8884d8", "#82ca9d", "#ff6961"];

// Exemple commandes récentes
const ordersData = [
  { key: 1, orderId: "CMD0211", client: "Jean Dupont", date: "2025-07-19", amount: 320, status: "En cours" },
  { key: 2, orderId: "CMD0210", client: "Claire Martin", date: "2025-07-19", amount: 680, status: "Livré" },
  { key: 3, orderId: "CMD0209", client: "Ali Yacoub", date: "2025-07-18", amount: 90, status: "Annulé" },
  { key: 4, orderId: "CMD0208", client: "Paul Lebrun", date: "2025-07-18", amount: 270, status: "Livré" },
  { key: 5, orderId: "CMD0207", client: "Marie Curie", date: "2025-07-17", amount: 180, status: "Livré" },
];

const columns = [
  { title: "Commande ID", dataIndex: "orderId", key: "orderId" },
  { title: "Client", dataIndex: "client", key: "client" },
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Montant (€)", dataIndex: "amount", key: "amount" },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "blue";
      if (status === "Livré") color = "green";
      else if (status === "Annulé") color = "red";
      else if (status === "En cours") color = "orange";
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

const DashboardPage = () => (
  <>
    <Title level={2} style={{ marginBottom: 20 }}>
      Tableau de bord - aperçu global
    </Title>

    {/* Statistiques principales en plusieurs lignes */}
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Produits totaux" value={stats.totalProducts} prefix={<AppstoreOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Produits actifs" value={stats.activeProducts} prefix={<ShoppingCartOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Stocks totaux" value={stats.totalStocks} prefix={<HomeOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Utilisateurs" value={stats.users} prefix={<UserOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Clients premium" value={stats.premiumClients} prefix={<StarOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="CA global (€)" value={stats.revenue} precision={2} prefix={<DollarOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Commandes totales" value={stats.totalOrders} prefix={<AppstoreOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="En cours" value={stats.ordersPending} prefix={<ClockCircleOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8} md={6}>
        <Card>
          <Statistic title="Livrées" value={stats.ordersDelivered} prefix={<CheckCircleOutlined />} />
        </Card>
      </Col>
    </Row>

    {/* Graphiques */}
    <Row gutter={24}>
      <Col xs={24} lg={16} style={{ height: 350 }}>
        <Card title="CA – Évolution semaine">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ca" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8} style={{ height: 350 }}>
        <Card title="Répartition des commandes">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ordersPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {ordersPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>

    {/* Tableau commandes récentes */}
    <Row style={{ marginTop: 24 }}>
      <Col span={24}>
        <Card title="Commandes récentes">
          <Table columns={columns} dataSource={ordersData} pagination={{ pageSize: 5 }} />
        </Card>
      </Col>
    </Row>
  </>
);

export default DashboardPage;
