import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  message,
  Spin
} from "antd";
import { useEffect, useState } from "react";
import BrandCardList from "../components/BrandCardList";
import BrandModalForm from "../components/BrandModalForm";
import * as produitService from "../services/productService";

const { Content } = Layout;

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await produitService.fetchBrands();
      setBrands(res.data);
    } catch (err) {
      message.error("Erreur lors du chargement des marques.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const handleSave = async (values) => {
    try {
      if (editingBrand) {
        await produitService.updateBrand(editingBrand.id, values);
        message.success("Marque mise à jour !");
      } else {
        await produitService.createBrand(values);
        message.success("Marque ajoutée !");
      }
      closeModal();
      fetchBrands();
    } catch (err) {
      message.error("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (brand) => {
    try {
      await produitService.deleteBrand(brand.id);
      message.success("Marque supprimée !");
      fetchBrands();
    } catch {
      message.error("Erreur lors de la suppression.");
    }
  };

  return (
    <Layout style={{ background: "#f6f8fa" }}>
      <Content style={{ maxWidth: 1200, margin: "auto", padding: 32, minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Marques</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            Ajouter une marque
          </Button>
        </div>
        {loading ? (
          <Spin size="large" />
        ) : (
          <BrandCardList brands={brands} onEdit={openModal} onDelete={handleDelete} />
        )}
        <BrandModalForm
          visible={modalVisible}
          onCancel={closeModal}
          onSubmit={handleSave}
          editingBrand={editingBrand}
        />
      </Content>
    </Layout>
  );
}
