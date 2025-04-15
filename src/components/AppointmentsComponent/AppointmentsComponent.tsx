import React, { useState } from "react";
import "./AppointmentsComponent.scss";
import { Appointment } from "../../interfaces/Appointment";
import { patientsMock } from "../../mocks/PatientsMock";

// Función para generar intervalos de 30 minutos entre 9:00 y 18:30
// const generateTimeSlots = (): string[] => {
//   const start = 9 * 60;
//   const end = 18 * 60 + 30;
//   const slots: string[] = [];

//   for (let time = start; time <= end; time += 30) {
//     const hours = Math.floor(time / 60).toString().padStart(2, '0');
//     const minutes = (time % 60).toString().padStart(2, '0');
//     slots.push(`${hours}:${minutes}`);
//   }

//   return slots;
// };

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

//   const filteredAppointments = appointments.filter(app =>
//     new Date(app.appointmentDate).toDateString() === selectedDate.toDateString()
//   );

  const AppointmentsComponent: React.FC<Props> = ({ selectedDate, appointments }) => {
    const timeSlots = generateTimeSlots();
  
    // const getAppointmentForTime = (time: string) => {
    //   console.log(appointments)
    //   return appointments.find((appt) =>
    //     appt.appointmentDate.startsWith(selectedDate.toString()) &&
    //     appt.appointmentDate.endsWith(time)
    //   );
    // };

//   const [appointments, setAppointments] = useState<Appointment[]>(patientsMock);

//   const timeSlots = generateTimeSlots();

//   const getAppointmentForTime = (time: string) => {
//     return appointments.find(appt => appt.appointmentDate.endsWith(time));
//   };

const getAppointmentForTime = (time: string) => {
  const selectedDateStr = selectedDate.toISOString().split("T")[0]; // "2025-04-14"
  return appointments.find((appt) => {
    const [datePart, timePart] = appt.appointmentDate.split(" ");
    return datePart === selectedDateStr && timePart === time;
  });
};


  return (
    <section className="section-appointments">
      <h3>Agenda de Turnos - {selectedDate.toString()}</h3>
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
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, index) => {
            const appt = getAppointmentForTime(time);
            return (
              <tr key={index}>
                <td>{time}</td>
                <td>{appt?.patientName || "-"}</td>
                <td>{appt?.dni || "-"}</td>
                <td>{appt?.attended ? "✔️" : appt ? "❌" : "-"}</td>
                <td>{appt?.socialSecurity || "-"}</td>
                <td>{appt?.plan || "-"}</td>
                <td>{appt?.phone || "-"}</td>
                <td>{appt?.reason || "-"}</td>
                <td>{appt?.notes || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );

};

export default AppointmentsComponent;
