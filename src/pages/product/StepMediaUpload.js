import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Upload } from "antd";

export default function StepMediaUpload() {
  return (
    <Form.Item label="Images du produit" name="images">
      <Upload
        listType="picture-card"
        beforeUpload={() => false} // handle upload after submit
        multiple
      >
        <Button icon={<UploadOutlined />}>Ajouter une image</Button>
      </Upload>
    </Form.Item>
  );
}
