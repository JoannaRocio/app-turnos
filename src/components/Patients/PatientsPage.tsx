import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Patient } from '../../interfaces/Patient';
import './PatientsPage.scss';
import PatientModalComponent from '../PatientModal/PatientModalComponent';
import PatientService from '../../services/PatientService';
import { useAuth } from '../../context/ContextAuth';
import ActionDropdown from '../shared/ActionDropdown/ActionDropdown';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import ClinicalHistoryComponent from '../ClinicalHistoryComponent/ClinicalHistory';
import { useDataContext } from '../../context/DataContext';
import { toast } from 'react-toastify';

interface Props {
  professionalId: number;
  reloadPatients: () => void;
}

const PatientsComponent: React.FC<Props> = ({ professionalId, reloadPatients }) => {
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
  const { patients } = useDataContext();

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
        isGuest: patientData.isGuest,
      };

      // Guardar paciente
      let updatedId: number | null = null;

      if (patientData.id) {
        const response = await PatientService.updatePatient(patientData.id, payload);
        updatedId = response.id; // 👈 el ID devuelto por el backend
        toast.success(response.message ?? 'Paciente actualizado con éxito');
      } else {
        const response = await PatientService.createPatient(payload);
        updatedId = response.id;
        toast.success(response.message ?? 'Paciente creado con éxito');
      }

      // Recargar pacientes y resaltar el actualizado/creado
      await reloadPatients();

      if (updatedId) {
        setHighlightedPatientId(updatedId);
        // Opcional: quitar el resaltado luego de unos segundos
        setTimeout(() => {
          setHighlightedPatientId(null);
        }, 10000);
      }
      setModalOpen(false);
      setSelectedPatient(null);

      // quitar el resaltado después de unos segundos
      setTimeout(() => {
        setHighlightedPatientId(null);
      }, 10000);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || // por si usás ResponseStatusException
        error?.response?.data?.error || // por si devolvés { error: '...' }
        error.message || // fallback: mensaje de Axios
        'Error al guardar el paciente';

      toast.error(backendMessage);
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
      isGuest: false,
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
        className="form-control mb-3 filter-input w-100"
        placeholder="Buscar por nombre o DNI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {sortedPatients.length === 0 ? (
        <p className="no-patients-message">No hay pacientes disponibles.</p>
      ) : (
        <div className="table-responsive">
          <table className="App-table">
            <thead>
              <tr>
                <th onClick={() => setSortByNameAsc((prev) => !prev)} style={{ cursor: 'pointer' }}>
                  Paciente {sortByNameAsc ? '▲' : '▼'}
                </th>
                <th>Tipo Documento</th>
                <th>DNI</th>
                <th>Obra Social y plan</th>
                <th>Teléfono</th>
                <th>Notas</th>
                <th>¿Es nuevo?</th>
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
                  <td>
                    <span className="ellipsis-cell" title={patient.fullName}>
                      {patient.fullName}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={patient.documentType || '-'}>
                      {patient.documentType || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={patient.documentNumber || '-'}>
                      {patient.documentNumber || '-'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="ellipsis-cell"
                      title={`${patient.healthInsuranceName || '-'}\n${patient.insurancePlanName || '-'}`}
                    >
                      {patient.healthInsuranceName || '-'}
                      <br />
                      {patient.insurancePlanName || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={patient.phone || '-'}>
                      {patient.phone || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={patient.note || '-'}>
                      {patient.note || '-'}
                    </span>
                  </td>
                  <td className="text-center">
                    {patient.isGuest == null ? (
                      '-'
                    ) : (
                      <div className="d-flex justify-content-center align-items-center guest-cell">
                        {/* Texto Sí/No */}
                        <span className="guest-text me-2">{patient.isGuest ? 'Sí' : 'No'}</span>
                        {/* El switch de Bootstrap */}
                        <div className="form-check form-switch guest-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`guestSwitch-${patient.id}`}
                            checked={patient.isGuest}
                            disabled={isUpdating}
                            onChange={() => {
                              if (isUpdating) return;
                              handleSave({ ...patient, isGuest: !patient.isGuest });
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`guestSwitch-${patient.id}`}
                            aria-label="Marcar como invitado"
                          />
                        </div>
                      </div>
                    )}
                  </td>
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
        </div>
      )}

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
