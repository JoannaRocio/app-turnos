import React, { useState, useEffect } from 'react';
import './UserModalComponent.scss';
import { User } from '../../interfaces/User';
import { UserRole } from '../../interfaces/UserRole';
import { Professional } from '../../interfaces/Professional';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

interface UserModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<User> | null;
  onSave: (updated: Partial<User>) => void;
  professionals: Professional[];
  isUpdating: boolean;
}

const UserModalComponent: React.FC<UserModalComponentProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  professionals,
  isUpdating,
}) => {
  const [form, setForm] = useState<Partial<User> & { professionalId?: number }>({
    username: '',
    password: '',
    email: '',
    role: undefined,
    professionalId: undefined,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ ...user });
    } else {
      setForm({
        username: '',
        password: '',
        email: '',
        role: undefined,
        professionalId: undefined,
      });
    }
  }, [user]);

  const isFormValid =
    !!form.username?.trim() &&
    !!form.email?.trim() &&
    !!form.password &&
    form.password.length >= 3 &&
    !!form.role &&
    (form.role !== UserRole.USUARIO || !!form.professionalId);

  if (!isOpen || !form) return null;

  return (
    <section>
      <div className={`modal-overlay ${user?.id ? 'edit-mode' : ''}`}>
        <div className={`modal modal-patient ${user?.id ? 'edit-mode' : ''}`}>
          <div className="modal-header">
            <button
              type="button"
              className="btn-close btn-close-white top-0 end-0 m-3"
              aria-label="Cerrar"
              onClick={onClose}
            />
          </div>
          <form
            autoComplete="off"
            className="user-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
          >
            <h4>{user?.id ? 'Editar usuario' : 'Alta de usuario'}</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Ingrese un nombre de usuario"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Ingrese un email"
                />
              </div>
            </div>

            <div className="form-group password-group">
              <label>Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password ?? ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Ingrese una contraseña"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
                </button>
              </div>
            </div>

            {form.password !== undefined &&
              form.password.length > 0 &&
              form.password.length < 3 && (
                <small className="text-danger">
                  La contraseña debe tener al menos 3 caracteres.
                </small>
              )}

            <div className="form-group">
              <label>Tipo de usuario</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="">Seleccione un rol</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MODERADOR">MODERADOR</option>
                <option value="USUARIO">USUARIO</option>
              </select>
            </div>

            {form.role === UserRole.USUARIO && (
              <div className="form-group">
                <label>Profesional asignado</label>
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
              </div>
            )}

            <div className="d-flex justify-content-center align-items-center">
              <button className="modal-buttons" type="submit" disabled={!isFormValid || isUpdating}>
                Guardar
              </button>
              <button className="modal-buttons" type="button" onClick={onClose}>
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
