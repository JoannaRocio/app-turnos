import React, { useState } from 'react';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import { Patient } from '../../interfaces/Patient';
import './ClinicalHistory.scss';
import { Professional } from '../../interfaces/Professional';
import ConfirmModal from '../ConfirmModal/ConfirmModalComponent';

interface Props {
  data: ClinicalHistoryEntry[];
  onBack: () => void;
  patient: Patient;
  professionalId: number;
}

interface Service {
  id: number;
  name: string;
}

// Lista de tratamientos disponibles
const availableTreatments: Service[] = [
  { id: 1, name: 'Limpieza de sarro' },
  { id: 2, name: 'Extracción de carie' },
  { id: 3, name: 'Extracción de muela' },
  { id: 4, name: 'Colocación de resina' },
  { id: 5, name: 'Tratamiento de conducto' },
  { id: 6, name: 'Profilaxis dental' },
  { id: 7, name: 'Blanqueamiento dental' },
  { id: 8, name: 'Colocación de corona' },
  { id: 9, name: 'Colocación de puente' },
  { id: 10, name: 'Ortodoncia' },
  { id: 11, name: 'Radiografía panorámica' },
  { id: 12, name: 'Extracción de diente de leche' },
  { id: 13, name: 'Colocación de implante' },
  { id: 14, name: 'Control de rutina' },
  { id: 15, name: 'Aplicación de flúor' },
];

const ClinicalHistoryComponent: React.FC<Props> = ({ data, onBack, patient, professionalId }) => {
  // Cartel de confirmación para eliminar Historia clinica
  const [showConfirm, setShowConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ClinicalHistoryEntry | null>(null);

  const handleDeleteConfirmed = async (entry: ClinicalHistoryEntry) => {
    try {
      await ClinicalHistoryService.deleteEntry(entry.id);

      const updated = entries.filter((e) => e.id !== entry.id);
      setEntries(updated);
    } catch (err: any) {
      console.error('Error al eliminar:', err);
    } finally {
      setShowConfirm(false);
      setEntryToDelete(null);
    }
  };

  // Tratamiento
  const [selectedTreatments, setSelectedTreatments] = useState<number[]>([]);

  const [selectedId, setSelectedId] = useState<number | ''>('');

  // Agrega tratamiento si no está ya seleccionado
  const handleAddTreatment = () => {
    const id = Number(selectedId);
    if (id && !selectedTreatments.includes(id)) {
      console.log(selectedTreatments);
      setSelectedTreatments([...selectedTreatments, id]);
    }
    setSelectedId('');
  };

  // Elimina un tratamiento de los seleccionados
  const handleRemoveTreatment = (id: number) => {
    setSelectedTreatments(selectedTreatments.filter((t) => t !== id));
  };

  // Entrada nueva
  const [entries, setEntries] = useState(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (selectedTreatments.length === 0) {
      setError('Debés seleccionar al menos un tratamiento antes de guardar.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Crear historia clínica (no devuelve ID)
      await ClinicalHistoryService.createClinicalHistory(
        patient,
        notes,
        professionalId,
        selectedTreatments
      );

      // 2. Obtener historia clínica para encontrar la nueva entrada
      let updated = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      let latestEntry = Array.isArray(updated) ? updated[updated.length - 1] : null;

      // 3. Subir archivos
      if (latestEntry?.id && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await ClinicalHistoryService.uploadFile(latestEntry.id, file);
        }

        // ⚠️ Volver a obtener la historia clínica con archivos ya subidos
        updated = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      }

      // 4. Actualizar estado
      setEntries(updated);

      // 5. Reset
      setNotes('');
      setUploadedFiles([]);
      setSelectedTreatments([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar la entrada clínica.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar archivos

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Evitar archivos duplicados (opcional)
      const combined = [...uploadedFiles, ...newFiles];
      const uniqueFiles = Array.from(new Map(combined.map((f) => [f.name + f.size, f])).values());

      setUploadedFiles(uniqueFiles);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <section className="container my-4">
      <button
        className="btn btn-secondary btn-lg mb-3 btn-guardar-clinicalHistory"
        onClick={onBack}
      >
        ← Volver
      </button>

      <div className="card mb-4">
        <div className="row g-0">
          <div className="col-md-3 d-flex align-items-center justify-content-center p-3">
            <img
              src="/images/profile-pic.png"
              alt="Foto perfil"
              className="img-fluid rounded-circle"
            />
          </div>
          <div className="col-md-9">
            <div className="card-body">
              <h2 className="card-title">{patient.fullName}</h2>
              <p>
                <strong>Documento:</strong> {patient.documentType} {patient.documentNumber}
              </p>
              <p>
                <strong>Obra Social:</strong> {patient.healthInsuranceName || '-'}
              </p>
              <p>
                <strong>Plan:</strong> {patient.insurancePlanName || '-'}
              </p>
              <p>
                <strong>Teléfono:</strong> {patient.phone || '-'}
              </p>
              <p>
                <strong>Correo electrónico:</strong> {patient.email || '-'}
              </p>
              <p>
                <strong>Última visita:</strong>{' '}
                {patient.lastVisitDate
                  ? new Date(patient.lastVisitDate).toLocaleDateString()
                  : 'Sin datos'}
              </p>
              {patient.note && (
                <p>
                  <strong>Nota:</strong> {patient.note}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-lg p-4 mb-5 bg-body rounded">
        <h3 className="mb-4 clinical-title">📝 Nueva entrada clínica</h3>

        {/* Tratamiento */}
        <div className="mb-4">
          <label htmlFor="treatmentSelect" className="form-label clinical-subtitle fw-bold fs-3">
            Tratamientos disponibles:
          </label>
          <div className="input-group">
            <select
              id="treatmentSelect"
              className="form-select form-select-lg"
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              <option value="">Seleccione un tratamiento...</option>
              {availableTreatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={handleAddTreatment}
              disabled={!selectedId}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Tratamientos seleccionados */}
        {selectedTreatments.length > 0 && (
          <div className="mb-4">
            <label className="form-label clinical-subtitle fw-bold fs-4">
              Tratamientos seleccionados:
            </label>
            <div className="d-flex flex-wrap gap-2">
              {selectedTreatments.map((id) => {
                const treatment = availableTreatments.find((t) => t.id === id);
                return (
                  <span key={id} className="badge bg-secondary fs-5 d-flex align-items-center">
                    {treatment?.name || 'Tratamiento'}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      aria-label="Eliminar"
                      onClick={() => handleRemoveTreatment(id)}
                      style={{ fontSize: '1rem' }}
                    ></button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Anotaciones */}
        <div className="mb-4">
          <label htmlFor="notes" className="form-label clinical-subtitle fw-bold fs-3">
            Anotaciones del profesional:
          </label>
          <textarea
            id="notes"
            className="form-control fs-4"
            rows={4}
            placeholder="Escriba aquí las observaciones clínicas, evolución, recomendaciones, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Subida de archivos */}
        <div className="mb-4">
          <label htmlFor="attachments" className="form-label clinical-subtitle fw-bold fs-3">
            Adjuntar archivos:
          </label>
          <input
            id="attachments"
            type="file"
            className="form-control fs-4"
            accept=".pdf, image/*"
            multiple
            onChange={handleFileUpload}
          />
          <div className="form-text">Podés subir archivos PDF o imágenes (JPG, PNG).</div>

          {uploadedFiles.length > 0 && (
            <ul className="list-group mt-3">
              {uploadedFiles.map((file, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="fs-5">{file.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveFile(index)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error !== '' && (
          <div className="alert alert-danger fs-5" role="alert">
            {error}
          </div>
        )}

        {/* Botón guardar entrada */}
        <div className="text-end">
          <button
            className="btn btn-success btn-lg fs-4"
            onClick={handleSave}
            disabled={
              selectedTreatments.length === 0 && notes.trim() === '' && !uploadedFiles.length
            }
          >
            Guardar entrada clínica
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-white">Historial de atenciones</h3>
        {entries.length === 0 ? (
          <p className="text-white">No hay entradas de historia clínica.</p>
        ) : (
          [...entries]
            .sort((a, b) => b.id - a.id)
            .map((entry) => {
              const mockTreatments = [
                'Limpieza de sarro',
                'Extracción de carie',
                'Blanqueamiento dental',
              ];

              return (
                <div key={entry.id} className="card mb-3 position-relative">
                  <div className="card-body">
                    {/* Botones de editar y eliminar */}
                    <div className="position-absolute top-0 end-0 m-2 d-flex gap-2 align-items-center">
                      <button
                        className="btn btn-secondary d-flex align-items-center gap-1 btn-lg"
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                      <button
                        className="btn btn-danger d-flex align-items-center gap-1 btn-lg"
                        title="Eliminar"
                        onClick={() => {
                          setShowConfirm(true);
                          setEntryToDelete(entry);
                        }}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </div>

                    <p>
                      <strong>Fecha de última actualización:</strong> {entry.date}
                    </p>
                    <p>
                      <strong>Profesional:</strong> {entry.professionalFullName}
                    </p>

                    {/* Tratamientos mockeados */}
                    <div>
                      <strong>Tratamientos realizados:</strong>
                      <ul className="mt-2">
                        {mockTreatments.map((t, index) => (
                          <li key={index}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    <p>
                      <strong>Descripción:</strong> {entry.description}
                    </p>
                    {entry.files && entry.files.length > 0 ? (
                      <div>
                        <strong>Archivos adjuntos:</strong>
                        <ul className="mt-2">
                          {entry.files.map((file: { id: number; fileName: string }) => (
                            <li key={file.id}>
                              {file.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <a
                                  href={`http://localhost:8080/api/clinical-history/files/${file.id}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={file.fileName}
                                >
                                  <img
                                    src={`http://localhost:8080/api/clinical-history/files/${file.id}/download`}
                                    alt={file.fileName}
                                    style={{
                                      maxWidth: '200px',
                                      marginBottom: '1rem',
                                      cursor: 'zoom-in',
                                      border: '1px solid #ccc',
                                      borderRadius: '8px',
                                    }}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={`http://localhost:8080/api/clinical-history/files/${file.id}/download`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {file.fileName}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p>
                        <strong>Archivos adjuntos:</strong> Sin archivos
                      </p>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Confirmar eliminación"
          message={`¿Estás seguro que deseas eliminar esta entrada del ${entryToDelete?.date}?`}
          onConfirm={() => {
            if (entryToDelete) {
              handleDeleteConfirmed(entryToDelete);
            }
          }}
          onCancel={() => {
            setShowConfirm(false);
            setEntryToDelete(null);
          }}
        />
      )}
    </section>
  );
};

export default ClinicalHistoryComponent;
