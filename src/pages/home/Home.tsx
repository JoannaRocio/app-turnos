import React, { useEffect, useState } from 'react';
import AppointmentsComponent from '../../components/AppointmentsComponent/AppointmentsComponent';
import PatientsComponent from '../../components/Patients/PatientsPage';
import ProfessionalsComponent from '../../components/Professionals/ProfessionalsComponent';
import { useComponente } from '../../context/ContextComponent';
import { Patient } from '../../interfaces/Patient';
import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';
import { Professional } from '../../interfaces/Professional';
import ProfessionalService from '../../services/ProfessionalService';
import { Appointment } from '../../interfaces/Appointment';
import AdminDashboard from '../../components/AdminPanel/AdminDashboard';
import UserService from '../../services/UserService';
import { User } from '../../interfaces/User';
import { useAuth } from '../../context/ContextAuth';

const Home: React.FC = () => {
  // const { componenteActivo } = useComponente();
  const { componenteActivo, setComponenteActivo } = useComponente();

  // const [componenteActivo, setComponenteActivo] = useState<string>("agenda-turnos"); // ✅ valor por defecto
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();

  const { userRole } = useAuth();
  const role = userRole ?? '';

  useEffect(() => {
    if (!componenteActivo) setComponenteActivo('agenda-turnos');

    const fetchData = async () => {
      if (componenteActivo === 'pacientes') {
        await loadPatients();
      }
      if (componenteActivo === 'agenda-turnos') {
        await loadPatients();
        await loadAllProfessionals();
      }
      if (componenteActivo === 'profesionales') {
        await loadAllProfessionals();
      }
      if (componenteActivo === 'panel-admin') {
        await loadUsers();
      }
    };

    fetchData();
  }, [componenteActivo]);

  useEffect(() => {
    if (componenteActivo === 'agenda-turnos' && selectedProfessional) {
      loadAppointments(selectedProfessional);
    }
  }, [selectedProfessional]);

  const loadUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error al traer usuarios:', err);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await PatientService.getAll();

      setPatients(data);
    } catch (err) {
      console.error('Error al traer pacientes:', err);
    }
  };

  const loadAllProfessionals = async () => {
    try {
      const data = await ProfessionalService.getAllProfessionals();

      if (!selectedProfessional && data.length > 0) {
        setSelectedProfessional(data[0]);
      }

      setProfessionals(data);
    } catch (error) {
      console.error('Error al cargar los profesionales:', error);
    }
  };

  const loadAppointments = async (selectedProfessional?: Professional) => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      setProfessionals(data);

      if (!selectedProfessional && data.length > 0) {
        selectedProfessional = data[0];
      }

      if (selectedProfessional) {
        const appointmentsData = await AppointmentService.getAppointmentByDni(
          selectedProfessional.professionalDni
        );
        setAppointments(appointmentsData);
      } else {
        console.warn('No hay profesional seleccionado ni profesionales disponibles.');
      }
    } catch (error) {
      console.error('Error al cargar los turnos:', error);
    }
  };

  return (
    <section className="home-section">
      {componenteActivo === 'pacientes' &&
        ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) &&
        selectedProfessional?.professionalId !== undefined && (
          <PatientsComponent
            patients={patients ?? []}
            professionalId={selectedProfessional?.professionalId}
            reloadPatients={loadPatients}
          />
        )}

      {componenteActivo === 'profesionales' && ['MODERADOR', 'ADMIN'].includes(role) && (
        <ProfessionalsComponent
          professionals={professionals}
          reloadProfessional={loadAllProfessionals}
        />
      )}

      {componenteActivo === 'agenda-turnos' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <AppointmentsComponent
          patients={patients}
          appointments={appointments}
          professionals={professionals}
          onAppointmentsUpdate={loadAppointments}
        />
      )}

      {componenteActivo === 'panel-admin' && role === 'ADMIN' && (
        <AdminDashboard users={users} reloadUsers={loadUsers} professionals={professionals} />
      )}
    </section>
  );
};

export default Home;
