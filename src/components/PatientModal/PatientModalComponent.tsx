import React, { useState, useEffect } from 'react';
import { Patient } from '../../interfaces/Patient';
import './PatientModalComponent.scss';
import HealthInsuranceService from '../../services/HealthInsuranceService';
import { HealthInsurance } from '../../interfaces/HealthInsurance';

interface PatientModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Partial<Patient> | null;
  onSave: (updated: Partial<Patient>) => void;
  isUpdating: boolean;
}

const PatientModalComponent: React.FC<PatientModalComponentProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  isUpdating,
}) => {
  const [form, setForm] = useState<{
    id?: number;
    fullName: string;
    documentType: string;
    documentNumber: string;
    healthInsuranceId: string;
    insurancePlanId: string;
    phone: string;
    email: string;
    note: string;
  }>({
    id: undefined,
    fullName: '',
    documentType: '',
    documentNumber: '',
    healthInsuranceId: '',
    insurancePlanId: '',
    phone: '',
    email: '',
    note: '',
  });

  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);

  useEffect(() => {
    const fetchHealthInsurances = async () => {
      try {
        const data = await HealthInsuranceService.getActive();
        setHealthInsurances(data);
      } catch (error) {
        console.error('Error cargando obras sociales', error);
      }
    };

    fetchHealthInsurances();
  }, []);

  useEffect(() => {
    if (patient) {
      setForm({
        id: patient.id || undefined,
        fullName: patient.fullName || '',
        documentType: patient.documentType || '',
        documentNumber: patient.documentNumber || '',
        healthInsuranceId: patient.healthInsuranceId?.toString() || '',
        insurancePlanId: patient.insurancePlanId?.toString() || '',
        phone: patient.phone || '',
        email: patient.email || '',
        note: patient.note || '',
      });
    } else {
      setForm({
        id: undefined,
        fullName: '',
        documentType: '',
        documentNumber: '',
        healthInsuranceId: '',
        insurancePlanId: '',
        phone: '',
        email: '',
        note: '',
      });
    }
  }, [patient]);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className={`modal-overlay ${patient?.id ? 'edit-mode' : ''}`}>
        <div className={`modal modal-patient ${patient?.id ? 'edit-mode' : ''}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave({
                ...form,
                healthInsuranceId: Number(form.healthInsuranceId),
                insurancePlanId: Number(form.insurancePlanId),
              });
            }}
            className="form-paciente"
          >
            <h4>{patient?.id ? 'Editar paciente' : 'Alta de paciente'}</h4>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="documentType">Nombre completo</label>
              <input
                id="patientName"
                type="text"
                value={form.fullName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
                  setForm({ ...form, fullName: onlyLetters });
                }}
                placeholder="Nombre completo"
              />
              {!form.fullName?.trim() && <span className="field-error">Campo obligatorio</span>}
            </div>

            <div className="form-row">
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
              </div>
              <div className="form-group">
                <label>Número documento</label>
                <input
                  type="text"
                  value={form.documentNumber}
                  onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                  placeholder="Número documento"
                />
                {!form.documentNumber?.trim() && (
                  <span className="field-error">Campo obligatorio</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Obra social</label>
                <select
                  value={form.healthInsuranceId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      healthInsuranceId: e.target.value,
                      insurancePlanId: '',
                    })
                  }
                >
                  <option value="">Seleccione una obra social</option>
                  {healthInsurances.map((insurance) => (
                    <option key={insurance.id} value={insurance.id}>
                      {insurance.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select
                  value={form.insurancePlanId}
                  onChange={(e) => setForm({ ...form, insurancePlanId: e.target.value })}
                  disabled={!form.healthInsuranceId}
                >
                  <option value="">Seleccione un plan</option>
                  {healthInsurances
                    .find((h) => h.id === Number(form.healthInsuranceId))
                    ?.plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Teléfono"
                />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notas</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Notas"
              />
            </div>

            <div className="d-flex justify-content-center align-items-center">
              <button
                className="modal-buttons"
                type="submit"
                disabled={!form.fullName || !form.documentNumber || isUpdating}
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

export default PatientModalComponent;
