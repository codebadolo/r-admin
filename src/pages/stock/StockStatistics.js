import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, message, Spin } from "antd";
import { Column } from '@ant-design/charts'; // Ant Design Charts, à installer via npm/yarn
import productService from "../../services/productService";

export default function StockStatistics() {
  const [loading, setLoading] = useState(false);
  const [stockLevels, setStockLevels] = useState([]);
  const [stats, setStats] = useState({
    totalStock: 0,
    totalProducts: 0,
    productsInAlert: 0,
    productsOutOfStock: 0,
  });

  // Charger les données de stock
  const loadStockData = async () => {
    setLoading(true);
    try {
      const res = await productService.getStockLevels();
      const stocks = res.data;

      setStockLevels(stocks);

      // Calculs de statistiques simples
      const totalStock = stocks.reduce((sum, s) => sum + (s.stock_total || 0), 0);
      const productsOutOfStock = stocks.filter(s => (s.stock_total || 0) === 0).length;
      const productsInAlert = stocks.filter(
        s => (s.seuil_alerte != null && s.stock_total != null && s.stock_total <= s.seuil_alerte)
      ).length;
      const totalProducts = stocks.length;

      setStats({
        totalStock,
        totalProducts,
        productsInAlert,
        productsOutOfStock,
      });
    } catch (error) {
      message.error("Erreur lors du chargement des statistiques de stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  // Préparer données pour chart barres : stock par produit (nom)
  const chartData = stockLevels.map(sl => ({
    product: sl.product?.nom || sl.product?.name || `Produit #${sl.product}`,
    stock: sl.stock_total || 0,
  }));

  const config = {
    data: chartData,
    xField: 'product',
    yField: 'stock',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: { autoHide: true, autoRotate: false },
    },
    meta: {
      product: { alias: 'Produit' },
      stock: { alias: 'Stock total' },
    },
    height: 350,
    appendPadding: 10,
  };

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 24 }}>
      <h2>Statistiques de stock</h2>

      {loading ? (
        <Spin tip="Chargement..." />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total articles en stock"
                  value={stats.totalStock}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Nombre de produits"
                  value={stats.totalProducts}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Produits en seuil d'alerte"
                  value={stats.productsInAlert}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Produits en rupture"
                  value={stats.productsOutOfStock}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Stock total par produit">
            <Column {...config} />
          </Card>
        </>
      )}
    </div>
  );
}
