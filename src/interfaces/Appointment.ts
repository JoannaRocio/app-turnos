import { Patient } from "./Patient";

// type AppointmentState = "pendiente" | "confirmado" | "cancelado";

export interface Appointment {
  patientDni: string;
  patientFullName: string;
  dateTime: string; // formato ISO
  professionalFullName: string;
  professionalDni: string;
  reason: string;
  state: string;
  patient: Patient; // el objeto completo del paciente
}
