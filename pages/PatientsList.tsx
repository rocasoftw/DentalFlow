import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { db } from '../data/db.ts';
import ConfirmationModal from '../components/ConfirmationModal.tsx';
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
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key