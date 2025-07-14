import { Button, Form, Input, Modal, Select, Space, Table, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  createProductAttribute,
  createProductType,
  createProductTypeAttribute,
  fetchProductTypeAttributes,
  fetchProductTypes,
} from '../../services/productService';

const { Option } = Select;
const { Title } = Typography;

const AttributsVariantes = ({ data = {}, onChange }) => {
  // Forms
  const [typeForm] = Form.useForm();
  const [attrForm] = Form.useForm();
  const [createAttrForm] = Form.useForm();
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const [createAttrOpen, setCreateAttrOpen] = useState(false);

  // State
  const [productTypes, setProductTypes] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState(data.attributs || []);
  const [productTypeId, setProductTypeId] = useState(data.productTypeId || null);

  // Charger tous les types au montage
  useEffect(() => {
    fetchProductTypes().then(res => setProductTypes(res.data));
  }, []);

  // Charger les attributs liés au type sélectionné
  useEffect(() => {
    if (productTypeId) {
      fetchProductTypeAttributes(productTypeId)
        .then(res => setAttributes(res.data))
        .catch(() => setAttributes([]));
    }
  }, [productTypeId]);

  // Gérer la sélection du type
  const handleTypeChange = (val) => {
    setProductTypeId(val);
    setSelectedAttributes([]);
    onChange({ ...data, productTypeId: val, attributs: [] });
  };

  // Ajout d'un attribut à la liste
  const handleAdd = (values) => {
    const attr = attributes.find(a => a.id === values.attribute);
    if (!attr) {
      message.error("Attribut introuvable.");
      return;
    }
    const newEntry = {
      attributeId: attr.id,
      attribute: attr.name, // Toujours le nom pour l'affichage
      values: values.values,
    };
    const newList = [...selectedAttributes, newEntry];
    setSelectedAttributes(newList);
    onChange({ ...data, productTypeId, attributs: newList });
    attrForm.resetFields();
  };

  // Création dynamique d'un type de produit
  const handleCreateType = async (values) => {
    try {
      const res = await createProductType(values);
      setProductTypes(prev => [...prev, res.data]);
      setProductTypeId(res.data.id);
      setCreateTypeOpen(false);
      typeForm.resetFields();
      message.success('Type de produit créé !');
    } catch (error) {
      message.error("Erreur lors de la création du type.");
    }
  };

  // Création dynamique d'un attribut et liaison avec le type
  const handleCreateAttribute = async (values) => {
    try {
      const res = await createProductAttribute({ name: values.name });
      await createProductTypeAttribute({
        product_type: productTypeId,
        product_attribute: res.data.id,
      });
      // Recharge la liste des attributs
      const attrRes = await fetchProductTypeAttributes(productTypeId);
      setAttributes(attrRes.data);
      setCreateAttrOpen(false);
      createAttrForm.resetFields();
      message.success('Nouvel attribut créé et lié au type !');
    } catch (error) {
      message.error("Erreur lors de la création ou de la liaison de l'attribut.");
    }
  };

  const columns = [
    { title: 'Attribut', dataIndex: 'attribute', key: 'attribute' },
    { title: 'Valeurs', dataIndex: 'values', key: 'values', render: (vals) => vals.join(', ') },
  ];

  return (
    <>
      <Title level={5}>Type de produit</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ minWidth: 220 }}
          placeholder="Sélectionnez un type de produit"
          value={productTypeId}
          onChange={handleTypeChange}
          allowClear
        >
          {productTypes.map((type) => (
            <Option key={type.id} value={type.id}>{type.name}</Option>
          ))}
        </Select>
        <Button type="link" onClick={() => setCreateTypeOpen(true)}>
          + Ajouter un type
        </Button>
      </Space>

      <Modal
        open={createTypeOpen}
        title="Créer un type de produit"
        onCancel={() => setCreateTypeOpen(false)}
        onOk={() => typeForm.submit()}
        destroyOnClose
      >
        <Form form={typeForm} layout="vertical" onFinish={handleCreateType}>
          <Form.Item name="name" label="Nom du type" rules={[{ required: true }]}>
            <Input placeholder="Ex : Smartphone" />
          </Form.Item>
        </Form>
      </Modal>

      {productTypeId && (
        <>
          <Title level={5}>Attributs pour ce type</Title>
          <Button type="dashed" onClick={() => setCreateAttrOpen(true)} style={{ marginBottom: 16 }}>
            Ajouter un nouvel attribut
          </Button>
          <Table
            columns={columns}
            dataSource={selectedAttributes.map((a, i) => ({ ...a, key: i }))}
            pagination={false}
            size="small"
          />

          {/* Création d'attribut */}
          <Modal
            open={createAttrOpen}
            title="Créer un nouvel attribut"
            onCancel={() => setCreateAttrOpen(false)}
            onOk={() => createAttrForm.submit()}
            destroyOnClose
          >
            <Form form={createAttrForm} layout="vertical" onFinish={handleCreateAttribute}>
              <Form.Item name="name" label="Nom de l'attribut" rules={[{ required: true }]}>
                <Input placeholder="Ex : Couleur" />
              </Form.Item>
            </Form>
          </Modal>

          {/* Ajout d'un attribut à la liste */}
          <Form form={attrForm} layout="inline" onFinish={handleAdd} style={{ marginTop: 16 }}>
            <Form.Item name="attribute" label="Attribut" rules={[{ required: true }]}>
              <Select placeholder="Choisir un attribut" style={{ minWidth: 160 }}>
                {attributes.map(attr => (
                  <Option key={attr.id} value={attr.id}>{attr.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="values" label="Valeurs" rules={[{ required: true }]}>
              <Input
                placeholder="Ex : Noir, Bleu, Rouge"
                onBlur={e => {
                  const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                  attrForm.setFieldsValue({ values });
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Ajouter l'attribut
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
};

export default AttributsVariantes;
