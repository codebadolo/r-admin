import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
// ... autres imports Ant Design, router, services, etc.

import { useNavigate, useParams } from "react-router-dom";
import {
  createProductImage, // Assurez-vous d'avoir ces fonctions dans votre productService
  deleteProductImage,
  fetchProduct,
} from "../services/productService"; // Chemin vers votre fichier de services

const { Title, Text } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la modal d'ajout d'image
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fonction pour recharger les données du produit après modification (upload/delete image)
  const refreshProductData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedProduct = await fetchProduct(id);
      setProduct(fetchedProduct);
    } catch (error) {
      console.error("Erreur lors du rechargement du produit:", error);
      message.error("Impossible de recharger les données du produit.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshProductData();
  }, [refreshProductData]);

  // Image principale
  const mainImage =
    product?.images?.find((img) => img.is_feature) || product?.images?.[0] || null;

  // Calcul des stocks totaux et vendus
  const totalStock = product?.stocks?.reduce((sum, s) => sum + (s.units || 0), 0) || 0;
  const soldStock = product?.stocks?.reduce((sum, s) => sum + (s.units_sold || 0), 0) || 0;

  // Colonnes spécifications techniques
  const attributeColumns = [
    {
      title: "Nom",
      key: "attributeName",
      render: (_, record) => record.option?.attribute?.name || "-",
    },
    {
      title: "Valeur",
      key: "attributeValue",
      render: (_, record) => record.option?.value || "-",
    },
  ];

  // Colonnes stock avec info entrepôt
  const stockColumns = [
    {
      title: "Entrepôt",
      key: "warehouseName",
      render: (_, record) => record.warehouse?.name || "-",
    },
    {
      title: "Localisation",
      key: "warehouseLocation",
      render: (_, record) => record.warehouse?.location || "-",
    },
    {
      title: "Disponible",
      dataIndex: "units",
      key: "units",
      render: (units) => (
        <Tag color={units > 5 ? "green" : "red"}>{units ?? "-"}</Tag>
      ),
    },
    {
      title: "Déjà vendu",
      dataIndex: "units_sold",
      key: "unitsSold",
      render: (units_sold) => units_sold ?? "-",
    },
  ];

  // --- Fonctions de gestion d'image ---
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("product", product.id);
    formData.append("image", file);

    try {
      const newImage = await createProductImage(formData);
      message.success("Image ajoutée avec succès");
      // Mettre à jour l'état local du produit pour inclure la nouvelle image
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImage],
      }));
      onSuccess(null, file);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'image:", error);
      message.error("Erreur lors de l'ajout de l'image.");
      onError();
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (imgId) => {
    Modal.confirm({
      title: "Supprimer l’image",
      content: "Voulez-vous vraiment supprimer cette image ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await deleteProductImage(imgId);
          message.success("Image supprimée avec succès.");
          // Mettre à jour l'état local du produit pour retirer l'image supprimée
          setProduct((prev) => ({
            ...prev,
            images: (prev.images || []).filter((img) => img.id !== imgId),
          }));
        } catch (error) {
          console.error("Erreur lors de la suppression de l'image:", error);
          message.error("Erreur lors de la suppression de l'image.");
        }
      },
    });
  };
  // --- Fin des fonctions de gestion d'image ---

  if (loading)
    return (
      <Spin tip="Chargement..." style={{ display: "block", margin: "60px auto" }} />
    );

  if (!product)
    return (
      <Card>
        <Text type="danger">Produit introuvable.</Text>
        <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Retour
        </Button>
      </Card>
    );

  return (
    <Card
      title={
        <Space align="center" wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <span style={{ fontWeight: 500 }}>{product.name}</span>
          <Tag color={product.is_active ? "green" : "red"}>
            {product.is_active ? "Actif" : "Inactif"}
          </Tag>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${product.id}`)}
          >
            Modifier
          </Button>
        </Space>
      }
    >
      <Row gutter={32}>
        {/* Colonne gauche (image principale/info produit) */}
        <Col xs={24} md={8}>
          <Card
            bordered
            cover={
              mainImage ? (
                <Image
                  src={mainImage.image}
                  alt={mainImage.alt_text || ""}
                  style={{
                    maxHeight: 320,
                    objectFit: "contain",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fcfcfc",
                  }}
                >
                  <Text type="secondary">Aucune image</Text>
                </div>
              )
            }
          >
            <Title level={4}>{product.name}</Title>
            <Text type="secondary">{product.category?.name || "-"}</Text>
            <br />
            <Text strong>{Number(product.price).toFixed(2)} €</Text>
            <br />
            <Tag color="blue">{product.brand?.name || "-"}</Tag>
            <br />
            <Text>
              Dépôt principal : {product.stocks?.[0]?.warehouse?.name || "-"}
            </Text>
            <Divider />
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Type">
                {product.product_type?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Slug">
                {product.slug || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Créé le">
                {new Date(product.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Modifié le">
                {new Date(product.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Colonne droite (description, attributs, stock, galerie) */}
        <Col xs={24} md={16}>
          <Title level={5}>Description</Title>
          <Text>
            {product.description ? (
              product.description
            ) : (
              <Text type="secondary" italic>
                (Aucune description)
              </Text>
            )}
          </Text>
          <Divider />

          <Title level={5}>Spécifications techniques</Title>
          {Array.isArray(product.attribute_values) &&
          product.attribute_values.length > 0 ? (
            <Table
              columns={attributeColumns}
              dataSource={product.attribute_values}
              rowKey="id"
              size="small"
              pagination={false}
            />
          ) : (
            <Text type="secondary" italic>
              Aucun attribut
            </Text>
          )}

          <Divider />
          <Title level={5}>Stock</Title>
          <Space size="large" wrap style={{ marginBottom: 12 }}>
            <span>
              <b>Disponible en total :</b>{" "}
              <Tag color={totalStock > 5 ? "green" : "red"}>
                {totalStock ?? "-"}
              </Tag>
            </span>
            <span>
              <b>Unités déjà vendues :</b>{" "}
              <Tag color="blue">{soldStock ?? "-"}</Tag>
            </span>
          </Space>
          <Table
            columns={stockColumns}
            dataSource={product.stocks || []}
            rowKey="id"
            size="small"
            style={{ marginTop: 16 }}
            pagination={false}
          />
          <Divider />

          {/* Section Galerie d'images avec Upload et Suppression */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Title level={5}>Galerie d'images</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
              Ajouter une image
            </Button>
          </Row>

          {(product.images || []).length === 0 ? (
            <Text type="secondary">Aucune image disponible</Text>
          ) : (
            <Space size={[12, 12]} wrap>
              {(product.images || []).map((img) => (
                <div
                  key={img.id}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <Image
                    src={img.image}
                    alt={img.alt_text || ""}
                    width={96}
                    style={{ borderRadius: 8 }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(255,255,255,0.75)",
                      borderRadius: "50%",
                    }}
                    onClick={() => handleDeleteImage(img.id)}
                    title="Supprimer l'image"
                  />
                </div>
              ))}
            </Space>
          )}

          {/* Modal d’ajout d’image */}
          <Modal
            title="Ajouter une image"
            visible={isModalVisible}
            onCancel={closeModal}
            footer={null}
            destroyOnClose
          >
            <Upload
              accept="image/*"
              customRequest={handleUpload}
              showUploadList={false}
            >
              <Button icon={<PlusOutlined />} loading={uploading}>
                Cliquer pour uploader une image
              </Button>
            </Upload>
          </Modal>
        </Col>
      </Row>
    </Card>
  );
}
