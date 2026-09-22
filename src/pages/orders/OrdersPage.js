import { useCallback, useEffect, useState } from "react";
import {
  Breadcrumb,
  Card,
  Col,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";

import { fetchOrders, updateOrderStatus } from "../../services/orderService";

const { Title } = Typography;
const { Option } = Select;

const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS = {
  pending: "gold",
  confirmed: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrders();
      setOrders(response.data || []);
    } catch (error) {
      message.error("Erreur lors du chargement des commandes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      message.success("Statut mis à jour");
      await loadData();
    } catch (error) {
      const detail = error.response?.data?.detail;
      message.error(detail || "Erreur lors de la mise à jour du statut");
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalOrders = orders.length;
  const countByStatus = (status) => orders.filter((o) => o.status === status).length;

  const columns = [
    { title: "Commande", dataIndex: "id", key: "id", render: (id) => `#${id}` },
    {
      title: "Client",
      key: "client",
      render: (_, record) => record.user?.nom_complet || record.user?.email || "-",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: "Articles",
      key: "items",
      render: (_, record) => record.items?.length || 0,
    },
    {
      title: "Montant HT",
      dataIndex: "total_ht",
      key: "total_ht",
      render: (total) => `${Number(total || 0).toFixed(2)} €`,
    },
    {
      title: "Statut",
      key: "status",
      render: (_, record) => (
        <Select
          value={record.status}
          size="small"
          style={{ width: 150 }}
          loading={updatingId === record.id}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <Option key={value} value={value}>
              <Tag color={STATUS_COLORS[value]}>{label}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Commandes</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={2} style={{ marginTop: 8 }}>
            Gestion des commandes
          </Title>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total commandes"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="En attente"
              value={countByStatus("pending")}
              valueStyle={{ color: "#d4b106" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Confirmées"
              value={countByStatus("confirmed")}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Livrées"
              value={countByStatus("delivered")}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading} tip="Chargement des commandes...">
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </>
  );
}
