import { Patient } from '../interfaces/Patient';
import Api from './Api';

class PatientService {
  private static BASE_URL = '/patients';

  static async getAll(): Promise<Patient[]> {
    const response = await Api.get<Patient[]>(this.BASE_URL);
    return response.data;
  }

  static async createPatient(data: any): Promise<void> {
    const response = await Api.post<string>(this.BASE_URL, data);

    if (response.status >= 400) {
      throw new Error(`Error creando paciente: ${response.data}`);
    }
  }

  static async updatePatient(id: number, data: any): Promise<Patient> {
    const response = await Api.put<Patient>(`${this.BASE_URL}/${id}`, data);

    return response.data;
  }
}

export default PatientService;
