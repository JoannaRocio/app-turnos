import AuthService from './AuthService';

class MetricsService {
  private static readonly BASE_URL = 'http://localhost:8080/api/metrics';

  private static async fetchWithAuth<T>(url: string): Promise<T> {
    const token = AuthService.getToken();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener métricas: ${errorText}`);
    }

    return await response.json();
  }

  // ✅ Turnos por día
  static async getAppointmentsPerDay(): Promise<Record<string, number>> {
    return this.fetchWithAuth(`${this.BASE_URL}/appointments-per-day`);
  }

  // ✅ Nuevos pacientes por semana
  static async getNewPatientsPerMonth(): Promise<Record<number, number>> {
    return this.fetchWithAuth(`${this.BASE_URL}/new-patients-per-month`);
  }

  // ✅ Estadísticas de estado de turnos
  static async getAppointmentStats(): Promise<Record<string, number>> {
    return this.fetchWithAuth(`${this.BASE_URL}/appointment-stats`);
  }
}

export default MetricsService;
