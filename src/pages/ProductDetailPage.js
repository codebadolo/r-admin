import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct } from "../services/productService";

const { Title, Text } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

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

  // Calcul des stocks totaux et vendus
  const totalStock = product.stocks?.reduce((sum, s) => sum + (s.units || 0), 0) || 0;
  const soldStock = product.stocks?.reduce((sum, s) => sum + (s.units_sold || 0), 0) || 0;

  // Image principale
  const mainImage =
    product.images?.find((img) => img.is_feature) || product.images?.[0] || null;

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


  // Galerie images
  const imageGallery = (product.images || []).map((img) => ({
    src: img.image,
    alt: img.alt_text || "",
    key: img.id,
  }));

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
              <Descriptions.Item label="Type">{product.product_type?.name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Slug">{product.slug || "-"}</Descriptions.Item>
              <Descriptions.Item label="Créé le">
                {new Date(product.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Modifié le">
                {new Date(product.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Title level={5}>Description</Title>
          <Text>
            {product.description ? (
              product.description
            ) : (
              <Text type="secondary" italic>(Aucune description)</Text>
            )}
          </Text>
          <Divider />
          <Title level={5}>Spécifications techniques</Title>
          {Array.isArray(product.attribute_values) && product.attribute_values.length > 0 ? (
            <Table
              columns={attributeColumns}
              dataSource={product.attribute_values}
              rowKey="id"
              size="small"
              pagination={false}
            />
          ) : (
            <Text type="secondary" italic>Aucun attribut</Text>
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

          <Title level={5}>Galerie d'images</Title>
          {imageGallery.length === 0 ? (
            <Text type="secondary">Aucune image disponible</Text>
          ) : (
            <Space size={[12, 12]} wrap>
              {imageGallery.map((img) => (
                <Image
                  key={img.key}
                  src={img.src}
                  alt={img.alt}
                  width={96}
                  style={{ borderRadius: 8 }}
                />
              ))}
            </Space>
          )}
        </Col>
      </Row>
    </Card>
  );
}
