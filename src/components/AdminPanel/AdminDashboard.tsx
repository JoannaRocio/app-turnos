import React, { useState } from 'react';
import './AdminDashboard.scss';
import { User } from '../../interfaces/User';
import UserService from '../../services/UserService';
import { UserRole } from '../../interfaces/UserRole';
import UserModalComponent from '../UserModal/UserModalComponent';
import MetricsComponent from '../MetricsComponent/MetricsComponent';
import HealthInsurancePanel from '../HealthInsurancePanel/HealthInsurancePanel';
import { Professional } from '../../interfaces/Professional';

const AdminDashboard: React.FC<{
  users: User[];
  professionals: Professional[];
  reloadUsers: () => void;
}> = ({ users, professionals, reloadUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState<"usuarios" | "metricas">("usuarios");
  const [activeTab, setActiveTab] = useState<'usuarios' | 'metricas' | 'obrasSociales'>('usuarios');

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
    try {
      console.log(selectedUser, 'userdata');
      if (userData.id) {
        await UserService.updateUser(userData.id, userData);
        alert('Usuario actualizado con éxito');
      } else {
        await UserService.createUser(userData);

        alert('Usuario creado con éxito');
      }

      reloadUsers();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      alert(error.message ?? 'Error desconocido, consultar con soporte técnico.');
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

  if (!users || users.length === 0) {
    return <p className="text-white">No hay usuarios disponibles.</p>;
  }

  return (
    <section>
      <h2 className="text-white">Panel de administrador</h2>

      <div className="tabs mb-4">
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

      {/* <div className="tabs mb-4">
          <button
            className={`tab-button ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            Usuarios
          </button>
          <button
            className={`tab-button ${activeTab === "metricas" ? "active" : ""}`}
            onClick={() => setActiveTab("metricas")}
          >
            Métricas
          </button>
        </div> */}

      {activeTab === 'usuarios' && (
        <>
          <div className="d-flex justify-content-between">
            <h3 className="text-white">Usuarios</h3>
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

          <table className="App-table">
            <thead>
              <tr>
                <th>Nombre usuario</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} onClick={() => handleRowClick(user)} className="clickable-row">
                  <td>{user.username || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.role || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <UserModalComponent
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            user={selectedUser}
            onSave={handleSave}
            professionals={professionals}
          />
        </>
      )}

      {activeTab === 'metricas' && <MetricsComponent />}

      {activeTab === 'obrasSociales' && <HealthInsurancePanel />}
    </section>
  );
};

export default AdminDashboard;
