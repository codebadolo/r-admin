import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, Modal, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import {
    createProductType,
    deleteProductType,
    fetchProductTypes,
    updateProductType,
} from "../services/productService";
import ProductTypeModalForm from "./ProductTypeModalForm";

export default function ProductTypeSection() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = () => {
    setLoading(true);
    fetchProductTypes()
      .then(setTypes)
      .catch(() => message.error("Erreur lors du chargement des types"))
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    setEditingType(null);
    setModalVisible(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer ce type ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        deleteProductType(id)
          .then(() => {
            message.success("Type supprimé");
            loadTypes();
          })
          .catch(() => message.error("Erreur lors de la suppression"));
      },
    });
  };

  const handleSubmit = (values) => {
    const action = editingType
      ? updateProductType(editingType.id, values)
      : createProductType(values);

    action
      .then(() => {
        message.success(`Type ${editingType ? "modifié" : "créé"} avec succès`);
        setModalVisible(false);
        loadTypes();
      })
      .catch(() => message.error("Erreur lors de la sauvegarde"));
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
        icon={<PlusOutlined />}
      >
        Ajouter un type
      </Button>

      {loading ? (
        <Spin tip="Chargement..." style={{ display: "block", margin: "40px auto" }} />
      ) : types.length === 0 ? (
        <div>Aucun type de produit disponible.</div>
      ) : (
        <Row gutter={[16, 16]}>
          {types.map((type) => (
            <Col key={type.id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                size="small"
                hoverable
                style={{ textAlign: "center" }} // Center content
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => handleEdit(type)}
                    title="Modifier"
                    style={{ fontSize: 18 }}
                  />,
                  <DeleteOutlined
                    key="delete"
                    onClick={() => handleDelete(type.id)}
                    title="Supprimer"
                    style={{ color: "red", fontSize: 18 }}
                  />,
                ]}
              >
                <div>{type.name}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <ProductTypeModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        productType={editingType}
      />
    </div>
  );
}
