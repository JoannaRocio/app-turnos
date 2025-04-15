import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.scss";

interface Props {
  onDateSelect: (date: Date) => void;
}

const CalendarComponent: React.FC<Props> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleChange = (value: Date) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      onDateSelect(value);
    }
  };
  

  return (
    <div className="calendar-wrapper">
      <Calendar
        onClickDay={handleChange}
        value={selectedDate}
      />
    </div>
  );
};

export default CalendarComponent;
