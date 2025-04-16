import React, { useState } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientModalComponent.scss";

// Esto sería tu modal reutilizable o uno simple:
const PatientModalComponent = ({
  isOpen,
  onClose,
  patient,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (updated: Patient) => void;
}) => {
  const [form, setForm] = useState<Patient | null>(patient);

  React.useEffect(() => {
    setForm(patient);
  }, [patient]);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className="modal-overlay">
        <div className="modal modal-patient">
          <form>
            <h4>Editar paciente</h4>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              placeholder="DNI"
            />
            <input
              type="text"
              value={form.socialSecurity}
              onChange={(e) => setForm({ ...form, socialSecurity: e.target.value })}
              placeholder="Obra social"
            />
            <input
              type="text"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              placeholder="Plan"
            />
            <input
              type="number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono"
            />
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas"
            />
            <button onClick={() => onSave(form)}>Guardar</button>
            <button onClick={onClose}>Cancelar</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PatientModalComponent;