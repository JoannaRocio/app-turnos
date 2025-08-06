import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const { componenteActivo } = useComponente();
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isAdmin = role === 'ADMIN';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const {
    patients,
    activeProfessionals,
    allProfessionals,
    loadPatients,
    loadAllProfessionals,
    loadActiveProfessionals,
    loadUsers,
    reloadAllProfessionals,
    reloadActiveProfessionals,
    reloadPatients,
    reloadUsers,
  } = useDataContext();

  const hasFetchedData = useRef(false);

  // Carga inicial (una sola vez)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (hasFetchedData.current || isDataLoaded) return;

      setIsLoading(true);
      try {
        await Promise.all([
          loadPatients(),
          loadActiveProfessionals(),
          loadAllProfessionals(),
          loadUsers(),
        ]);
        setIsDataLoaded(true);
        hasFetchedData.current = true;
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [isDataLoaded, loadPatients, loadActiveProfessionals, loadUsers, loadAllProfessionals]);

  // Setear profesional por defecto una vez cargados los datos
  // useEffect(() => {
  //   if (!isDataLoaded) return;

  //   const active = professionals.filter((p) => p.professionalState === 'ACTIVE');
  //   if (!selectedProfessional && active.length > 0) {
  //     setSelectedProfessional(active[0]);
  //   }
  // }, [isDataLoaded, professionals, selectedProfessional]);

  useEffect(() => {
    if (!selectedProfessional && activeProfessionals.length > 0) {
      setSelectedProfessional(activeProfessionals[0]);
    }
  }, [selectedProfessional, activeProfessionals]);

  // Carga de turnos
  const loadAppointments = useCallback(async (professional: Professional) => {
    if (!professional?.documentNumber) return;

    try {
      const data = await AppointmentService.getAppointmentByDni(professional.documentNumber);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }, []);

  // Llamar a loadAppointments solo si está activo el componente de turnos
  useEffect(() => {
    if (componenteActivo === 'agenda-turnos' && selectedProfessional?.documentNumber) {
      loadAppointments(selectedProfessional);
    }
  }, [componenteActivo, selectedProfessional, loadAppointments]);

  if (isLoading) return <LoadingSpinner text="Cargando datos..." fullHeight />;

  return (
    <section>
      {componenteActivo === 'pacientes' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <PatientsComponent
          professionalId={selectedProfessional?.professionalId ?? 0}
          reloadPatients={reloadPatients}
        />
      )}

      {componenteActivo === 'profesionales' && ['MODERADOR', 'ADMIN'].includes(role) && (
        <ProfessionalsComponent
          allProfessionals={allProfessionals}
          reloadAllProfessionals={reloadAllProfessionals}
          reloadActiveProfessionals={reloadActiveProfessionals}
        />
      )}

      {componenteActivo === 'agenda-turnos' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <AppointmentsComponent
          patients={patients}
          appointments={appointments}
          activeProfessionals={activeProfessionals}
          onAppointmentsUpdate={(prof) => loadAppointments(prof)}
          reloadPatients={reloadPatients}
          reloadActiveProfessionals={reloadActiveProfessionals}
        />
      )}

      {componenteActivo === 'panel-admin' && isAdmin && (
        <AdminDashboard reloadUsers={reloadUsers} />
      )}
    </section>
  );
};

export default Home;
