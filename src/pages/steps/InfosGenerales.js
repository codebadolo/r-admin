import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Switch, TreeSelect, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import {
  createBrand,
  createCategory,
  createProductType,
  fetchBrands,
  fetchCategories,
  fetchProductTypes,
} from '../../services/productService';

const { Option } = Select;
const { Title } = Typography;

// Utilitaire pour transformer la liste plate en arbre
function buildCategoryTree(categories) {
  const map = {};
  const roots = [];
  categories.forEach(cat => { map[cat.id] = { ...cat, children: [] }; });
  categories.forEach(cat => {
    if (cat.parent) {
      map[cat.parent]?.children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });
  return roots;
}

const InfosGenerales = ({ data, onChange }) => {
  const [form] = Form.useForm();

  // États pour les listes
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  // États pour afficher les modals
  const [modal, setModal] = useState({ category: false, brand: false, type: false });

  // Formulaires création
  const [createCategoryForm] = Form.useForm();
  const [createBrandForm] = Form.useForm();
  const [createProductTypeForm] = Form.useForm();

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  const loadOptions = async () => {
    try {
      const catRes = await fetchCategories();
      setCategories(catRes.data);
      setCategoryTree(buildCategoryTree(catRes.data));
      setBrands((await fetchBrands()).data);
      setProductTypes((await fetchProductTypes()).data);
    } catch (error) {
      message.error('Erreur chargement des options');
    }
  };

  const onValuesChange = (_, allValues) => {
    onChange(allValues);
  };

  const handleSelectChange = (field, value) => {
    form.setFieldsValue({ [field]: value });
    onChange({ ...form.getFieldsValue(), [field]: value });
  };

  // Création Catégorie (modal)
  const onCreateCategory = async (values) => {
    try {
      const res = await createCategory(values);
      setCategories(prev => [...prev, res.data]);
      setCategoryTree(buildCategoryTree([...categories, res.data]));
      form.setFieldsValue({ category: res.data.id });
      onChange({ ...form.getFieldsValue(), category: res.data.id });
      createCategoryForm.resetFields();
      setModal(m => ({ ...m, category: false }));
      message.success('Catégorie créée avec succès');
    } catch (error) {
      message.error('Erreur création catégorie');
    }
  };

  // Création Marque (modal)
  const onCreateBrand = async (values) => {
    try {
      const res = await createBrand(values);
      setBrands(prev => [...prev, res.data]);
      form.setFieldsValue({ brand: res.data.id });
      onChange({ ...form.getFieldsValue(), brand: res.data.id });
      createBrandForm.resetFields();
      setModal(m => ({ ...m, brand: false }));
      message.success('Marque créée avec succès');
    } catch (error) {
      message.error('Erreur création marque');
    }
  };

  // Création Type de Produit (modal)
  const onCreateProductType = async (values) => {
    try {
      const res = await createProductType(values);
      setProductTypes(prev => [...prev, res.data]);
      form.setFieldsValue({ productType: res.data.id });
      onChange({ ...form.getFieldsValue(), productType: res.data.id });
      createProductTypeForm.resetFields();
      setModal(m => ({ ...m, type: false }));
      message.success('Type de produit créé avec succès');
    } catch (error) {
      message.error('Erreur création type de produit');
    }
  };

  return (
    <>
      <Title level={4}>Informations générales</Title>
      <Form form={form} layout="vertical" onValuesChange={onValuesChange} initialValues={data}>
        <Form.Item name="name" label="Nom du produit" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* Catégorie (arborescence) */}
        <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
          <TreeSelect
            style={{ width: '100%' }}
            value={form.getFieldValue('category')}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={categoryTree}
            placeholder="Sélectionnez une catégorie"
            treeDefaultExpandAll
            allowClear
            fieldNames={{ label: 'name', value: 'id', children: 'children' }}
            onChange={val => handleSelectChange('category', val)}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setModal(m => ({ ...m, category: true }))}
          >
            Ajouter une catégorie
          </Button>
        </Form.Item>

        {/* Marque */}
        <Form.Item name="brand" label="Marque" rules={[{ required: true }]}>
          <Select
            placeholder="Sélectionnez une marque"
            onChange={val => handleSelectChange('brand', val)}
            allowClear
          >
            {brands.map(brand => (
              <Option key={brand.id} value={brand.id}>{brand.name}</Option>
            ))}
          </Select>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setModal(m => ({ ...m, brand: true }))}
          >
            Ajouter une marque
          </Button>
        </Form.Item>

        {/* Type de produit */}
        <Form.Item name="productType" label="Type de produit" rules={[{ required: true }]}>
          <Select
            placeholder="Sélectionnez un type de produit"
            onChange={val => handleSelectChange('productType', val)}
            allowClear
          >
            {productTypes.map(type => (
              <Option key={type.id} value={type.id}>{type.name}</Option>
            ))}
          </Select>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setModal(m => ({ ...m, type: true }))}
          >
            Ajouter un type
          </Button>
        </Form.Item>
      </Form>

      {/* Modal Catégorie */}
      <Modal
        open={modal.category}
        title="Créer une catégorie"
        onCancel={() => setModal(m => ({ ...m, category: false }))}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createCategoryForm}
          layout="vertical"
          onFinish={onCreateCategory}
          initialValues={{ is_active: true, parent: null }}
        >
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug (optionnel)">
            <Input placeholder="Laisser vide pour génération automatique" />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="parent" label="Catégorie parente">
            <TreeSelect
              treeData={categoryTree}
              placeholder="Sélectionnez une catégorie parente"
              allowClear
              treeDefaultExpandAll
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Créer la catégorie
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Marque */}
      <Modal
        open={modal.brand}
        title="Créer une marque"
        onCancel={() => setModal(m => ({ ...m, brand: false }))}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createBrandForm}
          layout="vertical"
          onFinish={onCreateBrand}
        >
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Créer la marque
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Type de produit */}
      <Modal
        open={modal.type}
        title="Créer un type de produit"
        onCancel={() => setModal(m => ({ ...m, type: false }))}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createProductTypeForm}
          layout="vertical"
          onFinish={onCreateProductType}
        >
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Créer le type
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InfosGenerales;
