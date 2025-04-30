import { Professional } from "../interfaces/Professional";
import AuthService from "./AuthService";

class ProfessionalService {
  private static readonly BASE_URL = "http://localhost:8080/api/professionals";

  static async getAllProfessionals(): Promise<Professional[]> {
    const token = AuthService.getToken();

    const response = await fetch(this.BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    // Mapear los datos a la interfaz Professional
    const mapped: Professional[] = data.map((item: any) => ({
      professionalId: item.id,
      professionalName: item.fullName,
      documentType: item.documentType,
      professionalDni: Number(item.documentNumber),
      phone: item.phone ?? "-",
      shiftStart: item.startTime,
      shiftEnd: item.endTime,
      unavailableHours: "-",
      specialties: "-"
    }));

    return mapped;
  }

  static async createProfessional(data: any): Promise<void> {
    const token = AuthService.getToken();
  
    const response = await fetch(this.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });
  
    const responseText = await response.text();
  
    if (!response.ok) {
      throw new Error(`Error creando profesional: ${responseText}`);
    }
  }
  
  static async updateProfessional(id: number, data: any): Promise<Professional> {
    const token = AuthService.getToken();
    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error actualizando profesional: ${errorText}`);
    }

    return await response.json();
  }
}

export default ProfessionalService;
