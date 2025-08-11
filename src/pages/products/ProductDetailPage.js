import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Typography,
  Tag,
  Image,
  List,
  message,
  Button,
  Space,
  Row,
  Col,
  Breadcrumb,
} from 'antd';
import { FilePdfOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import { fetchProductById } from '../../services/productService';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const detailRef = useRef(null); // ref pour capture PDF

  // Charger le produit
  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await fetchProductById(id);
      setProduct(res.data);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
      message.error('Erreur lors du chargement du produit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', fontSize: 18 }}>Chargement du produit...</div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', fontSize: 18 }}>Produit non trouvé.</div>
    );
  }

  const safeGet = (obj, path, defaultVal = '-') =>
    path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj) || defaultVal;

  // Export PDF
  const handleExportPdf = () => {
    if (!detailRef.current) return;

    html2canvas(detailRef.current, { scale: 2, scrollY: -window.scrollY }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${product.nom || 'produit'}.pdf`);
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: 'auto', backgroundColor: '#fff' }}>
      {/* Breadcrumb + Actions */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /></Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/products">Catalogue</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{product.nom}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>

        <Col>
          <Space>
            <Button type="default" icon={<FilePdfOutlined />} onClick={handleExportPdf}>
              Exporter PDF
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/products/edit/${id}`)}
            >
              Mettre à jour
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Contenu principal - tout visible sans scrollVertical important */}
      <div ref={detailRef}>
        <Row gutter={24} wrap={false} style={{ minHeight: 480 }}>
          {/* Image */}
          <Col flex="280px">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.nom}
                width={280}
                height={280}
                style={{ borderRadius: 8, objectFit: 'cover' }}
                placeholder
              />
            ) : (
              <div
                style={{
                  width: 280,
                  height: 280,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontStyle: 'italic',
                }}
              >
                Pas d’image
              </div>
            )}
          </Col>

          {/* Informations principales */}
          <Col flex="1 1 0" style={{ overflowY: 'auto', maxHeight: 480 }}>
            <Card bordered={false} bodyStyle={{ padding: 16 }}>
              <Descriptions column={1} size="small" bordered layout="horizontal">
                <Descriptions.Item label="Nom">{product.nom}</Descriptions.Item>
                <Descriptions.Item label="Description">
                  {product.description || <i>Pas de description</i>}
                </Descriptions.Item>
                <Descriptions.Item label="Catégorie">{safeGet(product, 'category.nom')}</Descriptions.Item>
                <Descriptions.Item label="Marque">{safeGet(product, 'brand.nom')}</Descriptions.Item>
                <Descriptions.Item label="Prix">{product.prix} €</Descriptions.Item>
                <Descriptions.Item label="Stock">{product.stock}</Descriptions.Item>
                <Descriptions.Item label="État">
                  <Tag color={product.etat === 'disponible' ? 'green' : 'volcano'}>
                    {product.etat.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Code EAN">{product.ean_code || '-'}</Descriptions.Item>
                <Descriptions.Item label="Produit actif">{product.is_active ? 'Oui' : 'Non'}</Descriptions.Item>
                <Descriptions.Item label="Date création">
                  {new Date(product.date_creation).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Dernière modification">
                  {new Date(product.date_modification).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Variantes + Spécifications côte à côte */}
          <Col flex="400px" style={{ overflowY: 'auto', maxHeight: 480 }}>
            <Card size="small" title="Variantes" style={{ marginBottom: 16 }}>
              {product.variants && product.variants.length > 0 ? (
                <List
                  dataSource={product.variants}
                  size="small"
                  bordered
                  style={{ maxHeight: 180, overflowY: 'auto' }}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.nom}: ${item.valeur}`}
                        description={
                          <>
                            Prix suppl. : {item.prix_supplémentaire} € - Stock : {item.stock}
                            {item.image_url && (
                              <Image
                                src={item.image_url}
                                alt={`${item.nom} ${item.valeur}`}
                                width={40}
                                style={{ marginLeft: 8, borderRadius: 6 }}
                                preview={false}
                              />
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Paragraph><i>Aucune variante trouvée.</i></Paragraph>
              )}
            </Card>

            <Card size="small" title="Spécifications" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {product.specifications && product.specifications.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={product.specifications}
                  renderItem={item => (
                    <List.Item>
                      <strong>{safeGet(item, 'spec_key.nom_attribut')}:</strong> {item.valeur} {item.spec_key.unit || ''}
                    </List.Item>
                  )}
                />
              ) : (
                <Paragraph><i>Aucune spécification disponible.</i></Paragraph>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductDetailPage;
