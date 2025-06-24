import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, deleteProduct, fetchCategories, fetchProducts, updateProduct } from '../services/productService';
const { Title } = Typography;
const { Option } = Select;

const CataloguePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger produits et catégories
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (error) {
      message.error('Erreur lors du chargement des produits');
      console.error(error);
    } finally {
      setLoading(false);
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
        // Modifier produit
        await updateProduct(editingProduct.id, {
          name: values.name,
          category: values.category,
          store_price: values.price,
          // stock doit être géré via API stock séparée (voir remarque)
        });
        message.success('Produit modifié avec succès');
      } else {
        // Créer produit
        await createProduct({
          name: values.name,
          category: values.category,
          store_price: values.price,
          // autres champs requis à compléter
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

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Catégorie', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Prix (€)', dataIndex: 'store_price', key: 'price', render: (val) => val.toFixed(2) },
    { title: 'Stock', dataIndex: ['stock', 'units'], key: 'stock', render: (val) => val || 0 },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

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
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProduct ? 'Modifier produit' : 'Ajouter produit'}
        visible={modalVisible}
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
          {/* Le stock est géré séparément, mais vous pouvez l’ajouter ici si besoin */}
        </Form>
      </Modal>
    </>
  );
};

export default CataloguePage;
