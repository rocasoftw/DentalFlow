import Dexie from 'dexie';

// FIX: Refactored to use direct Dexie instantiation instead of subclassing.
// This common pattern resolves a TypeScript typing issue where methods from the 
// parent Dexie class (like 'version' and 'transaction') were not being 
// recognized on the subclass instance, causing errors during compilation.
export const db = new Dexie('dentalFlowDB');

db.version(1).stores({
    users: 'id, &email', // Primary key 'id' and unique index 'email'
    patients: 'id, &dni, dentistId', // Primary key 'id' and unique index 'dni'
    treatments: 'id', // Primary key 'id'
    appointments: 'id, start, dentistId, patientId' // Primary key 'id' and index 'start', 'dentistId', and 'patientId' for queries
});
