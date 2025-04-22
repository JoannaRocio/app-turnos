import React, { useEffect, useState } from "react";
import AppointmentsComponent from "../../components/AppointmentsComponent/AppointmentsComponent";
import PatientsComponent from "../../components/Patients/PatientsPage";
import ProfessionalsComponent from "../../components/Professionals/ProfessionalsComponent";

import { useComponente } from "../../context/ContextComponent";

import { Patient } from "../../interfaces/Patient";
import { professionalsMock } from "../../mocks/ProfessionalsMock";
import { appointmentsMock } from "../../mocks/AppointmentsMock";

// import { Professional } from "../../interfaces/Professional";
import PatientService from "../../services/PatientService";

const Home: React.FC = () => {
  const { componenteActivo } = useComponente();

  const [patients, setPatients] = useState<Patient[]>([]);
  // const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (componenteActivo === "pacientes") {
      loadPatients();
    }
  }, [componenteActivo]);
  
  const loadPatients = async () => {
    try {
      const data = await PatientService.getAll();
      const parsedPatients = data.map((patient: any) => ({
        id: patient.id,
        fullName: patient.patientName,
        documentType: patient.documentType,
        documentNumber: patient.documentNumber,
        phone: patient.phone,
        socialSecurity: patient.socialSecurity,
        plan: patient.plan,
        notes: patient.notes,
      }));
      setPatients(parsedPatients);
    } catch (err) {
      console.error("Error al traer pacientes:", err);
    }
  };

  return (
    <section>
      <h2 className="text-white">Inicio</h2>

      {componenteActivo === "pacientes" && (
        <PatientsComponent patients={patients} reloadPatients={loadPatients} />
      )}

      {componenteActivo === "profesionales" && <ProfessionalsComponent professionals={professionalsMock} />}
      {componenteActivo === "agenda-turnos" && (
        <AppointmentsComponent selectedDate={new Date()} appointments={appointmentsMock} />
      )}
    </section>
  );
};

export default Home;
