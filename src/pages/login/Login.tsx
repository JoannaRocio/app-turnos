import React, { useState } from "react";
import "./Login.scss"; // Importa los estilos
import { useNavigate } from 'react-router-dom';
import AuthService from "../../services/AuthService";

const Login: React.FC = () => {
  const [username, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("")
  // const [success, setSuccess] = useState<string>("")
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("")
    // setSuccess("")

    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
  
    const data = await AuthService.login(username, password);
  
    if (data.status === true) {
      AuthService.saveToken(data.token);
      // console.log(data.message, 'mensage')
      // setSuccess(data.message);
      navigate("/home");
    } else {
      setError(data.message);
    }
  
  };

  return (
    <section className="container container-login ">
      <div className="row justify-content-center">
        <div className="col-12 container-formLogin">

          <div className="row">
            <div className="col pb-4">
              <h3>Iniciar sesión</h3>
            </div>
          </div>

          <div className="row">
            <div className="col">
              {error && <p className="error-message">{error}</p>}
              {/* {success && <p className="success-message">{success}</p>} */}

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
