import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiMoreVertical } from 'react-icons/fi';

interface ActionDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onView,
  onEdit,
  onDelete,
  disabled,
  isOpen,
  onToggle,
}) => {
  return (
    <Dropdown show={isOpen} onToggle={onToggle}>
      <Dropdown.Toggle
        disabled={disabled}
        variant="secondary"
        size="lg"
        className="no-caret"
        style={{ width: '100%' }}
      >
        <FiMoreVertical size={20} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {onView && (
          <Dropdown.Item className="item-drop" onClick={onView}>
            Ver ficha
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
