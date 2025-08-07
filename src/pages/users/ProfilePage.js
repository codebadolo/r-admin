import { EditOutlined, UserOutlined } from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Divider,
    Form,
    Input,
    message,
    Space,
    Spin,
    Tag,
    Typography
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [pwdEditMode, setPwdEditMode] = useState(false);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  // Récupère informations utilisateur connecté
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8000/api/users/users/me/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Mise à jour des infos de profil
  const handleUpdateProfile = async (values) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch("http://127.0.0.1:8000/api/users/users/me/", values, {
        headers: { Authorization: `Token ${token}` },
      });
      message.success("Profil mis à jour !");
      setProfile({ ...profile, ...values });
      setEditMode(false);
    } catch {
      message.error("Erreur lors de la mise à jour du profil.");
    }
  };

  // Changement du mot de passe
  const handleChangePassword = async (values) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://127.0.0.1:8000/api/users/change-password/", values, {
        headers: { Authorization: `Token ${token}` },
      });
      message.success("Mot de passe changé avec succès !");
      setPwdEditMode(false);
      pwdForm.resetFields();
    } catch {
      message.error("Erreur lors de la modification du mot de passe.");
    }
  };

  if (loading || !profile)
    return <Spin tip="Chargement du profil..." style={{ margin: "60px auto", display: "block" }} />;

  return (
    <Card
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        borderRadius: 10,
        boxShadow: "0 0 8px #e3e5e8",
      }}
      title={
        <Space>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: "#1890ff" }} />
          <span>Mon profil</span>
        </Space>
      }
      extra={
        <Button icon={<EditOutlined />} onClick={() => setEditMode((v) => !v)}>
          {editMode ? "Annuler" : "Éditer"}
        </Button>
      }
    >
      {!editMode ? (
        <>
          <Title level={4} style={{ marginTop: 0 }}>{profile.first_name} {profile.last_name}</Title>
          <Text type="secondary">{profile.email}</Text>
          <Divider />
          <p>
            <b>Date d’inscription :</b> {profile.date_joined ? new Date(profile.date_joined).toLocaleString() : "-"}
          </p>
          <p>
            <b>Statut :</b>{" "}
            <Badge color={profile.is_active ? "green" : "red"} text={profile.is_active ? "Actif" : "Inactif"} />
          </p>
          <p>
            <b>Rôles :</b>{" "}
            {profile.roles && profile.roles.length
              ? profile.roles.map((role) => (
                  <Tag color="geekblue" key={role.id}>{role.name}</Tag>
                ))
              : <Tag>Aucun rôle</Tag>}
          </p>
          <Button type="link" onClick={() => setPwdEditMode((v) => !v)}>
            {pwdEditMode ? "Annuler le changement de mot de passe" : "Changer le mot de passe"}
          </Button>
          {pwdEditMode && (
            <Form
              form={pwdForm}
              layout="vertical"
              onFinish={handleChangePassword}
              style={{ marginTop: 18 }}
            >
              <Form.Item
                label="Mot de passe actuel"
                name="old_password"
                rules={[{ required: true, message: "Champ obligatoire" }]}
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                label="Nouveau mot de passe"
                name="new_password"
                rules={[{ required: true, message: "Champ obligatoire" }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                label="Confirmer nouveau mot de passe"
                name="confirm"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Confirmer le nouveau mot de passe" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary">Changer le mot de passe</Button>
              </Form.Item>
            </Form>
          )}
        </>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
          }}
        >
          <Form.Item label="Prénom" name="first_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Nom" name="last_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[
              { required: true, message: "Merci d'indiquer un email" },
              { type: "email", message: "Email invalide" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary">Enregistrer</Button>
              <Button onClick={() => setEditMode(false)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}
