import { Form, InputNumber, Typography } from 'antd';
import { useEffect } from 'react';

const { Title } = Typography;

const PrixStock = ({ data = {}, onChange }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  const onValuesChange = (_, allValues) => {
    onChange(allValues);
  };

  return (
    <>
      <Title level={4}>Prix et Stock</Title>
      <Form form={form} layout="vertical" onValuesChange={onValuesChange} initialValues={data}>
        <Form.Item name="retail_price" label="Prix de détail (€)" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="store_price" label="Prix boutique (€)" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="stock_units" label="Stock disponible" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Form>
    </>
  );
};

export default PrixStock;
