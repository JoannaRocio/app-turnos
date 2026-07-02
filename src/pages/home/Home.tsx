import React, { useEffect, useState } from 'react';
import Appointments from '../../components/Appointments/Appointments';
import Patients from '../../components/Patients/Patients';
import Professionals from '../../components/Professionals/Professionals';
import AdminDashboard from '../../components/Admin/AdminDashboard';
import LoadingSpinner from '../../components/shared/LoadingSpinner/LoadingSpinner';

import { useComponente } from '../../context/ContextComponent';
import { useAuth } from '../../context/ContextAuth';
import { useDataContext } from '../../context/DataContext';

import { Professional } from '../../interfaces/Professional';

const Home: React.FC = () => {
  const { componenteActivo } = useComponente();
  const { userRole } = useAuth();
  const role = userRole ?? '';
  const isAdmin = role === 'ADMIN';

  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    patients,
    appointments,
    activeProfessionals,
    allProfessionals,
    ensureInitialData,
    loadAppointments,
    reloadAllProfessionals,
    reloadActiveProfessionals,
    reloadPatients,
    reloadUsers,
  } = useDataContext();

  // Carga inicial (una sola vez)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await ensureInitialData();
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [ensureInitialData]);

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

  // Llamar a loadAppointments solo si está activo el componente de turnos
  useEffect(() => {
    if (componenteActivo === 'agenda-turnos' && selectedProfessional?.documentNumber) {
      loadAppointments(selectedProfessional.documentNumber);
    }
  }, [componenteActivo, selectedProfessional]);

  if (isLoading) return <LoadingSpinner text="Cargando datos..." fullHeight />;

  return (
    <section>
      {componenteActivo === 'pacientes' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <Patients
          professionalId={selectedProfessional?.professionalId ?? 0}
          reloadPatients={reloadPatients}
        />
      )}

      {componenteActivo === 'profesionales' && ['MODERADOR', 'ADMIN'].includes(role) && (
        <Professionals
          allProfessionals={allProfessionals}
          reloadAllProfessionals={reloadAllProfessionals}
          reloadActiveProfessionals={reloadActiveProfessionals}
        />
      )}

      {componenteActivo === 'agenda-turnos' && ['USUARIO', 'MODERADOR', 'ADMIN'].includes(role) && (
        <Appointments
          patients={patients}
          appointments={appointments}
          activeProfessionals={activeProfessionals}
          selectedProfessional={selectedProfessional} // 👈 AGREGAR
          onSelectProfessional={setSelectedProfessional} // 👈 AGREGAR
          onAppointmentsUpdate={(prof) => loadAppointments(prof?.documentNumber)}
          reloadPatients={reloadPatients}
        />
      )}

      {componenteActivo === 'panel-admin' && isAdmin && (
        <AdminDashboard reloadUsers={reloadUsers} />
      )}
    </section>
  );
};

export default Home;
