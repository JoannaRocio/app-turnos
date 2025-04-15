// src/components/AppointmentsPage.tsx
import React, { useState } from "react";
import CalendarComponent from "../../components/CalendarComponent/CalendarComponent";
import AppointmentsComponent from "../../components/AppointmentsComponent/AppointmentsComponent";
import { patientsMock } from "../../mocks/PatientsMock";

const AppointmentsPage: React.FC = () => {
//   const [selectedDate, setSelectedDate] = useState("2025-04-14");
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log(selectedDate)
  };

  return (
    <div>
        {/* <CalendarComponent onDateSelect={setSelectedDate} /> */}
        <div>
          <h2>Seleccioná una fecha:</h2>
          <CalendarComponent onDateSelect={handleDateSelect} />
        </div>
        
        <AppointmentsComponent selectedDate={selectedDate} appointments={patientsMock} />

    </div>
  );
};

export default AppointmentsPage;
