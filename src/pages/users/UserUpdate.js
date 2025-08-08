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
  List,
  Row,
  Col,
  Space,
  Select,
  Tooltip,
  Collapse,
  Divider,
  message
} from "antd";
import {
  HomeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  fetchUser,
  updateUser,
  fetchRoles,
  updateUserPassword,
  fetchUserTVANumbers,
} from "../../services/userServices";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { Panel } = Collapse;

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [userTVANumbers, setUserTVANumbers] = useState([]);
  const [initialEmail, setInitialEmail] = useState("");

  // Chargement des données utilisateur, rôles et numéros TVA
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rolesResp, userResp, tvaResp] = await Promise.all([
          fetchRoles(),
          fetchUser(id),
          fetchUserTVANumbers(id),
        ]);

        setRoles(rolesResp.data || []);
        const userData = userResp.data || {};
        setUserTVANumbers(tvaResp.data || []);

        setInitialEmail(userData.email);

        // Préparation des valeurs dans le formulaire, en tenant compte des clés correctes (singulier)
        form.setFieldsValue({
          email: userData.email,
          type_client: userData.type_client,
          telephone: userData.telephone,
          accepte_cgv: userData.accepte_cgv,
          accepte_facture_electronique: userData.accepte_facture_electronique,
          profils_entreprise: userData.profil_entreprise || {},
          profils_particulier: userData.profil_particulier || {},
          roles: (userData.user_roles || [])
            .map((ur) => ur.role?.id)
            .filter(Boolean),
        });
      } catch (err) {
        setError(
          (err.response && err.response.data && JSON.stringify(err.response.data)) ||
            err.message ||
            "Erreur lors du chargement"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, form]);

  // Soumission de la mise à jour utilisateur
  const onFinish = async (values) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...values,
        email: initialEmail, // Remplacez email (non modifiable)
        roles: values.roles || [],
      };
      await updateUser(id, payload);
      message.success("Utilisateur mis à jour avec succès");
      navigate("/users");
    } catch (err) {
      setError(
        (err.response && err.response.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  // Soumission changement mot de passe
  const onSubmitPassword = async (values) => {
    setPwdSaving(true);
    setError(null);
    if (values.new_password !== values.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      setPwdSaving(false);
      return;
    }
    try {
      await updateUserPassword(id, {
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      message.success("Mot de passe modifié avec succès");
      pwdForm.resetFields();
    } catch (err) {
      setError(
        (err.response && err.response.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Erreur lors du changement de mot de passe"
      );
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading)
    return (
      <Spin
        tip="Chargement en cours..."
        style={{ display: "block", marginTop: 80, textAlign: "center" }}
      />
    );

  // Vérifications pour affichages conditionnels (profils présents)
  const profilsEntreprise = form.getFieldValue('profils_entreprise') || {};
  const profilsParticulier = form.getFieldValue('profils_particulier') || {};

  const hasEntrepriseProfil = Object.keys(profilsEntreprise).length > 0;
  const hasParticulierProfil = Object.keys(profilsParticulier).length > 0;

  return (
    <Layout style={{ minHeight: "100vh", padding: 24, background: "#fafafa" }}>
      <Content
        style={{
          maxWidth: 1000,
          margin: "auto",
          background: "#fff",
          padding: 32,
          borderRadius: 8,
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
            closable
            style={{ marginBottom: 24 }}
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          scrollToFirstError
          initialValues={{
            type_client: "particulier",
            accepte_cgv: false,
            accepte_facture_electronique: false,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Email">
                <Input value={initialEmail} disabled prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                label="Type Client"
                name="type_client"
                rules={[{ required: true, message: "Veuillez sélectionner un type client" }]}
              >
                <Select>
                  <Option value="particulier">Particulier</Option>
                  <Option value="entreprise">Entreprise</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Téléphone"
                name="telephone"
                rules={[{ required: true, message: "Téléphone requis" }]}
              >
                <Input placeholder="Téléphone" />
              </Form.Item>

              <Form.Item
                name="accepte_facture_electronique"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Accepte la facture électronique</Checkbox>
              </Form.Item>
              <Form.Item name="accepte_cgv" valuePropName="checked" style={{ marginBottom: 20 }}>
                <Checkbox>Accepte les CGV</Checkbox>
              </Form.Item>

              <Form.Item
                label="Rôles"
                name="roles"
                rules={[{ required: true, message: "Veuillez sélectionner au moins un rôle" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Sélectionnez les rôles"
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                  {roles.map((r) => (
                    <Option key={r.id} value={r.id}>
                      <Tooltip title={r.description || ""}>{r.name}</Tooltip>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Collapse defaultActiveKey={["entreprise"]} bordered={false} ghost>
                <Panel header="Profil entreprise" key="entreprise" disabled={!hasEntrepriseProfil}>
                  <Form.Item label="Nom complet" name={["profils_entreprise", "nom_complet"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Téléphone" name={["profils_entreprise", "telephone"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Raison sociale" name={["profils_entreprise", "raison_sociale"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Numéro SIRET" name={["profils_entreprise", "numero_siret"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Numéro TVA" name={["profils_entreprise", "numero_tva"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Adresse société" name={["profils_entreprise", "adresse_societe"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Téléphone supplémentaire" name={["profils_entreprise", "telephone_suppl"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["profils_entreprise", "livraison_identique_facturation"]}
                    valuePropName="checked"
                  >
                    <Checkbox>Livraison identique à la facturation</Checkbox>
                  </Form.Item>
                </Panel>

                <Panel header="Profil particulier" key="particulier" disabled={!hasParticulierProfil}>
                  <Form.Item label="Nom complet" name={["profils_particulier", "nom_complet"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Téléphone" name={["profils_particulier", "telephone"]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Date de naissance" name={["profils_particulier", "date_naissance"]}>
                    <Input type="date" />
                  </Form.Item>
                  <Form.Item
                    name={["profils_particulier", "livraison_identique_facturation"]}
                    valuePropName="checked"
                  >
                    <Checkbox>Livraison identique à la facturation</Checkbox>
                  </Form.Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>

          <Divider orientation="left" style={{ marginTop: 40 }}>
            Numéros TVA validés
          </Divider>

          {userTVANumbers.length === 0 ? (
            <Alert message="Aucun numéro TVA associé." type="info" />
          ) : (
            <List
              bordered
              dataSource={userTVANumbers}
              split={true}
              itemLayout="vertical"
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Typography.Text strong>{item.numero_tva}</Typography.Text> ({item.pays}) - Ajouté le{" "}
                    {new Date(item.date_ajout).toLocaleDateString()}
                  </Space>
                </List.Item>
              )}
              style={{ marginBottom: 40 }}
            />
          )}

          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              Enregistrer
            </Button>
            <Button onClick={() => navigate(-1)}>Annuler</Button>
          </Space>
        </Form>

        <Divider orientation="left" style={{ marginTop: 60 }}>
          Gestion du mot de passe
        </Divider>

        {/* Formulaire changement mot de passe */}
        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={async (values) => {
            setError(null);
            setPwdSaving(true);
            if (values.new_password !== values.confirm_password) {
              setError("Les mots de passe ne correspondent pas.");
              setPwdSaving(false);
              return;
            }
            try {
              await updateUserPassword(id, {
                old_password: values.old_password,
                new_password: values.new_password,
                confirm_password: values.confirm_password,
              });
              message.success("Mot de passe modifié avec succès");
              pwdForm.resetFields();
            } catch (err) {
              setError(
                (err.response && err.response.data && JSON.stringify(err.response.data)) ||
                  err.message ||
                  "Erreur lors du changement de mot de passe"
              );
            } finally {
              setPwdSaving(false);
            }
          }}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="Mot de passe actuel"
            name="old_password"
            rules={[{ required: true, message: "Mot de passe actuel requis" }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="Nouveau mot de passe"
            name="new_password"
            rules={[
              { required: true, message: "Nouveau mot de passe requis" },
              { min: 6, message: "Le mot de passe doit contenir au moins 6 caractères" },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="Confirmer le nouveau mot de passe"
            name="confirm_password"
            dependencies={["new_password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirmez le mot de passe" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Les mots de passe ne correspondent pas."));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={pwdSaving}>
                Modifier le mot de passe
              </Button>
              <Button onClick={() => pwdForm.resetFields()}>Réinitialiser</Button>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
