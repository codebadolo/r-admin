import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Form,
  Input,
  Select,
  Button,
  message,
  Switch,
  Space,
  Divider,
  Row,
  Col,
  Spin,
  Alert,
} from "antd";

import { fetchCurrentUser, updateUser, fetchRoles, fetchPays, fetchFormesJuridiques, fetchRegimesFiscaux, fetchDivisionsFiscales } from "../../services/userServices";

const { Title } = Typography;
const { Option } = Select;

const { Content } = Layout;
const emptyAddress = {
  id: null,
  utilisation: "facturation",
  type_client: "particulier",
  nom_complet: "",
  telephone: "",
  raison_sociale: "",
  numero_tva_id: null,
  rccm: "",
  ifu: "",
  forme_juridique_id: null,
  regime_fiscal_id: null,
  division_fiscale_id: null,
  rue: "",
  numero: "",
  ville: "",
  code_postal: "",
  pays_id: null,
  livraison_identique_facturation: true,
};

export default function ProfileEditPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // États pour données listées
  const [roles, setRoles] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [formesJuridique, setFormesJuridique] = useState([]);
  const [regimesFiscaux, setRegimesFiscaux] = useState([]);
  const [divisionsFiscales, setDivisionsFiscales] = useState([]);

  // Chargement / erreurs
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // États pour données utilisateur/adresses
  const [addresses, setAddresses] = useState([]);

  // Surveiller le type_client pour gérer conditionnels
  const typeClient = Form.useWatch("type_client", form);

  // Charger données nécessaires et profil user au montage
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [userRes, rolesRes, paysRes, formesRes, regimesRes, divisionsRes] = await Promise.all([
          fetchCurrentUser(),
          fetchRoles(),
          fetchPays(),
          fetchFormesJuridiques(),
          fetchRegimesFiscaux(),
          fetchDivisionsFiscales(),
        ]);

        const userData = userRes.data;

        // Préparer adresses (ajouter id si non présent)
        const loadedAddresses = (userData.adresses || []).map((addr) => ({
          ...addr,
          numero_tva_id: addr.numero_tva?.id || null,
          forme_juridique_id: addr.forme_juridique?.id || null,
          regime_fiscal_id: addr.regime_fiscal?.id || null,
          division_fiscale_id: addr.division_fiscale?.id || null,
          pays_id: addr.pays?.id || null,
        }));
        setAddresses(loadedAddresses.length > 0 ? loadedAddresses : [{ ...emptyAddress }]);

        setRoles(rolesRes.data || []);
        setPaysList(paysRes.data || []);
        setFormesJuridique(formesRes.data || []);
        setRegimesFiscaux(regimesRes.data || []);
        setDivisionsFiscales(divisionsRes.data || []);

        form.setFieldsValue({
          email: userData.email,
          type_client: userData.type_client,
          telephone: userData.telephone,
          accepte_facture_electronique: userData.accepte_facture_electronique,
          accepte_cgv: userData.accepte_cgv,
          roles: userData.user_roles?.map((ur) => ur.role?.id) || [],
          // autres champs si besoin
        });

      } catch (e) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [form]);

  // Gestion adresses dynamique
  const addAddress = () => {
    setAddresses([...addresses, { ...emptyAddress, type_client: typeClient || "particulier" }]);
  };

  const removeAddress = (index) => {
    const newAddrs = [...addresses];
    newAddrs.splice(index, 1);
    setAddresses(newAddrs);
  };

  const updateAddress = (index, field, value) => {
    const newAddrs = [...addresses];
    newAddrs[index] = { ...newAddrs[index], [field]: value };
    setAddresses(newAddrs);
  };

  // Soumission formulaire
  const onFinish = async (values) => {
    if (addresses.length === 0) {
      message.error("Veuillez renseigner au moins une adresse");
      return;
    }

    const adressesData = addresses.map((a) => ({
      id: a.id || undefined, // important pour update adresses existantes
      utilisation: a.utilisation,
      type_client: a.type_client,
      nom_complet: a.nom_complet,
      telephone: a.telephone,
      raison_sociale: a.raison_sociale,
      rccm: a.rccm,
      ifu: a.ifu,
      forme_juridique_id: a.forme_juridique_id || null,
      regime_fiscal_id: a.regime_fiscal_id || null,
      division_fiscale_id: a.division_fiscale_id || null,
      rue: a.rue,
      numero: a.numero,
      ville: a.ville,
      code_postal: a.code_postal,
      pays_id: a.pays_id || null,
      livraison_identique_facturation: a.livraison_identique_facturation,
      numero_tva_id: a.numero_tva_id || null,
    }));

    const payload = {
      email: values.email,
      type_client: values.type_client,
      telephone: values.telephone,
      accepte_facture_electronique: values.accepte_facture_electronique,
      accepte_cgv: values.accepte_cgv,
      roles: values.roles || [],
      adresses: adressesData,
    };

    setSaving(true);
    try {
      await updateUser(payload);
      message.success("Profil mis à jour avec succès !");
      navigate("/profile");
    } catch (e) {
      if (e.response?.data) {
        message.error(JSON.stringify(e.response.data));
      } else {
        message.error("Erreur lors de la mise à jour.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <Spin tip="Chargement..." style={{ marginTop: 80, textAlign: "center" }} />;

  if (error)
    return (
      <Alert
        type="error"
        message="Erreur"
        description={error}
        showIcon
        style={{ maxWidth: 600, margin: "auto" }}
      />
    );

  return (
    <Layout style={{ padding: 24, background: "#fff" }}>
      <Content style={{ maxWidth: 900, margin: "auto" }}>
        <Title level={2}>Modifier mon profil</Title>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type_client: "particulier" }}>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email obligatoire" },
                  { type: "email", message: "Email non valide" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Type client" name="type_client" rules={[{ required: true }]}>
                <Select>
                  <Option value="particulier">Particulier</Option>
                  <Option value="entreprise">Entreprise</Option>
                </Select>
              </Form.Item>

              {typeClient === "entreprise" && (
                <Form.Item
                  label="Raison sociale"
                  name="raison_sociale"
                  rules={[{ required: true, message: "Raison sociale obligatoire" }]}
                >
                  <Input />
                </Form.Item>
              )}

              <Form.Item
                label="Téléphone"
                name="telephone"
                rules={[{ required: true, message: "Téléphone obligatoire" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Accepte facture électronique" name="accepte_facture_electronique" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item
                label="Accepte CGV"
                name="accepte_cgv"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error("Vous devez accepter les CGV")),
                  },
                ]}
              >
                <Switch />
              </Form.Item>

              <Form.Item label="Rôles" name="roles">
                <Select mode="multiple" allowClear placeholder="Sélectionner les rôles">
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Title level={4}>Adresses</Title>
              {addresses.map((addr, idx) => (
                <Space
                  key={idx}
                  direction="vertical"
                  style={{ border: "1px solid #ddd", padding: 16, width: "100%", marginBottom: 16 }}
                  size="small"
                >
                  <Form.Item label="Utilisation">
                    <Select
                      value={addr.utilisation}
                      onChange={(val) => updateAddress(idx, "utilisation", val)}
                    >
                      <Option value="facturation">Facturation</Option>
                      <Option value="livraison">Livraison</Option>
                      <Option value="autre">Autre</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Type client">
                    <Select
                      value={addr.type_client}
                      onChange={(val) => updateAddress(idx, "type_client", val)}
                    >
                      <Option value="particulier">Particulier</Option>
                      <Option value="entreprise">Entreprise</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Nom complet">
                    <Input
                      value={addr.nom_complet}
                      onChange={(e) => updateAddress(idx, "nom_complet", e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Téléphone">
                    <Input
                      value={addr.telephone}
                      onChange={(e) => updateAddress(idx, "telephone", e.target.value)}
                    />
                  </Form.Item>

                  {addr.type_client === "entreprise" && (
                    <>
                      <Form.Item label="Raison sociale">
                        <Input
                          value={addr.raison_sociale}
                          onChange={(e) => updateAddress(idx, "raison_sociale", e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item label="RCCM">
                        <Input
                          value={addr.rccm}
                          onChange={(e) => updateAddress(idx, "rccm", e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item label="IFU">
                        <Input
                          value={addr.ifu}
                          onChange={(e) => updateAddress(idx, "ifu", e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item label="Forme juridique">
                        <Select
                          allowClear
                          value={addr.forme_juridique_id}
                          onChange={(val) => updateAddress(idx, "forme_juridique_id", val)}
                        >
                          {formesJuridique.map((fj) => (
                            <Option key={fj.id} value={fj.id}>
                              {fj.nom}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item label="Régime fiscal">
                        <Select
                          allowClear
                          value={addr.regime_fiscal_id}
                          onChange={(val) => updateAddress(idx, "regime_fiscal_id", val)}
                        >
                          {regimesFiscaux.map((rf) => (
                            <Option key={rf.id} value={rf.id}>
                              {rf.nom}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item label="Division fiscale">
                        <Select
                          allowClear
                          value={addr.division_fiscale_id}
                          onChange={(val) => updateAddress(idx, "division_fiscale_id", val)}
                        >
                          {divisionsFiscales.map((df) => (
                            <Option key={df.id} value={df.id}>
                              {df.nom}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}

                  <Form.Item label="Rue">
                    <Input
                      value={addr.rue}
                      onChange={(e) => updateAddress(idx, "rue", e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Numéro">
                    <Input
                      value={addr.numero}
                      onChange={(e) => updateAddress(idx, "numero", e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Ville">
                    <Input
                      value={addr.ville}
                      onChange={(e) => updateAddress(idx, "ville", e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Code postal">
                    <Input
                      value={addr.code_postal}
                      onChange={(e) => updateAddress(idx, "code_postal", e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Pays">
                    <Select
                      allowClear
                      value={addr.pays_id}
                      onChange={(val) => updateAddress(idx, "pays_id", val)}
                    >
                      {paysList.map((p) => (
                        <Option key={p.id} value={p.id}>
                          {p.nom}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Livraison identique facturation">
                    <Switch
                      checked={addr.livraison_identique_facturation}
                      onChange={(checked) =>
                        updateAddress(idx, "livraison_identique_facturation", checked)
                      }
                    />
                  </Form.Item>

                  {addresses.length > 1 && (
                    <Button danger onClick={() => removeAddress(idx)}>
                      Supprimer cette adresse
                    </Button>
                  )}

                  <Divider />
                </Space>
              ))}

              <Button type="dashed" block onClick={addAddress}>
                + Ajouter une adresse
              </Button>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Enregistrer
              </Button>
              <Button onClick={() => navigate("/profile")}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
