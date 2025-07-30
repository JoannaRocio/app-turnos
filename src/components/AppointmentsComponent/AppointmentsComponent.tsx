import React, { useEffect, useState } from 'react';
import './AppointmentsComponent.scss';
import { Appointment } from '../../interfaces/Appointment';
import ConfirmModal from '../ConfirmModal/ConfirmModalComponent';
import AppointmentService from '../../services/AppointmentService';
import ProfessionalPanel from '../ProfessionalPanel/ProfessionalPanel';
import CalendarComponent from '../CalendarComponent/CalendarComponent';
import { Patient } from '../../interfaces/Patient';
import { Professional } from '../../interfaces/Professional';
import ClinicalHistoryComponent from '../ClinicalHistoryComponent/ClinicalHistory';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import ActionDropdown from '../ActionDropdown/ActionDropdown';

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

  const [apptToDelete, setApptToDelete] = useState<{
    appointmentId: number;
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

  const confirmDelete = (appt: any, time: string) => {
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
    appointmentId: 0,
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
  }, [professionals]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const openModalForTime = (time: string) => {
    const apptExists = getAppointmentForTime(time);
    const appointment = appointments.find((p) => p.patient.id === apptExists?.patient.id);
    const patient = patients.find((p) => p.id === apptExists?.patient.id);

    if (apptExists) {
      setIsEditMode(true);
      setCurrentAppointment(apptExists);

      setNameSearch(apptExists.patient.fullName ?? '');
      setDniSearch(apptExists.patient.documentNumber ?? '');

      setNewAppointment({
        appointmentId: apptExists.appointmentId,
        patientId: apptExists.patient.id ?? 0,
        documentNumber: apptExists.patient.documentNumber,
        time: time,
        reason: appointment?.reason ?? '-',
        notes: patient?.note ?? '-',
      });
    } else {
      setIsEditMode(false);
      setNewAppointment({
        appointmentId: 0,
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
    setIsUpdating(true);
    e.preventDefault();

    if (!newAppointment.patientId || !newAppointment.documentNumber || !newAppointment.time) {
      alert('Por favor, completá todos los campos obligatorios.');
      return;
    }

    const appointmentToSave = {
      patientDni: newAppointment.documentNumber,
      dateTime: `${selectedDate.toISOString().split('T')[0]}T${newAppointment.time}:00`,
      reason: newAppointment.reason,
      state: 'PENDIENTE',
      professionalId: selectedProfessional?.professionalId ?? professionals[0].professionalId,
      appointmentId: newAppointment.appointmentId,
    };

    try {
      if (isEditMode) {
        await AppointmentService.updateAppointment(newAppointment.appointmentId, appointmentToSave);
        if (selectedProfessional?.documentNumber) {
          onAppointmentsUpdate(selectedProfessional);
        }
      } else {
        await AppointmentService.createAppointment(appointmentToSave);
        if (selectedProfessional?.documentNumber) {
          onAppointmentsUpdate(selectedProfessional);
        }
      }

      setIsUpdating(false);
      closeModal();
    } catch (error) {
      setIsUpdating(false);
      alert(error);
    }
  };

  async function handleDeleteConfirmed(currentAppointment: any) {
    console.log(currentAppointment, 'handleDeleteConfirmed');

    try {
      console.log('entra al boton confirmed');
      await AppointmentService.deleteAppointment(currentAppointment?.id);
      alert('Turno eliminado correctamente.');
      setShowConfirm(false);
      setApptToDelete(null);
      if (selectedProfessional?.documentNumber) {
        onAppointmentsUpdate(selectedProfessional.documentNumber);
      }
    } catch (error) {
      setCurrentAppointment(null);
      console.error('Error eliminando el turno:', error);
      alert('Ocurrió un error al eliminar el turno.');
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
        <div>
          <h3 className="App-main-title text-white">Agenda de turnos</h3>
          <h4 className="schedule-title">
            <i className="fas fa-user-md"></i>
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
            <div className="col-2">
              <ProfessionalPanel
                professionals={professionals}
                onProfessionalSelect={handleProfessionalSelect}
                selectedProfessional={selectedProfessional}
              />
            </div>

            <div className="col-8">
              <table className="App-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>DNI</th>
                    <th>Asistencia</th>
                    <th>Obra Social</th>
                    {/* <th>Plan</th> */}
                    {/* <th>Teléfono</th> */}
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
                        style={{ cursor: !appt ? 'pointer' : 'default', fontSize: '1.3rem' }}
                      >
                        <td>{time}</td>
                        <td>{appt?.patient.fullName ?? '-'}</td>
                        <td>{appt?.patient.documentNumber ?? '-'}</td>
                        <td>{appt?.state ? '✔️' : appt ? '❌' : '-'}</td>
                        <td>{appt?.patient.healthInsuranceName ?? '-'}</td>
                        {/* <td>{appt?.patient.insurancePlan ?? "-"}</td> */}
                        {/* <td>{appt?.patient.phone ?? "-"}</td> */}
                        <td>{appt?.reason ?? '-'}</td>
                        <td>{appt?.patient.note ?? '-'}</td>
                        <td onClick={handleClick}>
                          <ActionDropdown
                            disabled={!appt}
                            isOpen={activeDropdownIndex === index}
                            onToggle={(isOpen) => setActiveDropdownIndex(isOpen ? index : null)}
                            onView={() => openClinicalHistory(appt)}
                            onEdit={() => openModalForTime(time)}
                            onDelete={() => confirmDelete(appt, time)}
                          />
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
                      console.log(apptToDelete, 'apptoDelete');
                      handleDeleteConfirmed(currentAppointment);
                    } else {
                      alert('No ha seleccionado ningún turno disponible.');
                    }
                  }}
                  onCancel={() => {
                    console.log(apptToDelete, 'apptoDelete');
                    setShowConfirm(false);
                    setApptToDelete(null);
                  }}
                />
              </table>

              {isModalOpen && (
                <div className={`modal-overlay ${isEditMode ? 'edit-mode' : ''}`}>
                  <div className={`custom-modal ${isEditMode ? 'edit-mode' : ''}`}>
                    <h2>{isEditMode ? 'Editar turno' : 'Nuevo Turno'}</h2>
                    <form onSubmit={handleSubmit} className="form-turno">
                      <div className="form-grid">
                        <label>
                          Paciente:
                          <input
                            type="text"
                            value={nameSearch}
                            readOnly={!!nameSearch}
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
                            readOnly={!!nameSearch}
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

            <div className="col-2">
              <CalendarComponent onDateSelect={handleDateSelect} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AppointmentsComponent;
