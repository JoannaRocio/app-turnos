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
import { useDataContext } from '../../context/DataContext';

interface Props {
  professionalId: number;
  reloadPatients: () => void;
}

const PatientsComponent: React.FC<Props> = ({ professionalId }) => {
  const { patients, loadPatients, reloadPatients } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isUsuario = role === 'USUARIO';
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [clinicalHistoryData, setClinicalHistoryData] = useState<ClinicalHistoryEntry[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const filteredPatients = patients.filter((p) => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = p.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
  });

  const openClinicalHistory = async (patient: Patient) => {
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
    setIsUpdating(true);
    try {
      const payload = {
        id: patientData.id,
        fullName: patientData.fullName,
        documentType: patientData.documentType,
        documentNumber: patientData.documentNumber,
        phone: patientData.phone,
        email: patientData.email,
        note: patientData.note,
        healthInsuranceId:
          patientData.healthInsuranceId === 0 ? null : patientData.healthInsuranceId,
        insurancePlanId: patientData.insurancePlanId === 0 ? null : patientData.insurancePlanId,
      };

      if (patientData.id) {
        await PatientService.updatePatient(patientData.id, payload);
        alert('Paciente actualizado con éxito');
      } else {
        await PatientService.createPatient(payload);
        alert('Paciente creado con éxito');
      }

      await reloadPatients();
      setModalOpen(false);
      setSelectedPatient(null);
      setIsUpdating(false);
    } catch (error) {
      setIsUpdating(false);
      console.error('Error al guardar paciente:', error);
    }
  };

  const handleNewPatient = () => {
    const emptyPatient: Partial<Patient> = {
      id: 0,
      fullName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      healthInsuranceName: '',
      insurancePlanName: '',
      note: '',
    };
    setSelectedPatient(emptyPatient);
    setModalOpen(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (patients.length === 0) {
    return <p className="text-white">No hay pacientes disponibles.</p>;
  }

  return (
    <section>
      <div className="d-flex justify-content-between">
        <h3 className="App-main-title text-white">Listado de pacientes</h3>
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

      <table className="App-table">
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
              <td>{patient?.healthInsuranceName || '-'}</td>
              <td>{patient?.insurancePlanName || '-'}</td>
              <td>{patient?.phone || '-'}</td>
              <td>{patient?.note || '-'}</td>
              <td onClick={handleClick}>
                <ActionDropdown
                  disabled={!patient}
                  isOpen={activeDropdownIndex === index}
                  onToggle={(isOpen) => setActiveDropdownIndex(isOpen ? index : null)}
                  onView={() => openClinicalHistory(patient)}
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
        isUpdating={isUpdating}
      />
    </section>
  );
};

export default PatientsComponent;
