import { Input, message, Modal, Select } from 'antd';
import { useState } from 'react';

const { Option } = Select;

const CreatableSelect = ({ options, onCreate, value, onChange, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSelect = (val) => {
    if (val === '__add_new__') {
      setNewName('');
      setModalVisible(true);
    } else {
      onChange(val);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      message.error('Le nom ne peut pas être vide');
      return;
    }
    try {
      const newItem = await onCreate(newName.trim());
      onChange(newItem.id); // sélectionner automatiquement le nouvel item
      setModalVisible(false);
      message.success(`${newItem.name} ajouté avec succès`);
    } catch (error) {
      message.error('Erreur lors de la création');
      console.error(error);
    }
  };

  return (
    <>
      <Select
        showSearch
        placeholder={placeholder}
        value={value}
        onChange={handleSelect}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        style={{ width: '100%' }}
      >
        {options.map(opt => (
          <Option key={opt.id} value={opt.id}>
            {opt.name}
          </Option>
        ))}
        <Option key="__add_new__" value="__add_new__" style={{ fontWeight: 'bold' }}>
          + Ajouter nouveau
        </Option>
      </Select>

      <Modal
        title={`Ajouter une nouvelle ${placeholder.toLowerCase()}`}
        visible={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        okText="Ajouter"
      >
        <Input
          placeholder={`Nom de la nouvelle ${placeholder.toLowerCase()}`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onPressEnter={handleCreate}
        />
      </Modal>
    </>
  );
};

export default CreatableSelect;
