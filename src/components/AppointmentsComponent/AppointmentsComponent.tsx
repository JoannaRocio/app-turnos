import React, { useEffect, useState } from "react";
import "./AppointmentsComponent.scss";
import { Appointment } from "../../interfaces/Appointment";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import ConfirmModal from "../ConfirmModal/ConfirmModalComponent";
import AppointmentService from "../../services/AppointmentService";
import ProfessionalPanel from "../ProfessionalPanel/ProfessionalPanel";
import CalendarComponent from "../CalendarComponent/CalendarComponent";
import { Patient } from "../../interfaces/Patient";
import { Professional } from "../../interfaces/Professional";

interface Props {
  patients: Patient[];
  professionals: Professional[];
  appointments: Appointment[];
  onAppointmentsUpdate: () => void;
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

  const [apptToDelete, setApptToDelete] = useState<{
    patientName: string;
    date: string;
    time: string;
  } | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const appointmentsForSelectedDate = appointments.filter(appt =>
    appt.dateTime.startsWith(selectedDate.toISOString().split("T")[0])
  );

  const confirmDelete = (appt: any, time: string) => {
    setShowConfirm(true);
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
      const patient = patients.find(p => p.id === currentAppointment.patient.id);
      if (patient) {
        setNameSearch(patient.fullName); // nombre y apellido
        setDniSearch(patient.documentNumber); // opcional
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
      professionalId: professionals[0].professionalId,
      appointmentId: newAppointment.appointmentId
    };
  
    try {
  
      if (isEditMode) {
        await AppointmentService.updateAppointment(newAppointment.appointmentId, appointmentToSave);
        onAppointmentsUpdate();
      } else {
        await AppointmentService.createAppointment(appointmentToSave);
        onAppointmentsUpdate();
      }
  
      closeModal();
  
    } catch (error) {
      alert(error);
    }
  };

  function handleDeleteConfirmed(apptToDelete: { patientName: string; date: string; time: string; }) {
    throw new Error("Function not implemented.");
  }

  const filteredPatients = patients.filter((p) =>
    p?.fullName?.toLowerCase().includes(nameSearch.toLowerCase()) &&
    p?.documentNumber?.includes(dniSearch)
  );
  
  return (
    <>
    <section>
      <h3 className="text-white">
        Agenda de Turnos - {selectedDate.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
      </h3>
    </section>
    
    <section className="container-fluid">

        <div className="row">
          <div className="col-2">
            <ProfessionalPanel></ProfessionalPanel>
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
                  <th>Plan</th>
                  <th>Teléfono</th>
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
                      <td>{appt?.patient.insurancePlan ?? "-"}</td>
                      <td>{appt?.patient.phone ?? "-"}</td>
                      <td>{appt?.reason ?? "-"}</td>
                      <td>{appt?.patient.note ?? "-"}</td>
                      <td>
                        {appt && (
                          <span className="d-flex justify-content-center btn-delete"
                            title="Eliminar turno"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(appt, time);
                            } }
                          >
                            <IoIosRemoveCircleOutline color="red" size={22} />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <ConfirmModal
                isOpen={showConfirm}
                title="Confirmar eliminación"
                message={`¿Estás segura que deseas eliminar el turno de "${apptToDelete?.patientName}"?`}
                onConfirm={() => {
                  if (apptToDelete) {
                    handleDeleteConfirmed(apptToDelete);
                  }
                } }
                onCancel={() => {
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
    </>
  );
};

export default AppointmentsComponent;
