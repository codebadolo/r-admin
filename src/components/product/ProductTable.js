import React, { useEffect, useState, useRef } from 'react';
import {
  Table,
  Tag,
  Input,
  Button,
  Space,
  Image,
  message,
  Breadcrumb,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import * as XLSX from 'xlsx';
import * as productService from '../../services/productService';
import { useNavigate } from 'react-router-dom';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const navigate = useNavigate();

  // Chargement des produits
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setProducts(data);
    } catch (error) {
      message.error('Erreur lors du chargement des produits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Recherche avancée sur colonnes
  const getColumnSearchProps = (dataIndex, displayName, nestedPath) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Rechercher ${displayName}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
          autoFocus
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Rechercher
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Réinitialiser
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const text = nestedPath
        ? nestedPath.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), record)
        : record[dataIndex];
      return text ? text.toString().toLowerCase().includes(value.toLowerCase()) : false;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0] || '');
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // Accès sécurisé aux champs imbriqués (ex: brand.nom)
  const safeGet = (obj, path, defaultValue = '-') =>
    path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj) || defaultValue;

  // Actions
  const handleView = (id) => {
    navigate(`/products/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      message.success('Produit supprimé');
      loadProducts();
    } catch (error) {
      message.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const handleAdd = () => {
    navigate('/products/create');
  };

  // Export Excel avec xlsx
  const exportToExcel = () => {
    const exportData = products.map((prod) => ({
      Nom: prod.nom,
      Marque: safeGet(prod, 'brand.nom', ''),
      Catégorie: safeGet(prod, 'category.nom', ''),
      Prix: prod.prix,
      Stock: prod.stock,
      État: prod.etat,
      'Code EAN': prod.ean_code || '',
      'Produit actif': prod.is_active ? 'Oui' : 'Non',
      'Date création': prod.date_creation ? new Date(prod.date_creation).toLocaleDateString() : '',
      'Date modification': prod.date_modification ? new Date(prod.date_modification).toLocaleDateString() : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');

    XLSX.writeFile(workbook, 'produits_export.xlsx');
  };

  // Définition des colonnes
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url) =>
        url ? (
          <Image width={50} src={url} alt="Produit" />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#f0f0f0',
              textAlign: 'center',
              lineHeight: '50px',
              color: '#999',
            }}
          >
            N/A
          </div>
        ),
      sorter: false,
      filterable: false,
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => (a.nom || '').localeCompare(b.nom || ''),
      ...getColumnSearchProps('nom', 'Nom'),
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Marque',
      key: 'brand',
      sorter: (a, b) => safeGet(a, 'brand.nom').localeCompare(safeGet(b, 'brand.nom')),
      ...getColumnSearchProps('brand', 'Marque', 'brand.nom'),
      render: (record) => safeGet(record, 'brand.nom'),
    },
    {
      title: 'Catégorie',
      key: 'category',
      sorter: (a, b) => safeGet(a, 'category.nom').localeCompare(safeGet(b, 'category.nom')),
      ...getColumnSearchProps('category', 'Catégorie', 'category.nom'),
      render: (record) => safeGet(record, 'category.nom'),
    },
    {
      title: 'Prix (€)',
      dataIndex: 'prix',
      key: 'prix',
      sorter: (a, b) => parseFloat(a.prix || 0) - parseFloat(b.prix || 0),
      render: (prix) => (prix != null ? `${prix} €` : '-'),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock) => (stock != null ? stock : '-'),
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      filters: [
        { text: 'Disponible', value: 'disponible' },
        { text: 'Indisponible', value: 'indisponible' },
      ],
      onFilter: (value, record) => ((record.etat || '').toLowerCase() === value),
      render: (etat) => {
        if (!etat) return '-';
        const color = etat.toLowerCase() === 'disponible' ? 'green' : 'volcano';
        return <Tag color={color}>{etat.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Code EAN',
      dataIndex: 'ean_code',
      key: 'ean_code',
      sorter: (a, b) => (a.ean_code || '').localeCompare(b.ean_code || ''),
    },
    {
      title: 'actif',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Oui', value: true },
        { text: 'Non', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (val) => (val ? 'Oui' : 'Non'),
    },
    {
      title: 'Date crea',
      dataIndex: 'date_creation',
      key: 'date_creation',
      sorter: (a, b) => new Date(a.date_creation) - new Date(b.date_creation),
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Date mod',
      dataIndex: 'date_modification',
      key: 'date_modification',
      sorter: (a, b) => new Date(a.date_modification) - new Date(b.date_modification),
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record.id)} />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record.id)} />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item>Catalogue</Breadcrumb.Item>
            <Breadcrumb.Item>Produits</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Ajouter produit
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
              Exporter Excel
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        size= "small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ProductTable;
