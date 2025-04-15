import React, { useState } from "react";
import { Appointment } from "../../interfaces/Appointment";
import { patientsMock } from "../../mocks/PatientsMock";
import { Patient } from "../../interfaces/Patient";

interface Props {
    patients: Patient[];
}

const PatientsComponent: React.FC<Props> = ({patients}) => {

    return (
        <section className="section-appointments">
        <h3>Pacientes</h3>
        <table className="appointments-table">
            <thead>
            <tr>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Obra Social</th>
                <th>Plan</th>
                <th>Teléfono</th>
                <th>Notas</th>
            </tr>
            </thead>
            <tbody>
            {patients.map((patient) => {
                return (
                <tr>
                    <td>{patient?.patientName || "-"}</td>
                    <td>{patient?.dni || "-"}</td>
                    <td>{patient?.socialSecurity || "-"}</td>
                    <td>{patient?.plan || "-"}</td>
                    <td>{patient?.phone || "-"}</td>
                    <td>{patient?.notes || "-"}</td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </section>
    );

};

export default PatientsComponent;
