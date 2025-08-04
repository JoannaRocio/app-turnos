import React from 'react';
import './ProfessionalPanel.scss';
import { Professional } from '../../interfaces/Professional';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  activeProfessionals: Professional[];
  onProfessionalSelect: (professional: Professional) => void;
  selectedProfessional?: Professional;
}

const ProfessionalPanel: React.FC<Props> = ({
  activeProfessionals,
  onProfessionalSelect,
  selectedProfessional,
}) => {
  const handleRowClick = (professional: Professional) => {
    onProfessionalSelect(professional);
  };

  const isMobile = useIsMobile();

  return (
    <div className="professional-panel">
      {activeProfessionals.length === 0 ? (
        <div className="no-professionals-message">
          No hay profesionales cargados actualmente. <br />
          El usuario <strong>Administrador</strong> puede cargar uno desde la pestaña
          <strong>"Profesionales"</strong>.
        </div>
      ) : isMobile ? (
        // Vista MOBILE: dropdown
        <select
          className="form-select"
          value={selectedProfessional?.professionalId || ''}
          onChange={(e) => {
            const selected = activeProfessionals.find(
              (p) => p.professionalId === Number(e.target.value)
            );
            if (selected) onProfessionalSelect(selected);
          }}
        >
          <option value="">Seleccioná un profesional</option>
          {activeProfessionals.map((pro) => (
            <option key={pro.professionalId} value={pro.professionalId}>
              {pro.professionalName} - DNI: {pro.documentNumber}
            </option>
          ))}
        </select>
      ) : (
        // Vista DESKTOP: cards
        activeProfessionals.map((pro) => (
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
        ))
      )}
    </div>
  );
};

export default ProfessionalPanel;
