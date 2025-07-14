import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Divider, Image, Row, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProduct, fetchProduct } from '../services/productService';

const { Title, Paragraph } = Typography;

function getProductAge(createdAt) {
  if (!createdAt) return '';
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Aujourd\'hui';
  if (diffDays === 1) return '1 jour';
  if (diffDays < 30) return `${diffDays} jours`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mois`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} an${diffYears > 1 ? 's' : ''}`;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct(id).then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <div>Chargement...</div>;

  // Attributs sous forme de tags
  const attributes = product.attributes || [];
  // Variantes sous forme de tableau
  const variants = product.variants || [];
  // Spécifications sous forme de tableau
  const specifications = product.specifications || [];
  // Galerie d'images
  const gallery = product.images || [];

  // Colonnes pour la table des variantes
  const variantColumns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Prix (€)', dataIndex: 'store_price', key: 'store_price', render: v => v?.toFixed(2) },
    { title: 'Stock', dataIndex: ['stock', 'units'], key: 'stock', render: v => v ?? 0 },
    { title: 'Par défaut', dataIndex: 'is_default', key: 'is_default', render: v => v ? <Tag color="green">Oui</Tag> : '' },
  ];

  // Colonnes pour la table des spécifications
  const specColumns = [
    { title: 'Section', dataIndex: 'section', key: 'section' },
    { title: 'Clé', dataIndex: 'key', key: 'key' },
    { title: 'Valeur', dataIndex: 'value', key: 'value' },
  ];

  return (
    <Card
      style={{
        maxWidth: 900,
        margin: '32px auto',
        borderRadius: 16,
        boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
        background: '#fff'
      }}
      bodyStyle={{ padding: 32 }}
    >
      <Row gutter={[32, 16]}>
        <Col xs={24} md={10}>
          <Image
            src={product.image || (gallery[0]?.img_url)}
            alt={product.name}
            style={{ borderRadius: 12, objectFit: 'cover', width: '100%', height: 320, marginBottom: 16 }}
            fallback="https://via.placeholder.com/320x240?text=Image"
          />
          {gallery.length > 1 && (
            <Image.PreviewGroup>
              <Space>
                {gallery.slice(1, 5).map((img, i) => (
                  <Image
                    key={i}
                    src={img.img_url}
                    alt={img.alt_text}
                    width={64}
                    height={64}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          )}
        </Col>
        <Col xs={24} md={14}>
          <Title level={2} style={{ marginBottom: 0 }}>{product.name}</Title>
          <Space style={{ marginBottom: 16 }}>
            {product.category?.name && <Tag color="blue">{product.category.name}</Tag>}
            {product.brand?.name && <Tag color="purple">{product.brand.name}</Tag>}
            {product.product_type?.name && <Tag color="geekblue">{product.product_type.name}</Tag>}
          </Space>
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Prix">{product.store_price?.toFixed(2)} €</Descriptions.Item>
            <Descriptions.Item label="Stock">{product.stock?.units ?? 0}</Descriptions.Item>
            <Descriptions.Item label="Âge">{getProductAge(product.created_at)}</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 16, color: '#555', fontSize: 15 }}>
            {product.description}
          </Paragraph>
          <Divider />
          <div style={{ marginBottom: 8 }}>
            <b>Attributs :</b>{' '}
            {attributes.length > 0 ? attributes.map((attr, i) => (
              <Tag color="cyan" key={i}>{attr.name}: {attr.value}</Tag>
            )) : <span style={{ color: '#aaa' }}>Aucun</span>}
          </div>
          <Divider />
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Retour
            </Button>
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => navigate(`/products/edit/${product.id}`)}
            >
              Modifier
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={async () => {
                if (window.confirm('Supprimer ce produit ?')) {
                  await deleteProduct(product.id);
                  navigate('/products');
                }
              }}
            >
              Supprimer
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Variantes */}
      {variants.length > 0 && (
        <>
          <Divider orientation="left">Variantes</Divider>
          <Table
            columns={variantColumns}
            dataSource={variants}
            rowKey="sku"
            size="small"
            pagination={false}
            style={{ marginBottom: 24 }}
          />
        </>
      )}

      {/* Spécifications techniques */}
      {specifications.length > 0 && (
        <>
          <Divider orientation="left">Spécifications techniques</Divider>
          <Table
            columns={specColumns}
            dataSource={specifications}
            rowKey={(_, i) => i}
            size="small"
            pagination={false}
          />
        </>
      )}
    </Card>
  );
};

export default ProductDetailPage;
