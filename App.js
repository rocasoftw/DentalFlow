import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext.js';
import Login from './pages/Login.js';
import DashboardLayout from './components/layout/DashboardLayout.js';
import Dashboard from './pages/Dashboard.js';
import PatientsList from './pages/PatientsList.js';
import PatientDetail from './pages/PatientDetail.js';
import Reports from './pages/Reports.js';
import PatientForm from './pages/PatientForm.js';
import AppointmentsCalendar from './pages/AppointmentsCalendar.js';
import Users from './pages/Users.js';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAppContext();
  return state.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { state } = useAppContext();

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientsList />} />
                  <Route path="/patients/new" element={<PatientForm />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/patients/:id/edit" element={<PatientForm />} />
                  <Route path="/appointments" element={<AppointmentsCalendar />} />
                  <Route path="/reports" element={<Reports />} />
                  {state.currentUser?.role === 'admin' && <Route path="/users" element={<Users />} />}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

const AppContent: React.FC = () => {
  const { state } = useAppContext();

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-primary-600 font-bold text-2xl">DentalFlow</div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
     <div className="bg-gray-50 min-h-screen">
        <AppRoutes />
      </div>
  )
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;