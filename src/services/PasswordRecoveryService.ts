import Api from './Api';

class PasswordRecoveryService {
  static async password_recovery(email: string): Promise<{ status: boolean; message: string }> {
    try {
      const res = await Api.post<string>('/enviar', {
        destinatario: email,
      });
      return { status: true, message: res.data };
    } catch (error: any) {
      const msg = error.response?.data || 'Error desconocido';
      return { status: false, message: msg };
    }
  }

  static async reset_password(token: string, password: string): Promise<string> {
    const res = await Api.post<string>(
      `/cambiar-contrasena?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`
    );
    return res.data;
  }
}

export default PasswordRecoveryService;
