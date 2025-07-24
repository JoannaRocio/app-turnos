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
}

const PatientModalComponent: React.FC<PatientModalComponentProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
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
          >
            <h4>{patient?.id ? 'Editar paciente' : 'Alta de paciente'}</h4>

            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              placeholder="Tipo documento"
            />
            <input
              type="text"
              value={form.documentNumber}
              onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
              placeholder="Número documento"
            />

            <select
              value={form.healthInsuranceId}
              onChange={(e) =>
                setForm({
                  ...form,
                  healthInsuranceId: e.target.value,
                  insurancePlanId: '', // resetea plan cuando cambia obra social
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

            <input
              type="number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Correo electrónico"
            />
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Notas"
            />
            <div className="modal-buttons">
              <button type="submit" disabled={!form.fullName || !form.documentNumber}>
                Guardar
              </button>
              <button type="button" onClick={onClose}>
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
