import React, { useState } from 'react';
import '../PasswordRecovery.scss';
import PasswordRecoveryService from '../../../services/PasswordRecoveryService';
import { useSearchParams } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const token = searchParams.get('token');

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError('Token inválido');
      return;
    }
    setError('');
    setSuccess('');

    // Validación básica
    if (!password || !password2) {
      setSuccess('');
      setError('Complete todos los campos.');
      return;
    }

    if (password !== password2) {
      setSuccess('');
      setError('Las contraseñas deben ser iguales.');
      return;
    }

    try {
      const response = await PasswordRecoveryService.reset_password(token, password);
      setSuccess(response); // el backend devuelve un string tipo "Contraseña cambiada correctamente."
    } catch (error) {
      setError('El tiempo para cambiar la contraseña ha expirado.');
    }
  };

  return (
    <section className="container container-login ">
      <div className="row justify-content-center">
        <div className="col-12 container-formLogin">
          <div className="row">
            <div className="col pb-4">
              <h3>Reestablecer contraseña</h3>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="password">Contraseña nueva:</label>
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

                  <label htmlFor="user">Repetir contraseña:</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      id="password2"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2((prev) => !prev)}
                      className="btn-show-password"
                    >
                      {showPassword2 ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <a href="/Inicio-sesion">Volver al inicio de sesión</a>
                </div>

                <button type="submit" className="submit-button">
                  Guardar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
