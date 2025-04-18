import { Patient } from "../interfaces/Patient";
import AuthService from "./AuthService";

class PatientService {
  private static BASE_URL = "http://localhost:8080/api/patients";

  static async getAll(): Promise<Patient[]> {
    const token = AuthService.getToken();

    const response = await fetch(this.BASE_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener pacientes");
    }

    const rawData = await response.json();

    const mapped: Patient[] = rawData.map((item: any) => ({
        // id: item.id,
        patientName: item.fullName,
        dni: item.documentNumber,
        phone: item.phone ?? "-",
        socialSecurity: item.healthInsurance ?? "-",
        plan: item.insurancePlan ?? "-",
        notes: item.note ?? "-",
      }));

    return mapped;
  }
}

export default PatientService;
