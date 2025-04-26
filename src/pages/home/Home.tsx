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
  const [selectedProfessional, setSelectedProfessional] = useState('');

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

  const loadAppointments = async (selectedProfessional: string) => {
    try {
      const data = await ProfessionalService.getAllProfessionals();
      setProfessionals(data);
  
      if (data.length > 1) {
        const dniProfessional = data[0].professionalDni;
        const appointmentsData = await AppointmentService.getAppointmentByDni(selectedProfessional || dniProfessional);
        setAppointments(appointmentsData);
      } else {
        console.warn("No hay suficientes profesionales para obtener el segundo.");
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
    </section>
  );
};

export default Home;
