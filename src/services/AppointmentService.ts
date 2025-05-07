import { Appointment } from "../interfaces/Appointment";

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

  //todos los turnos
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

  static async getAppointmentByDni(professionalDni: string): Promise<Appointment[]> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch(`http://localhost:8080/api/appointments/professional/dni/${professionalDni}`, {
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


  static async updateAppointment(id: number, appointment: any) {
    const token = localStorage.getItem(this.TOKEN_KEY);

    const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
      method: "PUT",
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

  static async deleteAppointment(id: number): Promise<string> {
    const token = localStorage.getItem(this.TOKEN_KEY);
  
    const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
  
    return await response.text();
  }
}

export default AppointmentService;
