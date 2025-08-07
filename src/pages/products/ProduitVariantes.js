import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row } from "antd";

export default function ProduitVariantes({ varianteCount, setVarianteCount }) {
  return (
    <>
      {[...Array(varianteCount)].map((_, i) => (
        <div key={i} style={{border: "1px solid #ddd", padding: 12, marginBottom: 15, borderRadius: 6}}>
          <h4>Variante #{i + 1}</h4>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["variants", i, "sku"]}
                label="SKU"
                rules={[{ required: true, message: "SKU requis" }]}
              >
                <Input placeholder="ex: SKU123" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["variants", i, "upc"]}
                label="UPC (facultatif)"
              >
                <Input placeholder="Code UPC" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["variants", i, "retail_price"]}
                label="Prix public"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber min={0} style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["variants", i, "store_price"]}
                label="Prix boutique"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber min={0} style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["variants", i, "stock"]}
                label="Stock initial"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <InputNumber min={0} style={{width: "100%"}} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ))}

      <Button
        type="dashed"
        onClick={() => setVarianteCount(varianteCount + 1)}
        block
        icon={<PlusOutlined />}
      >
        Ajouter une variante
      </Button>
    </>
  );
}
