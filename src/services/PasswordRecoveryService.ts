class PasswordRecoveryService {
    static password_recovery(email: string) {
      return fetch("http://localhost:8080/api/v1/user/mail-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(res => res.json());
    }

    static reset_password(password: string) {
        return fetch("http://localhost:8080/api/v1/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }).then(res => res.json());
      }
  }
  
export default PasswordRecoveryService;
  