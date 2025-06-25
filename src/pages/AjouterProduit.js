import { Button, Steps, message } from 'antd';
import { useState } from 'react';

import AttributsVariantes from './steps/AttributsVariantes';
import GestionVariantes from './steps/GestionVariantes';
import ImagesMedias from './steps/ImagesMedias';
import InfosGenerales from './steps/InfosGenerales';
import PrixStock from './steps/PrixStock';
import RevisionPublication from './steps/RevisionPublication';
import SpecificationsTechniques from './steps/SpecificationsTechniques';
const { Step } = Steps;

const AjouterProduit = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Ajoute un nouvel état pour les variantes
  const [productData, setProductData] = useState({
    infosGenerales: {},
    attributsVariantes: [],
    variantes: [], // <-- NOUVEAU
    imagesMedias: [],
    prixStock: {},
    specificationsTechniques: [],
  });

  const steps = [
    {
      title: 'Informations générales',
      content: <InfosGenerales data={productData.infosGenerales} onChange={(data) => updateData('infosGenerales', data)} />,
    },
    {
      title: 'Attributs et variantes',
      content: <AttributsVariantes data={productData.attributsVariantes} onChange={(data) => updateData('attributsVariantes', data)} />,
    },
    {
      title: 'Définir les variantes',
      content: (
        <GestionVariantes
          attributs={productData.attributsVariantes}
          data={productData.variantes}
          onChange={(data) => updateData('variantes', data)}
        />
      ),
    },
    {
      title: 'Images et médias',
      content: <ImagesMedias data={productData.imagesMedias} onChange={(data) => updateData('imagesMedias', data)} />,
    },
    {
      title: 'Prix et stock',
      content: <PrixStock data={productData.prixStock} onChange={(data) => updateData('prixStock', data)} />,
    },
    {
      title: 'Spécifications techniques',
      content: <SpecificationsTechniques data={productData.specificationsTechniques} onChange={(data) => updateData('specificationsTechniques', data)} />,
    },
    {
      title: 'Révision et publication',
      content: <RevisionPublication data={productData} onSubmit={handleSubmit} />,
    },
  ];

  function updateData(section, data) {
    setProductData(prev => ({ ...prev, [section]: data }));
  }

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  }

  function prev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  async function handleSubmit() {
    try {
      // TODO: appeler l’API de création produit avec productData complet
      message.success('Produit créé avec succès !');
      // redirection ou reset formulaire
    } catch (error) {
      message.error('Erreur lors de la création du produit');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div style={{ minHeight: 400, marginBottom: 24 }}>
        {steps[currentStep].content}
      </div>

      <div style={{ textAlign: 'right' }}>
        {currentStep > 0 && <Button style={{ marginRight: 8 }} onClick={prev}>Précédent</Button>}
        {currentStep < steps.length - 1 && <Button type="primary" onClick={next}>Suivant</Button>}
        {currentStep === steps.length - 1 && <Button type="primary" onClick={handleSubmit}>Publier</Button>}
      </div>
    </div>
  );
};

export default AjouterProduit;