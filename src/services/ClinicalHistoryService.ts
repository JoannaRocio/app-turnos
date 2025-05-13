import AuthService from "./AuthService";

const BASE_URL = "http://localhost:8080/api/clinical-history";

class ClinicalHistoryService {
  static async getOrCreate(patient: any): Promise<any[]> {
    const token = AuthService.getToken();
  
    // Buscar historia clínica
    const res = await fetch(`${BASE_URL}/patient/${patient.documentNumber}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  
    if (res.status === 200) {
      const data = await res.json();
      if (data) return data;
    }
  
    // Crear si no existe
    const createRes = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        patientDocumentNumber: patient.documentNumber,
        professionalId: 2, // reemplazá por el ID del profesional logueado
        date: new Date().toISOString().split("T")[0],
        description: "Historia clínica inicial",
      }),
    });
  
    if (!createRes.ok) {
      const msg = await createRes.text();
      throw new Error(`Error creando historia clínica: ${msg}`);
    }
  
    // Reintentar búsqueda
    const retry = await fetch(`${BASE_URL}/patient/${patient.documentNumber}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  
    if (!retry.ok) throw new Error("No se pudo obtener la historia clínica luego de crearla");
    return await retry.json();
  }
}

export default ClinicalHistoryService;
