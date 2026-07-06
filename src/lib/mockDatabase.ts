export interface BedStatus {
  total: number;
  available: number;
}

export interface BedsOccupancy {
  icu: BedStatus;
  emergency: BedStatus;
  general: BedStatus;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available: boolean;
  statusText: 'Available' | 'In Surgery' | 'On Break' | 'Consulting';
}

export interface HospitalQueue {
  length: number;
  waitTimeMinutes: number;
  currentToken: string;
  patients: { token: string; name: string; urgency: string; ahead: number }[];
}

export interface HospitalCosts {
  consultation: number;
  estDiagnostics: number;
  estMedicines: number;
}

export interface ReviewSummary {
  summary: string;
  positive: string[];
  negative: string[];
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  reviewsCount: number;
  specializations: string[];
  facilities: ('ICU' | 'MRI' | 'CT Scan' | 'Cath Lab' | 'Ventilator' | 'Emergency OT' | 'NICU' | 'General Ward')[];
  beds: BedsOccupancy;
  doctors: Doctor[];
  queue: HospitalQueue;
  departmentQueues?: { [dept: string]: HospitalQueue };
  costs: HospitalCosts;
  reviewSummary: ReviewSummary;
  imageUrl: string;
  isClinic?: boolean; // Differentiation tag
  distance?: number;
  travelTime?: number;
  suitabilityScore?: number;
  whyText?: string;
}

export interface Appointment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  timeSlot: string;
  department: string;
  consultationFee: number;
  queuePosition: number;
  estimatedWaitTime: number;
  token: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Admitted' | 'Checked Out' | 'Redirected';
  etaMinutes: number;
  symptoms: string;
  clinicalSummary?: string;
  suggestedTests?: string[];
  doctorQuestions?: string[];
  timestamp: string;
  email?: string; // Capture email receipt
  preArrivalAlert?: boolean; // True if hospital alerted to prep beds/meds in advance for critical urgency
  patientBloodType?: string;
  patientPastDiseases?: string[];
  patientMedicines?: string[];
  patientPhone?: string;
}

export interface PatientProfile {
  name: string;
  phone: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType?: string;
  medicines?: string[];
}

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-fortis-gurugram',
    name: 'Fortis Memorial Research Institute (FMRI)',
    lat: 28.4593,
    lng: 77.0725,
    address: 'Sector 44, Opposite HUDA City Centre, Gurugram, Haryana 122002',
    rating: 4.8,
    reviewsCount: 1240,
    specializations: ['Cardiology', 'Neurology', 'Oncology', 'Emergency Medicine', 'Pediatrics'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'],
    beds: {
      icu: { total: 40, available: 6 },
      emergency: { total: 25, available: 3 },
      general: { total: 150, available: 28 }
    },
    doctors: [
      { id: 'doc-1', name: 'Dr. Sandeep Vaishya', specialization: 'Neurology', available: true, statusText: 'Available' },
      { id: 'doc-2', name: 'Dr. Ashok Seth', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-3', name: 'Dr. T.S. Kler', specialization: 'Cardiology', available: false, statusText: 'In Surgery' },
      { id: 'doc-4', name: 'Dr. Vinod Sharma', specialization: 'Emergency Medicine', available: true, statusText: 'Available' },
      { id: 'doc-5', name: 'Dr. Renu Malhotra', specialization: 'Pediatrics', available: true, statusText: 'Consulting' }
    ],
    queue: {
      length: 8,
      waitTimeMinutes: 45,
      currentToken: 'F-108',
      patients: [
        { token: 'F-109', name: 'Amit Sharma', urgency: 'Medium', ahead: 1 },
        { token: 'F-110', name: 'Priya Patel', urgency: 'Low', ahead: 2 },
        { token: 'F-111', name: 'Rahul Verma', urgency: 'High', ahead: 3 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 4,
        waitTimeMinutes: 38,
        currentToken: 'CAR-125',
        patients: [
            { token: 'CAR-126', name: 'Ananya Gupta', urgency: 'Medium', ahead: 1 },
            { token: 'CAR-127', name: 'Ranbir Kapoor', urgency: 'Medium', ahead: 2 },
            { token: 'CAR-128', name: 'Meena Rani', urgency: 'Low', ahead: 3 }
        ]
      },
      'Neurology': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'NEU-278',
        patients: [
            { token: 'NEU-279', name: 'Aditya Sen', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Oncology': {
        length: 3,
        waitTimeMinutes: 29,
        currentToken: 'ONC-191',
        patients: [
            { token: 'ONC-192', name: 'Divya Sharma', urgency: 'Medium', ahead: 1 },
            { token: 'ONC-193', name: 'Neha Aggarwal', urgency: 'High', ahead: 2 },
            { token: 'ONC-194', name: 'Harish Goel', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Emergency Medicine': {
        length: 14,
        waitTimeMinutes: 58,
        currentToken: 'EME-231',
        patients: [
            { token: 'EME-232', name: 'Suresh Kumar', urgency: 'High', ahead: 1 },
            { token: 'EME-233', name: 'Aishwarya Rai', urgency: 'Low', ahead: 2 },
            { token: 'EME-234', name: 'Amitabh Bachchan', urgency: 'High', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 19,
        currentToken: 'PED-148',
        patients: [
            { token: 'PED-149', name: 'Sunil Gavaskar', urgency: 'Medium', ahead: 1 },
            { token: 'PED-150', name: 'Arjun Singh', urgency: 'Medium', ahead: 2 }
        ]
      }
    },
    costs: {
      consultation: 1500,
      estDiagnostics: 3500,
      estMedicines: 1200
    },
    reviewSummary: {
      summary: 'Patients highly appreciate the cutting-edge medical equipment and extremely professional emergency trauma team, though waiting times can extend during peak hours and parking is notoriously crowded.',
      positive: ['State-of-the-art facilities', 'Highly skilled cardiologists', 'Efficient emergency OT'],
      negative: ['Expensive billing', 'Crowded parking area', 'Peak hour delay']
    },
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-apollo-delhi',
    name: 'Indraprastha Apollo Hospitals',
    lat: 28.5372,
    lng: 77.2858,
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi, Delhi 110076',
    rating: 4.7,
    reviewsCount: 2310,
    specializations: ['Cardiology', 'Pulmonology', 'Pediatrics', 'Orthopedics', 'Gastroenterology', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'],
    beds: {
      icu: { total: 55, available: 4 },
      emergency: { total: 30, available: 0 },
      general: { total: 200, available: 42 }
    },
    doctors: [
      { id: 'doc-6', name: 'Dr. Y.K. Mishra', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-7', name: 'Dr. Raju Vaishya', specialization: 'Orthopedics', available: true, statusText: 'Available' },
      { id: 'doc-8', name: 'Dr. Anoop Misra', specialization: 'General Medicine', available: true, statusText: 'Consulting' },
      { id: 'doc-9', name: 'Dr. N.P. Singh', specialization: 'Pulmonology', available: false, statusText: 'On Break' }
    ],
    queue: {
      length: 12,
      waitTimeMinutes: 65,
      currentToken: 'A-244',
      patients: [
        { token: 'A-245', name: 'Vijay Kumar', urgency: 'Low', ahead: 1 },
        { token: 'A-246', name: 'Sita Devi', urgency: 'Medium', ahead: 2 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 3,
        waitTimeMinutes: 29,
        currentToken: 'CAR-160',
        patients: [
            { token: 'CAR-161', name: 'Suresh Kumar', urgency: 'High', ahead: 1 },
            { token: 'CAR-162', name: 'Kapil Dev', urgency: 'Medium', ahead: 2 },
            { token: 'CAR-163', name: 'Deepika Padukone', urgency: 'Low', ahead: 3 }
        ]
      },
      'Pulmonology': {
        length: 2,
        waitTimeMinutes: 21,
        currentToken: 'PUL-293',
        patients: [
            { token: 'PUL-294', name: 'Deepak Sen', urgency: 'Low', ahead: 1 },
            { token: 'PUL-295', name: 'Aditya Sen', urgency: 'Low', ahead: 2 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 18,
        currentToken: 'PED-166',
        patients: [
            { token: 'PED-167', name: 'Kapil Dev', urgency: 'High', ahead: 1 },
            { token: 'PED-168', name: 'Sachin Tendulkar', urgency: 'Low', ahead: 2 }
        ]
      },
      'Orthopedics': {
        length: 4,
        waitTimeMinutes: 38,
        currentToken: 'ORT-294',
        patients: [
            { token: 'ORT-295', name: 'Virat Kohli', urgency: 'Medium', ahead: 1 },
            { token: 'ORT-296', name: 'Ananya Gupta', urgency: 'Medium', ahead: 2 },
            { token: 'ORT-297', name: 'Meena Rani', urgency: 'High', ahead: 3 }
        ]
      },
      'Gastroenterology': {
        length: 2,
        waitTimeMinutes: 18,
        currentToken: 'GAS-230',
        patients: [
            { token: 'GAS-231', name: 'Ranbir Kapoor', urgency: 'Low', ahead: 1 },
            { token: 'GAS-232', name: 'Kiran Devi', urgency: 'Low', ahead: 2 }
        ]
      },
      'Emergency Medicine': {
        length: 13,
        waitTimeMinutes: 56,
        currentToken: 'EME-163',
        patients: [
            { token: 'EME-164', name: 'Deepak Sen', urgency: 'Low', ahead: 1 },
            { token: 'EME-165', name: 'Meena Rani', urgency: 'High', ahead: 2 },
            { token: 'EME-166', name: 'Aditya Sen', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1200,
      estDiagnostics: 2800,
      estMedicines: 950
    },
    reviewSummary: {
      summary: 'Renowned for world-class cardiac care and quick ambulance response time. A few reviews complain about bureaucratic administration delays during admission and discharge.',
      positive: ['Quick ambulance coordination', 'Spacious campus', 'Great cardiac center'],
      negative: ['Admin bureaucracy', 'Long pharmacy queues', 'Expensive consultation']
    },
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-max-saket',
    name: 'Max Super Speciality Hospital, Saket',
    lat: 28.5284,
    lng: 77.2114,
    address: '1-2, Press Enclave Road, Saket Institutional Area, Saket, New Delhi 110017',
    rating: 4.6,
    reviewsCount: 1850,
    specializations: ['Cardiology', 'Pulmonology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Neurology', 'General Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 35, available: 8 },
      emergency: { total: 20, available: 5 },
      general: { total: 130, available: 15 }
    },
    doctors: [
      { id: 'doc-10', name: 'Dr. Subhash Chandra', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-11', name: 'Dr. Balbir Singh', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-12', name: 'Dr. Harmeet Singh', specialization: 'Pulmonology', available: true, statusText: 'Consulting' },
      { id: 'doc-13', name: 'Dr. Vivek Raj', specialization: 'Gastroenterology', available: false, statusText: 'In Surgery' }
    ],
        queue: {
      length: 5,
      waitTimeMinutes: 25,
      currentToken: 'M-771',
      patients: [
        { token: 'M-772', name: 'Ritu Kapoor', urgency: 'High', ahead: 1 },
        { token: 'M-773', name: 'Aishwarya Rai', urgency: 'High', ahead: 2 },
        { token: 'M-774', name: 'Aditya Sen', urgency: 'High', ahead: 3 },
        { token: 'M-775', name: 'Ranbir Kapoor', urgency: 'Low', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 2,
        waitTimeMinutes: 18,
        currentToken: 'CAR-233',
        patients: [
            { token: 'CAR-234', name: 'Seema Rao', urgency: 'Medium', ahead: 1 },
            { token: 'CAR-235', name: 'Sachin Tendulkar', urgency: 'High', ahead: 2 }
        ]
      },
      'Pulmonology': {
        length: 3,
        waitTimeMinutes: 28,
        currentToken: 'PUL-157',
        patients: [
            { token: 'PUL-158', name: 'Seema Rao', urgency: 'Low', ahead: 1 },
            { token: 'PUL-159', name: 'Suresh Kumar', urgency: 'Medium', ahead: 2 },
            { token: 'PUL-160', name: 'Ritu Kapoor', urgency: 'Low', ahead: 3 }
        ]
      },
      'Oncology': {
        length: 1,
        waitTimeMinutes: 10,
        currentToken: 'ONC-259',
        patients: [
            { token: 'ONC-260', name: 'Ranbir Kapoor', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Orthopedics': {
        length: 3,
        waitTimeMinutes: 30,
        currentToken: 'ORT-115',
        patients: [
            { token: 'ORT-116', name: 'Arjun Singh', urgency: 'High', ahead: 1 },
            { token: 'ORT-117', name: 'Amitabh Bachchan', urgency: 'Medium', ahead: 2 },
            { token: 'ORT-118', name: 'Harish Goel', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 20,
        currentToken: 'PED-252',
        patients: [
            { token: 'PED-253', name: 'Seema Rao', urgency: 'Medium', ahead: 1 },
            { token: 'PED-254', name: 'Pankaj Tripathi', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Neurology': {
        length: 1,
        waitTimeMinutes: 11,
        currentToken: 'NEU-154',
        patients: [
            { token: 'NEU-155', name: 'Sanjay Joshi', urgency: 'Medium', ahead: 1 }
        ]
      },
      'General Medicine': {
        length: 21,
        waitTimeMinutes: 86,
        currentToken: 'GEN-214',
        patients: [
            { token: 'GEN-215', name: 'Rajesh Mehra', urgency: 'Medium', ahead: 1 },
            { token: 'GEN-216', name: 'Ananya Gupta', urgency: 'High', ahead: 2 },
            { token: 'GEN-217', name: 'Deepika Padukone', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1400,
      estDiagnostics: 3100,
      estMedicines: 1100
    },
    reviewSummary: {
      summary: 'Praised for clean premises, polite nursing staff, and comparatively short waiting queues. However, diagnostic reports can occasionally take longer than promised.',
      positive: ['Polite nursing staff', 'Shorter wait times', 'Hygiene & Cleanliness'],
      negative: ['Slow lab test dispatch', 'Food options in cafeteria', 'High pricing']
    },
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-medanta-gurugram',
    name: 'Medanta - The Medicity',
    lat: 28.4239,
    lng: 77.0401,
    address: 'CH Baktawar Singh Road, Sector 38, Gurugram, Haryana 122001',
    rating: 4.8,
    reviewsCount: 3150,
    specializations: ['Cardiology', 'Neurology', 'Pulmonology', 'Orthopedics', 'Pediatrics', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'],
    beds: {
      icu: { total: 80, available: 12 },
      emergency: { total: 40, available: 9 },
      general: { total: 350, available: 60 }
    },
    doctors: [
      { id: 'doc-14', name: 'Dr. Naresh Trehan', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-15', name: 'Dr. Randhir Sud', specialization: 'Gastroenterology', available: true, statusText: 'Available' },
      { id: 'doc-16', name: 'Dr. Tejinder Kataria', specialization: 'Oncology', available: true, statusText: 'Consulting' },
      { id: 'doc-17', name: 'Dr. Arvinder Singh Soin', specialization: 'Liver Transplant', available: false, statusText: 'In Surgery' }
    ],
    queue: {
      length: 15,
      waitTimeMinutes: 80,
      currentToken: 'MD-501',
      patients: [
        { token: 'MD-502', name: 'Ramesh Gupta', urgency: 'High', ahead: 1 },
        { token: 'MD-503', name: 'Karan Malhotra', urgency: 'Low', ahead: 2 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 4,
        waitTimeMinutes: 36,
        currentToken: 'CAR-222',
        patients: [
            { token: 'CAR-223', name: 'Deepika Padukone', urgency: 'Low', ahead: 1 },
            { token: 'CAR-224', name: 'Suresh Kumar', urgency: 'High', ahead: 2 },
            { token: 'CAR-225', name: 'Kiran Devi', urgency: 'Low', ahead: 3 }
        ]
      },
      'Neurology': {
        length: 4,
        waitTimeMinutes: 38,
        currentToken: 'NEU-171',
        patients: [
            { token: 'NEU-172', name: 'Manpreet Singh', urgency: 'High', ahead: 1 },
            { token: 'NEU-173', name: 'Shreya Ghoshal', urgency: 'Medium', ahead: 2 },
            { token: 'NEU-174', name: 'Kapil Dev', urgency: 'High', ahead: 3 }
        ]
      },
      'Pulmonology': {
        length: 2,
        waitTimeMinutes: 20,
        currentToken: 'PUL-226',
        patients: [
            { token: 'PUL-227', name: 'Aishwarya Rai', urgency: 'Medium', ahead: 1 },
            { token: 'PUL-228', name: 'Sachin Tendulkar', urgency: 'Low', ahead: 2 }
        ]
      },
      'Orthopedics': {
        length: 3,
        waitTimeMinutes: 28,
        currentToken: 'ORT-155',
        patients: [
            { token: 'ORT-156', name: 'Seema Rao', urgency: 'High', ahead: 1 },
            { token: 'ORT-157', name: 'Vikram Malhotra', urgency: 'High', ahead: 2 },
            { token: 'ORT-158', name: 'Kiran Devi', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 20,
        currentToken: 'PED-262',
        patients: [
            { token: 'PED-263', name: 'Kriti Jain', urgency: 'High', ahead: 1 },
            { token: 'PED-264', name: 'Rajesh Mehra', urgency: 'Low', ahead: 2 }
        ]
      },
      'Emergency Medicine': {
        length: 19,
        waitTimeMinutes: 80,
        currentToken: 'EME-147',
        patients: [
            { token: 'EME-148', name: 'Shreya Ghoshal', urgency: 'Medium', ahead: 1 },
            { token: 'EME-149', name: 'Ananya Gupta', urgency: 'Medium', ahead: 2 },
            { token: 'EME-150', name: 'Pankaj Tripathi', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1800,
      estDiagnostics: 4200,
      estMedicines: 1500
    },
    reviewSummary: {
      summary: 'Widely considered the best multi-specialty institute in northern India. Extreme rush leads to parking nightmares and long queues, but critical clinical care is unmatched.',
      positive: ['Legendary heart specialist team', 'Massive bed capacity', 'Complete diagnostic labs'],
      negative: ['Crowded OPD blocks', 'Very expensive overall', 'Parking hassles']
    },
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-aiims-delhi',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    lat: 28.5672,
    lng: 77.2100,
    address: 'Ansari Nagar, New Delhi, Delhi 110029',
    rating: 4.5,
    reviewsCount: 9400,
    specializations: ['Cardiology', 'Pulmonology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'],
    beds: {
      icu: { total: 100, available: 1 },
      emergency: { total: 60, available: 0 },
      general: { total: 800, available: 10 }
    },
    doctors: [
      { id: 'doc-18', name: 'Dr. Randeep Guleria', specialization: 'Pulmonology', available: true, statusText: 'Available' },
      { id: 'doc-19', name: 'Dr. S.K. Maulik', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-20', name: 'Dr. Rajesh Malhotra', specialization: 'Orthopedics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 45,
      waitTimeMinutes: 180,
      currentToken: 'AI-902',
      patients: [
        { token: 'AI-903', name: 'Shreya Ghoshal', urgency: 'Medium', ahead: 1 },
        { token: 'AI-904', name: 'Sanjay Joshi', urgency: 'Low', ahead: 2 },
        { token: 'AI-905', name: 'Aarav Tyagi', urgency: 'Medium', ahead: 3 },
        { token: 'AI-906', name: 'Deepika Padukone', urgency: 'Medium', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 1,
        waitTimeMinutes: 14,
        currentToken: 'CAR-133',
        patients: [
            { token: 'CAR-134', name: 'Arjun Singh', urgency: 'High', ahead: 1 }
        ]
      },
      'Pulmonology': {
        length: 4,
        waitTimeMinutes: 37,
        currentToken: 'PUL-218',
        patients: [
            { token: 'PUL-219', name: 'Aishwarya Rai', urgency: 'Low', ahead: 1 },
            { token: 'PUL-220', name: 'Rohan Das', urgency: 'Low', ahead: 2 },
            { token: 'PUL-221', name: 'Divya Sharma', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 4,
        waitTimeMinutes: 38,
        currentToken: 'PED-232',
        patients: [
            { token: 'PED-233', name: 'Kriti Jain', urgency: 'Medium', ahead: 1 },
            { token: 'PED-234', name: 'Karan Johar', urgency: 'High', ahead: 2 },
            { token: 'PED-235', name: 'Vikram Malhotra', urgency: 'Low', ahead: 3 }
        ]
      },
      'Orthopedics': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'ORT-227',
        patients: [
            { token: 'ORT-228', name: 'Seema Rao', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Neurology': {
        length: 3,
        waitTimeMinutes: 30,
        currentToken: 'NEU-262',
        patients: [
            { token: 'NEU-263', name: 'Kiran Devi', urgency: 'Low', ahead: 1 },
            { token: 'NEU-264', name: 'Manpreet Singh', urgency: 'High', ahead: 2 },
            { token: 'NEU-265', name: 'Kriti Jain', urgency: 'High', ahead: 3 }
        ]
      },
      'Emergency Medicine': {
        length: 13,
        waitTimeMinutes: 54,
        currentToken: 'EME-137',
        patients: [
            { token: 'EME-138', name: 'Sachin Tendulkar', urgency: 'Low', ahead: 1 },
            { token: 'EME-139', name: 'Aarav Tyagi', urgency: 'High', ahead: 2 },
            { token: 'EME-140', name: 'Kapil Dev', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 50,
      estDiagnostics: 200,
      estMedicines: 100
    },
    reviewSummary: {
      summary: 'Highly subsidized government care with the top medical brains of the country. Expect massive queues, extreme wait times, and zero bed availability for non-critical cases.',
      positive: ['Extremely affordable', 'Top medical researchers', 'Excellent treatments'],
      negative: ['Massive queues', 'No vacant emergency beds', 'Complicated procedures']
    },
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&auto=format&fit=crop&q=60'
  },
  
  // Clinics (Additions)
  {
    id: 'clinic-apollo-sec14',
    name: 'Apollo Clinic, Gurugram Sector 14',
    lat: 28.4722,
    lng: 77.0425,
    address: 'SCF 47-48, Main Market, Sector 14, Gurugram, Haryana 122001',
    rating: 4.4,
    reviewsCount: 310,
    specializations: ['Pediatrics', 'General Medicine', 'Gastroenterology'],
    facilities: ['General Ward'], // No ICU/NICU/Cath Lab
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 2, available: 1 },
      general: { total: 10, available: 4 }
    },
    doctors: [
      { id: 'doc-21', name: 'Dr. Neha Kapoor', specialization: 'Pediatrics', available: true, statusText: 'Available' },
      { id: 'doc-22', name: 'Dr. Mahesh Chandra', specialization: 'General Medicine', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 2,
      waitTimeMinutes: 15,
      currentToken: 'AC-102',
      patients: [
        { token: 'AC-103', name: 'Sanjay Joshi', urgency: 'Low', ahead: 1 },
        { token: 'AC-104', name: 'Seema Rao', urgency: 'Medium', ahead: 2 }
      ]
    },
    departmentQueues: {
      'Pediatrics': {
        length: 3,
        waitTimeMinutes: 26,
        currentToken: 'PED-199',
        patients: [
            { token: 'PED-200', name: 'Kriti Jain', urgency: 'High', ahead: 1 },
            { token: 'PED-201', name: 'Seema Rao', urgency: 'Low', ahead: 2 },
            { token: 'PED-202', name: 'Suresh Kumar', urgency: 'Medium', ahead: 3 }
        ]
      },
      'General Medicine': {
        length: 17,
        waitTimeMinutes: 72,
        currentToken: 'GEN-115',
        patients: [
            { token: 'GEN-116', name: 'Karan Johar', urgency: 'Low', ahead: 1 },
            { token: 'GEN-117', name: 'Seema Rao', urgency: 'Medium', ahead: 2 },
            { token: 'GEN-118', name: 'Ananya Gupta', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Gastroenterology': {
        length: 3,
        waitTimeMinutes: 30,
        currentToken: 'GAS-108',
        patients: [
            { token: 'GAS-109', name: 'Suresh Kumar', urgency: 'Low', ahead: 1 },
            { token: 'GAS-110', name: 'Vikram Malhotra', urgency: 'High', ahead: 2 },
            { token: 'GAS-111', name: 'Neha Aggarwal', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 600, // Economical clinic rates
      estDiagnostics: 800,
      estMedicines: 450
    },
    reviewSummary: {
      summary: 'Excellent local clinic for viral fevers, pediatrics, and minor family issues. Shorter queues, though lacking advanced imaging facilities like MRI or CT scans.',
      positive: ['Very short queue times', 'Economical rates', 'Caring doctors'],
      negative: ['No advanced scan machines', 'No critical care capabilities']
    },
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'clinic-max-lajpat',
    name: 'Max Medcentre, Lajpat Nagar',
    lat: 28.5684,
    lng: 77.2414,
    address: 'Block E, Lajpat Nagar III, New Delhi, Delhi 110024',
    rating: 4.3,
    reviewsCount: 220,
    specializations: ['General Medicine', 'Orthopedics', 'Pulmonology'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 3, available: 2 },
      general: { total: 12, available: 6 }
    },
    doctors: [
      { id: 'doc-23', name: 'Dr. Rohan Mehra', specialization: 'General Medicine', available: true, statusText: 'Available' },
      { id: 'doc-24', name: 'Dr. Priya Sen', specialization: 'Orthopedics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 3,
      waitTimeMinutes: 20,
      currentToken: 'MMC-044',
      patients: [
        { token: 'MMC-45', name: 'Karan Johar', urgency: 'Medium', ahead: 1 },
        { token: 'MMC-46', name: 'Pooja Patel', urgency: 'Low', ahead: 2 },
        { token: 'MMC-47', name: 'Manish Varma', urgency: 'High', ahead: 3 }
      ]
    },
    departmentQueues: {
      'General Medicine': {
        length: 12,
        waitTimeMinutes: 51,
        currentToken: 'GEN-292',
        patients: [
            { token: 'GEN-293', name: 'Ritu Kapoor', urgency: 'High', ahead: 1 },
            { token: 'GEN-294', name: 'Pankaj Tripathi', urgency: 'High', ahead: 2 },
            { token: 'GEN-295', name: 'Harish Goel', urgency: 'Low', ahead: 3 }
        ]
      },
      'Orthopedics': {
        length: 1,
        waitTimeMinutes: 14,
        currentToken: 'ORT-100',
        patients: [
            { token: 'ORT-101', name: 'Pooja Patel', urgency: 'High', ahead: 1 }
        ]
      },
      'Pulmonology': {
        length: 2,
        waitTimeMinutes: 19,
        currentToken: 'PUL-121',
        patients: [
            { token: 'PUL-122', name: 'Kapil Dev', urgency: 'Low', ahead: 1 },
            { token: 'PUL-123', name: 'Neha Aggarwal', urgency: 'High', ahead: 2 }
        ]
      }
    },
    costs: {
      consultation: 700,
      estDiagnostics: 900,
      estMedicines: 500
    },
    reviewSummary: {
      summary: 'Convenient central location. Fast OPD queue flow for sprains and viral fevers, but emergency capacity is extremely limited.',
      positive: ['Helpful desk staff', 'Affordable consultation', 'Short wait time'],
      negative: ['Small emergency lobby', 'No round-the-clock surgeon']
    },
    imageUrl: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'hosp-artemis-gurugram',
    name: 'Artemis Hospital, Gurugram',
    lat: 28.4277,
    lng: 77.0877,
    address: 'Sector 51, Gurugram, Haryana 122001',
    rating: 4.7,
    reviewsCount: 1420,
    specializations: ['Cardiology', 'Pulmonology', 'Oncology', 'Neurology', 'Pediatrics', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 30, available: 5 },
      emergency: { total: 15, available: 4 },
      general: { total: 110, available: 22 }
    },
    doctors: [
      { id: 'doc-25', name: 'Dr. Devendra Singh', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-26', name: 'Dr. Aditya Gupta', specialization: 'Neurology', available: true, statusText: 'Consulting' },
      { id: 'doc-27', name: 'Dr. Rajiv Malhotra', specialization: 'Emergency Medicine', available: true, statusText: 'Available' }
    ],
        queue: {
      length: 4,
      waitTimeMinutes: 18,
      currentToken: 'ART-401',
      patients: [
        { token: 'ART-402', name: 'Sanjay Joshi', urgency: 'Medium', ahead: 1 },
        { token: 'ART-403', name: 'Kiran Devi', urgency: 'Medium', ahead: 2 },
        { token: 'ART-404', name: 'Neha Aggarwal', urgency: 'Medium', ahead: 3 },
        { token: 'ART-405', name: 'Rohan Das', urgency: 'Medium', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'CAR-288',
        patients: [
            { token: 'CAR-289', name: 'Kriti Jain', urgency: 'High', ahead: 1 }
        ]
      },
      'Pulmonology': {
        length: 3,
        waitTimeMinutes: 26,
        currentToken: 'PUL-156',
        patients: [
            { token: 'PUL-157', name: 'Pankaj Tripathi', urgency: 'Low', ahead: 1 },
            { token: 'PUL-158', name: 'Ranbir Kapoor', urgency: 'Medium', ahead: 2 },
            { token: 'PUL-159', name: 'Kapil Dev', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Oncology': {
        length: 2,
        waitTimeMinutes: 19,
        currentToken: 'ONC-139',
        patients: [
            { token: 'ONC-140', name: 'Aditya Sen', urgency: 'Medium', ahead: 1 },
            { token: 'ONC-141', name: 'Rajesh Mehra', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Neurology': {
        length: 4,
        waitTimeMinutes: 34,
        currentToken: 'NEU-118',
        patients: [
            { token: 'NEU-119', name: 'Ananya Gupta', urgency: 'High', ahead: 1 },
            { token: 'NEU-120', name: 'Divya Sharma', urgency: 'Low', ahead: 2 },
            { token: 'NEU-121', name: 'Shreya Ghoshal', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 21,
        currentToken: 'PED-216',
        patients: [
            { token: 'PED-217', name: 'Ranbir Kapoor', urgency: 'High', ahead: 1 },
            { token: 'PED-218', name: 'Deepika Padukone', urgency: 'Low', ahead: 2 }
        ]
      },
      'Emergency Medicine': {
        length: 15,
        waitTimeMinutes: 62,
        currentToken: 'EME-169',
        patients: [
            { token: 'EME-170', name: 'Aditya Sen', urgency: 'High', ahead: 1 },
            { token: 'EME-171', name: 'Rajesh Mehra', urgency: 'Low', ahead: 2 },
            { token: 'EME-172', name: 'Manpreet Singh', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1200,
      estDiagnostics: 2400,
      estMedicines: 850
    },
    reviewSummary: {
      summary: 'Artemis is recognized for highly streamlined pediatric and emergency care, backed by a modern campus and responsive nursing. High consultation pricing is a common issue.',
      positive: ['Super clean environments', 'Short queue lists', 'Highly responsive nursing'],
      negative: ['High diagnostic pricing', 'Pricey cafeteria', 'Long prescription processing']
    },
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-moolchand-delhi',
    name: 'Moolchand Medcity, New Delhi',
    lat: 28.5644,
    lng: 77.2344,
    address: 'Moolchand Flyover, Lajpat Nagar III, New Delhi, Delhi 110024',
    rating: 4.6,
    reviewsCount: 950,
    specializations: ['Cardiology', 'Orthopedics', 'Pulmonology', 'General Medicine'],
    facilities: ['ICU', 'MRI', 'Cath Lab', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 25, available: 3 },
      emergency: { total: 12, available: 2 },
      general: { total: 95, available: 18 }
    },
    doctors: [
      { id: 'doc-28', name: 'Dr. H.K. Chopra', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-29', name: 'Dr. Ramesh Kumar', specialization: 'Orthopedics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 3,
      waitTimeMinutes: 22,
      currentToken: 'MOL-088',
      patients: [
        { token: 'MOL-89', name: 'Arjun Singh', urgency: 'High', ahead: 1 },
        { token: 'MOL-90', name: 'Ananya Gupta', urgency: 'Medium', ahead: 2 },
        { token: 'MOL-91', name: 'Manish Varma', urgency: 'High', ahead: 3 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 2,
        waitTimeMinutes: 21,
        currentToken: 'CAR-288',
        patients: [
            { token: 'CAR-289', name: 'Vikram Malhotra', urgency: 'Low', ahead: 1 },
            { token: 'CAR-290', name: 'Sanjay Joshi', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Orthopedics': {
        length: 2,
        waitTimeMinutes: 22,
        currentToken: 'ORT-107',
        patients: [
            { token: 'ORT-108', name: 'Karan Johar', urgency: 'Low', ahead: 1 },
            { token: 'ORT-109', name: 'Kiran Devi', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Pulmonology': {
        length: 3,
        waitTimeMinutes: 29,
        currentToken: 'PUL-222',
        patients: [
            { token: 'PUL-223', name: 'Sunil Gavaskar', urgency: 'Low', ahead: 1 },
            { token: 'PUL-224', name: 'Pooja Patel', urgency: 'Medium', ahead: 2 },
            { token: 'PUL-225', name: 'Neha Aggarwal', urgency: 'Medium', ahead: 3 }
        ]
      },
      'General Medicine': {
        length: 14,
        waitTimeMinutes: 62,
        currentToken: 'GEN-144',
        patients: [
            { token: 'GEN-145', name: 'Seema Rao', urgency: 'High', ahead: 1 },
            { token: 'GEN-146', name: 'Karan Johar', urgency: 'Low', ahead: 2 },
            { token: 'GEN-147', name: 'Meena Rani', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 900,
      estDiagnostics: 1900,
      estMedicines: 700
    },
    reviewSummary: {
      summary: 'Known for legacy orthopedic treatments and a centrally located campus in South Delhi. Frontdesk check-in registers slower compared to digital queue updates.',
      positive: ['Excellent orthopedicians', 'Centrally located', 'Vast campus lawns'],
      negative: ['Slower frontdesk registers', 'Older building blocks', 'Pricey medicine stores']
    },
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-paras-gurugram',
    name: 'Paras Hospital, Gurugram',
    lat: 28.4355,
    lng: 77.0911,
    address: 'C-1, Sushant Lok Phase I, Sector 43, Gurugram, Haryana 122002',
    rating: 4.5,
    reviewsCount: 1120,
    specializations: ['Neurology', 'Cardiology', 'General Medicine', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 28, available: 4 },
      emergency: { total: 15, available: 3 },
      general: { total: 90, available: 16 }
    },
    doctors: [
      { id: 'doc-30', name: 'Dr. V.S. Mehta', specialization: 'Neurology', available: true, statusText: 'Available' },
      { id: 'doc-31', name: 'Dr. Tapan Ghose', specialization: 'Cardiology', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 5,
      waitTimeMinutes: 28,
      currentToken: 'PAR-120',
      patients: [
        { token: 'PAR-121', name: 'Harish Goel', urgency: 'Medium', ahead: 1 },
        { token: 'PAR-122', name: 'Vikram Malhotra', urgency: 'Medium', ahead: 2 },
        { token: 'PAR-123', name: 'Aditya Sen', urgency: 'Low', ahead: 3 },
        { token: 'PAR-124', name: 'Ranbir Kapoor', urgency: 'Low', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Neurology': {
        length: 2,
        waitTimeMinutes: 20,
        currentToken: 'NEU-145',
        patients: [
            { token: 'NEU-146', name: 'Kapil Dev', urgency: 'Medium', ahead: 1 },
            { token: 'NEU-147', name: 'Suresh Kumar', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Cardiology': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'CAR-182',
        patients: [
            { token: 'CAR-183', name: 'Ranbir Kapoor', urgency: 'Low', ahead: 1 }
        ]
      },
      'General Medicine': {
        length: 26,
        waitTimeMinutes: 108,
        currentToken: 'GEN-263',
        patients: [
            { token: 'GEN-264', name: 'Pankaj Tripathi', urgency: 'Low', ahead: 1 },
            { token: 'GEN-265', name: 'Amitabh Bachchan', urgency: 'Low', ahead: 2 },
            { token: 'GEN-266', name: 'Arjun Singh', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Emergency Medicine': {
        length: 26,
        waitTimeMinutes: 108,
        currentToken: 'EME-190',
        patients: [
            { token: 'EME-191', name: 'Sanjay Joshi', urgency: 'High', ahead: 1 },
            { token: 'EME-192', name: 'Ananya Gupta', urgency: 'Medium', ahead: 2 },
            { token: 'EME-193', name: 'Pankaj Tripathi', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1000,
      estDiagnostics: 2100,
      estMedicines: 750
    },
    reviewSummary: {
      summary: 'Very popular center for neurological disorders and clinical emergencies in Sushant Lok. General queues move steadily, though billing systems require optimization.',
      positive: ['Outstanding neuro care', 'Easy metro connectivity', 'Clean diagnostics wing'],
      negative: ['Laggy billing systems', 'Crowded waiting lobby', 'Slow triage checks']
    },
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-srhc-narela',
    name: 'Satyawadi Raja Harishchandra Hospital (SRHC)',
    lat: 28.8428,
    lng: 77.1051,
    address: 'Plot No. 30, Sector A-7, Narela, Delhi 110040',
    rating: 4.2,
    reviewsCount: 890,
    specializations: ['General Medicine', 'Pediatrics', 'Orthopedics', 'Emergency Medicine'],
    facilities: ['ICU', 'CT Scan', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 15, available: 2 },
      emergency: { total: 20, available: 3 },
      general: { total: 120, available: 14 }
    },
    doctors: [
      { id: 'doc-32', name: 'Dr. S.B. Singh', specialization: 'General Medicine', available: true, statusText: 'Available' },
      { id: 'doc-33', name: 'Dr. Meena Kumari', specialization: 'Pediatrics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 18,
      waitTimeMinutes: 35,
      currentToken: 'SRH-510',
      patients: [
        { token: 'SRH-511', name: 'Shreya Ghoshal', urgency: 'High', ahead: 1 },
        { token: 'SRH-512', name: 'Deepika Padukone', urgency: 'Medium', ahead: 2 },
        { token: 'SRH-513', name: 'Arjun Singh', urgency: 'Medium', ahead: 3 },
        { token: 'SRH-514', name: 'Ananya Gupta', urgency: 'High', ahead: 4 }
      ]
    },
    departmentQueues: {
      'General Medicine': {
        length: 24,
        waitTimeMinutes: 98,
        currentToken: 'GEN-263',
        patients: [
            { token: 'GEN-264', name: 'Pooja Patel', urgency: 'High', ahead: 1 },
            { token: 'GEN-265', name: 'Ranbir Kapoor', urgency: 'Medium', ahead: 2 },
            { token: 'GEN-266', name: 'Kriti Jain', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 4,
        waitTimeMinutes: 36,
        currentToken: 'PED-186',
        patients: [
            { token: 'PED-187', name: 'Pankaj Tripathi', urgency: 'High', ahead: 1 },
            { token: 'PED-188', name: 'Aarav Tyagi', urgency: 'Medium', ahead: 2 },
            { token: 'PED-189', name: 'Deepika Padukone', urgency: 'Low', ahead: 3 }
        ]
      },
      'Orthopedics': {
        length: 3,
        waitTimeMinutes: 29,
        currentToken: 'ORT-165',
        patients: [
            { token: 'ORT-166', name: 'Seema Rao', urgency: 'Medium', ahead: 1 },
            { token: 'ORT-167', name: 'Neha Aggarwal', urgency: 'Medium', ahead: 2 },
            { token: 'ORT-168', name: 'Rajesh Mehra', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Emergency Medicine': {
        length: 18,
        waitTimeMinutes: 77,
        currentToken: 'EME-158',
        patients: [
            { token: 'EME-159', name: 'Ananya Gupta', urgency: 'Medium', ahead: 1 },
            { token: 'EME-160', name: 'Suresh Kumar', urgency: 'High', ahead: 2 },
            { token: 'EME-161', name: 'Pooja Patel', urgency: 'Low', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 20, // Government hospital
      estDiagnostics: 150,
      estMedicines: 80
    },
    reviewSummary: {
      summary: 'Government hospital offering highly subsidized, reliable clinical treatments for residents of Narela. Waiting times are modest, but queues check in steadily.',
      positive: ['Highly affordable treatments', 'Local convenience in Narela', 'Helpful nursing staff'],
      negative: ['Crowded OPD blocks', 'Limited advanced MRI scanner']
    },
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-valmiki-pooth',
    name: 'Maharishi Valmiki Hospital, Pooth Khurd',
    lat: 28.7995,
    lng: 77.0392,
    address: 'Pooth Khurd, near Narela-Bawana, Delhi 110039',
    rating: 4.1,
    reviewsCount: 650,
    specializations: ['General Medicine', 'Orthopedics', 'Pediatrics', 'Emergency Medicine'],
    facilities: ['ICU', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 10, available: 1 },
      emergency: { total: 15, available: 2 },
      general: { total: 100, available: 12 }
    },
    doctors: [
      { id: 'doc-34', name: 'Dr. Sandeep Kumar', specialization: 'Orthopedics', available: true, statusText: 'Available' },
      { id: 'doc-35', name: 'Dr. Poonam Rani', specialization: 'General Medicine', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 12,
      waitTimeMinutes: 30,
      currentToken: 'MVH-124',
      patients: [
        { token: 'MVH-125', name: 'Karan Johar', urgency: 'High', ahead: 1 },
        { token: 'MVH-126', name: 'Aishwarya Rai', urgency: 'High', ahead: 2 },
        { token: 'MVH-127', name: 'Vikram Malhotra', urgency: 'Low', ahead: 3 },
        { token: 'MVH-128', name: 'Arjun Singh', urgency: 'Medium', ahead: 4 }
      ]
    },
    departmentQueues: {
      'General Medicine': {
        length: 26,
        waitTimeMinutes: 108,
        currentToken: 'GEN-139',
        patients: [
            { token: 'GEN-140', name: 'Karan Johar', urgency: 'Medium', ahead: 1 },
            { token: 'GEN-141', name: 'Aishwarya Rai', urgency: 'Medium', ahead: 2 },
            { token: 'GEN-142', name: 'Aarav Tyagi', urgency: 'Low', ahead: 3 }
        ]
      },
      'Orthopedics': {
        length: 3,
        waitTimeMinutes: 28,
        currentToken: 'ORT-101',
        patients: [
            { token: 'ORT-102', name: 'Meena Rani', urgency: 'Low', ahead: 1 },
            { token: 'ORT-103', name: 'Manish Varma', urgency: 'High', ahead: 2 },
            { token: 'ORT-104', name: 'Suresh Kumar', urgency: 'High', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 3,
        waitTimeMinutes: 30,
        currentToken: 'PED-137',
        patients: [
            { token: 'PED-138', name: 'Shreya Ghoshal', urgency: 'High', ahead: 1 },
            { token: 'PED-139', name: 'Kiran Devi', urgency: 'Low', ahead: 2 },
            { token: 'PED-140', name: 'Aarav Tyagi', urgency: 'Low', ahead: 3 }
        ]
      },
      'Emergency Medicine': {
        length: 20,
        waitTimeMinutes: 84,
        currentToken: 'EME-296',
        patients: [
            { token: 'EME-297', name: 'Sachin Tendulkar', urgency: 'High', ahead: 1 },
            { token: 'EME-298', name: 'Shreya Ghoshal', urgency: 'Medium', ahead: 2 },
            { token: 'EME-299', name: 'Divya Sharma', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 20,
      estDiagnostics: 100,
      estMedicines: 70
    },
    reviewSummary: {
      summary: 'Public hospital catering to the Bawana-Narela belt. Clean wards and cheap medical checkups, though emergency beds are heavily occupied.',
      positive: ['Affordable fees', 'Good general ward maintenance', 'Attentive doctors'],
      negative: ['Crowded lobby blocks', 'Needs more ventilators']
    },
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'hosp-max-shalimar',
    name: 'Max Super Speciality Hospital, Shalimar Bagh',
    lat: 28.7180,
    lng: 77.1560,
    address: 'FC-50, Shalimar Bagh, New Delhi, Delhi 110088',
    rating: 4.8,
    reviewsCount: 2940,
    specializations: ['Cardiology', 'Neurology', 'Pulmonology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'],
    beds: {
      icu: { total: 45, available: 8 },
      emergency: { total: 25, available: 6 },
      general: { total: 180, available: 32 }
    },
    doctors: [
      { id: 'doc-36', name: 'Dr. Rajiv Mahendru', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-37', name: 'Dr. Dinesh Sareen', specialization: 'Neurology', available: true, statusText: 'Available' },
      { id: 'doc-38', name: 'Dr. Vivek Mangla', specialization: 'Gastroenterology', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 6,
      waitTimeMinutes: 28,
      currentToken: 'MSB-890',
      patients: [
        { token: 'MSB-891', name: 'Aishwarya Rai', urgency: 'Low', ahead: 1 },
        { token: 'MSB-892', name: 'Sunil Gavaskar', urgency: 'Medium', ahead: 2 },
        { token: 'MSB-893', name: 'Suresh Kumar', urgency: 'Medium', ahead: 3 },
        { token: 'MSB-894', name: 'Kriti Jain', urgency: 'Medium', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 3,
        waitTimeMinutes: 30,
        currentToken: 'CAR-283',
        patients: [
            { token: 'CAR-284', name: 'Arjun Singh', urgency: 'Low', ahead: 1 },
            { token: 'CAR-285', name: 'Ritu Kapoor', urgency: 'High', ahead: 2 },
            { token: 'CAR-286', name: 'Vikram Malhotra', urgency: 'High', ahead: 3 }
        ]
      },
      'Neurology': {
        length: 1,
        waitTimeMinutes: 10,
        currentToken: 'NEU-201',
        patients: [
            { token: 'NEU-202', name: 'Amitabh Bachchan', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Pulmonology': {
        length: 1,
        waitTimeMinutes: 10,
        currentToken: 'PUL-116',
        patients: [
            { token: 'PUL-117', name: 'Pooja Patel', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Oncology': {
        length: 1,
        waitTimeMinutes: 11,
        currentToken: 'ONC-175',
        patients: [
            { token: 'ONC-176', name: 'Harish Goel', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Orthopedics': {
        length: 1,
        waitTimeMinutes: 13,
        currentToken: 'ORT-285',
        patients: [
            { token: 'ORT-286', name: 'Manish Varma', urgency: 'Medium', ahead: 1 }
        ]
      },
      'Pediatrics': {
        length: 1,
        waitTimeMinutes: 11,
        currentToken: 'PED-299',
        patients: [
            { token: 'PED-300', name: 'Ananya Gupta', urgency: 'Low', ahead: 1 }
        ]
      },
      'Emergency Medicine': {
        length: 15,
        waitTimeMinutes: 66,
        currentToken: 'EME-287',
        patients: [
            { token: 'EME-288', name: 'Aishwarya Rai', urgency: 'Medium', ahead: 1 },
            { token: 'EME-289', name: 'Amitabh Bachchan', urgency: 'High', ahead: 2 },
            { token: 'EME-290', name: 'Aarav Tyagi', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 1300,
      estDiagnostics: 2900,
      estMedicines: 1100
    },
    reviewSummary: {
      summary: 'Premier super-specialty hospital close to North Delhi and Narela. Famed for neurological diagnostics and clean private suites. High billing rates are standard.',
      positive: ['Outstanding cardiology services', 'Superb private ward care', 'Clean surroundings'],
      negative: ['Premium OPD fee billing', 'Slow discharge releases', 'Pricey cafeteria']
    },
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'clinic-clove-dental-narela',
    name: 'Clove Dental Clinic, Narela',
    lat: 28.8440,
    lng: 77.0980,
    address: 'A-10, Sector A-5, Narela, Delhi 110040',
    rating: 4.6,
    reviewsCount: 180,
    specializations: ['Dentistry'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 1, available: 1 },
      general: { total: 4, available: 2 }
    },
    doctors: [
      { id: 'doc-44', name: 'Dr. Saurabh Goel', specialization: 'Dentistry', available: true, statusText: 'Available' },
      { id: 'doc-45', name: 'Dr. Nidhi Sen', specialization: 'Dentistry', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 2,
      waitTimeMinutes: 12,
      currentToken: 'CLV-024',
      patients: [
        { token: 'CLV-25', name: 'Ranbir Kapoor', urgency: 'Low', ahead: 1 },
        { token: 'CLV-26', name: 'Deepak Sen', urgency: 'Medium', ahead: 2 }
      ]
    },
    departmentQueues: {
      'Dentistry': {
        length: 3,
        waitTimeMinutes: 27,
        currentToken: 'DEN-126',
        patients: [
            { token: 'DEN-127', name: 'Arjun Singh', urgency: 'Low', ahead: 1 },
            { token: 'DEN-128', name: 'Sachin Tendulkar', urgency: 'High', ahead: 2 },
            { token: 'DEN-129', name: 'Divya Sharma', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 500,
      estDiagnostics: 600,
      estMedicines: 300
    },
    reviewSummary: {
      summary: 'Highly recommended for painless root canals and family dentistry in Narela. Modern dental chairs and friendly staff. Bypasses general emergency queues.',
      positive: ['Advanced scaling tools', 'Painless dental surgery', 'Hygienic cabinets'],
      negative: ['Waiting room seats are few', 'Card swipe lag']
    },
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'clinic-narela-gynec',
    name: 'Narela Gynecology & Maternity Center',
    lat: 28.8465,
    lng: 77.1040,
    address: 'Pocket 5, Sector A-10, Narela, Delhi 110040',
    rating: 4.4,
    reviewsCount: 120,
    specializations: ['Gynaecology', 'Pediatrics'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 2, available: 1 },
      general: { total: 12, available: 5 }
    },
    doctors: [
      { id: 'doc-46', name: 'Dr. Sunita Varma', specialization: 'Gynaecology', available: true, statusText: 'Available' },
      { id: 'doc-47', name: 'Dr. Preeti Gupta', specialization: 'Gynaecology', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 3,
      waitTimeMinutes: 18,
      currentToken: 'NGC-056',
      patients: [
        { token: 'NGC-57', name: 'Divya Sharma', urgency: 'Medium', ahead: 1 },
        { token: 'NGC-58', name: 'Seema Rao', urgency: 'Medium', ahead: 2 },
        { token: 'NGC-59', name: 'Manish Varma', urgency: 'Medium', ahead: 3 }
      ]
    },
    departmentQueues: {
      'Gynaecology': {
        length: 4,
        waitTimeMinutes: 34,
        currentToken: 'GYN-236',
        patients: [
            { token: 'GYN-237', name: 'Arjun Singh', urgency: 'Low', ahead: 1 },
            { token: 'GYN-238', name: 'Vikram Malhotra', urgency: 'Low', ahead: 2 },
            { token: 'GYN-239', name: 'Sanjay Joshi', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 1,
        waitTimeMinutes: 11,
        currentToken: 'PED-108',
        patients: [
            { token: 'PED-109', name: 'Seema Rao', urgency: 'Low', ahead: 1 }
        ]
      }
    },
    costs: {
      consultation: 450,
      estDiagnostics: 800,
      estMedicines: 400
    },
    reviewSummary: {
      summary: 'Clean and supportive maternity consulting facility in North Delhi. Highly experienced doctors and polite nursing staff. Triage updates run automatically.',
      positive: ['Polite nursing checkups', 'Legacy women health expert', 'Clean consulting chambers'],
      negative: ['Pharmacy queue speed', 'Cafeteria snacks selection']
    },
    imageUrl: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'clinic-skin-eye-narela',
    name: 'Skin & Eye Care Laser Centre, Narela',
    lat: 28.8402,
    lng: 77.0945,
    address: 'Main Chowk, Narela, Delhi 110040',
    rating: 4.5,
    reviewsCount: 90,
    specializations: ['Dermatology', 'Ophthalmology'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 1, available: 1 },
      general: { total: 3, available: 1 }
    },
    doctors: [
      { id: 'doc-48', name: 'Dr. Vivek Sareen', specialization: 'Dermatology', available: true, statusText: 'Available' },
      { id: 'doc-49', name: 'Dr. Amit Mangla', specialization: 'Ophthalmology', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 1,
      waitTimeMinutes: 8,
      currentToken: 'SEC-090',
      patients: [
        { token: 'SEC-91', name: 'Deepak Sen', urgency: 'Medium', ahead: 1 }
      ]
    },
    departmentQueues: {
      'Dermatology': {
        length: 3,
        waitTimeMinutes: 28,
        currentToken: 'DER-133',
        patients: [
            { token: 'DER-134', name: 'Sachin Tendulkar', urgency: 'Medium', ahead: 1 },
            { token: 'DER-135', name: 'Divya Sharma', urgency: 'Low', ahead: 2 },
            { token: 'DER-136', name: 'Harish Goel', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Ophthalmology': {
        length: 2,
        waitTimeMinutes: 21,
        currentToken: 'OPH-253',
        patients: [
            { token: 'OPH-254', name: 'Vikram Malhotra', urgency: 'Medium', ahead: 1 },
            { token: 'OPH-255', name: 'Kiran Devi', urgency: 'Medium', ahead: 2 }
        ]
      }
    },
    costs: {
      consultation: 500,
      estDiagnostics: 700,
      estMedicines: 350
    },
    reviewSummary: {
      summary: 'Excellent outpatient laser center for skincare diagnostics and ophthalmological prescriptions. Low crowd congestion and quick billing checks.',
      positive: ['Short waiting periods', 'Highly accurate prescriptions', 'Polite helpdesk'],
      negative: ['No critical trauma wing', 'Small waiting cabin space']
    },
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'hosp-agrasen-punjabi',
    name: 'Maharaja Agrasen Hospital, Punjabi Bagh',
    lat: 28.6650,
    lng: 77.1240,
    address: 'Road No. 35, Punjabi Bagh, New Delhi, Delhi 110026',
    rating: 4.6,
    reviewsCount: 2150,
    specializations: ['Cardiology', 'Gynaecology', 'Pediatrics', 'Dentistry', 'Dermatology', 'Emergency Medicine'],
    facilities: ['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT'],
    beds: {
      icu: { total: 35, available: 5 },
      emergency: { total: 20, available: 4 },
      general: { total: 150, available: 25 }
    },
    doctors: [
      { id: 'doc-50', name: 'Dr. Sandeep Kler', specialization: 'Cardiology', available: true, statusText: 'Available' },
      { id: 'doc-51', name: 'Dr. Meenu Sareen', specialization: 'Gynaecology', available: true, statusText: 'Available' },
      { id: 'doc-52', name: 'Dr. Alok Goel', specialization: 'Dentistry', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 5,
      waitTimeMinutes: 24,
      currentToken: 'MAH-401',
      patients: [
        { token: 'MAH-402', name: 'Divya Sharma', urgency: 'High', ahead: 1 },
        { token: 'MAH-403', name: 'Pooja Patel', urgency: 'Medium', ahead: 2 },
        { token: 'MAH-404', name: 'Aditya Sen', urgency: 'High', ahead: 3 },
        { token: 'MAH-405', name: 'Arjun Singh', urgency: 'Low', ahead: 4 }
      ]
    },
    departmentQueues: {
      'Cardiology': {
        length: 4,
        waitTimeMinutes: 37,
        currentToken: 'CAR-154',
        patients: [
            { token: 'CAR-155', name: 'Pankaj Tripathi', urgency: 'Medium', ahead: 1 },
            { token: 'CAR-156', name: 'Vikram Malhotra', urgency: 'High', ahead: 2 },
            { token: 'CAR-157', name: 'Kapil Dev', urgency: 'Low', ahead: 3 }
        ]
      },
      'Gynaecology': {
        length: 4,
        waitTimeMinutes: 38,
        currentToken: 'GYN-183',
        patients: [
            { token: 'GYN-184', name: 'Deepika Padukone', urgency: 'Medium', ahead: 1 },
            { token: 'GYN-185', name: 'Rajesh Mehra', urgency: 'High', ahead: 2 },
            { token: 'GYN-186', name: 'Meena Rani', urgency: 'Low', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 3,
        waitTimeMinutes: 26,
        currentToken: 'PED-299',
        patients: [
            { token: 'PED-300', name: 'Deepak Sen', urgency: 'High', ahead: 1 },
            { token: 'PED-301', name: 'Sanjay Joshi', urgency: 'Medium', ahead: 2 },
            { token: 'PED-302', name: 'Karan Johar', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Dentistry': {
        length: 2,
        waitTimeMinutes: 19,
        currentToken: 'DEN-241',
        patients: [
            { token: 'DEN-242', name: 'Sanjay Joshi', urgency: 'High', ahead: 1 },
            { token: 'DEN-243', name: 'Arjun Singh', urgency: 'Medium', ahead: 2 }
        ]
      },
      'Dermatology': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'DER-243',
        patients: [
            { token: 'DER-244', name: 'Deepak Sen', urgency: 'Low', ahead: 1 }
        ]
      },
      'Emergency Medicine': {
        length: 14,
        waitTimeMinutes: 62,
        currentToken: 'EME-143',
        patients: [
            { token: 'EME-144', name: 'Ritu Kapoor', urgency: 'Low', ahead: 1 },
            { token: 'EME-145', name: 'Divya Sharma', urgency: 'Medium', ahead: 2 },
            { token: 'EME-146', name: 'Kiran Devi', urgency: 'Low', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 800,
      estDiagnostics: 1800,
      estMedicines: 850
    },
    reviewSummary: {
      summary: 'Renowned multi-specialty institute serving West and North Delhi. Famed for diverse out-patient clinics and prompt trauma responses. Heavy rush on peak hours.',
      positive: ['Complete scan suites', 'Experienced department heads', 'Spacious private rooms'],
      negative: ['OPD queue processing slow', 'Expensive medicine wing', 'Crowded lobby lobby']
    },
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'clinic-narela-family',
    name: 'Narela Family Clinic & Diagnostics',
    lat: 28.8450,
    lng: 77.1010,
    address: 'Pocket 3, Sector A-6, Narela, Delhi 110040',
    rating: 4.4,
    reviewsCount: 110,
    specializations: ['General Medicine', 'Pediatrics'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 2, available: 1 },
      general: { total: 8, available: 3 }
    },
    doctors: [
      { id: 'doc-39', name: 'Dr. Vipin Goel', specialization: 'General Medicine', available: true, statusText: 'Available' },
      { id: 'doc-40', name: 'Dr. Anita Sharma', specialization: 'Pediatrics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 2,
      waitTimeMinutes: 10,
      currentToken: 'NFC-012',
      patients: [
        { token: 'NFC-13', name: 'Deepika Padukone', urgency: 'Low', ahead: 1 },
        { token: 'NFC-14', name: 'Neha Aggarwal', urgency: 'Medium', ahead: 2 }
      ]
    },
    departmentQueues: {
      'General Medicine': {
        length: 24,
        waitTimeMinutes: 102,
        currentToken: 'GEN-134',
        patients: [
            { token: 'GEN-135', name: 'Kiran Devi', urgency: 'Low', ahead: 1 },
            { token: 'GEN-136', name: 'Sachin Tendulkar', urgency: 'Medium', ahead: 2 },
            { token: 'GEN-137', name: 'Deepika Padukone', urgency: 'Medium', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 4,
        waitTimeMinutes: 34,
        currentToken: 'PED-164',
        patients: [
            { token: 'PED-165', name: 'Vikram Malhotra', urgency: 'Low', ahead: 1 },
            { token: 'PED-166', name: 'Rajesh Mehra', urgency: 'Low', ahead: 2 },
            { token: 'PED-167', name: 'Manpreet Singh', urgency: 'Medium', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 300,
      estDiagnostics: 400,
      estMedicines: 250
    },
    reviewSummary: {
      summary: 'Great local clinic in Narela sector A-6. Extremely quick turnaround time and helpful consulting doctors. Limited to non-critical care.',
      positive: ['Affordable fees', 'Zero waiting times', 'Helpful diagnostics desk'],
      negative: ['No ICU beds', 'Limited emergency ward space']
    },
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'clinic-bawana-medical',
    name: 'Bawana Medical & Maternity Centre',
    lat: 28.7980,
    lng: 77.0450,
    address: 'Main Bawana Road, Sector 1, Bawana, Delhi 110039',
    rating: 4.3,
    reviewsCount: 95,
    specializations: ['General Medicine', 'Pediatrics', 'Orthopedics'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 3, available: 2 },
      general: { total: 10, available: 4 }
    },
    doctors: [
      { id: 'doc-41', name: 'Dr. Manoj Varma', specialization: 'General Medicine', available: true, statusText: 'Available' },
      { id: 'doc-42', name: 'Dr. Seema Gupta', specialization: 'Pediatrics', available: true, statusText: 'Consulting' }
    ],
        queue: {
      length: 3,
      waitTimeMinutes: 15,
      currentToken: 'BMC-089',
      patients: [
        { token: 'BMC-90', name: 'Aarav Tyagi', urgency: 'High', ahead: 1 },
        { token: 'BMC-91', name: 'Harish Goel', urgency: 'Medium', ahead: 2 },
        { token: 'BMC-92', name: 'Manpreet Singh', urgency: 'High', ahead: 3 }
      ]
    },
    departmentQueues: {
      'General Medicine': {
        length: 19,
        waitTimeMinutes: 81,
        currentToken: 'GEN-216',
        patients: [
            { token: 'GEN-217', name: 'Suresh Kumar', urgency: 'High', ahead: 1 },
            { token: 'GEN-218', name: 'Aditya Sen', urgency: 'High', ahead: 2 },
            { token: 'GEN-219', name: 'Kapil Dev', urgency: 'High', ahead: 3 }
        ]
      },
      'Pediatrics': {
        length: 2,
        waitTimeMinutes: 22,
        currentToken: 'PED-281',
        patients: [
            { token: 'PED-282', name: 'Karan Johar', urgency: 'Medium', ahead: 1 },
            { token: 'PED-283', name: 'Manpreet Singh', urgency: 'High', ahead: 2 }
        ]
      },
      'Orthopedics': {
        length: 1,
        waitTimeMinutes: 12,
        currentToken: 'ORT-254',
        patients: [
            { token: 'ORT-255', name: 'Rajesh Mehra', urgency: 'Medium', ahead: 1 }
        ]
      }
    },
    costs: {
      consultation: 400,
      estDiagnostics: 500,
      estMedicines: 300
    },
    reviewSummary: {
      summary: 'Main medical clinic serving the Bawana cluster area. Fast check-ins for cold/cough, fever, and minor cuts. No specialized neurology or oncology support.',
      positive: ['Courteous doctor consultations', 'Quick pharmacy counter', 'Clean dressing room'],
      negative: ['No critical care equipment', 'Parking gets blocked easily']
    },
    imageUrl: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  },
  {
    id: 'clinic-aggarwal-narela',
    name: 'Aggarwal Clinic & Child Care',
    lat: 28.8415,
    lng: 77.0965,
    address: 'Shop No. 12, Main Bawana Road, Narela, Delhi 110040',
    rating: 4.5,
    reviewsCount: 140,
    specializations: ['Pediatrics', 'General Medicine'],
    facilities: ['General Ward'],
    beds: {
      icu: { total: 0, available: 0 },
      emergency: { total: 1, available: 1 },
      general: { total: 5, available: 2 }
    },
    doctors: [
      { id: 'doc-43', name: 'Dr. K.K. Aggarwal', specialization: 'Pediatrics', available: true, statusText: 'Available' }
    ],
        queue: {
      length: 1,
      waitTimeMinutes: 8,
      currentToken: 'ACC-004',
      patients: [
        { token: 'ACC-5', name: 'Vikram Malhotra', urgency: 'High', ahead: 1 }
      ]
    },
    departmentQueues: {
      'Pediatrics': {
        length: 3,
        waitTimeMinutes: 26,
        currentToken: 'PED-196',
        patients: [
            { token: 'PED-197', name: 'Sachin Tendulkar', urgency: 'Low', ahead: 1 },
            { token: 'PED-198', name: 'Rajesh Mehra', urgency: 'Low', ahead: 2 },
            { token: 'PED-199', name: 'Ritu Kapoor', urgency: 'High', ahead: 3 }
        ]
      },
      'General Medicine': {
        length: 28,
        waitTimeMinutes: 117,
        currentToken: 'GEN-270',
        patients: [
            { token: 'GEN-271', name: 'Karan Johar', urgency: 'Medium', ahead: 1 },
            { token: 'GEN-272', name: 'Arjun Singh', urgency: 'Low', ahead: 2 },
            { token: 'GEN-273', name: 'Kriti Jain', urgency: 'High', ahead: 3 }
        ]
      }
    },
    costs: {
      consultation: 350,
      estDiagnostics: 300,
      estMedicines: 200
    },
    reviewSummary: {
      summary: 'Very popular pediatrician and family practitioner on main Bawana Road. Extremely short waiting lines and friendly checkup atmosphere.',
      positive: ['Outstanding pediatric care', 'Very friendly doctor', 'Extremely low waiting lines'],
      negative: ['Small pharmacy inventory', 'No emergency operations support']
    },
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60',
    isClinic: true
  }
];

export const MOCK_USER_COORDINATES = {
  lat: 28.8430,
  lng: 77.0920
};
