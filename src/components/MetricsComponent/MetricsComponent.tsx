import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricsService from "../../services/MetricsService";

const MetricsComponent = () => {
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<{ date: string; count: number }[]>([]);
  const [newPatientsPerWeek, setNewPatientsPerWeek] = useState<{ week: number; count: number }[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<{ state: string; count: number }[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [perDay, perWeek, stats] = await Promise.all([
          MetricsService.getAppointmentsPerDay(),
          MetricsService.getNewPatientsPerWeek(),
          MetricsService.getAppointmentStats()
        ]);
  
        setAppointmentsPerDay(
          Object.entries(perDay).map(([date, count]) => ({ date, count }))
        );
  
        setNewPatientsPerWeek(
          Object.entries(perWeek).map(([week, count]) => ({ week: parseInt(week), count }))
        );
  
        setAppointmentStats(
          Object.entries(stats).map(([state, count]) => ({ state, count }))
        );
  
      } catch (err) {
        console.error("Error cargando métricas:", err);
      }
    };
  
    fetchMetrics();
  }, []);
  

  return (
    <><div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-xl font-bold mb-4">Turnos asignados por día</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={appointmentsPerDay}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow mt-6">
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
      
      <div className="bg-white rounded-xl p-4 shadow mt-6">
        <h3 className="text-xl font-bold mb-4">Estado de los turnos</h3>
        <ul>
          {appointmentStats.map(({ state, count }) => (
            <li key={state} className="text-gray-700">
              <strong>{state}:</strong> {count}
            </li>
          ))}
        </ul>
      </div>
      </>
  );
};

export default MetricsComponent;
