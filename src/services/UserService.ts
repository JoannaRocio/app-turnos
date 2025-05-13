import { User } from "../interfaces/User";
import AuthService from "./AuthService";

class UserService {
  private static readonly BASE_URL = "http://localhost:8080/api/v1/user";

  static async getAllUsers(): Promise<User[]> {
    const token = AuthService.getToken();
  
    const response = await fetch(this.BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener usuarios: ${errorText}`);
    }
    const res = await response.json();
    return res;
  }

  static async createUser(data: any): Promise<void> {
    const token = AuthService.getToken();
    console.log(data, 'data, createuser')
    const response = await fetch(`${this.BASE_URL}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      let errorMessage = "Error creando usuario";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error ?? errorMessage;
      } catch {
        const fallbackText = await response.text();
        errorMessage = fallbackText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }
  
  
  
  static async updateUser(id: number, data: Partial<User | null>): Promise<void> {
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
      let errorMessage = "Error actualizando usuario";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error ?? errorMessage;
      } catch {
        const fallbackText = await response.text();
        errorMessage = fallbackText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }
   
}

export default UserService;
