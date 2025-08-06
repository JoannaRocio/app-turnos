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

  /** Confirma un turno vía token */
  static async confirmAppointment(token: string): Promise<void> {
    try {
      await Api.patch<void>(`/appointments/confirm/${token}`);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Error al confirmar turno';
      throw new Error(msg);
    }
  }

  /** Cancela un turno vía token */
  static async cancelAppointment(token: string): Promise<void> {
    try {
      await Api.patch<void>(`/appointments/cancel/${token}`);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Error al cancelar turno';
      throw new Error(msg);
    }
  }


  static async updateAppointmentState(appointmentId: number, newState: string): Promise<void> {
    await Api.patch(`/appointments/${appointmentId}/state`, null, { params: { state: newState } });
  }
}

export default AppointmentService;
