import { Professional } from '../interfaces/Professional';
import AuthService from './AuthService';

class ProfessionalService {
  private static readonly BASE_URL = 'http://localhost:8080/api/professionals';

  static async getAllProfessionals(): Promise<Professional[]> {
    const token = AuthService.getToken();

    const response = await fetch(this.BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    const mapped: Professional[] = data.map((item: any) => ({
      professionalId: item.id,
      professionalName: item.fullName,
      documentType: item.documentType,
      documentNumber: Number(item.documentNumber),
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
    const token = AuthService.getToken();

    const payload = {
      ...data,
      fullName: data.professionalName,
    };
    delete payload.professionalName;

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Error creando profesional: ${responseText}`);
    }
  }

  static async updateProfessional(id: number, data: any): Promise<void> {
    const token = AuthService.getToken();
    const payload = {
      ...data,
      fullName: data.professionalName,
    };
    delete payload.professionalName;

    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error actualizando profesional: ${error}`);
    }
  }
}

export default ProfessionalService;
