import { Checkbox, Form, Input, Select } from "antd";

const { Option } = Select;

export default function StepGeneralInfo({ options }) {
  const { categories, brands, productTypes } = options;

  return (
    <>
      <Form.Item label="Nom du produit" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item label="Catégorie" name="category" rules={[{ required: true }]}>
        <Select placeholder="Choisir une catégorie" allowClear>
          {categories.map((cat) => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Marque" name="brand" rules={[{ required: true }]}>
        <Select placeholder="Choisir une marque" allowClear>
          {brands.map((b) => <Option key={b.id} value={b.id}>{b.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Type de produit" name="product_type" rules={[{ required: true }]}>
        <Select placeholder="Choisir un type" allowClear>
          {productTypes.map((pt) => <Option key={pt.id} value={pt.id}>{pt.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Web ID" name="web_id" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="is_active" valuePropName="checked">
        <Checkbox>Actif ?</Checkbox>
      </Form.Item>
    </>
  );
}
