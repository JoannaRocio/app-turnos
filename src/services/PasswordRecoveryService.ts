class PasswordRecoveryService {
  
  static password_recovery(email: string) {
    return fetch("http://localhost:8080/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinatario: email }),
    }).then(res => res.json());
  }

  static reset_password(token: string, password: string) {
    console.log("Token:", token);
    return fetch(`http://localhost:8080/api/cambiar-contrasena?token=${token}&newPassword=${password}`, {
      method: "POST"
    }).then(res => {
      if (!res.ok) {
        throw new Error("Error al cambiar la contraseña");
      }
      return res.text(); // o res.json() si es JSON
    });
  }
}
  
export default PasswordRecoveryService;