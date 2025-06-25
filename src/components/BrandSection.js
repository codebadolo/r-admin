import { Button, Form, Input, Select, Typography } from 'antd';
const { Option } = Select;
const { Title } = Typography;

const BrandSection = ({
  brands,
  value,
  onChange,
  showCreate,
  setShowCreate,
  createBrandForm,
  onCreateBrand
}) => (
  <>
    <Select
      placeholder="Sélectionnez une marque"
      value={value}
      onChange={onChange}
      allowClear
      style={{ width: '100%' }}
    >
      {brands.map((brand) => (
        <Option key={brand.id} value={brand.id}>
          {brand.name}
        </Option>
      ))}
    </Select>
    <Button type="link" onClick={() => setShowCreate(!showCreate)}>
      {showCreate ? 'Annuler création marque' : 'Ajouter une nouvelle marque'}
    </Button>
    {showCreate && (
      <Form
        form={createBrandForm}
        layout="vertical"
        onFinish={onCreateBrand}
        style={{ paddingLeft: 24, marginBottom: 24, borderLeft: '2px solid #eee' }}
      >
        <Title level={5}>Créer une marque</Title>
        <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        {/* Ajoutez ici un champ Upload pour le logo si besoin */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Créer la marque
          </Button>
        </Form.Item>
      </Form>
    )}
  </>
);

export default BrandSection;
