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
} from "antd";

import {
  fetchRoles,
  fetchPays,
  fetchFormesJuridiques,
  fetchRegimesFiscaux,
  fetchDivisionsFiscales,
  createUser,
} from "../../services/userServices";

const { Title } = Typography;
const { Option } = Select;

const emptyAddress = {
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

export default function UserAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Données pour selects
  const [roles, setRoles] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [formesJuridique, setFormesJuridique] = useState([]);
  const [regimesFiscaux, setRegimesFiscaux] = useState([]);
  const [divisionsFiscales, setDivisionsFiscales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([{ ...emptyAddress }]);

  // On récupère la valeur de type_client en temps réel dans le formulaire
  const typeClient = Form.useWatch("type_client", form) || "particulier";

  useEffect(() => {
    fetchRoles().then((res) => setRoles(res.data || []));
    fetchPays().then((res) => setPaysList(res.data || []));
    fetchFormesJuridiques().then((res) => setFormesJuridique(res.data || []));
    fetchRegimesFiscaux().then((res) => setRegimesFiscaux(res.data || []));
    fetchDivisionsFiscales().then((res) => setDivisionsFiscales(res.data || []));
  }, []);

  const addAddress = () => {
    setAddresses([...addresses, { ...emptyAddress, type_client: typeClient }]);
  };

  const removeAddress = (index) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const onFinish = async (values) => {
    if (addresses.length === 0) {
      message.error("Au moins une adresse est requise.");
      return;
    }

    // Préparer adresses avec champs _id attendus par le backend
    const adressesData = addresses.map((a) => ({
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

    const dataToSend = {
      email: values.email,
      password: values.password,
      type_client: values.type_client,
      accepte_facture_electronique: values.accepte_facture_electronique,
      accepte_cgv: values.accepte_cgv,
      telephone: values.telephone,
      roles: values.roles || [],
      adresses: adressesData,
    };

    setLoading(true);
    try {
      await createUser(dataToSend);
      message.success("Utilisateur créé avec succès !");
      navigate("/users");
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        message.error(
          JSON.stringify(error.response.data, null, 2).slice(0, 300)
        );
      } else {
        message.error("Erreur lors de la création de l’utilisateur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ padding: 24, background: "#FFF", maxWidth: "90vw", margin: "auto" }}>
      <Title level={2}>Ajouter un utilisateur</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type_client: "particulier",
          accepte_facture_electronique: false,
          accepte_cgv: false,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {/* Champs utilisateur communs */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Veuillez saisir un email valide" },
                { type: "email", message: "L'email n'est pas valide" },
              ]}
            >
              <Input placeholder="exemple@domaine.com" />
            </Form.Item>

            <Form.Item
              label="Mot de passe"
              name="password"
              rules={[
                { required: true, message: "Veuillez saisir un mot de passe" },
                { min: 8, message: "Le mot de passe doit contenir au moins 8 caractères" },
              ]}
            >
              <Input.Password placeholder="Mot de passe" />
            </Form.Item>

            <Form.Item label="Type client" name="type_client" rules={[{ required: true }]}>
              <Select>
                <Option value="particulier">Particulier</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </Form.Item>

            {/* Champs conditionnels utilisateur */}
            {typeClient === "entreprise" && (
              <Form.Item
                label="Raison sociale"
                name="raison_sociale"
                rules={[{ required: true, message: "La raison sociale est obligatoire" }]}
              >
                <Input />
              </Form.Item>
            )}

            {typeClient === "particulier" && (
              <Form.Item
                label="Date de naissance"
                name="date_naissance"
                rules={[{ required: true, message: "Date de naissance obligatoire" }]}
              >
                <Input type="date" />
              </Form.Item>
            )}

            <Form.Item
              label="Téléphone"
              name="telephone"
              rules={[{ required: true, message: "Veuillez saisir un numéro de téléphone" }]}
            >
              <Input placeholder="+226 70 00 00 00" />
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
              <Select mode="multiple" placeholder="Sélectionner un ou plusieurs rôles" allowClear>
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

            {addresses.map((adresse, idx) => (
              <Space
                key={idx}
                direction="vertical"
                style={{ border: "1px solid #ddd", padding: 16, marginBottom: 16, width: "100%" }}
                size="small"
              >
                <Form.Item label="Utilisation">
                  <Select
                    value={adresse.utilisation}
                    onChange={(value) => updateAddress(idx, "utilisation", value)}
                  >
                    <Option value="facturation">Facturation</Option>
                    <Option value="livraison">Livraison</Option>
                    <Option value="autre">Autre</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Type client">
                  <Select
                    value={adresse.type_client}
                    onChange={(value) => updateAddress(idx, "type_client", value)}
                  >
                    <Option value="particulier">Particulier</Option>
                    <Option value="entreprise">Entreprise</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Nom complet">
                  <Input
                    value={adresse.nom_complet}
                    onChange={(e) => updateAddress(idx, "nom_complet", e.target.value)}
                    placeholder="Nom complet"
                  />
                </Form.Item>

                <Form.Item label="Téléphone">
                  <Input
                    value={adresse.telephone}
                    onChange={(e) => updateAddress(idx, "telephone", e.target.value)}
                    placeholder="+226..."
                  />
                </Form.Item>

                {/* Champs conditionnels adresse */}
                {adresse.type_client === "entreprise" && (
                  <>
                    <Form.Item label="Raison sociale">
                      <Input
                        value={adresse.raison_sociale}
                        onChange={(e) => updateAddress(idx, "raison_sociale", e.target.value)}
                        placeholder="Raison sociale"
                      />
                    </Form.Item>

                    <Form.Item label="RCCM">
                      <Input
                        value={adresse.rccm}
                        onChange={(e) => updateAddress(idx, "rccm", e.target.value)}
                        placeholder="RCCM"
                      />
                    </Form.Item>

                    <Form.Item label="IFU">
                      <Input
                        value={adresse.ifu}
                        onChange={(e) => updateAddress(idx, "ifu", e.target.value)}
                        placeholder="IFU"
                      />
                    </Form.Item>

                    <Form.Item label="Forme juridique">
                      <Select
                        allowClear
                        value={adresse.forme_juridique_id}
                        onChange={(value) => updateAddress(idx, "forme_juridique_id", value)}
                        placeholder="Forme juridique"
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
                        value={adresse.regime_fiscal_id}
                        onChange={(value) => updateAddress(idx, "regime_fiscal_id", value)}
                        placeholder="Régime fiscal"
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
                        value={adresse.division_fiscale_id}
                        onChange={(value) => updateAddress(idx, "division_fiscale_id", value)}
                        placeholder="Division fiscale"
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
                    value={adresse.rue}
                    onChange={(e) => updateAddress(idx, "rue", e.target.value)}
                    placeholder="Rue"
                  />
                </Form.Item>

                <Form.Item label="Numéro">
                  <Input
                    value={adresse.numero}
                    onChange={(e) => updateAddress(idx, "numero", e.target.value)}
                    placeholder="Numéro"
                  />
                </Form.Item>

                <Form.Item label="Ville">
                  <Input
                    value={adresse.ville}
                    onChange={(e) => updateAddress(idx, "ville", e.target.value)}
                    placeholder="Ville"
                  />
                </Form.Item>

                <Form.Item label="Code postal">
                  <Input
                    value={adresse.code_postal}
                    onChange={(e) => updateAddress(idx, "code_postal", e.target.value)}
                    placeholder="Code postal"
                  />
                </Form.Item>

                <Form.Item label="Pays">
                  <Select
                    allowClear
                    value={adresse.pays_id}
                    onChange={(value) => updateAddress(idx, "pays_id", value)}
                    placeholder="Pays"
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
                    checked={adresse.livraison_identique_facturation}
                    onChange={(checked) => updateAddress(idx, "livraison_identique_facturation", checked)}
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
            <Button type="primary" htmlType="submit" loading={loading}>
              Créer l'utilisateur
            </Button>
            <Button onClick={() => navigate(-1)}>Annuler</Button>
          </Space>
        </Form.Item>
      </Form>
    </Layout>
  );
}
