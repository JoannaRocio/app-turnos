import { HealthInsurance } from '../interfaces/HealthInsurance';
import AuthService from './AuthService';

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

    const data = await res.json();
    return data;
  }
}

export default HealthInsuranceService;
