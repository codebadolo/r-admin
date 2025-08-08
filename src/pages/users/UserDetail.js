import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Typography,
  Spin,
  Alert,
  List,
  Button,
  Row,
  Col,
  Space,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { fetchUser } from "../../services/userServices";

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

// Helper pour valoriser les relations imbriquées (objets ou chaînes)
const formatRelation = (relation, field = "nom") => {
  if (!relation) return "-";
  if (typeof relation === "string") return relation;
  if (typeof relation === "object" && relation[field]) return relation[field];
  return "-";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const dt = new Date(dateStr);
  return !isNaN(dt.getTime()) ? dt.toLocaleString() : "-";
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(id)
      .then((res) => setUser(res.data))
      .catch((e) => setError(e.message || "Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Spin
        tip="Chargement en cours..."
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

  const hasAdresses = Array.isArray(user.adresses) && user.adresses.length > 0;
  const hasUserRoles = Array.isArray(user.user_roles) && user.user_roles.length > 0;
  const hasNumeroTVAValid =
    Array.isArray(user.numero_tva_valides) && user.numero_tva_valides.length > 0;

  return (
    <Layout
      style={{
        maxWidth: 1500,
        minHeight: "100vh",
        padding: "24px",
        background: "#fafafa",
        margin: "auto",
      }}
    >
      <Content style={{ width: 1200, margin: "auto" }}>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/users">Utilisateurs</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Utilisateur #{user.id}</Breadcrumb.Item>
        </Breadcrumb>

        <Button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          Retour à la liste
        </Button>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            {/* Informations générales */}
            <div style={sectionStyle}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Informations générales
              </Title>
              <InfoLine label="Email" value={user.email} />
              <InfoLine
                label="Type client"
                value={
                  user.type_client
                    ? user.type_client.charAt(0).toUpperCase() +
                      user.type_client.slice(1)
                    : "-"
                }
              />
              <InfoLine label="Téléphone" value={user.telephone} />
              <InfoLine label="Actif" value={user.is_active ? "Oui" : "Non"} />
              <InfoLine label="Staff" value={user.is_staff ? "Oui" : "Non"} />
              <InfoLine label="Date d'inscription" value={formatDate(user.date_joined)} />
              <InfoLine
                label="Accepte facture électronique"
                value={user.accepte_facture_electronique ? "Oui" : "Non"}
              />
              <InfoLine label="Accepte CGV" value={user.accepte_cgv ? "Oui" : "Non"} />
            </div>
          </Col>

          <Col xs={24} md={12}>
            {/* Adresses */}
            {hasAdresses && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Adresses
                </Title>
                <List
                  dataSource={user.adresses}
                  bordered={false}
                  split
                  itemLayout="vertical"
                  renderItem={(adresse) => (
                    <List.Item key={adresse.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Utilisation" value={adresse.utilisation} />
                        <InfoLine label="Type client" value={adresse.type_client} />
                        <InfoLine label="Nom complet" value={adresse.nom_complet} />
                        <InfoLine label="Téléphone" value={adresse.telephone} />
                        <InfoLine label="Raison sociale" value={adresse.raison_sociale} />
                        <InfoLine
                          label="Numéro TVA"
                          value={
                            adresse.numero_tva && typeof adresse.numero_tva === "object"
                              ? adresse.numero_tva.numero_tva
                              : adresse.numero_tva || "-"
                          }
                        />
                        <InfoLine label="RCCM" value={adresse.rccm} />
                        <InfoLine label="IFU" value={adresse.ifu} />
                        <InfoLine
                          label="Forme juridique"
                          value={formatRelation(adresse.forme_juridique)}
                        />
                        <InfoLine
                          label="Régime fiscal"
                          value={formatRelation(adresse.regime_fiscal)}
                        />
                        <InfoLine
                          label="Division fiscale"
                          value={formatRelation(adresse.division_fiscale)}
                        />
                        <InfoLine
                          label="Adresse complète"
                          value={`${adresse.numero || ""} ${adresse.rue || ""} ${
                            adresse.complement || ""
                          }, ${adresse.code_postal || ""} ${adresse.ville || ""}`}
                        />
                        <InfoLine label="Pays" value={formatRelation(adresse.pays)} />
                        <InfoLine
                          label="Livraison identique facturation"
                          value={adresse.livraison_identique_facturation ? "Oui" : "Non"}
                        />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Rôles utilisateur */}
            {hasUserRoles && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Rôles utilisateur
                </Title>
                <List
                  dataSource={user.user_roles}
                  bordered={false}
                  split
                  itemLayout="vertical"
                  renderItem={(ur) => (
                    <List.Item key={ur.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Nom" value={ur.role?.name} />
                        <InfoLine label="Description" value={ur.role?.description} />
                        <InfoLine label="Assigné le" value={formatDate(ur.assigned_at)} />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Numéros TVA valides */}
            {hasNumeroTVAValid && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Numéros TVA valides
                </Title>
                <List
                  dataSource={user.numero_tva_valides}
                  bordered={false}
                  split
                  itemLayout="vertical"
                  renderItem={(num) => (
                    <List.Item key={num.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Numéro" value={num.numero_tva} />
                        <InfoLine label="Pays" value={num.pays} />
                        <InfoLine label="Date d'ajout" value={formatDate(num.date_ajout)} />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
