import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderComponent.scss";
import { useComponente } from "../../context/ContextComponent";
import { useAuth } from "../../context/ContextAuth";

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  const { componenteActivo, setComponenteActivo } = useComponente();
  const { logout, userRole } = useAuth();

  const role = userRole ?? "";

  const handleLogOut = () => {
    logout();
    setComponenteActivo("");
    navigate("/Inicio-sesion");
  };

  return (
    <header className="container-header">
      <div className="container d-flex justify-content-between align-items-center">
        <h2 className="text-white">Turnos APP</h2>

        <nav>
          <ul className="nav">
            <li className="nav-item">
              <button className={`nav-link btn text-white ${componenteActivo === "agenda-turnos" ? "fw-bold" : ""}`} onClick={() => setComponenteActivo("agenda-turnos")}>
                Agenda de turnos
              </button>
            </li>

            <li className="nav-item">
              <button className={`nav-link btn text-white ${componenteActivo === "pacientes" ? "fw-bold" : ""}`} onClick={() => setComponenteActivo("pacientes")}>
                Pacientes
              </button>
            </li>

            {(role === "ADMIN" || role === "MODERADOR") && (
              <li className="nav-item">
                <button className={`nav-link btn text-white ${componenteActivo === "profesionales" ? "fw-bold" : ""}`} onClick={() => setComponenteActivo("profesionales")}>
                  Profesionales
                </button>
              </li>
            )}

            {role === "ADMIN" && (
              <li className="nav-item">
                <button className={`nav-link btn text-white ${componenteActivo === "panel-admin" ? "fw-bold" : ""}`} onClick={() => setComponenteActivo("panel-admin")}>
                  Panel admin
                </button>
              </li>
            )}
          </ul>
        </nav>

        <button onClick={handleLogOut} className="btn btn-light">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderComponent;
