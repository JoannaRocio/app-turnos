import React, { useEffect, useState } from "react";
import AppointmentsComponent from "../../components/AppointmentsComponent/AppointmentsComponent";
import PatientsComponent from "../../components/Patients/PatientsPage";
import ProfessionalsComponent from "../../components/Professionals/ProfessionalsComponent";
import { useComponente } from "../../context/ContextComponent";
import { Patient } from "../../interfaces/Patient";
import PatientService from "../../services/PatientService";
import AppointmentService from "../../services/AppointmentService";
import { Professional } from "../../interfaces/Professional";
import ProfessionalService from "../../services/ProfessionalService";
import { Appointment } from "../../interfaces/Appointment";
import AdminDashboard from "../../components/AdminPanel/AdminDashboard";
import UserService from "../../services/UserService";
import { User } from "../../interfaces/User";

const Home: React.FC = () => {
  
  const { componenteActivo } = useComponente();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>();

  useEffect(() => {
    const fetchData = async () => {
      if (componenteActivo === "pacientes") {
        await loadPatients();
      }
      if (componenteActivo === "agenda-turnos") {
        await loadPatients();
        await loadAllProfessionals();
        await loadAppointments(selectedProfessional);

      }
      if (componenteActivo === "profesionales") {
        await loadAllProfessionals();
      }
      if (componenteActivo === "panel-admin") {
        await loadUsers();
      }
    }

    fetchData();
  }, [componenteActivo, selectedProfessional]);

  const loadUsers = async () => {
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await PatientService.getAll();
      
      setPatients(data);
    } catch (err) {
      console.error("Error al traer pacientes:", err);
    }
  };
  
  const loadAllProfessionals = async () => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error("Error al cargar los profesionales:", error);
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
        const appointmentsData = await AppointmentService.getAppointmentByDni(selectedProfessional.professionalDni);
        setAppointments(appointmentsData);
      } else {
        console.warn("No hay profesional seleccionado ni profesionales disponibles.");
      }
    } catch (error) {
      console.error("Error al cargar los turnos:", error);
    }
  };

  return (
    <section>
      <h2 className="text-white">Inicio</h2>

      {componenteActivo === "pacientes" && (
        <PatientsComponent patients={patients ?? []} reloadPatients={loadPatients} />
      )}

      {componenteActivo === "profesionales" && <ProfessionalsComponent professionals={professionals} reloadProfessional={loadAllProfessionals} />}

      {componenteActivo === "agenda-turnos" && (
        <AppointmentsComponent patients={patients} appointments={appointments} professionals={professionals} onAppointmentsUpdate={loadAppointments} />
      )}

      {componenteActivo === "panel-admin" && <AdminDashboard users={users} reloadUsers={loadUsers}/>}
    </section>
  );
};

export default Home;
