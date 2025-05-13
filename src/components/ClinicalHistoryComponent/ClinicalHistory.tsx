import React from "react";
import "./ClinicalHistory.scss";
import { ClinicalHistoryEntry } from "../../interfaces/ClinicalHistoryEntry";
import { Patient } from "../../interfaces/Patient";

interface Props {
  data: ClinicalHistoryEntry[];
  onBack: () => void;
  patient: Patient;
}

const ClinicalHistoryComponent: React.FC<Props> = ({ data, onBack, patient }) => {
  return (
    <section className="section-clinical">
        <div className="clinical-history-container">
        <button className="back-button" onClick={onBack}>← Volver</button>

        <div className="patient-card">
            <img src="/images/profile-pic.png" alt="Foto perfil" />
            <div className="details">
            <h2>{patient.fullName}</h2>
            <p><strong>Documento:</strong> {patient.documentType} {patient.documentNumber}</p>
            <p><strong>Obra Social:</strong> {patient.healthInsurance} - Plan {patient.insurancePlan}</p>
            <p><strong>Teléfono:</strong> {patient.phone}</p>
            <p><strong>Correo electrónico:</strong> {patient.email}</p>

            <p>
                <strong>Última visita:</strong>{" "}
                {patient.lastVisitDate
                ? new Date(patient.lastVisitDate).toLocaleDateString()
                : "Sin datos"}
            </p>
            {patient.note && <p><strong>Nota:</strong> {patient.note}</p>}
            </div>
        </div>

        <div className="history-list">
            <h3>Historial de atenciones</h3>
            {data.length === 0 ? (
            <p>No hay entradas de historia clínica.</p>
            ) : (
            data.map(entry => (
                <div key={entry.id} className="history-entry">
                <p><strong>Fecha de última actualización:</strong> {entry.date}</p>
                <p><strong>Profesional:</strong> {entry.professionalFullName}</p>
                <p><strong>Descripción:</strong> {entry.description}</p>
                <p><strong>Archivos adjuntos:</strong> {entry.state}</p>
                </div>
            ))
            )}
        </div>
        </div>
    </section>
  );
};

export default ClinicalHistoryComponent;
