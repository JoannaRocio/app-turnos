import React, { useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientsPage.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";

const PatientsComponent: React.FC<{ patients: Patient[] }> = ({ patients }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
    };

    const handleSave = (updated: Patient) => {
    console.log("Guardar cambios en paciente:", updated);
    setShowEditModal(false);
    setSelectedPatient(null);
    // Aca podés llamar a tu API o actualizar el estado global si lo estás usando
    };

    const filteredPatients = patients.filter((patient) => {
    const nameMatch = patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = patient.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    });

    return (
        <section>
            <h3 className="text-white">Pacientes</h3>

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
                <th>Paciente</th>
                <th>DNI</th>
                <th>Obra Social</th>
                <th>Plan</th>
                <th>Teléfono</th>
                <th>Notas</th>
                </tr>
            </thead>
            <tbody>
                {filteredPatients.map((patient, index) => (
                <tr key={index} onClick={() => handleRowClick(patient)} className="clickable-row">
                    <td>{patient.fullName || "-"}</td>
                    <td>{patient.documentNumber || "-"}</td>
                    <td>{patient?.socialSecurity || "-"}</td>
                    <td>{patient?.plan || "-"}</td>
                    <td>{patient?.phone || "-"}</td>
                    <td>{patient?.notes || "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>

            <PatientModalComponent
            isOpen={showEditModal}
            patient={selectedPatient}
            onClose={() => setShowEditModal(false)}
            onSave={handleSave}
            />
        </section>
    );
};

export default PatientsComponent;
