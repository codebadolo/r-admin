import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Typography,
  Image,
  message,
  Button,
  List,
  Space,
  Row,
  Spin,
  Table,
  Col,
  Modal,
  Upload,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import {
  fetchProductById,
  createProductImage,
  deleteProductImage,
} from '../../services/productService';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imagesGallery, setImagesGallery] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const detailRef = useRef(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetchProductById(id);
        setProduct(res.data);

        // Construction galerie images combinées (produit + variantes, sans doublons)
        const productImages = res.data.images || [];
        const variantImages = [];

        (res.data.variants || []).forEach((variant) => {
          if (variant.image && !variantImages.find((vi) => vi.id === variant.image.id)) {
            variantImages.push(variant.image);
          }
        });

        const allImages = [
          ...productImages,
          ...variantImages.filter(
            (vi) => !productImages.some((pi) => pi.id === vi.id)
          ),
        ];

        setImagesGallery(allImages);
        setCurrentImageIndex(0);
      } catch (error) {
        message.error('Erreur lors du chargement du produit.');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  // Navigation dans galerie images
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      imagesGallery.length === 0 ? 0 : (prev + 1) % imagesGallery.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      imagesGallery.length === 0
        ? 0
        : (prev - 1 + imagesGallery.length) % imagesGallery.length
    );
  };

  const selectImage = (index) => {
    if (index >= 0 && index < imagesGallery.length) {
      setCurrentImageIndex(index);
    }
  };

  // Regroupe les spécifications par catégorie
  const groupSpecificationsByCategory = (specifications) => {
    if (!specifications) return [];
    const grouped = {};
    specifications.forEach((spec) => {
      const specCat = spec.spec_key?.spec_category;
      if (!specCat) return;
      if (!grouped[specCat.id]) {
        grouped[specCat.id] = {
          id: specCat.id,
          nom: specCat.nom,
          description: specCat.description,
          specs: [],
        };
      }
      grouped[specCat.id].specs.push({
        id: spec.id,
        nom_attribut: spec.spec_key.nom_attribut,
        data_type: spec.spec_key.data_type,
        unit: spec.spec_key.unit,
        valeur: spec.valeur,
      });
    });
    return Object.values(grouped);
  };

  const groupedSpecifications = groupSpecificationsByCategory(product?.specifications);

  // Formatage nombre sûr
  const formatNumber = (val) => {
    if (typeof val === 'number') return val.toFixed(2);
    const num = Number(val);
    return !isNaN(num) ? num.toFixed(2) : '-';
  };

  // Export PDF du détail produit
  const handleExportPdf = () => {
    if (!detailRef.current) return;
    html2canvas(detailRef.current, { scale: 2, scrollY: -window.scrollY }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${product?.nom || 'produit'}.pdf`);
    });
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  // Upload image
  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('product', product.id);
    formData.append('image', file);
    try {
      await createProductImage(formData);
      message.success('Image ajoutée avec succès');
      const res = await fetchProductById(id);
      setProduct(res.data);

      const productImages = res.data.images || [];
      const variantImages = [];
      (res.data.variants || []).forEach((variant) => {
        if (variant.image && !variantImages.find((vi) => vi.id === variant.image.id)) {
          variantImages.push(variant.image);
        }
      });

      setImagesGallery([
        ...productImages,
        ...variantImages.filter((vi) => !productImages.some((pi) => pi.id === vi.id)),
      ]);
      setCurrentImageIndex(0);

      onSuccess(null, file);
      closeModal();
    } catch (error) {
      message.error("Erreur lors de l'ajout de l'image.");
      onError();
    } finally {
      setUploading(false);
    }
  };

  // Supprimer image
  const handleDeleteImage = (imgId) => {
    Modal.confirm({
      title: 'Supprimer l’image',
      content: 'Voulez-vous vraiment supprimer cette image ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteProductImage(imgId);
          message.success('Image supprimée avec succès.');
          const res = await fetchProductById(id);
          setProduct(res.data);

          const productImages = res.data.images || [];
          const variantImages = [];
          (res.data.variants || []).forEach((variant) => {
            if (variant.image && !variantImages.find((vi) => vi.id === variant.image.id)) {
              variantImages.push(variant.image);
            }
          });

          setImagesGallery([
            ...productImages,
            ...variantImages.filter((vi) => !productImages.some((pi) => pi.id === vi.id)),
          ]);
          setCurrentImageIndex(0);
        } catch (error) {
          message.error("Erreur lors de la suppression de l'image.");
        }
      },
    });
  };

  // Calcul stocks total et réservé
  const totalStock =
    product?.stock_levels?.reduce((sum, s) => sum + (s.stock_total || 0), 0) || 0;
  const reservedStock =
    product?.stock_levels?.reduce((sum, s) => sum + (s.stock_reserve || 0), 0) || 0;

  // Colonnes variantes
  const variantColumns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Valeur', dataIndex: 'valeur', key: 'valeur' },
    {
      title: 'Prix supplémentaire (€)',
      dataIndex: 'prix_supplémentaire',
      key: 'prix_supplémentaire',
      render: (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '-'),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) =>
        image ? (
          <Image
            src={image.image || image.image_url || image.url}
            alt={image.alt_text || ''}
            width={64}
            preview={false}
          />
        ) : (
          '-'
        ),
    },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
  ];

  // Colonnes spécifications concat valeur + unité
  const specColumns = [
    { title: 'Attribut', dataIndex: 'nom_attribut', key: 'nom_attribut' },
    {
      title: 'Valeur',
      key: 'valeur_unite',
      render: (text, record) => record.valeur + (record.unit ? ' ' + record.unit : ''),
    },
  ];

  // Colonnes stock par entrepôt
  const stockColumns = [
    {
      title: 'Entrepôt',
      dataIndex: ['warehouse', 'nom'],
      key: 'warehouse',
    },
    {
      title: 'Adresse',
      dataIndex: ['warehouse', 'adresse'],
      key: 'adresse',
    },
    {
      title: 'Stock total',
      dataIndex: 'stock_total',
      key: 'stock_total',
      render: (val) => (val != null ? val : '-'),
    },
    {
      title: 'Stock réservé',
      dataIndex: 'stock_reserve',
      key: 'stock_reserve',
      render: (val) => (val != null ? val : '-'),
    },
    {
      title: 'Seuil d’alerte',
      dataIndex: 'seuil_alerte',
      key: 'seuil_alerte',
      render: (val) => (val != null ? val : '-'),
    },
  ];

  if (loading) {
    return <Spin tip="Chargement..." style={{ display: 'block', margin: '60px auto' }} />;
  }

  if (!product) {
    return (
      <Card>
        <Text type="danger">Produit introuvable.</Text>
        <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Card>
    );
  }

  // Container 2 colonnes responsive pour spécifications
  const SpecsGridWrapper = ({ children }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
      }}
    >
      {children}
    </div>
  );

  return (
    <Card
      title={
        <Space>
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour à la liste
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {product.nom || 'Détail produit'}
          </Title>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
            Exporter PDF
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${id}`)}
          >
            Modifier
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            Ajouter une image
          </Button>
        </Space>
      }
    >
      <div ref={detailRef}>
        <Row gutter={32}>
          {/* Colonne gauche: image principale + boutons navigation + miniatures */}
          <Col xs={24} md={8}>
            <Card
              bordered
              style={{
                textAlign: 'center',
                position: 'relative',
                height: '600px',
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, position: 'relative', height: '90%' }}>
                {imagesGallery.length > 0 ? (
                  <>
                    <Image
                      src={
                        imagesGallery[currentImageIndex].image ||
                        imagesGallery[currentImageIndex].image_url ||
                        imagesGallery[currentImageIndex].url
                      }
                      alt={imagesGallery[currentImageIndex].alt_text || ''}
                      width="100%"
                      height="100%"
                      style={{ borderRadius: 8, objectFit: 'contain' }}
                      preview={false}
                    />
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                        fontSize: 24,
                        color: '#000',
                        opacity: 0.6,
                        zIndex: 10,
                      }}
                      onClick={prevImage}
                      aria-label="Image précédente"
                    />
                    <Button
                      type="text"
                      icon={<ArrowRightOutlined />}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        fontSize: 24,
                        color: '#000',
                        opacity: 0.6,
                        zIndex: 10,
                      }}
                      onClick={nextImage}
                      aria-label="Image suivante"
                    />
                  </>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f0f0f0',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#999',
                      fontStyle: 'italic',
                    }}
                  >
                    Pas d'image disponible.
                  </div>
                )}
              </div>
              <div
                style={{
                  width: 72,
                  maxHeight: 560,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {(imagesGallery || []).map((img, idx) => (
                  <Image
                    key={img.id}
                    src={img.image || img.image_url || img.url}
                    alt={img.alt_text || ''}
                    width={64}
                    height={64}
                    style={{
                      borderRadius: 4,
                      border:
                        idx === currentImageIndex
                          ? '2px solid #1890ff'
                          : '1px solid #ddd',
                      cursor: 'pointer',
                      objectFit: 'cover',
                    }}
                    onClick={() => selectImage(idx)}
                    preview={false}
                  />
                ))}
              </div>
            </Card>

            <Descriptions
              size="small"
              column={1}
              bordered
              style={{ marginTop: 16 }}>
              <Descriptions.Item label="Prix TTC">{formatNumber(product.prix)} €</Descriptions.Item>
              <Descriptions.Item label="Stock total">{totalStock}</Descriptions.Item>
              <Descriptions.Item label="Stock réservé">{reservedStock}</Descriptions.Item>
              <Descriptions.Item label="Catégorie">{product.category?.nom || '-'}</Descriptions.Item>
              <Descriptions.Item label="Marque">{product.brand?.nom || '-'}</Descriptions.Item>
              <Descriptions.Item label="Référence">{product.ean_code || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Stock par entrepôt</Title>
            {product.stock_levels?.length > 0 ? (
              <Table
                columns={stockColumns}
                dataSource={product.stock_levels}
                pagination={false}
                rowKey="id"
                size="small"
                style={{ marginTop: 8 }}
              />
            ) : (
              <Text type="secondary">Aucune information de stock disponible.</Text>
            )}
          </Col>

          {/* Colonne droite: description, variantes, specs, produits liés, documents */}
          <Col xs={24} md={16}>
            <Title level={5}>Description</Title>
            {product.description ? (
              <Text>{product.description}</Text>
            ) : (
              <Text type="secondary" italic>
                (Aucune description)
              </Text>
            )}

            <Divider />

            <Title level={5}>Variantes</Title>
            {product.variants?.length > 0 ? (
              <Table
                dataSource={product.variants}
                columns={variantColumns}
                pagination={false}
                size="small"
                rowKey="id"
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Text type="secondary" italic>
                Aucune variante disponible.
              </Text>
            )}

            <Divider />

            <Title level={5}>Spécifications techniques</Title>
            {groupedSpecifications.length > 0 ? (
              <SpecsGridWrapper>
                {groupedSpecifications.map((cat) => (
                  <Card key={cat.id} size="small" style={{ minWidth: 320 }}>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {cat.nom}
                    </Title>
                    {cat.description && <Text type="secondary">{cat.description}</Text>}
                    <Table
                      dataSource={cat.specs}
                      columns={specColumns}
                      pagination={false}
                      size="small"
                      rowKey="id"
                      style={{ marginTop: 8 }}
                    />
                  </Card>
                ))}
              </SpecsGridWrapper>
            ) : (
              <Text type="secondary" italic>
                Aucune spécification disponible.
              </Text>
            )}

            <Divider />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={12}>
                <Title level={5}>Produits liés</Title>
                {product.related_products?.length > 0 ? (
                  <Space wrap size="middle" style={{ marginBottom: 16 }}>
                    {product.related_products.map((item) => (
                      <Card
                        key={item.id}
                        hoverable
                        style={{ width: '100%', cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${item.related_product?.id}`)}
                        cover={
                          item.related_product?.images?.[0] ? (
                            <Image
                              src={
                                item.related_product.images[0].image ||
                                item.related_product.images[0].image_url ||
                                item.related_product.images[0].url
                              }
                              alt={item.related_product.images[0].alt_text || ''}
                              style={{ objectFit: 'cover', height: 140, width: '100%' }}
                              preview={false}
                            />
                          ) : null
                        }
                      >
                        <Card.Meta
                          title={item.related_product?.nom}
                          description={`Réf: ${item.related_product?.ean_code || 'N/A'}`}
                        />
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">Aucun produit lié.</Text>
                )}
              </Col>

              <Col xs={24} md={12}>
                <Title level={5}>Documents</Title>
                {product.documents?.length > 0 ? (
                  <List
                    dataSource={product.documents}
                    renderItem={(doc) => (
                      <List.Item>
                        <a href={doc.url_document} target="_blank" rel="noopener noreferrer" >
                          {doc.type_document || 'Document'}
                        </a>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">Aucun document disponible.</Text>
                )}
              </Col>
            </Row>

            <Divider />

            <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
              Ajouter une image
            </Button>

            <Modal visible={isModalVisible} onCancel={closeModal} footer={null} destroyOnClose>
              <Upload
                accept="image/*"
                customRequest={handleUpload}
                showUploadList={false}
                multiple={false}
              >
                <Button icon={<PlusOutlined />} loading={uploading} block>
                  Cliquer pour uploader une image
                </Button>
              </Upload>
            </Modal>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ProductDetailPage;
