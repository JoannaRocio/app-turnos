import React, { useState } from 'react';
import './AdminDashboard.scss';
import { User } from '../../interfaces/User';
import UserService from '../../services/UserService';
import { UserRole } from '../../interfaces/UserRole';
import UserModalComponent from '../UserModal/UserModalComponent';
import MetricsComponent from '../MetricsComponent/MetricsComponent';
import HealthInsurancePanel from '../HealthInsurancePanel/HealthInsurancePanel';
import { useDataContext } from '../../context/DataContext';
import { toast } from 'react-toastify';
import ActionDropdown from '../shared/ActionDropdown/ActionDropdown';
import ConfirmModal from '../shared/ConfirmModal/ConfirmModalComponent';

interface AdminDashboardProps {
  reloadUsers: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reloadUsers }) => {
  const { users, professionals } = useDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'metricas' | 'obrasSociales'>('usuarios');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  if (!users) {
    return <p className="text-white">Cargando usuarios...</p>;
  }
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email?.toString().includes(searchTerm);
    return nameMatch || emailMatch;
  });

  const handleSave = async (userData: Partial<User>) => {
    setIsUpdating(true);

    try {
      if (userData.id) {
        await UserService.updateUser(userData.id, userData);
        toast.success('Usuario actualizado con éxito');
      } else {
        await UserService.createUser(userData);
        toast.success('Usuario creado con éxito');
      }

      await reloadUsers();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el usuario');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewUser = () => {
    const emptyUser: Partial<User> = {
      username: '',
      password: '',
      email: '',
      role: UserRole.USUARIO,
    };
    setSelectedUser(emptyUser);
    setModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  async function handleDeleteConfirmed(selectedUser: any) {
    try {
      // await UserService.delete(selectedUser?.id);
      toast.success('Turno eliminado correctamente.');
      setShowConfirm(false);
      // setApptToDelete(null);

      // if (selectedUser?.documentNumber) {
      //   onAppointmentsUpdate(selectedUser);
      // }
    } catch (error: any) {
      // setCurrentAppointment(null);
      handleBackendError(error, 'Ocurrió un error al eliminar el turno.');
    }
  }

  function handleBackendError(error: any, fallbackMessage = 'Ocurrió un error') {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 304 || status === 204) {
      toast.info('No se realizaron modificaciones.');
    } else {
      const message = data?.message || data?.error || fallbackMessage;
      toast.error(message);
    }
  }

  if (!users || users.length === 0) {
    return <p className="text-white">No hay usuarios disponibles.</p>;
  }

  return (
    <section>
      <div className="d-flex justify-content-between admin-panel">
        <h3 className="App-main-title text-white">Panel de administrador</h3>

        <div className="tabs">
          <button
            className={`App-buttonTertiary ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Usuarios
          </button>
          <button
            className={`App-buttonTertiary ${activeTab === 'metricas' ? 'active' : ''}`}
            onClick={() => setActiveTab('metricas')}
          >
            Métricas
          </button>
          <button
            className={`App-buttonTertiary ${activeTab === 'obrasSociales' ? 'active' : ''}`}
            onClick={() => setActiveTab('obrasSociales')}
          >
            Obras Sociales
          </button>
        </div>
      </div>

      {activeTab === 'usuarios' && (
        <>
          <div className="d-flex justify-content-between">
            <h3 className="text-white App-secondary-title">Usuarios</h3>
            <button className="btn App-buttonTertiary" onClick={handleNewUser}>
              Nuevo
            </button>
          </div>

          <input
            type="text"
            className="form-control mb-3 filter-input"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="table-responsive">
            <table className="App-table">
              <thead>
                <tr>
                  <th>Nombre usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-primary-r' : 'bg-secondary-r'}>
                    <td>
                      <span className="ellipsis-cell" title={user.username || undefined}>
                        {user.username || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="ellipsis-cell" title={user.email || undefined}>
                        {user.email || '-'}
                      </span>
                    </td>
                    <td>{user.role || '-'}</td>
                    <td>
                      <ActionDropdown
                        disabled={!user}
                        isOpen={activeDropdownIndex === index}
                        onToggle={(isOpen) => setActiveDropdownIndex(isOpen ? index : null)}
                        onEdit={() => handleRowClick(user)}
                        onDelete={() => handleDelete(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <UserModalComponent
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            user={selectedUser}
            onSave={handleSave}
            professionals={professionals}
            isUpdating={isUpdating}
          />

          <ConfirmModal
            isOpen={showConfirm}
            title="Confirmar eliminación"
            message={`¿Estás segura que deseas eliminar el usuario de "${selectedUser?.username}"?`}
            onConfirm={() => {
              if (selectedUser) {
                handleDeleteConfirmed(selectedUser);
              } else {
                alert('No ha seleccionado ningún turno disponible.');
              }
            }}
            onCancel={() => {
              setShowConfirm(false);
              // setApptToDelete(null);
            }}
          />
        </>
      )}

      {activeTab === 'metricas' && <MetricsComponent />}

      {activeTab === 'obrasSociales' && <HealthInsurancePanel />}
    </section>
  );
};

export default AdminDashboard;
