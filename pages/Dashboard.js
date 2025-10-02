import React from 'react';
import { useAppContext } from '../context/AppContext.js';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { state } = useAppContext();
  const { currentUser, patients } = state;
  
  const totalIncome = patients.flatMap(p => p.billingRecords).reduce((acc, record) => acc + record.cost, 0);
  const treatmentsToday = patients.flatMap(p => p.billingRecords).filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bienvenido, {currentUser?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Pacientes</h3>
          <p className="text-4xl font-bold text-primary-600 mt-2">{patients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Ingresos Totales</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Tratamientos Hoy</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{treatmentsToday}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="flex space-x-4">
          <Link to="/patients" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition duration-300">
            Ver Pacientes
          </Link>
          <Link to="/reports" className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition duration-300">
            Generar Reporte
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Últimos Pacientes Registrados</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {patients.slice(-5).reverse().map(patient => (
                        <tr key={patient.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
