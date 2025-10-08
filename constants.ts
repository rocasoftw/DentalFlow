
import { User, Patient, Appointment, UserRole } from './types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Admin',
    email: 'admin@dental.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/seed/admin/100/100',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/seed/johndoe/100/100',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/seed/janesmith/100/100',
  },
];

export const MOCK_PATIENTS: Patient[] = [
    { id: 'p1', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', lastVisit: '2023-10-15', avatarUrl: 'https://picsum.photos/seed/p1/50/50' },
    { id: 'p2', name: 'Bob Williams', email: 'bob@example.com', phone: '234-567-8901', lastVisit: '2023-11-20', avatarUrl: 'https://picsum.photos/seed/p2/50/50' },
    { id: 'p3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', lastVisit: '2023-09-05', avatarUrl: 'https://picsum.photos/seed/p3/50/50' },
    { id: 'p4', name: 'Diana Miller', email: 'diana@example.com', phone: '456-789-0123', lastVisit: '2024-01-10', avatarUrl: 'https://picsum.photos/seed/p4/50/50' },
    { id: '2', name: 'John Doe', email: 'john.doe@email.com', phone: '567-890-1234', lastVisit: '2024-02-28', avatarUrl: 'https://picsum.photos/seed/johndoe/50/50' },
    { id: '3', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '567-890-1235', lastVisit: '2024-03-12', avatarUrl: 'https://picsum.photos/seed/janesmith/50/50' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'a1', patientId: 'p1', patientName: 'Alice Johnson', date: '2024-08-05', time: '10:00 AM', procedure: 'Check-up', status: 'confirmed' },
    { id: 'a2', patientId: 'p2', patientName: 'Bob Williams', date: '2024-08-05', time: '11:00 AM', procedure: 'Cleaning', status: 'confirmed' },
    { id: 'a3', patientId: 'p3', patientName: 'Charlie Brown', date: '2024-08-06', time: '02:00 PM', procedure: 'Filling', status: 'pending' },
    { id: 'a4', patientId: 'p4', patientName: 'Diana Miller', date: '2024-08-07', time: '09:00 AM', procedure: 'Check-up', status: 'confirmed' },
    { id: 'a5', patientId: '2', patientName: 'John Doe', date: '2024-08-10', time: '03:00 PM', procedure: 'Wisdom Tooth Extraction', status: 'confirmed' },
    { id: 'a6', patientId: '3', patientName: 'Jane Smith', date: '2024-08-12', time: '01:00 PM', procedure: 'Root Canal', status: 'pending' },
];

export const CHART_DATA = [
    { name: 'Jan', appointments: 30 },
    { name: 'Feb', appointments: 45 },
    { name: 'Mar', appointments: 60 },
    { name: 'Apr', appointments: 50 },
    { name: 'May', appointments: 70 },
    { name: 'Jun', appointments: 85 },
    { name: 'Jul', appointments: 90 },
];
