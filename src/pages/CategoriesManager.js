import { Button, Form, Input, message, Modal, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import {
    createCategory,
    deleteCategory,
    fetchCategories,
    updateCategory,
} from "../services/productService"; // adapte le chemin si besoin

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      message.error("Erreur chargement catégories");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId || null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success("Catégorie modifiée");
      } else {
        await createCategory(values);
        message.success("Catégorie créée");
      }
      await loadCategories();
      handleCancel();
    } catch (error) {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success("Catégorie supprimée");
      await loadCategories();
    } catch (error) {
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
        Ajouter une catégorie
      </Button>

      <Table
        loading={loading}
        dataSource={categories}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        visible={modalVisible}
        title={editingCategory ? "Modifier catégorie" : "Ajouter catégorie"}
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

          {/* Décommenter si vous gérez le parent
          <Form.Item name="parentId" label="Catégorie parente">
            <Select allowClear>
              {categories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
}
