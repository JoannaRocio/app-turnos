import React, { useState } from 'react';
import './ProfessionalsComponent.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalService from '../../services/ProfessionalService';
import ProfessionalModal from '../ProfessionalModal/ProfessionalModal';
import { useAuth } from '../../context/ContextAuth';

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
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowEditModal(true);
  };

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
    setIsUpdating(true);
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
      setIsUpdating(false);
    } catch (error: any) {
      console.error(error);
      setIsUpdating(false);
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
      <div className="d-flex justify-content-between">
        <h3 className="App-main-title text-white">Listado de profesionales</h3>
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

      <table className="App-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo documento</th>
            <th>Numero documento</th>
            <th>Teléfono</th>
            {/* <th>Horario de jornada</th> */}
            <th style={{ width: '350px' }}>Horario de jornada</th>
            <th>Especialidades</th>
            <th>De licencia</th>
            <th>Activo</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map((professional, index) => (
            <tr
              key={index}
              onClick={() => {
                if (!isUsuario) handleRowClick(professional);
              }}
              className={`${!isUsuario ? 'clickable-row' : ''} 
                            ${professional?.professionalState !== 'ACTIVE' ? 'inactive-row' : ''} 
                            ${index % 2 === 0 ? 'bg-primary-r' : 'bg-secondary-r'}`}
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
              <td>-</td>
              <td>
                {professional
                  ? professional.professionalState === 'ACTIVE'
                    ? 'Activo'
                    : 'No activo'
                  : '-'}
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
        isUpdating={isUpdating}
      />
    </section>
  );
};

export default ProfessionalsComponent;
