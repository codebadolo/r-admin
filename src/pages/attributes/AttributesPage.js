import React, { useEffect, useState } from 'react';
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
  Typography,
  Tooltip,
  Divider,
  Breadcrumb,
  Card,
  Row,
  Col,
    Statistic,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  FilterOutlined,
  NumberOutlined,
  FontSizeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import * as productService from '../../services/productService';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

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

  // Chargement des SpecKeys
  const loadSpecKeys = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchSpecKeys();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
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

  // Ouvrir modal ajout/modification
  const openModal = (specKey = null) => {
    setEditingSpecKey(specKey);
    if (specKey) {
      form.setFieldsValue(specKey);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Fermer modal
  const closeModal = () => {
    setEditingSpecKey(null);
    setModalVisible(false);
  };

  // Sauvegarder (create ou update)
  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (editingSpecKey) {
        await productService.updateSpecKey(editingSpecKey.id, values);
        message.success('Attribut mis à jour');
      } else {
        await productService.createSpecKey(values);
        message.success('Attribut créé');
      }
      closeModal();
      await loadSpecKeys();
    } catch (error) {
      console.error('Erreur sauvegarde attribut:', error);
      message.error("Erreur lors de la sauvegarde de l'attribut");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer avec modal confirmation
  const onDelete = (id, nom) => {
    confirm({
      title: 'Confirmer la suppression',
      icon: <ExclamationCircleOutlined />,
      content: `Voulez-vous vraiment supprimer l'attribut "${nom}" ?`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          setLoading(true);
          await productService.deleteSpecKey(id);
          message.success('Attribut supprimé');
          await loadSpecKeys();
        } catch (error) {
          console.error('Erreur suppression attribut:', error);
          message.error("Impossible de supprimer l'attribut");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Grouper par catégorie
  const groupedByCategory = specKeys.reduce((acc, sk) => {
    const catId = sk.spec_category?.id || 0;
    if (!acc[catId]) {
      acc[catId] = {
        category: sk.spec_category || { id: 0, nom: 'Sans catégorie' },
        keys: [],
      };
    }
    acc[catId].keys.push(sk);
    return acc;
  }, {});

  // Statistiques spécifiques aux specs
  const totalSpecs = specKeys.length;
  const totalCategories = Object.keys(groupedByCategory).length;
  const totalFilterable = specKeys.filter(sk => sk.is_filterable).length;

  const countByDataType = DATA_TYPE_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = specKeys.filter(sk => sk.data_type === opt.value).length;
    return acc;
  }, {});

  // Colonnes tableau specs
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
      render: val => DATA_TYPE_OPTIONS.find(opt => opt.value === val)?.label || val,
    },
    {
      title: 'Unité',
      dataIndex: 'unit',
      key: 'unit',
      render: text => text || '-',
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
      render: val => (val ? 'Oui' : 'Non'),
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
              aria-label={`Modifier attribut ${record.nom_attribut}`}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id, record.nom_attribut)}
              aria-label={`Supprimer attribut ${record.nom_attribut}`}
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
            <Breadcrumb.Item>Gestion des Attributs</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Button type="primary" onClick={() => openModal()} disabled={loading}>
            Ajouter un Attribut
          </Button>
        </Col>
      </Row>

      {/* Cards statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }} wrap={false} justify="start">
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total d'attributs"
              value={totalSpecs}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre de catégories"
              value={totalCategories}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Attributs filtrables"
              value={totalFilterable}
              valueStyle={{ color: '#faad14' }}
              prefix={<FilterOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Texte"
              value={countByDataType.string || 0}
              prefix={<FontSizeOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Nombre entier"
              value={countByDataType.int || 0}
              prefix={<NumberOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Booléen"
              value={countByDataType.bool || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Autres types"
              value={(countByDataType.list || 0) + (countByDataType.float || 0)}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Grille responsive 2 colonnes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
          gap: 24,
        }}
      >
        {Object.values(groupedByCategory).map(({ category, keys }) => (
          <div
            key={category.id}
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Divider orientation="left">{category.nom}</Divider>
            <Table
              dataSource={keys}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
              size="small"
              scroll={{ x: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      <Modal
        visible={modalVisible}
        title={editingSpecKey ? 'Modifier Attribut' : 'Ajouter un Attribut'}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingSpecKey ? 'Mettre à jour' : 'Créer'}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_filterable: false, position: 0 }}
          preserve={false}
        >
          <Form.Item
            label="Nom de l'attribut"
            name="nom_attribut"
            rules={[{ required: true, message: 'Ce champ est requis' }]}
          >
            <Input disabled={loading} />
          </Form.Item>
          <Form.Item
            label="Type de données"
            name="data_type"
            rules={[{ required: true, message: 'Sélectionnez le type de données' }]}
          >
            <Select options={DATA_TYPE_OPTIONS} disabled={loading} />
          </Form.Item>
          <Form.Item label="Unité" name="unit">
            <Input placeholder="Optionnel (ex: kg, cm)" disabled={loading} />
          </Form.Item>
          <Form.Item name="is_filterable" valuePropName="checked">
            <Checkbox disabled={loading}>Filtrable</Checkbox>
          </Form.Item>
          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: 'Indiquez la position' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} disabled={loading} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributesPage;
