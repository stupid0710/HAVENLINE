'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hospital, Appointment, PatientProfile, INITIAL_HOSPITALS, MOCK_USER_COORDINATES } from '../lib/mockDatabase';
import { localTriageSymptoms } from '../lib/aiEngine';

export interface TriageResult {
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  explanation: string;
  confidenceScore: number;
  symptoms: string;
  suggestedTests: string[];
  doctorQuestions: string[];
}

interface HavenlineContextType {
  hospitals: Hospital[];
  appointments: Appointment[];
  currentPatient: PatientProfile | null;
  activeAppointment: Appointment | null;
  triageResult: TriageResult | null;
  userLocation: { lat: number; lng: number };
  setPatientProfile: (profile: PatientProfile) => void;
  setTriageResult: (result: TriageResult | null) => void;
  bookAppointment: (
    hospitalId: string,
    doctorName: string,
    timeSlot: string,
    department: string,
    urgency: Appointment['urgency'],
    symptoms: string,
    clinicalSummary?: string,
    suggestedTests?: string[],
    doctorQuestions?: string[],
    email?: string,
    googleAccessToken?: string
  ) => Promise<{ success: boolean; appointment?: Appointment; error?: string; recommendedSlots?: string[] }>;
  cancelAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateBeds: (hospitalId: string, category: 'icu' | 'emergency' | 'general', increment: boolean) => void;
  resetAll: () => void;
}

const HavenlineContext = createContext<HavenlineContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HOSPITALS: 'havenline_hospitals',
  APPOINTMENTS: 'havenline_appointments',
  PATIENT: 'havenline_patient',
  ACTIVE_APPT: 'havenline_active_appt',
  TRIAGE: 'havenline_triage'
};

export const HavenlineProvider = ({ children }: { children: ReactNode }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [triageResult, setTriageResultState] = useState<TriageResult | null>(null);
  const [userLocation, setUserLocation] = useState(MOCK_USER_COORDINATES);

  // Live browser geolocation check
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        console.warn(`[Havenline Geolocation] Active device coordinates retrieved: ${latitude}, ${longitude}`);
      },
      (err) => {
        console.warn('[Havenline Geolocation] Live access check bypassed/denied. Falling back to default mock location:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Initialize state from LocalStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload 3 demo users and prescription histories if not present in storage
    const savedUsersStr = localStorage.getItem('havenline_saved_users');
    if (!savedUsersStr) {
      const demoUsers = [
        {
          name: 'Aarav Tyagi',
          phone: '9876543211',
          age: 34,
          gender: 'Male',
          medicalHistory: ['Hypertension', 'Diabetes'],
          emergencyContact: { name: 'Karan Tyagi', phone: '9876543219', relationship: 'Brother' }
        },
        {
          name: 'Neha Aggarwal',
          phone: '9876543212',
          age: 29,
          gender: 'Female',
          medicalHistory: ['Asthma / COPD'],
          emergencyContact: { name: 'Sanjay Aggarwal', phone: '9876543218', relationship: 'Father' }
        },
        {
          name: 'Rohan Das',
          phone: '9876543213',
          age: 42,
          gender: 'Male',
          medicalHistory: ['Ischemic Heart Disease'],
          emergencyContact: { name: 'Seema Das', phone: '9876543217', relationship: 'Spouse' }
        }
      ];
      localStorage.setItem('havenline_saved_users', JSON.stringify(demoUsers));
    }

    const savedPrescriptionsStr = localStorage.getItem('havenline_medicine_history');
    if (!savedPrescriptionsStr) {
      const demoPrescriptions = [
        {
          id: 'rx-1',
          phone: '9876543211',
          patientName: 'Aarav Tyagi',
          doctorName: 'Dr. Ashok Seth',
          department: 'Cardiology',
          date: '2026-02-15T10:30:00Z',
          medicines: [
            { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (Morning, before food)', duration: '30 Days', instructions: 'Monitor blood pressure daily. Report ankle swelling.' },
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily (After lunch & dinner)', duration: '15 Days', instructions: 'Avoid sugary carbonated drinks.' }
          ]
        },
        {
          id: 'rx-2',
          phone: '9876543212',
          patientName: 'Neha Aggarwal',
          doctorName: 'Dr. N.P. Singh',
          department: 'Pulmonology',
          date: '2026-03-10T14:15:00Z',
          medicines: [
            { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily (Night, before sleeping)', duration: '10 Days', instructions: 'Take at the same time each night.' },
            { name: 'Albuterol Inhaler', dosage: '100mcg', frequency: '2 Puffs every 4-6 hours (As needed)', duration: '30 Days', instructions: 'Rinse mouth thoroughly with warm water after each use.' }
          ]
        },
        {
          id: 'rx-3',
          phone: '9876543213',
          patientName: 'Rohan Das',
          doctorName: 'Dr. Sandeep Kler',
          department: 'Cardiology',
          date: '2026-04-22T09:00:00Z',
          medicines: [
            { name: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily (After food)', duration: '30 Days', instructions: 'Report any unusual nosebleeds or bleeding gums immediately.' },
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (Night, after food)', duration: '30 Days', instructions: 'Avoid grapefruit juice and high-cholesterol meals.' }
          ]
        }
      ];
      localStorage.setItem('havenline_medicine_history', JSON.stringify(demoPrescriptions));
    }

    const savedRecordsStr = localStorage.getItem('havenline_medical_records');
    if (!savedRecordsStr) {
      const demoRecords = [
        {
          id: 'rec-1',
          phone: '9876543211',
          title: 'Lipid Profile Lab Report',
          lab: 'Apollo Health Diagnostics',
          date: '2026-02-14',
          fileName: 'lipid_profile_aarav.pdf',
          fileSize: '42 KB',
          fileData: 'data:text/plain;base64,SEFWRU5MSU5FIFNFQ1VSRSBDTElOSUNBTCBSRUNPUkQgLSBBQVJBViBUWUFHSSAtIExJUElEIFBST0ZJTEUgLSBDT05GSVJNRUQ='
        },
        {
          id: 'rec-2',
          phone: '9876543212',
          title: 'Pulmonary Function Test (PFT)',
          lab: 'Max Labs Shalimar Bagh',
          date: '2026-03-09',
          fileName: 'pft_report_neha.pdf',
          fileSize: '65 KB',
          fileData: 'data:text/plain;base64,SEFWRU5MSU5FIFNFQ1VSRSBDTElOSUNBTCBSRUNPUkQgLSBORUhBIEFHR0FSV0FMIC0gUFVMTU9OQVJZIEZVTkNUSU9OIFRFU1QgLSBDT05GSVJNRUQ='
        },
        {
          id: 'rec-3',
          phone: '9876543213',
          title: 'Electrocardiogram (ECG) Scan',
          lab: 'Medanta Scans Gurugram',
          date: '2026-04-21',
          fileName: 'ecg_scan_rohan.pdf',
          fileSize: '128 KB',
          fileData: 'data:text/plain;base64,SEFWRU5MSU5FIFNFQ1VSRSBDTElOSUNBTCBSRUNPUkQgLSBSR0hBTiBEQVMgLSBFQ0cgR1JJRCBTQ0FOIC0gQ09ORklSTUVECg=='
        }
      ];
      localStorage.setItem('havenline_medical_records', JSON.stringify(demoRecords));
    }

    const storedHosp = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    if (storedHosp) {
      try {
        const parsed = JSON.parse(storedHosp);
        // Calculate total patients in INITIAL_HOSPITALS vs parsed storage
        const initialTotalPatients = INITIAL_HOSPITALS.reduce((acc, h) => acc + (h.queue.patients?.length || 0), 0);
        const parsedTotalPatients = Array.isArray(parsed) 
          ? parsed.reduce((acc: number, h: any) => acc + (h.queue?.patients?.length || 0), 0)
          : 0;

        // Automatically sync and append if the database is expanded or queue patients are populated
        if (Array.isArray(parsed) && (parsed.length < INITIAL_HOSPITALS.length || parsedTotalPatients < initialTotalPatients)) {
          setHospitals(INITIAL_HOSPITALS);
          localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(INITIAL_HOSPITALS));
        } else {
          setHospitals(parsed);
        }
      } catch (e) {
        setHospitals(INITIAL_HOSPITALS);
        localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(INITIAL_HOSPITALS));
      }
    } else {
      setHospitals(INITIAL_HOSPITALS);
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(INITIAL_HOSPITALS));
    }

    const storedAppts = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (storedAppts) {
      setAppointments(JSON.parse(storedAppts));
    } else {
      setAppointments(MOCK_INITIAL_APPOINTMENTS);
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(MOCK_INITIAL_APPOINTMENTS));
    }

    const storedPatient = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (storedPatient) {
      setCurrentPatient(JSON.parse(storedPatient));
    }

    const storedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_APPT);
    if (storedActive) {
      setActiveAppointment(JSON.parse(storedActive));
    }

    const storedTriage = localStorage.getItem(STORAGE_KEYS.TRIAGE);
    if (storedTriage) {
      setTriageResultState(JSON.parse(storedTriage));
    }

    // Cross-tab syncing listener
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.HOSPITALS && e.newValue) {
        setHospitals(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.APPOINTMENTS && e.newValue) {
        const appts = JSON.parse(e.newValue);
        setAppointments(appts);
        // Sync active appointment status if it changed
        const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_APPT);
        if (savedActive) {
          const parsedActive = JSON.parse(savedActive);
          const currentVersion = appts.find((a: Appointment) => a.id === parsedActive.id);
          if (currentVersion && JSON.stringify(currentVersion) !== JSON.stringify(parsedActive)) {
            setActiveAppointment(currentVersion);
            localStorage.setItem(STORAGE_KEYS.ACTIVE_APPT, JSON.stringify(currentVersion));
          }
        }
      }
      if (e.key === STORAGE_KEYS.PATIENT) {
        setCurrentPatient(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === STORAGE_KEYS.ACTIVE_APPT) {
        setActiveAppointment(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === STORAGE_KEYS.TRIAGE) {
        setTriageResultState(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update helper utility
  const updateHospitalsState = (newHospitals: Hospital[]) => {
    setHospitals(newHospitals);
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(newHospitals));
  };

  const updateAppointmentsState = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(newAppts));
  };

  // Onboarding profile
  const setPatientProfile = (profile: PatientProfile) => {
    setCurrentPatient(profile);
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(profile));
    // Clear previous triage assessment results for the new patient
    setTriageResultState(null);
    localStorage.removeItem(STORAGE_KEYS.TRIAGE);
  };

  // Triage state
  const setTriageResult = (result: TriageResult | null) => {
    setTriageResultState(result);
    if (result) {
      localStorage.setItem(STORAGE_KEYS.TRIAGE, JSON.stringify(result));
    } else {
      localStorage.removeItem(STORAGE_KEYS.TRIAGE);
    }
  };

  // Concurrency-Safe Booking
  const bookAppointment = async (
    hospitalId: string,
    doctorName: string,
    timeSlot: string,
    department: string,
    urgency: Appointment['urgency'],
    symptoms: string,
    clinicalSummary?: string,
    suggestedTests?: string[],
    doctorQuestions?: string[],
    email?: string,
    googleAccessToken?: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string; recommendedSlots?: string[] }> => {
    // Artificial small delay to simulate network latency and test locking collision
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Reload appointments from local storage to check for current database state (avoiding stale tab cache)
    const freshApptsStr = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const freshAppts: Appointment[] = freshApptsStr ? JSON.parse(freshApptsStr) : [];

    // Check if slot is already booked for this doctor at this hospital
    const conflict = freshAppts.find(
      (appt) =>
        appt.hospitalId === hospitalId &&
        appt.doctorName === doctorName &&
        appt.timeSlot === timeSlot &&
        appt.status !== 'Checked Out' &&
        appt.status !== 'Redirected'
    );

    if (conflict) {
      // Recommend alternate slots
      const allSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
      const takenSlots = freshAppts
        .filter((a) => a.hospitalId === hospitalId && a.doctorName === doctorName && a.status !== 'Checked Out')
        .map((a) => a.timeSlot);
      const recommendedSlots = allSlots.filter((slot) => slot !== timeSlot && !takenSlots.includes(slot)).slice(0, 3);

      return {
        success: false,
        error: 'Appointment slot is no longer available.',
        recommendedSlots
      };
    }

    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) {
      return { success: false, error: 'Hospital not found.' };
    }

    // Determine queue positioning details
    const queuePos = hospital.queue.length + 1;
    const token = `${hospital.name.split(' ')[0].substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const waitTime = hospital.queue.waitTimeMinutes + (urgency === 'Critical' ? 5 : 15);

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId,
      hospitalName: hospital.name,
      patientName: currentPatient?.name || 'Guest Patient',
      patientAge: currentPatient?.age || 30,
      patientGender: currentPatient?.gender || 'Male',
      doctorName,
      timeSlot,
      department,
      consultationFee: hospital.costs.consultation,
      queuePosition: queuePos,
      estimatedWaitTime: waitTime,
      token,
      urgency,
      status: 'Pending',
      etaMinutes: 20, // default travel estimate
      symptoms,
      clinicalSummary: clinicalSummary || (symptoms ? localTriageSymptoms(symptoms, currentPatient?.age || 30).explanation : 'Routine assessment summary.'),
      suggestedTests: suggestedTests && suggestedTests.length > 0 ? suggestedTests : (symptoms ? localTriageSymptoms(symptoms, currentPatient?.age || 30).suggestedTests : ['Vital check', 'General physical examination']),
      doctorQuestions: doctorQuestions && doctorQuestions.length > 0 ? doctorQuestions : (symptoms ? localTriageSymptoms(symptoms, currentPatient?.age || 30).doctorQuestions : ['How long have you had this concern?', 'Are you taking any medications?']),
      timestamp: new Date().toISOString(),
      email: email || '',
      preArrivalAlert: urgency === 'Critical',
      patientBloodType: currentPatient?.bloodType || 'B+',
      patientPastDiseases: currentPatient?.medicalHistory && currentPatient.medicalHistory.length > 0 ? currentPatient.medicalHistory : ['None reported'],
      patientMedicines: currentPatient?.medicines && currentPatient.medicines.length > 0 ? currentPatient.medicines : ['No active prescription'],
      patientPhone: currentPatient?.phone || '9999999999'
    };

    // Save appointment
    const updatedAppts = [newAppointment, ...freshAppts];
    updateAppointmentsState(updatedAppts);
    setActiveAppointment(newAppointment);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_APPT, JSON.stringify(newAppointment));

    // Update hospital queue state
    const updatedHospitals = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          queue: {
            ...h.queue,
            length: h.queue.length + 1,
            waitTimeMinutes: waitTime
          }
        };
      }
      return h;
    });
    updateHospitalsState(updatedHospitals);

    // Dispatch email notification receipt asynchronously
    if (email) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, appointment: newAppointment, googleAccessToken })
      }).catch((err) => console.warn('Email dispatch warning:', err));
    }

    return { success: true, appointment: newAppointment };
  };

  const cancelAppointment = (id: string) => {
    const freshApptsStr = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const freshAppts: Appointment[] = freshApptsStr ? JSON.parse(freshApptsStr) : [];
    const appt = freshAppts.find((a) => a.id === id);

    if (!appt) return;

    const updatedAppts = freshAppts.filter((a) => a.id !== id);
    updateAppointmentsState(updatedAppts);

    if (activeAppointment?.id === id) {
      setActiveAppointment(null);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_APPT);
    }

    // Restore hospital queue length
    const updatedHospitals = hospitals.map((h) => {
      if (h.id === appt.hospitalId) {
        return {
          ...h,
          queue: {
            ...h.queue,
            length: Math.max(0, h.queue.length - 1),
            waitTimeMinutes: Math.max(0, h.queue.waitTimeMinutes - 15)
          }
        };
      }
      return h;
    });
    updateHospitalsState(updatedHospitals);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const freshApptsStr = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    const freshAppts: Appointment[] = freshApptsStr ? JSON.parse(freshApptsStr) : [];

    const updatedAppts = freshAppts.map((appt) => {
      if (appt.id === id) {
        const updated = { ...appt, status };
        if (activeAppointment?.id === id) {
          setActiveAppointment(updated);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_APPT, JSON.stringify(updated));
        }
        return updated;
      }
      return appt;
    });

    updateAppointmentsState(updatedAppts);
  };

  const updateBeds = (hospitalId: string, category: 'icu' | 'emergency' | 'general', increment: boolean) => {
    const updatedHospitals = hospitals.map((h) => {
      if (h.id === hospitalId) {
        const current = h.beds[category];
        const val = increment
          ? Math.min(current.total, current.available + 1)
          : Math.max(0, current.available - 1);
        return {
          ...h,
          beds: {
            ...h.beds,
            [category]: { ...current, available: val }
          }
        };
      }
      return h;
    });
    updateHospitalsState(updatedHospitals);
  };

  const resetAll = () => {
    setAppointments(MOCK_INITIAL_APPOINTMENTS);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(MOCK_INITIAL_APPOINTMENTS));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_APPT);
    localStorage.removeItem(STORAGE_KEYS.TRIAGE);
    setActiveAppointment(null);
    setTriageResultState(null);
    updateHospitalsState(INITIAL_HOSPITALS);
  };

  // Queue Ticking Simulation (runs every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals((prevHospitals) => {
        if (prevHospitals.length === 0) return prevHospitals;

        const updated = prevHospitals.map((h) => {
          // Dynamic queue ticking simulation
          // 20% chance queue ticks down
          const queueDecrease = Math.random() > 0.8 && h.queue.length > 0;
          const newLength = queueDecrease ? h.queue.length - 1 : h.queue.length;
          const newTime = queueDecrease
            ? Math.max(0, h.queue.waitTimeMinutes - Math.floor(10 + Math.random() * 10))
            : h.queue.waitTimeMinutes;

          return {
            ...h,
            queue: {
              ...h.queue,
              length: newLength,
              waitTimeMinutes: newTime
            }
          };
        });

        localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(updated));
        return updated;
      });

      // Update active appointment queue timing
      setActiveAppointment((prevActive) => {
        if (!prevActive || prevActive.status !== 'Pending') return prevActive;

        // Reduce wait time slowly
        const nextWait = Math.max(0, prevActive.estimatedWaitTime - 1);
        // Decrease position by 1 if position > 1 (25% chance of progress per tick)
        const shouldProgress = Math.random() > 0.75 && prevActive.queuePosition > 1;
        const nextPos = shouldProgress ? prevActive.queuePosition - 1 : prevActive.queuePosition;

        const updatedActive: Appointment = {
          ...prevActive,
          estimatedWaitTime: nextWait,
          queuePosition: nextPos
        };

        // If wait time is 0 or position is 1, let's flag as "You are next" equivalent
        localStorage.setItem(STORAGE_KEYS.ACTIVE_APPT, JSON.stringify(updatedActive));

        // Sync back into appointments list
        setAppointments((prevAppts) => {
          const fresh = prevAppts.map((a) => (a.id === prevActive.id ? updatedActive : a));
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(fresh));
          return fresh;
        });

        return updatedActive;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [hospitals.length]);

  return (
    <HavenlineContext.Provider
      value={{
        hospitals,
        appointments,
        currentPatient,
        activeAppointment,
        triageResult,
        userLocation,
        setPatientProfile,
        setTriageResult,
        bookAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        updateBeds,
        resetAll
      }}
    >
      {children}
    </HavenlineContext.Provider>
  );
};

export const useHavenline = () => {
  const context = useContext(HavenlineContext);
  if (!context) {
    throw new Error('useHavenline must be used within a HavenlineProvider');
  }
  return context;
};

const MOCK_INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-seed-1',
    hospitalId: 'Max-01',
    hospitalName: 'Max Super Specialty Hospital',
    patientName: 'Rohan Sharma',
    patientAge: 45,
    patientGender: 'Male',
    doctorName: 'Dr. Ashok Seth',
    timeSlot: '11:00 AM',
    department: 'Cardiology',
    consultationFee: 800,
    queuePosition: 1,
    estimatedWaitTime: 15,
    token: 'MA-283',
    urgency: 'High',
    status: 'Pending',
    etaMinutes: 12,
    symptoms: 'Mild chest pain and shortness of breath after climbing stairs',
    clinicalSummary: 'Patient presents with angina-like symptoms. History of hypertension. Requires troponin levels and ECG checks.',
    suggestedTests: ['Electrocardiogram (ECG)', 'Troponin blood test', 'Echocardiogram'],
    doctorQuestions: ['Does the pain radiate to your left shoulder?', 'Have you had high blood pressure before?'],
    timestamp: new Date().toISOString(),
    preArrivalAlert: false,
    patientBloodType: 'O+',
    patientPastDiseases: ['Hypertension', 'Hyperlipidemia'],
    patientMedicines: ['Amlodipine 5mg', 'Atorvastatin 10mg'],
    patientPhone: '9999999999'
  },
  {
    id: 'appt-seed-2',
    hospitalId: 'Max-01',
    hospitalName: 'Max Super Specialty Hospital',
    patientName: 'Priya Verma',
    patientAge: 28,
    patientGender: 'Female',
    doctorName: 'Dr. Sandeep Vaishya',
    timeSlot: '02:00 PM',
    department: 'Neurology',
    consultationFee: 800,
    queuePosition: 2,
    estimatedWaitTime: 30,
    token: 'MA-492',
    urgency: 'Medium',
    status: 'Pending',
    etaMinutes: 25,
    symptoms: 'Migraine with aura, nausea, and sensitivity to light',
    clinicalSummary: 'Patient reports throbbing headaches twice a week. Aura started 30 mins ago. Rule out stroke.',
    suggestedTests: ['Brain MRI', 'Eye checkup', 'Blood count'],
    doctorQuestions: ['Have you experienced any numbness or face drooping?', 'What medicines do you take for pain?'],
    timestamp: new Date().toISOString(),
    preArrivalAlert: false,
    patientBloodType: 'A-',
    patientPastDiseases: ['Asthma'],
    patientMedicines: ['Albuterol inhaler'],
    patientPhone: '9999999999'
  },
  {
    id: 'appt-seed-3',
    hospitalId: 'For-02',
    hospitalName: 'Fortis Hospital',
    patientName: 'Amit Patel',
    patientAge: 52,
    patientGender: 'Male',
    doctorName: 'Dr. Ashok Rajgopal',
    timeSlot: '12:00 PM',
    department: 'Orthopedics',
    consultationFee: 750,
    queuePosition: 1,
    estimatedWaitTime: 10,
    token: 'FO-983',
    urgency: 'Critical',
    status: 'Pending',
    etaMinutes: 8,
    symptoms: 'Severe accident injury, open leg fracture, active bleeding',
    clinicalSummary: 'Motor vehicle accident victim. Open tibia fracture. High risk of shock and infection. Prepare trauma specialist and ICU bed.',
    suggestedTests: ['Trauma CT Scan', 'Leg X-Ray', 'Blood cross-match'],
    doctorQuestions: ['Is the patient responsive?', 'How much blood was lost?'],
    timestamp: new Date().toISOString(),
    preArrivalAlert: true,
    patientBloodType: 'O-',
    patientPastDiseases: ['Type 2 Diabetes', 'Chronic Kidney Disease'],
    patientMedicines: ['Metformin 500mg', 'Lisinopril 10mg'],
    patientPhone: '9999999999'
  },
  {
    id: 'appt-seed-4',
    hospitalId: 'For-02',
    hospitalName: 'Fortis Hospital',
    patientName: 'Karan Malhotra',
    patientAge: 35,
    patientGender: 'Male',
    doctorName: 'Dr. T.S. Kler',
    timeSlot: '10:00 AM',
    department: 'Cardiology',
    consultationFee: 750,
    queuePosition: 2,
    estimatedWaitTime: 20,
    token: 'FO-122',
    urgency: 'High',
    status: 'Admitted',
    etaMinutes: 0,
    symptoms: 'Palpitations, racing heartbeat, lightheadedness',
    clinicalSummary: 'Admitted for cardiac arrhythmia monitoring. History of tachycardia.',
    suggestedTests: ['Holter Monitor', 'ECG', 'Thyroid panel'],
    doctorQuestions: ['How long does the racing sensation last?', 'Have you consumed excess caffeine?'],
    timestamp: new Date().toISOString(),
    preArrivalAlert: false,
    patientBloodType: 'B+',
    patientPastDiseases: ['Anxiety', 'Tachycardia'],
    patientMedicines: ['Metoprolol 25mg'],
    patientPhone: '9999999999'
  },
  {
    id: 'appt-seed-5',
    hospitalId: 'Med-03',
    hospitalName: 'Medanta The Medicity',
    patientName: 'Sunita Devi',
    patientAge: 61,
    patientGender: 'Female',
    doctorName: 'Dr. Naresh Trehan',
    timeSlot: '09:00 AM',
    department: 'Cardiology',
    consultationFee: 900,
    queuePosition: 1,
    estimatedWaitTime: 15,
    token: 'ME-872',
    urgency: 'Critical',
    status: 'Pending',
    etaMinutes: 14,
    symptoms: 'Sudden severe chest tightness, sweating, cold skin',
    clinicalSummary: 'Suspected acute myocardial infarction. preArrivalAlert activated. Cardiac specialist notified to prep Cath Lab.',
    suggestedTests: ['Urgent ECG', 'Troponin I check', 'Coronary Angiogram'],
    doctorQuestions: ['Is there radiation of pain to jaw/arm?', 'When did the cold sweat begin?'],
    timestamp: new Date().toISOString(),
    preArrivalAlert: true,
    patientBloodType: 'AB+',
    patientPastDiseases: ['Type 2 Diabetes', 'Coronary Artery Disease'],
    patientMedicines: ['Metformin 1000mg', 'Aspirin 81mg', 'Atorvastatin 40mg'],
    patientPhone: '9999999999'
  }
];
