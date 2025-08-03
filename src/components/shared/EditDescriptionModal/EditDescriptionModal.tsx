import React, { useState, useEffect } from 'react';
import ClinicalHistoryService from '../../../services/ClinicalHistoryService';
import './EditDescriptionModal.scss';

interface Props {
  isOpen: boolean;
  entryId: number | null;
  initialDescription: string;
  onClose: () => void;
  onSaved: () => void; // para refrescar
}

const EditDescriptionModal: React.FC<Props> = ({
  isOpen,
  entryId,
  initialDescription,
  onClose,
  onSaved,
}) => {
  const [desc, setDesc] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDesc(initialDescription);
  }, [initialDescription, isOpen]);

  if (!isOpen || entryId == null) return null;

  return (
    <div className="modal-overlay">
      <div className="custom-modal">
        <div className="modal-header d-flex justify-content-end">
          <button className="btn-close" onClick={onClose} />
        </div>
        <h2>Editar descripción</h2>
        <textarea
          className="form-control mb-3"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-primary me-2"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await ClinicalHistoryService.updateDescription(entryId, desc);
              await onSaved();
              setLoading(false);
              onClose();
            }}
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDescriptionModal;
