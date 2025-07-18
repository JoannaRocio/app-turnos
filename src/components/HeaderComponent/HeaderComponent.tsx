import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderComponent.scss';
import { useComponente } from '../../context/ContextComponent';
import { useAuth } from '../../context/ContextAuth';

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  const { componenteActivo, setComponenteActivo } = useComponente();
  const { logout, userRole } = useAuth();

  const role = userRole ?? '';

  const handleLogOut = () => {
    logout();
    setComponenteActivo('');
    navigate('/Inicio-sesion');
  };

  return (
    <header className="container-header">
      <div className="container d-flex justify-content-between align-items-center">
        <h2>Turnos APP</h2>

        <nav>
          <ul className="nav">
            <li className="nav-item">
              <button
                className={`nav-link btn ${componenteActivo === 'agenda-turnos' ? 'fw-bold' : ''}`}
                onClick={() => setComponenteActivo('agenda-turnos')}
              >
                <div className="title-header">Agenda de turnos</div>
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link btn ${componenteActivo === 'pacientes' ? 'fw-bold' : ''}`}
                onClick={() => setComponenteActivo('pacientes')}
              >
                <div className="title-header">Pacientes</div>
              </button>
            </li>

            {(role === 'ADMIN' || role === 'MODERADOR') && (
              <li className="nav-item">
                <button
                  className={`nav-link btn ${componenteActivo === 'profesionales' ? 'fw-bold' : ''}`}
                  onClick={() => setComponenteActivo('profesionales')}
                >
                  <div className="title-header">Profesionales</div>
                </button>
              </li>
            )}

            {role === 'ADMIN' && (
              <li className="nav-item">
                <button
                  className={`nav-link btn ${componenteActivo === 'panel-admin' ? 'fw-bold' : ''}`}
                  onClick={() => setComponenteActivo('panel-admin')}
                >
                  <div className="title-header">Panel admin</div>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <button onClick={handleLogOut} className="btn App-buttonSecondary">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderComponent;
