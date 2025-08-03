// src/services/SpecialtyService.ts
import Api from './Api';

export interface Specialty {
  id: number;
  name: string[];
}

class SpecialtyService {
  private static readonly BASE_URL = '/specialties';

  static async getAll(): Promise<Specialty[]> {
    const response = await Api.get<any[]>(this.BASE_URL);
    const data = response.data;

    const mapped: Specialty[] = data.map((item) => ({
      id: item.id,
      name: [item.name],
    }));

    return mapped;
  }
}

export default SpecialtyService;
