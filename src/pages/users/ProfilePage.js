import React, { useEffect, useState } from "react";
import {
  Typography,
  Spin,
  Alert,
  Layout,
  Row,
  Col,
  Space,
  Button,
  Breadcrumb,
  Tooltip,
  Table,
  Tag,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../services/userServices";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const sectionStyle = {
  padding: 24,
  borderRadius: 8,
  background: "#fff",
  boxShadow: "0 1px 4px rgb(0 21 41 / 8%)",
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

  // Préparer les colonnes pour le tableau des adresses pour une meilleure disposition
  const addressColumns = [
    {
      title: "Utilisation",
      dataIndex: "utilisation",
      key: "utilisation",
      width: 120,
      render: (text) => text?.charAt(0).toUpperCase() + text?.slice(1) || "-",
    },
    {
      title: "Type client",
      dataIndex: "type_client",
      key: "type_client",
      width: 130,
      render: (text) => text?.charAt(0).toUpperCase() + text?.slice(1) || "-",
    },
    { title: "Nom complet", dataIndex: "nom_complet", key: "nom_complet", width: 180 },
    { title: "Téléphone", dataIndex: "telephone", key: "telephone", width: 150 },
    { title: "Raison sociale", dataIndex: "raison_sociale", key: "raison_sociale", width: 180 },
    {
      title: "Numéro TVA",
      dataIndex: ["numero_tva", "numero_tva"],
      key: "numero_tva",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Pays",
      dataIndex: ["pays", "nom"],
      key: "pays",
      width: 120,
      render: (text) => text || "-",
    },
    { title: "Ville", dataIndex: "ville", key: "ville", width: 130 },
    { title: "Code Postal", dataIndex: "code_postal", key: "code_postal", width: 110 },
    { title: "Rue", dataIndex: "rue", key: "rue", width: 200 },
  ];

  // Gestion des rôles, tenter différentes clés possibles
  let roles = [];
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    roles = user.roles;
  } else if (Array.isArray(user.user_roles) && user.user_roles.length > 0) {
    roles = user.user_roles.map((ur) => ur.role).filter(Boolean);
  } else if (Array.isArray(user.roles_detail) && user.roles_detail.length > 0) {
    roles = user.roles_detail;
  }

  return (
    <Layout style={{ minHeight: "100vh", padding: 24, background: "#fafafa" }}>
      <Content style={{ width: "90%", maxWidth: 1200, margin: "auto" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Profil</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} style={{ marginBottom: 24 }}>
          Mon profil
        </Title>

        {/* Boutons Modification */}
        <Row justify="end" style={{ marginBottom: 32 }}>
          <Space>
            <Button type="primary" onClick={() => navigate("/profile/edit")}>
              Modifier profil
            </Button>
            <Button onClick={() => navigate("/profile/change-password")}>Changer mot de passe</Button>
          </Space>
        </Row>

        {/* Informations générales */}
        <div style={sectionStyle}>
          <Title level={4}>Informations générales</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
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
            </Col>
            <Col xs={24} sm={12} md={8}>
              <InfoLine label="Date d'inscription" value={formatDateTime(user.date_joined)} />
              <InfoLine
                label="Accepte facture électronique"
                value={user.accepte_facture_electronique ? "Oui" : "Non"}
              />
              <InfoLine label="Accepte CGV" value={user.accepte_cgv ? "Oui" : "Non"} />
            </Col>
            <Col xs={24} sm={24} md={8}>
              {/* Affichage des numéros TVA valides */}
              <Title level={5}>Numéros TVA valides</Title>
              {Array.isArray(user.numero_tva_valides) && user.numero_tva_valides.length > 0 ? (
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  {user.numero_tva_valides.map((num) => (
                    <Tag key={num.id} color="blue" style={{ fontSize: 14 }}>
                      {num.numero_tva} ({num.pays})
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Aucun numéro TVA valide</Text>
              )}
            </Col>
          </Row>
        </div>

        {/* Rôles */}
        <div style={sectionStyle}>
          <Title level={4}>Rôles utilisateur</Title>
          {roles.length > 0 ? (
            <Space wrap size="middle" style={{ minHeight: 50 }}>
              {roles.map((r) => (
                <Tooltip key={r.id} title={r.description || ""}>
                  <Tag color="purple" style={{ fontSize: 14 }}>
                    {r.name}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Aucun rôle attribué</Text>
          )}
        </div>

        {/* Adresses */}
        {Array.isArray(user.adresses) && user.adresses.length > 0 && (
          <div style={sectionStyle}>
            <Title level={4}>Adresses</Title>
            <Table
              dataSource={user.adresses}
              columns={addressColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: "max-content" }}
              size="middle"
            />
          </div>
        )}
      </Content>
    </Layout>
  );
}
