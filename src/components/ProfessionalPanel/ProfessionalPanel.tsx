import React from 'react';
import './ProfessionalPanel.scss';
import { Professional } from '../../interfaces/Professional';

interface Props {
  professionals: Professional[];
  onProfessionalSelect: (professional: Professional) => void;
  selectedProfessional?: Professional;
}

const ProfessionalPanel: React.FC<Props> = ({
  professionals,
  onProfessionalSelect,
  selectedProfessional,
}) => {
  const handleRowClick = (professional: Professional) => {
    onProfessionalSelect(professional);
  };

  return (
    <div className="professional-panel">
      {professionals.map((pro: Professional) => (
        <div
          key={pro.professionalId}
          className={`professional-card ${
            selectedProfessional?.professionalId === pro.professionalId ? 'active' : ''
          }`}
          onClick={() => handleRowClick(pro)}
        >
          <img src="/images/profile-pic.png" alt="Foto perfil" />
          <div className="info">
            <p className="name">{pro.professionalName}</p>
            <p className="dni">DNI: {pro.documentNumber}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfessionalPanel;
