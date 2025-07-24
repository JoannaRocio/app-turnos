import React, { createContext, useContext, useState } from 'react';
import { Patient } from '../../interfaces/Patient';
import './ProfessionalsComponent.scss';
import PatientModalComponent from '../PatientModal/PatientModalComponent';
import { Professional } from '../../interfaces/Professional';
import ProfessionalService from '../../services/ProfessionalService';
import ProfessionalModal from '../ProfessionalModal/ProfessionalModal';
import { User } from '../../interfaces/User';
import { useAuth } from '../../context/ContextAuth';

interface Props {
  professionals: Professional[];
  onProfessionalSelect: () => void;
}

const ProfessionalsComponent: React.FC<{
  professionals: Professional[];
  reloadProfessional: () => void;
}> = ({ professionals, reloadProfessional }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Partial<Professional> | null>(
    null
  );
  const { userRole } = useAuth();
  const isUsuario = userRole === 'USUARIO';
  const [showEditModal, setShowEditModal] = useState(false);

  const handleRowClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowEditModal(true);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(); // ej: "MONDAY"

  const formatSchedulesByDay = (schedules: Professional['schedules']): React.ReactNode => {
    if (!schedules || schedules.length === 0) return '-';

    const grouped: Record<string, { startTime: string; endTime: string }[]> = {};

    schedules.forEach(({ dayOfWeek, startTime, endTime }) => {
      if (!grouped[dayOfWeek]) grouped[dayOfWeek] = [];
      grouped[dayOfWeek].push({
        startTime: startTime.slice(0, 5),
        endTime: endTime.slice(0, 5),
      });
    });

    const dayLabels: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };

    const orderedDays = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const dayElements = orderedDays
      .filter((day) => grouped[day])
      .map((day) => {
        const label = dayLabels[day] || day;
        const isToday = day === today;
        return (
          <div key={day} className={`day-block ${isToday ? 'today-row' : ''}`}>
            <strong>{label}:</strong>
            <ul className="range-list">
              {grouped[day].map((r, i) => (
                <li key={i}>
                  {r.startTime} - {r.endTime}
                </li>
              ))}
            </ul>
          </div>
        );
      });

    const columns: React.ReactNode[][] = [];
    for (let i = 0; i < dayElements.length; i += 2) {
      const column = [dayElements[i]];
      if (dayElements[i + 1]) column.push(dayElements[i + 1]);
      columns.push(column);
    }

    return (
      <div className="schedule-grid-vertical">
        {columns.map((col, colIdx) => (
          <div
            className={`schedule-column ${colIdx % 2 === 0 ? 'bg-primary-c' : 'bg-secondary-c'}`}
            key={colIdx}
          >
            {col}
          </div>
        ))}
      </div>
    );
  };

  const handleSave = async (professionalData: Partial<Professional>) => {
    try {
      if (professionalData.professionalId) {
        await ProfessionalService.updateProfessional(
          professionalData.professionalId,
          professionalData
        );

        alert('Profesional actualizado con éxito');
      } else {
        await ProfessionalService.createProfessional(professionalData);

        alert('Profesional creado con éxito');
      }

      reloadProfessional();
      setShowEditModal(false);
      setSelectedProfessional(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message ?? 'Error inesperado al guardar el profesional');
    }
  };

  const handleNewProfessional = () => {
    const emptyProfessional: Partial<Professional> = {
      professionalId: 0,
      professionalName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      specialties: '',
    };
    setSelectedProfessional(emptyProfessional);
    setShowEditModal(true);
  };

  const filteredProfessional = professionals.filter((professional) => {
    const nameMatch = professional.professionalName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const dniMatch = professional.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
  });

  return (
    <section>
      <h2 className="text-white">Listado de profesionales</h2>

      <div className="d-flex justify-content-between">
        <h3 className="text-white">Profesionales</h3>
        {!isUsuario && (
          <button className="btn App-buttonTertiary" onClick={handleNewProfessional}>
            Nuevo
          </button>
        )}
      </div>

      <input
        type="text"
        className="form-control mb-3 filter-input"
        placeholder="Buscar por nombre o DNI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="appointments-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo documento</th>
            <th>Numero documento</th>
            <th>Teléfono</th>
            {/* <th>Horario de jornada</th> */}
            <th style={{ width: '350px' }}>Horario de jornada</th>
            <th>Especialidades</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map((professional, index) => (
            <tr
              key={index}
              onClick={() => {
                if (!isUsuario) handleRowClick(professional);
              }}
              className={!isUsuario ? 'clickable-row' : ''}
              // onClick={() => handleRowClick(professional)}
              // className="clickable-row"
            >
              <td>{professional?.professionalName || '-'}</td>
              <td>{professional?.documentType || '-'}</td>
              <td>{professional?.documentNumber || '-'}</td>
              <td>{professional?.phone || '-'}</td>
              <td>{formatSchedulesByDay(professional.schedules)}</td>
              <td>
                {Array.isArray(professional?.specialties)
                  ? professional.specialties.join(', ')
                  : professional?.specialties || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ProfessionalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        professional={selectedProfessional}
        onSave={handleSave}
      />
    </section>
  );
};

export default ProfessionalsComponent;
