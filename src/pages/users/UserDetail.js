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
  Divider,
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
  <Paragraph style={{ marginBottom: 8 }}>
    <Text strong>{label} :</Text> {value || <Text type="secondary">-</Text>}
  </Paragraph>
);

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
      <Spin tip="Chargement en cours..." style={{ display: "block", marginTop: 80, textAlign: "center" }} />
    );
  if (error)
    return <Alert type="error" message="Erreur" description={error} showIcon style={{ maxWidth: '100%', margin: "auto" }} />;
  if (!user) return null;

  const hasEntrepriseProfil = !!user.profils_entreprise && Object.keys(user.profils_entreprise).length > 0;
  const hasParticulierProfil = !!user.profils_particulier && Object.keys(user.profils_particulier).length > 0;
  const hasAdresses = user.adresses && user.adresses.length > 0;
  const hasUserRoles = user.user_roles && user.user_roles.length > 0;
  const hasNumeroTVAValid = user.numero_tva_valides && user.numero_tva_valides.length > 0;

  return (
    <Layout style={{ minHeight: "100vh", padding: "24px", background: "#fafafa" }}>
      <Content style={{ maxWidth: '100%', margin: "auto" }}>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item><Link to="/"><HomeOutlined /></Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/users">Utilisateurs</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Utilisateur #{user.id}</Breadcrumb.Item>
        </Breadcrumb>

        <Button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          Retour à la liste
        </Button>

        <Row gutter={[32, 32]}>
          {/* Colonne gauche */}
          <Col xs={24} md={12}>
            {/* Informations générales */}
            <div style={sectionStyle}>
              <Title level={4} style={{ marginBottom: 16 }}>Informations générales</Title>
              <InfoLine label="Prénom" value={user.first_name} />
              <InfoLine label="Nom" value={user.last_name} />
              <InfoLine label="Email" value={user.email} />
              <InfoLine label="Téléphone" value={user.telephone} />
              <InfoLine label="Type client" value={user.type_client?.charAt(0).toUpperCase() + user.type_client?.slice(1)} />
              <InfoLine label="Actif" value={user.is_active ? "Oui" : "Non"} />
              <InfoLine label="Staff" value={user.is_staff ? "Oui" : "Non"} />
              <InfoLine label="Date d'inscription" value={user.date_joined ? new Date(user.date_joined).toLocaleString() : null} />
            </div>

            {/* Profil entreprise */}
            {hasEntrepriseProfil && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>Profil entreprise</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <InfoLine label="Raison sociale" value={user.profils_entreprise.raison_sociale} />
                  <InfoLine label="Numéro SIRET" value={user.profils_entreprise.numero_siret} />
                  <InfoLine label="Numéro TVA" value={user.profils_entreprise.numero_tva} />
                  <InfoLine label="Adresse société" value={user.profils_entreprise.adresse_societe} />
                  <InfoLine label="Téléphone supplémentaire" value={user.profils_entreprise.telephone_suppl} />
                </Space>
              </div>
            )}

            {/* Profil particulier */}
            {hasParticulierProfil && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>Profil particulier</Title>
                <InfoLine label="Date de naissance" value={user.profils_particulier.date_naissance} />
              </div>
            )}
          </Col>

          {/* Colonne droite */}
          <Col xs={24} md={12}>
            {/* Adresses */}
            {hasAdresses && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>Adresses</Title>
                <List
                  dataSource={user.adresses}
                  bordered={false}
                  split={true}
                  itemLayout="vertical"
                  renderItem={(adresse) => (
                    <List.Item key={adresse.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Utilisation" value={adresse.utilisation} />
                        <InfoLine label="Nom complet" value={adresse.nom_complet} />
                        <InfoLine label="Téléphone" value={adresse.telephone} />
                        <InfoLine label="Raison sociale" value={adresse.raison_sociale} />
                        <InfoLine label="Numéro SIRET" value={adresse.numero_siret} />
                        <InfoLine label="Numéro TVA" value={adresse.numero_tva?.numero_tva} />
                        <InfoLine label="Adresse" value={`${adresse.numero} ${adresse.rue} ${adresse.complement || ""}, ${adresse.code_postal} ${adresse.ville}, ${adresse.pays}`} />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Rôles utilisateur */}
            {hasUserRoles && (
              <div style={sectionStyle}>
                <Title level={4} style={{ marginBottom: 16 }}>Rôles utilisateur</Title>
                <List
                  dataSource={user.user_roles}
                  bordered={false}
                  split={true}
                  itemLayout="vertical"
                  renderItem={(ur) => (
                    <List.Item key={ur.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Nom" value={ur.role?.name} />
                        <InfoLine label="Description" value={ur.role?.description} />
                        <InfoLine label="Assigné le" value={ur.assigned_at ? new Date(ur.assigned_at).toLocaleString() : null} />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Numéros TVA valides */}
            {hasNumeroTVAValid && (
              <div>
                <Title level={4} style={{ marginBottom: 16 }}>Numéros TVA valides</Title>
                <List
                  dataSource={user.numero_tva_valides}
                  bordered={false}
                  split={true}
                  itemLayout="vertical"
                  renderItem={(num) => (
                    <List.Item key={num.id}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <InfoLine label="Numéro" value={num.numero_tva} />
                        <InfoLine label="Pays" value={num.pays} />
                        <InfoLine label="Date d'ajout" value={num.date_ajout ? new Date(num.date_ajout).toLocaleString() : null} />
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
