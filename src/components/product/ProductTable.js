import { EditOutlined, EyeOutlined, PictureOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBrands,
  fetchCategories,
  fetchProducts,
  fetchProductTypes,
  fetchWarehouses,
} from "../../services/productService";

export default function ProductTable() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
 
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats, brds, tps,] = await Promise.all([
          fetchProducts({}),
          fetchCategories(),
          fetchBrands(),
          fetchProductTypes(),
          fetchWarehouses(),
        ]);
        setProducts(prods);
        setCategories(cats);
        setBrands(brds);
        setTypes(tps);
       
        setFiltered(prods);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);




  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearchTerm(val);
    if (!val) {
      setFiltered(products);
      setPagination({ current: 1, pageSize: pagination.pageSize });
      return;
    }
    const filteredData = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(val)) ||
        (p.description || "").toLowerCase().includes(val)
    );
    setFiltered(filteredData);
    setPagination({ current: 1, pageSize: pagination.pageSize });
  };

  const handleTableChange = (newPagination, filters) => {
    let data = products;

    if (Array.isArray(filters.category) && filters.category.length > 0) {
      data = data.filter((d) => filters.category.includes(d.category?.id));
    }
    if (Array.isArray(filters.brand) && filters.brand.length > 0) {
      data = data.filter((d) => filters.brand.includes(d.brand?.id));
    }
    if (Array.isArray(filters.product_type) && filters.product_type.length > 0) {
      data = data.filter((d) => filters.product_type.includes(d.product_type?.id));
    }
    if (Array.isArray(filters.is_active) && filters.is_active.length > 0) {
      data = data.filter((d) => filters.is_active.includes(d.is_active));
    }
    if (searchTerm) {
      const val = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(val)) ||
          (p.description || "").toLowerCase().includes(val)
      );
    }

    setFiltered(data);
    setPagination(newPagination);
  };

  const getFirstImage = (product) =>
    product.images && product.images.length ? product.images[0].image : null;

  const paginatedData = filtered.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const columns = [
    {
      title: "Photo",
      key: "photo",
      width: 74,
      render: (_, r) => {
        const img = getFirstImage(r);
        return img ? (
          <img
            src={img}
            alt={r.name}
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <PictureOutlined style={{ fontSize: 32, color: "#aaa" }} />
        );
      },
    },
    { title: "Nom", dataIndex: "name", key: "name" },
    {
      title: "Catégorie",
      key: "category",
      filters: categories.map((c) => ({ text: c.name, value: c.id })),
      render: (_, r) => r.category?.name || "-",
    },
    {
      title: "Marque",
      key: "brand",
      filters: brands.map((b) => ({ text: b.name, value: b.id })),
      render: (_, r) => r.brand?.name || "-",
    },
    {
      title: "Type",
      key: "product_type",
      filters: types.map((t) => ({ text: t.name, value: t.id })),
      render: (_, r) => r.product_type?.name || "-",
    },
    {
      title: "Prix (€)",
      dataIndex: "price",
      key: "price",
      render: (p) => Number(p).toFixed(2),
    },



  {
      title: "Statut",
      dataIndex: "is_active",
      key: "is_active",
      filters: [
        { text: "Actif", value: true },
        { text: "Inactif", value: false },
      ],
      render: (val) =>
        val ? <Tag color="green">Actif</Tag> : <Tag color="red">Inactif</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 88,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/products/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/products/edit/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/products/create")}
        >
          Ajouter produit
        </Button>
        <Input.Search
          placeholder="Recherche produit…"
          onChange={handleSearch}
          style={{ width: 250 }}
          allowClear
          value={searchTerm}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filtered.length,
          showSizeChanger: true,
          showTotal: (total) => `${total} produit(s)`,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
        onChange={handleTableChange}
        bordered
        size="middle"
        style={{ background: "#fff" }}
      />
    </div>
  );
}
