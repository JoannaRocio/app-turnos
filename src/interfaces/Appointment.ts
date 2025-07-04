import { Patient } from './Patient';

// type AppointmentState = "pendiente" | "confirmado" | "cancelado";

export interface Appointment {
  appointmentId: number;
  patientDni: string;
  patientFullName: string;
  dateTime: string;
  professionalFullName: string;
  professionalDni: string;
  reason: string;
  state: string;
  patient: Patient;
}
