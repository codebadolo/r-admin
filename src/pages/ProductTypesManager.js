import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Table,
} from "antd";
import { useEffect, useState } from "react";

export default function ProductTypesManager() {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadProductTypes();
  }, []);

  async function loadProductTypes() {
    setLoading(true);
    try {
      const data = await fetch("/api/product-types").then(res => res.json());
      setProductTypes(data);
    } catch {
      message.error("Erreur lors du chargement des types de produits");
    } finally {
      setLoading(false);
    }
  }

  const openModal = (productType = null) => {
    setEditingProductType(productType);
    if (productType) {
      form.setFieldsValue({ name: productType.name });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingProductType(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingProductType) {
        await fetch(`/api/product-types/${editingProductType.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Type de produit modifié");
      } else {
        await fetch("/api/product-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Type de produit créé");
      }
      loadProductTypes();
      handleCancel();
    } catch {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/product-types/${id}`, { method: "DELETE" });
      message.success("Type de produit supprimé");
      loadProductTypes();
    } catch {
      message.error("Erreur lors de la suppression");
    }
  };

  const columns = [
    { title: "Nom", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => openModal(record)} style={{ marginRight: 8 }}>
            Modifier
          </Button>
          <Popconfirm
            title="Confirmer la suppression ?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        Ajouter un type de produit
      </Button>

      <Table
        dataSource={productTypes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        visible={modalVisible}
        title={editingProductType ? "Modifier type de produit" : "Ajouter type de produit"}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: "Veuillez saisir un nom" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
