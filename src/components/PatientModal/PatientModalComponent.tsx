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
    full_name: "",
    document_type: "",
    document_number: "",
    health_insurance: "",
    insurance_plan: "",
    phone: "",
    note: ""
  });
  
  useEffect(() => {
    if (patient) {
      setForm(patient);
    } else {
      setForm({
        full_name: "",
        document_type: "",
        document_number: "",
        health_insurance: "",
        insurance_plan: "",
        phone: "",
        note: ""
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
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={form.document_type}
              onChange={(e) => setForm({ ...form, document_type: e.target.value })}
              placeholder="Tipo documento"
            />
            <input
              type="text"
              value={form.document_number}
              onChange={(e) => setForm({ ...form, document_number: e.target.value })}
              placeholder="Número documento"
            />
            <input
              type="text"
              value={form.health_insurance}
              onChange={(e) => setForm({ ...form, health_insurance: e.target.value })}
              placeholder="Obra social"
            />
            <input
              type="text"
              value={form.insurance_plan}
              onChange={(e) => setForm({ ...form, insurance_plan: e.target.value })}
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
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Notas"
            />
            <div className="modal-buttons">
              <button type="submit" disabled={!form.full_name || !form.document_number}>Guardar</button>
              <button type="button" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PatientModalComponent;
