import { Patient } from '../interfaces/Patient';
import AuthService from './AuthService';

const BASE_URL = 'http://localhost:8080/api/clinical-history';

class ClinicalHistoryService {
  static async getOrCreate(patient: Patient, professionalId: number): Promise<any[]> {
    const token = AuthService.getToken();
    console.log(patient, 'patient');
    // Buscar historia clínica
    const res = await fetch(`${BASE_URL}/patient/${patient.documentNumber}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data) return data;
    }

    // Crear si no existe
    const createRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        patientDocumentNumber: patient.documentNumber,
        professionalId: professionalId,
        date: new Date().toISOString().split('T')[0],
        description: 'Historia clínica inicial',
      }),
    });

    if (!createRes.ok) {
      const msg = await createRes.text();
      throw new Error(`Error creando historia clínica: ${msg}`);
    }

    // Reintentar búsqueda
    const retry = await fetch(`${BASE_URL}/patient/${patient.documentNumber}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!retry.ok) throw new Error('No se pudo obtener la historia clínica luego de crearla');
    return await retry.json();
  }

  static async createClinicalHistory(
    patient: Patient,
    description: string,
    professionalId: number,
    procedureIds: number[]
  ): Promise<number> {
    const token = AuthService.getToken();

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        patientDocumentNumber: patient.documentNumber,
        professionalId: professionalId,
        procedureId: procedureIds,
        description: description,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Error creando historia clínica: ${msg}`);
    }

    const data = await res.json(); // 👈 asumimos que vuelve la historia creada
    return data.id; // 👈 devolvemos el ID
  }

  static async uploadFile(historyId: number, file: File): Promise<void> {
    const token = AuthService.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/${historyId}/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        // ⚠️ No pongas 'Content-Type': multipart/form-data, el browser lo setea solo
      },
      body: formData,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Error al subir archivo: ${text}`);
    }

    console.log('Archivo subido:', text);
  }
}

export default ClinicalHistoryService;
