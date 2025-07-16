import { Form, Input } from "antd";

export default function StepPricingInventory() {
  return (
    <>
      <Form.Item
        label="Prix public"
        name="retail_price"
        rules={[{ required: true, message: "Le prix public est requis" }]}
      >
        <Input type="number" min={0} step="0.01" />
      </Form.Item>
      <Form.Item
        label="Prix magasin"
        name="store_price"
        rules={[{ required: true, message: "Le prix magasin est requis" }]}
      >
        <Input type="number" min={0} step="0.01" />
      </Form.Item>
      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: "Le SKU est requis" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Stock disponible"
        name="inventory_units"
        rules={[{ required: true, message: "Le stock est requis" }]}
      >
        <Input type="number" min={0} />
      </Form.Item>
    </>
  );
}
