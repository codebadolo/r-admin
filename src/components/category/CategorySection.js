// src/components/category/CategorySection.js

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import * as productService from '../../services/productService';

const { Option } = Select;

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Chargement des catégories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchCategories();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      message.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Ouvrir modal (création ou modification)
  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      // Préparer les valeurs formulaire, notamment parent_category en ID
      form.setFieldsValue({
        ...category,
        parent_category: category.parent_category ? category.parent_category.id : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Fermer modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  // Envoi formulaire création/modification
  const onFinish = async (values) => {
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, values);
        message.success('Catégorie mise à jour avec succès');
      } else {
        await productService.createCategory(values);
        message.success('Catégorie créée avec succès');
      }
      closeModal();
      loadCategories();
    } catch (error) {
      console.error('Erreur sauvegarde catégorie:', error);
      message.error("Erreur lors de la sauvegarde de la catégorie");
    }
  };

  // Supprimer une catégorie avec confirmation
  const onDelete = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Voulez-vous vraiment supprimer cette catégorie ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await productService.deleteCategory(id);
          message.success('Catégorie supprimée');
          loadCategories();
        } catch (error) {
          console.error('Erreur suppression catégorie:', error);
          message.error("Impossible de supprimer la catégorie");
        }
      },
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
    },
    {
      title: 'Catégorie Parente',
      key: 'parent_category',
      render: (record) => record.parent_category?.nom || '-',
      sorter: (a, b) => {
        const aName = a.parent_category?.nom || '';
        const bName = b.parent_category?.nom || '';
        return aName.localeCompare(bName);
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>Modifier</Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>Supprimer</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openModal()}>
          Ajouter une catégorie
        </Button>
      </Space>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Mettre à jour' : 'Créer'}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Veuillez saisir le nom de la catégorie' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Catégorie Parente" name="parent_category">
            <Select
              allowClear
              placeholder="Sélectionnez une catégorie parente (optionnel)"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id) // ne pas permettre de choisir soi-même comme parent
                .map(cat => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategorySection;
