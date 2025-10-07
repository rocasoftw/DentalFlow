import Dexie, { type Table } from 'dexie';
import type { User, Patient, Treatment, Appointment } from '../types';

export class DentalFlowDB extends Dexie {
    users!: Table<User>;
    patients!: Table<Patient>;
    treatments!: Table<Treatment>;
    appointments!: Table<Appointment>;

    constructor() {
        super('dentalFlowDB');
        // FIX: The database schema must be defined within the constructor of the class that extends Dexie.
        // This resolves errors where properties like 'version' and 'transaction' are not found on the subclass.
        this.version(1).stores({
            users: 'id, &email', // Primary key 'id' and unique index 'email'
            patients: 'id, &dni, dentistId', // Primary key 'id' and unique index 'dni'
            treatments: 'id', // Primary key 'id'
            appointments: 'id, start, dentistId, patientId' // Primary key 'id' and index 'start', 'dentistId', and 'patientId' for queries
        });
    }
}

export const db = new DentalFlowDB();