import React, { useEffect, useState } from "react";
import AppointmentsComponent from "../../components/AppointmentsComponent/AppointmentsComponent";
import PatientsComponent from "../../components/Patients/PatientsPage";
import ProfessionalsComponent from "../../components/Professionals/ProfessionalsComponent";

import { useComponente } from "../../context/ContextComponent";

import { Patient } from "../../interfaces/Patient";
// import { professionalsMock } from "../../mocks/ProfessionalsMock";
// import { appointmentsMock } from "../../mocks/AppointmentsMock";

// import { Professional } from "../../interfaces/Professional";
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

  const loadPatients = async () => {
    try {
      const data = await PatientService.getAll();
      const parsedPatients: Patient[] = data.map((patient) => ({
        id: patient.id,
        full_name: patient.full_name,  // Cambiar de fullName a full_name
        document_type: patient.document_type,  // Cambiar de documentType a document_type
        document_number: patient.document_number,  // Cambiar de documentNumber a document_number
        health_insurance: patient.health_insurance,  // Cambiar de socialSecurity a health_insurance
        insurance_plan: patient.insurance_plan,  // Cambiar de plan a insurance_plan
        phone: patient.phone,
        registration_date: patient.registration_date,  // Asegúrate de tener este dato
        last_visit_date: patient.last_visit_date,  // Asegúrate de tener este dato
        note: patient.note,  // Cambiar de notes a note
        state: patient.state,  // Asegúrate de tener este dato
      }));
      setPatients(parsedPatients); // Actualiza el estado con los pacientes parseados
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
      const data = await AppointmentService.getAllAppointments();
  
      // Transformar la respuesta para ajustarse a la estructura de `Appointment` y `Patient`
      const transformedAppointments = data.map((appointment: any) => ({
        patientDni: appointment.patientDni, // Ajustar el campo `patientDni`
        patientFullName: appointment.patientFullName, // Ajustar el campo `patientFullName`
        dateTime: appointment.dateTime,
        professionalFullName: appointment.professionalFullName,
        professionalDni: appointment.professionalDni,
        reason: appointment.reason,
        state: appointment.state,
        patient: {
          id: appointment.patient.id,
          full_name: appointment.patient.fullName, // Cambiar el nombre del campo a `full_name`
          document_type: appointment.patient.documentType, // Ajustar nombres de los campos
          document_number: appointment.patient.documentNumber,
          health_insurance: appointment.patient.healthInsurance,
          insurance_plan: appointment.patient.insurancePlan,
          phone: appointment.patient.phone,
          registration_date: appointment.patient.registrationDate,
          last_visit_date: appointment.patient.lastVisitDate,
          note: appointment.patient.note,
          state: appointment.patient.patientState, // Ajustar a tu campo `state`
        }
      }));
  
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error("Error al cargar los turnos:", error);
    }
  };
  

  useEffect(() => {
    if (componenteActivo === "pacientes") {
      loadPatients();
    }
    if (componenteActivo === "agenda-turnos") {
    loadPatients();
    loadAllProfessionals();
    loadAppointments();
    }
    if (componenteActivo === "profesionales") {
      loadAllProfessionals();
    }

  }, [componenteActivo]);

  return (
    <section>
      <h2 className="text-white">Inicio</h2>

      {componenteActivo === "pacientes" && (
        // <PatientsComponent patients={patients} reloadPatients={loadPatients} />
        <PatientsComponent patients={patients ?? []} reloadPatients={loadPatients} />

      )}

      {componenteActivo === "profesionales" && <ProfessionalsComponent professionals={professionals} />}

      {componenteActivo === "agenda-turnos" && (
        <AppointmentsComponent selectedDate={new Date()} patients={patients} appointments={appointments} professionals={professionals} />
      )}
    </section>
  );
};

export default Home;
