import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Space, Table, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const UsersPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const data = [
    { key: '1', name: 'Jean Dupont', email: 'jean@example.com', role: 'Administrateur' },
    { key: '2', name: 'Marie Curie', email: 'marie@example.com', role: 'Vendeur' },
  ];

  const roles = ['Administrateur', 'Vendeur', 'Client'];

  const showModal = (record) => {
    setEditingUser(record || null);
    form.resetFields();
    if (record) form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        console.log('Utilisateur enregistré:', values);
        setIsModalVisible(false);
        // Ajoutez ici la logique d'enregistrement via API
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rôle', dataIndex: 'role', key: 'role' },
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
      <Title level={2}>Utilisateurs</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter un utilisateur
      </Button>
      <Table columns={columns} dataSource={data} />

      <Modal
        title={editingUser ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'Client' }}>
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { required: true, message: 'Veuillez saisir l\'email' },
            { type: 'email', message: 'Email invalide' },
          ]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Rôle" rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}>
            <Select>
              {roles.map(role => <Option key={role} value={role}>{role}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
