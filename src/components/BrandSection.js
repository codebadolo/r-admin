import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, Modal, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { createBrand, deleteBrand, fetchBrands, updateBrand } from "../services/productService";
import BrandModalForm from "./BrandModalForm";

export default function BrandSection() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    setLoading(true);
    fetchBrands()
      .then(setBrands)
      .catch(() => message.error("Erreur chargement marques"))
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setModalVisible(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer cette marque?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        deleteBrand(id)
          .then(() => {
            message.success("Marque supprimée");
            loadBrands();
          })
          .catch(() => message.error("Erreur suppression"));
      },
    });
  };

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.logoFile) {
      formData.append("logo", values.logoFile);
    }
    const req = editingBrand
      ? updateBrand(editingBrand.id, formData)
      : createBrand(formData);

    req
      .then(() => {
        message.success(`Marque ${editingBrand ? "modifiée" : "créée"} avec succès`);
        setModalVisible(false);
        loadBrands();
      })
      .catch(() => message.error("Erreur sauvegarde"));
  };

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }} icon={<PlusOutlined />}>
        Ajouter une marque
      </Button>

      {loading ? (
        <Spin tip="Chargement..." style={{ display: "block", margin: "40px auto" }} />
      ) : brands.length === 0 ? (
        <div>Aucune marque disponible.</div>
      ) : (
        <Row gutter={[16, 16]}>
          {brands.map((brand) => (
            <Col key={brand.id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                size="small"
                title={brand.name}
                cover={
                  brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      style={{ height: 100, objectFit: "contain", padding: 12, background: "#fff" }}
                    />
                  ) : null
                }
                actions={[
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(brand)} key="edit" title="Modifier" />,
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(brand.id)} key="delete" title="Supprimer" />,
                ]}
                style={{ height: "100%" }}
              />
            </Col>
          ))}
        </Row>
      )}

      <BrandModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        brand={editingBrand}
      />
    </div>
  );
}
