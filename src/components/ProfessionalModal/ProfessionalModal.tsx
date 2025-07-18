import React, { useState, useEffect } from 'react';
import { Patient } from '../../interfaces/Patient';
import './ProfessionalModal.scss';
import { Professional } from '../../interfaces/Professional';
import ProfessionalAvailabilityForm from '../ProfessionalAbiavility/ProfessionalAvailability';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  // professional: Partial<Professional>;
  professional: Partial<Professional> | null;

  onSave: (updated: Partial<Professional>) => void;
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
    professionalDni: '',
    phone: '',
    shiftStart: '',
    shiftEnd: '',
    unavailableHours: '',
    specialties: '',
  });
  const [savedAvailability, setSavedAvailability] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (professional) {
      setForm(professional);
    } else {
      setForm({
        professionalName: '',
        documentType: '',
        professionalDni: '',
        phone: '',
        shiftStart: '',
        shiftEnd: '',
        unavailableHours: '',
        specialties: '',
      });
    }
  }, [professional]);

  if (!isOpen || !form) return null;

  // Definí esta función para manejar el submit del formulario
  const handleSaveAvailability = (data: any[]) => {
    console.log('Disponibilidad guardada:', data);
    setSavedAvailability(data);
    // Acá podés hacer llamada a API para guardar la data
    onClose(); // cerrar modal después de guardar
  };

  return (
    <section>
      <div className={`modal-overlay ${professional?.professionalId ? 'edit-mode' : ''}`}>
        <div className={`modal modal-patient ${professional?.professionalId ? 'edit-mode' : ''}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <h4>{professional?.professionalId ? 'Editar profesional' : 'Alta de profesional'}</h4>
            {/* Nombre completo */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  <option value="Documento Nacional de Identidad">
                    Documento Nacional de Identidad
                  </option>
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
                <label htmlFor="professionalDni">Número de documento</label>
                <input
                  id="professionalDni"
                  type="text"
                  value={form.professionalDni}
                  onChange={(e) => setForm({ ...form, professionalDni: e.target.value })}
                  placeholder="Número de documento"
                />
                {(!form.professionalDni || !form.professionalDni.toString().trim()) && (
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

            {/* Formulario de disponibilidad horaria */}
            {professional?.professionalId !== undefined && (
              <ProfessionalAvailabilityForm
                professionalId={professional?.professionalId}
                onSubmit={handleSaveAvailability}
              />
            )}

            <div className="d-flex justify-content-center align-items-center">
              <button
                className="modal-buttons"
                type="submit"
                disabled={
                  !form.professionalName ||
                  !form.documentType ||
                  !form.professionalDni ||
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
