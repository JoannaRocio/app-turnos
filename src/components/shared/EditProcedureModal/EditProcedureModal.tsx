import React, { useState, useEffect } from 'react';
import ClinicalHistoryService from '../../../services/ClinicalHistoryService';
import ProcedureService from '../../../services/ProcedureService';
import { Procedure } from '../../../interfaces/Procedure';
import './EditProcedureModal.scss';

interface Props {
  isOpen: boolean;
  entryId: number | null;
  initialProcedureIds: number[];
  onClose: () => void;
  onSaved: () => void;
}

const EditProcedureModal: React.FC<Props> = ({
  isOpen,
  entryId,
  initialProcedureIds,
  onClose,
  onSaved,
}) => {
  const [availableProcedures, setAvailableProcedures] = useState<Procedure[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialProcedureIds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Cargar todos los procedimientos
    ProcedureService.getAll()
      .then(setAvailableProcedures)
      .catch((err) => console.error('Error loading procedures:', err));
    // Sincronizar selección inicial
    setSelectedIds(initialProcedureIds);
  }, [isOpen, initialProcedureIds]);

  if (!isOpen || entryId == null) return null;

  const toggleProcedure = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (entryId == null) return;
    setLoading(true);
    try {
      await ClinicalHistoryService.updateProcedures(entryId, selectedIds);
      await onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error updating procedures:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalEditProc-overlay">
      <div className="custom-modalEditProc">
        <div className="d-flex justify-content-end">
          <button className="btn-close position-absolute" onClick={onClose} aria-label="Cerrar" />
        </div>
        <h3 className="text-center">Editar procedimientos</h3>
        <div className="procedures-list">
          {availableProcedures.map((proc) => (
            <div key={proc.id} className="form-check">
              <input
                type="checkbox"
                id={`proc-${proc.id}`}
                className="form-check-input"
                checked={selectedIds.includes(proc.id)}
                onChange={() => toggleProcedure(proc.id)}
              />
              <label htmlFor={`proc-${proc.id}`} className="form-check-label">
                {proc.name}
              </label>
            </div>
          ))}
        </div>
        <div className="modalEditProc-footer d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProcedureModal;
