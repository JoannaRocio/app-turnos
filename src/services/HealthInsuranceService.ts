import AuthService from './AuthService';
import { HealthInsurance, NewHealthInsurance } from '../interfaces/HealthInsurance';

const BASE_URL = 'http://localhost:8080/api/health-insurances';

class HealthInsuranceService {
  static async getActive(): Promise<HealthInsurance[]> {
    const token = AuthService.getToken();

    const res = await fetch(`${BASE_URL}/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Error al obtener obras sociales activas: ${msg}`);
    }

    return await res.json();
  }

  static async getAll(): Promise<HealthInsurance[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Error al obtener obras sociales');

    const data: HealthInsurance[] = await res.json();

    // Ordenar: activos primero
    return data.sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }

  static async create(insurance: NewHealthInsurance): Promise<HealthInsurance> {
    const token = AuthService.getToken();

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(insurance),
    });

    const text = await res.text(); // solo una vez

    if (!res.ok) {
      throw new Error(`Error al crear obra social: ${text}`);
    }

    console.warn('Respuesta del backend (texto plano):', text);

    // Retornar un objeto simulado para que React lo pueda usar
    return {
      ...insurance,
      id: Date.now(), // ⚠️ ID ficticio solo para mostrar en lista
      isActive: true,
      plans: [],
    };
  }

  static async disable(id: number): Promise<void> {
    const token = AuthService.getToken();
    const res = await fetch(`${BASE_URL}/${id}/disable`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Error al desactivar: ${text}`);
  }

  static async enable(id: number): Promise<void> {
    const token = AuthService.getToken();
    const res = await fetch(`${BASE_URL}/${id}/enable`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Error al activar: ${text}`);
  }
}

export default HealthInsuranceService;
