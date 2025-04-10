import React, { useState } from "react";
import "./Login.scss"; // Importa los estilos
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación básica
    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!username) {
      setError("El usuario no es válido.");
      return;
    }

    const response = await fetch("http://localhost:8080/api/v1/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    
    // Verifica si la respuesta es exitosa antes de procesarla
    // if (!response.ok) {
    //     console.error(`Error: ${response.status} - ${response.statusText}`);
    // } else {
    //     const data = await response.json(); // Convertir a JSON una sola vez
    //     console.log(data);
    // }

    const data = await response.json();
    console.log(data);

    if (data.status == true) {
        // const token = await response.text();
        // localStorage.setItem("token", token);
        alert(data.message);
        navigate("/home");
    } else {
        alert(data.message);
    }

    // Lógica para el login
    // console.log("Email:", email);
    // console.log("Password:", password);

    setError(""); // Reinicia el mensaje de error
    // alert("Inicio de sesión exitoso");
  };

  return (
    <section className="container container-login ">
      <div className="row justify-content-center">
        <div className="col-12 container-formLogin">

          <div className="row">
            <div className="col">
              <h2>Iniciar sesión</h2>
            </div>
          </div>

          <div className="row">
            <div className="col">
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="user">Usuario:</label>
                  <input
                    type="text"
                    id="user"
                    value={username}
                    onChange={(e) => setUser(e.target.value)}
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

                <a href="/password-recovery">¿Olvidaste tu contraseña?</a>

                <button type="submit" className="submit-button">
                  Ingresar
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Login;
