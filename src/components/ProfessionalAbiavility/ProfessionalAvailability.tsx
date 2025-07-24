import React, { useEffect, useState } from 'react';
import './ProfessionalAvailability.scss';

interface TimeRange {
  start_time: string;
  end_time: string;
}

interface AvailabilityEntry {
  professional_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface AvailabilityFormProps {
  professionalId: number;
  onSubmit: (data: AvailabilityEntry[], validDays: string[]) => void;
  initialAvailability?: Record<string, TimeRange[]>;
}

const daysOfWeek: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const dayLabels: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
};

const ProfessionalAvailabilityForm: React.FC<AvailabilityFormProps> = ({
  professionalId,
  onSubmit,
  initialAvailability,
}) => {
  const [availability, setAvailability] = useState<Record<string, TimeRange[]>>(() => {
    const initial: Record<string, TimeRange[]> = {};
    daysOfWeek.forEach((day) => {
      initial[day] = [{ start_time: '', end_time: '' }];
    });
    return initial;
  });

  const handleTimeChange = (
    day: string,
    index: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setAvailability((prev) => {
      const updated = [...prev[day]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [day]: updated };
    });
  };

  const handleAddRange = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start_time: '', end_time: '' }],
    }));
  };

  const handleRemoveRange = (day: string, index: number) => {
    setAvailability((prev) => {
      const updated = [...prev[day]];
      updated.splice(index, 1);
      return { ...prev, [day]: updated.length > 0 ? updated : [{ start_time: '', end_time: '' }] };
    });
  };

  useEffect(() => {
    if (initialAvailability) {
      setAvailability((prev) => {
        const updated: Record<string, TimeRange[]> = {};

        daysOfWeek.forEach((day) => {
          if (initialAvailability[day]?.length) {
            updated[day] = initialAvailability[day];
          } else {
            updated[day] = [{ start_time: '', end_time: '' }];
          }
        });

        return updated;
      });
    }
  }, [initialAvailability]);

  const handleSubmit = () => {
    const entries: AvailabilityEntry[] = [];
    const validDays: string[] = [];

    for (const [day, ranges] of Object.entries(availability)) {
      let hasValid = false;

      ranges.forEach(({ start_time, end_time }) => {
        if (start_time && end_time) {
          entries.push({
            professional_id: professionalId,
            day_of_week: day,
            start_time: start_time + ':00',
            end_time: end_time + ':00',
          });
          hasValid = true;
        }
      });

      if (hasValid) validDays.push(day);
    }

    if (entries.length === 0) {
      alert('Por favor, completá al menos una franja horaria válida.');
      return;
    }

    onSubmit(entries, validDays);
  };

  const handleClearRange = (day: string, index: number) => {
    setAvailability((prev) => {
      const updated = [...prev[day]];
      updated[index] = { start_time: '', end_time: '' }; // limpia solo esa franja
      return { ...prev, [day]: updated };
    });
  };

  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let h = 7; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        // <-- Cambiado a 15 minutos
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="availability-container">
      <h5>Disponibilidad del profesional</h5>
      <table className="availability-table">
        <thead>
          <tr>
            <th>Día</th>
            <th>Hora inicio</th>
            <th>Hora fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day) =>
            (availability[day] || []).map((range, idx) => (
              <tr key={`${day}-${idx}`}>
                {idx === 0 && (
                  <td rowSpan={(availability[day] || []).length} className="day-label">
                    {dayLabels[day] || day}
                  </td>
                )}
                <td>
                  <input
                    list="horarios"
                    value={range.start_time}
                    onChange={(e) => handleTimeChange(day, idx, 'start_time', e.target.value)}
                    placeholder="--:--"
                    pattern="^([01]\d|2[0-3]):([0-5][0-9])$"
                    title="Formato HH:MM (00:00 a 23:59)"
                  />
                </td>
                <td>
                  <input
                    list="horarios"
                    value={range.end_time}
                    onChange={(e) => handleTimeChange(day, idx, 'end_time', e.target.value)}
                    placeholder="--:--"
                    pattern="^([01]\d|2[0-3]):([0-5][0-9])$"
                    title="Formato HH:MM (00:00 a 23:59)"
                  />
                  <datalist id="horarios">
                    {timeOptions.map((time) => (
                      <option key={time} value={time} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleRemoveRange(day, idx)}
                    disabled={availability[day].length === 1}
                    title={
                      availability[day].length === 1
                        ? 'Debe tener al menos una franja'
                        : 'Eliminar franja'
                    }
                    className="btn-remove"
                  >
                    ✕
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearRange(day, idx)}
                    className="btn-clear-day"
                    title="Limpiar esta franja horaria"
                    disabled={!range.start_time && !range.end_time}
                  >
                    🧹
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="add-buttons-container">
        {daysOfWeek.map((day) => (
          <button
            key={`add-${day}`}
            type="button"
            onClick={() => handleAddRange(day)}
            className="btn-add"
          >
            <h6>+ Agregar horario</h6> {day}
          </button>
        ))}
      </div>

      <div className="save-button-container">
        <button type="button" className="btn-save" onClick={handleSubmit}>
          Guardar disponibilidad
        </button>
      </div>
    </div>
  );
};

export default ProfessionalAvailabilityForm;
