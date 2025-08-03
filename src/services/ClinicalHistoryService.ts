import { Patient } from '../interfaces/Patient';
import Api from './Api';

const BASE_URL = '/clinical-history';

class ClinicalHistoryService {
  static async getOrCreate(patient: Patient, professionalId: number): Promise<any[]> {
    // Buscar historia clínica
    try {
      const res = await Api.get<any[]>(`${BASE_URL}/patient/${patient.documentNumber}`);
      if (res.data) return res.data;
    } catch (error: any) {
      // si error, sigue con creación
    }

    // Crear si no existe
    const body = {
      patientDocumentNumber: patient.documentNumber,
      professionalId,
      date: new Date().toISOString().split('T')[0],
      description: 'Historia clínica inicial',
    };

    const createRes = await Api.post(`${BASE_URL}`, body);
    if (!createRes || createRes.status >= 400) {
      throw new Error('Error creando historia clínica');
    }

    // Reintentar búsqueda
    const retryRes = await Api.get<any[]>(`${BASE_URL}/patient/${patient.documentNumber}`);
    return retryRes.data;
  }

  static async createClinicalHistory(
    patient: Patient,
    description: string,
    professionalId: number,
    procedureIds: number[]
  ): Promise<number> {
    const body = {
      patientDocumentNumber: patient.documentNumber,
      professionalId,
      procedureIds,
      description,
    };

    const res = await Api.post<string>(`${BASE_URL}`, body);
    console.log('Respuesta:', res.data);

    return 0; // o podrías devolver `res.data` si tu backend lo devuelve
  }

  static async uploadFile(entryId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    await Api.post(`${BASE_URL}/${entryId}/upload`, formData, {
      headers: {
        // Axios maneja automáticamente multipart, no es necesario agregar Content-Type
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async downloadFile(id: number, fileName: string) {
    // fuerza la respuesta como blob
    const res = await Api.get<Blob>(`/clinical-history/files/${id}/download`, {
      responseType: 'blob',
    });
    // crea un URL local y dispara la descarga
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async fetchFileBlob(id: number): Promise<Blob> {
    const res = await Api.get<Blob>(`/clinical-history/files/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  }

  /** Actualizar sólo la descripción */
  static async updateDescription(entryId: number, description: string): Promise<void> {
    await Api.put(`${BASE_URL}/${entryId}/description`, { description });
  }

  /** Reemplazar la lista de procedimientos (añadir o eliminar) */
  static async updateProcedures(entryId: number, procedureIds: number[]): Promise<void> {
    const url = `${BASE_URL}/${entryId}/procedures`;
    await Api.post<void>(url, { procedureIds });
  }

  /** Eliminar un archivo existente */
  static async deleteFile(fileId: number): Promise<void> {
    await Api.delete(`${BASE_URL}/files/${fileId}`);
  }

  /** Borrar toda la entrada */
  static async deleteEntry(entryId: number): Promise<void> {
    await Api.delete(`${BASE_URL}/${entryId}`);
  }

  // agregar procedimientos
  // static async updateProcedures(entryId: number, procedureIds: number[]): Promise<void> {
  //   const url = `${this.BASE_URL}/${entryId}/procedures`;
  //   await Api.put<void>(url, { procedureIds });
  // }
}

export default ClinicalHistoryService;
