
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  procedure: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  avatarUrl: string;
}
