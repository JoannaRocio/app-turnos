import React, { useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./ProfessionalsComponent.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";
import { Professional } from "../../interfaces/Professional";

interface Props {
    professionals: Professional[];
}

const ProfessionalsComponent: React.FC<{ professionals: Professional[] }> = ({ professionals }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleRowClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowEditModal(true);
    };

    const handleSave = (updated: Patient) => {
    console.log("Guardar cambios en profesional:", updated);
    setShowEditModal(false);
    setSelectedProfessional(null);
    // Aca podés llamar a tu API o actualizar el estado global si lo estás usando
    };

    const filteredProfessional = professionals.filter((professional) => {
    const nameMatch = professional.professionalName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = professional.dni?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    });

    return (
        <section>
            <h3 className="text-white">Profesionales</h3>

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
                    <tr key={index} onClick={() => handleRowClick(professional)} className="clickable-row">
                    <td>{professional?.professionalName || "-"}</td>
                    <td>{professional?.documentType || "-"}</td>
                    <td>{professional?.dni || "-"}</td>
                    <td>{professional?.phone || "-"}</td>
                    <td>{professional?.shiftStart || "-"}</td>
                    <td>{professional?.shiftEnd || "-"}</td>
                    <td>{professional?.unavailableHours || "-"}</td>
                    <td>{Array.isArray(professional?.specialties) ? professional.specialties.join(', ') : professional?.specialties || "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* <PatientModalComponent
            isOpen={showEditModal}
            patient={selectedProfessional}
            onClose={() => setShowEditModal(false)}
            onSave={handleSave}
            /> */}
        </section>
    );
};

export default ProfessionalsComponent;
