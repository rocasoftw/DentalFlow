import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { BillingRecord } from '../types.js';

const Reports: React.FC = () => {
    const { state } = useAppContext();
    const { patients, treatments } = state;

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
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (!percent) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros y de Actividad</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium text-gray-700">Fecha de Inicio:</label>
                        <input
                            type="date"
                            id="start-date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="ml-2 p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="text-sm font-medium text-gray-700">Fecha de Fin:</label>
                        <input
                            type="date"
                            id="end-date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="ml-2 p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="text-center bg-primary-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-600">Ingresos Totales en el Período Seleccionado</h3>
                    <p className="text-4xl font-bold text-primary-600 mt-2">${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Ingresos por Mes</h2>
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
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución de Tratamientos</h2>
                    <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie
                                data={treatmentsCount}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {treatmentsCount.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => {
                                const percentage = filteredRecords.length > 0 ? ((value / filteredRecords.length) * 100) : 0;
                                return [`${value} (${percentage.toFixed(1)}%)`, name];
                            }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;