import { Appointment } from "../interfaces/Appointment";

// ⬇ Esta función va fuera de la clase
// function mapAppointment(raw: any): Appointment {
//   return {
//     id: raw.id,
//     patientId: raw.patient_id,
//     professionalId: raw.professional_id,
//     dateTime: raw.date_time,
//     reason: raw.reason,
//     state: raw.state,
//     patient: {
//       id: raw.patient.id,
//       full_name: raw.patient.full_name,
//       document_type: raw.patient.document_type,
//       document_number: raw.patient.document_number,
//       health_insurance: raw.patient.health_insurance,
//       insurance_plan: raw.patient.insurance_plan,
//       phone: raw.patient.phone,
//       registration_date: raw.patient.registration_date,
//       last_visit_date: raw.patient.last_visit_date,
//       note: raw.patient.note,
//       state: raw.patient.state
//     }
//   };
// }

class AppointmentService {
  private static readonly TOKEN_KEY = "token";

  static async createAppointment(appointment: any) {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch("http://localhost:8080/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text();
  }

  static async getAllAppointments(): Promise<Appointment[]> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch("http://localhost:8080/api/appointments", {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const rawData = await response.json();
    return rawData;
  }
}

export default AppointmentService;
