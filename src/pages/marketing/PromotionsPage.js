import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  message,
  Typography,
  Tooltip,
  Breadcrumb,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import * as promotionService from '../../services/promotionService';
import api from '../../services/api';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [promoRes, catRes, prodRes] = await Promise.all([
        promotionService.fetchPromotions(),
        api.get('/categories/'),
        api.get('/products/'),
      ]);
      setPromotions(promoRes.data.results || promoRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
      setProducts(prodRes.data.results || prodRes.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (promo = null) => {
    setEditing(promo);
    if (promo) {
      form.setFieldsValue({
        ...promo,
        category_id: promo.category?.id,
        product_id: promo.product?.id,
        dates: [
          promo.start_date ? dayjs(promo.start_date) : null,
          promo.end_date ? dayjs(promo.end_date) : null,
        ],
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditing(null);
  };

  const onFinish = async (values) => {
    const [start, end] = values.dates || [];
    const payload = {
      name: values.name,
      discount_percent: values.discount_percent,
      category_id: values.category_id || null,
      product_id: values.product_id || null,
      min_quantity: values.min_quantity || 1,
      client_type: values.client_type || '',
      start_date: start ? start.format('YYYY-MM-DD') : null,
      end_date: end ? end.format('YYYY-MM-DD') : null,
      is_active: values.is_active ?? true,
    };
    try {
      setLoading(true);
      if (editing) {
        await promotionService.updatePromotion(editing.id, payload);
        message.success('Promotion mise à jour');
      } else {
        await promotionService.createPromotion(payload);
        message.success('Promotion créée');
      }
      closeModal();
      await loadData();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement de la promotion");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    confirm({
      title: 'Confirmer la suppression',
      content: `Supprimer la promotion "${name}" ?`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await promotionService.deletePromotion(id);
          message.success('Promotion supprimée');
          await loadData();
        } catch (error) {
          message.error('Impossible de supprimer la promotion');
        }
      },
    });
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    {
      title: 'Remise',
      dataIndex: 'discount_percent',
      key: 'discount_percent',
      render: (v) => `-${v}%`,
    },
    {
      title: 'Portée',
      key: 'scope',
      render: (_, record) => record.product?.name || record.category?.name || 'Tout le catalogue',
    },
    { title: 'Qté min.', dataIndex: 'min_quantity', key: 'min_quantity' },
    {
      title: 'Client',
      dataIndex: 'client_type',
      key: 'client_type',
      render: (v) => (v === 'entreprise' ? <Tag color="blue">Entreprise</Tag> : <Tag>Tous</Tag>),
    },
    {
      title: 'Statut',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record.id, record.name)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Promotions</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Remises & tarifs revendeurs
          </Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Ajouter une promotion
          </Button>
        </Col>
      </Row>

      <Table dataSource={promotions} columns={columns} rowKey="id" loading={loading} size="small" bordered />

      <Modal
        title={editing ? 'Modifier la promotion' : 'Ajouter une promotion'}
        open={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editing ? 'Mettre à jour' : 'Créer'}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
          <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Remise (%)" name="discount_percent" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Catégorie (optionnel)" name="category_id">
            <Select allowClear placeholder="Toutes catégories">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Produit spécifique (optionnel, prioritaire sur la catégorie)" name="product_id">
            <Select allowClear showSearch optionFilterProp="children" placeholder="Tous les produits">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Quantité minimum" name="min_quantity" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Type de client" name="client_type">
            <Select allowClear placeholder="Tous les clients">
              <Option value="entreprise">Entreprise uniquement</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Période de validité (optionnel)" name="dates">
            <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;
