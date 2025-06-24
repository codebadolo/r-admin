import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, List, Modal, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Informatique' },
    { id: 2, name: 'Réseau' },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const showModal = (category) => {
    setEditingCategory(category || null);
    form.resetFields();
    if (category) form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        if (editingCategory) {
          setCategories(categories.map(cat => (cat.id === editingCategory.id ? { ...cat, ...values } : cat)));
        } else {
          setCategories([...categories, { id: Date.now(), ...values }]);
        }
        setIsModalVisible(false);
      });
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <>
      <Title level={2}>Catégories</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter une catégorie
      </Button>
      <List
        bordered
        dataSource={categories}
        renderItem={item => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => showModal(item)} />,
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)} />,
            ]}
          >
            {item.name}
          </List.Item>
        )}
      />
      <Modal
        title={editingCategory ? 'Modifier catégorie' : 'Ajouter catégorie'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoriesPage;
