import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.js';
import { db } from '../data/db.ts';
import ConfirmationModal from '../components/ConfirmationModal.js';
import type { Patient, User } from '../types.ts';

type SortablePatientKeys = keyof Patient | 'fullName' | 'dentistName';

const PatientsList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { patients, users, currentUser } = state;
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dentistFilter, setDentistFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortablePatientKeys, direction: 'ascending' | 'descending' }>({ key: 'lastName', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  const dentists = useMemo(() => users.filter(u => u.role === 'dentist'), [users]);

  const sortedAndFilteredPatients = useMemo(() => {
    let filtered = [...patients];

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(lowercasedFilter) ||
        p.dni.toLowerCase().includes(lowercasedFilter) ||
        p.obraSocial?.toLowerCase().includes(lowercasedFilter)
      );
    }

    if (currentUser?.role === 'admin' && dentistFilter) {
      filtered = filtered.filter(p => p.dentistId === dentistFilter);
    }
    
    const patientData = filtered.map(p => {
        const dentist = users.find(u => u.id === p.dentistId);
        return {
            ...p,
            fullName: `${p.firstName} ${p.lastName}`,
            dentistName: dentist ? dentist.name : 'No asignado'
        };
    });


    patientData.sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      
      if (valA < valB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return patientData;

  }, [patients, users, currentUser, searchTerm, dentistFilter, sortConfig]);

  const requestSort = (key: SortablePatientKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortablePatientKeys) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const handleDeleteClick = (patientId: string) => {
    setPatientToDelete(patientId);
    setIsModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
        const patientAppointments = await db.appointments.where('patientId').equals(patientToDelete).toArray();
        const appointmentIds = patientAppointments.map(a => a.id);
        
        if (appointmentIds.length > 0) {
            await db.appointments.bulkDelete(appointmentIds);
            dispatch({ type: 'DELETE_APPOINTMENTS_BULK', payload: appointmentIds });
        }
        
        await db.patients.delete(patientToDelete);
        dispatch({ type: 'DELETE_PATIENT', payload: patientToDelete });
    } catch (error) {
        console.error("Failed to delete patient and related data:", error);
        alert("Error al eliminar el paciente.");
    } finally {
        setPatientToDelete(null);
    }
  };

  const SortableHeader: React.FC<{label: string; sortKey: SortablePatientKeys; className?: string}> = ({ label, sortKey, className = ''}) => (
    <th className={`px-6 py-3 text-xs font-bold text-left text-gray-600 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
        {label} <span className="text-xs">{getSortIcon(sortKey)}</span>
    </th>
  );


  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeletePatient}
        title="Eliminar Paciente"
        message="¿Está seguro de que desea eliminar a este paciente? Se eliminarán también todas sus citas asociadas. Esta acción es irreversible."
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Pacientes</h1>
        <button
          onClick={() => navigate('/patients/new')}
          className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition duration-300 flex items-center justify-center"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Añadir Paciente
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, obra social..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {currentUser?.role === 'admin' && (
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={dentistFilter}
              onChange={(e) => setDentistFilter(e.target.value)}
            >
              <option value="">Todos los Doctores</option>
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Nombre" sortKey="fullName" />
              <SortableHeader label="DNI" sortKey="dni" />
              <SortableHeader label="Teléfono" sortKey="phone" />
              {currentUser?.role === 'admin' && <SortableHeader label="Doctor" sortKey="dentistName" />}
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                {currentUser?.role === 'admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dentistName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                     <button onClick={() => navigate(`/patients/${patient.id}`)} className="text-primary-600 hover:text-primary-800 p-1 rounded-full hover:bg-primary-100" title="Ver Detalles">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => navigate(`/patients/${patient.id}/edit`)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100" title="Editar Paciente">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => handleDeleteClick(patient.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100" title="Eliminar Paciente">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {sortedAndFilteredPatients.length === 0 && (
                <tr>
                    <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center py-10 text-gray-500">
                        No se encontraron pacientes.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PatientsList;