import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space } from "antd";

export default function ProduitSpecifications() {
  return (
    <Form.List name="specifications">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
              <Form.Item {...restField} name={[name, "section"]} rules={[{ required: true }]}>
                <Input placeholder="Section" />
              </Form.Item>
              <Form.Item {...restField} name={[name, "key"]} rules={[{ required: true }]}>
                <Input placeholder="Clé" />
              </Form.Item>
              <Form.Item {...restField} name={[name, "value"]} rules={[{ required: true }]}>
                <Input placeholder="Valeur" />
              </Form.Item>
              <Button onClick={() => remove(name)} danger type="link">
                Supprimer
              </Button>
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              Ajouter spécification
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}
