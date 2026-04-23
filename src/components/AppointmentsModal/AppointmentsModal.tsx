import React, { useEffect } from 'react';
import './AppointmentsModal.scss';

interface Appointment {
  id: number;
  date?: string;
  time?: string;
  professionalName?: string;
  reason?: string;
  state?: string;
}

interface AppointmentsModalProps {
  show: boolean;
  onClose: () => void;
  patientName?: string;
  patientDni?: number | string;
  appointments: Appointment[];
  loading?: boolean;
}

const AppointmentsModal: React.FC<AppointmentsModalProps> = ({
  show,
  onClose,
  patientName,
  patientDni,
  appointments,
  loading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="d-flex flex-column">
            <h5>Turnos de {patientName || 'paciente'}</h5>
            <h6>DNI {patientDni || '-'}</h6>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="text-center">Cargando turnos...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center">No hay turnos para este paciente.</p>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{formatDate(appt.date ?? '-')}</td>
                    <td>{appt.time ?? '-'}</td>
                    <td>{appt.professionalName ?? '-'}</td>
                    <td>{appt.state ?? '-'}</td>
                    <td className="truncate-cell" title={appt.reason ?? '-'}>
                      {appt.reason ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-buttons" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsModal;
