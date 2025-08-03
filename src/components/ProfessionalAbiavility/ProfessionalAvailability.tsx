import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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
  initialAvailability?: Record<string, TimeRange[]>;
  onChange?: () => void;
}

export interface AvailabilityFormRef {
  getAvailabilityData: () => AvailabilityEntry[];
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

const ProfessionalAvailabilityForm = forwardRef<AvailabilityFormRef, AvailabilityFormProps>(
  ({ professionalId, initialAvailability, onChange }, ref) => {
    const [availability, setAvailability] = useState<Record<string, TimeRange[]>>(() => {
      const initial: Record<string, TimeRange[]> = {};
      daysOfWeek.forEach((day) => {
        initial[day] = [{ start_time: '', end_time: '' }];
      });
      return initial;
    });

    useEffect(() => {
      if (initialAvailability) {
        setAvailability(() => {
          const updated: Record<string, TimeRange[]> = {};
          daysOfWeek.forEach((day) => {
            updated[day] = initialAvailability[day]?.length
              ? initialAvailability[day]
              : [{ start_time: '', end_time: '' }];
          });
          return updated;
        });
      }
    }, [initialAvailability]);

    useImperativeHandle(ref, () => ({
      getAvailabilityData: () => {
        const entries: AvailabilityEntry[] = [];
        Object.entries(availability).forEach(([day, ranges]) => {
          ranges.forEach(({ start_time, end_time }) => {
            if (start_time && end_time) {
              entries.push({
                professional_id: professionalId,
                day_of_week: day,
                start_time: start_time + ':00',
                end_time: end_time + ':00',
              });
            }
          });
        });
        return entries;
      },
    }));

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
      onChange?.();
    };

    const handleAddRange = (day: string) => {
      setAvailability((prev) => ({
        ...prev,
        [day]: [...prev[day], { start_time: '', end_time: '' }],
      }));
      onChange?.();
    };

    const handleRemoveRange = (day: string, index: number) => {
      setAvailability((prev) => {
        const updated = [...prev[day]];
        updated.splice(index, 1);
        return { ...prev, [day]: updated.length ? updated : [{ start_time: '', end_time: '' }] };
      });
      onChange?.();
    };

    const handleClearRange = (day: string, index: number) => {
      setAvailability((prev) => {
        const updated = [...prev[day]];
        updated[index] = { start_time: '', end_time: '' };
        return { ...prev, [day]: updated };
      });
      onChange?.();
    };

    const generateTimeOptions = () => {
      const options: string[] = [];
      for (let h = 7; h <= 20; h++) {
        for (let m = 0; m < 60; m += 15) {
          options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
      }
      return options;
    };

    const timeOptions = generateTimeOptions();

    return (
      <div className="availability-container">
        <h5 className="fw-bold">Disponibilidad del profesional</h5>
        <div className="table-responsive">
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
        </div>

        <div className="add-buttons-container">
          {daysOfWeek.map((day) => (
            <button
              key={`add-${day}`}
              type="button"
              onClick={() => handleAddRange(day)}
              className="btn-add"
            >
              <h6>+ Agregar horario</h6> {dayLabels[day]}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

export default ProfessionalAvailabilityForm;
