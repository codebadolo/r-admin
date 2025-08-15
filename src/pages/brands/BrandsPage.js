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
  ProfileOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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

  const confirmDelete = (id, nom) => {
    confirm({
      title: 'Confirmer la suppression',
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

  // Statistiques
  const totalBrands = brands.length;
  const brandsWithDescription = brands.filter(b => b.description && b.description.trim() !== '').length;
  const brandsWithoutDescription = totalBrands - brandsWithDescription;
  // Ici vous pouvez ajouter plus d’indicateurs comme actif / inactif si dispo (ex : b.is_active)
  const brandsActiveCount = brands.filter(b => b.is_active === true).length;
  const brandsInactiveCount = totalBrands - brandsActiveCount;

  // Colonnes tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
      width: 250,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || <i>Aucune description</i>,
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
              aria-label={`Modifier marque ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record.id, record.nom)}
              aria-label={`Supprimer marque ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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

      {/* Cards statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }} wrap={false} justify="start">
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total de marques"
              value={totalBrands}
              valueStyle={{ color: '#3f8600' }}
              prefix={<TrademarkOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Marques avec description"
              value={brandsWithDescription}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Marques sans description"
              value={brandsWithoutDescription}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Marques actives"
              value={brandsActiveCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Marques inactives"
              value={brandsInactiveCount}
              valueStyle={{ color: '#fa541c' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        {/* Vous pouvez ajouter d'autres cards ici */}
      </Row>

      {/* Tableau standard */}
      <Table
        dataSource={brands}
        columns={columns}
        rowKey="id"
        size='small'
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Grille de cartes (optionnelle, commenter si non désirée) */}
      {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {brands.map(brand => (
          <Col xs={24} sm={12} md={8} lg={6} key={brand.id}>
            <Card
              title={brand.nom}
              size="small"
              extra={
                <Space size="middle">
                  <Tooltip title="Modifier">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openModal(brand)}
                      aria-label={`Modifier marque ${brand.nom}`}
                    />
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => confirmDelete(brand.id, brand.nom)}
                      aria-label={`Supprimer marque ${brand.nom}`}
                    />
                  </Tooltip>
                </Space>
              }
            >
              <p>{brand.description || <i>Aucune description</i>}</p>
            </Card>
          </Col>
        ))}
      </Row> */}

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
          initialValues={{ nom: '', description: '', is_active: true }}
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
          {/* Exemple pour champ actif, si pertinent */}
          {/* <Form.Item name="is_active" valuePropName="checked">
            <Checkbox disabled={loading}>Marque active</Checkbox>
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default BrandsPage;
