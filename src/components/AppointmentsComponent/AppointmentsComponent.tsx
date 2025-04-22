import React, { useEffect, useState } from "react";
import "./AppointmentsComponent.scss";
import { Appointment } from "../../interfaces/Appointment";
// import { patientsMock } from "../../mocks/PatientsMock";
import { IoIosCrop, IoIosCube, IoIosRemove, IoIosRemoveCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import ConfirmModal from "../ConfirmModal/ConfirmModalComponent";
import AppointmentService from "../../services/AppointmentService";
import ProfessionalPanel from "../ProfessionalPanel/ProfessionalPanel";
import CalendarComponent from "../CalendarComponent/CalendarComponent";

interface Props {
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

const AppointmentsComponent: React.FC<Props> = ({ selectedDate, appointments }) => {
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
  
  const filteredPatientsByName = appointments.filter((p) =>
    p.patientName.toLowerCase().includes(nameSearch.toLowerCase())
  );
  
  const filteredPatientsByDni = appointments.filter((p) =>
    p.dni.includes(dniSearch)
  );

  // useEffect(() => {
  //   const matchByName = appointments.find(p => p.patientName === nameSearch);
  //   const matchByDni = appointments.find(p => p.dni === dniSearch);
  
  //   if (matchByName) {
  //     setNewAppointment(prev => ({ ...prev, id: matchByName.id }));
  //   } else if (matchByDni) {
  //     setNewAppointment(prev => ({ ...prev, id: matchByDni.id }));
  //   }
  // }, [nameSearch, dniSearch]);

  useEffect(() => {
    const matchByName = appointments.find(p => p.patientName === nameSearch);
    const matchByDni = appointments.find(p => p.dni === dniSearch);
  
    if (matchByName) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByName.id,
        documentNumber: matchByName.dni,
        patientName: matchByName.patientName
      }));
      setDniSearch(matchByName.dni);
    } else if (matchByDni) {
      setNewAppointment(prev => ({
        ...prev,
        patientId: matchByDni.id,
        documentNumber: matchByDni.dni,
        patientName: matchByDni.patientName
      }));
      setNameSearch(matchByDni.patientName);
    }
  }, [nameSearch, dniSearch, appointments]);
  
  
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const openModalForTime = (time: string) => {
    const apptExists = getAppointmentForTime(time);
  
    if (apptExists) {
      setIsEditMode(true);
      setNewAppointment({
        patientId: 0,
        documentNumber: apptExists.dni,
        time: time,
        reason: apptExists.reason,
        notes: apptExists.notes,
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
      const [datePart, timePart] = appt.appointmentDate.split(" ");
      return datePart === selectedDateStr && timePart === time;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newAppointment,'appointment')
    if (!newAppointment.documentNumber || !newAppointment.time || !newAppointment.reason) {
      alert("Por favor, completá todos los campos obligatorios.");
      return;
    }
    
  
    const appointmentToCreate = {
      ...newAppointment,
      date: selectedDate.toISOString().split("T")[0]
    };
  
    try {
      const response = await AppointmentService.createAppointment(appointmentToCreate);
      console.log("✅ Turno creado:", response);
      closeModal();
      // Acá podrías actualizar la lista de turnos si es necesario
    } catch (error) {
      console.error("❌ Error al crear el turno:", error);
      alert(error);
    }
  };

  const handleDeleteAppointment = (time: string) => {
    console.log(time)
    // Lógica para eliminar el turno
    // Por ejemplo, actualizar el estado que contiene la lista de turnos
  };

  function handleDeleteConfirmed(apptToDelete: { patientName: string; date: string; time: string; }) {
    throw new Error("Function not implemented.");
  }

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

          <div className="col-7">
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
                      <td>{appt?.patientName || "-"}</td>
                      <td>{appt?.dni || "-"}</td>
                      <td>{appt?.attended ? "✔️" : appt ? "❌" : "-"}</td>
                      <td>{appt?.socialSecurity || "-"}</td>
                      <td>{appt?.plan || "-"}</td>
                      <td>{appt?.phone || "-"}</td>
                      <td>{appt?.reason || "-"}</td>
                      <td>{appt?.notes || "-"}</td>
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
                    {/* <label>
            Paciente:
            <select
              name="patientId"
              value={newAppointment.patientId}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              {patientsMock.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.patientName}
                </option>
              ))}
            </select>
          </label> */}

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
                        {filteredPatientsByName.map((p) => (
                          <option key={p.id} value={p.patientName} />
                        ))}
                      </datalist>
                    </label>

                    <label>
                      DNI:
                      <input
                        type="text"
                        value={dniSearch}
                        // readOnly={!!nameSearch} // Solo lectura si hay nombre seleccionado
                        onChange={(e) => {
                          setDniSearch(e.target.value);
                          setNameSearch(""); // resetea el otro buscador
                        } }
                        list="patientsByDni"
                        placeholder="Escribí el DNI" />
                      <datalist id="patientsByDni">
                        {filteredPatientsByDni.map((p) => (
                          <option key={p.id} value={p.dni} />
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

          <div className="col-3">
            <CalendarComponent onDateSelect={function (date: Date): void {
              throw new Error("Function not implemented.");
            } }></CalendarComponent>
          </div>
        </div>

    </section>
    </>
  );
};

export default AppointmentsComponent;
