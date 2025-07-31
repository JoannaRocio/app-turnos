import { User } from '../interfaces/User';
import Api from './Api';

class UserService {
  private static readonly BASE_URL = '/v1/user';

  static async getAllUsers(): Promise<User[]> {
    const response = await Api.get<User[]>(this.BASE_URL);
    return response.data;
  }

  static async createUser(data: any): Promise<void> {
    try {
      await Api.post(`${this.BASE_URL}/save`, data);
    } catch (error: any) {
      let errorMessage = 'Error creando usuario';
      const fallback = error.response?.data || error.message;
      if (typeof fallback === 'string') {
        errorMessage = fallback;
      } else if (fallback?.error) {
        errorMessage = fallback.error;
      }
      throw new Error(errorMessage);
    }
  }

  static async updateUser(id: number, data: Partial<User | null>): Promise<void> {
    try {
      await Api.put(`${this.BASE_URL}/${id}`, data);
    } catch (error: any) {
      let errorMessage = 'Error actualizando usuario';
      const fallback = error.response?.data || error.message;
      if (typeof fallback === 'string') {
        errorMessage = fallback;
      } else if (fallback?.error) {
        errorMessage = fallback.error;
      }
      throw new Error(errorMessage);
    }
  }
}

export default UserService;
