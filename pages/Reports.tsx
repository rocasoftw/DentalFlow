
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { BillingRecord } from '../types';

const Reports: React.FC = () => {
    const { state } = useAppContext();
    const { patients, treatments, currentUser } = state;

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const allBillingRecords: BillingRecord[] = useMemo(() => patients.flatMap(p => p.billingRecords), [patients]);

    const filteredRecords = useMemo(() => {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the whole end day

        return allBillingRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startDate && recordDate <= endDate;
        });
    }, [allBillingRecords, dateRange]);

    const totalIncome = useMemo(() => filteredRecords.reduce((sum, record) => sum + record.cost, 0), [filteredRecords]);

    const incomeByMonth = useMemo(() => {
        const months: { [key: string]: number } = {};
        filteredRecords.forEach(record => {
            const month = new Date(record.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!months[month]) {
                months[month] = 0;
            }
            months[month] += record.cost;
        });
        return Object.entries(months).map(([name, income]) => ({ name, income })).reverse();
    }, [filteredRecords]);

    const treatmentsCount = useMemo(() => {
        const counts: { [key: string]: number } = {};
        filteredRecords.forEach(record => {
            const treatmentName = treatments.find(t => t.id === record.treatmentId)?.name || 'Desconocido';
            if (!counts[treatmentName]) {
                counts[treatmentName] = 0;
            }
            counts[treatmentName]++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredRecords, treatments]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes de Facturación</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Filtrar por Fecha</h2>
                <div className="flex items-center space-x-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Desde</label>
                        <input
                            type="date"
                            id="start-date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Hasta</label>
                        <input
                            type="date"
                            id="end-date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        />
                    </div>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
                    <h3 className="text-lg font-semibold text-gray-600">Ingresos Totales</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">${totalIncome.toLocaleString()}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
                    <h3 className="text-lg font-semibold text-gray-600">Tratamientos Realizados</h3>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{filteredRecords.length}</p>
                </div>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Ingresos por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={incomeByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="income" fill="#8884d8" name="Ingresos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Tratamientos Más Comunes</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={treatmentsCount}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {treatmentsCount.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
