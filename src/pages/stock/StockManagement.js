// src/pages/stock/StockManagement.js

import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Space, Tag, Divider } from 'antd';
import * as productService from '../../services/productService';

const { Title } = Typography;

const StockManagement = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Chargement niveaux de stock
  const loadStockLevels = async () => {
    setLoadingLevels(true);
    try {
      const response = await productService.fetchStockLevels();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setStockLevels(data);
    } catch (error) {
      console.error("Erreur chargement des niveaux de stock:", error);
      message.error("Erreur lors du chargement des niveaux de stock");
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
      console.error("Erreur chargement des mouvements de stock:", error);
      message.error("Erreur lors du chargement des mouvements de stock");
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadStockLevels();
    loadStockMovements();
  }, []);

  // Helper pour sécuriser accès aux champs
  const safeGet = (obj, path, def = '-') =>
    path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj) || def;

  // Colonnes pour niveaux de stock
  const columnsStockLevels = [
    {
      title: 'Entrepôt',
      key: 'warehouse',
      render: (record) => safeGet(record, 'warehouse.nom'),
      sorter: (a, b) => safeGet(a, 'warehouse.nom').localeCompare(safeGet(b, 'warehouse.nom')),
    },
    {
      title: 'Produit',
      key: 'product',
      render: (record) => safeGet(record, 'product.nom'),
      sorter: (a, b) => safeGet(a, 'product.nom').localeCompare(safeGet(b, 'product.nom')),
    },
    {
      title: 'Variante',
      key: 'variant',
      render: (record) => safeGet(record, 'variant.nom', '-'),
      sorter: (a, b) =>
        safeGet(a, 'variant.nom', '').localeCompare(safeGet(b, 'variant.nom', '')),
    },
    {
      title: 'Stock total',
      dataIndex: 'stock_total',
      key: 'stock_total',
      sorter: (a, b) => (a.stock_total || 0) - (b.stock_total || 0),
    },
    {
      title: 'Stock réservé',
      dataIndex: 'stock_reserve',
      key: 'stock_reserve',
      sorter: (a, b) => (a.stock_reserve || 0) - (b.stock_reserve || 0),
    },
    {
      title: 'Seuil d\'alerte',
      dataIndex: 'seuil_alerte',
      key: 'seuil_alerte',
      sorter: (a, b) => (a.seuil_alerte || 0) - (b.seuil_alerte || 0),
      render: (value, record) => {
        if ((record.stock_total || 0) <= (record.seuil_alerte || 0)) {
          return <Tag color="red">{value}</Tag>;
        }
        return value;
      },
    },
  ];

  // Colonnes pour mouvements de stock
  const columnsStockMovements = [
    {
      title: 'Date',
      dataIndex: 'date_mouvement',
      key: 'date_mouvement',
      sorter: (a, b) => new Date(a.date_mouvement) - new Date(b.date_mouvement),
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Entrepôt',
      key: 'warehouse',
      render: (record) => safeGet(record, 'warehouse.nom'),
      sorter: (a, b) => safeGet(a, 'warehouse.nom').localeCompare(safeGet(b, 'warehouse.nom')),
    },
    {
      title: 'Produit',
      key: 'product',
      render: (record) => safeGet(record, 'product.nom'),
      sorter: (a, b) => safeGet(a, 'product.nom').localeCompare(safeGet(b, 'product.nom')),
    },
    {
      title: 'Variante',
      key: 'variant',
      render: (record) => safeGet(record, 'variant.nom', '-'),
      sorter: (a, b) =>
        safeGet(a, 'variant.nom', '').localeCompare(safeGet(b, 'variant.nom', '')),
    },
    {
      title: 'Type Mouvement',
      dataIndex: 'mouvement_type',
      key: 'mouvement_type',
      filters: [
        { text: 'Entrée', value: 'entrée' },
        { text: 'Sortie', value: 'sortie' },
        { text: 'Réservation', value: 'réservation' },
        // Ajouter d’autres selon vos types exacts
      ],
      onFilter: (value, record) => (record.mouvement_type || '').toLowerCase() === value,
      render: (value) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1) : '-',
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
      sorter: (a, b) => (a.quantite || 0) - (b.quantite || 0),
    },
    {
      title: 'Commentaire',
      dataIndex: 'commentaire',
      key: 'commentaire',
      ellipsis: true,
      render: (text) => text || '-',
    },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      <Title level={2}>Gestion des Stocks</Title>

      <Title level={4}>Niveaux de Stock</Title>
      <Table
        columns={columnsStockLevels}
        dataSource={stockLevels}
        rowKey={(record) => record.id}
        loading={loadingLevels}
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 32 }}
      />

      <Divider />

      <Title level={4}>Mouvements de Stock</Title>
      <Table
        columns={columnsStockMovements}
        dataSource={stockMovements}
        rowKey={(record) => record.id}
        loading={loadingMovements}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StockManagement;
