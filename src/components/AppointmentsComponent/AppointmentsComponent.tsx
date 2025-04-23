import React, { useEffect, useState } from "react";
import "./AppointmentsComponent.scss";
import { Appointment } from "../../interfaces/Appointment";
// import { patientsMock } from "../../mocks/PatientsMock";
import { IoIosCrop, IoIosCube, IoIosRemove, IoIosRemoveCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import ConfirmModal from "../ConfirmModal/ConfirmModalComponent";
import AppointmentService from "../../services/AppointmentService";
import ProfessionalPanel from "../ProfessionalPanel/ProfessionalPanel";
import CalendarComponent from "../CalendarComponent/CalendarComponent";
import { Patient } from "../../interfaces/Patient";
import { Professional } from "../../interfaces/Professional";

interface Props {
  patients: Patient[];
  professionals: Professional[];
  selectedDate: Date;
  appointments: Appointment[];
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

const AppointmentsComponent: React.FC<Props> = ({ selectedDate, appointments, patients, professionals }) => {
  console.log("Appointments recibidos:", appointments);
console.log("Patients recibidos:", patients);

  const timeSlots = generateTimeSlots();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [dniSearch, setDniSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [apptToDelete, setApptToDelete] = useState<{
    patientName: string;
    date: string;
    time: string;
  } | null>(null);

  const [selectedDateCalendar, setSelectedDateCalendar] = useState(null);

  const handleDateSelect = (date: any) => {
    setSelectedDateCalendar(date);
    console.log("Fecha seleccionada:", date);
  };


  const handleDelete = (appt: any, time: string) => {
    // setApptToDelete();
    setShowConfirm(true);
  };

  const confirmDelete = (appt: any, time: string) => {
    // setApptToDelete();
    setShowConfirm(true);
  };    

  const [newAppointment, setNewAppointment] = useState({
    patientId: 0,
    documentNumber: "",
    time: "",
    reason: "",
    notes: ""
  });

  useEffect(() => {
    const matchByName = patients.find(p =>
      nameSearch && p.full_name?.toLowerCase().includes(nameSearch.toLowerCase())
    );
    const matchByDni = patients.find(p =>
      dniSearch && p.document_number?.includes(dniSearch)
    );
  
    if (matchByName && !dniSearch) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByName.id,
        documentNumber: matchByName.document_number,
        patientName: matchByName.full_name
      }));
      setDniSearch(matchByName.document_number);
    } else if (matchByDni && !nameSearch) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByDni.id,
        documentNumber: matchByDni.document_number,
        patientName: matchByDni.full_name
      }));
      setNameSearch(matchByDni.full_name);
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
    console.log(patients);
    const appointment = appointments.find(p => p.patient.id === apptExists?.patient.id);
    const patient = patients.find(p => p.id === apptExists?.patient.id);
  
    if (apptExists) {
      setIsEditMode(true);
      setNewAppointment({
        patientId: 0,
        documentNumber: apptExists.patient.document_number,
        time: time,
        reason: appointment?.reason ?? "-",
        notes: patient?.note ?? "-"
      });
    } else {
      setIsEditMode(false);
      setNewAppointment({
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
    const selectedDateStr = selectedDate.toISOString().split("T")[0];
    return appointments.find((appt) => {
      if (appt.dateTime) {
        const [datePart, timePartFull] = appt.dateTime.split("T");
        const timePart = timePartFull?.slice(0, 5);

        return datePart === selectedDateStr && timePart === time;
      }
      return false;
    });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newAppointment, 'appointment');
  
    if (!newAppointment.documentNumber || !newAppointment.time || !newAppointment.reason) {
      alert("Por favor, completá todos los campos obligatorios.");
      return;
    }
  
    // Armamos el objeto como lo espera el backend
    const appointmentToCreate = {
      patientDni: newAppointment.documentNumber,
      dateTime: `${selectedDate.toISOString().split("T")[0]}T${newAppointment.time}:00`,
      reason: newAppointment.reason,
      state: "PENDIENTE",
      professionalId: professionals[0].professionalId
    };
  
    try {
      const response = await AppointmentService.createAppointment(appointmentToCreate);
      console.log("✅ Turno creado:", response);
      closeModal();
      // Acá podrías actualizar la lista de turnos si es necesario
    } catch (error) {
      console.error("❌ Error al crear el turno:", error);
      alert("Ocurrió un error al crear el turno.");
    }
  };  

  const handleDeleteAppointment = (time: string) => {
    console.log(time)
  };

  function handleDeleteConfirmed(apptToDelete: { patientName: string; date: string; time: string; }) {
    throw new Error("Function not implemented.");
  }

  const filteredPatients = appointments.filter((p) =>
    p.patient?.full_name?.toLowerCase().includes(nameSearch.toLowerCase()) &&
    p.patient?.document_number?.includes(dniSearch)
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
                      style={{ cursor: !appt ? "pointer" : "default" }}
                    >
                      <td>{time}</td>
                      <td>{appt?.patient.full_name || "-"}</td>
                      <td>{appt?.patient.document_number || "-"}</td>
                      <td>{appt?.state ? "✔️" : appt ? "❌" : "-"}</td>
                      <td>{appt?.patient.health_insurance || "-"}</td>
                      <td>{appt?.patient.insurance_plan || "-"}</td>
                      <td>{appt?.patient.phone || "-"}</td>
                      <td>{appt?.reason || "-"}</td>
                      <td>{appt?.patient.note || "-"}</td>
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
                          <option key={p.patient.id} value={p.patient.full_name} />
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
                          <option key={p.patient.id} value={p.patient.document_number} />
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
                      <textarea
                        name="notes"
                        value={newAppointment.notes}
                        onChange={handleChange} />
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
            <CalendarComponent onDateSelect={handleDateSelect}></CalendarComponent>
{/* 
            <CalendarComponent onDateSelect={function (date: Date): void {
              throw new Error("Function not implemented.");
            } }></CalendarComponent> */}
          </div>
        </div>

    </section>
    </>
  );
};

export default AppointmentsComponent;
