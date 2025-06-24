import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Collapse, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Panel } = Collapse;
const { Title } = Typography;

const SpecificationsTechniques = ({ data = [], onChange }) => {
  const [specs, setSpecs] = useState(data);

  useEffect(() => {
    onChange(specs);
  }, [specs, onChange]);

  const addSection = () => {
    setSpecs([...specs, { sectionName: '', keys: [{ keyName: '', value: '' }] }]);
  };

  const updateSectionName = (index, value) => {
    const newSpecs = [...specs];
    newSpecs[index].sectionName = value;
    setSpecs(newSpecs);
  };

  const addKey = (sectionIndex) => {
    const newSpecs = [...specs];
    newSpecs[sectionIndex].keys.push({ keyName: '', value: '' });
    setSpecs(newSpecs);
  };

  const updateKey = (sectionIndex, keyIndex, field, value) => {
    const newSpecs = [...specs];
    newSpecs[sectionIndex].keys[keyIndex][field] = value;
    setSpecs(newSpecs);
  };

  const removeKey = (sectionIndex, keyIndex) => {
    const newSpecs = [...specs];
    newSpecs[sectionIndex].keys.splice(keyIndex, 1);
    setSpecs(newSpecs);
  };

  const removeSection = (index) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  return (
    <>
      <Title level={4}>Spécifications techniques</Title>
      <Button type="dashed" icon={<PlusOutlined />} onClick={addSection} style={{ marginBottom: 16 }}>
        Ajouter une section
      </Button>
      <Collapse accordion>
        {specs.map((section, i) => (
          <Panel
            header={
              <Input
                placeholder="Nom de la section"
                value={section.sectionName}
                onChange={(e) => updateSectionName(i, e.target.value)}
                style={{ width: '70%', marginRight: 8 }}
              />
            }
            key={i}
            extra={
              <Button danger size="small" onClick={(e) => { e.stopPropagation(); removeSection(i); }}>
                Supprimer
              </Button>
            }
          >
            {section.keys.map((keyItem, j) => (
              <Space key={j} style={{ display: 'flex', marginBottom: 8 }} align="start">
                <Input
                  placeholder="Clé"
                  value={keyItem.keyName}
                  onChange={(e) => updateKey(i, j, 'keyName', e.target.value)}
                  style={{ width: 200 }}
                />
                <Input.TextArea
                  placeholder="Valeur"
                  value={keyItem.value}
                  onChange={(e) => updateKey(i, j, 'value', e.target.value)}
                  rows={1}
                  style={{ width: 400 }}
                />
                <Button danger icon={<DeleteOutlined />} onClick={() => removeKey(i, j)} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => addKey(i)} icon={<PlusOutlined />}>
              Ajouter une clé
            </Button>
          </Panel>
        ))}
      </Collapse>
    </>
  );
};

export default SpecificationsTechniques;
