import React, { useState } from "react";
import "./login.scss"; // Importa los estilos

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación básica
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("El email no es válido.");
      return;
    }

    // Lógica para el login
    console.log("Email:", email);
    console.log("Password:", password);

    setError(""); // Reinicia el mensaje de error
    alert("Inicio de sesión exitoso");
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
