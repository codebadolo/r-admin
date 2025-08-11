// src/components/product/AttributeSection.js

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
  message,
} from 'antd';
import * as productService from '../../services/productService';

const { Option } = Select;

// Options pour le champ "type de données"
const DATA_TYPE_OPTIONS = [
  { label: 'Texte', value: 'string' },
  { label: 'Nombre entier', value: 'int' },
  { label: 'Booléen', value: 'bool' },
  { label: 'Liste', value: 'list' },
  { label: 'Nombre décimal', value: 'float' },
];

const AttributeSection = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const [form] = Form.useForm();

  // Charger les attributs depuis l'API
  const loadAttributes = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchSpecKeys();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setAttributes(data);
    } catch (error) {
      console.error('Erreur chargement des attributs:', error);
      message.error("Erreur lors du chargement des attributs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  // Ouvre le modal en mode création ou édition
  const openModal = (attribute = null) => {
    setEditingAttribute(attribute);
    if (attribute) {
      form.setFieldsValue(attribute);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Ferme le modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingAttribute(null);
  };

  // Soumet le formulaire : création ou mise à jour
  const onFinish = async (values) => {
    try {
      if (editingAttribute) {
        await productService.updateSpecKey(editingAttribute.id, values);
        message.success('Attribut mis à jour avec succès');
      } else {
        await productService.createSpecKey(values);
        message.success('Attribut créé avec succès');
      }
      closeModal();
      loadAttributes();
    } catch (error) {
      console.error('Erreur sauvegarde attribut:', error);
      message.error("Erreur lors de la sauvegarde de l'attribut");
    }
  };

  // Confirme et supprime un attribut
  const onDelete = (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Voulez-vous vraiment supprimer cet attribut ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await productService.deleteSpecKey(id);
          message.success('Attribut supprimé avec succès');
          loadAttributes();
        } catch (error) {
          console.error('Erreur suppression attribut:', error);
          message.error("Impossible de supprimer l'attribut");
        }
      },
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: "Nom de l'attribut",
      dataIndex: 'nom_attribut',
      key: 'nom_attribut',
      sorter: (a, b) => (a.nom_attribut || '').localeCompare(b.nom_attribut || ''),
    },
    {
      title: 'Type de données',
      dataIndex: 'data_type',
      key: 'data_type',
      filters: DATA_TYPE_OPTIONS.map(({ label, value }) => ({ text: label, value })),
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
      filters: [
        { text: 'Oui', value: true },
        { text: 'Non', value: false },
      ],
      onFilter: (value, record) => record.is_filterable === value,
      render: (val) => (val ? 'Oui' : 'Non'),
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
          <Button type="link" onClick={() => openModal(record)}>
            Modifier
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openModal()}>
          Ajouter un attribut
        </Button>
      </Space>

      <Table
        dataSource={attributes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingAttribute ? "Modifier l'attribut" : 'Ajouter un attribut'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingAttribute ? 'Mettre à jour' : 'Créer'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_filterable: false, position: 0 }}
        >
          <Form.Item
            label="Nom de l'attribut"
            name="nom_attribut"
            rules={[{ required: true, message: 'Veuillez saisir le nom de l\'attribut' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Type de données"
            name="data_type"
            rules={[{ required: true, message: 'Veuillez sélectionner le type de données' }]}
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
            rules={[{ required: true, message: 'Veuillez définir la position' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributeSection;
