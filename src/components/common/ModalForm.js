import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useFormik } from 'formik';

const { Option } = Select;

const ModalForm = ({ visible, onCancel, onSubmit, initialValues, categories }) => {
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      onSubmit(values);
    },
    validationSchema: require('../utils/validationSchemas').productSchema,
  });

  return (
    <Modal
      visible={visible}
      title="Formulaire Produit"
      okText="Enregistrer"
      cancelText="Annuler"
      onCancel={onCancel}
      onOk={formik.handleSubmit}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label="Nom" validateStatus={formik.errors.name && 'error'} help={formik.errors.name}>
          <Input name="name" value={formik.values.name} onChange={formik.handleChange} />
        </Form.Item>
        <Form.Item label="Catégorie" validateStatus={formik.errors.category && 'error'} help={formik.errors.category}>
          <Select name="category" value={formik.values.category} onChange={(value) => formik.setFieldValue('category', value)}>
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Prix (€)" validateStatus={formik.errors.price && 'error'} help={formik.errors.price}>
          <InputNumber
            name="price"
            min={0}
            value={formik.values.price}
            onChange={(value) => formik.setFieldValue('price', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Stock" validateStatus={formik.errors.stock && 'error'} help={formik.errors.stock}>
          <InputNumber
            name="stock"
            min={0}
            value={formik.values.stock}
            onChange={(value) => formik.setFieldValue('stock', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalForm;
