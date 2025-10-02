import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.js';
import type { Appointment, Patient } from '../types.js';
import { Link } from 'react-router-dom';
import { db } from '../data/db.js';
import ConfirmationModal from '../components/ConfirmationModal.js';

const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions): string => {
    return new Date(date).toLocaleDateString('es-ES', options);
};

const AppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id' | 'dentistId'> & { id?: string }) => void;
    patients: Patient[];
    appointment?: Appointment | null;
    selectedDate: Date;
}> = ({ isOpen, onClose, onSave, patients, appointment, selectedDate }) => {
    
    const getInitialFormData = () => {
        if (appointment) {
            const startDate = new Date(appointment.start);
            return {
                patientId: appointment.patientId,
                title: appointment.title,
                date: startDate.toISOString().split('T')[0],
                time: startDate.toTimeString().substring(0, 5),
            };
        }
        return {
            patientId: patients[0]?.id || '',
            title: '',
            date: selectedDate.toISOString().split('T')[0],
            time: '09:00',
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);
    
    useEffect(() => {
        if(isOpen) {
            setFormData(getInitialFormData());
        }
    }, [isOpen, appointment, selectedDate]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [hours, minutes] = formData.time.split(':');
        const startDateTime = new Date(formData.date);
        startDateTime.setUTCHours(parseInt(hours), parseInt(minutes));
        
        const appointmentData = {
            id: appointment?.id,
            patientId: formData.patientId,
            title: formData.title,
            start: startDateTime.toISOString(),
            end: startDateTime.toISOString(),
        };
        onSave(appointmentData as any);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{appointment ? 'Editar Cita' : 'Nueva Cita'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Paciente</label>
                            <select
                                id="patientId"
                                name="patientId"
                                value={formData.patientId}
                                onChange={e => setFormData({...formData, patientId: e.target.value})}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            >
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Motivo</label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                placeholder="Ej: Limpieza, consulta..."
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                required
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
                                <input
                                    type="time"
                                    id="time"
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AppointmentsCalendar: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { appointments, patients, currentUser } = state;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const dateKey = new Date(app.start).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(app);
        });
        return map;
    }, [appointments]);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 for Monday
    const daysInMonth = lastDayOfMonth.getDate();
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'dentistId'> & { id?: string }) => {
        if (!currentUser) {
            alert("Error: no hay un usuario autenticado.");
            return;
        }
        try {
            if (data.id) {
                const originalAppointment = await db.appointments.get(data.id);
                if (!originalAppointment) throw new Error("Cita no encontrada");

                const updatedAppointment: Appointment = {
                    ...originalAppointment,
                    ...(data as Partial<Appointment>),
                };
                await db.appointments.put(updatedAppointment);
                dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
            } else {
                const newAppointment: Appointment = {
                    ...(data as Omit<Appointment, 'id' | 'dentistId'>),
                    id: `apt${Date.now()}`,
                    dentistId: currentUser.id
                };
                await db.appointments.add(newAppointment);
                dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
            }
            setIsModalOpen(false);
            setEditingAppointment(null);
        } catch (error) {
            console.error("Failed to save appointment:", error);
            alert("Error al guardar la cita.");
        }
    };

    const handleEditAppointment = (app: Appointment) => {
        setEditingAppointment(app);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setAppointmentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAppointment = async () => {
        if (!appointmentToDelete) return;
        try {
            await db.appointments.delete(appointmentToDelete);
            dispatch({ type: 'DELETE_APPOINTMENT', payload: appointmentToDelete });
        } catch (error) {
            console.error("Failed to delete appointment:", error);
            alert("Error al eliminar la cita.");
        } finally {
            setAppointmentToDelete(null);
        }
    };
    
    const selectedDayAppointments = appointmentsByDate.get(selectedDate.toDateString()) || [];

    return (
        <>
            <AppointmentModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }}
                onSave={handleSaveAppointment}
                patients={patients}
                appointment={editingAppointment}
                selectedDate={selectedDate}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteAppointment}
                title="Eliminar Cita"
                message="¿Está seguro de que desea eliminar esta cita? La acción es irreversible."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                        <h2 className="text-xl font-bold text-gray-800 capitalize">
                            {formatDate(currentDate, { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500">
                        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const hasAppointments = appointmentsByDate.has(date.toDateString());

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => setSelectedDate(date)}
                                    className={`p-2 rounded-full text-center cursor-pointer transition-colors relative
                                        ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
                                        ${!isSelected && isToday ? 'bg-primary-100 text-primary-700' : ''}
                                        ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                                    `}
                                >
                                    {day}
                                    {hasAppointments && <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`}></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-bold text-gray-800">
                            Citas para {formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <button 
                            onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
                            className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            Nueva
                        </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {selectedDayAppointments.length > 0 ? selectedDayAppointments.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(app => {
                            const patient = patients.find(p => p.id === app.patientId);
                            return (
                                <div key={app.id} className="p-3 bg-primary-50 border-l-4 border-primary-500 rounded-r-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800">{new Date(app.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {app.title}</p>
                                            {patient && <Link to={`/patients/${patient.id}`} className="text-sm text-primary-700 hover:underline">{patient.firstName} {patient.lastName}</Link>}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEditAppointment(app)} className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                            <button onClick={() => handleDeleteClick(app.id)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-gray-500 py-4">No hay citas para este día.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppointmentsCalendar;