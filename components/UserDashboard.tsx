
import React from 'react';
import Layout from './Layout';
import { useAuth } from '../hooks/useAuth';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS } from '../constants';
import { Appointment, Patient } from '../types';

const UpcomingAppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const appointmentDate = new Date(appointment.date);
    const day = appointmentDate.toLocaleDateString('en-US', { day: '2-digit' });
    const month = appointmentDate.toLocaleDateString('en-US', { month: 'short' });

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-6">
            <div className="flex flex-col items-center justify-center bg-primary-100 text-primary-700 rounded-lg h-20 w-20">
                <span className="text-3xl font-bold">{day}</span>
                <span className="text-sm font-semibold uppercase">{month}</span>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-slate-800">{appointment.procedure}</h3>
                <p className="text-slate-500 mt-1">{appointment.time}</p>
                 <p className="text-slate-500 mt-1">Status: <span className="font-medium capitalize text-slate-700">{appointment.status}</span></p>
            </div>
        </div>
    );
};

const UserInfoCard: React.FC<{ patient: Patient | undefined }> = ({ patient }) => {
    if (!patient) return null;
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Information</h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-medium text-slate-700">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-700">{patient.email}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-700">{patient.phone}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Last Visit:</span>
                    <span className="font-medium text-slate-700">{patient.lastVisit}</span>
                </div>
            </div>
             <button className="w-full mt-6 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                Update Information
            </button>
        </div>
    );
};


const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const userAppointments = MOCK_APPOINTMENTS.filter(appt => appt.patientId === user?.id);
    const patientInfo = MOCK_PATIENTS.find(p => p.id === user?.id);

    return (
        <Layout title="My Dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-semibold text-slate-800">Upcoming Appointments</h2>
                    {userAppointments.length > 0 ? (
                        userAppointments.map(appt => <UpcomingAppointmentCard key={appt.id} appointment={appt} />)
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-md text-center text-slate-500">
                            You have no upcoming appointments.
                        </div>
                    )}
                </div>
                <div>
                    <UserInfoCard patient={patientInfo} />
                </div>
            </div>
        </Layout>
    );
};

export default UserDashboard;
