import { Form, Input, Modal, Select, message } from "antd";
import { useEffect } from "react";

const { Option } = Select;

export default function UserModalForm({ visible, onCancel, onSubmit, user, productTypes, roles }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      // Chargement des valeurs existantes pour modification
      form.setFieldsValue({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_ids: user.roles?.map(r => r.id) || [],
      });
    } else {
      // Reset pour création
      form.resetFields();
    }
  }, [user, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        // Validez mot de passe si en création ou modif et rempli
        if (!user && !values.password) {
          message.error("Le mot de passe est obligatoire pour un nouvel utilisateur");
          return;
        }
        onSubmit(values);
      })
      .catch(info => {
        // Erreurs de validation
      });
  };

  return (
    <Modal
      visible={visible}
      title={user ? "Modifier utilisateur" : "Ajouter utilisateur"}
      okText="Enregistrer"
      cancelText="Annuler"
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="user_form">
        <Form.Item
          label="Adresse Email"
          name="email"
          rules={[
            { required: true, message: "Veuillez saisir un email valide" },
            { type: "email", message: "L'email n'est pas valide" },
          ]}
        >
          <Input disabled={!!user /* pas modifiable si existant */} />
        </Form.Item>

        <Form.Item
          label="Prénom"
          name="first_name"
          rules={[{ required: true, message: "Veuillez saisir le prénom" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nom"
          name="last_name"
          rules={[{ required: true, message: "Veuillez saisir le nom" }]}
        >
          <Input />
        </Form.Item>

        {!user && (
          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[{ required: true, message: "Veuillez saisir un mot de passe" }]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          label="Rôles"
          name="role_ids"
          rules={[{ required: true, message: "Veuillez sélectionner au moins un rôle" }]}
        >
          <Select
            mode="multiple"
            placeholder="Sélectionnez les rôles"
            optionFilterProp="children"
            allowClear
            showSearch
          >
            {roles && roles.map(role => (
              <Option key={role.id} value={role.id}>{role.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
