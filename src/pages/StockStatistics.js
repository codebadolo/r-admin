import {
  Card,
  Col,
  message,
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
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
import { fetchStocks, fetchWarehouses } from "../services/productService";

const { Title } = Typography;
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA'
];

// Génère 30 jours de données de test à chaque montage
const generateMockStockEvolution = () => {
  const days = 30;
  let data = [];
  for (let i = 1; i <= days; i++) {
    data.push({
      day: `J-${days - i + 1}`,
      stock: Math.floor(500 + Math.random() * 300 - i * 5),
      sold: Math.floor(Math.random() * 50),
    });
  }
  return data;
};

export default function StockStatistics() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockEvolution, setStockEvolution] = useState([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [stocksData, warehousesData] = await Promise.all([
          fetchStocks(), fetchWarehouses()
        ]);
        setStocks(stocksData);
        setWarehouses(warehousesData);
        // Toujours mock (ou remplacer ensuite par des vraies stats d’historique)
        setStockEvolution(generateMockStockEvolution());
      } catch (e) {
        message.error("Erreur de chargement des statistiques");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Spin
        tip="Chargement des statistiques..."
        style={{ marginTop: 60, display: "block" }}
      />
    );
  }

  const totalUnits = stocks.reduce((sum, s) => sum + (s.units || 0), 0);
  const totalUnitsSold = stocks.reduce((sum, s) => sum + (s.units_sold || 0), 0);
  const distinctWarehouses = new Set(stocks.map(s => s.warehouse?.id)).size;

  // Répartition des stocks par entrepôt
  const stockByWarehouse = warehouses
    .map(wh => {
      const total = stocks
        .filter(s => s.warehouse?.id === wh.id)
        .reduce((sum, s) => sum + (s.units || 0), 0);
      return { name: wh.name, value: total };
    })
    .filter(item => item.value > 0);

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>
        Statistiques des stocks
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total unités en stock" value={totalUnits} precision={0} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total unités vendues" value={totalUnitsSold} precision={0} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Entrepôts actifs" value={distinctWarehouses} />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Répartition du stock par entrepôt" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockByWarehouse}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name }) => name}
                >
                  {stockByWarehouse.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Évolution du stock (30 derniers jours)" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stockEvolution}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stock" stroke="#0088FE" name="Stock" />
                <Line type="monotone" dataKey="sold" stroke="#FF8042" name="Ventes" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}
