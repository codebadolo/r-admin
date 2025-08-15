import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Tooltip,
  Breadcrumb,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  TrademarkOutlined,
} from '@ant-design/icons';
import * as productService from '../../services/productService';

const { Title } = Typography;
const { confirm } = Modal;

const BrandsPage = () => {
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

  // Ouvrir modal création/modification
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
      setLoading(true);
      if (editingBrand) {
        await productService.updateBrand(editingBrand.id, values);
        message.success('Marque mise à jour avec succès');
      } else {
        await productService.createBrand(values);
        message.success('Marque créée avec succès');
      }
      closeModal();
      await loadBrands();
    } catch (error) {
      console.error('Erreur sauvegarde marque:', error);
      message.error('Erreur lors de la sauvegarde de la marque');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation avant suppression
  const confirmDelete = (id, nom) => {
    confirm({
      title: 'Confirmer la suppression',
      icon: <ExclamationCircleOutlined />,
      content: `Voulez-vous vraiment supprimer la marque "${nom}" ?`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          setLoading(true);
          await productService.deleteBrand(id);
          message.success('Marque supprimée');
          await loadBrands();
        } catch (error) {
          console.error('Erreur suppression marque:', error);
          message.error("Impossible de supprimer la marque");
        } finally {
          setLoading(false);
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
      width: 300,
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
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              aria-label={`Modifier la marque ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record.id, record.nom)}
              aria-label={`Supprimer la marque ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Statistiques : nombre total de marques
  const totalBrands = brands.length;

  return (
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      {/* Breadcrumb et bouton d'ajout alignés */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Gestion des Marques</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Button type="primary" onClick={() => openModal()} disabled={loading}>
            Ajouter une marque
          </Button>
        </Col>
      </Row>

      {/* Card de statistique */}
      <Row gutter={16} style={{ marginBottom: 24 }} wrap={false} justify="start">
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total de marques"
              value={totalBrands}
              valueStyle={{ color: "#3f8600" }}
              prefix={<TrademarkOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tableau des marques */}
      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Modal création / modification */}
      <Modal
        title={editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingBrand ? 'Mettre à jour' : 'Créer'}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          preserve={false}
          initialValues={{ nom: '', description: '' }}
        >
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

export default BrandsPage;
