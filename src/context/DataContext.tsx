import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import PatientService from '../services/PatientService';
import ProfessionalService from '../services/ProfessionalService';
import AppointmentService from '../services/AppointmentService';
import UserService from '../services/UserService';
import { Patient } from '../interfaces/Patient';
import { Professional } from '../interfaces/Professional';
import { Appointment } from '../interfaces/Appointment';
import { User } from '../interfaces/User';

interface DataContextType {
  patients: Patient[];
  allProfessionals: Professional[];
  activeProfessionals: Professional[];
  appointments: Appointment[];
  users: User[];
  loadPatients: () => Promise<void>;
  loadAllProfessionals: () => Promise<void>;
  loadActiveProfessionals: () => Promise<void>;
  loadUsers: () => Promise<void>;
  ensureInitialData: () => Promise<void>;
  loadAppointments: (dni: string) => Promise<void>;
  reloadUsers: () => Promise<void>;
  reloadPatients: () => Promise<void>;
  reloadAppointments: (dni: string) => Promise<void>;
  reloadAllProfessionals: () => Promise<void>;
  reloadActiveProfessionals: () => Promise<void>;

  clearAppointments: () => void;
  isDataLoaded: boolean;
  setIsDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeProfessionals, setActiveProfessionals] = useState<Professional[]>([]);
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const [isPatientsLoaded, setIsPatientsLoaded] = useState(false);
  const [isProfessionalsLoaded, setIsProfessionalsLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [, setLoadedAppointment] = useState<string | null>(null);

  const patientsRequestRef = useRef<Promise<void> | null>(null);
  const professionalsRequestRef = useRef<Promise<void> | null>(null);
  const usersRequestRef = useRef<Promise<void> | null>(null);
  const appointmentsRequestRef = useRef<Record<string, Promise<void>>>({});
  const [appointmentsByProfessional, setAppointmentsByProfessional] = useState<
    Record<string, Appointment[]>
  >({});

  const loadProfessionalsFromApi = useCallback(async () => {
    const data = await ProfessionalService.getAllProfessionals();
    const active = data.filter((p) => p.professionalState === 'ACTIVE');
    setAllProfessionals(data);
    setActiveProfessionals(active);
    setIsProfessionalsLoaded(true);
  }, []);

  const loadPatients = useCallback(async () => {
    if (isPatientsLoaded) return;
    if (!patientsRequestRef.current) {
      patientsRequestRef.current = (async () => {
        try {
          const response = await PatientService.getAll();
          setPatients(response);
          setIsPatientsLoaded(true);
        } catch (error) {
          console.error('Error al cargar pacientes:', error);
        } finally {
          patientsRequestRef.current = null;
        }
      })();
    }
    await patientsRequestRef.current;
  }, [isPatientsLoaded]);

  const reloadPatients = async () => {
    try {
      const data = await PatientService.getAll();
      setPatients(data);
      setIsPatientsLoaded(true);
    } catch (error) {
      console.error('Error al recargar pacientes:', error);
    }
  };

  const loadActiveProfessionals = useCallback(async () => {
    if (isProfessionalsLoaded) return;
    if (!professionalsRequestRef.current) {
      professionalsRequestRef.current = (async () => {
        try {
          await loadProfessionalsFromApi();
        } catch (error) {
          console.error('Error al cargar profesionales:', error);
        } finally {
          professionalsRequestRef.current = null;
        }
      })();
    }
    await professionalsRequestRef.current;
  }, [isProfessionalsLoaded, loadProfessionalsFromApi]);

  const reloadActiveProfessionals = async () => {
    try {
      await loadProfessionalsFromApi();
    } catch (error) {
      console.error('Error al recargar profesionales:', error);
    }
  };

  const loadAllProfessionals = useCallback(async () => {
    await loadActiveProfessionals();
  }, [loadActiveProfessionals]);

  const reloadAllProfessionals = async () => {
    try {
      await loadProfessionalsFromApi();
    } catch (error) {
      console.error('Error al recargar profesionales:', error);
    }
  };

  const loadUsers = useCallback(async () => {
    if (isUsersLoaded) return;
    if (!usersRequestRef.current) {
      usersRequestRef.current = (async () => {
        try {
          const data = await UserService.getAllUsers();
          setUsers(data);
          setIsUsersLoaded(true);
        } catch (error) {
          console.error('Error al cargar usuarios:', error);
        } finally {
          usersRequestRef.current = null;
        }
      })();
    }
    await usersRequestRef.current;
  }, [isUsersLoaded]);

  const ensureInitialData = useCallback(async () => {
    if (isDataLoaded) return;
    await Promise.all([loadPatients(), loadAllProfessionals(), loadUsers()]);
    setIsDataLoaded(true);
  }, [isDataLoaded, loadPatients, loadAllProfessionals, loadUsers]);

  const reloadUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
    }
  };

  // const loadAppointments = async (dni: string | undefined) => {
  //   if (!dni) {
  //     console.warn('No se proporcionó DNI para cargar turnos.');
  //     return;
  //   }

  //   if (appointmentsByProfessional[dni]) {
  //     setAppointments(appointmentsByProfessional[dni]);
  //     return;
  //   }

  //   if (!appointmentsRequestRef.current[dni]) {
  //     appointmentsRequestRef.current[dni] = (async () => {
  //       try {
  //         const data = await AppointmentService.getAppointmentByDni(dni);
  //         setAppointmentsByProfessional((prev) => ({ ...prev, [dni]: data }));
  //         setAppointments(data);
  //       } catch (error) {
  //         console.error('Error al cargar turnos:', error);
  //       } finally {
  //         delete appointmentsRequestRef.current[dni];
  //       }
  //     })();
  //   }

  //   await appointmentsRequestRef.current[dni];
  // };

  // Carga de turnos
  // const loadAppointments = useCallback(async (professional: Professional) => {
  //   if (!professional?.documentNumber) return;

  //   try {
  //     const data = await AppointmentService.getAppointmentByDni(professional.documentNumber);
  //     setAppointments(data);
  //   } catch (error) {
  //     console.error('Error al cargar turnos:', error);
  //   }
  // }, []);

  const loadAppointments = async (dni: string | undefined) => {
    if (!dni) {
      console.warn('No se proporcionó DNI para cargar turnos.');
      return;
    }

    try {
      const data = await AppointmentService.getAppointmentByDni(dni);
      setAppointments(data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  };

  // const reloadAppointments = async (dni: string) => {
  //   try {
  //     const data = await AppointmentService.getAppointmentByDni(dni);
  //     setAppointmentsByProfessional((prev) => ({ ...prev, [dni]: data }));
  //     setAppointments(data);
  //   } catch (error) {
  //     console.error('Error al recargar turnos:', error);
  //   }
  // };

  const reloadAppointments = async (dni: string) => {
    try {
      const data = await AppointmentService.getAppointmentByDni(dni);
      setAppointments(data);
      setLoadedAppointment(dni);
    } catch (error) {
      console.error('Error al recargar turnos:', error);
    }
  };

  const clearAppointments = () => {
    setAppointments([]);
    setLoadedAppointment(null);
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        activeProfessionals,
        allProfessionals,
        appointments,
        users,
        isDataLoaded,
        setIsDataLoaded,
        loadPatients,
        loadAllProfessionals,
        loadActiveProfessionals,
        loadUsers,
        loadAppointments,
        ensureInitialData,
        reloadUsers,
        reloadPatients,
        reloadAllProfessionals,
        reloadActiveProfessionals,
        reloadAppointments,
        clearAppointments,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext debe usarse dentro de un DataProvider');
  }
  return context;
};
