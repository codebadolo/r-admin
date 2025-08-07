import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

export default function BrandModalForm({ visible, onCancel, onSubmit, brand }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (brand) form.setFieldsValue(brand);
    else form.resetFields();
  }, [brand, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      visible={visible}
      title={brand ? "Modifier une marque" : "Nouvelle marque"}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Enregistrer"
      cancelText="Annuler"
    >
      <Form form={form} layout="vertical" name="brandForm">
        <Form.Item
          name="name"
          label="Nom de la marque"
          rules={[{ required: true, message: "Veuillez entrer le nom" }]}
        >
          <Input />
        </Form.Item>
        {/* Vous pouvez ajouter d'autres champs, ex : logo */}
      </Form>
    </Modal>
  );
}
