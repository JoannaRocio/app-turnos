import { Professional } from '../interfaces/Professional';
import Api from './Api';

class ProfessionalService {
  private static readonly BASE_URL = '/professionals';

  static async getAllProfessionals(): Promise<Professional[]> {
    const response = await Api.get<any[]>(this.BASE_URL);
    const data = response.data;

    const mapped: Professional[] = data.map((item) => ({
      professionalId: item.id,
      professionalName: item.fullName,
      documentType: item.documentType,
      documentNumber: item.documentNumber,
      phone: item.phone ?? '-',
      specialties: item.specialties ?? '-',
      schedules: item.schedules ?? [],
      professionalState: item.professionalState ?? '-',
    }));

    // Ordenar activos primero
    mapped.sort((a, b) => {
      if (a.professionalState === 'ACTIVE' && b.professionalState !== 'ACTIVE') return -1;
      if (a.professionalState !== 'ACTIVE' && b.professionalState === 'ACTIVE') return 1;
      return 0;
    });

    return mapped;
  }

  static async createProfessional(data: any): Promise<void> {
    const payload = {
      ...data,
      fullName: data.professionalName,
    };
    delete payload.professionalName;

    const response = await Api.post<string>(this.BASE_URL, payload);

    if (response.status >= 400) {
      throw new Error(`Error creando profesional: ${response.data}`);
    }
  }

  static async updateProfessional(id: number, data: any): Promise<void> {
    const payload = {
      ...data,
      fullName: data.professionalName,
    };
    delete payload.professionalName;

    const response = await Api.put<string>(`${this.BASE_URL}/${id}`, payload);

    if (response.status >= 400) {
      throw new Error(`Error actualizando profesional: ${response.data}`);
    }
  }
}

export default ProfessionalService;
