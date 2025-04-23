import { Professional } from "../interfaces/Professional";
import AuthService from "./AuthService";

class ProfessionalService {
  private static BASE_URL = "http://localhost:8080/api/professionals";

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
}

export default ProfessionalService;
