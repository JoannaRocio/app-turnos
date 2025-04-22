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
      id: item.id,
      patientName: item.fullName,
      documentType: item.documentType,
      documentNumber: item.documentNumber,
      phone: item.phone ?? "-",
      socialSecurity: item.healthInsurance ?? "-",
      plan: item.insurancePlan ?? "-",
      notes: item.note ?? "-",
    }));

    return mapped;
  }

  static async createPatient(data: any): Promise<void> {
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
      throw new Error(`Error creando paciente: ${responseText}`);
    }
  }
  
  static async updatePatient(id: number, data: any): Promise<Patient> {
    const token = AuthService.getToken();
    console.log(id, data)
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
      throw new Error(`Error actualizando paciente: ${errorText}`);
    }

    return await response.json();
  }
}

export default PatientService;
