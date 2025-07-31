import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Patient } from '../../interfaces/Patient';
import './PatientsPage.scss';
import PatientModalComponent from '../PatientModal/PatientModalComponent';
import PatientService from '../../services/PatientService';
import { useAuth } from '../../context/ContextAuth';
import ActionDropdown from '../ActionDropdown/ActionDropdown';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import ClinicalHistoryComponent from '../ClinicalHistoryComponent/ClinicalHistory';
import { useDataContext } from '../../context/DataContext';
import { toast } from 'react-toastify';

interface Props {
  professionalId: number;
  reloadPatients: () => void;
}

const PatientsComponent: React.FC<Props> = ({ professionalId }) => {
  const { patients, reloadPatients } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Partial<Patient> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [clinicalHistoryData, setClinicalHistoryData] = useState<ClinicalHistoryEntry[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortByNameAsc, setSortByNameAsc] = useState(true);
  const [highlightedPatientId, setHighlightedPatientId] = useState<number | null>(null);

  const filteredPatients = patients.filter((p) => {
    const nameMatch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dniMatch = p.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
  });

  const sortedPatients = useMemo(() => {
    return filteredPatients.slice().sort((a, b) => {
      const nameA = a.fullName?.toLowerCase() ?? '';
      const nameB = b.fullName?.toLowerCase() ?? '';
      return sortByNameAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [filteredPatients, sortByNameAsc]);

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

  const openPatientModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
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
        affiliateNumber: patientData.affiliateNumber === 0 ? null : patientData.affiliateNumber,
      };

      // Guardar paciente
      if (patientData.id) {
        await PatientService.createPatient(payload);
        toast.success('Paciente actualizado con éxito');
      } else {
        await PatientService.createPatient(payload);
        toast.success('Paciente creado con éxito');
      }

      //  Recargar datos y cerrar modal
      await reloadPatients();
      setTimeout(() => {
        const latest = patients.reduce((max, p) => (p.id > max.id ? p : max), patients[0]);
        if (latest?.id) {
          setHighlightedPatientId(latest.id);
        }
      }, 300);
      setModalOpen(false);
      setSelectedPatient(null);

      // quitar el resaltado después de unos segundos
      setTimeout(() => {
        setHighlightedPatientId(null);
      }, 10000);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el paciente');
      console.error('Error al guardar paciente:', error);
    } finally {
      setIsUpdating(false); // se ejecuta siempre, haya error o no
    }
  };

  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (highlightedPatientId && rowRefs.current[highlightedPatientId]) {
      rowRefs.current[highlightedPatientId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedPatientId]);

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
            <th onClick={() => setSortByNameAsc((prev) => !prev)} style={{ cursor: 'pointer' }}>
              Paciente {sortByNameAsc ? '▲' : '▼'}
            </th>
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
          {sortedPatients.map((patient, index) => (
            <tr
              key={patient.id}
              ref={(el) => {
                if (patient.id != null) {
                  rowRefs.current[patient.id] = el;
                }
              }}
              className={patient.id === highlightedPatientId ? 'highlighted-row' : ''}
            >
              <td>{patient.fullName}</td>
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
                  onEdit={() => openPatientModal(patient)}
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
