import React, { useState, useEffect, useRef } from 'react';
import './ProfessionalModal.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalAvailabilityForm, {
  AvailabilityFormRef,
} from '../ProfessionalAbiavility/ProfessionalAvailability';
import { daysOfWeek } from '../../constants/daysOfWeek';
import SpecialtyService, { Specialty } from '../../services/SpecialtyService';
import Select, { MultiValue } from 'react-select';

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

type Option = { value: number; label: string };

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
    specialtyIds: [],
    schedules: [],
  });
  const [originalForm, setOriginalForm] = useState<Partial<Professional>>({});
  const [availabilityDirty, setAvailabilityDirty] = useState(false);
  const initSpec = useRef(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  useEffect(() => {
    SpecialtyService.getAll().then(setSpecialties);
  }, []);

  const options: Option[] = specialties.map((s) => ({
    value: s.id,
    label: Array.isArray(s.name) ? s.name.join(', ') : s.name,
  }));

  // --- Cuando cambia `professional`, prefill + guardo originalForm ---
  useEffect(() => {
    if (professional) {
      const loaded: Partial<Professional> = {
        professionalId: professional.professionalId ?? 0,
        professionalName: professional.professionalName ?? '',
        documentType: professional.documentType ?? '',
        documentNumber: professional.documentNumber ?? '',
        phone: professional.phone ?? '',
        specialtyIds: professional.specialtyIds ?? [],
        schedules: professional.schedules ?? [],
      };
      setForm(loaded);
      setOriginalForm(loaded);
      setAvailabilityDirty(false);
      initSpec.current = false;
    }
  }, [professional]);

  // Mapear specialtyNames → specialtyIds solo una vez
  useEffect(() => {
    if (professional && options.length && professional.specialtyNames && !initSpec.current) {
      const matched = options
        .filter((o) => professional.specialtyNames!.includes(o.label))
        .map((o) => o.value);
      setForm((f) => ({ ...f, specialtyIds: matched }));
      initSpec.current = true;
    }
  }, [options, professional]);

  // --- Disponibilidad ---
  const [savedAvailability, setSavedAvailability] = useState<Record<string, TimeRange[]>>({});
  const availabilityRef = useRef<AvailabilityFormRef>(null);

  useEffect(() => {
    if (professional) {
      const map: Record<string, TimeRange[]> = {};
      daysOfWeek.forEach((d) => (map[d] = []));
      professional.schedules?.forEach((s) => {
        map[s.dayOfWeek]?.push({
          start_time: s.startTime?.slice(0, 5) ?? '',
          end_time: s.endTime?.slice(0, 5) ?? '',
        });
      });
      daysOfWeek.forEach((d) => {
        if (!map[d].length) map[d] = [{ start_time: '', end_time: '' }];
      });
      setSavedAvailability(map);
    }
  }, [professional]);

  if (!isOpen) return null;

  // --- Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entries = availabilityRef.current?.getAvailabilityData() || [];
    const schedules = entries.map((e: { day_of_week: any; start_time: any; end_time: any }) => ({
      dayOfWeek: e.day_of_week,
      startTime: e.start_time,
      endTime: e.end_time,
    }));
    const updated: Partial<Professional> = { ...form, schedules };
    onSave(updated);
  };

  // --- Detectar cambios ---
  const formDirty = JSON.stringify(form) !== JSON.stringify(originalForm);
  const isDirty = formDirty || availabilityDirty;
  return (
    <section>
      <div className={`modal-overlay-professionalModal ${form.professionalId ? 'edit-mode' : ''}`}>
        <div className={`modal modal-patient ${form.professionalId ? 'edit-mode' : ''}`}>
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
            <h4>{form.professionalId ? 'Editar profesional' : 'Alta de profesional'}</h4>

            {/* Nombre */}
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

            {/* Documento */}
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
                {!form.documentNumber?.trim() && (
                  <span className="field-error">Campo obligatorio</span>
                )}
              </div>
            </div>

            {/* Teléfono y Especialidades */}
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
                <label htmlFor="specialties">Especialidades</label>
                <Select<Option, true>
                  inputId="specialties"
                  options={options}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  value={options.filter((o) => form.specialtyIds?.includes(o.value))}
                  onChange={(sel: MultiValue<Option>) =>
                    setForm({ ...form, specialtyIds: sel.map((o) => o.value) })
                  }
                  placeholder="Seleccioná especialidades…"
                />
                {!form.specialtyIds?.length && (
                  <span className="field-error">Debe seleccionar al menos una especialidad</span>
                )}
              </div>
            </div>

            {/* Disponibilidad */}
            {form.professionalId !== undefined && (
              <ProfessionalAvailabilityForm
                ref={availabilityRef}
                professionalId={form.professionalId}
                initialAvailability={savedAvailability}
                onChange={() => setAvailabilityDirty(true)}
              />
            )}

            {/* Botones */}
            <div className="d-flex justify-content-center align-items-center">
              <button className="modal-buttons" type="submit" disabled={!isDirty}>
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
