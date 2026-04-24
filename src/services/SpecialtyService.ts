// src/services/SpecialtyService.ts
import Api from './Api';

export interface Specialty {
  id: number;
  name: string[];
}

class SpecialtyService {
  private static readonly BASE_URL = '/specialties';

  static async getAll(): Promise<Specialty[]> {
    try {
      const response = await Api.get<any[]>(this.BASE_URL);
      const data = response.data;

      return data.map((item) => ({
        id: item.id,
        name: [item.name],
      }));
    } catch (error) {
      console.error('Error fetching specialties:', error);
      return [];
    }
  }
}

export default SpecialtyService;
