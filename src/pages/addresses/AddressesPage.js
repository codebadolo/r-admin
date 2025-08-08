import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  message,
  Row,
  Space,
  Spin,
  Table,
  Typography,
  Breadcrumb,
  Statistic,
  Flex,
} from "antd";
import {
  HomeOutlined,
  FileExcelOutlined,
  EyeOutlined,
  ProfileOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import * as XLSX from "xlsx";

const { Title } = Typography;

const generateFiltersFromList = (list) =>
  list.map((item) => ({ text: item.nom, value: item.id }));

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({ current: 1, pageSize: 11 });
  const [paysList, setPaysList] = useState([]);
  const [formesJuridique, setFormesJuridique] = useState([]);
  const [regimesFiscaux, setRegimesFiscaux] = useState([]);
  const [divisionsFiscales, setDivisionsFiscales] = useState([]);

  // Etats pour filtrage et tri AntD Table contrôlés
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paysRes, formesRes, regimesRes, divisionsRes, addressesRes] =
        await Promise.all([
          api.get("/users/pays/"),
          api.get("/users/formejuridiques/"),
          api.get("/users/regimefiscaux/"),
          api.get("/users/divisionfiscales/"),
          api.get("/users/adresses/"),
        ]);

      setPaysList(paysRes.data || []);
      setFormesJuridique(formesRes.data || []);
      setRegimesFiscaux(regimesRes.data || []);
      setDivisionsFiscales(divisionsRes.data || []);

      let adressesData = addressesRes.data || [];

      // Tri alphabétique croissant sur nom_complet
      adressesData.sort((a, b) =>
        (a.nom_complet || "").localeCompare(b.nom_complet || "", undefined, {
          sensitivity: "base",
        })
      );

      setAddresses(adressesData);
    } catch (error) {
      message.error("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

 const handleTableChange = (pagination, filters, sorter) => {
  setFilteredInfo(filters || {});
  setSortedInfo(sorter || {});
  setPagination(pagination);  // now using the pagination parameter
};

  // Export Excel fonctionnel
  const exportToExcel = () => {
    if (!addresses.length) {
      message.warning("Aucune donnée à exporter");
      return;
    }
    const dataToExport = addresses.map((a) => ({
      Utilisation: a.utilisation,
      "Type client": a.type_client,
      "Nom complet": a.nom_complet,
      Téléphone: a.telephone,
      "Raison sociale": a.raison_sociale,
      "Numéro TVA": a.numero_tva?.numero_tva || "",
      "Forme juridique": a.forme_juridique?.nom || "",
      "Régime fiscal": a.regime_fiscal?.nom || "",
      "Division fiscale": a.division_fiscale?.nom || "",
      Pays: a.pays?.nom || "",
      Ville: a.ville,
      "Code postal": a.code_postal,
      Rue: a.rue,
      Numéro: a.numero,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Adresses");
    XLSX.writeFile(workbook, "adresses_export.xlsx");
  };

  // Statistiques basiques à afficher
  const totalAddresses = addresses.length;

  const addressesByTypeClient = ["particulier", "entreprise"].map((type) => ({
    typeClient: type,
    count: addresses.filter((a) => a.type_client === type).length,
  }));

  const addressesByUtilisation = ["facturation", "livraison", "autre"].map((usage) => ({
    usage,
    count: addresses.filter((a) => a.utilisation === usage).length,
  }));

  // Colonnes avec filtres dans les headers
  const columns = [
    {
      title: "Utilisation",
      dataIndex: "utilisation",
      key: "utilisation",
      filters: [
        { text: "Facturation", value: "facturation" },
        { text: "Livraison", value: "livraison" },
        { text: "Autre", value: "autre" },
      ],
      filteredValue: filteredInfo.utilisation || null,
      onFilter: (value, record) => record.utilisation === value,
      ellipsis: true,
    },
    {
      title: "Type client",
      dataIndex: "type_client",
      key: "type_client",
      filters: [
        { text: "Particulier", value: "particulier" },
        { text: "Entreprise", value: "entreprise" },
      ],
      filteredValue: filteredInfo.type_client || null,
      onFilter: (value, record) => record.type_client === value,
      ellipsis: true,
    },
    {
      title: "Nom complet",
      dataIndex: "nom_complet",
      key: "nom_complet",
      sorter: (a, b) =>
        (a.nom_complet || "").localeCompare(b.nom_complet || "", undefined, {
          sensitivity: "base",
        }),
      sortOrder: sortedInfo.columnKey === "nom_complet" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone",
      ellipsis: true,
    },
    {
      title: "Raison sociale",
      dataIndex: "raison_sociale",
      key: "raison_sociale",
      ellipsis: true,
    },
    {
      title: "Numéro TVA",
      dataIndex: ["numero_tva", "numero_tva"],
      key: "numero_tva",
      render: (text) => text || "-",
      ellipsis: true,
    },
    {
      title: "Forme juridique",
      dataIndex: ["forme_juridique", "nom"],
      key: "forme_juridique",
  
      filteredValue: filteredInfo.forme_juridique_id || null,
      onFilter: (value, record) => (record.forme_juridique?.id ?? null) === value,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Régime fiscal",
      dataIndex: ["regime_fiscal", "nom"],
      key: "regime_fiscal",

      filteredValue: filteredInfo.regime_fiscal_id || null,
      onFilter: (value, record) => (record.regime_fiscal?.id ?? null) === value,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Division fiscale",
      dataIndex: ["division_fiscale", "nom"],
      key: "division_fiscale",

      filteredValue: filteredInfo.division_fiscale_id || null,
      onFilter: (value, record) => (record.division_fiscale?.id ?? null) === value,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Pays",
      dataIndex: ["pays", "nom"],
      key: "pays",
     
      filteredValue: filteredInfo.pays_id || null,
      onFilter: (value, record) => (record.pays?.id ?? null) === value,
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Ville",
      dataIndex: "ville",
      key: "ville",
      ellipsis: true,
    },
    {
      title: "Code postal",
      dataIndex: "code_postal",
      key: "code_postal",
      ellipsis: true,
    },
    {
      title: "action",
      key: "action",
      fixed: "right",
      width: 10,
      height: 10,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/users/${record.utilisateur}`)}
        >
         
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1800, margin: "auto", padding: 6 }}>
      {/* Breadcrumb */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
      <Col>
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Gestion des adresses</Breadcrumb.Item>
        </Breadcrumb>
      </Col>
      <Col>
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={exportToExcel}
          disabled={loading}
        >
          Exporter la liste en Excel
        </Button>
      </Col>
    </Row>
 
      {/* Cartes Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }} wrap={false}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total d'adresses"
              value={totalAddresses}
              prefix={<ProfileOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

          <Col span={4}>
          <Card>
            <Statistic
              title="Particuliers"
              value={addressesByTypeClient.find((a) => a.typeClient === "particulier")?.count || 0}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Entreprises"
              value={addressesByTypeClient.find((a) => a.typeClient === "entreprise")?.count || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

          <Col span={4}>
          <Card>
            <Statistic
              title="Facturation"
              value={addressesByUtilisation.find((a) => a.usage === "facturation")?.count || 0}
              prefix={<AuditOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>

           <Col span={4}>
          <Card>
            <Statistic
              title="Livraison"
              value={addressesByUtilisation.find((a) => a.usage === "livraison")?.count || 0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{  color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Autre utilisation"
              value={addressesByUtilisation.find((a) => a.usage === "autre")?.count || 0}
              prefix={<ProfileOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Export Excel bouton */}
     
      {/* Tableau */}
      <Spin spinning={loading} tip="Chargement des adresses...">
         <Table
           className="my-compact-table"
      columns={columns}
      dataSource={addresses}
      rowKey="id"

        size="small"
  pagination={pagination}
      scroll={{ x: "max-content"  }}
   onChange={handleTableChange}
      bordered
    />
      </Spin>
    </div>
  );
}
