import React, { useState } from "react";
import AppointmentsComponent from "../../components/AppointmentsComponent/AppointmentsComponent";
import PatientsComponent from "../../components/Patients/PatientsPage";
import { patientsMock } from "../../mocks/PatientsMock";
import { useComponente } from "../../context/ContextComponent";

const Home: React.FC = () => {
  const { componenteActivo } = useComponente();

  return (
    <div className="container mt-4">
      <h2>Inicio</h2>

      {componenteActivo === "pacientes" && <PatientsComponent patients={patientsMock} />}
      {componenteActivo === "agenda-turnos" && (
        <AppointmentsComponent selectedDate={new Date()} appointments={patientsMock} />
      )}
    </div>
  );
};

export default Home;

