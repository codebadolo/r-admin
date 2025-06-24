import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const ProductsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form] = Form.useForm();

  const data = [
    { key: '1', name: 'Ordinateur Portable', category: 'Informatique', price: 1200, stock: 15 },
    { key: '2', name: 'Switch Réseau', category: 'Réseau', price: 250, stock: 30 },
  ];

  const categories = ['Informatique', 'Réseau', 'Accessoires'];

  const showModal = (record) => {
    setEditingProduct(record || null);
    form.resetFields();
    if (record) {
      form.setFieldsValue(record);
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        console.log('Produit enregistré:', values);
        setIsModalVisible(false);
        // Ici vous pouvez ajouter la logique pour enregistrer/modifier le produit via API
      })
      .catch(info => {
        console.log('Validation échouée:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'Nom du produit', dataIndex: 'name', key: 'name' },
    { title: 'Catégorie', dataIndex: 'category', key: 'category' },
    { title: 'Prix (€)', dataIndex: 'price', key: 'price' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Produits</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter un produit
      </Button>
      <Table columns={columns} dataSource={data} />

      <Modal
        title={editingProduct ? 'Modifier produit' : 'Ajouter produit'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ price: 0, stock: 0 }}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Catégorie" rules={[{ required: true, message: 'Veuillez choisir une catégorie' }]}>
            <Select>
              {categories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Prix (€)" rules={[{ required: true, message: 'Veuillez saisir le prix' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true, message: 'Veuillez saisir le stock' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductsPage;
