import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const AttributsVariantes = ({ data = [], onChange }) => {
  const [attributes, setAttributes] = useState(data);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    onChange(attributes);
  }, [attributes, onChange]);

  const columns = [
    { title: 'Attribut', dataIndex: 'attribute', key: 'attribute' },
    { title: 'Valeur', dataIndex: 'value', key: 'value' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            const newAttrs = [...attributes];
            newAttrs.splice(index, 1);
            setAttributes(newAttrs);
          }}
        />
      ),
    },
  ];

  const onAddAttribute = (values) => {
    setAttributes([...attributes, values]);
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Title level={4}>Attributs et Variantes</Title>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Ajouter un attribut
      </Button>
      <Table
        dataSource={attributes}
        columns={columns}
        rowKey={(record, index) => index}
        pagination={false}
      />

      <Modal
        title="Ajouter un attribut"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onAddAttribute}>
          <Form.Item name="attribute" label="Nom de l'attribut" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="Valeur" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AttributsVariantes;
