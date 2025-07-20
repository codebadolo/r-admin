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

export default function BrandsManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    try {
      const data = await fetch("/api/brands").then(res => res.json());
      setBrands(data);
    } catch {
      message.error("Erreur lors du chargement des marques");
    } finally {
      setLoading(false);
    }
  }

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      form.setFieldsValue({ name: brand.name });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingBrand(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingBrand) {
        await fetch(`/api/brands/${editingBrand.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Marque modifiée");
      } else {
        await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Marque créée");
      }
      loadBrands();
      handleCancel();
    } catch {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/brands/${id}`, { method: "DELETE" });
      message.success("Marque supprimée");
      loadBrands();
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
        Ajouter une marque
      </Button>

      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        visible={modalVisible}
        title={editingBrand ? "Modifier marque" : "Ajouter marque"}
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
