import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, InputNumber, Modal, Select, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

function cartesianProduct(arr) {
  return arr.reduce((a, b) =>
    a.flatMap(d => b.map(e => [].concat(d, e)))
  );
}

const GestionVariantes = ({ attributs = [], data = [], imagesMedias = [], onChange }) => {
  const [variants, setVariants] = useState(data);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Génération automatique des variantes à partir des attributs
    const attrMap = {};
    attributs.forEach(({ attribute, value }) => {
      if (!attrMap[attribute]) attrMap[attribute] = [];
      if (!attrMap[attribute].includes(value)) attrMap[attribute].push(value);
    });
    const attrArrays = Object.entries(attrMap).map(([key, values]) =>
      values.map(val => ({ [key]: val }))
    );
    const combos = attrArrays.length ? cartesianProduct(attrArrays) : [];
    const rows = combos.map(comboArr => {
      const combo = Object.assign({}, ...comboArr);
      const key = Object.values(combo).join('-');
      const existing = data.find(v => v.key === key);
      return existing || {
        key,
        attributes: combo,
        sku: '',
        upc: '',
        retail_price: 0,
        store_price: 0,
        stock_units: 0,
        is_digital: false,
        weight: 0,
        mediaIds: [], // <--- Ajout pour lier les images
      };
    });
    setVariants(rows);
    onChange(rows);
    // eslint-disable-next-line
  }, [attributs]);

  // Action : supprimer une variante
  const handleDelete = (record) => {
    const newVariants = variants.filter(v => v.key !== record.key);
    setVariants(newVariants);
    onChange(newVariants);
  };

  // Action : modifier un champ
  const handleChange = (value, record, field) => {
    const newVariants = variants.map(v =>
      v.key === record.key ? { ...v, [field]: value } : v
    );
    setVariants(newVariants);
    onChange(newVariants);
  };

  // Action : ajouter une variante manuelle
  const handleAddVariant = (values) => {
    const key = Object.values(values.attributes).join('-') + '-' + Date.now();
    const newVariant = {
      ...values,
      key,
      mediaIds: [],
    };
    const newVariants = [...variants, newVariant];
    setVariants(newVariants);
    onChange(newVariants);
    setAddModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Attributs',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attrs) =>
        Object.entries(attrs).map(([k, v]) => (
          <span key={k}>
            <b>{k}:</b> {v}{' '}
          </span>
        )),
    },
    { title: 'SKU', dataIndex: 'sku', render: (_, r) => <Input value={r.sku} onChange={e => handleChange(e.target.value, r, 'sku')} /> },
    { title: 'Prix détail', dataIndex: 'retail_price', render: (_, r) => <InputNumber min={0} value={r.retail_price} onChange={v => handleChange(v, r, 'retail_price')} /> },
    { title: 'Stock', dataIndex: 'stock_units', render: (_, r) => <InputNumber min={0} value={r.stock_units} onChange={v => handleChange(v, r, 'stock_units')} /> },
    // Colonne pour lier les images
    {
      title: 'Photos',
      dataIndex: 'mediaIds',
      render: (mediaIds, record) => (
        <Select
          mode="multiple"
          allowClear
          style={{ minWidth: 120 }}
          placeholder="Associer des images"
          value={mediaIds}
          onChange={val => handleChange(val, record, 'mediaIds')}
          optionLabelProp="label"
        >
          {imagesMedias.map(img => (
            <Option key={img.uid || img.id} value={img.uid || img.id} label={img.name || img.url}>
              <Space>
                <Image src={img.url || img.thumbUrl} width={32} height={32} preview={false} />
                {img.name || img.url}
              </Space>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
      ),
    },
  ];

  // Génère dynamiquement les champs d'attributs pour le modal d'ajout
  const attributeFields = Array.from(new Set(attributs.map(a => a.attribute)));

  return (
    <>
      <Title level={4}>Définir les variantes (SKU)</Title>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => setAddModalOpen(true)}
      >
        Ajouter une variante manuellement
      </Button>
      <Table columns={columns} dataSource={variants} pagination={false} rowKey="key" />

      <Modal
        open={addModalOpen}
        title="Ajouter une variante"
        onCancel={() => setAddModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddVariant}>
          <Form.Item label="Attributs" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              {attributeFields.map(attr => (
                <Form.Item
                  key={attr}
                  name={['attributes', attr]}
                  label={attr}
                  rules={[{ required: true, message: `Veuillez saisir une valeur pour ${attr}` }]}
                >
                  <Input />
                </Form.Item>
              ))}
            </Space>
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="retail_price" label="Prix détail">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_units" label="Stock">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GestionVariantes;
