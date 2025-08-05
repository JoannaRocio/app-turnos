import React, { useState } from 'react';
import './Login.scss';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { useAuth } from '../../context/ContextAuth';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useComponente } from '../../context/ContextComponent';

const Login: React.FC = () => {
  const [username, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { setComponenteActivo } = useComponente();

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const data = await AuthService.login(username, password);

    if (data.token && data.user?.role) {
      AuthService.saveToken(data.token);
      AuthService.saveRole(data.user.role); // Guarda "USUARIO", "ADMIN", etc.

      login(); // Actualiza estado de contexto
      setComponenteActivo('agenda-turnos');
      // navigate('/Sucursales');
    } else {
      setError(data.message ?? 'Error de autenticación');
    }
  };

  return (
    <section className="container-login ">
      <div className="row justify-content-center">
        <div className="col-12 container-formLogin">
          <div className="row">
            <div className="text-center">
              <img
                src="/images/diente.png"
                alt="Odonto Turno"
                className="img-fluid img-iconDiente"
              />
            </div>
            <div className="col pb-4">
              <h3 className="text-center">Iniciar sesión</h3>
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="btn-show-password"
                    >
                      {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <a className="link-auth" href="/Recuperar-contraseña">
                  ¿Olvidaste tu contraseña?
                </a>

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
