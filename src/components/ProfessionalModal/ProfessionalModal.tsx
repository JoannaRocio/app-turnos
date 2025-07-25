import React, { useState, useEffect } from 'react';
import './ProfessionalModal.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalAvailabilityForm from '../ProfessionalAbiavility/ProfessionalAvailability';
import { daysOfWeek } from '../../constants/daysOfWeek';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Partial<Professional> | null;
  onSave: (updated: Partial<Professional>) => void;
}

interface TimeRange {
  start_time: string;
  end_time: string;
}

const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  isOpen,
  onClose,
  professional,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<Professional>>({
    professionalId: 0,
    professionalName: '',
    documentType: '',
    documentNumber: '',
    phone: '',
    specialties: '',
    schedules: [],
  });

  const [savedAvailability, setSavedAvailability] = useState<Record<string, TimeRange[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [savedDays, setSavedDays] = useState<string[]>([]);

  useEffect(() => {
    if (professional) {
      setForm(professional);

      // Convertimos schedules a availability agrupado por día
      const availabilityMap: Record<string, TimeRange[]> = {};
      daysOfWeek.forEach((day) => {
        availabilityMap[day] = [];
      });

      professional.schedules?.forEach((s) => {
        const day = s.dayOfWeek;
        const start = s.startTime?.slice(0, 5); // HH:MM
        const end = s.endTime?.slice(0, 5); // HH:MM

        if (day && start && end) {
          availabilityMap[day].push({ start_time: start, end_time: end });
        }
      });

      // Si algún día quedó vacío, aseguramos un slot en blanco
      daysOfWeek.forEach((day) => {
        if (availabilityMap[day].length === 0) {
          availabilityMap[day] = [{ start_time: '', end_time: '' }];
        }
      });

      setSavedAvailability(availabilityMap);
    }
  }, [professional]);

  if (!isOpen || !form) return null;

  const handleSaveAvailability = (data: any[]) => {
    const formattedSchedules = data.map((entry) => ({
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
    }));

    console.log('Formatted schedules:', formattedSchedules);

    setForm((prev) => ({
      ...prev,
      schedules: formattedSchedules,
    }));

    const availabilityByDay: Record<string, TimeRange[]> = {};

    daysOfWeek.forEach((day) => {
      availabilityByDay[day] = [];
    });

    formattedSchedules.forEach((schedule) => {
      const { dayOfWeek, startTime, endTime } = schedule;
      if (availabilityByDay[dayOfWeek]) {
        availabilityByDay[dayOfWeek].push({
          start_time: startTime.slice(0, 5),
          end_time: endTime.slice(0, 5),
        });
      }
    });

    setSavedAvailability(availabilityByDay);
  };

  return (
    <section>
      <div
        className={`modal-overlay-professionalModal
           ${professional?.professionalId ? 'edit-mode' : ''}`}
      >
        <div className={`modal modal-patient ${professional?.professionalId ? 'edit-mode' : ''}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Form al guardar:', form); // ← esto debería mostrar los schedules
              onSave(form);
            }}
          >
            <h4>{professional?.professionalId ? 'Editar profesional' : 'Alta de profesional'}</h4>
            {/* Nombre completo */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="documentType">Nombre completo</label>
              <input
                id="professionalName"
                type="text"
                value={form.professionalName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
                  setForm({ ...form, professionalName: onlyLetters });
                }}
                placeholder="Nombre completo"
              />
              {!form.professionalName?.trim() && (
                <span className="field-error">Campo obligatorio</span>
              )}
            </div>
            {/* Tipo y número de documento */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="documentType">Tipo de documento</label>
                <select
                  id="documentType"
                  value={form.documentType}
                  onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                >
                  <option value="">Tipo de documento</option>
                  <option value="DNI">DNI</option>
                  <option value="Libreta de Enrolamiento">Libreta de Enrolamiento</option>
                  <option value="Libreta Cívica">Libreta Cívica</option>
                  <option value="Cédula de Identidad">Cédula de Identidad</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Otro">Otro</option>
                </select>
                {!form.documentType && <span className="field-error">Campo obligatorio</span>}
              </div>

              <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="documentNumber">Número de documento</label>
                <input
                  id="documentNumber"
                  type="text"
                  value={form.documentNumber}
                  onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                  placeholder="Número de documento"
                />
                {(!form.documentNumber || !form.documentNumber.toString().trim()) && (
                  <span className="field-error">Campo obligatorio</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Teléfono */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  title="Solo se permiten números sin espacios"
                  value={form.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, ''); // elimina todo lo que no sea número
                    setForm({ ...form, phone: onlyNumbers });
                  }}
                  placeholder="Teléfono"
                />
              </div>

              {/* Especialidades */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="specialties">Especialidad</label>
                <select
                  id="specialties"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                >
                  <option value="">Seleccione una especialidad</option>
                  <option value="Dentista">Dentista</option>
                  <option value="Ortodoncista">Ortodoncista</option>
                  <option value="Endodoncista">Endodoncista</option>
                </select>
                {!form.specialties && <span className="field-error">Campo obligatorio</span>}
              </div>
            </div>

            {professional?.professionalId !== undefined && (
              <ProfessionalAvailabilityForm
                professionalId={professional?.professionalId}
                onSubmit={handleSaveAvailability}
                initialAvailability={savedAvailability}
              />
            )}

            <div className="d-flex justify-content-center align-items-center">
              <button
                className="modal-buttons"
                type="submit"
                disabled={
                  !form.professionalName ||
                  !form.documentType ||
                  !form.documentNumber ||
                  !form.specialties
                }
              >
                Guardar
              </button>
              <button className="modal-buttons" type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalModal;
