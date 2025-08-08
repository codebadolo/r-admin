import React, { useEffect, useState } from "react";
import { Typography, Spin, Alert, Layout, Row, Col, Space, Button, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../services/userServices";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const sectionStyle = {
  paddingBottom: 24,
  borderBottom: "1px solid #ddd",
  marginBottom: 24,
};

const InfoLine = ({ label, value }) => (
  <Paragraph style={{ marginBottom: 8, marginTop: 0 }}>
    <Text strong>{label} :</Text>{" "}
    {value !== undefined && value !== null && value !== "" ? (
      value
    ) : (
      <Text type="secondary">-</Text>
    )}
  </Paragraph>
);

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const dt = new Date(dateStr);
  return isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchCurrentUser()
      .then((res) => setUser(res.data))
      .catch((e) => setError(e.message || "Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Spin
        tip="Chargement du profil..."
        style={{ display: "block", marginTop: 80, textAlign: "center" }}
      />
    );

  if (error)
    return (
      <Alert
        type="error"
        message="Erreur"
        description={error}
        showIcon
        style={{ maxWidth: "100%", margin: "auto" }}
      />
    );

  if (!user) return null;

  return (
    <Layout style={{ minHeight: "100vh", padding: 24, background: "#fafafa" }}>
      <Content style={{ width: 1500, margin: "auto", background: "#fff", padding: 24 }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Profil</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2}>Mon profil</Title>

        <Row justify="space-between" style={{ marginBottom: 24 }}>
          <Col>
            {/* Vous pouvez ajouter ici un résumé ou titre, si besoin */}
          </Col>
          <Col>
            <Space>
              {/* Bouton Modifier profil */}
              <Button type="primary" onClick={() => navigate("/profile/edit")}>
                Modifier profil
              </Button>

              {/* Bouton Changer mot de passe */}
              <Button onClick={() => navigate("/profile/change-password")}>
                Changer mot de passe
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[32, 32]}>
          <Col span={24}>
            <div style={sectionStyle}>
              <Title level={4}>Informations générales</Title>
              <InfoLine label="Email" value={user.email} />
              <InfoLine
                label="Type client"
                value={
                  user.type_client
                    ? user.type_client.charAt(0).toUpperCase() + user.type_client.slice(1)
                    : "-"
                }
              />
              <InfoLine label="Téléphone" value={user.telephone} />
              <InfoLine label="Actif" value={user.is_active ? "Oui" : "Non"} />
              <InfoLine label="Staff" value={user.is_staff ? "Oui" : "Non"} />
              <InfoLine label="Date d'inscription" value={formatDateTime(user.date_joined)} />
              <InfoLine
                label="Accepte facture électronique"
                value={user.accepte_facture_electronique ? "Oui" : "Non"}
              />
              <InfoLine label="Accepte CGV" value={user.accepte_cgv ? "Oui" : "Non"} />
            </div>
          </Col>

          {Array.isArray(user.adresses) && user.adresses.length > 0 && (
            <Col span={24}>
              <div style={sectionStyle}>
                <Title level={4}>Adresses</Title>
                {user.adresses.map((adresse) => (
                  <div
                    key={adresse.id}
                    style={{ border: "1px solid #ddd", padding: 16, marginBottom: 16 }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <InfoLine label="Utilisation" value={adresse.utilisation} />
                      <InfoLine label="Type client" value={adresse.type_client} />
                      <InfoLine label="Nom complet" value={adresse.nom_complet} />
                      <InfoLine label="Téléphone" value={adresse.telephone} />
                      <InfoLine label="Raison sociale" value={adresse.raison_sociale} />
                      {/* Vous pouvez ajouter d’autres champs ici */}
                    </Space>
                  </div>
                ))}
              </div>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
}
