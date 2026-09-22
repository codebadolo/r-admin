import { useCallback, useEffect, useState } from "react";
import { Button, Spin, Table, Tag, Typography, message } from "antd";

import { fetchPayments, markPaymentPaid } from "../../services/paymentService";

const { Title } = Typography;

const STATUS_LABELS = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const STATUS_COLORS = {
  pending: "gold",
  paid: "green",
  failed: "red",
  refunded: "purple",
};

const METHOD_LABELS = {
  card: "Carte",
  transfer: "Virement",
  cash: "Espèces",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPayments();
      setPayments(response.data || []);
    } catch (error) {
      message.error("Erreur lors du chargement des paiements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkPaid = async (id) => {
    setMarkingId(id);
    try {
      await markPaymentPaid(id);
      message.success("Paiement marqué comme payé");
      await loadData();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du paiement");
      console.error(error);
    } finally {
      setMarkingId(null);
    }
  };

  const columns = [
    { title: "Paiement", dataIndex: "id", key: "id", render: (id) => `#${id}` },
    { title: "Commande", dataIndex: "order", key: "order", render: (id) => `#${id}` },
    {
      title: "Montant",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${Number(amount || 0).toFixed(2)} €`,
    },
    {
      title: "Méthode",
      dataIndex: "method",
      key: "method",
      render: (method) => METHOD_LABELS[method] || method,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status] || status}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.status !== "paid" ? (
          <Button
            type="link"
            loading={markingId === record.id}
            onClick={() => handleMarkPaid(record.id)}
          >
            Marquer payé
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Title level={2}>Suivi des Paiements</Title>
      <Spin spinning={loading} tip="Chargement des paiements...">
        <Table rowKey="id" columns={columns} dataSource={payments} scroll={{ x: "max-content" }} />
      </Spin>
    </>
  );
}
