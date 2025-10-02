// Fix: Moved all context logic here from types.ts and fixed bugs.
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { User, Patient, Treatment, Appointment } from '../types.js';
import { MOCK_PATIENTS, AVAILABLE_TREATMENTS, MOCK_APPOINTMENTS, MOCK_USERS } from '../constants.js';
import { db } from '../data/db.js';

interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  treatments: Treatment[];
  appointments: Appointment[];
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_USERS_AND_TREATMENTS'; payload: { users: User[], treatments: Treatment[] } }
  | { type: 'SET_PATIENTS_AND_APPOINTMENTS'; payload: { patients: Patient[], appointments: Appointment[] } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'DELETE_APPOINTMENTS_BULK'; payload: string[] };

const initialState: AppState = {
    isLoading: true,
    isAuthenticated: false,
    currentUser: null,
    users: [],
    patients: [],
    treatments: [],
    appointments: [],
};


const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USERS_AND_TREATMENTS':
      return { ...state, users: action.payload.users, treatments: action.payload.treatments };
    case 'SET_PATIENTS_AND_APPOINTMENTS':
        return { ...state, patients: action.payload.patients, appointments: action.payload.appointments };
    case 'LOGIN':
      sessionStorage.setItem('dentalFlowUserId', action.payload.id);
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload,
      };
    case 'LOGOUT':
       sessionStorage.removeItem('dentalFlowUserId');
      return { 
        ...state,
        isAuthenticated: false,
        currentUser: null,
        patients: [],
        appointments: []
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      };
    case 'ADD_PATIENT':
      return {
          ...state,
          patients: [...state.patients, action.payload]
      };
    case 'UPDATE_PATIENT':
        return {
            ...state,
            patients: state.patients.map(p => p.id === action.payload.id ? action.payload : p)
        };
    case 'DELETE_PATIENT':
        return {
            ...state,
            patients: state.patients.filter(p => p.id !== action.payload)
        };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload]
      };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(a => a.id === action.payload.id ? action.payload : a)
      };
    case 'DELETE_APPOINTMENT':
        return {
            ...state,
            appointments: state.appointments.filter(a => a.id !== action.payload)
        };
    case 'DELETE_APPOINTMENTS_BULK':
        const idsToDelete = new Set(action.payload);
        return {
            ...state,
            appointments: state.appointments.filter(a => !idsToDelete.has(a.id))
        };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initApp = async () => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            const userCount = await db.users.count();
            if (userCount === 0) {
                console.log("Database is empty, seeding with initial data...");
                await db.users.bulkAdd(MOCK_USERS);
                await db.patients.bulkAdd(MOCK_PATIENTS);
                await db.treatments.bulkAdd(AVAILABLE_TREATMENTS);
                await db.appointments.bulkAdd(MOCK_APPOINTMENTS);
            }
            
            const [users, treatments] = await Promise.all([
                db.users.toArray(),
                db.treatments.toArray(),
            ]);

            dispatch({ type: 'SET_USERS_AND_TREATMENTS', payload: { users, treatments } });
            
            const loggedInUserId = sessionStorage.getItem('dentalFlowUserId');
            if (loggedInUserId) {
                const user = users.find(u => u.id === loggedInUserId);
                if (user) {
                    dispatch({ type: 'LOGIN', payload: user });
                } else {
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_IS_LOADING', payload: false });
            }
        } catch (error) {
            console.error("Failed to initialize app data", error);
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    };
    initApp();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
        if (!state.currentUser) {
            if (state.isAuthenticated === false && !state.isLoading) {
                 // Nothing to do, handled by initApp
            }
            return;
        }

        dispatch({ type: 'SET_IS_LOADING', payload: true });
        try {
            let patients: Patient[] = [];
            let appointments: Appointment[] = [];
            
            if (state.currentUser.role === 'admin') {
                patients = await db.patients.toArray();
                appointments = await db.appointments.toArray();
            } else { // dentist
                patients = await db.patients.where('dentistId').equals(state.currentUser.id).toArray();
                appointments = await db.appointments.where('dentistId').equals(state.currentUser.id).toArray();
            }
            dispatch({ type: 'SET_PATIENTS_AND_APPOINTMENTS', payload: { patients, appointments } });
        } catch (error) {
            console.error("Failed to load user-specific data", error);
        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
        }
    };
    
    if (state.users.length > 0) {
        loadUserData();
    }
  }, [state.currentUser]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};