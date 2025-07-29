import React, { useEffect, useState } from 'react';
import AppointmentsComponent from '../../components/AppointmentsComponent/AppointmentsComponent';
import PatientsComponent from '../../components/Patients/PatientsPage';
import ProfessionalsComponent from '../../components/Professionals/ProfessionalsComponent';
import { useComponente } from '../../context/ContextComponent';
import AppointmentService from '../../services/AppointmentService';
import { Professional } from '../../interfaces/Professional';
import { Appointment } from '../../interfaces/Appointment';
import AdminDashboard from '../../components/AdminPanel/AdminDashboard';
import UserService from '../../services/UserService';
import { User } from '../../interfaces/User';
import { useAuth } from '../../context/ContextAuth';
import LoadingSpinner from '../../components/shared/LoadingSpinner/LoadingSpinner';
import { useDataContext } from '../../context/DataContext';

const Home: React.FC = () => {
  const { componenteActivo, setComponenteActivo } = useComponente();
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isAdmin = role === 'ADMIN';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();

  // Context
  const {
    patients,
    professionals,
    users,
    loadPatients,
    loadProfessionals,
    loadUsers,
    // loadAppointments,
  } = useDataContext();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!componenteActivo) setComponenteActivo('agenda-turnos');

    const fetchData = async () => {
      setIsLoading(true);

      try {
        if (componenteActivo === 'pacientes') {
          await loadPatients();
        }

        if (componenteActivo === 'agenda-turnos') {
          await Promise.all([loadPatients(), loadProfessionals()]);

          const activeProfessionals = professionals.filter(
            (professional) => professional.professionalState === 'ACTIVE'
          );

          if (!selectedProfessional && activeProfessionals.length > 0) {
            setSelectedProfessional(activeProfessionals[0]);
          }
        }

        if (componenteActivo === 'profesionales') {
          await loadProfessionals();
        }

        if (componenteActivo === 'panel-admin' && isAdmin) {
          await loadUsers();
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [componenteActivo]);

  useEffect(() => {
    if (componenteActivo === 'agenda-turnos' && selectedProfessional?.documentNumber) {
      loadAppointments(selectedProfessional);
    }
  }, [componenteActivo, selectedProfessional]);

  const clearAppointments = () => {
    setAppointments([]);
  };

  // const [appointments, setAppointments] = useState<Appointment[]>([]);
  // const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadAppointments = async (professional: Professional) => {
    if (!professional?.documentNumber) {
      console.warn('No se proporcionó DNI para cargar turnos.');
      return;
    }

    try {
      const data = await AppointmentService.getAppointmentByDni(professional.documentNumber);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  };

  return (
    <section>
      {isLoading ? (
        <LoadingSpinner text="Cargando datos..." fullHeight />
      ) : (
        <>
          {componenteActivo === 'pacientes' &&
            ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) &&
            selectedProfessional?.professionalId !== undefined && (
              <PatientsComponent professionalId={selectedProfessional.professionalId} />
            )}

          {componenteActivo === 'profesionales' && ['MODERADOR', 'ADMIN'].includes(role) && (
            <ProfessionalsComponent
              professionals={professionals}
              reloadProfessional={loadProfessionals}
            />
          )}

          {componenteActivo === 'agenda-turnos' &&
            ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
              <AppointmentsComponent
                patients={patients}
                appointments={appointments}
                professionals={professionals}
                onAppointmentsUpdate={(selectedProfessional: any) => {
                  loadAppointments(selectedProfessional);
                }}
              />
            )}

          {componenteActivo === 'panel-admin' && isAdmin && <AdminDashboard />}
        </>
      )}
    </section>
  );
};

export default Home;
