import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateConsolidationReport } from '../services/geminiService';
import type { ConsolidationSuggestion } from '../types';
import Spinner from './common/Spinner';

const dataCostSaving = [
  { name: 'Ene', savings: 4000 },
  { name: 'Feb', savings: 3000 },
  { name: 'Mar', savings: 5000 },
  { name: 'Abr', savings: 4500 },
  { name: 'May', savings: 6000 },
  { name: 'Jun', savings: 8000 },
];

const dataSubstitutionRate = [
  { name: 'Almacén A', successRate: 85 },
  { name: 'Almacén B', successRate: 92 },
  { name: 'Almacén C', successRate: 78 },
  { name: 'Almacén D', successRate: 88 },
  { name: 'Almacén E', successRate: 95 },
];

const dataObsolescence = [
  { name: 'Obsoleto', value: 120000 },
  { name: 'En Riesgo', value: 300000 },
  { name: 'Saludable', value: 2500000 },
];

const COLORS = ['#EF4444', '#FBBF24', '#10B981'];

const ConsolidationReport: React.FC = () => {
    const [suggestions, setSuggestions] = useState<ConsolidationSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await generateConsolidationReport();
                setSuggestions(data.suggestions);
            } catch(err) {
                setError("Error al generar el reporte de consolidación.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-40"><Spinner/></div>
    if (error) return <div className="text-center text-luxen-red p-4 bg-red-100 rounded-md">{error}</div>

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consolidar SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">En SKU Sustituto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justificación de IA</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {suggestions.map((s, i) => (
                        <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.fromSku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.toSku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.justification}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-tec-gray">Reportes de Optimización de Inventario</h2>
      
       <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-tec-gray mb-4">Sugerencias de Consolidación de Stock (IA)</h3>
          <ConsolidationReport />
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-tec-gray mb-4">Ahorro de Costos a lo Largo del Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataCostSaving}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0033A0" strokeWidth={2} name="Ahorros (USD)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-tec-gray mb-4">Tasa de Éxito de Sustitución por Almacén</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataSubstitutionRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip formatter={(value: number) => `${value}%`}/>
              <Legend />
              <Bar dataKey="successRate" fill="#10B981" name="Tasa de Éxito" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-tec-gray mb-4">Estado de Salud del Inventario (por Valor)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={dataObsolescence} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {dataObsolescence.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

export default Reports;