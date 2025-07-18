import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  createStock,
  deleteStock,
  fetchProducts,
  fetchStocks,
  fetchWarehouses,
  updateStock,
} from "../services/productService";

const { Option } = Select;
const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#336AAA'];

export default function StockPage() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [stocksData, productsData, warehousesData] = await Promise.all([
          fetchStocks(),
          fetchProducts(),
          fetchWarehouses(),
        ]);
        setStocks(stocksData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (e) {
        message.error("Erreur de chargement des données");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Statistiques calculées
  const totalUnits = stocks.reduce((sum, item) => sum + (item.units || 0), 0);
  const distinctProducts = new Set(stocks.map(s => s.product?.id)).size;
  const distinctWarehouses = new Set(stocks.map(s => s.warehouse?.id)).size;

  // Données graphiques : stock par entrepôt
  const stockByWarehouse = warehouses.map((wh) => {
    const total = stocks
      .filter((s) => s.warehouse?.id === wh.id)
      .reduce((sum, s) => sum + (s.units || 0), 0);
    return { name: wh.name, value: total };
  }).filter(w => w.value > 0);

  // Modal & formulaire gestion stock (identique précédent exemple)
  const openModal = (stock = null) => {
    setEditingStock(stock);
    if (stock) {
      form.setFieldsValue({
        product: stock.product?.id,
        warehouse: stock.warehouse?.id,
        units: stock.units,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingStock(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (editingStock) {
        await updateStock(editingStock.id, values);
        message.success("Stock mis à jour");
      } else {
        await createStock(values);
        message.success("Stock créé");
      }
      const updatedStocks = await fetchStocks();
      setStocks(updatedStocks);
      handleCancel();
    } catch (e) {
      message.error("Erreur lors de la sauvegarde");
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleDelete = async (stock) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: `Supprimer le stock pour ${stock.product?.name} en entrepôt ${stock.warehouse?.name} ?`,
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      async onOk() {
        try {
          await deleteStock(stock.id);
          message.success("Stock supprimé");
          setStocks((prev) => prev.filter((s) => s.id !== stock.id));
        } catch (e) {
          message.error("Erreur lors de la suppression");
          console.error(e);
        }
      },
    });
  };

  const columns = [
    { title: "Produit", dataIndex: ["product", "name"], key: "product", sorter: (a, b) => a.product.name.localeCompare(b.product.name) },
    { title: "Entrepôt", dataIndex: ["warehouse", "name"], key: "warehouse", sorter: (a, b) => a.warehouse.name.localeCompare(b.warehouse.name) },
    { title: "Quantité", dataIndex: "units", key: "units", sorter: (a, b) => a.units - b.units },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal(record)}>Modifier</Button>
          <Button danger onClick={() => handleDelete(record)}>Supprimer</Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Chargement..." style={{ marginTop: 60, display: "block" }} />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Gestion des stocks</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total unités en stock" value={totalUnits} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Produits distincts" value={distinctProducts} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Entrepôts actifs" value={distinctWarehouses} />
          </Card>
        </Col>
      </Row>

      {/* Graphique de répartition par entrepôt */}
      <Card title="Répartition stock par entrepôt" style={{ marginBottom: 24 }}>
        {stockByWarehouse.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockByWarehouse}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stockByWarehouse.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Aucun stock disponible</p>
        )}
      </Card>

      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        Ajouter un stock
      </Button>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={stocks}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        visible={modalVisible}
        title={editingStock ? "Modifier un stock" : "Ajouter un stock"}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okButtonProps={{ loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="product"
            label="Produit"
            rules={[{ required: true, message: "Sélectionnez un produit" }]}
          >
            <Select showSearch placeholder="Sélectionnez un produit" optionFilterProp="children">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="warehouse"
            label="Entrepôt"
            rules={[{ required: true, message: "Sélectionnez un entrepôt" }]}
          >
            <Select showSearch placeholder="Sélectionnez un entrepôt" optionFilterProp="children">
              {warehouses.map((wh) => (
                <Option key={wh.id} value={wh.id}>
                  {wh.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="units"
            label="Quantité"
            rules={[{ required: true, message: "Entrez la quantité" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
