import React, { useEffect, useState } from 'react';
import {
  Table,
  Typography,
  message,
  Space,
  Tag,
  Divider,
  Statistic,
  Breadcrumb,
  Button,
  Card,
  Row,
  Col,
  Input,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
  Spin,
} from 'antd';
import { ReloadOutlined, HomeOutlined, ApiOutlined, SwapOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as productService from '../../services/productService';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;

const StockManagement = ({ onSwitch, containerStyle = {}, maxWidth = 1200 }) => {
  // États
  const [stockLevels, setStockLevels] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [searchLevel, setSearchLevel] = useState('');
  const [searchMovement, setSearchMovement] = useState('');

  // Modal et formulaire pour ajout/édition
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // Chargement liste produits
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await productService.fetchProducts();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      const map = {};
      data.forEach(p => {
        map[p.id] = p.nom;
      });
      setProductsMap(map);
    } catch (error) {
      console.error('Erreur chargement des produits:', error);
      message.error('Erreur lors du chargement des produits');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Chargement niveaux de stock
  const loadStockLevels = async () => {
    setLoadingLevels(true);
    try {
      const response = await productService.fetchStockLevels();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setStockLevels(data);
    } catch (error) {
      console.error('Erreur chargement des niveaux de stock:', error);
      message.error('Erreur lors du chargement des niveaux de stock');
    } finally {
      setLoadingLevels(false);
    }
  };

  // Chargement mouvements de stock
  const loadStockMovements = async () => {
    setLoadingMovements(true);
    try {
      const response = await productService.fetchStockMovements();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setStockMovements(data);
    } catch (error) {
      console.error('Erreur chargement des mouvements de stock:', error);
      message.error('Erreur lors du chargement des mouvements de stock');
    } finally {
      setLoadingMovements(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadProducts();
    loadStockLevels();
    loadStockMovements();
  }, []);

  // Refresh total
  const refreshAll = () => {
    loadProducts();
    loadStockLevels();
    loadStockMovements();
    message.success('Données rafraîchies');
  };

  // Utilitaire safeGet
  const safeGet = (obj, path, def = '-') => {
    const val = path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
    if (val === null || val === undefined || val === '') return def;
    return val;
  };

  // Filtres
  const filteredStockLevels = stockLevels.filter(item => {
    const search = searchLevel.toLowerCase();
    return (
      safeGet(item, 'warehouse.nom', '').toLowerCase().includes(search) ||
      (productsMap[item.product] || '').toLowerCase().includes(search) ||
      safeGet(item, 'variant.nom', '').toLowerCase().includes(search)
    );
  });
  const filteredStockMovements = stockMovements.filter(item => {
    const search = searchMovement.toLowerCase();
    return (
      safeGet(item, 'warehouse.nom', '').toLowerCase().includes(search) ||
      (productsMap[item.product] || '').toLowerCase().includes(search) ||
      safeGet(item, 'variant.nom', '').toLowerCase().includes(search) ||
      (item.mouvement_type || '').toLowerCase().includes(search) ||
      // commentaire enlevé selon demande, on ignore ce critère
      true
    );
  });

  // Méthodes gestion modal
  const openModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      // Préparer valeurs form avec conversion date
      form.setFieldsValue({
        warehouse_id: record.warehouse?.id,
        product_id: record.product,
        variant_id: record.variant?.id,
        mouvement_type: record.mouvement_type,
        quantite: record.quantite,
        date_mouvement: record.date_mouvement ? moment(record.date_mouvement) : null,
        // commentaire retiré
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      setModalLoading(true);
      try {
        const payload = {
          warehouse: values.warehouse_id,
          product: values.product_id,
          variant: values.variant_id || null,
          mouvement_type: values.mouvement_type,
          quantite: values.quantite,
          date_mouvement: values.date_mouvement.toISOString(),
          // commentaire retiré
        };
        if (editingRecord) {
          await productService.updateStockMovement(editingRecord.id, payload);
          message.success('Mouvement mis à jour');
        } else {
          await productService.createStockMovement(payload);
          message.success('Mouvement créé');
        }
        setModalVisible(false);
        loadStockMovements();
      } catch (error) {
        console.error("Erreur sauvegarde mouvement", error);
        message.error('Erreur lors de la sauvegarde');
      } finally {
        setModalLoading(false);
      }
    }).catch(info => {
      // Validation errors
    });
  };

  const handleDeleteMovement = async (id) => {
    try {
      await productService.deleteStockMovement(id);
      message.success('Mouvement supprimé');
      loadStockMovements();
    } catch (error) {
      console.error('Erreur suppression mouvement', error);
      message.error('Erreur lors de la suppression');
    }
  };

  // Colonnes

  const columnsStockLevels = [
    {
      title: 'Entrepôt',
      key: 'warehouse',
      render: record => safeGet(record, 'warehouse.nom'),
      sorter: (a, b) => safeGet(a, 'warehouse.nom').localeCompare(safeGet(b, 'warehouse.nom')),
      width: 180,
    },
    {
      title: 'Produit',
      key: 'product',
      render: record => productsMap[record.product] || `ID ${record.product}`,
      sorter: (a, b) => (productsMap[a.product] || '').localeCompare(productsMap[b.product] || ''),
      width: 200,
    },
    {
      title: 'Variante',
      key: 'variant',
      render: record => safeGet(record, 'variant.nom', '-'),
      sorter: (a, b) => safeGet(a, 'variant.nom', '').localeCompare(safeGet(b, 'variant.nom', '')),
      width: 150,
    },
    {
      title: 'Stock total',
      dataIndex: 'stock_total',
      key: 'stock_total',
      sorter: (a, b) => (a.stock_total || 0) - (b.stock_total || 0),
      width: 120,
    },
    {
      title: 'Stock réservé',
      dataIndex: 'stock_reserve',
      key: 'stock_reserve',
      sorter: (a, b) => (a.stock_reserve || 0) - (b.stock_reserve || 0),
      width: 120,
    },
    {
      title: "Seuil d'alerte",
      dataIndex: 'seuil_alerte',
      key: 'seuil_alerte',
      sorter: (a, b) => (a.seuil_alerte || 0) - (b.seuil_alerte || 0),
      width: 130,
      render: (value, record) => {
        const stockTotal = record.stock_total ?? 0;
        const seuil = record.seuil_alerte ?? 0;
        if (stockTotal <= seuil) {
          return <Tag color="red">{value}</Tag>;
        }
        return value ?? '-';
      },
    },
  ];

  const columnsStockMovements = [
    {
      title: 'Date',
      dataIndex: 'date_mouvement',
      key: 'date_mouvement',
      sorter: (a, b) => new Date(a.date_mouvement) - new Date(b.date_mouvement),
      render: date => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      },
      width: 160,
    },
    {
      title: 'Entrepôt',
      key: 'warehouse',
      render: record => safeGet(record, 'warehouse.nom'),
      sorter: (a, b) => safeGet(a, 'warehouse.nom').localeCompare(safeGet(b, 'warehouse.nom')),
      width: 180,
    },
    {
      title: 'Produit',
      key: 'product',
      render: record => productsMap[record.product] || `ID ${record.product}`,
      sorter: (a, b) => (productsMap[a.product] || '').localeCompare(productsMap[b.product] || ''),
      width: 200,
    },
    {
      title: 'Variante',
      key: 'variant',
      render: record => safeGet(record, 'variant.nom', '-'),
      sorter: (a, b) => safeGet(a, 'variant.nom', '').localeCompare(safeGet(b, 'variant.nom', '')),
      width: 150,
    },
    {
      title: 'Type Mouvement',
      dataIndex: 'mouvement_type',
      key: 'mouvement_type',
      filters: [
        { text: 'Entrée', value: 'entrée' },
        { text: 'Sortie', value: 'sortie' },
        { text: 'Réservation', value: 'réservation' },
      ],
      onFilter: (value, record) => (record.mouvement_type || '').toLowerCase() === value,
      render: value => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-',
      width: 130,
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
      sorter: (a, b) => (a.quantite || 0) - (b.quantite || 0),
      width: 100,
    },
    // colonne commentaire supprimée suivant la demande

    // Nouvelle colonne Actions
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
          
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de supprimer ce mouvement ?"
            onConfirm={() => handleDeleteMovement(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Statistiques (exemple)
  const totalStockItems = stockLevels.length;
  const totalWarehouses = [...new Set(stockLevels.map(item => safeGet(item, 'warehouse.nom', false)).filter(Boolean))].length;
  const lowStockCount = stockLevels.filter(item => (item.stock_total ?? 0) <= (item.seuil_alerte ?? 0)).length;
  const totalMovements = stockMovements.length;
  const movementTypesCount = stockMovements.reduce((acc, mv) => {
    const type = (mv.mouvement_type || '').toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, backgroundColor: '#fff', ...containerStyle }}>
      {/* Breadcrumb + boutons */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Gestion des Stocks</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Space>
            <Button onClick={onSwitch}>Voir les statistiques</Button>
            <Button icon={<ReloadOutlined />} onClick={refreshAll}>Rafraîchir</Button>
            <Button type="primary" onClick={() => openModal()}>Ajouter un mouvement</Button>
          </Space>
        </Col>
      </Row>

      {/* Cards statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic title="Total articles stockés" value={totalStockItems} prefix={<ApiOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={2}>
          <Card>
            <Statistic title="Entrepôts" value={totalWarehouses} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card>
            <Statistic title="Stock critiques" value={lowStockCount} prefix={<Tag color="red" />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card>
            <Statistic title="Total mouvements" value={totalMovements} prefix={<SwapOutlined />} />
          </Card>
        </Col>
        {['entrée', 'sortie', 'réservation'].map(type => (
          <Col key={type} xs={24} sm={12} md={4}>
            <Card>
              <Statistic title={`Mouvements ${type.charAt(0).toUpperCase() + type.slice(1)}`} value={movementTypesCount[type] || 0} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Niveaux de Stock */}
      <Title level={4}>Niveaux de Stock</Title>
      <Space style={{ marginBottom: 12 }}>
        <Search
          placeholder="Rechercher Entrepôt, Produit ou Variante"
          allowClear
          enterButton
          onSearch={value => setSearchLevel(value)}
          onChange={e => setSearchLevel(e.target.value)}
          style={{ width: 300 }}
          disabled={loadingLevels}
        />
      </Space>
      <Table
        columns={columnsStockLevels}
        dataSource={filteredStockLevels}
        rowKey={record => record.id}
           size='small'
        loading={loadingLevels}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 'max-content' }}
      />

      <Divider />

      {/* Mouvements de Stock */}
      <Title level={4}>Mouvements de Stock</Title>
      <Space style={{ marginBottom: 12 }}>
        <Search
          placeholder="Rechercher Entrepôt, Produit, Variante ou Type"
          allowClear
          enterButton
          onSearch={value => setSearchMovement(value)}
          onChange={e => setSearchMovement(e.target.value)}
          style={{ width: 300 }}
          disabled={loadingMovements}
        />
      </Space>
      <Table
        columns={columnsStockMovements}
        dataSource={filteredStockMovements}
        rowKey={record => record.id}
        size='small'
        loading={loadingMovements}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 'max-content' }}
      />

      {/* Modal ajout/modification */}
      <Modal
        visible={modalVisible}
        title={editingRecord ? 'Modifier un mouvement' : 'Ajouter un mouvement'}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="warehouse_id"
            label="Entrepôt"
            rules={[{ required: true, message: 'Sélectionnez un entrepôt' }]}
          >
            <Select placeholder="Sélectionner un entrepôt" loading={loadingLevels}>
              {stockLevels
                .map(s => s.warehouse)
                .filter((v, i, a) => v && a.findIndex(t => t.id === v.id) === i)
                .map(w => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.nom}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="product_id"
            label="Produit"
            rules={[{ required: true, message: 'Sélectionnez un produit' }]}
          >
            <Select placeholder="Sélectionner un produit" loading={loadingProducts}>
              {Object.entries(productsMap).map(([id, name]) => (
                <Select.Option key={id} value={Number(id)}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="variant_id" label="Variante" >
            <Select placeholder="Sélectionner une variante (optionnel)" allowClear loading={loadingLevels}>
              {stockLevels
                .map(s => s.variant)
                .filter((v, i, a) => v && a.findIndex(t => t?.id === v?.id) === i)
                .map(v => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.nom}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="mouvement_type"
            label="Type de mouvement"
            rules={[{ required: true, message: 'Sélectionnez un type' }]}
          >
            <Select>
              <Select.Option value="entrée">Entrée</Select.Option>
              <Select.Option value="sortie">Sortie</Select.Option>
              <Select.Option value="réservation">Réservation</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantite"
            label="Quantité"
            rules={[{ required: true, message: 'Saisissez une quantité valide', type: 'number', min: 1 }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="date_mouvement"
            label="Date du mouvement"
            rules={[{ required: true, message: 'Saisissez la date du mouvement' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          {/* Champ commentaire retiré */}
        </Form>
      </Modal>
    </div>
  );
};

export default StockManagement;
