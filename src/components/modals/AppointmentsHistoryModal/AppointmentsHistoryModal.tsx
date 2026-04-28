import React, { useEffect } from 'react';
import './AppointmentsHistoryModal.scss';
import useLockBodyScroll from '../../../hooks/useLockBodyScroll';

interface Appointment {
  id: number;
  date?: string;
  time?: string;
  professionalName?: string;
  reason?: string;
  state?: string;
}

interface AppointmentsHistoryModalProps {
  show: boolean;
  onClose: () => void;
  patientName?: string;
  patientDni?: number | string;
  appointments: Appointment[];
  loading?: boolean;
}

const AppointmentsHistoryModal: React.FC<AppointmentsHistoryModalProps> = ({
  show,
  onClose,
  patientName,
  patientDni,
  appointments,
  loading = false,
}) => {
  useLockBodyScroll(show);

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
  }, [show, onClose, appointments]);

  if (!show) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';

    const [year, month, day] = dateString.split('-').map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateTimeA = `${a.date} ${a.time}`;
    const dateTimeB = `${b.date} ${b.time}`;

    return dateTimeA.localeCompare(dateTimeB);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="app-modal modal-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="d-flex flex-column">
            <h5>Turnos de {patientName || 'paciente'}</h5>
            <h6>DNI {patientDni || '-'}</h6>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal">
            X
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
                  <th className="col-fecha">Fecha</th>
                  <th className="col-hora">Hora</th>
                  <th className="col-profesional">Profesional</th>
                  <th className="col-estado">Estado</th>
                  <th className="col-motivo">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="truncate-cell">{formatDate(appt.date ?? '-')}</td>
                    <td className="truncate-cell">{appt.time ?? '-'}</td>
                    <td className="truncate-cell">{appt.professionalName ?? '-'}</td>
                    <td className="truncate-cell">{appt.state ?? '-'}</td>
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

export default AppointmentsHistoryModal;
