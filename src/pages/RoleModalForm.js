import { Form, Input, message, Modal } from "antd";
import { useEffect } from "react";

export default function RoleModalForm({ visible, onCancel, onSubmit, role }) {
  const [form] = Form.useForm();

  // Remplit le formulaire avec les données reçues (edit) ou reset en création
  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name || "",
        description: role.description || "",
      });
    } else {
      form.resetFields();
    }
  }, [role, form, visible]);

  // Soumission déclenchée par le bouton OK de la modal
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values); // appel vers parent
      form.resetFields();
    } catch (errorInfo) {
      // Validation échouée, ne ferme pas
      message.error("Veuillez vérifier les informations saisies.");
    }
  };

  // À la fermeture, on reset le formulaire et prévient le parent
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      title={role ? "Modifier le rôle" : "Créer un nouveau rôle"}
      okText={role ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical" name="roleForm" preserve={false}>
        <Form.Item
          label="Nom du rôle"
          name="name"
          rules={[
            { required: true, message: "Le nom du rôle est obligatoire" },
            { min: 2, message: "Le nom doit contenir au moins 2 caractères" },
            { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
          ]}
        >
          <Input placeholder="Entrez le nom du rôle" autoFocus />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 300, message: "La description ne doit pas dépasser 300 caractères" },
          ]}
        >
          <Input.TextArea
            placeholder="Description du rôle (optionnel)"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
