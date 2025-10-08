
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { DashboardIcon, PatientsIcon, AppointmentsIcon, LogoutIcon, ToothIcon } from './Icons';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();

    const navLinks = user?.role === UserRole.ADMIN 
        ? [
            { to: '/admin', icon: DashboardIcon, text: 'Dashboard' },
            { to: '/admin/patients', icon: PatientsIcon, text: 'Patients' },
            { to: '/admin/appointments', icon: AppointmentsIcon, text: 'Appointments' }
          ]
        : [
            { to: '/dashboard', icon: DashboardIcon, text: 'My Dashboard' },
            { to: '/dashboard/appointments', icon: AppointmentsIcon, text: 'My Appointments' }
          ];

    return (
        <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col">
            <div className="h-20 flex items-center justify-center border-b border-slate-700">
                <ToothIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold ml-2">DentalApp</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                            isActive ? 'bg-primary text-white' : 'hover:bg-slate-700'
                            }`
                        }
                    >
                        <link.icon className="h-6 w-6 mr-3" />
                        <span>{link.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-700">
                <button onClick={logout} className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                    <LogoutIcon className="h-6 w-6 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const Header: React.FC<{ title: string }> = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
            <div className="flex items-center">
                <div className="text-right mr-4">
                    <p className="font-semibold text-slate-700">{user?.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                </div>
                <img src={user?.avatarUrl} alt="User Avatar" className="h-12 w-12 rounded-full object-cover" />
            </div>
        </header>
    );
};


const Layout: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header title={title} />
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
