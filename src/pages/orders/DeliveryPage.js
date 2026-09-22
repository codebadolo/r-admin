import { useCallback, useEffect, useState } from "react";
import { Card, List, Select, Spin, Tag, Typography, message } from "antd";

import { fetchDeliveries, updateDeliveryStatus } from "../../services/deliveryService";

const { Title } = Typography;
const { Option } = Select;

const STATUS_LABELS = {
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  failed: "Échec",
};

const STATUS_COLORS = {
  preparing: "gold",
  shipped: "purple",
  delivered: "green",
  failed: "red",
};

const MODE_LABELS = {
  standard: "Standard",
  express: "Express",
  retrait: "Retrait en magasin",
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDeliveries();
      setDeliveries(response.data || []);
    } catch (error) {
      message.error("Erreur lors du chargement des livraisons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (deliveryId, status) => {
    setUpdatingId(deliveryId);
    try {
      await updateDeliveryStatus(deliveryId, status);
      message.success("Statut mis à jour");
      await loadData();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du statut");
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Title level={2}>Gestion des Livraisons</Title>
      <Spin spinning={loading} tip="Chargement des livraisons...">
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={deliveries}
          locale={{ emptyText: "Aucune livraison" }}
          renderItem={(item) => (
            <List.Item>
              <Card title={`Livraison #${item.id} — commande #${item.order}`}>
                <p>Mode : {MODE_LABELS[item.mode] || item.mode}</p>
                <p>
                  Statut :{" "}
                  <Select
                    value={item.status}
                    size="small"
                    style={{ width: 170 }}
                    loading={updatingId === item.id}
                    onChange={(value) => handleStatusChange(item.id, value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <Option key={value} value={value}>
                        <Tag color={STATUS_COLORS[value]}>{label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </p>
                <p>Coût : {Number(item.cost || 0).toFixed(2)} €</p>
                <p>Date estimée : {item.estimated_date || "-"}</p>
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </>
  );
}
