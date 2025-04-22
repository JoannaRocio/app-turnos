import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.scss";

interface Props {
  onDateSelect: (date: Date) => void;
}

const CalendarComponent: React.FC<Props> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleChange = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  // Genera las fechas de referencia para los 4 calendarios
  const generateMonthDates = (): Date[] => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
      dates.push(nextMonth);
    }
    return dates;
  };

  return (
    <div className="calendar-wrapper">
      {generateMonthDates().map((date, index) => (
        <div key={index} className="calendar-container">
          <Calendar
            onClickDay={handleChange}
            value={selectedDate}
            activeStartDate={date}
          />
        </div>
      ))}
    </div>
  );
};

export default CalendarComponent;
