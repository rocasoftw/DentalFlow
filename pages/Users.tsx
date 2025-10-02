import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.js';
import type { User } from '../types.ts';
import { db } from '../data/db.ts';
import ConfirmationModal from '../components/ConfirmationModal.js';

const Users: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { users, currentUser } = state;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if(users.some(u => u.email === formData.email)) {
        setError('El email ya está en uso.');
        return;
    }
    setError('');
    const newUser: User = {
      id: `u${Date.now()}`,
      ...formData,
      role: 'dentist',
    };

    try {
      await db.users.add(newUser);
      dispatch({ type: 'ADD_USER', payload: newUser });
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
       console.error("Failed to add user:", error);
       setError('Error al añadir el usuario. Es posible que el email ya exista.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
        alert("No puede eliminar su propia cuenta de administrador.");
        return;
    }
    setUserToDelete(userId);
    setIsModalOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if(!userToDelete) return;
    try {
      const patientCount = await db.patients.where('dentistId').equals(userToDelete).count();
      if (patientCount > 0) {
          alert(`No se puede eliminar este usuario porque tiene ${patientCount} paciente(s) asignado(s). Por favor, reasigne los pacientes antes de eliminar al usuario.`);
          return;
      }
      
      await db.users.delete(userToDelete);
      dispatch({ type: 'DELETE_USER', payload: userToDelete });
      
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Error al eliminar el usuario.");
    } finally {
        setUserToDelete(null);
    }
  }

  return (
    <>
    <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        message="¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible."
    />
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Añadir Nuevo Usuario (Doctor)</h1>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Añadir Usuario
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Users;