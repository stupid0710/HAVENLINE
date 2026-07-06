'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useHavenline } from '../../context/HavenlineContext';
import { Hospital, Appointment, Doctor } from '../../lib/mockDatabase';
import { 
  Heart, 
  Activity, 
  Users, 
  Bed, 
  Bell, 
  Check, 
  UserMinus, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Sliders,
  AlertTriangle,
  Stethoscope,
  FileText
} from 'lucide-react';

const playChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.error('Audio chime failed:', e);
  }
};

export default function HospitalDashboard() {
  const { 
    hospitals, 
    appointments, 
    updateAppointmentStatus, 
    updateBeds,
    resetAll
  } = useHavenline();

  const [activeHospitalId, setActiveHospitalId] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'queue' | 'beds' | 'staff'>('appointments');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedPatientForAI, setSelectedPatientForAI] = useState<Appointment | null>(null);

  // Digital Prescription Dispatcher States
  const [rightPanelTab, setRightPanelTab] = useState<'diagnosis' | 'prescription'>('diagnosis');
  const [rxMedicines, setRxMedicines] = useState<{name: string, dosage: string, frequency: string, duration: string, instructions: string}[]>([]);
  const [rxLifestyle, setRxLifestyle] = useState('');
  const [rxFollowUp, setRxFollowUp] = useState('');
  const [rxLoading, setRxLoading] = useState(false);

  // Hospital authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginHospitalId, setLoginHospitalId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Duty Emergency Physician');
  const [loginError, setLoginError] = useState('');

  // Clear prescription fields when selected patient changes
  useEffect(() => {
    setRightPanelTab('diagnosis');
    setRxMedicines([]);
    setRxLifestyle('');
    setRxFollowUp('');
  }, [selectedPatientForAI]);

  // Maintain reference count to detect new appointments bookings
  const prevAppointmentsLength = useRef(0);

  // Load login state on mount
  useEffect(() => {
    const storedLogin = localStorage.getItem('havenline_admin_login');
    if (storedLogin) {
      const parsed = JSON.parse(storedLogin);
      setIsLoggedIn(parsed.isLoggedIn);
      setLoginHospitalId(parsed.loginHospitalId);
      setActiveHospitalId(parsed.loginHospitalId);
      setLoginRole(parsed.loginRole || 'Duty Emergency Physician');
    }
  }, []);

  // Set default active hospital on load
  useEffect(() => {
    if (hospitals.length > 0 && !loginHospitalId) {
      setLoginHospitalId(hospitals[0].id);
    }
  }, [hospitals, loginHospitalId]);

  // Sync reference count & trigger live sync chime/toast on new bookings
  useEffect(() => {
    if (!activeHospitalId) return;

    // Check if new booking was appended
    if (appointments.length > prevAppointmentsLength.current && prevAppointmentsLength.current > 0) {
      const newest = appointments[0]; // newest is unshifted to front
      if (newest && newest.hospitalId === activeHospitalId) {
        setToastMessage(`🚨 New Triage Booking: ${newest.patientName} (${newest.urgency})`);
        playChime();
        // Clear toast after 4s
        setTimeout(() => setToastMessage(''), 4000);
      }
    }
    prevAppointmentsLength.current = appointments.length;
  }, [appointments, activeHospitalId]);

  const performLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginHospitalId) {
      setLoginError('Please select a hospital.');
      return;
    }
    if (loginPassword.trim() === '') {
      setLoginError('Authentication key / password is required.');
      return;
    }

    setIsLoggedIn(true);
    setActiveHospitalId(loginHospitalId);
    localStorage.setItem('havenline_admin_login', JSON.stringify({
      isLoggedIn: true,
      loginHospitalId,
      loginRole
    }));
    setLoginError('');
  };

  const performLogout = () => {
    setIsLoggedIn(false);
    setLoginPassword('');
    localStorage.removeItem('havenline_admin_login');
  };

  const handleAutoPrefillRx = async () => {
    if (!selectedPatientForAI) return;
    setRxLoading(true);
    try {
      const res = await fetch('/api/generate-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedPatientForAI.symptoms,
          clinicalSummary: selectedPatientForAI.clinicalSummary || '',
          age: selectedPatientForAI.patientAge,
          gender: selectedPatientForAI.patientGender
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRxMedicines(data.medicines || []);
        setRxLifestyle(data.lifestyleAdvice || '');
        setRxFollowUp(data.followUp || '');
      }
    } catch (e) {
      console.error('Failed to prefill Rx:', e);
    } finally {
      setRxLoading(false);
    }
  };

  const handleDispatchRx = async () => {
    if (!selectedPatientForAI) return;
    
    // Save to havenline_medicine_history in localStorage
    const storedHistoryStr = localStorage.getItem('havenline_medicine_history');
    let historyList: any[] = [];
    if (storedHistoryStr) {
      try { historyList = JSON.parse(storedHistoryStr); } catch (e) {}
    }

    const patientPhone = selectedPatientForAI.patientPhone || '9999999999';

    const newRx = {
      id: `rx-${Date.now()}`,
      phone: patientPhone,
      patientName: selectedPatientForAI.patientName,
      doctorName: selectedPatientForAI.doctorName || 'Duty Clinician',
      department: selectedPatientForAI.department || 'General Medicine',
      date: new Date().toISOString(),
      medicines: rxMedicines,
      lifestyleAdvice: rxLifestyle,
      followUp: rxFollowUp
    };

    historyList.unshift(newRx);
    localStorage.setItem('havenline_medicine_history', JSON.stringify(historyList));

    // Also dispatch email if they entered one when booking!
    if (selectedPatientForAI.email) {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedPatientForAI.email,
            token: selectedPatientForAI.token,
            subject: `Havenline Consultation Summary & Prescription - ${selectedPatientForAI.token}`,
            htmlContent: `
              <div style="font-family: monospace; padding: 20px; background: #060a08; color: #fff; border: 1px solid #10b981; border-radius: 12px; max-width: 500px;">
                <h2 style="color: #10b981; text-transform: uppercase;">Havenline Core Discharge</h2>
                <p>Dear ${selectedPatientForAI.patientName},</p>
                <p>Your consultation at <b>${activeHospital?.name || 'Havenline Node'}</b> is complete.</p>
                <hr style="border-color: #111827;" />
                <h3>Digital Prescription Schedule:</h3>
                ${rxMedicines.map(m => `
                  <p><b>• ${m.name}</b> (${m.dosage}) - ${m.frequency} for ${m.duration}<br/>
                  <span style="color: #888;">Instructions: ${m.instructions}</span></p>
                `).join('')}
                <hr style="border-color: #111827;" />
                <p><b>Lifestyle Advice:</b> ${rxLifestyle}</p>
                <p><b>Follow-up:</b> ${rxFollowUp}</p>
                <p style="font-size: 10px; color: #666;">Generated securely via Havenline AI Physician Assistant.</p>
              </div>
            `
          })
        });
      } catch (e) {
        console.error('Failed to send Rx dispatch email:', e);
      }
    }

    // Mark patient as checked out
    updateAppointmentStatus(selectedPatientForAI.id, 'Checked Out');
    setToastMessage(`✅ Digital Rx Dispatched to ${selectedPatientForAI.patientName}!`);
    setSelectedPatientForAI(null);
  };

  const activeHospital = hospitals.find(h => h.id === activeHospitalId);

  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#060a08] min-h-screen relative overflow-hidden font-mono">
        {/* Heartbeat blobs background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C853]/5 blur-[120px] rounded-full animate-pulse animate-heartbeat" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00B8D4]/5 blur-[120px] rounded-full animate-pulse animate-heartbeat" />
        
        <div className="w-full max-w-md bg-[#0a0f0d]/80 border border-white/10 shadow-[0_25px_65px_rgba(0,0,0,0.65)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden z-10 font-mono text-xs text-white">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent" />
          
          {/* Logo */}
          <div className="text-center space-y-3 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Heart size={24} className="animate-pulse text-[#00C853]" fill="currentColor" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-black tracking-widest uppercase">HAVENLINE CORE ADMIT</h2>
              <p className="text-[9px] text-[#00B8D4] uppercase font-bold tracking-widest">clinical intake control node auth</p>
            </div>
          </div>

          <form onSubmit={performLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[10px] uppercase font-bold text-center tracking-wide">
                ⚠️ {loginError}
              </div>
            )}

            {/* Hospital Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Select Intake Node Facility</label>
              <select
                value={loginHospitalId}
                onChange={(e) => setLoginHospitalId(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-[#00C853] focus:outline-none transition-all font-mono"
                style={{ colorScheme: 'dark' }}
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                    {h.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Role / Access Level */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Access Roster Role</label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-[#00C853] focus:outline-none transition-all font-mono"
                style={{ colorScheme: 'dark' }}
              >
                <option value="Duty Emergency Physician" className="bg-slate-900 text-white">Duty Emergency Physician</option>
                <option value="Trauma Nurse Coordinator" className="bg-slate-900 text-white">Trauma Nurse Coordinator</option>
                <option value="Chief of Clinical Admissions" className="bg-slate-900 text-white">Chief of Clinical Admissions</option>
              </select>
            </div>

            {/* Key / Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Node Security Key</label>
              <input
                type="password"
                placeholder="Enter node password (e.g. admin123)..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-[#00C853] focus:outline-none transition-all font-sans"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
            >
              AUTHENTICATE ACCESS TOKEN <ChevronRight size={14} />
            </button>
          </form>

          {/* Footer Back link */}
          <div className="pt-4 border-t border-white/5 text-center">
            <Link 
              href="/"
              className="text-[9px] text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-bold"
            >
              ← Back to Patient Landing Page
            </Link>
          </div>

        </div>
      </div>
    );
  }

  if (!activeHospital) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#060608] min-h-screen">
        <div className="w-5 h-5 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter hospital specific variables
  const hospitalAppointments = appointments.filter(a => a.hospitalId === activeHospitalId);
  const pendingAppointments = hospitalAppointments.filter(a => a.status === 'Pending');
  const criticalIncoming = pendingAppointments.filter(a => a.urgency === 'Critical');

  // Format bed occupation numbers
  const getBedsColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio === 0) return 'border-red-200 text-red-650 bg-red-50 shadow-red-500/5';
    if (ratio < 0.25) return 'border-amber-200 text-amber-650 bg-amber-50 shadow-amber-500/5';
    return 'border-emerald-200 text-emerald-650 bg-emerald-50 shadow-emerald-500/5';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F7] text-slate-800 min-h-screen relative pb-10">
      
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-slate-200 text-slate-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in max-w-sm font-mono text-xs">
          <Bell className="text-[#00C853] animate-swing shrink-0" size={18} />
          <div>
            <p className="font-extrabold uppercase tracking-widest text-[#00C853]">Live Sync Feed</p>
            <p className="text-slate-500 mt-0.5 font-sans leading-relaxed">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-[9px] ml-auto text-slate-400 hover:text-slate-700 uppercase font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Panel */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center text-[#00C853] shadow-md shadow-[#00C853]/5">
            <Heart size={16} fill="currentColor" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black tracking-widest text-sm text-slate-800 uppercase">
              HAVEN<span className="text-[#00C853]">LINE</span> // ADMIN_PORTAL
            </span>
            <Link 
              href="/network"
              className="text-[9px] px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50 uppercase font-black tracking-wider transition-colors ml-3"
            >
              Network Showcase
            </Link>
            <Link 
              href="/"
              className="text-[9px] px-2 py-0.5 rounded border border-[#00C853]/20 bg-[#00C853]/5 text-[#00C853] hover:bg-[#00C853]/10 hover:text-[#00A343] uppercase font-black tracking-wider transition-colors ml-2"
            >
              Landing Page
            </Link>
          </div>
        </div>

        {/* Logged in credentials & Control actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto text-[10px] font-mono">
          <div className="hidden md:flex flex-col items-end leading-tight text-right mr-1">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider">{activeHospital.name}</span>
            <span className="text-[9px] text-[#00C853] font-bold uppercase tracking-widest">{loginRole}</span>
          </div>

          <button
            type="button"
            onClick={performLogout}
            className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-wider text-[9px] cursor-pointer"
          >
            Log Out
          </button>

          <button
            type="button"
            onClick={() => {
              resetAll();
              setSelectedPatientForAI(null);
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center justify-center cursor-pointer"
            title="Reset Board Database"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Critical Trauma Alert Banner */}
      {criticalIncoming.length > 0 && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 shadow-xl shadow-red-500/5 animate-pulse text-xs font-mono text-red-700 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <AlertTriangle className="text-red-650 animate-bounce shrink-0" size={16} />
            <span>🚨 Active trauma preparation alert</span>
          </div>
          <div className="space-y-1.5 font-sans leading-relaxed text-red-650">
            {criticalIncoming.map((appt) => (
              <p key={appt.id} className="font-semibold">
                Patient <strong className="font-black text-slate-900 uppercase">{appt.patientName}</strong> is arriving shortly (~{appt.etaMinutes}m ETA) with symptoms: <span className="italic text-slate-800">"{appt.symptoms}"</span>. 
                <span className="block text-[10px] text-red-500 font-bold mt-0.5 font-mono uppercase tracking-wider">
                  ⚠️ Action Required: Allocate Emergency ICU Bed & prepare diagnostic equipment (ECG/Blood Set) in advance of arrival.
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Side: Stats and Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            
            {/* Live Queue count */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 blur-xl rounded-full" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Queue Board</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">{activeHospital.queue.length}</span>
                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">
                  {activeHospital.queue.waitTimeMinutes}m wait
                </span>
              </div>
            </div>

            {/* ICU Beds */}
            <div className={`border rounded-2xl p-4 shadow-xl space-y-1 relative overflow-hidden ${
              getBedsColor(activeHospital.beds.icu.available, activeHospital.beds.icu.total)
            }`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 blur-xl rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-widest opacity-85">ICU Beds Vacancy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{activeHospital.beds.icu.available}</span>
                <span className="text-[9px] opacity-60 uppercase">of {activeHospital.beds.icu.total} total</span>
              </div>
            </div>

            {/* Emergency Beds */}
            <div className={`border rounded-2xl p-4 shadow-xl space-y-1 relative overflow-hidden ${
              getBedsColor(activeHospital.beds.emergency.available, activeHospital.beds.emergency.total)
            }`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 blur-xl rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-widest opacity-85">Emergency Capacity</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{activeHospital.beds.emergency.available}</span>
                <span className="text-[9px] opacity-60 uppercase">of {activeHospital.beds.emergency.total} total</span>
              </div>
            </div>

          </div>

          {/* Workspace Tabs Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50 font-mono text-[10px]">
              {[
                { id: 'appointments', label: 'ADMISSIONS LIST', badge: pendingAppointments.length },
                { id: 'queue', label: 'ACTIVE QUEUE BOARD' },
                { id: 'beds', label: 'BEDS CONTROL' },
                { id: 'staff', label: 'STAFF ROSTER' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 sm:flex-none font-black py-4 px-5 transition-all text-center relative border-r border-slate-200 flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                    activeTab === tab.id
                      ? 'bg-white text-[#00C853]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.25)]">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C853]" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Workspace content */}
            <div className="p-5 flex-1 min-h-[300px] bg-white">
              
              {/* Tab 1: Appointments Admissions list */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  {hospitalAppointments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic text-xs font-mono">
                      NO PATIENT ADMISSIONS RECORDED.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                            <th className="py-2.5">Patient Detail</th>
                            <th className="py-2.5">Symptoms / Urgency</th>
                            <th className="py-2.5">Transit</th>
                            <th className="py-2.5">Status</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          {hospitalAppointments.map((appt) => (
                            <tr 
                              key={appt.id} 
                              onClick={() => setSelectedPatientForAI(appt)}
                              className={`hover:bg-slate-50/50 cursor-pointer transition-all ${
                                selectedPatientForAI?.id === appt.id ? 'bg-[#00C853]/5' : ''
                              }`}
                            >
                              <td className="py-3.5">
                                <p className="font-extrabold text-slate-800 uppercase tracking-wide">{appt.patientName}</p>
                                <p className="text-[9px] text-slate-450 mt-1 uppercase tracking-wider">
                                  TKN: {appt.token} | AGE: {appt.patientAge} | {appt.patientGender}
                                </p>
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded mr-2 uppercase tracking-widest ${
                                  appt.urgency === 'Critical'
                                    ? 'bg-red-50 text-red-650 border border-red-200/50 animate-pulse'
                                    : appt.urgency === 'High'
                                      ? 'bg-amber-50 text-amber-650 border border-amber-200/50'
                                      : appt.urgency === 'Medium'
                                        ? 'bg-[#00B8D4]/10 text-[#00B8D4] border border-[#00B8D4]/20'
                                        : 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20'
                                }`}>
                                  {appt.urgency}
                                </span>
                                <span className="text-slate-400 font-sans text-xs truncate max-w-[150px] inline-block align-middle mt-0.5">
                                  {appt.symptoms}
                                </span>
                              </td>
                              <td className="py-3.5 text-slate-400">
                                ~{appt.etaMinutes}m ETA
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                  appt.status === 'Pending' 
                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                    : appt.status === 'Admitted'
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-black'
                                      : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-1 justify-end font-bold">
                                  {appt.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => updateAppointmentStatus(appt.id, 'Admitted')}
                                        className="p-1.5 rounded-lg bg-[#00C853] text-white hover:bg-[#00A343] transition-colors"
                                        title="Admit Patient"
                                      >
                                        <Check size={12} className="stroke-[3]" />
                                      </button>
                                      <button
                                        onClick={() => updateAppointmentStatus(appt.id, 'Redirected')}
                                        className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                        title="Redirect Patient"
                                      >
                                        <UserMinus size={12} />
                                      </button>
                                    </>
                                  )}
                                  {appt.status === 'Admitted' && (
                                    <button
                                      onClick={() => updateAppointmentStatus(appt.id, 'Checked Out')}
                                      className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-black text-[9px] uppercase tracking-wider transition-colors"
                                    >
                                      Check Out
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Queue Manager Board */}
              {activeTab === 'queue' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Live Active Queue Order</span>
                    <span className="text-[9px] text-slate-600">Simulate bump & bypass parameters</span>
                  </div>
                  {hospitalAppointments.length === 0 ? (
                    <p className="text-center py-12 text-slate-500 italic text-xs font-mono">NO ACTIVE QUEUES.</p>
                  ) : (
                    <div className="space-y-2.5 font-mono">
                      {hospitalAppointments.map((appt, idx) => (
                        <div 
                          key={appt.id}
                          className="p-3.5 bg-slate-50/55 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#00B8D4]/10 border border-[#00B8D4]/20 text-[#00B8D4] text-[9px] font-black flex items-center justify-center shadow-md">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{appt.patientName}</p>
                              <p className="text-[9px] text-slate-450 mt-1 uppercase tracking-wider">
                                TKN: {appt.token} | DEPT: {appt.department.toUpperCase()} | DOC: {appt.doctorName.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              appt.urgency === 'Critical' 
                                ? 'bg-red-50 text-red-650 border-red-200/50 animate-pulse' 
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              {appt.urgency}
                            </span>
                            {appt.status === 'Pending' && appt.urgency !== 'Critical' && (
                              <button
                                onClick={() => {
                                  updateAppointmentStatus(appt.id, 'Admitted');
                                }}
                                className="px-3 py-1.5 bg-[#00C853] hover:bg-[#00A343] text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                              >
                                Admit Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Beds counter editor */}
              {activeTab === 'beds' && (
                <div className="space-y-6 font-mono">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[10px] text-slate-450 uppercase tracking-wide leading-relaxed">
                    <p className="font-extrabold text-slate-800">Bed Allocator Triage Configurator</p>
                    <p className="font-sans text-xs text-slate-500">Admins can manually release or occupy beds. This immediately updates suitability ratings and is broadcasted to the patient recommendation map tabs in real time.</p>
                  </div>
                  <div className="space-y-4">
                    {['icu', 'emergency', 'general'].map((cat) => {
                      const details = activeHospital.beds[cat as keyof typeof activeHospital.beds];
                      return (
                        <div key={cat} className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                          <div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              {cat === 'icu' ? 'ICU Beds' : cat === 'emergency' ? 'Emergency Trauma Beds' : 'General Ward Beds'}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 block">Total capacity: {details.total} beds</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateBeds(activeHospital.id, cat as any, false)}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800 font-bold flex items-center justify-center transition-all"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-slate-800 w-16 text-center">
                              {details.available} <span className="text-[9px] text-slate-500 font-normal uppercase">avail</span>
                            </span>
                            <button
                              onClick={() => updateBeds(activeHospital.id, cat as any, true)}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800 font-bold flex items-center justify-center transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Doctor Status scheduler */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5">Doctor Name</th>
                          <th className="py-2.5">Specialization</th>
                          <th className="py-2.5">Duty Status</th>
                          <th className="py-2.5 text-right">Roster Switch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {activeHospital.doctors.map((doc) => (
                          <tr key={doc.id}>
                            <td className="py-3 font-extrabold text-slate-800 uppercase tracking-wider">{doc.name}</td>
                            <td className="py-3 text-slate-500">{doc.specialization}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                doc.available 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-250' 
                                  : 'bg-amber-50 text-amber-600 border-amber-250'
                              }`}>
                                {doc.statusText}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  alert("Duty shifts toggled in local scheduler.");
                                }}
                                className="text-[9px] px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-650 rounded-lg hover:bg-slate-100 hover:text-slate-850 font-bold uppercase tracking-wider transition-all"
                              >
                                Toggle Duty
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Right side panel: AI Doctor summary side widgets (Phase 9 integration) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-6 relative overflow-hidden font-mono text-xs text-slate-800">
          
          {/* Decorative highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00B8D4]/20" />

          {/* Toggleable Tabs header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <button
              onClick={() => setRightPanelTab('diagnosis')}
              className={`flex items-center gap-1.5 pb-2 text-[10px] uppercase font-black tracking-wider border-b-2 transition-all ${
                rightPanelTab === 'diagnosis'
                  ? 'border-[#00C853] text-[#00C853]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sparkles size={12} /> AI Diagnosis
            </button>
            <button
              onClick={() => setRightPanelTab('prescription')}
              disabled={!selectedPatientForAI}
              className={`flex items-center gap-1.5 pb-2 text-[10px] uppercase font-black tracking-wider border-b-2 transition-all ${
                !selectedPatientForAI ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                rightPanelTab === 'prescription'
                  ? 'border-[#00B8D4] text-[#00B8D4]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText size={12} /> Clinical Rx / Discharge
            </button>
          </div>

          {!selectedPatientForAI ? (
            <div className="text-center py-12 text-slate-400 italic space-y-3">
              <Sparkles size={20} className="mx-auto text-slate-350 animate-pulse" />
              <p className="uppercase tracking-wide text-[10px]">Select any patient from the admissions grid to launch the AI diagnostic analyzer.</p>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in text-slate-600">
              
              {/* Patient mini summary card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-800 uppercase tracking-wider">{selectedPatientForAI.patientName}</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">
                  URGENCY: <strong className="text-slate-700">{selectedPatientForAI.urgency}</strong> | TICKET: {selectedPatientForAI.token}
                </p>
              </div>

              {rightPanelTab === 'diagnosis' ? (
                <>
                  {/* Presented Symptoms */}
                  <div className="space-y-1.5">
                    <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest">Presented Symptoms</p>
                    <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl italic leading-relaxed text-slate-700 font-sans text-xs">
                      "{selectedPatientForAI.symptoms}"
                    </p>
                  </div>

                  {/* Authenticated Clinical Health Profile */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-200">
                    <p className="font-black text-[#00B8D4] text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                      <Activity size={12} className="shrink-0 text-[#00B8D4]" /> Clinical History Card
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 leading-relaxed text-slate-750 font-sans text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                        <span className="font-mono text-[9px] text-slate-450 uppercase font-bold tracking-wider">Blood Group</span>
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-650 border border-red-200/50 font-black font-mono text-[9px]">{selectedPatientForAI.patientBloodType || 'B+'}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-slate-450 uppercase block mb-1 font-bold tracking-wider">Pre-Existing Conditions</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPatientForAI.patientPastDiseases && selectedPatientForAI.patientPastDiseases.length > 0 ? (
                            selectedPatientForAI.patientPastDiseases.map((disease, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-bold text-[9px] uppercase tracking-wide font-mono">
                                {disease}
                              </span>
                            ))
                          ) : (
                            <span className="italic text-slate-400 text-[10px]">None reported</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="font-mono text-[9px] text-slate-450 uppercase block mb-1 font-bold tracking-wider">Active Medications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPatientForAI.patientMedicines && selectedPatientForAI.patientMedicines.length > 0 ? (
                            selectedPatientForAI.patientMedicines.map((med, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[9px] uppercase tracking-wide font-mono">
                                {med}
                              </span>
                            ))
                          ) : (
                            <span className="italic text-slate-400 text-[10px]">No active prescription</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic summary */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="space-y-1.5">
                      <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={12} className="text-[#00C853]" /> Triage Rationale
                      </p>
                      <p className="leading-relaxed font-sans text-xs text-slate-650">
                        {selectedPatientForAI.clinicalSummary || 'Analyzing presenting clinical factors...'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest">Suggested diagnostics tests</p>
                      {selectedPatientForAI.suggestedTests && selectedPatientForAI.suggestedTests.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-slate-650 font-sans text-xs">
                          {selectedPatientForAI.suggestedTests.map((test, idx) => (
                            <li key={idx}>{test}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-400">Calculating tests...</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest">Questions physician should ask</p>
                      {selectedPatientForAI.doctorQuestions && selectedPatientForAI.doctorQuestions.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-slate-500 font-sans text-xs">
                          {selectedPatientForAI.doctorQuestions.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-400">Preparing checklist...</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider font-mono">Digital Rx Editor</span>
                    <button
                      type="button"
                      onClick={handleAutoPrefillRx}
                      disabled={rxLoading}
                      className="px-2.5 py-1.5 border border-[#00B8D4] text-[#00B8D4] hover:bg-[#00B8D4] hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {rxLoading ? (
                        <>
                          <div className="w-2.5 h-2.5 border border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
                          PREFILLING...
                        </>
                      ) : (
                        <>
                          <Sparkles size={10} /> AI Auto-Prefill
                        </>
                      )}
                    </button>
                  </div>

                  {/* Medicines table */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block font-mono">Prescribed Medicines</span>
                    
                    {rxMedicines.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-450 uppercase tracking-wider font-mono">
                        No medicines added. Click AI Auto-Prefill or click "+" below to add manually.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {rxMedicines.map((med, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative font-mono">
                            <button
                              type="button"
                              onClick={() => setRxMedicines(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-2 right-2 text-slate-350 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <label className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Drug Name</label>
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => {
                                    const updated = [...rxMedicines];
                                    updated[idx].name = e.target.value;
                                    setRxMedicines(updated);
                                  }}
                                  className="w-full text-[10px] p-1.5 border border-slate-200 rounded bg-white font-sans text-slate-700 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Dosage</label>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => {
                                    const updated = [...rxMedicines];
                                    updated[idx].dosage = e.target.value;
                                    setRxMedicines(updated);
                                  }}
                                  className="w-full text-[10px] p-1.5 border border-slate-200 rounded bg-white font-sans text-slate-700 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                              <div>
                                <label className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Frequency</label>
                                <input
                                  type="text"
                                  value={med.frequency}
                                  onChange={(e) => {
                                    const updated = [...rxMedicines];
                                    updated[idx].frequency = e.target.value;
                                    setRxMedicines(updated);
                                  }}
                                  className="w-full text-[9px] p-1 border border-slate-200 rounded bg-white font-sans text-slate-700 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Duration</label>
                                <input
                                  type="text"
                                  value={med.duration}
                                  onChange={(e) => {
                                    const updated = [...rxMedicines];
                                    updated[idx].duration = e.target.value;
                                    setRxMedicines(updated);
                                  }}
                                  className="w-full text-[9px] p-1 border border-slate-200 rounded bg-white font-sans text-slate-700 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Instructions</label>
                                <input
                                  type="text"
                                  value={med.instructions}
                                  onChange={(e) => {
                                    const updated = [...rxMedicines];
                                    updated[idx].instructions = e.target.value;
                                    setRxMedicines(updated);
                                  }}
                                  className="w-full text-[9px] p-1 border border-slate-200 rounded bg-white font-sans text-slate-700 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setRxMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                      className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-350 text-slate-450 hover:text-slate-700 font-bold uppercase tracking-wider text-[9px] rounded-xl flex items-center justify-center gap-1 cursor-pointer font-mono"
                    >
                      + Add Medicine Row
                    </button>
                  </div>

                  {/* Lifestyle Advice */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                    <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Dietary & Lifestyle Advice</label>
                    <textarea
                      value={rxLifestyle}
                      onChange={(e) => setRxLifestyle(e.target.value)}
                      placeholder="e.g. Rest, low-sodium meals..."
                      className="w-full h-14 p-2 text-[10px] border border-slate-200 rounded-xl bg-white font-sans text-slate-750 focus:outline-none focus:border-[#00B8D4]"
                    />
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-[9px] text-slate-405 font-black uppercase tracking-widest block">Follow-up Instructions</label>
                    <input
                      type="text"
                      value={rxFollowUp}
                      onChange={(e) => setRxFollowUp(e.target.value)}
                      placeholder="e.g. Review if pain persists..."
                      className="w-full p-2 text-[10px] border border-slate-200 rounded-xl bg-white font-sans text-slate-750 focus:outline-none focus:border-[#00B8D4]"
                    />
                  </div>

                  {/* Submit dispatch */}
                  <button
                    type="button"
                    onClick={handleDispatchRx}
                    disabled={rxMedicines.length === 0}
                    className="w-full py-3 bg-[#00C853] hover:bg-[#00A343] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-[#00C853]/10 transition-all flex items-center justify-center gap-1 cursor-pointer font-mono"
                  >
                    Sign & Dispatch Digital Rx
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
