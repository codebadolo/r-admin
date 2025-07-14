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

  // État global du produit
  const [productData, setProductData] = useState({
    infosGenerales: {},
    attributsVariantes: [],
    variantes: [],
    imagesMedias: [],
    prixStock: {},
    specificationsTechniques: [],
  });

  // Fonction pour mettre à jour une section du state
  function updateData(section, data) {
    setProductData(prev => ({ ...prev, [section]: data }));
  }

  // Navigation
  function next() {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  }
  function prev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  // Soumission finale
  async function handleSubmit() {
    try {
      // TODO: Appeler l’API de création produit avec productData complet
      message.success('Produit créé avec succès !');
      // Redirection ou reset du formulaire ici
    } catch (error) {
      message.error('Erreur lors de la création du produit');
    }
  }

  // Steps du wizard
  const steps = [
    {
      title: 'Informations générales',
      content: (
        <InfosGenerales
          data={productData.infosGenerales}
          onChange={data => updateData('infosGenerales', data)}
        />
      ),
    },
    {
      title: 'Attributs et valeurs',
      content: (
        <AttributsVariantes
          data={productData.attributsVariantes}
          onChange={data => updateData('attributsVariantes', data)}
        />
      ),
    },
    {
      title: 'Définir les variantes',
      content: (
        <GestionVariantes
          attributs={productData.attributsVariantes}
          data={productData.variantes}
          imagesMedias={productData.imagesMedias}
          onChange={data => updateData('variantes', data)}
        />
      ),
    },
    {
      title: 'Images et médias',
      content: (
        <ImagesMedias
          data={productData.imagesMedias}
          onChange={data => updateData('imagesMedias', data)}
        />
      ),
    },
    {
      title: 'Prix et stock',
      content: (
        <PrixStock
          data={productData.prixStock}
          onChange={data => updateData('prixStock', data)}
        />
      ),
    },
    {
      title: 'Spécifications techniques',
      content: (
        <SpecificationsTechniques
          data={productData.specificationsTechniques}
          onChange={data => updateData('specificationsTechniques', data)}
        />
      ),
    },
    {
      title: 'Révision et publication',
      content: (
        <RevisionPublication
          data={productData}
          onSubmit={handleSubmit}
        />
      ),
    },
  ];

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
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Précédent
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Suivant
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" onClick={handleSubmit}>
            Publier
          </Button>
        )}
      </div>
    </div>
  );
};

export default AjouterProduit;
