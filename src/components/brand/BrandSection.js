import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as productService from '../../services/productService';

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchBrands();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setBrands(data);
    } catch (error) {
      console.error('Erreur chargement marques:', error);
      message.error('Erreur lors du chargement des marques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      form.setFieldsValue(brand);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBrand(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingBrand) {
        await productService.updateBrand(editingBrand.id, values);
        message.success('Marque mise à jour avec succès');
      } else {
        await productService.createBrand(values);
        message.success('Marque créée avec succès');
      }
      closeModal();
      loadBrands();
    } catch (error) {
      console.error('Erreur sauvegarde marque:', error);
      message.error('Erreur lors de la sauvegarde de la marque');
    }
  };

  // Confirmation avant suppression
  const confirmDelete = (id, nom) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: `Voulez-vous vraiment supprimer la marque "${nom}" ?`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await productService.deleteBrand(id);
          message.success('Marque supprimée');
          loadBrands();
        } catch (error) {
          console.error('Erreur suppression marque:', error);
          message.error("Impossible de supprimer la marque");
        }
      },
    });
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
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
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              aria-label={`Modifier marque ${record.nom}`}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record.id, record.nom)}
              aria-label={`Supprimer marque ${record.nom}`}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => openModal()} disabled={loading}>
          Ajouter une marque
        </Button>
      </Space>

      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingBrand ? 'Mettre à jour' : 'Créer'}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom de la marque' }]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} disabled={loading} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandSection;
