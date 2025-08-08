import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Typography,
  Spin,
  Alert,
  Form,
  Input,
  Button,
  Switch,
  Row,
  Col,
  Space,
  Select,
  message,
} from "antd";
import { HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import api from "../../services/api";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const TYPE_CLIENT_CHOICES = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'entreprise', label: 'Entreprise' },
];

const UTILISATION_CHOICES = [
  { value: 'facturation', label: 'Facturation' },
  { value: 'livraison', label: 'Livraison' },
];

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // For select options
  const [rolesOptions, setRolesOptions] = useState([]);
  const [numeroTVAOptions, setNumeroTVAOptions] = useState([]);
  const [paysOptions, setPaysOptions] = useState([]);
  const [formeJuridiqueOptions, setFormeJuridiqueOptions] = useState([]);
  const [regimeFiscalOptions, setRegimeFiscalOptions] = useState([]);
  const [divisionFiscaleOptions, setDivisionFiscaleOptions] = useState([]);

  useEffect(() => {
    // Charger les listes d’options nécessaires pour les selects
    async function loadOptions() {
      try {
        const [rolesRes, numeroTVARes, paysRes, formeJuridiqueRes, regimeFiscalRes, divisionFiscaleRes] =
          await Promise.all([
            api.get("/users/roles/"),
            api.get("/users/usertvanumbers/"),
            api.get("/users/pays/"),
            api.get("/users/formes-juridiques/"),
            api.get("/users/regimefiscaux/"),
            api.get("/users/divisionfiscales/"),
          ]);
        setRolesOptions(rolesRes.data);
        setNumeroTVAOptions(numeroTVARes.data);
        setPaysOptions(paysRes.data);
        setFormeJuridiqueOptions(formeJuridiqueRes.data);
        setRegimeFiscalOptions(regimeFiscalRes.data);
        setDivisionFiscaleOptions(divisionFiscaleRes.data);
      } catch (err) {
        console.error("Erreur chargement options:", err);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/users/${id}/`)
      .then(({ data: user }) => {
        // Prérmpli le formulaire selon la structure
        // On mappe adresses pour s’assurer des champs ForeignKey en ID
        const adressesFormatted = (user.adresses && user.adresses.length > 0)
          ? user.adresses.map((a) => ({
              ...a,
              numero_tva_id: a.numero_tva ? a.numero_tva.id || null : null,
              pays_id: a.pays ? a.pays.id || null : null,
              forme_juridique_id: a.forme_juridique ? a.forme_juridique.id || null : null,
              regime_fiscal_id: a.regime_fiscal ? a.regime_fiscal.id || null : null,
              division_fiscale_id: a.division_fiscale ? a.division_fiscale.id || null : null,
            }))
          : [{}]; // Au moins une adresse vide pour le formulaire

        form.setFieldsValue({
          email: user.email,
          type_client: user.type_client,
          accepte_facture_electronique: user.accepte_facture_electronique,
          accepte_cgv: user.accepte_cgv,
          telephone: user.telephone,
          is_active: user.is_active,
          is_staff: user.is_staff,
          password: "", // Pas de valeur préremplie pour la sécurité

          roles: user.roles || [],
          adresses: adressesFormatted,
        });
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement des données");
      })
      .finally(() => setLoading(false));
  }, [id, form]);

  const onFinish = async (values) => {
    setSaving(true);

    // Nettoyer password vide pour ne pas l’envoyer
    const payload = {
      ...values,
      password: values.password ? values.password : undefined,
    };

    try {
      await api.put(`/users/users/${id}/`, payload);
      message.success("Utilisateur mis à jour avec succès");
      navigate(`/users/${id}`);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.detail || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Spin tip="Chargement..." style={{ display: "block", marginTop: 80, textAlign: "center" }} />
    );

  if (error)
    return (
      <Alert type="error" message="Erreur" description={error} showIcon style={{ maxWidth: "100%", margin: "auto" }} />
    );

  return (
    <Layout style={{ maxWidth: 900, margin: "auto", padding: 24, background: "#fafafa" }}>
      <Content>
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/users">Utilisateurs</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Modification</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} style={{ marginBottom: 24 }}>
          Modifier un utilisateur
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={16}>
            {/* Champs utilisateur simples */}
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Veuillez entrer l'adresse email" },
                  { type: "email", message: "Veuillez entrer une adresse email valide" },
                ]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Type client" name="type_client" rules={[{ required: true }]}>
                <Select placeholder="Sélectionnez un type client" options={TYPE_CLIENT_CHOICES} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Téléphone" name="telephone">
                <Input placeholder="Téléphone" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Mot de passe" name="password" hasFeedback>
                <Input.Password placeholder="Laissez vide pour ne pas changer" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label="Utilisateur actif" name="is_active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label="Staff" name="is_staff" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label="Accepte facture électronique" name="accepte_facture_electronique" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Accepte CGV" name="accepte_cgv" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            {/* Rôles en multiselect */}
            <Col xs={24}>
              <Form.Item label="Rôles utilisateur" name="roles">
                <Select
                  mode="multiple"
                  placeholder="Sélectionnez les rôles"
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {rolesOptions.map(({ id, name }) => (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Liste dynamique des adresses */}
            <Col xs={24}>
              <Form.List name="adresses">
                {(fields, { add, remove }) => (
                  <>
                    <Title level={4}>Adresses</Title>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                          padding: 16,
                          marginBottom: 16,
                          position: "relative",
                        }}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                {...restField}
                                label="Utilisation"
                                name={[name, "utilisation"]}
                                rules={[{ required: true, message: "Champ obligatoire" }]}
                              >
                                <Select options={UTILISATION_CHOICES} placeholder="Utilisation" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                {...restField}
                                label="Type client"
                                name={[name, "type_client"]}
                                rules={[{ required: true, message: "Champ obligatoire" }]}
                              >
                                <Select options={TYPE_CLIENT_CHOICES} placeholder="Type client" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={24}>
                              <Form.Item
                                {...restField}
                                label="Nom complet"
                                name={[name, "nom_complet"]}
                                rules={[{ required: true, message: "Champ obligatoire" }]}
                              >
                                <Input placeholder="Nom complet" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Téléphone" name={[name, "telephone"]}>
                                <Input placeholder="Téléphone" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Raison sociale" name={[name, "raison_sociale"]}>
                                <Input placeholder="Raison sociale" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Numéro TVA" name={[name, "numero_tva_id"]}>
                                <Select
                                  placeholder="Sélectionnez un numéro TVA"
                                  allowClear
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  {numeroTVAOptions.map(({ id, numero_tva }) => (
                                    <Option key={id} value={id}>
                                      {numero_tva}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="RCCM" name={[name, "rccm"]}>
                                <Input placeholder="RCCM" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="IFU" name={[name, "ifu"]}>
                                <Input placeholder="IFU" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Forme juridique" name={[name, "forme_juridique_id"]}>
                                <Select placeholder="Sélectionnez la forme juridique" allowClear>
                                  {formeJuridiqueOptions.map(({ id, nom }) => (
                                    <Option key={id} value={id}>
                                      {nom}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Régime fiscal" name={[name, "regime_fiscal_id"]}>
                                <Select placeholder="Sélectionnez le régime fiscal" allowClear>
                                  {regimeFiscalOptions.map(({ id, nom }) => (
                                    <Option key={id} value={id}>
                                      {nom}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Division fiscale" name={[name, "division_fiscale_id"]}>
                                <Select placeholder="Sélectionnez la division fiscale" allowClear>
                                  {divisionFiscaleOptions.map(({ id, nom }) => (
                                    <Option key={id} value={id}>
                                      {nom}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Rue" name={[name, "rue"]}>
                                <Input placeholder="Rue" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Numéro" name={[name, "numero"]}>
                                <Input placeholder="Numéro" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Ville" name={[name, "ville"]}>
                                <Input placeholder="Ville" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Code postal" name={[name, "code_postal"]}>
                                <Input placeholder="Code postal" />
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item {...restField} label="Pays" name={[name, "pays_id"]}>
                                <Select
                                  placeholder="Sélectionnez un pays"
                                  allowClear
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  {paysOptions.map(({ id, nom }) => (
                                    <Option key={id} value={id}>
                                      {nom}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                              <Form.Item
                                {...restField}
                                label="Livraison identique facturation"
                                name={[name, "livraison_identique_facturation"]}
                                valuePropName="checked"
                              >
                                <Switch />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Button
                            type="link"
                            danger
                            style={{ position: "absolute", top: 8, right: 8 }}
                            onClick={() => remove(name)}
                          >
                            Supprimer cette adresse
                          </Button>
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Ajouter une adresse
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>

            {/* Boutons */}
            <Col xs={24}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Enregistrer
                  </Button>
                  <Button onClick={() => navigate(`/users/${id}`)}>Annuler</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Content>
    </Layout>
  );
}
