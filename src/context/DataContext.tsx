import React, { createContext, useContext, useState, useCallback } from 'react';
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

  const loadPatients = useCallback(async () => {
    if (isPatientsLoaded) return;
    try {
      const response = await PatientService.getAll();
      setPatients(response);
      setIsPatientsLoaded(true);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
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
    try {
      const data = await ProfessionalService.getAllProfessionals();
      const active = data.filter((p) => p.professionalState === 'ACTIVE');
      setActiveProfessionals(active);
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
    }
  }, [isProfessionalsLoaded]);

  const reloadActiveProfessionals = async () => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      const active = data.filter((p) => p.professionalState === 'ACTIVE');
      setActiveProfessionals(active);
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al recargar profesionales:', error);
    }
  };

  const loadAllProfessionals = useCallback(async () => {
    if (isProfessionalsLoaded) return;
    try {
      const data = await ProfessionalService.getAllProfessionals();
      setAllProfessionals(data); // 📌 Ponemos todos los datos
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
    }
  }, [isProfessionalsLoaded]);

  const reloadAllProfessionals = async () => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      setAllProfessionals(data); // 📌 Ponemos todos los datos
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al recargar profesionales:', error);
    }
  };

  const loadUsers = useCallback(async () => {
    if (isUsersLoaded) return;
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
      setIsUsersLoaded(true);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, [isUsersLoaded]);

  const reloadUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
    }
  };

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
