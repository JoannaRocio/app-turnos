import React from "react";
import "./ProfessionalPanel.scss";
import { Professional } from "../../interfaces/Professional";

interface Props {
    professionals: Professional[];
    onProfessionalSelect: (professional: Professional) => void;
  }

const ProfessionalPanel: React.FC<Props> = ({ professionals, onProfessionalSelect }) => {

    const handleRowClick = (professional: Professional) => {
        onProfessionalSelect(professional); // ← acá se envía al padre
        };

    return (
        <div className="professional-panel">
            {professionals.map((pro: Professional) => (
                <div key={pro.professionalId} className="professional-card" onClick={() => handleRowClick(pro)}>
                    <img src="/images/profile-pic.png" alt="Foto perfil" />
                    <div className="info">
                        <p className="name">{pro.professionalName}</p>
                        <p className="dni">DNI: {pro.professionalDni}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfessionalPanel;
