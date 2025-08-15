import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as productService from '../../services/productService';

const { Option } = Select;

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Fonction pour transformer la liste plate des catégories en arbre pour Table.treeData
  const buildTreeData = (items) => {
    const map = {};
    const roots = [];

    // Préparer les noeuds
    items.forEach(cat => {
      map[cat.id] = {
        key: cat.id,
        id: cat.id,
        nom: cat.nom,
        parent_category: cat.parent_category,
        children: [],
      };
    });

    // Remplir les enfants
    items.forEach(cat => {
      if (cat.parent_category) {
        const parent = map[cat.parent_category];
        if (parent) {
          parent.children.push(map[cat.id]);
        } else {
          // cas parent non trouvé, traiter comme racine
          roots.push(map[cat.id]);
        }
      } else {
        roots.push(map[cat.id]);
      }
    });

    // Optionnel : trier enfants par nom
    const sortTree = (nodes) => {
      nodes.sort((a, b) => a.nom.localeCompare(b.nom));
      nodes.forEach(n => n.children && sortTree(n.children));
    };

    sortTree(roots);

    return roots;
  };

  // Chargement des catégories depuis l'API
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchCategories();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
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

  // Ouvre modal avec chargement des valeurs si édition
  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        ...category,
        parent_category: category.parent_category ? category.parent_category : null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Ferme la modal et reset l'état
  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  // Soumission du formulaire création/modification
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

  // Suppression avec modal de confirmation
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

  // Colonnes du tableau (sans description, avec arborescence)
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
      render: (record) => {
        // Affiche le parent par nom ou '-'
        const parentCat = categories.find(c => c.id === record.parent_category);
        return parentCat ? parentCat.nom : '-';
      },
      sorter: (a, b) => {
        const aName = categories.find(c => c.id === a.parent_category)?.nom || '';
        const bName = categories.find(c => c.id === b.parent_category)?.nom || '';
        return aName.localeCompare(bName);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              aria-label={`Modifier catégorie ${record.nom}`}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
              aria-label={`Supprimer catégorie ${record.nom}`}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Préparer données arborescentes pour Table
  const treeData = buildTreeData(categories);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openModal()}>
          Ajouter une catégorie
        </Button>
      </Space>

      <Table
        dataSource={treeData}
        columns={columns}
        rowKey="id"
        size='small'
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered

      />

      <Modal
        title={editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Mettre à jour' : 'Créer'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
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
              notFoundContent="Aucune catégorie"
            >
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategorySection;
