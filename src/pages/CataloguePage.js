import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
} from '../services/productService';

const { Title } = Typography;
const { Option } = Select;

const CataloguePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Charger produits et catégories
  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (error) {
      message.error('Erreur lors du chargement des produits');
      console.error(error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data);
    } catch (error) {
      message.error('Erreur lors du chargement des catégories');
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const showModal = (record = null) => {
    setEditingProduct(record);
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        name: record.name,
        category: record.category?.id || null,
        price: record.store_price || 0,
        stock: record.stock?.units || 0,
      });
    }
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: values.name,
          category: values.category,
          store_price: values.price,
        });
        message.success('Produit modifié avec succès');
      } else {
        await createProduct({
          name: values.name,
          category: values.category,
          store_price: values.price,
        });
        message.success('Produit créé avec succès');
      }

      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Erreur lors de la sauvegarde du produit');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Voulez-vous vraiment supprimer ce produit ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success('Produit supprimé');
          loadProducts();
        } catch (error) {
          message.error('Erreur lors de la suppression');
          console.error(error);
        }
      },
    });
  };

  return (
    <>
      <Title level={2}>Catalogue Produits</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate('/products/create')}
      >
        Ajouter un produit
      </Button>
      <Row gutter={[24, 24]}>
        {products.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              cover={
                product.image ? (
                  <img
                    alt={product.name}
                    src={product.image}
                    style={{
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      height: 180,
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    height: 180,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bbb',
                    fontSize: 48
                  }}>
                    <span>{product.name[0]}</span>
                  </div>
                )
              }
              actions={[
                <EyeOutlined
                  key="view"
                  onClick={() => navigate(`/products/${product.id}`)}
                  title="Voir la fiche"
                />,
                <EditOutlined key="edit" onClick={() => showModal(product)} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(product.id)} style={{ color: 'red' }} />
              ]}
              title={
                <Space>
                  <span>{product.name}</span>
                  {product.category?.name && <Tag color="blue">{product.category.name}</Tag>}
                </Space>
              }
            >
              <div style={{ marginBottom: 8 }}>
                <b>Prix :</b> <span style={{ color: '#52c41a' }}>{product.store_price?.toFixed(2)} €</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Stock :</b> <span style={{ color: product.stock?.units > 0 ? '#1890ff' : '#f5222d' }}>
                  {product.stock?.units ?? 0}
                </span>
              </div>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                {product.description?.slice(0, 70) || ''}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingProduct ? 'Modifier produit' : 'Ajouter produit'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ price: 0, stock: 0 }}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Catégorie" rules={[{ required: true, message: 'Veuillez choisir une catégorie' }]}>
            <Select placeholder="Sélectionnez une catégorie">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Prix (€)" rules={[{ required: true, message: 'Veuillez saisir le prix' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CataloguePage;
