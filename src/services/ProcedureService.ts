// src/services/ProcedureService.ts
import Api from './Api';
import { Procedure } from '../interfaces/Procedure';

class ProcedureService {
  private static readonly BASE_URL = '/dental-procedures';

  static async getAll(): Promise<Procedure[]> {
    const response = await Api.get<any[]>(this.BASE_URL);
    return response.data.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      baseValue: item.baseValue,
      active: item.active,
    }));
  }
}

export default ProcedureService;
