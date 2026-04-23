import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiMoreVertical } from 'react-icons/fi';

interface ActionDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAppointments?: () => void;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onView,
  onEdit,
  onDelete,
  onViewAppointments,
  disabled,
  isOpen,
  onToggle,
}) => {
  return (
    <Dropdown
      show={isOpen}
      onToggle={onToggle}
      style={{ position: 'absolute', width: 'stretch', alignSelf: 'anchor-center' }}
    >
      <Dropdown.Toggle
        disabled={disabled}
        variant="secondary"
        size="lg"
        className="no-caret"
        style={{ width: '95%', display: 'block' }}
      >
        <FiMoreVertical size={20} />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '95%' }}>
        {onView && (
          <Dropdown.Item className="item-drop" onClick={onView}>
            Ver ficha
          </Dropdown.Item>
        )}
        {onViewAppointments && (
          <Dropdown.Item className="item-drop" onClick={onViewAppointments}>
            Ver turnos
          </Dropdown.Item>
        )}
        {onEdit && (
          <Dropdown.Item className="item-drop" onClick={onEdit}>
            Editar
          </Dropdown.Item>
        )}
        {onDelete && (
          <Dropdown.Item className="item-drop" onClick={onDelete}>
            Eliminar
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionDropdown;
