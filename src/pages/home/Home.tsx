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

const Home: React.FC = () => {
  
  const { componenteActivo } = useComponente();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (componenteActivo === "pacientes") {
        await loadPatients();
      }
      if (componenteActivo === "agenda-turnos") {
        await loadPatients();
        await loadAllProfessionals();
        await loadAppointments();
      }
      if (componenteActivo === "profesionales") {
        await loadAllProfessionals();
      }
    }

    fetchData();
  }, [componenteActivo]);

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
      console.error("Error al cargar los turnos:", error);
    }
  };

  const loadAppointments = async () => {
    try {
      // const data = await AppointmentService.getProfessionalAppointmentsByDni(professionals[0].professionalDni);
      const data = await AppointmentService.getAllAppointments();
  
      setAppointments(data);
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

      {componenteActivo === "profesionales" && <ProfessionalsComponent professionals={professionals} />}

      {componenteActivo === "agenda-turnos" && (
        <AppointmentsComponent patients={patients} appointments={appointments} professionals={professionals} onAppointmentsUpdate={loadAppointments} />
      )}
    </section>
  );
};

export default Home;
