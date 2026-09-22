import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Typography, Breadcrumb, Row, Col, message, Rate } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import * as reviewService from '../../services/reviewService';

const { Title } = Typography;
const { confirm } = Modal;

const AvisPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await reviewService.fetchReviews();
      setReviews(res.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await reviewService.approveReview(id);
      message.success('Avis approuvé');
      await loadData();
    } catch (error) {
      message.error("Erreur lors de l'approbation");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Supprimer cet avis ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await reviewService.deleteReview(id);
          message.success('Avis supprimé');
          await loadData();
        } catch (error) {
          message.error('Impossible de supprimer cet avis');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Produit',
      key: 'product',
      render: (_, record) => record.product?.name,
    },
    {
      title: 'Client',
      key: 'user',
      render: (_, record) => record.user?.nom_complet,
    },
    {
      title: 'Note',
      dataIndex: 'rating',
      key: 'rating',
      render: (v) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} />,
    },
    { title: 'Commentaire', dataIndex: 'comment', key: 'comment', ellipsis: true },
    {
      title: 'Statut',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (v) => (v ? <Tag color="green">Approuvé</Tag> : <Tag color="orange">En attente</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          {!record.is_approved && (
            <Button type="link" onClick={() => handleApprove(record.id)}>
              Approuver
            </Button>
          )}
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Supprimer
          </Button>
        </>
      ),
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
            <Breadcrumb.Item>Avis produits</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Modération des avis
          </Title>
        </Col>
      </Row>

      <Table dataSource={reviews} columns={columns} rowKey="id" loading={loading} size="small" bordered />
    </div>
  );
};

export default AvisPage;
