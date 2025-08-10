import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  message,
  Breadcrumb,
  Row,
  Col,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  HomeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import * as userService from '../../services/userServices';

const { Option } = Select;

const UserAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [rolesOptions, setRolesOptions] = useState([]);
  const [paysOptions, setPaysOptions] = useState([]);
  const [formesOptions, setFormesOptions] = useState([]);
  const [regimesOptions, setRegimesOptions] = useState([]);
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [typeClient, setTypeClient] = useState('particulier');

  // Chargement des listes pour sélecteurs
  useEffect(() => {
    userService.fetchRoles()
      .then(res => setRolesOptions(res.data))
      .catch(() => message.error('Erreur lors du chargement des rôles'));

    userService.fetchPays()
      .then(res => setPaysOptions(res.data))
      .catch(() => message.error('Erreur lors du chargement des pays'));

    userService.fetchFormesJuridiques()
      .then(res => setFormesOptions(res.data))
      .catch(() => message.error('Erreur lors du chargement des formes juridiques'));

    userService.fetchRegimesFiscaux()
      .then(res => setRegimesOptions(res.data))
      .catch(() => message.error('Erreur lors du chargement des régimes fiscaux'));

    userService.fetchDivisionsFiscales()
      .then(res => setDivisionsOptions(res.data))
      .catch(() => message.error('Erreur lors du chargement des divisions fiscales'));
  }, []);

  // Mise à jour du type Client : met à jour toutes les adresses
  const onTypeClientChange = (value) => {
    setTypeClient(value);

    const adresses = form.getFieldValue('adresses') || [];
    const updatedAdresses = adresses.map(addr => ({
      ...addr,
      // on garde le type_client global, pas dans les adresses
      // si entreprise, on peut conserver raison_sociale existante, sinon vide
      raison_sociale: value === 'entreprise' ? (addr.raison_sociale || '') : '',
    }));
    form.setFieldsValue({ adresses: updatedAdresses });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { passwordConfirm, ...payload } = values;

      // Injecter le type_client global dans chaque adresse au moment de soumission
      if (payload.adresses && payload.adresses.length > 0) {
        payload.adresses = payload.adresses.map(addr => ({
          ...addr,
          type_client: typeClient,
        }));
      }

      await userService.createUser(payload);
      message.success('Utilisateur créé avec succès');
      navigate('/users');
    } catch (error) {
      const detail = error?.response?.data?.detail || JSON.stringify(error?.response?.data) || "Erreur lors de la création de l'utilisateur";
      message.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
          <span>Accueil</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/users">
          <UserAddOutlined />
          <span>Utilisateurs</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Ajouter un utilisateur</Breadcrumb.Item>
      </Breadcrumb>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type_client: 'particulier',
          adresses: [{
            utilisation: 'facturation',
            raison_sociale: '',
            pays_id: paysOptions.length > 0 ? paysOptions[0].id : undefined,
          }],
          accepte_cgv: false,
          accepte_facture_electronique: false,
          roles: [],
        }}
        scrollToFirstError
      >
        {/* Email + Type client */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email obligatoire' },
                { type: 'email', message: 'Email non valide' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Type de client"
              name="type_client"
              rules={[{ required: true, message: 'Type de client obligatoire' }]}
            >
              <Select onChange={onTypeClientChange}>
                <Option value="particulier">Particulier</Option>
                <Option value="entreprise">Entreprise</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Téléphone + checkbox */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Téléphone"
              name="telephone"
              rules={[{ pattern: /^\+?\d*$/, message: 'Téléphone invalide' }]}
            >
              <Input placeholder="+226..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="accepte_cgv" valuePropName="checked" initialValue={false}>
              <Checkbox>Accepte les CGV</Checkbox>
            </Form.Item>
            <Form.Item name="accepte_facture_electronique" valuePropName="checked" initialValue={false}>
              <Checkbox>Accepte facture électronique</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* Mot de passe + Confirmation */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mot de passe"
              name="password"
              rules={[
                { required: true, message: 'Mot de passe obligatoire' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Confirmer le mot de passe"
              name="passwordConfirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Veuillez confirmer le mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        {/* Rôles */}
        <Form.Item
          label="Rôles"
          name="roles"
          rules={[{ required: true, message: 'Veuillez sélectionner au moins un rôle' }]}
        >
          <Select
            mode="multiple"
            placeholder="Sélectionnez les rôles"
            optionFilterProp="children"
            showSearch
            allowClear
          >
            {rolesOptions.map(role => (
              <Option key={role.id} value={role.id}>{role.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Adresses dynamiques */}
        <Form.List name="adresses">
          {(fields, { add, remove }) => (
            <>
              <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
                Adresses
              </label>

              {fields.map(({ key, name, ...restField }) => {
                // Le type_client est global, on ne l’affiche pas dans chaque adresse
                // On récupère quand même localement la raison_sociale pour entreprises
                const isEntreprise = typeClient === 'entreprise';

                return (
                  <div key={key} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'utilisation']}
                          rules={[{ required: true, message: 'Sélectionnez l\'utilisation' }]}
                          label="Utilisation"
                        >
                          <Select>
                            <Option value="facturation">Facturation</Option>
                            <Option value="livraison">Livraison</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'nom_complet']}
                          rules={[{ required: true, message: 'Nom complet obligatoire' }]}
                          label="Nom complet"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: 'red', fontSize: 24, marginTop: 30, cursor: 'pointer' }}
                          title="Supprimer cette adresse"
                        />
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'telephone']}
                          rules={[{ required: true, message: 'Téléphone obligatoire' }]}
                          label="Téléphone"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      {isEntreprise && (
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'raison_sociale']}
                            rules={[{ required: true, message: 'Raison sociale obligatoire' }]}
                            label="Raison sociale"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      )}

                      <Col xs={24} sm={isEntreprise ? 8 : 16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'rue']}
                          rules={[{ required: true, message: 'Rue obligatoire' }]}
                          label="Rue"
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={6}>
                        <Form.Item {...restField} name={[name, 'numero']} label="Numéro (optionnel)">
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'ville']}
                          rules={[{ required: true, message: 'Ville obligatoire' }]}
                          label="Ville"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'code_postal']}
                          rules={[{ required: true, message: 'Code postal obligatoire' }]}
                          label="Code postal"
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'pays_id']}
                          rules={[{ required: true, message: 'Pays obligatoire' }]}
                          label="Pays"
                        >
                          <Select showSearch optionFilterProp="children" allowClear>
                            {paysOptions.map(p => (
                              <Option key={p.id} value={p.id}>{p.nom}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {isEntreprise && (
                      <Row gutter={16}>
                        <Col xs={24} sm={8}>
                          <Form.Item {...restField} name={[name, 'forme_juridique_id']} label="Forme juridique" allowClear>
                            <Select showSearch optionFilterProp="children" allowClear>
                              {formesOptions.map(f => (
                                <Option key={f.id} value={f.id}>{f.nom}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item {...restField} name={[name, 'regime_fiscal_id']} label="Régime fiscal" allowClear>
                            <Select showSearch optionFilterProp="children" allowClear>
                              {regimesOptions.map(r => (
                                <Option key={r.id} value={r.id}>{r.nom}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item {...restField} name={[name, 'division_fiscale_id']} label="Division fiscale" allowClear>
                            <Select showSearch optionFilterProp="children" allowClear>
                              {divisionsOptions.map(d => (
                                <Option key={d.id} value={d.id}>{d.nom}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                );
              })}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Ajouter une adresse
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Champs TVA uniquement si type client entreprise */}
        {typeClient === 'entreprise' && (
          <Form.List name="numero_tva_valides">
            {(fields, { add, remove }) => (
              <>
                <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
                  Numéros TVA
                </label>

                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'numero_tva']}
                      rules={[{ required: true, message: "Numéro TVA obligatoire" }]}
                    >
                      <Input placeholder="Numéro TVA" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'pays']}
                      rules={[{ required: true, message: "Pays obligatoire" }]}
                    >
                      <Select placeholder="Pays" style={{ width: 160 }} showSearch optionFilterProp="children" allowClear>
                        {paysOptions.map(p => (
                          <Option key={p.id} value={p.nom}>{p.nom}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter un numéro TVA
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Créer utilisateur
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default UserAdd;
