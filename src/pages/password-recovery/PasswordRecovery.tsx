import React, { useState } from 'react';
import './PasswordRecovery.scss';
import PasswordRecoveryService from '../../services/PasswordRecoveryService';

const PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handlePasswordRecovery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setSuccess('');
      setError('Por favor, completar el campo vacío.');
      return;
    }

    const data = await PasswordRecoveryService.password_recovery(email);

    if (data.status === true) {
      setError('');
      setSuccess(data.message);
    } else {
      setSuccess('');
      setError(data.message);
    }
  };

  return (
    <section className="container container-login ">
      <div className="row justify-content-center">
        <div className="col-12 container-formLogin">
          <div className="row">
            <div className="col pb-4">
              <h3>Recuperar contraseña</h3>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <form onSubmit={handlePasswordRecovery}>
                <div className="form-group">
                  <label htmlFor="user">Email:</label>
                  <input
                    type="text"
                    id="user"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="text-center">
                  <a href="/Inicio-sesion">Volver al inicio de sesión</a>
                </div>

                <button type="submit" className="submit-button">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PasswordRecovery;
