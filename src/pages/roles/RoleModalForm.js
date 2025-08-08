import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";

export default function RoleModalForm({ visible, onCancel, onSubmit, role }) {
  const [form] = Form.useForm();

  // Au changement du rôle à éditer, on pré-remplit le formulaire
  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name || "",
        description: role.description || "",
      });
    } else {
      form.resetFields();
    }
  }, [role, form]);

  // Soumission du formulaire
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch(() => {
        message.error("Veuillez corriger les erreurs dans le formulaire");
      });
  };

  return (
    <Modal
      visible={visible}
      title={role ? "Modifier un rôle" : "Ajouter un rôle"}
      okText={role ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="Nom"
          name="name"
          rules={[
            { required: true, message: "Veuillez saisir un nom" },
            { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
          ]}
        >
          <Input placeholder="Nom du rôle" autoFocus />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 250, message: "La description ne doit pas dépasser 250 caractères" },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Description du rôle (optionnel)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
