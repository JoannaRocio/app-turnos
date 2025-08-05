import { useEffect, useState } from 'react';
import es from 'date-fns/locale/es';
import type { Locale } from 'date-fns';
import './MetricsComponent.scss';
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
} from 'recharts';
import MetricsService from '../../services/MetricsService';

const MetricsComponent = () => {
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<{ date: string; count: number }[]>(
    []
  );
  const [appointmentStats, setAppointmentStats] = useState<{ state: string; count: number }[]>([]);
  const [patientsByMonth, setPatientsByMonth] = useState<{ month: string; count: number }[]>([]);

  const esLocale = es as unknown as Locale;

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [perDay, perMonth, stats] = await Promise.all([
          MetricsService.getAppointmentsPerDay(),
          MetricsService.getNewPatientsPerMonth(),
          MetricsService.getAppointmentStats(),
        ]);

        // Turnos por día
        const appointmentsArray = Object.entries(perDay)
          .map(([date, count]) => ({
            date,
            count: Number(count),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointmentsPerDay(appointmentsArray);

        // Pacientes nuevos por mes (ya es un número, solo lo procesamos)
        const patientsByMonthArray = Object.entries(perMonth).map(([month, value]) => ({
          month,
          count: value, // Directamente el valor numérico
        }));
        setPatientsByMonth(patientsByMonthArray);

        // Estado de los turnos
        const statsArray = Object.entries(stats).map(([state, count]) => ({
          state,
          count: Number(count),
        }));
        setAppointmentStats(statsArray);
      } catch (err) {
        console.error('Error cargando métricas:', err);
      }
    };

    fetchMetrics();
  }, [esLocale]);

  //   const fetchMetrics = async () => {
  //     try {
  //       const [perDay, perWeek, stats] = await Promise.all([
  //         MetricsService.getAppointmentsPerDay(),
  //         MetricsService.getNewPatientsPerMonth(),
  //         MetricsService.getAppointmentStats(),
  //       ]);

  //       const appointmentsArray = Object.entries(perDay)
  //         .map(([date, count]) => ({
  //           date,
  //           count: Number(count),
  //         }))
  //         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  //       setAppointmentsPerDay(appointmentsArray);

  //       const patientsArray = Object.entries(perWeek)
  //         .map(([week, count]) => ({
  //           week: parseInt(week, 10),
  //           count: Number(count),
  //         }))
  //         .sort((a, b) => a.week - b.week);
  //       setNewPatientsPerWeek(patientsArray);

  //       const countsByDay: Record<string, number> = {
  //         Lunes: 0,
  //         Martes: 0,
  //         Miércoles: 0,
  //         Jueves: 0,
  //         Viernes: 0,
  //         Sábado: 0,
  //         Domingo: 0,
  //       };

  //       Object.entries(perWeek).forEach(([dateStr, count]) => {
  //         const dayName = format(parseISO("2024-05-01"), "EEEE", { locale: esLocale });
  //         const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  //         if (countsByDay[capitalized] !== undefined) {
  //           countsByDay[capitalized] += Number(count);
  //         }
  //       });

  //       const formattedDays = Object.keys(countsByDay).map((day) => ({
  //         day,
  //         count: countsByDay[day],
  //       }));

  //       setPatientsByDayOfWeek(formattedDays);

  //       const statsArray = Object.entries(stats).map(([state, count]) => ({
  //         state,
  //         count: Number(count),
  //       }));
  //       setAppointmentStats(statsArray);
  //     } catch (err) {
  //       console.error("Error cargando métricas:", err);
  //     }
  //   };

  //   fetchMetrics();
  // }, [esLocale]);

  return (
    <>
      <h3 className="App-secondary-title text-white">Métricas</h3>
      <section className="container mt-5">
        {/* Turnos por día */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-white rounded-xl p-4 shadow metrics-container">
              <h3 className="text-xl font-bold mb-4">Turnos asignados por día (últimos 30 días)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [`${value} turnos`, 'Cantidad']}
                    labelFormatter={(label) =>
                      `Fecha: ${new Date(label).toLocaleDateString('es-AR')}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#007bff"
                    activeDot={{ r: 6 }}
                    label={{ position: 'top', fill: '#333', fontSize: 12 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pacientes nuevos por mes */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-white rounded-xl p-4 shadow metrics-container">
              <h3 className="text-xl font-bold mb-4">Pacientes nuevos por mes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Estado de turnos y pie chart */}
        <div className="row mb-5">
          <div className="col-md-6 mb-4">
            <div className="bg-white rounded-xl p-4 shadow metrics-container h-100">
              <h3 className="text-xl font-bold mb-4">Estado de los turnos</h3>
              <ul>
                {appointmentStats.map(({ state, count }) => (
                  <li key={state} className="text-gray-700">
                    <strong>{state}:</strong> {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="bg-white rounded-xl p-4 shadow metrics-container h-100">
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
                    {appointmentStats.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            '#8884d8',
                            '#82ca9d',
                            '#ffc658',
                            '#ff8042',
                            '#0d6efd',
                            '#f4a9f7ff',
                            '#78c9eeff',
                          ][index % 7]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MetricsComponent;
