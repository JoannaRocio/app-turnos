import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
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
        <Link to="/" className="btn btn-light btn-header">Cerrar sesión</Link>
      </div>
    </header>
  );
};

export default Header;
