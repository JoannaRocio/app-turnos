import { Appointment } from '../interfaces/Appointment';
import Api from './Api';

class AppointmentService {
  static async createAppointment(appointment: any): Promise<string> {
    const response = await Api.post<string>('/appointments', appointment);
    return response.data;
  }

  static async getAllAppointments(): Promise<Appointment[]> {
    const response = await Api.get<Appointment[]>('/appointments');
    return response.data;
  }

  static async getAppointmentByDni(documentNumber: string): Promise<Appointment[]> {
    const response = await Api.get<Appointment[]>(
      `/appointments/professional/dni/${documentNumber}`
    );
    return response.data;
  }

  static async updateAppointment(id: number, appointment: any): Promise<string> {
    const response = await Api.put<string>(`/appointments/${id}`, appointment);
    return response.data;
  }

  static async deleteAppointment(id: number): Promise<string> {
    const response = await Api.delete<string>(`/appointments/${id}`);
    return response.data;
  }

  static async confirmAppointment(id: number): Promise<void> {
    await Api.post<void>(`/appointments/confirmar/${id}`);
  }

  static async cancelAppointment(id: number): Promise<void> {
    await Api.post<void>(`/appointments/cancelar/${id}`);
  }
}

export default AppointmentService;
