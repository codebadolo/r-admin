import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";

const { Option } = Select;

export default function StepAttributesSpecs({ options }) {
  const { productAttributes, cleSpecifications } = options;
  return (
    <>
      <Form.List name="attributes">
        {(fields, { add, remove }) => (
          <>
            <h4>Attributs</h4>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="baseline" style={{ marginBottom: 8 }}>
                <Form.Item
                  {...restField}
                  name={[name, "product_attribute"]}
                  rules={[{ required: true, message: "Attribut requis" }]}
                >
                  <Select placeholder="Choisir un attribut">
                    {productAttributes.map((attr) => (
                      <Option key={attr.id} value={attr.id}>{attr.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  rules={[{ required: true, message: "Valeur requise" }]}
                >
                  <Input placeholder="Valeur" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Ajouter un attribut
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.List name="specifications">
        {(fields, { add, remove }) => (
          <>
            <h4>Spécifications</h4>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="baseline" style={{ marginBottom: 8 }}>
                <Form.Item
                  {...restField}
                  name={[name, "cle_specification"]}
                  rules={[{ required: true, message: "Clé requise" }]}
                >
                  <Select placeholder="Choisir une clé">
                    {cleSpecifications.map((spec) => (
                      <Option key={spec.id} value={spec.id}>{spec.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  rules={[{ required: true, message: "Valeur requise" }]}
                >
                  <Input placeholder="Valeur" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Ajouter une spécification
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}
