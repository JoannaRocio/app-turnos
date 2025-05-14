import React, { createContext, useContext, useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./ProfessionalsComponent.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";
import { Professional } from "../../interfaces/Professional";
import ProfessionalService from "../../services/ProfessionalService";
import ProfessionalModal from "../ProfessionalModal/ProfessionalModal";
import { User } from "../../interfaces/User";
import { useAuth } from "../../context/ContextAuth";

interface Props {
    professionals: Professional[];
    onProfessionalSelect: () => void;
  }

const ProfessionalsComponent: React.FC<{ professionals: Professional[], reloadProfessional: () => void }> = ({ professionals, reloadProfessional }) => {
    const [searchTerm, setSearchTerm] = useState("");
    // const [selectedProfessional, setSelectedProfessional] = useState<Partial<Professional>>();
    const [selectedProfessional, setSelectedProfessional] = useState<Partial<Professional> | null>(null);
    const { userRole } = useAuth();
    const isUsuario = userRole === "USUARIO";
    const [showEditModal, setShowEditModal] = useState(false);

    const handleRowClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowEditModal(true);
    };

    const handleSave = async (professionalData: Partial<Professional>) => {
        try {
          if (professionalData.professionalId) {
            await ProfessionalService.updateProfessional(professionalData.professionalId, professionalData);
  
            alert("Paciente actualizado con éxito");
          } else {
            await ProfessionalService.createProfessional(professionalData);
  
            alert("Paciente creado con éxito");
          }
      
          reloadProfessional();
          setShowEditModal(false);
          setSelectedProfessional(null);
  
        } catch (error) {
          console.log(error)
        }
      };

    const handleNewProfessional = () => {
        const emptyProfessional: Partial<Professional> = {
            professionalId: 0,
            professionalName: "",
            documentType: "",
            professionalDni: "",
            phone: "",
            shiftStart: "",
            shiftEnd: "",
            unavailableHours: "",
            specialties: ""
        };
        setSelectedProfessional(emptyProfessional);
        setShowEditModal(true);
      };

    const filteredProfessional = professionals.filter((professional) => {
    const nameMatch = professional.professionalName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = professional.professionalDni?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    });

    return (
        <section>
            <h2 className="text-white">Listado de profesionales</h2>

            <div className="d-flex">
                <h3 className="text-white">Profesionales</h3>
                {!isUsuario && (
                  <button className="btn btn-light btn-nuevo" onClick={handleNewProfessional}>
                    Nuevo
                  </button>
                )}
                {/* <button className="btn btn-light btn-nuevo"  onClick={handleNewProfessional}>Nuevo</button> */}
            </div>

            <input
            type="text"
            className="form-control mb-3 filter-input"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="appointments-table">
            <thead>
                <tr>
                <th>Nombre</th>
                <th>Tipo documento</th>
                <th>Numero documento</th>
                <th>Teléfono</th>
                <th>Hora inicio de jornada</th>
                <th>Hora fin de jornada</th>
                <th>Horario no disponible</th>
                <th>Especialidades</th>
                </tr>
            </thead>
            <tbody>
                {filteredProfessional.map((professional, index) => (
                    <tr 
                    key={index} 
                    onClick={() => {
                      if (!isUsuario) handleRowClick(professional);
                    }}
                    className={!isUsuario ? "clickable-row" : ""}
                    // onClick={() => handleRowClick(professional)} 
                    // className="clickable-row"
                    >
                    <td>{professional?.professionalName || "-"}</td>
                    <td>{professional?.documentType || "-"}</td>
                    <td>{professional?.professionalDni || "-"}</td>
                    <td>{professional?.phone || "-"}</td>
                    <td>{professional?.shiftStart || "-"}</td>
                    <td>{professional?.shiftEnd || "-"}</td>
                    <td>{professional?.unavailableHours || "-"}</td>
                    <td>{Array.isArray(professional?.specialties) ? professional.specialties.join(', ') : professional?.specialties || "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <ProfessionalModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                professional={selectedProfessional}
                onSave={handleSave}
            />
        </section>
    );
};

export default ProfessionalsComponent;
