// components/ConfirmModal.tsx
import React, { useState } from 'react';
import './ConfirmActionModal.scss';
import useLockBodyScroll from '../../../hooks/useLockBodyScroll';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>; // ahora esperamos una promesa
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  useLockBodyScroll(isOpen);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-action">
      <div className="confirm-box confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-confirm-action" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
          <button className="btn-cancel-action" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
