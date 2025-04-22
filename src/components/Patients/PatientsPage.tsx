import React, { useEffect, useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientsPage.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";
import PatientService from "../../services/PatientService";

const PatientsComponent: React.FC<{ patients: Patient[]; reloadPatients: () => void }> = ({ patients, reloadPatients }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);
    // const [patient, setPatient] = useState<Patient[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    // const [showEditModal, setShowEditModal] = useState(false);

    const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
    };

    const filteredPatients = patients.filter((p) => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = p.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    });
    
    const handleSave = async (patientData: Partial<Patient>) => {
      try {
        if (patientData.id) {
          // await PatientService.updatePatient(patientData.id, { ... });
          await PatientService.updatePatient(patientData.id, patientData);

          alert("Paciente actualizado con éxito");
        } else {
          // await PatientService.createPatient({ ... });
          console.log(patientData, 'patientdata')
          await PatientService.createPatient(patientData);

          alert("Paciente creado con éxito");
        }
    
        await reloadPatients(); // <-- primero recargás
        setModalOpen(false);    // <-- luego cerrás el modal
        setSelectedPatient(null);
        // setShowEditModal(false);
      } catch (error) {
        console.log("error al crear paciente. aa");
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
          socialSecurity: "",
          plan: "",
          notes: "",
        };
        setSelectedPatient(emptyPatient);
        setModalOpen(true);
      };

    return (
        <section>
            <div className="d-flex">
                <h3 className="text-white">Pacientes</h3>
                <button className="btn btn-light btn-nuevo"  onClick={handleNewPatient}>Nuevo</button>
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
                    <td>{patient?.socialSecurity || "-"}</td>
                    <td>{patient?.plan || "-"}</td>
                    <td>{patient?.phone || "-"}</td>
                    <td>{patient?.notes || "-"}</td>
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

