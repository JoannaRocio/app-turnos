import React, { useState, useEffect } from "react";
import { Patient } from "../../interfaces/Patient";
import "./PatientModalComponent.scss";

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

  const [form, setForm] = useState<Partial<Patient>>({
    fullName: "",
    documentType: "",
    documentNumber: "",
    socialSecurity: "",
    plan: "",
    phone: "",
    notes: "",
  });
  
  useEffect(() => {
    if (patient) {
      setForm(patient);
    } else {
      setForm({
        fullName: "",
        documentType: "",
        documentNumber: "",
        socialSecurity: "",
        plan: "",
        phone: "",
        notes: "",
      });
    }
  }, [patient]);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className={`modal-overlay ${patient?.id ? "edit-mode" : ""}`}>
        <div className={`modal modal-patient ${patient?.id ? "edit-mode" : ""}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <h4>{patient?.id ? "Editar paciente" : "Alta de paciente"}</h4>

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
            <div className="modal-buttons">
              <button type="submit" disabled={!form.fullName || !form.documentNumber}>Guardar</button>
              <button type="button" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PatientModalComponent;
