import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Form, Space, Steps, message } from "antd";
import { useEffect, useState } from "react";

import * as produitService from "../../services/productService";
import StepAttributesSpecs from "./StepAttributesSpecs";
import StepGeneralInfo from "./StepGeneralInfo";
import StepMediaUpload from "./StepMediaUpload";
import StepPricingInventory from "./StepPricingInventory";

const { Step } = Steps;

export default function ProductCreationSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [optionsData, setOptionsData] = useState({
    categories: [],
    brands: [],
    productTypes: [],
    productAttributes: [],
    cleSpecifications: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoadingOptions(true);
        const [catRes, brandRes, ptRes, attrRes, cleSpecRes] = await Promise.all([
          produitService.fetchCategories(),
          produitService.fetchBrands(),
          produitService.fetchProductTypes(),
          produitService.fetchProductAttributes(),
          produitService.fetchCleSpecifications(),
        ]);
        setOptionsData({
          categories: catRes.data,
          brands: brandRes.data,
          productTypes: ptRes.data,
          productAttributes: attrRes.data,
          cleSpecifications: cleSpecRes.data,
        });
      } catch (e) {
        message.error("Erreur lors du chargement des options");
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  const steps = [
    { title: "Informations générales" },
    { title: "Attributs & spécifications" },
    { title: "Prix & inventaire" },
    { title: "Médias" },
  ];

  const next = async () => {
    let validateFields = [];
    if (currentStep === 0) {
      validateFields = [
        "name", "description", "category", "brand", "product_type", "web_id"
      ];
    } else if (currentStep === 2) {
      validateFields = ["retail_price", "store_price", "sku", "inventory_units"];
    }
    try {
      if (validateFields.length) {
        await form.validateFields(validateFields);
      }
      setCurrentStep(currentStep + 1);
    } catch {
      // Validation errors shown by AntD
    }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // If you need to process the values for the backend (handle images, format lists, etc.), do it here
      await produitService.createProduct(values);
      message.success("Produit créé avec succès !");
      form.resetFields();
      setCurrentStep(0);
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([field, errors]) => {
          form.setFields([{ name: field, errors }]);
        });
      }
      message.error("Erreur lors de la création du produit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions) return <div>Chargement…</div>;

  return (
    <>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true }}
        scrollToFirstError
      >
        {currentStep === 0 && <StepGeneralInfo options={optionsData} />}
        {currentStep === 1 && <StepAttributesSpecs options={optionsData} />}
        {currentStep === 2 && <StepPricingInventory />}
        {currentStep === 3 && <StepMediaUpload />}

        <Form.Item>
          <Space>
            {currentStep > 0 && (
              <Button onClick={prev} icon={<LeftOutlined />}>Précédent</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                type="primary"
                onClick={next}
                icon={<RightOutlined />}
              >
                Suivant
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={submitting}>
                Soumettre
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}
