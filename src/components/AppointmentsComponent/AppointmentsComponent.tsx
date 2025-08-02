import React, { useEffect, useState } from 'react';
import './AppointmentsComponent.scss';
import { Appointment } from '../../interfaces/Appointment';
import ConfirmModal from '../shared/ConfirmModal/ConfirmModalComponent';
import AppointmentService from '../../services/AppointmentService';
import ProfessionalPanel from '../ProfessionalPanel/ProfessionalPanel';
import CalendarComponent from '../CalendarComponent/CalendarComponent';
import { Patient } from '../../interfaces/Patient';
import { Professional } from '../../interfaces/Professional';
import ClinicalHistoryComponent from '../ClinicalHistoryComponent/ClinicalHistory';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import ActionDropdown from '../shared/ActionDropdown/ActionDropdown';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useIsMobile } from '../../hooks/useIsMobile';
import clsx from 'clsx';

interface Props {
  patients: Patient[];
  professionals: Professional[];
  appointments: Appointment[];
  onAppointmentsUpdate: (selectedProfessional: any) => void;
}

const generateTimeSlots = (): string[] => {
  const start = 9 * 60;
  const end = 18 * 60 + 30;
  const slots: string[] = [];

  for (let time = start; time <= end; time += 30) {
    const hours = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (time % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
  }

  return slots;
};

const AppointmentsComponent: React.FC<Props> = ({
  appointments,
  patients,
  professionals,
  onAppointmentsUpdate,
}) => {
  const timeSlots = generateTimeSlots();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [dniSearch, setDniSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [clinicalHistoryData, setClinicalHistoryData] = useState<ClinicalHistoryEntry[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const isMobile = useIsMobile();

  const [, setApptToDelete] = useState<{
    id: number;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    onAppointmentsUpdate(professional);
  };

  const appointmentsForSelectedDate = appointments.filter((appt) =>
    appt.dateTime.startsWith(selectedDate.toISOString().split('T')[0])
  );

  const getDayOfWeekString = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  };

  const filteredProfessionals = professionals.filter((pro) =>
    pro.schedules?.some((s) => s.dayOfWeek === getDayOfWeekString(selectedDate))
  );

  const confirmDelete = (appt: any) => {
    setCurrentAppointment(appt);
    setShowConfirm(true);
  };

  const openClinicalHistory = async (appt: any) => {
    try {
      const data = await ClinicalHistoryService.getOrCreate(appt.patient, appt.professionalId);
      setShowClinicalHistory(true);
      setClinicalHistoryData(data);
      setPatientData(appt.patient);
    } catch (error) {
      console.error('Error al obtener o crear la historia clínica:', error);
    }
  };

  const [newAppointment, setNewAppointment] = useState({
    id: 0,
    patientId: 0,
    documentNumber: '',
    time: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && currentAppointment?.patient) {
      setNameSearch(currentAppointment.patient.fullName ?? '');
      setDniSearch(currentAppointment.patient.documentNumber ?? '');

      setNewAppointment((prev) => ({
        ...prev,
        patientId: currentAppointment?.patient.id ?? 0,
        documentNumber: currentAppointment?.patient.documentNumber ?? '',
      }));
    } else {
      setNameSearch('');
      setDniSearch('');
    }
  }, [isModalOpen, isEditMode, currentAppointment]);

  useEffect(() => {
    if (isEditMode) return;

    const matchByName = nameSearch
      ? patients.find((p) => p.fullName?.toLowerCase().includes(nameSearch.toLowerCase()))
      : null;

    const matchByDni = dniSearch
      ? patients.find((p) => p.documentNumber?.includes(dniSearch))
      : null;

    if (matchByName && !dniSearch) {
      setNewAppointment((prev) => ({
        ...prev,
        patientId: matchByName.id ?? 0,
        documentNumber: matchByName.documentNumber ?? '',
        patientName: matchByName.fullName ?? '',
      }));
      setDniSearch(matchByName.documentNumber ?? '');
    } else if (matchByDni && !nameSearch) {
      setNewAppointment((prev) => ({
        ...prev,
        patientId: matchByDni.id ?? 0,
        documentNumber: matchByDni.documentNumber ?? '',
        patientName: matchByDni.fullName ?? '',
      }));
      setNameSearch(matchByDni.fullName ?? '');
    }
  }, [nameSearch, dniSearch, patients, isEditMode]);

  useEffect(() => {
    if (!selectedProfessional && professionals.length > 0) {
      setSelectedProfessional(professionals[0]);
    }
  }, [professionals, selectedProfessional]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const openModalForTime = (time: string) => {
    // Evita abrir el modal si no hay profesionales activos
    if (filteredProfessionals.length === 0) {
      toast.warning('No hay profesionales activos disponibles para esta fecha.');
      return;
    }

    const apptExists = getAppointmentForTime(time);
    const patient = patients.find((p) => p.id === apptExists?.patient.id);

    if (apptExists) {
      setIsEditMode(true);
      setCurrentAppointment(apptExists);

      setNameSearch(apptExists.patient.fullName ?? '');
      setDniSearch(apptExists.patient.documentNumber ?? '');

      setNewAppointment({
        id: apptExists.id,
        patientId: apptExists.patient.id ?? 0,
        documentNumber: apptExists.patient.documentNumber,
        time: time,
        reason: apptExists?.reason ?? '-',
        notes: patient?.note ?? '-',
      });
    } else {
      setIsEditMode(false);
      setNewAppointment({
        id: 0,
        patientId: 0,
        documentNumber: '',
        time: time,
        reason: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getAppointmentForTime = (time: string) => {
    return appointmentsForSelectedDate.find((appt) => appt.dateTime.includes(`T${time}`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAppointment.patientId || !newAppointment.documentNumber || !newAppointment.time) {
      toast.error('Por favor, completá todos los campos obligatorios.');
      return;
    }

    setIsUpdating(true);

    const dateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${newAppointment.time}:00`;
    const appointmentToSave = {
      id: newAppointment.id, // si el backend lo requiere
      patientId: newAppointment.patientId,
      patientDni: newAppointment.documentNumber,
      dateTime: dateTime,
      reason: newAppointment.reason,
      state: 'PENDIENTE',
      professionalId: selectedProfessional?.professionalId ?? professionals[0].professionalId,
      notes: newAppointment.notes,
    };

    try {
      if (isEditMode) {
        await AppointmentService.updateAppointment(newAppointment.id, appointmentToSave);
      } else {
        await AppointmentService.createAppointment(appointmentToSave);
      }

      toast.success(
        isEditMode ? 'Turno actualizado correctamente.' : 'Turno creado correctamente.'
      );

      if (selectedProfessional?.documentNumber) {
        onAppointmentsUpdate(selectedProfessional);
      }

      closeModal();
    } catch (error: any) {
      handleBackendError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  async function handleDeleteConfirmed(currentAppointment: any) {
    try {
      await AppointmentService.deleteAppointment(currentAppointment?.id);
      toast.success('Turno eliminado correctamente.');
      setShowConfirm(false);
      setApptToDelete(null);

      if (selectedProfessional?.documentNumber) {
        onAppointmentsUpdate(selectedProfessional);
      }
    } catch (error: any) {
      setCurrentAppointment(null);
      handleBackendError(error, 'Ocurrió un error al eliminar el turno.');
    }
  }

  function handleBackendError(error: any, fallbackMessage = 'Ocurrió un error') {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 304 || status === 204) {
      toast.info('No se realizaron modificaciones.');
    } else {
      const message = data?.message || data?.error || fallbackMessage;
      toast.error(message);
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p?.fullName?.toLowerCase().includes(nameSearch.toLowerCase()) &&
      p?.documentNumber?.includes(dniSearch)
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <section>
        <div className="text-md-start px-2">
          <h3 className="App-main-title text-white">Agenda de turnos</h3>
          <h4 className="schedule-title">
            <i className="fas fa-user-md me-2"></i>
            {selectedProfessional?.professionalName ?? professionals[0]?.professionalName}
            {' - '}
            {selectedDate.toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h4>
        </div>
      </section>
      {showClinicalHistory && patientData && selectedProfessional?.professionalId !== undefined ? (
        <ClinicalHistoryComponent
          data={clinicalHistoryData}
          patient={patientData}
          professionalId={selectedProfessional?.professionalId}
          onBack={() => setShowClinicalHistory(false)}
        />
      ) : (
        <section className="container-fluid">
          <div className="row">
            {/* Panel izquierdo */}
            <div className="col-12 col-md-2">
              <ProfessionalPanel
                professionals={professionals}
                onProfessionalSelect={handleProfessionalSelect}
                selectedProfessional={selectedProfessional}
              />
            </div>
            {/* Tabla central */}
            <div className="col-12 col-md-8 order-2">
              <div className={clsx('App-table-wrapper', { 'table-responsive': isMobile })}>
                <table className="App-table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>DNI</th>
                      <th>Asistencia</th>
                      <th>Obra Social</th>
                      <th>Motivo</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, index) => {
                      const appt = getAppointmentForTime(time);

                      return (
                        <tr
                          key={index}
                          onClick={() => openModalForTime(time)}
                          className={!appt ? 'clickable-row' : ''}
                          title={appt?.reason ?? '-'}
                          style={{ cursor: !appt ? 'pointer' : 'default' }}
                        >
                          <td className="truncate-cell">{time}</td>
                          <td className="truncate-cell">{appt?.patient.fullName ?? '-'}</td>
                          <td className="truncate-cell">{appt?.patient.documentNumber ?? '-'}</td>
                          <td className="truncate-cell">{appt?.state ?? '-'}</td>
                          <td className="truncate-cell">
                            {appt?.patient.healthInsuranceName ?? '-'}
                          </td>
                          <td className="truncate-cell">{appt?.reason ?? '-'}</td>
                          <td className="truncate-cell">{appt?.patient.note ?? '-'}</td>
                          <td className="action-cell" onClick={handleClick}>
                            <div className="dropdown-container">
                              <ActionDropdown
                                disabled={!appt}
                                isOpen={activeDropdownIndex === index}
                                onToggle={(isOpen) => setActiveDropdownIndex(isOpen ? index : null)}
                                onView={() => openClinicalHistory(appt)}
                                onEdit={() => openModalForTime(time)}
                                onDelete={() => confirmDelete(appt)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <ConfirmModal
                    isOpen={showConfirm}
                    title="Confirmar eliminación"
                    message={`¿Estás segura que deseas eliminar el turno de "${currentAppointment?.patient.fullName}"?`}
                    onConfirm={() => {
                      if (currentAppointment) {
                        handleDeleteConfirmed(currentAppointment);
                      } else {
                        alert('No ha seleccionado ningún turno disponible.');
                      }
                    }}
                    onCancel={() => {
                      setShowConfirm(false);
                      setApptToDelete(null);
                    }}
                  />
                </table>

                {isModalOpen && (
                  <div className={`modal-overlay ${isEditMode ? 'edit-mode' : ''}`}>
                    <div className={`custom-modal ${isEditMode ? 'edit-mode' : ''}`}>
                      <div className="modal-header">
                        <button
                          type="button"
                          className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                          aria-label="Cerrar"
                          onClick={() => setIsModalOpen(false)}
                        />
                      </div>
                      <h2>{isEditMode ? 'Editar turno' : 'Nuevo Turno'}</h2>
                      <form onSubmit={handleSubmit} className="form-turno">
                        <div className="form-grid">
                          <label>
                            Paciente:
                            <input
                              type="text"
                              value={nameSearch}
                              readOnly={!!nameSearch && isEditMode}
                              onChange={(e) => {
                                setNameSearch(e.target.value);
                                if (!isEditMode) setDniSearch('');
                              }}
                              list="patientsByName"
                              placeholder="Escribí el nombre"
                            />
                            <datalist id="patientsByName">
                              {filteredPatients.map((p) => (
                                <option key={p.id} value={p.fullName} />
                              ))}
                            </datalist>
                          </label>

                          <label>
                            DNI:
                            <input
                              type="text"
                              value={dniSearch}
                              readOnly={!!dniSearch && isEditMode}
                              onChange={(e) => {
                                setDniSearch(e.target.value);
                                if (!isEditMode) setNameSearch('');
                              }}
                              list="patientsByDni"
                              placeholder="Escribí el DNI"
                            />
                            <datalist id="patientsByDni">
                              {filteredPatients.map((p) => (
                                <option key={p.id} value={p.documentNumber} />
                              ))}
                            </datalist>
                          </label>

                          <label>
                            Profesional:
                            <select
                              value={selectedProfessional?.professionalId || ''}
                              onChange={(e) => {
                                const pro = professionals.find(
                                  (p) => p.professionalId === Number(e.target.value)
                                );
                                if (pro) {
                                  setSelectedProfessional(pro);
                                }
                              }}
                            >
                              <option value="">Seleccioná un profesional</option>
                              {filteredProfessionals.map((pro) => (
                                <option key={pro.professionalId} value={pro.professionalId}>
                                  {pro.professionalName}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            Hora:
                            <select name="time" value={newAppointment.time} onChange={handleChange}>
                              {timeSlots.map((time) => (
                                <option
                                  key={time}
                                  value={time}
                                  disabled={!!getAppointmentForTime(time)}
                                >
                                  {time}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="full-width">
                            Motivo:
                            <input
                              type="text"
                              name="reason"
                              value={newAppointment.reason}
                              onChange={handleChange}
                            />
                          </label>

                          <label className="full-width">
                            Notas:
                            <textarea
                              name="notes"
                              value={newAppointment.notes}
                              onChange={handleChange}
                            />
                          </label>
                        </div>

                        <div className="d-flex justify-content-center align-items-center">
                          <button className="modal-buttons" type="submit" disabled={isUpdating}>
                            {isEditMode ? 'Actualizar' : 'Guardar'}
                          </button>
                          <button className="modal-buttons" type="button" onClick={closeModal}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Calendario */}
            <div className="col-12 col-md-2 order-1 order-md-2">
              <CalendarComponent onDateSelect={handleDateSelect} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AppointmentsComponent;
