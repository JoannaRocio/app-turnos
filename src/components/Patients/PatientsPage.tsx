import React, { useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientsPage.scss";
import PatientModalComponent from "../PatientModal/PatientModalComponent";
import PatientService from "../../services/PatientService";

const PatientsComponent: React.FC<{ patients: Patient[] }> = ({ patients }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);

    const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
    };

    // const handleSave = (updated: Patient) => {
    // console.log("Guardar cambios en paciente:", updated);
    // setShowEditModal(false);
    // setSelectedPatient(null);
    // // Aca podés llamar a tu API o actualizar el estado global si lo estás usando
    // };

    const filteredPatients = patients.filter((patient) => {
    const nameMatch = patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = patient.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
    });

    const handleSave = async (patientData: Partial<Patient>) => {
      try {
        if (patientData.id) {
          // Modo edición
          await PatientService.updatePatient(patientData.id, {
            fullName: patientData.fullName,
            documentType: patientData.documentType,
            documentNumber: patientData.documentNumber,
            phone: patientData.phone,
            healthInsurance: patientData.socialSecurity,
            insurancePlan: patientData.plan,
            note: patientData.notes,
          });
          alert("Paciente actualizado con éxito");
        } else {
          // Modo creación
          await PatientService.createPatient({
            fullName: patientData.fullName,
            documentType: patientData.documentType,
            documentNumber: patientData.documentNumber,
            phone: patientData.phone,
            healthInsurance: patientData.socialSecurity,
            insurancePlan: patientData.plan,
            note: patientData.notes,
            registrationDate: new Date().toISOString().split("T")[0], // o null si tu back lo maneja
          });
          alert("Paciente creado con éxito");
        }
    
        setShowEditModal(false);
        setSelectedPatient(null);
    
        // Opcional: recargar pacientes desde el backend (si tenés forma)
        // const updatedList = await PatientService.getAll();
        // setPatients(updatedList); // si tenés acceso desde el padre
      } catch (error) {
        console.error("Error al guardar el paciente", error);
        alert("Hubo un error al guardar el paciente");
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
        setShowEditModal(true);
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
            isOpen={showEditModal}
            patient={selectedPatient}
            onClose={() => setShowEditModal(false)}
            onSave={handleSave}
            />
        </section>
    );
};

export default PatientsComponent;

