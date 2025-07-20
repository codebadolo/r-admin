// src/components/CategoryModalForm.js
import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";

const { Option } = Select;

export default function CategoryModalForm({ visible, onCancel, onSubmit, category, categories }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (category) form.setFieldsValue({
      ...category,
      parent: category.parent ? category.parent.id : undefined,
    });
    else form.resetFields();
  }, [category, form]);

  return (
    <Modal
      visible={visible}
      title={category ? "Modifier une catégorie" : "Nouvelle catégorie"}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => onSubmit(values));
      }}
      okText="Enregistrer"
      cancelText="Annuler"
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="categoryForm">
        <Form.Item
          name="name"
          label="Nom de la catégorie"
          rules={[{ required: true, message: "Merci d’entrer le nom de la catégorie" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="parent" label="Catégorie parente" >
          <Select allowClear placeholder="Aucune catégorie parente">
            {categories
              .filter((c) => !category || c.id !== category.id)
              .map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
