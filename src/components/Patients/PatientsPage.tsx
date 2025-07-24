import React, { useEffect, useState } from 'react';
import { Patient } from '../../interfaces/Patient';
import './PatientsPage.scss';
import PatientModalComponent from '../PatientModal/PatientModalComponent';
import PatientService from '../../services/PatientService';
import { useAuth } from '../../context/ContextAuth';
import ActionDropdown from '../ActionDropdown/ActionDropdown';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import { Appointment } from '../../interfaces/Appointment';
import ClinicalHistoryComponent from '../ClinicalHistoryComponent/ClinicalHistory';

const PatientsComponent: React.FC<{
  patients: Patient[];
  professionalId: number;
  reloadPatients: () => void;
}> = ({ patients, professionalId, reloadPatients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isUsuario = userRole === 'USUARIO';
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [clinicalHistoryData, setClinicalHistoryData] = useState<ClinicalHistoryEntry[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);

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
  });

  const openClinicalHistory = async (patient: any) => {
    try {
      const data = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      setShowClinicalHistory(true);
      setClinicalHistoryData(data);
      setPatientData(patient);
    } catch (error) {
      console.error('Error al obtener o crear la historia clínica:', error);
    }
  };

  const handleSave = async (patientData: Partial<Patient>) => {
    try {
      console.log(patientData.id, 'paciente id');
      if (patientData.id) {
        await PatientService.updatePatient(patientData.id, patientData);

        alert('Paciente actualizado con éxito');
      } else {
        await PatientService.createPatient(patientData);

        alert('Paciente creado con éxito');
      }

      reloadPatients();
      setModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewPatient = () => {
    const emptyPatient: Partial<Patient> = {
      id: 0,
      fullName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      healthInsurance: '',
      insurancePlan: '',
      note: '',
    };
    setSelectedPatient(emptyPatient);
    setModalOpen(true);
  };

  if (!patients || patients.length === 0) {
    return <p className="text-white">No hay pacientes disponibles.</p>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 🔐 Esto evita que el click llegue al <tr>
  };

  if (showClinicalHistory && patientData) {
    return (
      <ClinicalHistoryComponent
        data={clinicalHistoryData}
        patient={patientData}
        professionalId={professionalId}
        onBack={() => setShowClinicalHistory(false)}
      />
    );
  }

  return (
    <section>
      <h2 className="text-white">Listado de pacientes</h2>

      <div className="d-flex justify-content-between">
        <h3 className="text-white">Pacientes</h3>
        {role !== 'USUARIO' && (
          <button className="btn App-buttonTertiary" onClick={handleNewPatient}>
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((patient, index) => (
            <tr
              key={index}
              onClick={() => {
                if (!isUsuario) handleRowClick(patient);
              }}
              className={!isUsuario ? 'clickable-row' : ''}
              // onClick={() => handleRowClick(patient)}
              // className="clickable-row"
            >
              <td>{patient.fullName || '-'}</td>
              <td>{patient.documentType || '-'}</td>
              <td>{patient.documentNumber || '-'}</td>
              <td>{patient?.healthInsurance || '-'}</td>
              <td>{patient?.insurancePlan || '-'}</td>
              <td>{patient?.phone || '-'}</td>
              <td>{patient?.note || '-'}</td>
              <td onClick={handleClick}>
                <ActionDropdown
                  disabled={!patient}
                  isOpen={activeDropdownIndex === index}
                  onToggle={(isOpen) => setActiveDropdownIndex(isOpen ? index : null)}
                  onView={() => openClinicalHistory(patient)}
                  // onEdit={() => openModalForTime(time)}
                  // onDelete={() => confirmDelete(patient)}
                />
              </td>
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
