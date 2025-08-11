// src/components/brand/BrandSection.js

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Modal, Form, Input } from 'antd';
import * as productService from '../../services/productService';

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [form] = Form.useForm();

  // Charger la liste des marques
  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchBrands();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
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

  // Ouvrir modal et reset formulaire
  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      form.setFieldsValue(brand);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Fermer modal
  const closeModal = () => {
    setModalVisible(false);
    setEditingBrand(null);
  };

  // Sauvegarder marque (création ou mise à jour)
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

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            Modifier
          </Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              try {
                await productService.deleteBrand(record.id);
                message.success('Marque supprimée');
                loadBrands();
              } catch (error) {
                console.error('Erreur suppression marque:', error);
                message.error("Impossible de supprimer la marque");
              }
            }}
          >
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
          Ajouter une marque
        </Button>
      </Space>

      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => {
          form.submit();
        }}
        okText={editingBrand ? 'Mettre à jour' : 'Créer'}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Veuillez entrer le nom de la marque' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandSection;
