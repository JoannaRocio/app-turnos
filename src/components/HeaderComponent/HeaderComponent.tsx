import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderComponent.scss';
import AuthService from '../../services/AuthService';

const HeaderComponent: React.FC = () => {

  const navigate = useNavigate();
  
  const handleLogOut = () => {
    AuthService.logout()
    navigate("/login")
  }

  return (
    <header className="container-header">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-decoration-none">
          <h2>Turnos APP</h2>
        </Link>

        {/* Navegación */}
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Turnos">Agenda de turnos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/acerca">Pacientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/acerca">Profesionales</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/acerca">Sistema</Link>
            </li>
          </ul>
        </nav>

        {/* Botón de Login */}
        <button onClick={(e) => handleLogOut()} className="btn btn-light btn-header">Cerrar sesión</button>
      </div>
    </header>
  );
};

export default HeaderComponent;
