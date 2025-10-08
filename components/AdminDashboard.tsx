
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from './Layout';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS, CHART_DATA } from '../constants';
import { Patient, Appointment } from '../types';

const StatCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean }> = ({ title, value, change, isPositive }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex-1">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
        <div className={`text-sm mt-2 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            )}
            <span>{change} vs last month</span>
        </div>
    </div>
);

const AppointmentsTable: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Today's Appointments</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="p-3 text-sm font-semibold text-slate-500">Patient</th>
                        <th className="p-3 text-sm font-semibold text-slate-500">Time</th>
                        <th className="p-3 text-sm font-semibold text-slate-500">Procedure</th>
                        <th className="p-3 text-sm font-semibold text-slate-500">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.slice(0, 5).map((appt) => (
                        <tr key={appt.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="p-3 font-medium text-slate-700">{appt.patientName}</td>
                            <td className="p-3 text-slate-600">{appt.time}</td>
                            <td className="p-3 text-slate-600">{appt.procedure}</td>
                            <td className="p-3">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                    appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                    appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {appt.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const PatientsTable: React.FC<{ patients: Patient[] }> = ({ patients }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">New Patients</h3>
        <ul>
            {patients.slice(0, 5).map(patient => (
                <li key={patient.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center">
                        <img src={patient.avatarUrl} alt={patient.name} className="h-10 w-10 rounded-full object-cover mr-4" />
                        <div>
                            <p className="font-medium text-slate-700">{patient.name}</p>
                            <p className="text-sm text-slate-500">{patient.email}</p>
                        </div>
                    </div>
                    <button className="text-sm text-primary hover:underline">View</button>
                </li>
            ))}
        </ul>
    </div>
);


const AdminDashboard: React.FC = () => {
    return (
        <Layout title="Admin Dashboard">
            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Patients" value="1,204" change="+5.4%" isPositive={true} />
                    <StatCard title="Appointments Today" value="26" change="-2.1%" isPositive={false} />
                    <StatCard title="Revenue" value="$12,345" change="+15.2%" isPositive={true} />
                    <StatCard title="New Patients" value="12" change="+8%" isPositive={true} />
                </div>

                {/* Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-semibold text-slate-800 mb-4">Appointments Overview</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={CHART_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                                <YAxis tick={{ fill: '#64748b' }} />
                                <Tooltip wrapperClassName="shadow-lg rounded-lg" contentStyle={{ border: 'none', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Bar dataKey="appointments" fill="#06b6d4" name="Appointments" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AppointmentsTable appointments={MOCK_APPOINTMENTS} />
                    <PatientsTable patients={MOCK_PATIENTS} />
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
