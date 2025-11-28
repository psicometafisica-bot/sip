import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateDashboardData } from '../services/geminiService';
import type { Kpi, InventoryData } from '../types';
import Spinner from './common/Spinner';

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const KpiCard: React.FC<{ kpi: Kpi, icon: React.ReactElement }> = ({ kpi, icon }) => {
    const isIncrease = kpi.changeType === 'increase';
    const changeColor = isIncrease ? 'text-luxen-green' : 'text-luxen-red';
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
            <div className="bg-tec-blue text-white rounded-full p-3 mr-4">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">{kpi.label}</h3>
                <p className="text-3xl font-bold text-tec-gray">{kpi.value}</p>
                <div className="flex items-center text-sm mt-1">
                    <span className={changeColor}>{isIncrease ? '▲' : '▼'} {kpi.change}</span>
                    <span className="ml-1 text-gray-500">vs mes anterior</span>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [kpis, setKpis] = useState<Kpi[]>([]);
    const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await generateDashboardData();
                setKpis(data.kpis);
                setInventoryData(data.inventoryData);
                setError(null);
            } catch (err) {
                setError('Error al cargar los datos del panel. Por favor, intente de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    if (error) return <div className="text-center text-luxen-red p-4 bg-red-100 rounded-md">{error}</div>;

    const ICONS = [
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M12 18c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 0c-2.67 0-5-1.34-5-3s2.33-3 5-3 5 1.34 5 3-2.33 3-5 3z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.875 9.475-4.673z" /></svg>,
    ];

    const COLORS = ['#0033A0', '#10B981', '#FBBF24', '#4A4A4A', '#F0F2F5'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                    <KpiCard key={index} kpi={kpi} icon={ICONS[index % ICONS.length]} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold text-tec-gray mb-4">Rotación de Inventario (Unidades)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={inventoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#0033A0" name="Unidades" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-tec-gray mb-4">Valor de Stock por Categoría</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={inventoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {inventoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-tec-gray mb-4">Estado de Integración de Sistemas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-2xl font-bold text-blue-800 mx-auto mb-2 h-8 flex items-center justify-center">SAP</p>
                        <p className="text-sm font-semibold">SAP FIORI</p>
                        <span className="text-xs font-bold text-green-600">● Conectado</span>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M2 7h20M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2m-6 5h.01M12 12h.01M10 12h.01" /></svg>
                        <p className="text-sm font-semibold">WMS</p>
                        <span className="text-xs font-bold text-green-600">● Conectado</span>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-2xl font-bold text-blue-600 mx-auto mb-2 h-8 flex items-center justify-center">COUPA</p>
                        <p className="text-sm font-semibold">COUPA</p>
                        <span className="text-xs font-bold text-green-600">● Conectado</span>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                        <p className="text-2xl font-bold text-teal-600 mx-auto mb-2 h-8 flex items-center justify-center">Sphera</p>
                        <p className="text-sm font-semibold">Sphera</p>
                        <span className="text-xs font-bold text-green-600">● Conectado</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;