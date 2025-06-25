import { Button, Form, Input, Select, Switch, Typography } from 'antd';
const { Option } = Select;
const { Title } = Typography;

const CategorySection = ({
  categories,
  value,
  onChange,
  onCreate,
  showCreate,
  setShowCreate,
  createCategoryForm,
  parentCategories
}) => (
  <>
    <Select
      placeholder="Sélectionnez une catégorie"
      value={value}
      onChange={onChange}
      allowClear
      style={{ width: '100%' }}
    >
      {categories.map((cat) => (
        <Option key={cat.id} value={cat.id}>
          {cat.name}
        </Option>
      ))}
    </Select>
    <Button type="link" onClick={() => setShowCreate(!showCreate)}>
      {showCreate ? 'Annuler création catégorie' : 'Ajouter une nouvelle catégorie'}
    </Button>
    {showCreate && (
      <Form
        form={createCategoryForm}
        layout="vertical"
        onFinish={onCreate}
        style={{ paddingLeft: 24, marginBottom: 24, borderLeft: '2px solid #eee' }}
        initialValues={{ is_active: true, parent: null }}
      >
        <Title level={5}>Créer une catégorie</Title>
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
          <Select allowClear placeholder="Sélectionnez une catégorie parente">
            {parentCategories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Créer la catégorie
          </Button>
        </Form.Item>
      </Form>
    )}
  </>
);

export default CategorySection;
