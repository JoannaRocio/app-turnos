import React, { useState } from 'react';
import ClinicalHistoryService from '../../../services/ClinicalHistoryService';
import './UploadFileModal.scss';

interface Props {
  isOpen: boolean;
  entryId: number | null;
  onClose: () => void;
  onUploaded: () => void;
}

const UploadFileModal: React.FC<Props> = ({ isOpen, entryId, onClose, onUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || entryId == null) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    // agrega nuevos archivos al array, evitando duplicados por nombre+size
    const incoming = Array.from(e.target.files);
    const combined = [...files, ...incoming];
    const unique = Array.from(new Map(combined.map((f) => [f.name + f.size, f])).values());
    setFiles(unique);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      for (const f of files) {
        await ClinicalHistoryService.uploadFile(entryId, f);
      }
      await onUploaded();
      onClose();
    } catch (err) {
      console.error('Error al subir archivos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalUploadModal-overlay">
      <div className="custom-modalUploadModal">
        <div className="modalUploadModal-header d-flex justify-content-end">
          <button className="btn-close" onClick={onClose} />
        </div>
        <h2>Agregar archivos adjuntos</h2>

        <input
          type="file"
          className="form-control mb-3 inputUploadModal"
          multiple
          onChange={handleChange}
        />

        {files.length > 0 && (
          <ul className="list-group mb-3">
            {files.map((f, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span className="file-name">{f.name}</span>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Eliminar"
                  onClick={() => handleRemove(idx)}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-primary me-2 buttonUploadModal"
            disabled={!files.length || loading}
            onClick={handleUpload}
          >
            {loading ? 'Subiendo…' : `Subir ${files.length} archivo(s)`}
          </button>
          <button className="btn btn-secondary buttonUploadModal" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;
