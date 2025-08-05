import { HealthInsurance, NewHealthInsurance } from '../interfaces/HealthInsurance';
import Api from './Api';

const BASE_URL = '/health-insurances';

class HealthInsuranceService {
  static async getActive(): Promise<HealthInsurance[]> {
    const res = await Api.get<HealthInsurance[]>(`${BASE_URL}/active`);
    return res.data;
  }

  static async getAll(): Promise<HealthInsurance[]> {
    const res = await Api.get<HealthInsurance[]>(BASE_URL);
    const data = res.data;

    // Ordenar activos primero
    return data.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }

  static async create(insurance: NewHealthInsurance): Promise<HealthInsurance> {
    const res = await Api.post<string>(BASE_URL, insurance);

    console.warn('Respuesta del backend (texto plano):', res.data);

    // Simular objeto para mostrarlo en UI
    return {
      ...insurance,
      id: Date.now(), // ⚠️ ID ficticio solo para mostrar
      isActive: true,
      plans: [],
    };
  }

  static async disable(id: number): Promise<void> {
    const res = await Api.put<string>(`${BASE_URL}/${id}/disable`);
    if (res.status >= 400) {
      throw new Error(`Error al desactivar: ${res.data}`);
    }
  }

  static async enable(id: number): Promise<void> {
    const res = await Api.put<string>(`${BASE_URL}/${id}/enable`);
    if (res.status >= 400) {
      throw new Error(`Error al activar: ${res.data}`);
    }
  }

  static async update(id: number, insurance: NewHealthInsurance): Promise<HealthInsurance> {
    try {
      const res = await Api.put<HealthInsurance>(`${BASE_URL}/${id}`, insurance);
      return res.data;
    } catch (error: any) {
      let errorMessage = 'Error actualizando obra social';
      const fallback = error.response?.data || error.message;
      if (typeof fallback === 'string') {
        errorMessage = fallback;
      } else if (fallback?.error) {
        errorMessage = fallback.error;
      }
      throw new Error(errorMessage);
    }
  }
}

export default HealthInsuranceService;
