import React, { useState } from "react";
import { Layout, Typography, Form, Input, Button, message, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../services/userServices"; // À créer dans userServices.js

const { Title } = Typography;
const { Content } = Layout;

export default function ChangePasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword(values);
      message.success("Mot de passe changé avec succès");
      navigate("/profile");
    } catch (err) {
      if (err.response?.data) {
        message.error(JSON.stringify(err.response.data));
      } else {
        message.error("Erreur lors du changement de mot de passe");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <Content style={{ maxWidth: 600, margin: "auto" }}>
        <Title level={2}>Changer le mot de passe</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ancien mot de passe"
            name="old_password"
            rules={[{ required: true, message: "Veuillez saisir l'ancien mot de passe" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Nouveau mot de passe"
            name="new_password"
            rules={[{ required: true, message: "Veuillez saisir le nouveau mot de passe" }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirmer le nouveau mot de passe"
            name="confirm_password"
            dependencies={["new_password"]}
            hasFeedback
            rules={[
              { required: true, message: "Veuillez confirmer le nouveau mot de passe" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Les mots de passe ne correspondent pas");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Changer le mot de passe
              </Button>
              <Button onClick={() => navigate("/profile")}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
