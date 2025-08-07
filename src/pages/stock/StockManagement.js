import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import {
  createStock,
  deleteStock,
  fetchBrands,
  fetchCategories,
  fetchProducts,
  fetchStocks,
  fetchWarehouses,
  updateStock,
} from "../../services/productService";

const { Option } = Select;

export default function StockManagement() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [filterProduct, setFilterProduct] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterWarehouse, setFilterWarehouse] = useState(null);

  const [editingStock, setEditingStock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [
          stocksData,
          productsData,
          warehousesDataRaw,
          brandsData,
          categoriesData,
        ] = await Promise.all([
          fetchStocks(),
          fetchProducts(),
          fetchWarehouses(),
          fetchBrands(),
          fetchCategories(),
        ]);

        // Ajout d'un identifiant local unique (uid) par entrepôt
        const warehousesData = warehousesDataRaw.map((w, index) => ({
          ...w,
          uid: `wh-${index}`,
        }));

        // Jointure produit complète + calcul warehouseUid
        const stocksWithProductObj = stocksData.map((stock) => {
          const productObj = productsData.find((p) => p.id === stock.product);
          const matchingWarehouse = warehousesData.find(
            (w) =>
              w.name === stock.warehouse?.name &&
              w.location === stock.warehouse?.location
          );
          return {
            ...stock,
            product: productObj || { id: stock.product, name: "Produit inconnu" },
            warehouseUid: matchingWarehouse ? matchingWarehouse.uid : null,
          };
        });

        setStocks(stocksWithProductObj);
        setProducts(productsData);
        setWarehouses(warehousesData);
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (error) {
        message.error("Erreur lors du chargement des données");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    let filtered = [...stocks];
    if (filterProduct) filtered = filtered.filter((s) => s.product?.id === filterProduct);
    if (filterBrand) filtered = filtered.filter((s) => s.product?.brand?.id === filterBrand);
    if (filterCategory)
      filtered = filtered.filter((s) => s.product?.category?.id === filterCategory);
    if (filterWarehouse) filtered = filtered.filter((s) => s.warehouseUid === filterWarehouse);
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter((s) => {
        const name = s.product?.name?.toLowerCase() || "";
        const reference = s.product?.reference?.toLowerCase() || "";
        return name.includes(lowerSearch) || reference.includes(lowerSearch);
      });
    }
    setFilteredStocks(filtered);
  }, [stocks, filterProduct, filterBrand, filterCategory, filterWarehouse, searchText]);

  const openModal = (stock = null) => {
    setEditingStock(stock);
    if (stock) {
      form.setFieldsValue({
        product: stock.product?.id,
        warehouse: stock.warehouseUid || undefined,
        units: stock.units,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingStock(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const warehouseObj = warehouses.find((w) => w.uid === values.warehouse);
      if (!warehouseObj) throw new Error("Entrepôt invalide");

      const body = {
        product: values.product,
        warehouse: {
          name: warehouseObj.name,
          location: warehouseObj.location,
        },
        units: values.units,
      };

      if (editingStock) {
        await updateStock(editingStock.id, body);
        message.success("Stock mis à jour");
      } else {
        await createStock(body);
        message.success("Stock créé");
      }

      // Raffraichir les stocks avec liaison produit et warehouseUid
      const updatedStocks = await fetchStocks();

      const stocksWithProductObj = updatedStocks.map((stock) => {
        const productObj = products.find((p) => p.id === stock.product);
        const matchingWarehouse = warehouses.find(
          (w) =>
            w.name === stock.warehouse?.name &&
            w.location === stock.warehouse?.location
        );
        return {
          ...stock,
          product: productObj || { id: stock.product, name: "Produit inconnu" },
          warehouseUid: matchingWarehouse ? matchingWarehouse.uid : null,
        };
      });

      setStocks(stocksWithProductObj);
      handleCancel();
    } catch (error) {
      message.error("Erreur lors de la sauvegarde : " + (error.message || ""));
      console.error(error);
    }
    setSubmitting(false);
  };

  const handleDelete = (stock) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: `Voulez-vous supprimer le stock pour "${stock.product?.name}" en entrepôt "${stock.warehouse?.name}" ?`,
      okText: "Oui",
      okType: "danger",
      cancelText: "Annuler",
      async onOk() {
        try {
          await deleteStock(stock.id);
          setStocks((prev) => prev.filter((s) => s.id !== stock.id));
          message.success("Stock supprimé");
        } catch (error) {
          message.error("Erreur lors de la suppression");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Nom produit",
      dataIndex: ["product", "name"],
      key: "name",
      sorter: (a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""),
      ellipsis: true,
    },
    {
      title: "Marque",
      dataIndex: ["product", "brand", "name"],
      key: "brand",
      filters: brands.map((b) => ({ text: b.name, value: b.id })),
      onFilter: (value, record) => record.product?.brand?.id === value,
      ellipsis: true,
      width: 100,
    },
    {
      title: "Catégorie",
      dataIndex: ["product", "category", "name"],
      key: "category",
      filters: categories.map((c) => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.product?.category?.id === value,
      ellipsis: true,
    },
   {
  title: "Qte",
  dataIndex: "units",
  key: "units",
  align: "right",
  sorter: (a, b) => (a.units ?? 0) - (b.units ?? 0),
  width: 80,
},
{
  title: "Entrepôt",
  dataIndex: "warehouseUid",
  key: "warehouse",
  filters: warehouses.map((w) => ({ text: w.name, value: w.uid })),
  onFilter: (value, record) => record.warehouseUid === value,
  render: (uid) => {
    const warehouse = warehouses.find((w) => w.uid === uid);
    return warehouse ? warehouse.name : "-";
  },
  ellipsis: true,
},

    {
      title: "Actions",
      key: "actions",
 
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Spin tip="Chargement..." style={{ marginTop: 20, display: "block" }} />
    );
  }

  return (
    <div
      style={{
      
        width: "100%",
        margin: "auto",
        
      }}
    >  
      <Row gutter={[16, 16]} style={{ marginBottom: 2 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            allowClear
            placeholder="Recherche produit / référence"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            allowClear
            placeholder="Filtrer par produit"
            style={{ width: "100%" }}
            value={filterProduct}
            onChange={setFilterProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            allowClear
            placeholder="Filtrer par marque"
            style={{ width: "100%" }}
            value={filterBrand}
            onChange={setFilterBrand}
            showSearch
            optionFilterProp="children"
          >
            {brands.map((b) => (
              <Option key={b.id} value={b.id}>
                {b.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            allowClear
            placeholder="Filtrer par catégorie"
            style={{ width: "100%" }}
            value={filterCategory}
            onChange={setFilterCategory}
            showSearch
            optionFilterProp="children"
          >
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            allowClear
            placeholder="Filtrer par entrepôt"
            style={{ width: "100%" }}
            value={filterWarehouse}
            onChange={setFilterWarehouse}
            showSearch
            optionFilterProp="children"
          >
            {warehouses.map((w) => (
              <Option key={w.uid} value={w.uid}>
                {w.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Ajouter un stock
      </Button>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredStocks}
        pagination={{ pageSize: 10 }}
        scroll={{ y: 650, x: 1000 }}
        bordered
      />

      <Modal
        visible={modalVisible}
        title={editingStock ? "Modifier un stock" : "Ajouter un stock"}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okButtonProps={{ loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="product"
            label="Produit"
            rules={[{ required: true, message: "Veuillez sélectionner un produit" }]}
          >
            <Select showSearch placeholder="Sélectionnez un produit" optionFilterProp="children">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="warehouse"
            label="Entrepôt"
            rules={[{ required: true, message: "Veuillez sélectionner un entrepôt" }]}
          >
            <Select showSearch placeholder="Sélectionnez un entrepôt" optionFilterProp="children">
              {warehouses.map((w) => (
                <Option key={w.uid} value={w.uid}>{w.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="units"
            label="Quantité"
            rules={[{ required: true, message: "Veuillez saisir une quantité" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
