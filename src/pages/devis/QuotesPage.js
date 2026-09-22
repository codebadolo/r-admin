import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Typography,
  Breadcrumb,
  Row,
  Col,
  message,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import * as quoteService from '../../services/quoteService';

const { Title } = Typography;

const STATUS_LABELS = {
  pending: 'En attente',
  answered: 'Répondu',
  accepted: 'Accepté',
  rejected: 'Refusé',
  converted: 'Converti en commande',
};

const STATUS_COLORS = {
  pending: 'gold',
  answered: 'blue',
  accepted: 'green',
  rejected: 'red',
  converted: 'purple',
};

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingQuote, setRespondingQuote] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await quoteService.fetchQuotes();
      setQuotes(res.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRespond = (quote) => {
    setRespondingQuote(quote);
    const values = {};
    quote.items.forEach((item) => {
      values[`item_${item.id}`] = item.proposed_unit_price_ht ?? item.catalog_unit_price_ht;
    });
    values.admin_note = quote.admin_note;
    form.setFieldsValue(values);
  };

  const closeRespond = () => {
    setRespondingQuote(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const items = respondingQuote.items.map((item) => ({
      id: item.id,
      proposed_unit_price_ht: values[`item_${item.id}`],
    }));
    try {
      setLoading(true);
      await quoteService.respondToQuote(respondingQuote.id, { items, admin_note: values.admin_note });
      message.success('Réponse envoyée au client');
      closeRespond();
      await loadData();
    } catch (error) {
      message.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Devis', dataIndex: 'id', key: 'id', render: (id) => `#${id}` },
    {
      title: 'Client',
      key: 'client',
      render: (_, record) => record.user?.nom_complet || record.user?.email,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d) => new Date(d).toLocaleString(),
    },
    { title: 'Articles', key: 'items', render: (_, record) => record.items?.length || 0 },
    {
      title: 'Total HT',
      dataIndex: 'total_ht',
      key: 'total_ht',
      render: (v) => `${Number(v || 0).toFixed(2)} €`,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v] || v}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' || record.status === 'answered' ? (
          <Button type="link" onClick={() => openRespond(record)}>
            Répondre
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Devis</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Demandes de devis
          </Title>
        </Col>
      </Row>

      <Table dataSource={quotes} columns={columns} rowKey="id" loading={loading} size="small" bordered />

      <Modal
        title={respondingQuote ? `Répondre au devis #${respondingQuote.id}` : ''}
        open={!!respondingQuote}
        onCancel={closeRespond}
        onOk={() => form.submit()}
        okText="Envoyer la réponse"
        destroyOnClose
        confirmLoading={loading}
      >
        {respondingQuote && (
          <>
            {respondingQuote.message && (
              <p style={{ color: '#888' }}>Message du client : « {respondingQuote.message} »</p>
            )}
            <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
              {respondingQuote.items.map((item) => (
                <Form.Item
                  key={item.id}
                  label={`${item.quantity} × ${item.product.name} (catalogue : ${item.catalog_unit_price_ht} €)`}
                  name={`item_${item.id}`}
                  rules={[{ required: true, message: 'Prix requis' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€ HT / unité" />
                </Form.Item>
              ))}
              <Form.Item label="Note pour le client" name="admin_note">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default QuotesPage;
