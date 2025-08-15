import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Breadcrumb,
  Typography,
  Space,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { ReloadOutlined, HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as productService from '../../services/productService'; // Assurez-vous que vos fonctions API existent

const { Title } = Typography;
const { Option } = Select;

export default function MediaPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);

  // Charger documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await productService.fetchProductDocuments();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setDocuments(data);
    } catch (error) {
      message.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  // Charger produits (pour champ select)
  const loadProducts = async () => {
    try {
      const res = await productService.fetchProducts();
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setProducts(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDocuments();
    loadProducts();
  }, []);

  // Ouvrir modal ajout/édition
  const openModal = (doc = null) => {
    setEditingDoc(doc);
    if (doc) {
      form.setFieldsValue({
        product_id: doc.product,
        url_document: doc.url_document,
        type_document: doc.type_document,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Fermer modal
  const closeModal = () => {
    setEditingDoc(null);
    setModalVisible(false);
    form.resetFields();
  };

  // Sauvegarder document
  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingDoc) {
        await productService.updateProductDocument(editingDoc.id, values);
        message.success('Document mis à jour');
      } else {
        await productService.createProductDocument(values);
        message.success('Document créé');
      }
      closeModal();
      loadDocuments();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer document
  const handleDelete = async (id) => {
    try {
      await productService.deleteProductDocument(id);
      message.success('Document supprimé');
      loadDocuments();
    } catch {
      message.error('Erreur lors de la suppression');
    }
  };

  // Colonnes tableau
  const columns = [
    {
      title: 'Produit',
      dataIndex: 'product',
      key: 'product',
      render: productId => {
        const product = products.find(p => p.id === productId);
        return product ? product.nom || product.name || `#${productId}` : `#${productId}`;
      },
    },
    {
      title: 'URL document',
      dataIndex: 'url_document',
      key: 'url_document',
      render: url => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: 'Type document',
      dataIndex: 'type_document',
      key: 'type_document',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Êtes-vous sûr de supprimer ce document ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: 'auto', backgroundColor: '#fff' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Documents produits</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadDocuments} loading={loading}>
              Rafraîchir
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Ajouter un document
            </Button>
          </Space>
        </Col>
      </Row>

      <Title level={3}>Liste des documents</Title>
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="id"
        size='small'
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingDoc ? 'Modifier un document' : 'Ajouter un document'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        destroyOnClose
        okText="Enregistrer"
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="product_id"
            label="Produit"
            rules={[{ required: true, message: 'Veuillez sélectionner un produit' }]}
          >
            <Select placeholder="Sélectionner un produit" showSearch optionFilterProp="children" allowClear>
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.nom || product.name || `#${product.id}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="url_document"
            label="URL du document"
            rules={[
              { required: true, message: 'Merci d’entrer l’URL du document' },
              { type: 'url', message: 'URL non valide' },
            ]}
          >
            <Input placeholder="https://exemple.com/document.pdf" />
          </Form.Item>

          <Form.Item
            name="type_document"
            label="Type de document"
            rules={[{ required: true, message: 'Merci d’entrer le type de document' }]}
          >
            <Input placeholder="ex: manuel, fiche technique, photo…" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
