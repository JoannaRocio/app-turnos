import React from "react";
import { useNavigate } from "react-router-dom";
import "./BranchSelector.scss"; // (opcional, si querés estilos separados)

const BranchSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectBranch = (branch: string) => {
    // Guardar en localStorage o contexto si lo necesitás en otras partes
    localStorage.setItem("selectedBranch", branch);
    
    // Redirigir al home o a otra ruta
    navigate("/Home");
  };

  return (
    <div className="branch-selector-container">
      <h2 className="text-white">Sucursales disponibles:</h2>
      <div className="branch-buttons">
        <button className="btn btn-primary btn-branch" onClick={() => handleSelectBranch("Puerto Madero")}>
          Puerto Madero
        </button>
        <button className="btn btn-primary btn-branch" onClick={() => handleSelectBranch("Rafael Castillo")}>
          Casanova
        </button>
      </div>
    </div>
  );
};

export default BranchSelector;
