import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.js';
import { db } from '../data/db.js';

const FormField = ({label, name, type, value, onChange, required = true, placeholder = ''}) => (
    <div>
        <label htmlFor={name} className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
        <input 
            type={type} 
            name={name} 
            id={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            placeholder={placeholder}
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base placeholder-gray-500 shadow-sm transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
    </div>
);

const TextAreaField = ({label, name, value, onChange, placeholder = ''}) => (
    <div className="md:col-span-2">
         <label htmlFor={name} className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
         <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            rows={4}
            placeholder={placeholder}
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base placeholder-gray-500 shadow-sm transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
         />
    </div>
);


const PatientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useAppContext();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dni: '',
        dob: '',
        phone: '',
        email: '',
        obraSocial: '',
        observaciones: '',
    });

    useEffect(() => {
        if (isEditing) {
            const patientToEdit = state.patients.find(p => p.id === id);
            if (patientToEdit) {
                setFormData({
                    firstName: patientToEdit.firstName,
                    lastName: patientToEdit.lastName,
                    dni: patientToEdit.dni,
                    dob: patientToEdit.dob,
                    phone: patientToEdit.phone,
                    email: patientToEdit.email,
                    obraSocial: patientToEdit.obraSocial || '',
                    observaciones: patientToEdit.observaciones || '',
                });
            } else {
                navigate('/patients');
            }
        }
    }, [id, isEditing, state.patients, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!state.currentUser) {
            alert("Error: No hay un usuario autenticado.");
            return;
        }
        try {
            if (isEditing) {
                const patientToUpdate = state.patients.find(p => p.id === id);
                if (patientToUpdate) {
                    const updatedPatient = { ...patientToUpdate, ...formData };
                    await db.patients.put(updatedPatient);
                    dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
                    navigate(`/patients/${id}`);
                }
            } else {
                const newPatient = {
                    id: `p${Date.now()}`,
                    dentistId: state.currentUser.id,
                    ...formData,
                    anamnesis: { allergies: '', preexistingConditions: '', currentMedication: '', isSmoker: false, isDrinker: false, notes: '' },
                    dentalState: {},
                    billingRecords: [],
                };
                await db.patients.add(newPatient);
                dispatch({ type: 'ADD_PATIENT', payload: newPatient });
                navigate('/patients');
            }
        } catch (error) {
            console.error("Failed to save patient:", error);
            alert("Error al guardar el paciente.");
        }
    };

    return (
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg md:p-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
                </h1>
                <p className="mt-2 text-gray-500">
                    Complete los detalles del paciente a continuación.
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="max-h-[55vh] overflow-y-auto px-4 py-1">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                        <FormField label="Nombre" name="firstName" type="text" value={formData.firstName} onChange={handleChange} />
                        <FormField label="Apellido" name="lastName" type="text" value={formData.lastName} onChange={handleChange} />
                        <FormField label="DNI" name="dni" type="text" value={formData.dni} onChange={handleChange} />
                        <FormField label="Fecha de Nacimiento" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                        <FormField label="Teléfono" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                        <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        <FormField label="Obra Social" name="obraSocial" type="text" value={formData.obraSocial} required={false} placeholder="Ej: OSDE, Swiss Medical" onChange={handleChange} />
                        <TextAreaField label="Observaciones" name="observaciones" value={formData.observaciones} placeholder="Anotaciones adicionales sobre el paciente..." onChange={handleChange} />
                    </div>
                </div>
                <div className="mt-10 flex justify-end space-x-4 border-t border-gray-200 pt-6">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="rounded-lg bg-gray-200 px-8 py-3 text-base font-semibold text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="rounded-lg bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Guardar Paciente
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientForm;
