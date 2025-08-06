// AppointmentConfirmation.tsx
import React, { useEffect, useState } from 'react';
import './AppointmentConfirmation.scss';
import { useParams, useLocation } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const AppointmentConfirmation: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel' | 'error' | 'invalid'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const { id: token } = useParams<{ id: string }>();
  const location = useLocation();

  useEffect(() => {
    const process = async () => {
      if (!token) {
        setStatus('invalid');
        setMessage('❌ Token inválido.');
        return;
      }
      try {
        if (location.pathname.includes('/confirm/')) {
          // Aquí se ejecuta el PATCH a /appointments/confirm/:token
          await AppointmentService.confirmAppointment(token);
          setStatus('success');
          setMessage('Turno confirmado con éxito.');
        } else if (location.pathname.includes('/cancel/')) {
          // Aquí se ejecuta el PATCH a /appointments/cancel/:token
          await AppointmentService.cancelAppointment(token);
          setStatus('cancel');
          setMessage('Turno cancelado con éxito.');
        } else {
          setStatus('invalid');
          setMessage('❌ Acción desconocida.');
        }
      } catch {
        setStatus('error');
        setMessage('❌ Hubo un error al procesar la acción.');
      }
    };

    process();
  }, [token, location.pathname]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <FaSpinner className="icon spin" />;
      case 'success':
        return <FaCheckCircle className="icon success" />;
      case 'cancel':
        return <FaTimesCircle className="icon cancel" />;
      case 'invalid':
      case 'error':
      default:
        return <FaTimesCircle className="icon error" />;
    }
  };

  return (
    <section className="confirmation-page">
      <div className="confirmation-card">
        {renderIcon()}
        <h2 className="title">
          {status === 'loading'
            ? 'Procesando...'
            : status === 'success'
              ? '¡Listo!'
              : status === 'cancel'
                ? 'Cancelado'
                : 'Atención'}
        </h2>
        <p className="message">{message}</p>
      </div>
    </section>
  );
};

export default AppointmentConfirmation;
