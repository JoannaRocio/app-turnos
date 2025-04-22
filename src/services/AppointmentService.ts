// src/services/AppointmentService.ts
class AppointmentService {
    private static TOKEN_KEY = "token";
  
    static async createAppointment(appointment: any) {
      const token = localStorage.getItem(this.TOKEN_KEY);
  
      const response = await fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(appointment),
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
  
      return await response.text();
    }
  }
  
  export default AppointmentService;
  
  