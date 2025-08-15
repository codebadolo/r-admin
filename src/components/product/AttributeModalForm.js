import React, { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';

const { Option } = Select;

export default function AttributeModalForm({ visible, onCancel, onSubmit, attribute, productTypes = [] }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (attribute) {
      form.setFieldsValue({
        ...attribute,
        product_type: attribute.product_type?.id || attribute.product_type || undefined,
      });
    } else {
      form.resetFields();
    }
  }, [attribute, form]);

  // Optionnel : reset le formulaire quand modal se ferme
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      visible={visible}
      title={attribute ? "Modifier un attribut" : "Nouvel attribut"}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(values => onSubmit(values));
      }}
      okText="Enregistrer"
      cancelText="Annuler"
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="attributeForm">
        <Form.Item
          name="name"
          label="Nom de l'attribut"
          rules={[{ required: true, message: "Merci d’entrer le nom" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="product_type"
          label="Type de produit"
          rules={[{ required: true, message: "Veuillez sélectionner un type" }]}
        >
          <Select placeholder="Sélectionner un type de produit" allowClear>
            {productTypes.length > 0 &&
              productTypes.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
