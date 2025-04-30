import React, { useState, useEffect } from "react";
import { Patient } from "../../interfaces/Patient";
import "./ProfessionalModal.scss";
import { Professional } from "../../interfaces/Professional";

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
    professionalName: "",
    documentType: "",
    professionalDni: "",
    phone: "",
    shiftStart: "",
    shiftEnd: "",
    unavailableHours: "",
    specialties: ""
  });
  
  useEffect(() => {
    if (professional) {
      setForm(professional);
    } else {
      setForm({
        professionalName: "",
        documentType: "",
        professionalDni: "",
        phone: "",
        shiftStart: "",
        shiftEnd: "",
        unavailableHours: "",
        specialties: ""
      });
    }
  }, [professional]);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className={`modal-overlay ${professional?.professionalId ? "edit-mode" : ""}`}>
        <div className={`modal modal-patient ${professional?.professionalId ? "edit-mode" : ""}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <h4>{professional?.professionalId ? "Editar profesional" : "Alta de profesional"}</h4>

            <input
              type="text"
              value={form.professionalName}
              onChange={(e) => setForm({ ...form, professionalName: e.target.value })}
              placeholder="Nombre completo"
            />
            <input
              type="text"
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              placeholder="Tipo documento"
            />
            <input
              type="text"
              value={form.professionalDni}
              onChange={(e) => setForm({ ...form, professionalDni: e.target.value })}
              placeholder="Número documento"
            />
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono"
            />
            <input
              type="time"
              value={form.shiftStart}
              onChange={(e) =>
                setForm({ ...form, shiftStart: e.target.value + ":00" })
              }
              placeholder="Hora comienzo"
            />

            <input
              type="time"
              value={form.shiftEnd}
              onChange={(e) =>
                setForm({ ...form, shiftEnd: e.target.value + ":00" })
              }
              placeholder="Hora salida"
            />
            <input
              type="text"
              value={form.unavailableHours}
              onChange={(e) => setForm({ ...form, unavailableHours: e.target.value })}
              placeholder="Horario no disponible"
            />
            <input
              type="text"
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              placeholder="Especialidades"
            />
            <div className="modal-buttons">
              <button type="submit" disabled={!form.professionalName || !form.professionalDni}>Guardar</button>
              <button type="button" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalModal;
