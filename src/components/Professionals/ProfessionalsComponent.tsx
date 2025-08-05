import React, { useState } from 'react';
import './ProfessionalsComponent.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalService from '../../services/ProfessionalService';
import ProfessionalModal from '../ProfessionalModal/ProfessionalModal';
import { useAuth } from '../../context/ContextAuth';
import { toast } from 'react-toastify';

const ProfessionalsComponent: React.FC<{
  allProfessionals: Professional[];
  reloadAllProfessionals: () => void;
  reloadActiveProfessionals: () => void;
}> = ({ allProfessionals, reloadAllProfessionals, reloadActiveProfessionals }) => {
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

        toast.success('Profesional actualizado con éxito');
      } else {
        await ProfessionalService.createProfessional(professionalData);

        toast.success('Profesional creado con éxito');
      }

      reloadAllProfessionals();
      reloadActiveProfessionals();
      setShowEditModal(false);
      setSelectedProfessional(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? '❌ Error inesperado al guardar el profesional');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewProfessional = () => {
    const emptyProfessional: Partial<Professional> = {
      professionalId: 0,
      professionalName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      specialties: [],
    };
    setSelectedProfessional(emptyProfessional);
    setShowEditModal(true);
  };

  const filteredProfessional = allProfessionals.filter((allProfessionals) => {
    const nameMatch = allProfessionals.professionalName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const dniMatch = allProfessionals.documentNumber?.toString().includes(searchTerm);
    return nameMatch || dniMatch;
  });

  const handleToggleProfessional = async (docNum: string, currentlyActive: boolean) => {
    setIsUpdating(true);
    try {
      if (currentlyActive) {
        await ProfessionalService.disableByDocument(docNum);
        toast.success('Profesional deshabilitado.');
      } else {
        await ProfessionalService.enableByDocument(docNum);
        toast.success('Profesional habilitado.');
      }
      // refrescá la lista de profesionales aquí, p.ej. llamando a tu carga de datos
      await reloadAllProfessionals();
      setIsUpdating(false);
    } catch (err: any) {
      setIsUpdating(false);
      toast.error(err.message || 'Error al cambiar el estado del profesional.');
    }
  };

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
        className="form-control mb-3 filter-input w-100"
        placeholder="Buscar por nombre o DNI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {allProfessionals.length === 0 ? (
        <p className="no-patients-message">No hay profesionales disponibles.</p>
      ) : (
        <div className="table-responsive">
          <table className="App-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo documento</th>
                <th>Numero documento</th>
                <th>Teléfono</th>
                {/* <th>Horario de jornada</th> */}
                <th className="desktop-w">Horario de jornada</th>
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
                  <td>
                    <span className="ellipsis-cell" title={professional?.professionalName}>
                      {professional?.professionalName || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={professional?.documentType}>
                      {professional?.documentType || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={professional?.documentNumber}>
                      {professional?.documentNumber || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="ellipsis-cell" title={professional?.phone}>
                      {professional?.phone || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="scrollable-cell">
                      {formatSchedulesByDay(professional.schedules)}
                    </div>
                  </td>
                  <td>
                    <div
                      className="ellipsis-cell"
                      title={professional?.specialtyNames?.join(', ') ?? '-'}
                    >
                      {professional?.specialtyNames?.length
                        ? professional.specialtyNames.map((name) => <div key={name}>{name}</div>)
                        : '-'}
                    </div>
                  </td>

                  <td>-</td>
                  <td className="text-center truncate-cell" onClick={(e) => e.stopPropagation()}>
                    <span title={professional.professionalState === 'ACTIVE' ? 'Si' : 'No'}>
                      {professional.professionalState == null ? (
                        '-'
                      ) : (
                        <div className="d-flex justify-content-center align-items-center guest-cell">
                          <span className="guest-text me-2">
                            {professional.professionalState === 'ACTIVE' ? 'Sí' : 'No'}
                          </span>
                          <div className="form-check form-switch guest-switch m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id={`guestSwitch-${professional.professionalId}`}
                              checked={professional.professionalState === 'ACTIVE'}
                              disabled={isUpdating}
                              onChange={() =>
                                handleToggleProfessional(
                                  professional.documentNumber!,
                                  professional.professionalState === 'ACTIVE'
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`guestSwitch-${professional.professionalId}`}
                              aria-label="Habilitar o deshabilitar"
                            />
                          </div>
                        </div>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
