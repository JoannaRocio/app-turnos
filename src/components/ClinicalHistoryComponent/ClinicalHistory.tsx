import React, { useEffect, useState } from 'react';
import ClinicalHistoryService from '../../services/ClinicalHistoryService';
import { ClinicalHistoryEntry } from '../../interfaces/ClinicalHistoryEntry';
import { Patient } from '../../interfaces/Patient';
import './ClinicalHistory.scss';
import ConfirmModal from '../shared/ConfirmModal/ConfirmModalComponent';
import ProcedureService from '../../services/ProcedureService';
import { Procedure } from '../../interfaces/Procedure';
import EditDescriptionModal from '../shared/EditDescriptionModal/EditDescriptionModal';
import UploadFileModal from '../shared/UploadFileModal/UploadFileModal';
import { toast } from 'react-toastify';

interface Props {
  data: ClinicalHistoryEntry[];
  onBack: () => void;
  patient: Patient;
  professionalId: number;
}

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
  const [availableTreatments, setAvailableTreatments] = useState<Procedure[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const procs = await ProcedureService.getAll();
        setAvailableTreatments(procs);
      } catch (err) {
        console.error('No se pudo cargar procedures:', err);
      }
    };
    fetchProcedures();
  }, []);

  // Funciones de agregar/quitar
  const handleAddTreatment = () => {
    const id = Number(selectedId);
    if (id && !selectedTreatments.includes(id)) {
      setSelectedTreatments((prev) => [...prev, id]);
    }
    setSelectedId('');
  };

  const handleRemoveTreatment = (id: number) => {
    setSelectedTreatments((prev) => prev.filter((t) => t !== id));
  };

  // Entrada nueva
  const [entries, setEntries] = useState(data);
  const [, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  // Dentro de tu componente…
  const [editingEntry, setEditingEntry] = useState<ClinicalHistoryEntry | null>(null);

  const handleSave = async () => {
    if (selectedTreatments.length === 0) {
      setError('Debés seleccionar al menos un tratamiento antes de guardar.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let entryId: number;

      if (editingEntry) {
        // ── MODO EDICIÓN ──
        entryId = editingEntry.id;

        // 1) Actualizar descripción
        await ClinicalHistoryService.updateDescription(entryId, notes);

        // 2) Actualizar procedimientos
        await ClinicalHistoryService.updateProcedures(entryId, selectedTreatments);
      } else {
        // ── MODO CREACIÓN ──
        entryId = await ClinicalHistoryService.createClinicalHistory(
          patient,
          notes,
          professionalId,
          selectedTreatments
        );
      }

      // 3) Subir nuevos archivos (si hay)
      for (const file of uploadedFiles) {
        await ClinicalHistoryService.uploadFile(entryId, file);
      }

      // 4) Refrescar lista completa
      const refreshed = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      setEntries(refreshed);

      // 5) Reset formulario y salir de edición
      setNotes('');
      setUploadedFiles([]);
      setSelectedTreatments([]);
      setEditingEntry(null);
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

  const formattedDeleteDate = entryToDelete
    ? new Date(entryToDelete.dateTime).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Editar entrada clinica

  // Estados nuevos
  // Para editar descripción
  const [showDescModal, setShowDescModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  // función para recargar entries, con toast de éxito/ error
  const refreshEntries = async () => {
    try {
      const updated = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      setEntries(updated);
      toast.success('Modificación exitosa.');
    } catch (err: any) {
      console.error('Error al recargar historial:', err);
      toast.error(err?.message ?? 'Error al recargar historial de historia clínica.');
    }
  };

  // Eliminar archivo / file

  // Para eliminar una entrada clínica completa
  const handleConfirmDeleteEntry = async () => {
    if (!entryToDelete) return;
    try {
      await ClinicalHistoryService.deleteEntry(entryToDelete.id);
      toast.success('Entrada clínica eliminada correctamente.');
      // refrescar lista
      const refreshed = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      setEntries(refreshed);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error al eliminar la entrada clínica.');
    } finally {
      // cerrar modal
      setShowConfirm(false);
      setEntryToDelete(null);
    }
  };

  // Para eliminar UN archivo
  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      await ClinicalHistoryService.deleteFile(fileToDelete.id);
      toast.success('Archivo eliminado correctamente.');
      // refrescar lista de entradas con sus archivos
      const refreshed = await ClinicalHistoryService.getOrCreate(patient, professionalId);
      setEntries(refreshed);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error al eliminar el archivo.');
    } finally {
      setShowFileConfirm(false);
      setFileToDelete(null);
    }
  };

  // Al inicio de tu componente:
  const [showFileConfirm, setShowFileConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: number; fileName: string } | null>(null);

  return (
    <div className="container my-4">
      <button
        className="btn btn-secondary btn-lg mb-3 btn-guardar-clinicalHistory"
        onClick={onBack}
      >
        ← Volver
      </button>

      {/* Información del paciente */}
      <section>
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
      </section>

      {/* Nueva entrada clínica */}
      <section>
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
              <label className="form-label">Tratamientos seleccionados:</label>
              <div className="d-flex flex-wrap gap-2">
                {selectedTreatments.map((id) => {
                  const t = availableTreatments.find((x) => x.id === id);
                  return (
                    <span key={id} className="badge bg-secondary d-flex align-items-center">
                      {t?.name}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        aria-label="Eliminar"
                        onClick={() => handleRemoveTreatment(id)}
                        style={{ fontSize: '1rem' }}
                      />
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
      </section>

      {/* Historial de atenciones */}
      <section>
        <div>
          <h3 className="text-white">Historial de atenciones</h3>
          {entries.length === 0 ? (
            <p className="text-white">No hay entradas de historia clínica.</p>
          ) : (
            [...entries]
              .sort((a, b) => b.id - a.id)
              .map((entry) => (
                <div key={entry.id} className="card mb-3 position-relative">
                  <div className="card-body">
                    {/* Botones de editar y eliminar */}
                    <div className="container-buttons-clinicalHistory top-0 end-0 m-2 d-flex gap-2 align-items-center">
                      <button
                        className="btn btn-warning d-flex align-items-center gap-1 btn-lg"
                        title="Agregar archivo"
                        onClick={() => {
                          setEditingEntry(entry);
                          setShowFileModal(true);
                        }}
                      >
                        <i className="bi bi-paperclip"></i> Agregar archivo adjunto
                      </button>

                      {/* Editar descripción */}
                      <button
                        className="btn btn-success d-flex align-items-center gap-1 btn-lg"
                        title="Editar descripción"
                        onClick={() => {
                          setEditingEntry(entry);
                          setShowDescModal(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i> Editar descripción
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
                      <strong>Fecha de última actualización: </strong>
                      {new Date(entry.dateTime).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>
                      <strong>Profesional:</strong> {entry.professionalFullName}
                    </p>

                    {/* Tratamientos / procedures */}
                    <div>
                      <strong>Tratamientos realizados:</strong>
                      {entry.procedureNames && entry.procedureNames.length > 0 ? (
                        <ul className="mt-2">
                          {entry.procedureNames.map((name, idx) => (
                            <li key={entry.procedureIds[idx] ?? idx}>{name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>Sin tratamientos</p>
                      )}
                    </div>

                    <p>
                      <strong>Descripción:</strong> {entry.description}
                    </p>
                    {entry.files && entry.files.length > 0 ? (
                      <div>
                        <strong>Archivos adjuntos:</strong>

                        <ul className="mt-2 list-unstyled">
                          {entry.files.map((file: { id: number; fileName: string }) => {
                            const downloadUrl = `${process.env.REACT_APP_API_URL}/clinical-history/files/${file.id}/download`;
                            const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.fileName);
                            return (
                              <li key={file.id} className="d-flex align-items-center mb-2">
                                {isImage ? (
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={file.fileName}
                                  >
                                    <img
                                      src={downloadUrl}
                                      alt={file.fileName}
                                      style={{
                                        maxWidth: '200px',
                                        marginBottom: '0.5rem',
                                        cursor: 'zoom-in',
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                                    {file.fileName}
                                  </a>
                                )}

                                {/* Botón para eliminar el archivo */}
                                <button
                                  type="button"
                                  className="btn-close ms-2" // aquí el icono será oscuro
                                  aria-label="Eliminar archivo"
                                  onClick={() => {
                                    setFileToDelete(file);
                                    setShowFileConfirm(true);
                                  }}
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <p>
                        <strong>Archivos adjuntos:</strong> Sin archivos
                      </p>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Confirmación para eliminar entrada completa  */}
      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Confirmar eliminación"
          message={`¿Estás seguro que deseas eliminar esta entrada del ${formattedDeleteDate}?`}
          onConfirm={handleConfirmDeleteEntry}
          onCancel={() => {
            setShowConfirm(false);
            setEntryToDelete(null);
          }}
        />
      )}

      {/* Confirmación para eliminar archivo individual */}
      {showFileConfirm && fileToDelete && (
        <ConfirmModal
          isOpen={showFileConfirm}
          title="Confirmar eliminación de archivo"
          message={`¿Estás seguro que deseas eliminar el archivo "${fileToDelete.fileName}"?`}
          onConfirm={handleConfirmDeleteFile}
          onCancel={() => {
            setShowFileConfirm(false);
            setFileToDelete(null);
          }}
        />
      )}

      {/* Modales */}
      <EditDescriptionModal
        isOpen={showDescModal}
        entryId={editingEntry?.id ?? null}
        initialDescription={editingEntry?.description ?? ''}
        onClose={() => setShowDescModal(false)}
        onSaved={refreshEntries}
      />

      <UploadFileModal
        isOpen={showFileModal}
        entryId={editingEntry?.id ?? null}
        onClose={() => setShowFileModal(false)}
        onUploaded={refreshEntries}
      />
    </div>
  );
};

export default ClinicalHistoryComponent;
