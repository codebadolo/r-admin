import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Switch } from "antd";

const { Option } = Select;

export default function AddressModalForm({
  visible,
  onCancel,
  onSubmit,
  address,
  loading,
  paysList,
  formesJuridique,
  regimesFiscaux,
  divisionsFiscales,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (address) {
      form.setFieldsValue({
        utilisation: address.utilisation || "facturation",
        type_client: address.type_client || "particulier",
        nom_complet: address.nom_complet || "",
        telephone: address.telephone || "",
        raison_sociale: address.raison_sociale || "",
        rccm: address.rccm || "",
        ifu: address.ifu || "",
        forme_juridique_id: address.forme_juridique_id || null,
        regime_fiscal_id: address.regime_fiscal_id || null,
        division_fiscale_id: address.division_fiscale_id || null,
        rue: address.rue || "",
        numero: address.numero || "",
        ville: address.ville || "",
        code_postal: address.code_postal || "",
        pays_id: address.pays_id || null,
        livraison_identique_facturation: address.livraison_identique_facturation ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [address, form]);

  const typeClient = Form.useWatch("type_client", form) || "particulier";

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      visible={visible}
      title={address ? "Modifier une adresse" : "Ajouter une adresse"}
      okText={address ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item label="Utilisation" name="utilisation" rules={[{ required: true }]}>
          <Select>
            <Option value="facturation">Facturation</Option>
            <Option value="livraison">Livraison</Option>
            <Option value="autre">Autre</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Type client" name="type_client" rules={[{ required: true }]}>
          <Select>
            <Option value="particulier">Particulier</Option>
            <Option value="entreprise">Entreprise</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Nom complet" name="nom_complet" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Téléphone" name="telephone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {typeClient === "entreprise" && (
          <>
            <Form.Item label="Raison sociale" name="raison_sociale" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="RCCM" name="rccm">
              <Input />
            </Form.Item>

            <Form.Item label="IFU" name="ifu">
              <Input />
            </Form.Item>

            <Form.Item label="Forme juridique" name="forme_juridique_id" >
              <Select allowClear>
                {formesJuridique.map((fj) => (
                  <Option key={fj.id} value={fj.id}>
                    {fj.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Régime fiscal" name="regime_fiscal_id" >
              <Select allowClear>
                {regimesFiscaux.map((rf) => (
                  <Option key={rf.id} value={rf.id}>
                    {rf.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Division fiscale" name="division_fiscale_id" >
              <Select allowClear>
                {divisionsFiscales.map((df) => (
                  <Option key={df.id} value={df.id}>
                    {df.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item label="Rue" name="rue" >
          <Input />
        </Form.Item>

        <Form.Item label="Numéro" name="numero" >
          <Input />
        </Form.Item>

        <Form.Item label="Ville" name="ville" >
          <Input />
        </Form.Item>

        <Form.Item label="Code postal" name="code_postal" >
          <Input />
        </Form.Item>

        <Form.Item label="Pays" name="pays_id" >
          <Select allowClear>
            {paysList.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Livraison identique facturation"
          name="livraison_identique_facturation"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
