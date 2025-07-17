import { Card, Col, Collapse, Descriptions, Image, List, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // pour récupérer l'id du produit en URL
import { fetchProduct } from "../services/productService"; // fonction à créer pour récupérer les détails produit

const { Panel } = Collapse;

export default function ProductDetailPage() {
  const { id } = useParams(); // id du produit dans l’URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetchProduct(id);
        setProduct(res.data);
      } catch (e) {
        console.error("Erreur chargement produit", e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!product) return <div>Produit non trouvé</div>;

  return (
    <Card title={product.name} style={{ maxWidth: 900, margin: "auto", marginTop: 20 }}>
      <Row gutter={24}>
        <Col span={10}>
          {product.inventories && product.inventories.length > 0 ? (
            <Image
              src={product.inventories[0].media.length > 0 ? product.inventories[0].media[0].img_url : "/placeholder.png"}
              alt={product.name}
              style={{ width: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ width: "100%", height: 300, backgroundColor: "#eee", textAlign: "center", lineHeight: "300px" }}>
              Aucune image disponible
            </div>
          )}
        </Col>
        <Col span={14}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Marque">{product.brand?.name}</Descriptions.Item>
            <Descriptions.Item label="Catégorie">{product.category?.name}</Descriptions.Item>
            <Descriptions.Item label="Type">{product.product_type?.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{product.description}</Descriptions.Item>
            <Descriptions.Item label="Actif">{product.is_active ? "Oui" : "Non"}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Card type="inner" title="Variantes disponibles" style={{ marginTop: 30 }}>
        <List
          itemLayout="vertical"
          dataSource={product.inventories}
          renderItem={variant => (
            <List.Item key={variant.id}>
              <Row justify="space-between" align="middle">
                <Col>
                  <strong>SKU:</strong> {variant.sku}
                </Col>
                <Col>
                  <strong>Prix:</strong> {variant.store_price} €
                </Col>
                <Col>
                  <strong>Attributs:</strong>{" "}
                  {variant.attributes.map(attr => (
                    <Tag key={attr.id}>{attr.product_attribute_value.value}</Tag>
                  ))}
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Card>

      <Collapse style={{ marginTop: 30 }} accordion>
        {(product.specifications_sections || []).map(section => (
          <Panel header={section.name} key={section.id}>
            <List
              dataSource={product.specifications.filter(spec => spec.cle_specification.section === section.id)}
              renderItem={spec => (
                <List.Item key={spec.id}>
                  <b>{spec.cle_specification.name}</b>: {spec.value}
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
}
