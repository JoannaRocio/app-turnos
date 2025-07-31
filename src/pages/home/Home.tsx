import React, { useEffect, useState, useCallback } from 'react';
import AppointmentsComponent from '../../components/AppointmentsComponent/AppointmentsComponent';
import PatientsComponent from '../../components/Patients/PatientsPage';
import ProfessionalsComponent from '../../components/Professionals/ProfessionalsComponent';
import AdminDashboard from '../../components/AdminPanel/AdminDashboard';
import LoadingSpinner from '../../components/shared/LoadingSpinner/LoadingSpinner';

import { useComponente } from '../../context/ContextComponent';
import { useAuth } from '../../context/ContextAuth';
import { useDataContext } from '../../context/DataContext';

import AppointmentService from '../../services/AppointmentService';
import { Appointment } from '../../interfaces/Appointment';
import { Professional } from '../../interfaces/Professional';

const Home: React.FC = () => {
  const { componenteActivo, setComponenteActivo } = useComponente();
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isAdmin = role === 'ADMIN';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    patients,
    professionals,
    loadPatients,
    loadProfessionals,
    loadUsers,
    reloadProfessionals,
    reloadPatients,
  } = useDataContext();

  // 👇 Carga inicial
  useEffect(() => {
    if (!componenteActivo) setComponenteActivo('agenda-turnos');

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadPatients(), loadProfessionals(), loadUsers()]);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [componenteActivo, loadPatients, loadProfessionals, loadUsers, setComponenteActivo]);

  useEffect(() => {
    const fetchDataByComponent = async () => {
      setIsLoading(true);
      try {
        switch (componenteActivo) {
          case 'pacientes':
            await loadPatients();
            break;
          case 'profesionales':
            await loadProfessionals();
            break;
          case 'panel-admin':
            if (isAdmin) await loadUsers();
            break;
          case 'agenda-turnos':
          default:
            await Promise.all([loadPatients(), loadProfessionals()]);
            const activeProfessionals = professionals.filter(
              (p) => p.professionalState === 'ACTIVE'
            );
            if (!selectedProfessional && activeProfessionals.length > 0) {
              setSelectedProfessional(activeProfessionals[0]);
            }
            break;
        }
      } catch (err) {
        console.error('Error al cargar datos por componente:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataByComponent();
  }, [
    componenteActivo,
    isAdmin,
    loadPatients,
    loadProfessionals,
    loadUsers,
    professionals,
    selectedProfessional,
  ]);

  // 👇 Carga de turnos por profesional
  const loadAppointments = useCallback(async (professional: Professional) => {
    if (!professional?.documentNumber) return;

    try {
      const data = await AppointmentService.getAppointmentByDni(professional.documentNumber);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }, []);

  useEffect(() => {
    if (componenteActivo === 'agenda-turnos' && selectedProfessional?.documentNumber) {
      loadAppointments(selectedProfessional);
    }
  }, [componenteActivo, selectedProfessional, loadAppointments]);

  // 👇 Render
  if (isLoading) return <LoadingSpinner text="Cargando datos..." fullHeight />;

  return (
    <section>
      {componenteActivo === 'pacientes' &&
        ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) &&
        selectedProfessional?.professionalId !== undefined && (
          <PatientsComponent
            professionalId={selectedProfessional.professionalId}
            reloadPatients={reloadPatients}
          />
        )}

      {componenteActivo === 'profesionales' && ['MODERADOR', 'ADMIN'].includes(role) && (
        <ProfessionalsComponent
          professionals={professionals}
          reloadProfessional={reloadProfessionals}
        />
      )}

      {componenteActivo === 'agenda-turnos' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <AppointmentsComponent
          patients={patients}
          appointments={appointments}
          professionals={professionals}
          onAppointmentsUpdate={(prof) => loadAppointments(prof)}
        />
      )}

      {componenteActivo === 'panel-admin' && isAdmin && <AdminDashboard />}
    </section>
  );
};

export default Home;
