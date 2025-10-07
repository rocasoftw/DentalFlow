import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { db } from '../data/db';
import ConfirmationModal from '../components/ConfirmationModal';
import type { Patient, User } from '../types';

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
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return patientData;
  }, [patients, users, searchTerm, dentistFilter, sortConfig, currentUser]);
  
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

  const handleDelete = (patientId: string) => {
    setPatientToDelete(patientId);
    setIsModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      const appointmentIdsToDelete = (await db.appointments.where('patientId').equals(patientToDelete).keys()).map(String);

      await db.transaction('rw', db.patients, db.appointments, async () => {
        if (appointmentIdsToDelete.length > 0) {
          await db.appointments.bulkDelete(appointmentIdsToDelete);
        }
        await db.patients.delete(patientToDelete);
      });

      if (appointmentIdsToDelete.length > 0) {
        dispatch({ type: 'DELETE_APPOINTMENTS_BULK', payload: appointmentIdsToDelete });
      }
      dispatch({ type: 'DELETE_PATIENT', payload: patientToDelete });
    } catch (error) {
      console.error("Failed to delete patient:", error);
      alert("Error al eliminar el paciente.");
    } finally {
        setPatientToDelete(null);
    }
  };

  const SortableHeader: React.FC<{ label: string; sortKey: SortablePatientKeys; className?: string }> = ({ label, sortKey, className }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
      {label} <span className="text-xs">{getSortIcon(sortKey)}</span>
    </th>
  );

  return (
    <>
    <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Paciente"
        message="¿Está seguro de que desea eliminar este paciente? Esta acción también eliminará todas sus citas asociadas y es irreversible."
    />
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Pacientes</h1>
        <button 
          onClick={() => navigate('/patients/new')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Nuevo Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 md:col-span-2"
        />
        {currentUser?.role === 'admin' && (
            <select
                value={dentistFilter}
                onChange={(e) => setDentistFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
                <option value="">Todos los Doctores</option>
                {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Nombre Completo" sortKey="fullName" />
              <SortableHeader label="DNI" sortKey="dni" />
              <SortableHeader label="Obra Social" sortKey="obraSocial" />
               {currentUser?.role === 'admin' && <SortableHeader label="Doctor Asignado" sortKey="dentistName" />}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredPatients.map(patient => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.obraSocial || 'N/A'}</td>
                {currentUser?.role === 'admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dentistName}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => navigate(`/patients/${patient.id}`)} className="text-primary-600 hover:text-primary-800 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Ver Paciente">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => navigate(`/patients/${patient.id}/edit`)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Editar Paciente">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Eliminar Paciente">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default PatientsList;
