import Api from './Api';

class MetricsService {
  private static readonly BASE_URL = '/metrics';

  // ✅ Turnos por día
  static async getAppointmentsPerDay(): Promise<Record<string, number>> {
    const res = await Api.get<Record<string, number>>(`${this.BASE_URL}/appointments-per-day`);
    return res.data;
  }

  // ✅ Nuevos pacientes por mes
  static async getNewPatientsPerMonth(): Promise<Record<number, number>> {
    const res = await Api.get<Record<number, number>>(`${this.BASE_URL}/new-patients-per-month`);
    return res.data;
  }

  // ✅ Estadísticas por estado de turno
  static async getAppointmentStats(): Promise<Record<string, number>> {
    const res = await Api.get<Record<string, number>>(`${this.BASE_URL}/appointment-stats`);
    return res.data;
  }
}

export default MetricsService;
