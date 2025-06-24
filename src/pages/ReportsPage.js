import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';

const { Title } = Typography;

const ReportsPage = () => (
  <>
    <Title level={2}>Statistiques & Rapports</Title>
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Ventes par catégorie" extra={<PieChartOutlined />}>
          {/* Intégrer un graphique ici */}
          <p>Graphique circulaire en construction...</p>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Commandes mensuelles" extra={<BarChartOutlined />}>
          {/* Intégrer un graphique ici */}
          <p>Graphique en barres en construction...</p>
        </Card>
      </Col>
    </Row>
  </>
);

export default ReportsPage;
