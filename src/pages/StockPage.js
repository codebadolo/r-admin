import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";

const { Search } = Input;
const { Option } = Select;

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");

  // Chargement des données (à adapter avec votre API)
  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    try {
      // Remplacez par appel API réel
      // const res = await fetchStocks();
      // setStocks(res.data);
      // Exemple statique :
      setStocks([
        {
          id: 1,
          name: "Produit A",
          sku: "SKU123",
          quantity: 150,
          price: 29.99,
          status: "Disponible",
        },
        {
          id: 2,
          name: "Produit B",
          sku: "SKU456",
          quantity: 5,
          price: 59.99,
          status: "Faible stock",
        },
        {
          id: 3,
          name: "Produit C",
          sku: "SKU789",
          quantity: 0,
          price: 19.99,
          status: "Rupture",
        },
      ]);
    } catch {
      message.error("Erreur lors du chargement des stocks");
    }
    setLoading(false);
  };

  // Ouvrir modal création ou édition
  const openModal = (stock = null) => {
    setEditingStock(stock);
    form.resetFields();

    if (stock) {
      form.setFieldsValue(stock);
    }
    setModalVisible(true);
  };

  // Supprimer un stock fictif
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression de ce stock ?",
      okText: "Oui",
      cancelText: "Non",
      onOk() {
        // Remplacer par appel API réel
        setStocks((prev) => prev.filter((s) => s.id !== id));
        message.success("Stock supprimé");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingStock) {
        // Mise à jour en API
        setStocks((prev) =>
          prev.map((s) => (s.id === editingStock.id ? { ...s, ...values } : s))
        );
        message.success("Stock mis à jour");
      } else {
        // Création en API
        const newStock = { id: Date.now(), ...values };
        setStocks((prev) => [...prev, newStock]);
        message.success("Stock créé");
      }

      setModalVisible(false);
    } catch {
      message.error("Veuillez vérifier les informations saisies");
    }
  };

  // Filtrage simple des stocks
  const filteredStocks = stocks.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Rendu de la colonne statut avec tags colorés
  const renderStatusTag = (status) => {
    switch (status) {
      case "Disponible":
        return <Tag color="green">{status}</Tag>;
      case "Faible stock":
        return <Tag color="orange">{status}</Tag>;
      case "Rupture":
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    { title: "Produit", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Quantité", dataIndex: "quantity", key: "quantity" },
    {
      title: "Prix unitaire",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} €`,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)}>
            Modifier
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher produit ou SKU"
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Ajouter un stock
        </Button>
      </Space>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredStocks}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      )}

      <Modal
        title={editingStock ? "Modifier un stock" : "Ajouter un stock"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Nom du produit"
            name="name"
            rules={[{ required: true, message: "Nom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: "SKU requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Quantité"
            name="quantity"
            rules={[
              { required: true, message: "Quantité requise" },
              {
                type: "number",
                min: 0,
                message: "La quantité doit être positive",
              },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Prix unitaire (€)"
            name="price"
            rules={[
              { required: true, message: "Prix requis" },
              {
                type: "number",
                min: 0,
                message: "Le prix doit être positif",
              },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} step={0.01} />
          </Form.Item>
          <Form.Item
            label="Statut"
            name="status"
            rules={[{ required: true, message: "Statut requis" }]}
          >
            <Select placeholder="Sélectionnez un statut">
              <Option value="Disponible">Disponible</Option>
              <Option value="Faible stock">Faible stock</Option>
              <Option value="Rupture">Rupture</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
