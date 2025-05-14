import React, { useEffect, useState } from "react";
import "./AppointmentsComponent.scss";
import { Appointment } from "../../interfaces/Appointment";
import { IoIosExpand, IoIosRemoveCircleOutline } from "react-icons/io";
import ConfirmModal from "../ConfirmModal/ConfirmModalComponent";
import AppointmentService from "../../services/AppointmentService";
import ProfessionalPanel from "../ProfessionalPanel/ProfessionalPanel";
import CalendarComponent from "../CalendarComponent/CalendarComponent";
import { Patient } from "../../interfaces/Patient";
import { Professional } from "../../interfaces/Professional";
import Dropdown from "react-bootstrap/esm/Dropdown";
import { FiMoreVertical } from "react-icons/fi";
import ClinicalHistoryComponent from "../ClinicalHistoryComponent/ClinicalHistory";
import { ClinicalHistoryEntry } from "../../interfaces/ClinicalHistoryEntry";
import ClinicalHistoryService from "../../services/ClinicalHistoryService";
import ActionDropdown from "../ActionDropdown/ActionDropdown";

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
    const hours = Math.floor(time / 60).toString().padStart(2, "0");
    const minutes = (time % 60).toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
  }

  return slots;
};

const AppointmentsComponent: React.FC<Props> = ({ appointments, patients, professionals, onAppointmentsUpdate }) => {
  const timeSlots = generateTimeSlots();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [dniSearch, setDniSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [clinicalHistoryData, setClinicalHistoryData] = useState<ClinicalHistoryEntry[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  
  const [apptToDelete, setApptToDelete] = useState<{
    appointmentId: number;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // const handleProfessionalSelected = async (selected: Professional) => {
  //   console.log(selected, 'handleProfessionalSelected')
  //   setSelectedProfessional(selected.professionalDni);
  //   onAppointmentsUpdate(selected.professionalDni);
  // };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    onAppointmentsUpdate(professional);
  };

  const appointmentsForSelectedDate = appointments.filter(appt =>
    appt.dateTime.startsWith(selectedDate.toISOString().split("T")[0])
  );

  const confirmDelete = (appt: any, time: string) => {
    setCurrentAppointment(appt)
    setShowConfirm(true);
  };   
  
  const openClinicalHistory = async (appt: any) => {
    try {
      const data = await ClinicalHistoryService.getOrCreate(appt.patient, appt.professionalId);
      setShowClinicalHistory(true);
      setClinicalHistoryData(data);
      setPatientData(appt.patient); 
    } catch (error) {
      console.error("Error al obtener o crear la historia clínica:", error);
    }
  };

  const [newAppointment, setNewAppointment] = useState({
    appointmentId: 0,
    patientId: 0,
    documentNumber: "",
    time: "",
    reason: "",
    notes: ""
  });

  useEffect(() => {
    if (isEditMode && currentAppointment) {
      console.log(currentAppointment, 'currentAppointment')
      const patient = patients.find(p => p.id === currentAppointment.patient.id);
      if (patient) {
        setNameSearch(patient.fullName);
        setDniSearch(patient.documentNumber);
      }
    } else {
      setNameSearch("");
      setDniSearch("");
    }
  }, [isModalOpen, isEditMode, currentAppointment, patients]);

  useEffect(() => {
    const matchByName = patients.find(p =>
      nameSearch && p.fullName?.toLowerCase().includes(nameSearch.toLowerCase())
    );
    const matchByDni = patients.find(p =>
      dniSearch && p.documentNumber?.includes(dniSearch)
    );
  
    if (matchByName && !dniSearch) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByName.id,
        documentNumber: matchByName.documentNumber,
        patientName: matchByName.fullName
      }));
      setDniSearch(matchByName.documentNumber);
    } else if (matchByDni && !nameSearch) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByDni.id,
        documentNumber: matchByDni.documentNumber,
        patientName: matchByDni.fullName
      }));
      setNameSearch(matchByDni.fullName);
    }
  }, [nameSearch, dniSearch, patients]);
  
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const openModalForTime = (time: string) => {
    const apptExists = getAppointmentForTime(time);
    const appointment = appointments.find(p => p.patient.id === apptExists?.patient.id);
    const patient = patients.find(p => p.id === apptExists?.patient.id);
  
    if (apptExists) {
      setIsEditMode(true);
      setNewAppointment({
        appointmentId: apptExists.appointmentId,
        patientId: 0,
        documentNumber: apptExists.patient.documentNumber,
        time: time,
        reason: appointment?.reason ?? "-",
        notes: patient?.note ?? "-"
      });
    } else {
      setIsEditMode(false);
      setNewAppointment({
        appointmentId: 0,
        patientId: 0,
        documentNumber: "",
        time: time,
        reason: "",
        notes: "",
      });
    }
  
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getAppointmentForTime = (time: string) => {
    return appointmentsForSelectedDate.find(appt =>
      appt.dateTime.includes(`T${time}`)
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newAppointment.documentNumber || !newAppointment.time || !newAppointment.reason) {
      alert("Por favor, completá todos los campos obligatorios.");
      return;
    }
  
    const appointmentToSave = {
      patientDni: newAppointment.documentNumber,
      dateTime: `${selectedDate.toISOString().split("T")[0]}T${newAppointment.time}:00`,
      reason: newAppointment.reason,
      state: "PENDIENTE",
      professionalId: selectedProfessional?.professionalId ?? professionals[0].professionalId,
      appointmentId: newAppointment.appointmentId
    };
  
    try {
  
      if (isEditMode) {
        await AppointmentService.updateAppointment(newAppointment.appointmentId, appointmentToSave);
        onAppointmentsUpdate(selectedProfessional);
      } else {
        await AppointmentService.createAppointment(appointmentToSave);
        onAppointmentsUpdate(selectedProfessional);
      }
  
      closeModal();
  
    } catch (error) {
      alert(error);
    }
  };

  async function handleDeleteConfirmed(currentAppointment: any) {
    console.log(currentAppointment, 'handleDeleteConfirmed')

    try {
      console.log('entra al boton confirmed')
      await AppointmentService.deleteAppointment(currentAppointment?.id);
      alert("Turno eliminado correctamente.");
      setShowConfirm(false);
      setApptToDelete(null);
      onAppointmentsUpdate(selectedProfessional);
    } catch (error) {
      setCurrentAppointment(null)
      console.error("Error eliminando el turno:", error);
      alert("Ocurrió un error al eliminar el turno.");
    }
  }
  

  const filteredPatients = patients.filter((p) =>
    p?.fullName?.toLowerCase().includes(nameSearch.toLowerCase()) &&
    p?.documentNumber?.includes(dniSearch)
  );


    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 🔐 Esto evita que el click llegue al <tr>
    };

  
  return (
    <>
    <section>
      <h2 className="text-white">Agenda de turnos</h2>
      <h3 className="text-white">
        {selectedProfessional?.professionalName ?? professionals[0]?.professionalName} {selectedDate.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
      </h3>
    </section>

    {showClinicalHistory && patientData && selectedProfessional?.professionalId !== undefined ? (
      <ClinicalHistoryComponent data={clinicalHistoryData} patient={patientData} professionalId={selectedProfessional?.professionalId} onBack={() => setShowClinicalHistory(false)} />
      ) : (
      
      <section className="container-fluid">

          <div className="row">
            <div className="col-2">
              <ProfessionalPanel professionals={professionals} 
                onProfessionalSelect={handleProfessionalSelect}/>
            </div>

            <div className="col-8">
              <table className="appointments-table">
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
                        className={!appt ? "clickable-row" : ""}
                        style={{ cursor: !appt ? "pointer" : "default", fontSize:'1.3rem' }}
                      >
                        <td>{time}</td>
                        <td>{appt?.patient.fullName ?? "-"}</td>
                        <td>{appt?.patient.documentNumber ?? "-"}</td>
                        <td>{appt?.state ? "✔️" : appt ? "❌" : "-"}</td>
                        <td>{appt?.patient.healthInsurance ?? "-"}</td>
                        {/* <td>{appt?.patient.insurancePlan ?? "-"}</td> */}
                        {/* <td>{appt?.patient.phone ?? "-"}</td> */}
                        <td>{appt?.reason ?? "-"}</td>
                        <td>{appt?.patient.note ?? "-"}</td>
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
                      console.log(apptToDelete,'apptoDelete')
                      handleDeleteConfirmed(currentAppointment);
                    }
                    else {
                      alert("No ha seleccionado ningún turno disponible.")
                    }
                  } }
                  onCancel={() => {
                    console.log(apptToDelete,'apptoDelete')
                    setShowConfirm(false);
                    setApptToDelete(null);
                  } } />

              </table>

              {isModalOpen && (
                <div className={`modal-overlay ${isEditMode ? "edit-mode" : ""}`}>
                  <div className={`modal ${isEditMode ? "edit-mode" : ""}`}>
                    <h2>{isEditMode ? "Editar turno" : "Nuevo Turno"}</h2>
                    <form onSubmit={handleSubmit}>

                      <label>
                        Paciente:
                        <input
                          type="text"
                          value={nameSearch}
                          onChange={(e) => {
                            setNameSearch(e.target.value);
                            setDniSearch(""); // resetea el otro buscador
                          } }
                          list="patientsByName"
                          placeholder="Escribí el nombre" />
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
                          readOnly={!!nameSearch} // Solo lectura si hay nombre seleccionado
                          onChange={(e) => {
                            setDniSearch(e.target.value);
                            setNameSearch(""); // resetea el otro buscador
                          } }
                          list="patientsByDni"
                          placeholder="Escribí el DNI" />
                        <datalist id="patientsByDni">
                          {filteredPatients.map((p) => (
                            <option key={p.id} value={p.documentNumber} />
                          ))}
                        </datalist>
                      </label>

                      <label>
                        Hora:
                        <select name="time" value={newAppointment.time} onChange={handleChange}>
                          {timeSlots.map((time) => (
                            <option key={time} value={time} disabled={!!getAppointmentForTime(time)}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Motivo:
                        <input
                          type="text"
                          name="reason"
                          value={newAppointment.reason}
                          onChange={handleChange} />
                      </label>

                      <label>
                        Notas:
                        <textarea name="notes" value={newAppointment.notes} onChange={handleChange}/>
                      </label>

                      <button type="submit">{isEditMode ? "Actualizar" : "Guardar"}</button>

                      <button type="button" onClick={closeModal}>
                        Cancelar
                      </button>
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
