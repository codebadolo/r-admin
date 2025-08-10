import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Typography, Image, Tooltip } from "antd";
import productService from "../../services/productService";

const { Title } = Typography;

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination avec DRF qui ne pagine pas ici (liste plate)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await productService.getProducts();
    console.log("Réponse API brute :", res.data);

    const data = res.data;

    if (Array.isArray(data)) {
      setProducts(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
      }));
    } else if (data && Array.isArray(data.results)) {
      setProducts(data.results);
      setPagination(prev => ({
        ...prev,
        total: data.count,
      }));
    } else {
      setError("Format de données inattendu");
      setProducts([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
      }));
    }
  } catch {
    setError("Erreur lors du chargement des produits");
    setProducts([]);
    setPagination(prev => ({
      ...prev,
      total: 0,
    }));
  } finally {
    setLoading(false);
  }
};


  // Colonnes du tableau
  const columns = [
    {
      title: "Image",
      dataIndex: "image_url",
      key: "image",
      width: 100,
      render: (text, record) => {
        // Affiche image principale ou placeholder
        const url = record.image_url || (record.images && record.images[0]?.image_url);
        return url ? (
          <Image
            src={url}
            alt={record.nom}
            width={80}
            height={80}
            style={{ objectFit: "contain" }}
            preview={false}
            placeholder={<div style={{ width: 80, height: 80, background: "#f0f0f0" }} />}
          />
        ) : (
          <div style={{ width: 80, height: 80, background: "#f0f0f0", textAlign: "center", lineHeight: "80px", color: "#999" }}>
            N/A
          </div>
        );
      },
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      sorter: (a, b) => a.nom.localeCompare(b.nom),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Prix (€)",
      dataIndex: "prix",
      key: "prix",
      sorter: (a, b) => parseFloat(a.prix) - parseFloat(b.prix),
      render: (val) => (val ? parseFloat(val).toFixed(2) : "-"),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      render: (val) => (val ?? "-"),
    },
    {
      title: "Catégorie",
      key: "category",
      render: (_, record) => record.category?.nom || "-",
      filters: [], // Vous pouvez charger dynamiquement les catégories si besoin
      onFilter: (value, record) => record.category?.nom === value,
    },
    {
      title: "Marque",
      key: "brand",
      render: (_, record) => record.brand?.nom || "-",
      filters: [], // Idem pour filtres marques
      onFilter: (value, record) => record.brand?.nom === value,
    },
    {
      title: "Variantes",
      key: "variants",
      render: (_, record) =>
        record.variants && record.variants.length > 0 ? (
          <Tooltip
            title={record.variants
              .map((v) => `${v.nom}: ${v.valeur} (+${parseFloat(v.prix_supplémentaire).toFixed(2)}€)`)
              .join(", ")}
          >
            {record.variants.length} variantes
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "EAN Code",
      dataIndex: "ean_code",
      key: "ean_code",
      render: (val) => val || "-",
    },
  ];

  // Gestion pagination front (simple car pas paginé côté backend)
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      total: products.length,
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "auto" }}>
      <Title level={2}>Catalogue des Produits</Title>

      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 20 }}
        />
      )}

      {loading ? (
        <Spin tip="Chargement..." style={{ display: "block", padding: 40, textAlign: "center" }}>
          <div style={{ minHeight: 200 }} />
        </Spin>
      ) : (
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
}
