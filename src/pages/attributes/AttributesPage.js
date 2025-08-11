// src/pages/attributes/AttributesPage.js

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Checkbox, InputNumber, message, Typography } from 'antd';
import * as productService from '../../services/productService'; // On utilise les exports nommés

const { Title } = Typography;
const { Option } = Select;

const DATA_TYPE_OPTIONS = [
  { label: 'Texte', value: 'string' },
  { label: 'Nombre entier', value: 'int' },
  { label: 'Booléen', value: 'bool' },
  { label: 'Liste', value: 'list' },
  { label: 'Nombre décimal', value: 'float' },
];

const AttributesPage = () => {
  const [specKeys, setSpecKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSpecKey, setEditingSpecKey] = useState(null);
  const [form] = Form.useForm();

  // Charger la liste des SpecKeys
  const loadSpecKeys = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchSpecKeys();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setSpecKeys(data);
    } catch (error) {
      console.error('Erreur chargement des attributs:', error);
      message.error("Erreur lors du chargement des attributs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecKeys();
  }, []);

  // Ouvrir modal pour ajout ou modification
  const openModal = (specKey = null) => {
    setEditingSpecKey(specKey);
    if (specKey) {
      form.setFieldsValue(specKey);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingSpecKey(null);
    setModalVisible(false);
  };

  // Sauvegarder (create ou update)
  const onFinish = async (values) => {
    try {
      if (editingSpecKey) {
        await productService.updateSpecKey(editingSpecKey.id, values);
        message.success('Attribut mis à jour');
      } else {
        await productService.createSpecKey(values);
        message.success('Attribut créé');
      }
      closeModal();
      loadSpecKeys();
    } catch (error) {
      console.error('Erreur sauvegarde attribut:', error);
      message.error("Erreur lors de la sauvegarde de l'attribut");
    }
  };

  // Supprimer un SpecKey
  const onDelete = async (id) => {
    try {
      await productService.deleteSpecKey(id);
      message.success('Attribut supprimé');
      loadSpecKeys();
    } catch (error) {
      console.error('Erreur suppression attribut:', error);
      message.error("Impossible de supprimer l'attribut");
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom attribut',
      dataIndex: 'nom_attribut',
      key: 'nom_attribut',
      sorter: (a, b) => (a.nom_attribut || '').localeCompare(b.nom_attribut || ''),
    },
    {
      title: 'Type de données',
      dataIndex: 'data_type',
      key: 'data_type',
      filters: DATA_TYPE_OPTIONS.map(item => ({ text: item.label, value: item.value })),
      onFilter: (value, record) => record.data_type === value,
      render: (val) => DATA_TYPE_OPTIONS.find(opt => opt.value === val)?.label || val,
    },
    {
      title: 'Unité',
      dataIndex: 'unit',
      key: 'unit',
      render: (text) => text || '-',
    },
    {
      title: 'Filtrable',
      dataIndex: 'is_filterable',
      key: 'is_filterable',
      render: (val) => (val ? 'Oui' : 'Non'),
      filters: [
        { text: 'Oui', value: true },
        { text: 'Non', value: false },
      ],
      onFilter: (value, record) => record.is_filterable === value,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => (a.position || 0) - (b.position || 0),
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
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      <Title level={2}>Gestion des Attributs</Title>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Ajouter un Attribut
      </Button>

      <Table
        dataSource={specKeys}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        visible={modalVisible}
        title={editingSpecKey ? 'Modifier Attribut' : 'Ajouter un Attribut'}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingSpecKey ? 'Mettre à jour' : 'Créer'}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_filterable: false }}>
          <Form.Item
            label="Nom de l'attribut"
            name="nom_attribut"
            rules={[{ required: true, message: 'Ce champ est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Type de données"
            name="data_type"
            rules={[{ required: true, message: 'Sélectionnez le type de données' }]}
          >
            <Select options={DATA_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item label="Unité" name="unit">
            <Input placeholder="Optionnel (ex: kg, cm)" />
          </Form.Item>

          <Form.Item name="is_filterable" valuePropName="checked">
            <Checkbox>Filtrable</Checkbox>
          </Form.Item>

          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: 'Indiquez la position' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributesPage;
