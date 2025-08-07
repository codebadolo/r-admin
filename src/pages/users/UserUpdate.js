import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Typography,
  Form,
  Input,
  Checkbox,
  Button,
  Spin,
  Alert,
  Row,
  Col,
  Space,
  Select,
  Tooltip,
  message,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { fetchUser, updateUser, fetchRoles } from "../../services/userServices";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const sectionStyle = {
  paddingBottom: 24,
  borderBottom: "1px solid #ddd",
  marginBottom: 24,
};

const InfoLine = ({ label, children }) => (
  <Form.Item label={label} style={{ marginBottom: 16 }}>
    {children}
  </Form.Item>
);

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [initialEmail, setInitialEmail] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Charger la liste complète des rôles (ex: GET /api/roles/)
        const rolesResponse = await fetchRoles();
        setAllRoles(rolesResponse.data || []);

        // Charger utilisateur
        const userResponse = await fetchUser(id);
        const data = userResponse.data || {};

        // Extraire les IDs des rôles attribués à l'utilisateur
        const userRoleIds = (data.user_roles || [])
          .map((ur) => ur.role?.id)
          .filter(Boolean);

        setInitialEmail(data.email);

        // Pré-remplir le formulaire
        form.setFieldsValue({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          type_client: data.type_client,
          telephone: data.telephone,
          accepte_facture_electronique: data.accepte_facture_electronique,
          accepte_cgv: data.accepte_cgv,
          profils_entreprise: data.profils_entreprise || {},
          profils_particulier: data.profils_particulier || {},
          password: "",
          roles: userRoleIds, // ids des rôles sélectionnés
        });
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de l'utilisateur");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, form]);

  const onFinish = async (values) => {
    setSaving(true);
    setError(null);

    try {
      // Le backend veut obligatoirement l'email même s'il est disabled dans le formulaire
      values.email = initialEmail;

      // Le backend peut exiger un mot de passe obligatoire (sinon ajustez selon besoin)
      if (!values.password) {
        message.error("Le champ mot de passe est obligatoire.");
        setSaving(false);
        return;
      }

      // Extraire les IDs des rôles sélectionnés
      const rolesIds = values.roles || [];
      delete values.roles;

      // Préparer payload, en incluant les rôles sous un champ "roles" (adapter selon backend)
      const payload = {
        ...values,
        roles: rolesIds,
      };

      await updateUser(id, payload);

      message.success("Utilisateur mis à jour avec succès");
      navigate("/users");
    } catch (err) {
      console.error(err.response?.data || err.message || err);
      setError(
        (err.response?.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Erreur serveur"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Spin
        tip="Chargement en cours..."
        style={{ display: "block", marginTop: 80, textAlign: "center" }}
      />
    );

  return (
    <Layout style={{ minHeight: "100vh", padding: "24px", background: "#fafafa" }}>
      <Content
        style={{
          maxWidth: 1200,
          margin: "auto",
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          boxShadow: "none",
        }}
      >
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/users">Utilisateurs</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Modifier utilisateur #{id}</Breadcrumb.Item>
        </Breadcrumb>

        <Button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          Retour
        </Button>

        {error && (
          <Alert
            type="error"
            message="Erreur"
            description={error}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          <Row gutter={24}>
            {/* Colonne gauche */}
            <Col xs={24} md={12}>
              <InfoLine label="Email">
                <Input disabled value={initialEmail} />
              </InfoLine>

              <InfoLine label="Prénom">
                <Form.Item name="first_name" noStyle rules={[{ required: true, message: "Prénom requis" }]}>
                  <Input placeholder="Prénom" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Nom">
                <Form.Item name="last_name" noStyle rules={[{ required: true, message: "Nom requis" }]}>
                  <Input placeholder="Nom" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Téléphone">
                <Form.Item name="telephone" noStyle>
                  <Input placeholder="Téléphone" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Type client">
                <Form.Item name="type_client" noStyle rules={[{ required: true, message: "Type client requis" }]}>
                  <Input placeholder="particulier / entreprise" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Accepte facture électronique">
                <Form.Item name="accepte_facture_electronique" valuePropName="checked" noStyle>
                  <Checkbox />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Accepte CGV">
                <Form.Item name="accepte_cgv" valuePropName="checked" noStyle>
                  <Checkbox />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Mot de passe">
                <Form.Item
                  name="password"
                  noStyle
                  tooltip="Le mot de passe est obligatoire"
                  rules={[
                    { required: true, min: 6, message: "Mot de passe requis, au moins 6 caractères" },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Renseignez un nouveau mot de passe" />
                </Form.Item>
              </InfoLine>
            </Col>

            {/* Colonne droite */}
            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: 24 }}>
                Profil entreprise
              </Title>

              <InfoLine label="Raison sociale">
                <Form.Item name={["profils_entreprise", "raison_sociale"]} noStyle>
                  <Input placeholder="Raison sociale" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Numéro SIRET">
                <Form.Item name={["profils_entreprise", "numero_siret"]} noStyle>
                  <Input placeholder="Numéro SIRET" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Numéro TVA">
                <Form.Item name={["profils_entreprise", "numero_tva"]} noStyle>
                  <Input placeholder="Numéro TVA" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Adresse société">
                <Form.Item name={["profils_entreprise", "adresse_societe"]} noStyle>
                  <Input placeholder="Adresse société" />
                </Form.Item>
              </InfoLine>

              <InfoLine label="Téléphone supplémentaire">
                <Form.Item name={["profils_entreprise", "telephone_suppl"]} noStyle>
                  <Input placeholder="Téléphone supplémentaire" />
                </Form.Item>
              </InfoLine>

              <Title level={4} style={{ marginTop: 32, marginBottom: 24 }}>
                Profil particulier
              </Title>

              <InfoLine label="Date de naissance">
                <Form.Item name={["profils_particulier", "date_naissance"]} noStyle>
                  <Input type="date" />
                </Form.Item>
              </InfoLine>

              <Title level={4} style={{ marginTop: 32, marginBottom: 24 }}>
                Rôles utilisateur
              </Title>

              <Form.Item
                name="roles"
                rules={[{ required: true, message: "Veuillez sélectionner au moins un rôle" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Sélectionnez les rôles"
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                    </div>
                  )}
                >
                  {allRoles.map(({ id, name, description }) => (
                    <Option key={id} value={id}>
                      <Tooltip title={description || ""}>{name}</Tooltip>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space size="middle" style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={saving}>
              Enregistrer
            </Button>
            <Button onClick={() => navigate(-1)}>Annuler</Button>
          </Space>
        </Form>
      </Content>
    </Layout>
  );
}
