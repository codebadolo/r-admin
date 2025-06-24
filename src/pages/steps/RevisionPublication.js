import { Button, Card, Descriptions, Typography } from 'antd';

const { Title } = Typography;

const RevisionPublication = ({ data, onSubmit }) => {
  return (
    <>
      <Title level={4}>Révision et publication</Title>

      <Card title="Informations générales" style={{ marginBottom: 16 }}>
        <Descriptions column={1}>
          <Descriptions.Item label="Nom">{data.infosGenerales?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Description">{data.infosGenerales?.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="Catégorie">{data.infosGenerales?.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="Marque">{data.infosGenerales?.brand || '-'}</Descriptions.Item>
          <Descriptions.Item label="Type">{data.infosGenerales?.productType || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Attributs et variantes" style={{ marginBottom: 16 }}>
        {data.attributsVariantes?.length ? (
          data.attributsVariantes.map((attr, i) => (
            <p key={i}>
              <b>{attr.attribute}</b>: {attr.value}
            </p>
          ))
        ) : (
          <p>Aucun attribut</p>
        )}
      </Card>

      <Card title="Images et médias" style={{ marginBottom: 16 }}>
        {data.imagesMedias?.length ? (
          data.imagesMedias.map((file) => (
            <img
              key={file.uid || file.name}
              src={file.url || file.thumbUrl || URL.createObjectURL(file.originFileObj)}
              alt={file.name}
              style={{ width: 100, marginRight: 8 }}
            />
          ))
        ) : (
          <p>Aucune image</p>
        )}
      </Card>

      <Card title="Prix et stock" style={{ marginBottom: 16 }}>
        <p>Prix de détail : {data.prixStock?.retail_price || '-'}</p>
        <p>Prix boutique : {data.prixStock?.store_price || '-'}</p>
        <p>Stock disponible : {data.prixStock?.stock_units || '-'}</p>
      </Card>

      <Card title="Spécifications techniques" style={{ marginBottom: 16 }}>
        {data.specificationsTechniques?.length ? (
          data.specificationsTechniques.map((section, i) => (
            <div key={i}>
              <h4>{section.sectionName}</h4>
              {section.keys.map((keyItem, j) => (
                <p key={j}>
                  <b>{keyItem.keyName}</b>: {keyItem.value}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p>Aucune spécification</p>
        )}
      </Card>

      <Button type="primary" onClick={onSubmit}>
        Publier le produit
      </Button>
    </>
  );
};

export default RevisionPublication;
