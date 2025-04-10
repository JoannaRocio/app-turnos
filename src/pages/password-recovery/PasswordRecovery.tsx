import React, { useState } from "react";
import "./PasswordRecovery.scss"; // Importa los estilos
import { useNavigate } from 'react-router-dom';

const PasswordRecovery: React.FC = () => {
    const [username, setUser] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handlePasswordRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // Validación básica
        // if (!username) {
        //   setError("Por favor, completa todos los campos.");
        //   return;
        // }
    
        if (!username) {
          setError("El usuario no es válido.");
          return;
        }
    
        // const response = await fetch("http://localhost:8080/api/v1/user/login", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ username })
        // });
        
        // Verifica si la respuesta es exitosa antes de procesarla
        // if (!response.ok) {
        //     console.error(`Error: ${response.status} - ${response.statusText}`);
        // } else {
        //     const data = await response.json(); // Convertir a JSON una sola vez
        //     console.log(data);
        // }
    
        // const data = await response.json();
        // console.log(data);
    
        // if (data.status == true) {
        //     // const token = await response.text();
        //     // localStorage.setItem("token", token);
        //     alert(data.message);
        //     navigate("/home");
        // } else {
        //     alert(data.message);
        // }
    }
    

    return(
        <section className="container container-login ">
        <div className="row justify-content-center">
          <div className="col-12 container-formLogin">
  
            <div className="row">
              <div className="col">
                <h2>Recuperar contraseña</h2>
              </div>
            </div>
  
            <div className="row">
              <div className="col">
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handlePasswordRecovery}>
                  <div className="form-group">
                    <label htmlFor="user">Email:</label>
                    <input
                      type="text"
                      id="user"
                      value={username}
                      onChange={(e) => setUser(e.target.value)}
                    />
                  </div>
                  <a href="/login">Iniciar sesión</a>
  
                  <button type="submit" className="submit-button">
                    Ingresar
                  </button>
                </form>
              </div>
            </div>
  
          </div>
        </div>
      </section>
    )
}

export default PasswordRecovery