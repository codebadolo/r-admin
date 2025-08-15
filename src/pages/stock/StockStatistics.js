import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  message,
  Spin,
  Button,
  Breadcrumb,
  Typography,
} from 'antd';
import { Column, Pie } from '@ant-design/charts';
import { HomeOutlined, DashboardOutlined, ReloadOutlined } from '@ant-design/icons';
import * as productService from '../../services/productService';

const { Title } = Typography;

export default function StockStatistics({ onSwitch }) {
  const [loading, setLoading] = useState(false);
  const [stockLevels, setStockLevels] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [stats, setStats] = useState({
    totalStock: 0,
    totalProducts: 0,
    productsInAlert: 0,
    productsOutOfStock: 0,
    totalReserved: 0,
    uniqueWarehouses: 0,
  });

  const loadStockData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStockLevels, resStockMovements] = await Promise.all([
        productService.fetchStockLevels(),
        productService.fetchStockMovements(),
      ]);

      const stocks = Array.isArray(resStockLevels.data)
        ? resStockLevels.data
        : resStockLevels.data.results || [];

      const movements = Array.isArray(resStockMovements.data)
        ? resStockMovements.data
        : resStockMovements.data.results || [];

      setStockLevels(stocks);
      setStockMovements(movements);

      const totalStock = stocks.reduce((sum, s) => sum + (s.stock_total || 0), 0);
      const totalReserved = stocks.reduce((sum, s) => sum + (s.stock_reserve || 0), 0);
      const productsOutOfStock = stocks.filter(s => (s.stock_total || 0) === 0).length;
      const productsInAlert = stocks.filter(
        s => s.seuil_alerte != null && s.stock_total != null && s.stock_total <= s.seuil_alerte
      ).length;
      const totalProducts = stocks.length;
      const uniqueWarehouses = new Set(stocks.map(s => s.warehouse?.id).filter(Boolean)).size;

      setStats({
        totalStock,
        totalProducts,
        productsInAlert,
        productsOutOfStock,
        totalReserved,
        uniqueWarehouses,
      });
    } catch (error) {
      message.error("Erreur lors du chargement des statistiques de stock");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  // Préparer données graphiques

  // Stock total par produit
  const chartStockByProductData = stockLevels.map(sl => {
    const productName =
      typeof sl.product === 'object' && sl.product !== null
        ? sl.product.nom || sl.product.name || `Produit #${sl.product.id ?? ''}`
        : `Produit #${sl.product ?? ''}`;
    return {
      product: productName,
      stock: sl.stock_total || 0,
    };
  });

  // Stock réservé par produit
  const chartReservedByProductData = stockLevels.map(sl => {
    const productName =
      typeof sl.product === 'object' && sl.product !== null
        ? sl.product.nom || sl.product.name || `Produit #${sl.product.id ?? ''}`
        : `Produit #${sl.product ?? ''}`;
    return {
      product: productName,
      reserved: sl.stock_reserve || 0,
    };
  });

  // Proportions produits par état (en stock, en rupture, alerte)
  const pieStockStatusData = [
    {
      type: 'En stock',
      value:
        stats.totalStock - stats.productsInAlert - stats.productsOutOfStock > 0
          ? stats.totalStock - stats.productsInAlert - stats.productsOutOfStock
          : 0,
    },
    { type: "En seuil d'alerte", value: stats.productsInAlert },
    { type: 'En rupture', value: stats.productsOutOfStock },
  ];

  // Mouvements par type
  const movementTypesCount = stockMovements.reduce((acc, mv) => {
    const type = (mv.mouvement_type || '').toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartMovementsByTypeData = ['entrée', 'sortie', 'réservation'].map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: movementTypesCount[type] || 0,
  }));

  // Configs graphiques, sans label.position pour éviter erreur
  const configStockByProduct = {
    data: chartStockByProductData,
    xField: 'product',
    yField: 'stock',
    maxColumnWidth: 40,
    label: {
      // Pas de position définie (par défaut) pour éviter erreur
      style: { fill: '#FFFFFF', opacity: 0.6 },
      formatter: ({ stock }) => stock,
    },
    xAxis: {
      label: { autoHide: true, autoRotate: false },
    },
    meta: {
      product: { alias: 'Produit' },
      stock: { alias: 'Stock total' },
    },
    height: 300,
    appendPadding: 10,
  };

  const configReservedByProduct = {
    ...configStockByProduct,
    yField: 'reserved',
    label: {
      style: { fill: '#000000', opacity: 0.75 },
      formatter: ({ reserved }) => reserved,
    },
  };

  const configPieStockStatus = {
    data: pieStockStatusData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'spider',
      labelHeight: 80,
      content: '{name}\n{percentage}',
    },
    interactions: [{ type: 'element-active' }],
    height: 300,
    appendPadding: 10,
  };

  const configMovementsByType = {
    data: chartMovementsByTypeData,
    xField: 'type',
    yField: 'count',
    colorField: 'type',
    maxColumnWidth: 40,
    label: {
      style: { fill: '#000', opacity: 0.85 },
      formatter: ({ count }) => count,
    },
    height: 300,
    appendPadding: 10,
  };

  return (
    <div style={{ width: "100%", padding: 24, boxSizing: 'border-box' }}>
       {/* Breadcrumb à gauche */}
     <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <DashboardOutlined />
            <span>Statistiques de Stock</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </Col>

      {/* Les deux boutons côte à côte à droite */}
      <Col>
        <Row gutter={8}>
          <Col>
            <Button onClick={onSwitch} type="default">
              Voir la gestion détaillée
            </Button>
          </Col>
          <Col>
            <Button
              onClick={loadStockData}
              loading={loading}
              type="primary"
              icon={<ReloadOutlined />}
            >
              Rafraîchir
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>


      {loading ? (
        <Spin tip="Chargement..." />
      ) : (
        <>
          {/* Cards statistiques */}
          <Row gutter={16} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="Total articles en stock"
                  value={stats.totalStock}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic title="Nombre de produits" value={stats.totalProducts} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="Produits en seuil d'alerte"
                  value={stats.productsInAlert}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="Produits en rupture"
                  value={stats.productsOutOfStock}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="Stock réservé"
                  value={stats.totalReserved}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card>
                <Statistic
                  title="Nombre d'entrepôts"
                  value={stats.uniqueWarehouses}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

         
        </>
      )}
    </div>
  );
}
