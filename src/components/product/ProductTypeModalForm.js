// src/components/ProductTypeModalForm.js
import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

export default function ProductTypeModalForm({ visible, onCancel, onSubmit, type }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type) form.setFieldsValue(type);
    else form.resetFields();
  }, [type, form]);

  return (
    <Modal
      visible={visible}
      title={type ? "Modifier un type" : "Nouveau type"}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => onSubmit(values));
      }}
      okText="Enregistrer"
      cancelText="Annuler"
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="typeForm">
        <Form.Item
          name="name"
          label="Nom du type"
          rules={[{ required: true, message: "Merci d’entrer le nom du type" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
