import React, { useState } from 'react';
import './AppointmentConfirmation.scss';
import { useParams } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';

const AppointmentConfirmation: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await AppointmentService.confirmAppointment(Number(id));
      setStatusMessage('✅ Turno confirmado con éxito.');
    } catch (error) {
      setStatusMessage('❌ Hubo un error al confirmar el turno.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await AppointmentService.cancelAppointment(Number(id));
      setStatusMessage('🛑 Turno cancelado con éxito.');
    } catch (error) {
      setStatusMessage('❌ Hubo un error al cancelar el turno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-confirmation">
      <div className="confirmation-box">
        <h3 className="text-center">Confirmación de turno</h3>
        <p>ID del turno: {id}</p>

        {statusMessage && <p className="status-message">{statusMessage}</p>}

        {!statusMessage && (
          <>
            <p>¿Deseás confirmar o cancelar este turno?</p>
            <div className="button-group">
              <button className="btn btn-confirm" onClick={handleConfirm} disabled={loading}>
                Confirmar
              </button>
              <button className="btn btn-cancel" onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {statusMessage && (
          <>
            <p className="thank-you-message">Muchas gracias, puede cerrar esta ventana.</p>
          </>
        )}
      </div>
    </section>
  );
};

export default AppointmentConfirmation;
