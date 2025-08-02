import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderComponent.scss';
import { useComponente } from '../../../context/ContextComponent';
import { useAuth } from '../../../context/ContextAuth';

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
        {/* Logo visible solo en desktop */}
        <img
          src="/images/OdontoTurnoIcon.png"
          alt="Odonto Turno"
          className="img-fluid img-odontoTurno d-none d-md-block"
          style={{ cursor: 'pointer' }}
          onClick={() => setComponenteActivo('agenda-turnos')}
        />

        {/* Botón hamburguesa visible solo en mobile */}
        <button
          className="btn btn-secondary rounded-pill px-4 py-2 d-md-none shadow-sm d-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-controls="mobileMenu"
        >
          <i className="bi bi-list fs-4"></i> Menú
        </button>

        {/* Menú para desktop */}
        <nav className="d-none d-md-block">
          <ul className="nav gap-2">
            <li className="nav-item">
              <button
                className={`nav-link btn ${componenteActivo === 'agenda-turnos' ? 'fw-bold' : ''}`}
                onClick={() => setComponenteActivo('agenda-turnos')}
              >
                <div
                  className={`title-header ${
                    componenteActivo === 'agenda-turnos' ? 'active-title' : ''
                  }`}
                >
                  Agenda de turnos
                </div>
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link btn ${componenteActivo === 'pacientes' ? 'fw-bold' : ''}`}
                onClick={() => setComponenteActivo('pacientes')}
              >
                <div
                  className={`title-header ${
                    componenteActivo === 'pacientes' ? 'active-title' : ''
                  }`}
                >
                  Pacientes
                </div>
              </button>
            </li>

            {(role === 'ADMIN' || role === 'MODERADOR') && (
              <li className="nav-item">
                <button
                  className={`nav-link btn ${componenteActivo === 'profesionales' ? 'fw-bold' : ''}`}
                  onClick={() => setComponenteActivo('profesionales')}
                >
                  <div
                    className={`title-header ${
                      componenteActivo === 'profesionales' ? 'active-title' : ''
                    }`}
                  >
                    Profesionales
                  </div>
                </button>
              </li>
            )}

            {role === 'ADMIN' && (
              <li className="nav-item">
                <button
                  className={`nav-link btn ${componenteActivo === 'panel-admin' ? 'fw-bold' : ''}`}
                  onClick={() => setComponenteActivo('panel-admin')}
                >
                  <div
                    className={`title-header ${
                      componenteActivo === 'panel-admin' ? 'active-title' : ''
                    }`}
                  >
                    Panel Admin
                  </div>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Botón cerrar sesión */}
        <button onClick={handleLogOut} className="btn App-buttonSecondary">
          Cerrar sesión
        </button>
      </div>

      {/* Offcanvas para mobile */}
      <div
        className="offcanvas offcanvas-start d-md-none custom-offcanvas"
        tabIndex={-1}
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="mobileMenuLabel">
            Navegación
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Cerrar"
          ></button>
        </div>

        <div className="offcanvas-body">
          <ul className="nav flex-column gap-3">
            <li>
              <button
                className="menu-item"
                data-bs-dismiss="offcanvas"
                onClick={() => setComponenteActivo('agenda-turnos')}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Agenda de turnos
              </button>
            </li>
            <li>
              <button
                className="menu-item"
                data-bs-dismiss="offcanvas"
                onClick={() => setComponenteActivo('pacientes')}
              >
                <i className="bi bi-people-fill me-2"></i>
                Pacientes
              </button>
            </li>
            {(role === 'ADMIN' || role === 'MODERADOR') && (
              <li>
                <button
                  className="menu-item"
                  data-bs-dismiss="offcanvas"
                  onClick={() => setComponenteActivo('profesionales')}
                >
                  <i className="bi bi-person-badge me-2"></i>
                  Profesionales
                </button>
              </li>
            )}
            {role === 'ADMIN' && (
              <li>
                <button
                  className="menu-item"
                  data-bs-dismiss="offcanvas"
                  onClick={() => setComponenteActivo('panel-admin')}
                >
                  <i className="bi bi-sliders2 me-2"></i>
                  Panel Admin
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;
