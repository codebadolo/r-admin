import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, List, Modal, Select, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const KeysPage = () => {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Poids', sectionId: 2, order: 1 },
    { id: 2, name: 'Couleur', sectionId: 1, order: 2 },
  ]);
  const [sections] = useState([
    { id: 1, name: 'Caractéristiques générales' },
    { id: 2, name: 'Dimensions' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  const showModal = (key = null) => {
    setEditingKey(key);
    form.resetFields();
    if (key) form.setFieldsValue(key);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingKey) {
        setKeys(keys.map(k => (k.id === editingKey.id ? { ...k, ...values } : k)));
      } else {
        setKeys([...keys, { id: Date.now(), ...values }]);
      }
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleDelete = id => setKeys(keys.filter(k => k.id !== id));

  return (
    <>
      <Title level={2}>Clés de Spécification</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter une clé
      </Button>
      <List
        bordered
        dataSource={keys.sort((a,b) => a.order - b.order)}
        renderItem={item => {
          const sectionName = sections.find(s => s.id === item.sectionId)?.name || 'N/A';
          return (
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => showModal(item)} />,
                <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)} />,
              ]}
            >
              {item.order}. {item.name} (Section: {sectionName})
            </List.Item>
          );
        }}
      />
      <Modal title={editingKey ? 'Modifier clé' : 'Ajouter clé'} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sectionId" label="Section" rules={[{ required: true, message: 'Veuillez choisir une section' }]}>
            <Select>
              {sections.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="order" label="Ordre" rules={[{ required: true, message: 'Veuillez saisir un ordre' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KeysPage;
