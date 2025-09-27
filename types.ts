// Fix: Defined and exported all necessary types for the application.
export type ToothCondition = 'healthy' | 'caries' | 'restoration' | 'missing' | 'extraction_needed' | 'implant' | 'crown' | 'root_canal' | 'sealant' | 'fracture';

export interface ToothFaceState {
  condition: ToothCondition;
}

export interface ToothState {
  occlusal?: ToothFaceState;
  vestibular?: ToothFaceState;
  lingual?: ToothFaceState;
  mesial?: ToothFaceState;
  distal?: ToothFaceState;
  [key: string]: ToothFaceState | undefined;
}

export interface DentalState {
  [toothNumber: string]: ToothState;
}

export interface Anamnesis {
  allergies: string;
  preexistingConditions: string;
  currentMedication: string;
  isSmoker: boolean;
  isDrinker: boolean;
  notes: string;
}

export interface BillingRecord {
  id: string;
  patientId: string;
  dentistId: string;
  treatmentId: string;
  date: string;
  cost: number;
  paidAmount: number;
  notes?: string;
}

export interface Patient {
  id: string;
  dentistId: string;
  firstName: string;
  lastName: string;
  dni: string;
  dob: string;
  phone: string;
  email: string;
  obraSocial?: string;
  observaciones?: string;
  anamnesis: Anamnesis;
  dentalState: DentalState;
  billingRecords: BillingRecord[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist';
  password?: string;
}

export interface Treatment {
  id: string;
  name: string;
  cost: number;
}

export interface Appointment {
    id: string;
    title: string;
    start: Date | string;
    end: Date | string;
    patientId: string;
    dentistId: string;
}