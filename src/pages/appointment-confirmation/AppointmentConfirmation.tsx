import React, { useEffect, useState } from 'react';
import './AppointmentConfirmation.scss';
import { useParams, useLocation } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';

const AppointmentConfirmation: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  useEffect(() => {
    const processAction = async () => {
      if (!id) {
        setStatusMessage('❌ ID inválido');
        setLoading(false);
        return;
      }

      try {
        if (location.pathname.includes('/confirm/')) {
          await AppointmentService.confirmAppointment(id); // ID es UUID string
          setStatusMessage('✅ Turno confirmado con éxito.');
        } else if (location.pathname.includes('/cancel/')) {
          await AppointmentService.cancelAppointment(id);
          setStatusMessage('🛑 Turno cancelado con éxito.');
        } else {
          setStatusMessage('❌ Acción desconocida.');
        }
      } catch (error) {
        setStatusMessage('❌ Hubo un error al procesar la acción.');
      } finally {
        setLoading(false);
      }
    };

    processAction();
  }, [id, location.pathname]);

  return (
    <section className="container-confirmation">
      <div className="confirmation-box">
        <h3 className="text-center">Confirmación de turno</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <p className="status-message">{statusMessage}</p>
            <p className="thank-you-message">Muchas gracias, puede cerrar esta ventana.</p>
          </>
        )}
      </div>
    </section>
  );
};

export default AppointmentConfirmation;
