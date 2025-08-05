import { Plan } from '../interfaces/HealthInsurance';
import Api from './Api';

const BASE_URL = '/insurance-plans';

interface PlanWithInsuranceId extends Plan {
  healthInsuranceId: number;
}

class PlanInsuranceService {
  static async deletePlan(id: number): Promise<void> {
    await Api.delete(`${BASE_URL}/${id}`);
  }

  static async createPlan(name: string, healthInsuranceId: number): Promise<PlanWithInsuranceId> {
    const body = { name, healthInsuranceId };
    const response = await Api.post<Plan>(BASE_URL, body);
    // Enriquecer la respuesta con el parent ID:
    return response.data;
  }

  /** Actualiza un plan existente */
  static async updatePlan(
    id: number,
    name: string,
    healthInsuranceId: number
  ): Promise<PlanWithInsuranceId> {
    const body = { name, healthInsuranceId };
    const res = await Api.put<Plan>(`${BASE_URL}/${id}`, body);
    // Igual, devolvemos el objeto con healthInsuranceId
    return { ...res.data, healthInsuranceId };
  }
}

export default PlanInsuranceService;
export type { PlanWithInsuranceId };
