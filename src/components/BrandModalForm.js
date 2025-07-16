import { UploadOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Upload, message } from "antd";
import { useEffect, useState } from "react";

export default function BrandModalForm({ visible, onCancel, onSubmit, editingBrand }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Met à jour le formulaire à chaque changement de marque à éditer ou ouverture modal
  useEffect(() => {
    if (visible) {
      if (editingBrand) {
        form.setFieldsValue({
          name: editingBrand.name || "",
        });
        if (editingBrand.logo) {
          setFileList([
            {
              uid: "-1",
              name: "logo.png",
              status: "done",
              url: editingBrand.logo,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [editingBrand, visible, form]);

  // Validation fichier uploadé (uniquement images)
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vous ne pouvez télécharger que des images !");
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Pour que le Form.Item prenne correctement la liste de fichier
  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

  // Soumission : envoi FormData si un fichier est uploadé
  const onFinish = (values) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("logo", fileList[0].originFileObj);
      onSubmit(formData);
    } else {
      onSubmit({ name: values.name });
    }
  };

  return (
    <Modal
      open={visible}
      title={editingBrand ? "Modifier la marque" : "Ajouter une marque"}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={editingBrand ? "Enregistrer" : "Créer"}
      destroyOnClose
      width={420}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
        <Form.Item
          label="Nom de la marque"
          name="name"
          rules={[{ required: true, message: "Le nom est obligatoire" }]}
        >
          <Input placeholder="Entrez le nom" />
        </Form.Item>

        <Form.Item
          label="Logo"
          name="upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Téléchargez un logo depuis votre ordinateur"
        >
          <Upload
            name="logo"
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length >= 1 ? null : (
              <div style={{ fontSize: 24, color: "#999" }}>
                <UploadOutlined />
                <div style={{ marginTop: 6, fontSize: 12 }}>Télécharger</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
