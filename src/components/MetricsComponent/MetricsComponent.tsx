import { useEffect, useState } from "react";
import es from "date-fns/locale/es";
import type { Locale } from "date-fns";
import "./MetricsComponent.scss";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Legend,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import MetricsService from "../../services/MetricsService";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";

const MetricsComponent = () => {
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<{ date: string; count: number }[]>([]);
  const [newPatientsPerWeek, setNewPatientsPerWeek] = useState<{ week: number; count: number }[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<{ state: string; count: number }[]>([]);
  const [patientsByDayOfWeek, setPatientsByDayOfWeek] = useState<{ day: string, count: number }[]>([]);
  const esLocale = es as unknown as Locale; 

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [perDay, perWeek, stats] = await Promise.all([
          MetricsService.getAppointmentsPerDay(),
          MetricsService.getNewPatientsPerMonth(),
          MetricsService.getAppointmentStats()
        ]);

        // Turnos por día
        const appointmentsArray = Object.entries(perDay)
          .map(([date, count]) => ({
            date,
            count: Number(count),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointmentsPerDay(appointmentsArray);

        // Pacientes nuevos por semana (original, si querés mantenerlo)
        const patientsArray = Object.entries(perWeek)
          .map(([week, count]) => ({
            week: parseInt(week, 10),
            count: Number(count),
          }))
          .sort((a, b) => a.week - b.week);
        setNewPatientsPerWeek(patientsArray);

        // Pacientes nuevos agrupados por día de la semana
        const countsByDay: Record<string, number> = {
          "Lunes": 0,
          "Martes": 0,
          "Miércoles": 0,
          "Jueves": 0,
          "Viernes": 0,
          "Sábado": 0,
          "Domingo": 0
        };

        Object.entries(perWeek).forEach(([dateStr, count]) => {
          const dayName = format(parseISO("2024-05-01"), "EEEE", { locale: esLocale })
          
          const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          if (countsByDay[capitalized] !== undefined) {
            countsByDay[capitalized] += Number(count);
          }
        });

        const formattedDays = [
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
          "Domingo",
        ].map((day) => ({
          day,
          count: countsByDay[day] || 0
        }));

        setPatientsByDayOfWeek(formattedDays); // asegurate de tener este state

        // Estado de los turnos
        const statsArray = Object.entries(stats)
          .map(([state, count]) => ({
            state,
            count: Number(count),
          }));
        setAppointmentStats(statsArray);

      } catch (err) {
        console.error("Error cargando métricas:", err);
      }
    };

    fetchMetrics();
  }, [esLocale]);

  return (
    <section> 
      <div className="bg-white rounded-xl p-4 shadow metrics-container">
        <h3 className="text-xl font-bold mb-4">
          Turnos asignados por día (últimos 30 días)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={appointmentsPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [`${value} turnos`, "Cantidad"]}
              labelFormatter={(label) =>
                `Fecha: ${new Date(label).toLocaleDateString("es-AR")}`
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#007bff"
              activeDot={{ r: 6 }}
              label={{ position: "top", fill: "#333", fontSize: 12 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-4 shadow metrics-container mt-6">
        <h3 className="text-xl font-bold mb-4">Pacientes nuevos por mes.</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patientsByDayOfWeek}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-4 shadow mt-6 metrics-container">
        <h3 className="text-xl font-bold mb-4">Nuevos pacientes por semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={newPatientsPerWeek}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
        
      <div className="bg-white rounded-xl p-4 shadow mt-6 metrics-container">
        <h3 className="text-xl font-bold mb-4">Estado de los turnos</h3>
        <ul>
          {appointmentStats.map(({ state, count }) => (
            <li key={state} className="text-gray-700">
              <strong>{state}:</strong> {count}
            </li>
          ))}
        </ul>
      </div>
        
      <div className="bg-white rounded-xl p-4 shadow metrics-container mt-6">
        <h3 className="text-xl font-bold mb-4">Distribución de estados de turnos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={appointmentStats}
              dataKey="count"
              nameKey="state"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {
                appointmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]} />
                ))
              }
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default MetricsComponent;