import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // React Router pour route dynamique
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  List,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import productService from "../../services/productService";

const { Title, Text } = Typography;

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement complet des infos produit
  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const [prodRes, variantsRes, specsRes, imagesRes, docsRes] = await Promise.all([
        productService.getProductById(productId),
        productService.getVariants({ product: productId }),
        productService.getProductSpecifications({ product: productId }),
        productService.getProductImages({ product: productId }),
        productService.getProductDocuments({ product: productId }),
      ]);

      setProduct(prodRes.data);
      setVariants(variantsRes.data);
      setSpecifications(specsRes.data);
      setImages(imagesRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      message.error("Erreur lors du chargement du produit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Supprimer produit avec confirmation
  const handleDelete = () => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer ce produit ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await productService.deleteProduct(productId);
          message.success("Produit supprimé");
          navigate("/products"); // Retour à la liste
        } catch {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  // Colonnes variants (exemple basique)
  const variantColumns = [
    { title: "Nom", dataIndex: "nom", key: "nom" },
    {
      title: "Valeur",
      dataIndex: "valeur",
      key: "valeur",
    },
    {
      title: "Prix supplémentaire (€)",
      dataIndex: "prix_supplémentaire",
      key: "prix_supplémentaire",
      render: (val) => (val != null ? val.toFixed(2) : "-"),
    },
    { title: "Stock", dataIndex: "stock", key: "stock" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")} style={{ marginBottom: 20 }}>
        Retour à la liste
      </Button>

      {loading ? (
        <Spin tip="Chargement..." size="large" style={{ width: "100%", textAlign: "center" }} />
      ) : !product ? (
        <div>Produit non trouvé.</div>
      ) : (
        <>
          <Title level={2}>{product.nom}</Title>

          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/products/edit/${productId}`)}>
              Modifier
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Supprimer
            </Button>
          </Space>

          <Row gutter={24}>
            <Col span={10}>
              {images.length > 0 ? (
                <Image.PreviewGroup>
                  {images.map((img) => (
                    <Image
                      key={img.id}
                      src={img.url || img.image_url}
                      alt={img.name || "Image produit"}
                      style={{ marginBottom: 10, borderRadius: 8 }}
                    />
                  ))}
                </Image.PreviewGroup>
              ) : (
                <div style={{ padding: 20, background: "#fafafa", borderRadius: 8 }}>
                  Pas d'image disponible.
                </div>
              )}
            </Col>

            <Col span={14}>
              <Descriptions
                title="Informations produit"
                bordered
                column={1}
                size="middle"
                layout="vertical"
              >
                <Descriptions.Item label="Description">
                  {product.description || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Prix (€)">
                  {product.prix != null ? product.prix.toFixed(2) : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Stock">
                  {product.stock != null ? product.stock : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="État">
                  {product.etat || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Catégorie">
                  {product.category?.nom || product.category?.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Marque">
                  {product.brand?.nom || product.brand?.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="EAN Code">
                  {product.ean_code || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Activé">
                  {product.is_active ? "Oui" : "Non"}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Variantes</Title>
          {variants.length === 0 ? (
            <div>Aucune variante disponible.</div>
          ) : (
            <Table
              dataSource={variants}
              columns={variantColumns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginBottom: 24 }}
            />
          )}

          <Divider />

          <Title level={4}>Spécifications</Title>
          {specifications.length === 0 ? (
            <div>Aucune spécification disponible.</div>
          ) : (
            <List
              bordered
              size="small"
              dataSource={specifications}
              renderItem={(spec) => (
                <List.Item>
                  <b>{spec.spec_key?.nom_attribut || spec.nom_attribut} :</b>{" "}
                  {spec.valeur}
                </List.Item>
              )}
              style={{ marginBottom: 24 }}
            />
          )}

          <Divider />

          <Title level={4}>Documents</Title>
          {documents.length === 0 ? (
            <div>Aucun document disponible.</div>
          ) : (
            <List
              size="small"
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item>
                  <a href={doc.url || doc.file_url} target="_blank" rel="noopener noreferrer">
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    {doc.name || doc.filename || "Document"}
                  </a>
                </List.Item>
              )}
            />
          )}
        </>
      )}
    </div>
  );
}
