import React, { useState, useEffect } from 'react';
import './UserModalComponent.scss';
import { User } from '../../interfaces/User';
import { UserRole } from '../../interfaces/UserRole';
import { Professional } from '../../interfaces/Professional';

interface UserModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<User> | null;
  onSave: (updated: Partial<User>) => void;
  professionals: Professional[];
}

const UserModalComponent: React.FC<UserModalComponentProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  professionals,
}) => {
  const [form, setForm] = useState<Partial<User> & { professionalId?: number }>({
    username: '',
    password: '',
    email: '',
    role: UserRole.USUARIO,
    professionalId: undefined,
  });

  useEffect(() => {
    if (user) {
      setForm({ ...user });
    } else {
      setForm({
        username: '',
        password: '',
        email: '',
        role: UserRole.USUARIO,
        professionalId: undefined,
      });
    }
  }, [user]);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className={`modal-overlay ${user?.id ? 'edit-mode' : ''}`}>
        <div className={`modal modal-patient ${user?.id ? 'edit-mode' : ''}`}>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <h4>{user?.id ? 'Editar usuario' : 'Alta de usuario'}</h4>

            <input
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nombre de usuario"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={form.password ?? ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Contraseña"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="">Seleccione un rol</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MODERADOR">MODERADOR</option>
              <option value="USUARIO">USUARIO</option>
            </select>

            {form.role === UserRole.USUARIO && (
              <select
                value={form.professionalId ?? ''}
                onChange={(e) => setForm({ ...form, professionalId: Number(e.target.value) })}
              >
                <option value="">Seleccione un profesional...</option>
                {professionals.map((prof) => (
                  <option key={prof.professionalId} value={prof.professionalId}>
                    {prof.professionalName}
                  </option>
                ))}
              </select>
            )}
            <div className="modal-buttons">
              <button
                type="submit"
                disabled={!form.username || !form.email || !form.password || !form.role}
              >
                Guardar
              </button>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserModalComponent;
