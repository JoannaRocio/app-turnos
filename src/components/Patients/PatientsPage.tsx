import React, { useEffect, useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientsPage.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";
import PatientService from "../../services/PatientService";
import { useAuth } from "../../context/ContextAuth";

const PatientsComponent: React.FC<{ patients: Patient[]; reloadPatients: () => void }> = ({ patients, reloadPatients }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { userRole } = useAuth();
    const role = userRole ?? "";

    const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
    };

    if (!patients) {
      return <p className="text-white">Cargando pacientes...</p>;
    }
    const filteredPatients = patients.filter((p) => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = p.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    })
    
    const handleSave = async (patientData: Partial<Patient>) => {
      try {
        if (patientData.id) {
          await PatientService.updatePatient(patientData.id, patientData);

          alert("Paciente actualizado con éxito");
        } else {
          await PatientService.createPatient(patientData);

          alert("Paciente creado con éxito");
        }
    
        reloadPatients();
        setModalOpen(false);
        setSelectedPatient(null);

      } catch (error) {
        console.log(error)
      }
    };

      const handleNewPatient = () => {
        const emptyPatient: Partial<Patient> = {
          id: 0,
          fullName: "",
          documentType: "",
          documentNumber: "",
          phone: "",
          healthInsurance: "",
          insurancePlan: "",
          note: "",
        };
        setSelectedPatient(emptyPatient);
        setModalOpen(true);
      };

      if (!patients || patients.length === 0) {
        return <p className="text-white">No hay pacientes disponibles.</p>;
      }

    return (

        <section>
            <h2 className="text-white">Listado de pacientes</h2>

            <div className="d-flex">
                <h3 className="text-white">Pacientes</h3>
                {role !== "USUARIO" && (
                  <button className="btn btn-light btn-nuevo" onClick={handleNewPatient}>
                    Nuevo
                  </button>
                )}
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
                <th>Paciente</th>
                <th>Tipo Documento</th>
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
                    <td>{patient.documentType || "-"}</td>
                    <td>{patient.documentNumber || "-"}</td>
                    <td>{patient?.healthInsurance || "-"}</td>
                    <td>{patient?.insurancePlan || "-"}</td>
                    <td>{patient?.phone || "-"}</td>
                    <td>{patient?.note || "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>

            <PatientModalComponent
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              patient={selectedPatient}
              onSave={handleSave}
            />
        </section>
    );
};

export default PatientsComponent;

