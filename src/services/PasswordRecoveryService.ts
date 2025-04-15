class PasswordRecoveryService {

  static async password_recovery(email: string) {
    const response = await fetch("http://localhost:8080/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinatario: email }),
    });

    const text = await response.text();

    if (!response.ok) {
      return { status: false, message: text };
    }

    return { status: true, message: text };
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