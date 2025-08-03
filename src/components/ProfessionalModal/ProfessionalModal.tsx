import React, { useState, useEffect, useRef } from 'react';
import './ProfessionalModal.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalAvailabilityForm, {
  AvailabilityFormRef,
} from '../ProfessionalAbiavility/ProfessionalAvailability';
import { daysOfWeek } from '../../constants/daysOfWeek';
import SpecialtyService from '../../services/SpecialtyService';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Partial<Professional> | null;
  onSave: (updated: Partial<Professional>) => void;
  isUpdating: boolean;
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
  isUpdating,
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
  const availabilityRef = useRef<AvailabilityFormRef>(null);
  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await SpecialtyService.getAll();
        setSpecialties(data);
      } catch (err) {
        console.error('Error al cargar especialidades', err);
      }
    };

    loadSpecialties();
  }, []);

  useEffect(() => {
    if (professional) {
      setForm(professional);

      const availabilityMap: Record<string, TimeRange[]> = {};
      daysOfWeek.forEach((day) => {
        availabilityMap[day] = [];
      });

      professional.schedules?.forEach((s) => {
        const day = s.dayOfWeek;
        const start = s.startTime?.slice(0, 5);
        const end = s.endTime?.slice(0, 5);

        if (day && start && end) {
          availabilityMap[day].push({ start_time: start, end_time: end });
        }
      });

      daysOfWeek.forEach((day) => {
        if (availabilityMap[day].length === 0) {
          availabilityMap[day] = [{ start_time: '', end_time: '' }];
        }
      });

      setSavedAvailability(availabilityMap);
    }
  }, [professional]);

  if (!isOpen || !form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entries = availabilityRef.current?.getAvailabilityData() || [];
    const formattedSchedules = entries.map((entry) => ({
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
    }));

    const updatedForm = {
      ...form,
      schedules: formattedSchedules,
    };

    setForm(updatedForm);
    onSave(updatedForm);
  };

  return (
    <section>
      <div
        className={`modal-overlay-professionalModal ${professional?.professionalId ? 'edit-mode' : ''}`}
      >
        <div className={`modal modal-patient ${professional?.professionalId ? 'edit-mode' : ''}`}>
          <div className="modal-header">
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
              aria-label="Cerrar"
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '0.5rem',
              }}
            />
          </div>
          <form onSubmit={handleSubmit} className="form-paciente">
            <h4>{professional?.professionalId ? 'Editar profesional' : 'Alta de profesional'}</h4>

            {/* Nombre completo */}
            <div className="form-group">
              <label htmlFor="professionalName">Nombre completo</label>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentType">Tipo de documento</label>
                <select
                  id="documentType"
                  value={form.documentType}
                  onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                >
                  <option value="" disabled hidden>
                    Tipo de documento
                  </option>
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
              <div className="form-group">
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

            {/* Teléfono y especialidad */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  title="Solo se permiten números sin espacios"
                  value={form.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, '');
                    setForm({ ...form, phone: onlyNumbers });
                  }}
                  placeholder="Teléfono"
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialties">Especialidad</label>
                <select
                  id="specialties"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                >
                  <option value="">Seleccione una especialidad</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {!form.specialties && <span className="field-error">Campo obligatorio</span>}
              </div>
            </div>

            {/* Componente de disponibilidad */}
            {professional?.professionalId !== undefined && (
              <ProfessionalAvailabilityForm
                ref={availabilityRef}
                professionalId={professional.professionalId}
                initialAvailability={savedAvailability}
              />
            )}

            {/* Botones */}
            <div className="d-flex justify-content-center align-items-center">
              <button
                className="modal-buttons"
                type="submit"
                disabled={
                  !form.professionalName ||
                  !form.documentType ||
                  !form.documentNumber ||
                  !form.specialties ||
                  isUpdating
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
