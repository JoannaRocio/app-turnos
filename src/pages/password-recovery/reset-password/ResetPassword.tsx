import React, { useState } from "react";
import "../PasswordRecovery.scss"; // Importa los estilos
import { useNavigate } from 'react-router-dom';
import PasswordRecoveryService from "../../../services/PasswordRecoveryService";
import { useSearchParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState<string>("")
    const [password2, setPassword2] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [success, setSuccess] = useState<string>("")
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!token) {
          setError("Token inválido");
          return;
        }
        setError("");
        setSuccess("");
        
        // Validación básica
        if (!password || !password2) {
          setSuccess("")
          setError("Complete todos los campos.")
          return
        }

        if (password !== password2) {
          setSuccess("");
          setError("Las contraseñas deben ser iguales.");
          return;
        }

        try {
          const response = await PasswordRecoveryService.reset_password(token, password);
          setSuccess(response); // el backend devuelve un string tipo "Contraseña cambiada correctamente."
        } catch (error) {
          setError("Hubo un error al cambiar la contraseña.");
        }
    }
    

    return(
      <section className="container container-login ">
        <div className="row justify-content-center">
          <div className="col-12 container-formLogin">
  
            <div className="row">
              <div className="col pb-4">
                <h3>Reestablecer contraseña</h3>
              </div>
            </div>
  
            <div className="row">
              <div className="col">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="user">Contraseña nueva:</label>
                    <input
                      type="text"
                      id="user"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <label htmlFor="user">Repetir contraseña:</label>
                    <input
                      type="text"
                      id="user"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </div>
                  <a href="/Inicio-sesion">Volver al inicio de sesión</a>
  
                  <button type="submit" className="submit-button">
                    Guardar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}

export default ResetPassword