import React, { createContext, useContext, useState, useEffect } from 'react';
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
  professionals: Professional[];
  appointments: Appointment[];
  users: User[];
  loadPatients: () => Promise<void>;
  loadProfessionals: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadAppointments: (dni: string) => Promise<void>;
  reloadUsers: () => Promise<void>;
  reloadPatients: () => Promise<void>;
  reloadAppointments: (dni: string) => Promise<void>;
  reloadProfessionals: () => Promise<void>;
  clearAppointments: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const [isPatientsLoaded, setIsPatientsLoaded] = useState(false);
  const [isProfessionalsLoaded, setIsProfessionalsLoaded] = useState(false);

  const [, setLoadedAppointment] = useState<string | null>(null);

  const loadPatients = async () => {
    if (isPatientsLoaded) return;
    try {
      const response = await PatientService.getAll();
      setPatients(response);
      setIsPatientsLoaded(true);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const reloadPatients = async () => {
    try {
      const data = await PatientService.getAll();
      setPatients(data);
      setIsPatientsLoaded(true);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const loadProfessionals = async () => {
    if (isProfessionalsLoaded) return;
    try {
      const data = await ProfessionalService.getAllProfessionals();
      const active = data.filter((p) => p.professionalState === 'ACTIVE');
      setProfessionals(active);
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
    }
  };

  const reloadProfessionals = async () => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      const active = data.filter((p) => p.professionalState === 'ACTIVE');
      setProfessionals(active);
      setIsProfessionalsLoaded(true);
    } catch (error) {
      console.error('Error al cargar profesionales:', error);
    }
  };

  const loadUsers = async () => {
    if (isUsersLoaded) return;
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
      setIsUsersLoaded(true);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

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

  useEffect(() => {
    loadPatients();
    loadProfessionals();
    loadUsers();
  }, []);

  return (
    <DataContext.Provider
      value={{
        patients,
        professionals,
        appointments,
        users,
        loadPatients,
        loadProfessionals,
        loadUsers,
        loadAppointments,
        reloadUsers,
        reloadPatients,
        reloadProfessionals,
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
