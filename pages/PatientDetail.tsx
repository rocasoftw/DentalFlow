import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Odontogram from '../components/Odontogram';
import type { Patient, Anamnesis, BillingRecord, ToothCondition, Treatment } from '../types';
import { db } from '../data/db';
import ConfirmationModal from '../components/ConfirmationModal';

const AnamnesisFormField: React.FC<{
    label: string,
    name: keyof Anamnesis,
    value: string,
    placeholder: string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    rows?: number
}> = ({label, name, value, placeholder, onChange, rows = 3}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-700 shadow-sm transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
    </div>
);

const AnamnesisToggleSwitch: React.FC<{
    label: string,
    name: keyof Anamnesis,
    checked: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ label, name, checked, onChange }) => (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <span className="font-semibold text-gray-800">{label}</span>
        <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
    </div>
);


const AnamnesisForm: React.FC<{ anamnesis: Anamnesis, patientId: string, onSave: (patientId: string, data: { anamnesis: Anamnesis }) => void }> = ({ anamnesis, patientId, onSave }) => {
    const [formData, setFormData] = useState(anamnesis);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(patientId, { anamnesis: formData });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Column 1: Medical Conditions */}
                <div className="space-y-6">
                    <AnamnesisFormField 
                        label="Alergias Conocidas" 
                        name="allergies" 
                        value={formData.allergies} 
                        placeholder="Ej: Penicilina, Ibuprofeno, látex..." 
                        onChange={handleChange}
                    />
                    <AnamnesisFormField 
                        label="Enfermedades Preexistentes" 
                        name="preexistingConditions" 
                        value={formData.preexistingConditions} 
                        placeholder="Ej: Hipertensión, diabetes, asma..." 
                        onChange={handleChange}
                    />
                    <AnamnesisFormField 
                        label="Medicación Actual" 
                        name="currentMedication" 
                        value={formData.currentMedication} 
                        placeholder="Ej: Enalapril 10mg, Metformina..." 
                        onChange={handleChange}
                    />
                </div>
                {/* Column 2: Habits & Notes */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Hábitos</h3>
                        <AnamnesisToggleSwitch label="¿Es fumador/a?" name="isSmoker" checked={formData.isSmoker} onChange={handleChange} />
                        <AnamnesisToggleSwitch label="¿Consume alcohol regularmente?" name="isDrinker" checked={formData.isDrinker} onChange={handleChange} />
                    </div>
                     <AnamnesisFormField 
                        label="Notas Adicionales" 
                        name="notes" 
                        value={formData.notes} 
                        placeholder="Observaciones relevantes del paciente..."
                        rows={6}
                        onChange={handleChange}
                    />
                </div>
            </div>
             <div className="flex items-center justify-end gap-4 mt-8 pt-5 border-t border-gray-200">
                {showSuccess && (
                    <div className="flex items-center gap-2 text-green-600 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">¡Guardado!</span>
                    </div>
                )}
                <button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Anamnesis
                </button>
            </div>
        </form>
    );
}

const BillingFormInput: React.FC<{
    label: string,
    name: string,
    type?: string,
    value: string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    children?: React.ReactNode,
    placeholder?: string,
    as?: 'input' | 'select' | 'textarea',
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search",
    rows?: number
}> = 
({ label, name, type = 'text', value, onChange, children, placeholder, as = 'input', inputMode, rows }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {as === 'input' ? (
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={inputMode}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3"
            />
        ) : as === 'select' ? (
             <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3"
            >
                {children}
            </select>
        ) : (
            <textarea
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3"
            />
        )}
    </div>
);


const BillingTab: React.FC<{ billingRecords: BillingRecord[], treatments: Treatment[], patientId: string, onSave: (patientId: string, data: { billingRecords: BillingRecord[] }) => void }> = ({ billingRecords, treatments, patientId, onSave }) => {
    
    const { state } = useAppContext();
    const { currentUser, users } = state;
    type SortableBillingKeys = keyof BillingRecord | 'treatmentName' | 'balance';


    const initialFormState = {
        treatmentId: treatments[0]?.id || '',
        cost: '',
        paidAmount: '',
        notes: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableBillingKeys, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });


    useEffect(() => {
        if (editingRecordId) {
            const recordToEdit = billingRecords.find(r => r.id === editingRecordId);
            if (recordToEdit) {
                setFormData({
                    treatmentId: recordToEdit.treatmentId,
                    cost: String(recordToEdit.cost),
                    paidAmount: String(recordToEdit.paidAmount),
                    notes: recordToEdit.notes || ''
                });
            }
        } else {
            setFormData(initialFormState);
        }
    }, [editingRecordId, billingRecords]);

    const sortedRecords = useMemo(() => {
        const mappedRecords = billingRecords.map(record => ({
            ...record,
            treatmentName: treatments.find(t => t.id === record.treatmentId)?.name || 'N/A',
            balance: record.cost - record.paidAmount,
            dentistName: users.find(u => u.id === record.dentistId)?.name || 'N/A',
        }));

        return mappedRecords.sort((a, b) => {
            const valA = sortConfig.key === 'date' ? new Date(a.date).getTime() : a[sortConfig.key];
            const valB = sortConfig.key === 'date' ? new Date(b.date).getTime() : b[sortConfig.key];
            
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [billingRecords, sortConfig, treatments, users]);

    const requestSort = (key: SortableBillingKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableBillingKeys) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let sanitizedValue = value.replace(/[^0-9.]/g, '');
        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
            sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    };

    const handleSaveTreatment = () => {
        const treatment = treatments.find(t => t.id === formData.treatmentId);
        const cost = parseFloat(formData.cost) || 0;
        const paidAmount = parseFloat(formData.paidAmount) || 0;

        if(!treatment || cost <= 0 || !currentUser) {
            alert('Por favor, seleccione un tratamiento, un costo válido, y asegúrese de haber iniciado sesión.');
            return;
        };
        
        if (editingRecordId) {
            const updatedRecords = billingRecords.map(record => 
                record.id === editingRecordId
                ? { ...record, 
                    treatmentId: formData.treatmentId,
                    cost: cost,
                    paidAmount: paidAmount,
                    notes: formData.notes,
                   }
                : record
            );
            onSave(patientId, { billingRecords: updatedRecords });
        } else {
            const newBilling: BillingRecord = {
                id: `b${Date.now()}`,
                patientId: patientId,
                dentistId: currentUser.id,
                treatmentId: treatment.id,
                date: new Date().toISOString(),
                cost: cost,
                paidAmount: paidAmount,
                notes: formData.notes,
            }
            onSave(patientId, { billingRecords: [...billingRecords, newBilling] });
        }
        setEditingRecordId(null);
    }

    const handleEditClick = (recordId: string) => {
        setEditingRecordId(recordId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRecordId(null);
    };

    const handleDeleteClick = (recordId: string) => {
        setRecordToDelete(recordId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTreatment = () => {
        if (!recordToDelete) return;
        const updatedRecords = billingRecords.filter(record => record.id !== recordToDelete);
        onSave(patientId, { billingRecords: updatedRecords });
        setRecordToDelete(null);
    };

    const totalCost = billingRecords.reduce((sum, record) => sum + record.cost, 0);
    const totalPaid = billingRecords.reduce((sum, record) => sum + record.paidAmount, 0);
    const totalBalance = totalCost - totalPaid;
    
    const SortableHeader: React.FC<{label: string; sortKey: SortableBillingKeys; className?: string}> = ({ label, sortKey, className = ''}) => (
        <th className={`px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
            {label} <span className="text-xs">{getSortIcon(sortKey)}</span>
        </th>
    );

    return (
        <div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteTreatment}
                title="Eliminar Registro de Facturación"
                message="¿Está seguro de que desea eliminar este registro? Esta acción es irreversible."
            />
            <div className="mb-8 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">{editingRecordId ? 'Editar Registro de Facturación' : 'Añadir Nuevo Tratamiento'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
                    <div className="md:col-span-2">
                        <BillingFormInput label="Tratamiento" name="treatmentId" value={formData.treatmentId} onChange={handleFormChange} as="select">
                           {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </BillingFormInput>
                    </div>
                    <div>
                         <BillingFormInput label="Costo ($)" name="cost" type="text" inputMode="decimal" placeholder="150.00" value={formData.cost} onChange={handleNumericInputChange} />
                    </div>
                    <div>
                         <BillingFormInput label="Pago ($)" name="paidAmount" type="text" inputMode="decimal" placeholder="100.00" value={formData.paidAmount} onChange={handleNumericInputChange} />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-x-3">
                        <button onClick={handleSaveTreatment} className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 shadow-sm transition-all flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            {editingRecordId ? 'Guardar' : 'Añadir'}
                        </button>
                        {editingRecordId && (
                            <button onClick={handleCancelEdit} type="button" className="w-auto px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 shadow-sm transition-all">
                                Cancelar
                            </button>
                        )}
                    </div>
                    <div className="md:col-span-full">
                        <BillingFormInput as="textarea" rows={2} label="Notas (opcional)" name="notes" placeholder="Detalles adicionales del tratamiento o pago..." value={formData.notes} onChange={handleFormChange} />
                    </div>
                </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 text-gray-800">Historial de Facturación</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <SortableHeader label="Fecha" sortKey="date" className="text-left" />
                            <SortableHeader label="Tratamiento" sortKey="treatmentName" className="text-left" />
                             {currentUser?.role === 'admin' && <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Doctor</th>}
                            <SortableHeader label="Costo" sortKey="cost" className="text-right" />
                            <SortableHeader label="Pagado" sortKey="paidAmount" className="text-right" />
                            <SortableHeader label="Saldo" sortKey="balance" className="text-right" />
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRecords.map(record => {
                            const treatment = treatments.find(t => t.id === record.treatmentId);
                            const balance = record.cost - record.paidAmount;
                            return (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{treatment?.name}</td>
                                    {currentUser?.role === 'admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.dentistName}</td>}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">${record.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">${record.paidAmount.toFixed(2)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${balance > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                        ${balance.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleEditClick(record.id)} 
                                                className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                                                title="Editar registro"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(record.id)} 
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                                title="Eliminar registro"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                         {billingRecords.length === 0 && (
                            <tr>
                                <td colSpan={currentUser?.role === 'admin' ? 7 : 6} className="text-center py-10 text-gray-500">No hay registros de facturación.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                        <tr>
                            <td colSpan={currentUser?.role === 'admin' ? 3 : 2} className="px-6 py-4 text-right font-bold text-gray-800 text-sm">TOTALES</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">${totalCost.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-bold text-green-700 text-sm">${totalPaid.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-right font-extrabold text-lg ${totalBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>${totalBalance.toFixed(2)}</td>
                            <td></td>{/* Placeholder for actions column */}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};


const PatientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useAppContext();
    const patient = state.patients.find(p => p.id === id);

    const [activeTab, setActiveTab] = useState('odontogram');

    if (!patient) {
        return <div className="p-6">Paciente no encontrado. <button onClick={() => navigate('/patients')} className="text-primary-600">Volver a la lista</button></div>;
    }
    
    const handleUpdatePatient = async (patientId: string, data: Partial<Patient>) => {
        const patientToUpdate = state.patients.find(p => p.id === patientId);
        if (patientToUpdate) {
            const updatedPatient = { ...patientToUpdate, ...data };
            try {
                await db.patients.put(updatedPatient);
                dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
            } catch (error) {
                console.error("Failed to update patient:", error);
                alert("Error al actualizar los datos del paciente.");
            }
        }
    }

    const handleToothFaceUpdate = (toothNumber: number, face: string, condition: ToothCondition) => {
        const newDentalState = JSON.parse(JSON.stringify(patient.dentalState)); // Deep copy
        if (!newDentalState[toothNumber]) {
            newDentalState[toothNumber] = {};
        }
        if(!newDentalState[toothNumber][face]) {
             newDentalState[toothNumber][face] = {};
        }
        newDentalState[toothNumber][face].condition = condition;
        handleUpdatePatient(patient.id, { dentalState: newDentalState });
    };

    const TabButton: React.FC<{tabName: string; label: string}> = ({tabName, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabName
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">{patient.firstName} {patient.lastName}</h1>
                    <button 
                        onClick={() => navigate(`/patients/${patient.id}/edit`)} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                        Editar
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div><strong>DNI:</strong> {patient.dni}</div>
                    <div><strong>Fecha de Nacimiento:</strong> {new Date(patient.dob).toLocaleDateString()}</div>
                    <div><strong>Teléfono:</strong> {patient.phone}</div>
                    <div><strong>Email:</strong> {patient.email}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <TabButton tabName="odontogram" label="Odontograma" />
                        <TabButton tabName="anamnesis" label="Anamnesis" />
                        <TabButton tabName="billing" label="Facturación" />
                    </nav>
                </div>
                <div>
                    {activeTab === 'odontogram' && <Odontogram dentalState={patient.dentalState} onToothFaceClick={handleToothFaceUpdate}/>}
                    {activeTab === 'anamnesis' && <AnamnesisForm anamnesis={patient.anamnesis} patientId={patient.id} onSave={handleUpdatePatient as any}/>}
                    {activeTab === 'billing' && <BillingTab billingRecords={patient.billingRecords} treatments={state.treatments} patientId={patient.id} onSave={handleUpdatePatient as any}/>}
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
