import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import productService from "../../services/productService";

const { Option } = Select;

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [form] = Form.useForm();

  // Charger données nécessaires au chargement
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [stocksRes, whRes, productsRes, variantsRes] = await Promise.all([
        productService.getStockLevels(),
        productService.getWarehouses(),
        productService.getProducts(),
        productService.getVariants(),
      ]);
      setStocks(stocksRes.data);
      setWarehouses(whRes.data);
      setProducts(productsRes.data);
      setVariants(variantsRes.data);
    } catch (error) {
      message.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir modal ajout ou édition avec données préremplies
  const openModal = (stock = null) => {
    setEditingStock(stock);

    if (stock) {
      form.setFieldsValue({
        warehouse: stock.warehouse,
        product: stock.product,
        variant: stock.variant || null,
        stock_total: stock.stock_total,
        stock_reserve: stock.stock_reserve || 0,
        seuil_alerte: stock.seuil_alerte || 0,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStock(null);
    form.resetFields();
  };

  // Gestion changement produit : filtrer variantes de ce produit
  const onProductChange = (productId) => {
    form.setFieldsValue({ variant: null });
  };

  // Soumission formulaire create/update stock
  const onSubmit = async (values) => {
    try {
      if (!values.warehouse || !values.product) {
        message.error("Veuillez sélectionner un produit et un entrepôt");
        return;
      }
      if (editingStock) {
        await productService.updateStockLevel(editingStock.id, values);
        message.success("Stock mis à jour");
      } else {
        await productService.createStockLevel(values);
        message.success("Stock créé");
      }
      closeModal();
      loadInitialData();
    } catch (error) {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  // Suppression stock
  const onDelete = (stockId) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer ce stock ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await productService.deleteStockLevel(stockId);
          message.success("Stock supprimé");
          loadInitialData();
        } catch {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  // Colonnes table
  const columns = [
    {
      title: "Produit",
      dataIndex: ["product", "nom"],
      key: "product",
      render: (_, record) => record.product?.nom || "-",
      sorter: (a, b) => (a.product?.nom || "").localeCompare(b.product?.nom || ""),
    },
    {
      title: "Variante",
      dataIndex: ["variant", "nom"],
      key: "variant",
      render: (_, record) => record.variant?.nom || "-",
    },
    {
      title: "Entrepôt",
      dataIndex: ["warehouse", "nom"],
      key: "warehouse",
      render: (_, record) => record.warehouse?.nom || "-",
      sorter: (a, b) => (a.warehouse?.nom || "").localeCompare(b.warehouse?.nom || ""),
    },
    {
      title: "Stock total",
      dataIndex: "stock_total",
      key: "stock_total",
      sorter: (a, b) => a.stock_total - b.stock_total,
    },
    {
      title: "Stock réservé",
      dataIndex: "stock_reserve",
      key: "stock_reserve",
      sorter: (a, b) => (a.stock_reserve || 0) - (b.stock_reserve || 0),
    },
    {
      title: "Seuil d'alerte",
      dataIndex: "seuil_alerte",
      key: "seuil_alerte",
      sorter: (a, b) => (a.seuil_alerte || 0) - (b.seuil_alerte || 0),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openModal(record)}>
            Modifier
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  // Variantes filtrées par produit sélectionné dans formulaire
  const filteredVariants = variants.filter(v => {
    const prodId = form.getFieldValue("product");
    return prodId ? v.product === prodId : true;
  });

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Gestion des stocks</h2>

      {loading ? (
        <Spin tip="Chargement des stocks..." />
      ) : (
        <>
          <Button
            type="primary"
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            Ajouter un stock
          </Button>

          <Table
            dataSource={stocks}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />

          <Modal
            open={modalVisible}
            title={editingStock ? "Modifier le stock" : "Ajouter un stock"}
            onCancel={closeModal}
            onOk={() => form.submit()}
            destroyOnClose
          >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
              <Form.Item
                name="warehouse"
                label="Entrepôt"
                rules={[{ required: true, message: "Veuillez sélectionner un entrepôt" }]}
              >
                <Select placeholder="Sélectionnez un entrepôt" showSearch optionFilterProp="children">
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>
                      {w.nom || w.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="product"
                label="Produit"
                rules={[{ required: true, message: "Veuillez sélectionner un produit" }]}
              >
                <Select
                  placeholder="Sélectionnez un produit"
                  showSearch
                  optionFilterProp="children"
                  onChange={onProductChange}
                >
                  {products.map(p => (
                    <Option key={p.id} value={p.id}>
                      {p.nom || p.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="variant"
                label="Variante (optionnel)"
              >
                <Select
                  placeholder="Sélectionnez une variante"
                  showSearch
                  optionFilterProp="children"
                  disabled={!form.getFieldValue("product")}
                >
                  {filteredVariants.map(v => (
                    <Option key={v.id} value={v.id}>
                      {v.nom || v.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="stock_total"
                label="Stock total"
                rules={[{ required: true, message: "Veuillez saisir le stock total" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="stock_reserve"
                label="Stock réservé"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="seuil_alerte"
                label="Seuil d'alerte"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
}
