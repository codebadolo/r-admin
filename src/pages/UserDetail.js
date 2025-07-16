import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchRoles,
  fetchUser,
  updateUser,
  updateUserPassword,
} from "../services/userServices";

const { Option } = Select;

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Charger user et roles à l'ouverture ou changement de ID
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [resUser, resRoles] = await Promise.all([fetchUser(id), fetchRoles()]);
        setUser(resUser.data);
        setRoles(resRoles.data);
      } catch {
        message.error("Erreur lors du chargement des données utilisateur.");
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  // Ouvre modal et préremplit le formulaire avec user courant
const openEditModal = () => {
  if (!user) return;
  form.setFieldsValue({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    roles: user.roles?.map(r => r.id) || [],
    is_active: user.is_active ?? true,
  });
  passwordForm.resetFields();
  setModalVisible(true);
}


  // Met à jour les infos utilisateur
  const onUpdateUser = async (values) => {
    setUpdating(true);
    try {
      await updateUser(id, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        roles: values.roles,
        is_active: values.is_active,
      });
      message.success("Utilisateur mis à jour");
      setModalVisible(false);
      const resUser = await fetchUser(id);
      setUser(resUser.data);
    } catch {
      message.error("Erreur lors de la mise à jour");
    }
    setUpdating(false);
  };

  // Met à jour le mot de passe
  const onUpdatePassword = async (values) => {
    if (values.password !== values.password_confirm) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    setUpdating(true);
    try {
      await updateUserPassword(id, {
        password: values.password,
        password_confirm: values.password_confirm,
      });
      message.success("Mot de passe mis à jour");
      passwordForm.resetFields();
    } catch {
      message.error("Erreur lors de la mise à jour du mot de passe");
    }
    setUpdating(false);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        Utilisateur non trouvé.
        <br />
        <Button onClick={() => navigate(-1)} style={{ marginTop: 10 }}>
          Retour
        </Button>
      </div>
    );

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Space>

      <Card
        title={`Utilisateur : ${user.first_name} ${user.last_name}`}
        extra={
          <Button icon={<EditOutlined />} onClick={openEditModal}>
            Modifier
          </Button>
        }
        style={{ maxWidth: 700, margin: "0 auto" }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Prénom">{user.first_name}</Descriptions.Item>
          <Descriptions.Item label="Nom">{user.last_name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Actif">
            {user.is_active ? "Oui" : "Non"}
          </Descriptions.Item>
          <Descriptions.Item label="Rôles">
            {user.roles && user.roles.length > 0
              ? user.roles.map((r) => r.name).join(", ")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Date d'inscription">
            {new Date(user.date_joined).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title={`Modifier ${user.first_name} ${user.last_name}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onUpdateUser} preserve={false}>
          <Form.Item
            label="Prénom"
            name="first_name"
            rules={[{ required: true, message: "Prénom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Nom"
            name="last_name"
            rules={[{ required: true, message: "Nom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email requis" },
              { type: "email", message: "Email invalide" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Rôles"
            name="roles"
            rules={[{ required: true, message: "Rôle requis" }]}
          >
            <Select mode="multiple" placeholder="Sélectionnez les rôles" allowClear>
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="is_active"
            valuePropName="checked"
            label="Actif"
            initialValue={user.is_active}
          >
            <Checkbox>Activer l'utilisateur</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary" loading={updating}>
                Enregistrer
              </Button>
              <Button onClick={() => setModalVisible(false)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <Form form={passwordForm} layout="vertical" onFinish={onUpdatePassword} preserve={false}>
          <Form.Item
            label="Nouveau mot de passe"
            name="password"
            rules={[{ required: true, message: "Mot de passe requis" }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirmer mot de passe"
            name="password_confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="danger" htmlType="submit" loading={updating}>
              Modifier le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
