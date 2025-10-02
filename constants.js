

export const MOCK_USERS = [
  { id: '1', name: 'Admin', email: 'admin@dentalflow.com', role: 'admin', password: '1234' },
  { id: '2', name: 'Dr. Elena García', email: 'dentist@dentalflow.com', role: 'dentist', password: 'password' },
];

export const AVAILABLE_TREATMENTS = [
  { id: 't1', name: 'Limpieza Dental', cost: 50 },
  { id: 't2', name: 'Obturación (Empaste)', cost: 80 },
  { id: 't3', name: 'Endodoncia', cost: 250 },
  { id: 't4', name: 'Extracción Simple', cost: 70 },
  { id: 't5', name: 'Corona de Porcelana', cost: 450 },
  { id: 't6', name: 'Implante Dental', cost: 1200 },
  { id: 't7', name: 'Blanqueamiento Dental', cost: 300 },
  { id: 't-other', name: 'Otros', cost: 0 },
];

const generateRandomDentalState = () => {
  const state = {};
  const conditions = ['healthy', 'caries', 'restoration', 'missing'];
  const teeth = [
    ...Array.from({ length: 8 }, (_, i) => 11 + i),
    ...Array.from({ length: 8 }, (_, i) => 21 + i),
    ...Array.from({ length: 8 }, (_, i) => 31 + i),
    ...Array.from({ length: 8 }, (_, i) => 41 + i),
  ];

  teeth.forEach(toothNumber => {
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    if (randomCondition !== 'missing') {
      state[toothNumber] = {
        occlusal: { condition: Math.random() > 0.8 ? 'caries' : 'healthy' },
        vestibular: { condition: Math.random() > 0.9 ? 'restoration' : 'healthy' },
      };
    } else {
        state[toothNumber] = { occlusal: { condition: 'missing' } };
    }
  });
  return state;
};

export const MOCK_PATIENTS = [
  {
    id: 'p1',
    dentistId: '2',
    firstName: 'Juan',
    lastName: 'Pérez',
    dni: '12345678A',
    dob: '1985-05-20',
    phone: '600111222',
    email: 'juan.perez@email.com',
    obraSocial: 'OSDE 210',
    observaciones: 'Prefiere citas por la mañana.',
    anamnesis: {
      allergies: 'Penicilina',
      preexistingConditions: 'Hipertensión',
      currentMedication: 'Enalapril 10mg',
      isSmoker: false,
      isDrinker: true,
      notes: 'Paciente algo nervioso.'
    },
    dentalState: generateRandomDentalState(),
    billingRecords: [
        { id: 'b1', patientId: 'p1', dentistId: '2', treatmentId: 't1', date: '2023-10-15T10:00:00Z', cost: 50, paidAmount: 50},
        { id: 'b2', patientId: 'p1', dentistId: '2', treatmentId: 't2', date: '2023-10-15T11:00:00Z', cost: 100, paidAmount: 50},
    ]
  },
  {
    id: 'p2',
    dentistId: '2',
    firstName: 'Ana',
    lastName: 'Gómez',
    dni: '87654321B',
    dob: '1992-11-30',
    phone: '600333444',
    email: 'ana.gomez@email.com',
    obraSocial: 'Swiss Medical',
    observaciones: 'Recordar su historial de asma antes de cada procedimiento.',
    anamnesis: {
      allergies: 'Ninguna conocida',
      preexistingConditions: 'Asma',
      currentMedication: 'Ventolin',
      isSmoker: true,
      isDrinker: false,
      notes: ''
    },
    dentalState: generateRandomDentalState(),
    billingRecords: [
        { id: 'b3', patientId: 'p2', dentistId: '2', treatmentId: 't7', date: '2023-09-05T12:00:00Z', cost: 350, paidAmount: 300},
    ]
  },
  {
    id: 'p3',
    dentistId: '2',
    firstName: 'Carlos',
    lastName: 'Martínez',
    dni: '11223344C',
    dob: '1978-02-10',
    phone: '600555666',
    email: 'carlos.martinez@email.com',
    obraSocial: 'No tiene',
    observaciones: 'Excelente cooperación.',
    anamnesis: {
      allergies: 'Ibuprofeno',
      preexistingConditions: 'Diabetes tipo 2',
      currentMedication: 'Metformina',
      isSmoker: false,
      isDrinker: false,
      notes: 'Buen control de su diabetes.'
    },
    dentalState: generateRandomDentalState(),
    billingRecords: [
        { id: 'b4', patientId: 'p3', dentistId: '2', treatmentId: 't3', date: '2023-11-01T16:00:00Z', cost: 250, paidAmount: 250},
        { id: 'b5', patientId: 'p3', dentistId: '2', treatmentId: 't5', date: '2023-11-15T16:00:00Z', cost: 450, paidAmount: 200},
    ]
  },
];

export const MOCK_APPOINTMENTS = [
    {
        id: 'apt1',
        patientId: 'p1',
        dentistId: '2',
        title: 'Limpieza de rutina',
        start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    },
    {
        id: 'apt2',
        patientId: 'p2',
        dentistId: '2',
        title: 'Consulta de blanqueamiento',
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    },
    {
        id: 'apt3',
        patientId: 'p3',
        dentistId: '2',
        title: 'Seguimiento de corona',
        start: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        end: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
     {
        id: 'apt4',
        patientId: 'p1',
        dentistId: '2',
        title: 'Revisión de empaste',
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    },
];


// FIX: Added missing properties to satisfy the ToothCondition type.
export const CONDITION_COLORS = {
  healthy: 'fill-white',
  caries: 'fill-red-500',
  restoration: 'fill-blue-500',
  missing: 'fill-gray-400',
  extraction_needed: 'fill-yellow-500',
  implant: 'fill-purple-500',
  crown: 'fill-yellow-400',
  root_canal: 'fill-orange-400',
  sealant: 'fill-green-400',
  fracture: 'fill-pink-500',
};
