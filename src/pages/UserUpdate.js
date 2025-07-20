import {
    Button,
    Checkbox,
    Form,
    Input,
    message,
    Select,
    Space,
    Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRoles } from "../services/roleServices";
import { createUser, fetchUser, updateUser } from "../services/userServices";

const { Option } = Select;

export default function UserUpdate() {
  const { id } = useParams(); // id utilisateur ou undefined si création
  const navigate = useNavigate();
  const [form] = Form.useForm();

  //const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [userLoading, ] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger les rôles
  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await fetchRoles();
        setRoles(response);
      } catch (error) {
        message.error("Erreur lors du chargement des rôles");
      }
    }
    loadRoles();
  }, []);

  // Charger l'utilisateur à modifier
  useEffect(() => {
    if (!id) return; // Mode création

    async function loadUserData() {
      try {
        const response = await fetchUser(id);
        const user = response.data; // selon axios
        // Remplir formulaire avec user
        form.setFieldsValue({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          roles: user.roles.map(r => r.id),
          is_active: user.is_active,
          // autres champs...
        });
      } catch (err) {
        console.error("Erreur chargement utilisateur", err);
      }
    }

    loadUserData();
  }, [id])

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        is_active: values.is_active,
        roles: values.roles,
      };
      // Inclure le mot de passe uniquement s'il a été saisi
      if (values.password) {
        if (values.password !== values.passwordConfirm) {
          message.error("Les mots de passe ne correspondent pas");
          setSubmitting(false);
          return;
        }
        payload.password = values.password;
      }
      if (id) {
        await updateUser(id, payload);
        message.success("Utilisateur mis à jour avec succès");
      } else {
        if (!values.password) {
          message.error("Le mot de passe est obligatoire");
          setSubmitting(false);
          return;
        }
        await createUser(payload);
        message.success("Utilisateur créé avec succès");
      }
      navigate("/users");
    } catch {
      message.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) return <Spin tip="Chargement utilisateur..." />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ is_active: true }}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "L'email est obligatoire" },
          { type: "email", message: "Email invalide" },
        ]}
      >
        <Input disabled={!!id} />
      </Form.Item>

      {/* Mot de passe */}
      <Form.Item
        label={id ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
        name="password"
        rules={id ? [] : [{ required: true, message: "Le mot de passe est obligatoire" }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      {/* Confirmation */}
      <Form.Item
        label={id ? "Confirmer nouveau mot de passe" : "Confirmer mot de passe"}
        name="passwordConfirm"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: !!form.getFieldValue('password'), message: "Veuillez confirmer votre mot de passe" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Prénom"
        name="first_name"
        rules={[{ required: true, message: "Le prénom est obligatoire" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Nom"
        name="last_name"
        rules={[{ required: true, message: "Le nom est obligatoire" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="is_active" valuePropName="checked">
        <Checkbox>Compte actif</Checkbox>
      </Form.Item>

      <Form.Item
        label="Rôles"
        name="roles"
        rules={[{ required: true, message: "Sélectionnez au moins un rôle" }]}
      >
        <Select mode="multiple" allowClear placeholder="Sélectionnez les rôles">
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {id ? "Mettre à jour" : "Créer"}
          </Button>
          <Button onClick={() => navigate("/users")}>Annuler</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
