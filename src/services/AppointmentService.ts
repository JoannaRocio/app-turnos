import { Appointment } from '../interfaces/Appointment';
import AuthService from './AuthService';

class AppointmentService {
  private static readonly TOKEN_KEY = 'token';
  private static BASE_URL = 'http://localhost:8080/api/appointments';

  static async createAppointment(appointment: any) {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch('http://localhost:8080/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text();
  }

  //todos los turnos
  static async getAllAppointments(): Promise<Appointment[]> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch('http://localhost:8080/api/appointments', {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const rawData = await response.json();
    return rawData;
  }

  static async getAppointmentByDni(documentNumber: string): Promise<Appointment[]> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch(
      `http://localhost:8080/api/appointments/professional/dni/${documentNumber}`,
      {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const rawData = await response.json();
    return rawData;
  }

  static async updateAppointment(id: number, appointment: any) {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text();
  }

  static async deleteAppointment(id: number): Promise<string> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text();
  }

  static async confirmAppointment(id: number): Promise<void> {
    const token = AuthService.getToken();
    const res = await fetch(`${this.BASE_URL}/confirmar/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) throw new Error('Error al confirmar turno');
  }

  static async cancelAppointment(id: number): Promise<void> {
    const token = AuthService.getToken();
    const res = await fetch(`${this.BASE_URL}/cancelar/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) throw new Error('Error al cancelar turno');
  }
}

export default AppointmentService;
