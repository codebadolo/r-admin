import React, { useEffect, useState, useRef } from "react";
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
  Table,

} from "antd";

import { HomeOutlined, EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import api from "../../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const sectionStyle = {
  padding: 24,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 1px 4px rgb(0 21 41 / 8%)",
  marginBottom: 24,
};

const InfoLine = ({ label, value }) => (
  <Paragraph style={{ marginBottom: 8, marginTop: 0 }}>
    <strong>{label} :</strong>{" "}
    {value !== undefined && value !== null && value !== "" ? (
      value
    ) : (
      <Text type="secondary">-</Text>
    )}
  </Paragraph>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const dt = new Date(dateStr);
  return !isNaN(dt.getTime()) ? dt.toLocaleString() : "-";
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState(null);

  // Réf pour contenu exportable PDF
  const exportRef = useRef(null);

  useEffect(() => {
    setLoadingUser(true);
    api
      .get(`/users/users/${id}/`)
      .then((res) => {
        setUser(res.data);
        setErrorUser(null);
      })
      .catch((e) => setErrorUser(e.message || "Erreur lors du chargement"))
      .finally(() => setLoadingUser(false));
  }, [id]);

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    // Capture contenu HTML en image
    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`user_${user.id}_info.pdf`);
  };

  if (loadingUser)
    return (
      <Spin
        tip="Chargement en cours..."
        style={{ display: "block", marginTop: 80, textAlign: "center" }}
      />
    );

  if (errorUser)
    return (
      <Alert
        type="error"
        message="Erreur"
        description={errorUser}
        showIcon
        style={{ maxWidth: "100%", margin: "auto" }}
      />
    );

  if (!user) return null;

  // Données existantes
  const hasAdresses = Array.isArray(user.adresses) && user.adresses.length > 0;
  const hasUserRoles = Array.isArray(user.user_roles) && user.user_roles.length > 0;

  // Colonnes tableau adresses
  const addressColumns = [
    { title: "Utilisation", dataIndex: "utilisation", key: "utilisation" },
    { title: "Type client", dataIndex: "type_client", key: "type_client" },
    { title: "Nom complet", dataIndex: "nom_complet", key: "nom_complet" },
    { title: "Téléphone", dataIndex: "telephone", key: "telephone" },
    { title: "Raison sociale", dataIndex: "raison_sociale", key: "raison_sociale" },
    {
      title: "Numéro TVA",
      dataIndex: ["numero_tva", "numero_tva"],
      key: "numero_tva",
      render: (text) => text || "-",
    },
    {
      title: "Forme juridique",
      dataIndex: ["forme_juridique", "nom"],
      key: "forme_juridique",
      render: (text) => text || "-",
    },
    {
      title: "Pays",
      dataIndex: ["pays", "nom"],
      key: "pays",
      render: (text) => text || "-",
    },
    { title: "Ville", dataIndex: "ville", key: "ville" },
    { title: "Code postal", dataIndex: "code_postal", key: "code_postal" },
  ];

  return (
    <Layout
      style={{ maxWidth: 1500, minHeight: "100vh", padding: 24, background: "#fafafa", margin: "auto" }}
    >
      <Content style={{ width: "100%", margin: "auto" }}>
        {/* Breadcrumb + boutons sur une même ligne */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/">
                  <HomeOutlined />
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to="/users">Utilisateurs</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>{user.nom_complet || user.email || "Utilisateur"}</Breadcrumb.Item>
            </Breadcrumb>
          </Col>

          <Col>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/users/edit/${user.id}`)}
              >
                Mettre à jour
              </Button>
              <Button type="default" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                Exporter en PDF
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Contenu exportable */}
        <div ref={exportRef}>
          {/* Informations générales, pleine largeur */}
          <div style={sectionStyle}>
            <Title level={4}>Informations générales</Title>
            <Row gutter={[24, 24]}>
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
              </Col>
              <Col xs={24} sm={12} md={8}>
                <InfoLine label="Actif" value={user.is_active ? "Oui" : "Non"} />
                <InfoLine label="Staff" value={user.is_staff ? "Oui" : "Non"} />
                <InfoLine label="Date d'inscription" value={formatDate(user.date_joined)} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <InfoLine
                  label="Accepte facture électronique"
                  value={user.accepte_facture_electronique ? "Oui" : "Non"}
                />
                <InfoLine label="Accepte CGV" value={user.accepte_cgv ? "Oui" : "Non"} />
              </Col>
            </Row>
          </div>

          {/* Rôles utilisateur en défilement horizontal */}
          <div
            style={{
              ...sectionStyle,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            <Title level={4}>Rôles utilisateur</Title>
            {hasUserRoles ? (
              <div style={{ display: "inline-flex", gap: 16 }}>
                {user.user_roles.map((ur) => (
                  <div
                    key={ur.id}
                    style={{
                      minWidth: 200,
                      padding: 16,
                      border: "1px solid #d9d9d9",
                      borderRadius: 8,
                      backgroundColor: "#fafafa",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      display: "inline-block",
                      verticalAlign: "top",
                    }}
                    title={ur.role?.description || ""}
                  >
                    <Text strong>{ur.role?.name || "-"}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Assigné le : {formatDate(ur.assigned_at)}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">Aucun rôle attribué</Text>
            )}
          </div>

          {/* Table des adresses */}
          <div style={sectionStyle}>
            <Title level={4}>Adresses</Title>
            {hasAdresses ? (
              <Table
                dataSource={user.adresses}
                columns={addressColumns}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Text type="secondary">Aucune adresse disponible</Text>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
