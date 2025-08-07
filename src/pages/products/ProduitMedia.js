import { InboxOutlined } from "@ant-design/icons";
import { Form, Upload, message } from "antd";

const { Dragger } = Upload;

export default function ProduitMedia() {
  const uploadProps = {
    name: "file",
    multiple: true,
    action: "/api/media/upload/", // à adapter à votre backend
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} uploadé.`);
      } else if (status === "error") {
        message.error(`${info.file.name} erreur.`);
      }
    },
  };

  return (
    <Form.Item
      name="media"
      label="Images"
      valuePropName="fileList"
      getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
      extra="Cliquez ou déposez les fichiers ici"
    >
      <Dragger {...uploadProps} listType="picture">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Cliquer ou déposer des fichiers</p>
      </Dragger>
    </Form.Item>
  );
}
