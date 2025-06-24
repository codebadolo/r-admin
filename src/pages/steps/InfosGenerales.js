import { Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { createBrand, createCategory, createProductType, fetchBrands, fetchCategories, fetchProductTypes } from '../../services/productService';

import CreatableSelect from './CreatableSelect';


const InfosGenerales = ({ data, onChange }) => {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const catRes = await fetchCategories();
      setCategories(catRes.data);
      const brandRes = await fetchBrands();
      setBrands(brandRes.data);
      const typeRes = await fetchProductTypes();
      setProductTypes(typeRes.data);
    } catch (error) {
      console.error('Erreur chargement options', error);
    }
  };

  const onValuesChange = (_, allValues) => {
    onChange(allValues);
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={onValuesChange} initialValues={data}>
      <Form.Item name="name" label="Nom du produit" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
        <CreatableSelect
          options={categories}
          value={form.getFieldValue('category')}
          onChange={(val) => form.setFieldsValue({ category: val })}
          onCreate={async (name) => {
            const res = await createCategory({ name });
            setCategories(prev => [...prev, res.data]);
            return res.data;
          }}
          placeholder="Catégorie"
        />
      </Form.Item>

      <Form.Item name="brand" label="Marque" rules={[{ required: true }]}>
        <CreatableSelect
          options={brands}
          value={form.getFieldValue('brand')}
          onChange={(val) => form.setFieldsValue({ brand: val })}
          onCreate={async (name) => {
            const res = await createBrand({ name });
            setBrands(prev => [...prev, res.data]);
            return res.data;
          }}
          placeholder="Marque"
        />
      </Form.Item>

      <Form.Item name="productType" label="Type de produit" rules={[{ required: true }]}>
        <CreatableSelect
          options={productTypes}
          value={form.getFieldValue('productType')}
          onChange={(val) => form.setFieldsValue({ productType: val })}
          onCreate={async (name) => {
            const res = await createProductType({ name });
            setProductTypes(prev => [...prev, res.data]);
            return res.data;
          }}
          placeholder="Type de produit"
        />
      </Form.Item>
    </Form>
  );
};

export default InfosGenerales;
