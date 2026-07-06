'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { User, Activity, AlertCircle, Phone, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const MEDICAL_HISTORY_OPTIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma / COPD',
  'Ischemic Heart Disease',
  'Chronic Kidney Disease',
  'Stroke History',
  'Bleeding Disorders',
  'Drug Allergies'
];

interface SavedUserProfile {
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
}

export default function PatientOnboarding() {
  const router = useRouter();
  const { currentPatient, setPatientProfile } = useHavenline();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Spouse');
  const [error, setError] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  // Load existing profile if it exists on mount
  useEffect(() => {
    if (currentPatient) {
      setName(currentPatient.name);
      setPhone(currentPatient.phone || '');
      setAge(currentPatient.age.toString());
      setGender(currentPatient.gender);
      setMedicalHistory(currentPatient.medicalHistory);
      setContactName(currentPatient.emergencyContact.name);
      setContactPhone(currentPatient.emergencyContact.phone);
      setContactRelation(currentPatient.emergencyContact.relationship);
    }
  }, [currentPatient]);

  // Real-time lookup to identify returning users
  useEffect(() => {
    if (!phone.trim() || !name.trim()) {
      setIsReturning(false);
      return;
    }

    const savedUsersStr = localStorage.getItem('havenline_saved_users');
    if (savedUsersStr) {
      const savedUsers: SavedUserProfile[] = JSON.parse(savedUsersStr);
      // Find match based on name and phone number
      const match = savedUsers.find(
        (u) => 
          u.phone.trim() === phone.trim() && 
          u.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (match) {
        setAge(match.age.toString());
        setGender(match.gender);
        setMedicalHistory(match.medicalHistory);
        setContactName(match.emergencyContact.name);
        setContactPhone(match.emergencyContact.phone);
        setContactRelation(match.emergencyContact.relationship);
        setIsReturning(true);
      } else {
        setIsReturning(false);
      }
    }
  }, [name, phone]);

  const handleToggleHistory = (item: string) => {
    setMedicalHistory((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Please provide emergency contact details.');
      return;
    }

    const profileData = {
      name: name.trim(),
      phone: phone.trim(),
      age: parsedAge,
      gender,
      medicalHistory,
      emergencyContact: {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship: contactRelation
      }
    };

    // Save as current profile in context
    setPatientProfile(profileData);

    // Save/update returning users record database in LocalStorage
    const savedUsersStr = localStorage.getItem('havenline_saved_users');
    let savedUsers: SavedUserProfile[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    // Remove existing match if we are editing/saving again
    savedUsers = savedUsers.filter(
      (u) => 
        !(u.phone.trim() === profileData.phone && 
          u.name.toLowerCase().trim() === profileData.name.toLowerCase())
    );
    savedUsers.push(profileData);
    localStorage.setItem('havenline_saved_users', JSON.stringify(savedUsers));

    router.push('/portal');
  };

  const handleContinueAsGuest = () => {
    setPatientProfile({
      name: 'Guest Patient',
      phone: '9999999999',
      age: 30,
      gender: 'Male',
      medicalHistory: [],
      emergencyContact: {
        name: 'Emergency Service',
        phone: '102',
        relationship: 'Public Service'
      }
    });
    router.push('/portal');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 bg-[#060a08] min-h-screen relative overflow-hidden">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[10%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/25 to-emerald-400/20 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[35%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/20 to-emerald-600/20 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-2xl mb-6 flex items-center justify-between relative z-10 font-mono text-[10px] text-white">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
        >
          ← Back to Landing Page
        </button>
        <span className="text-white/40 uppercase tracking-widest font-black">
          Patient Profile Setup
        </span>
      </div>

      <div className="w-full max-w-2xl bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in z-10 font-mono text-xs text-white">
        
        {/* Border accent ornament */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent" />

        {/* Title */}
        <div className="text-center space-y-2 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
            <User size={20} className="animate-pulse" />
          </div>
          <h2 className="text-base font-black text-white tracking-wider uppercase">Setup Clinical Profile</h2>
          <p className="text-[11px] text-white/60 max-w-md mx-auto leading-relaxed font-sans">
            Supplying medical history allows the Havenline Engine to calculate precise urgency priorities and rank appropriate critical care centers.
          </p>
        </div>

        {isReturning && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/35 text-xs text-emerald-400 flex items-center gap-2.5 animate-fade-in font-mono shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            <ShieldCheck size={16} className="shrink-0 animate-bounce" />
            <span className="font-bold">Returning Patient Detected! Loaded medical history for {name}.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400 flex items-center gap-2 animate-fade-in font-mono">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/90 uppercase tracking-widest pb-1.5 border-b border-white/10 flex items-center gap-1.5">
              <UserCheck size={14} className="text-[#00B8D4]" /> 01 // Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anubhav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9999988888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold block">Gender Identity</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      gender === g
                        ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-sm shadow-emerald-400/5'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Medical History */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white/90 uppercase tracking-widest pb-1.5 border-b border-white/10 flex items-center gap-1.5">
              <Activity size={14} className="text-[#00C853]" /> 02 // Chronic Indicators
            </h3>
            <p className="text-[10px] text-emerald-400 leading-relaxed font-sans font-bold">
              Select chronic parameters to adjust AI urgency weighting factors:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEDICAL_HISTORY_OPTIONS.map((item) => {
                const selected = medicalHistory.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleHistory(item)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between h-20 relative overflow-hidden group ${
                      selected
                        ? 'bg-emerald-500/10 border-emerald-400/50 text-emerald-400 font-bold shadow-inner shadow-emerald-400/5'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] leading-tight select-none">{item}</span>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center self-end transition-all ${
                      selected 
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black text-[9px]' 
                        : 'border-white/20 bg-white/5 group-hover:border-white/30'
                    }`}>
                      {selected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/90 uppercase tracking-widest pb-1.5 border-b border-white/10 flex items-center gap-1.5">
              <Phone size={14} className="text-[#00B8D4]" /> 03 // Telemetry Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 99999 88888"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Relationship</label>
                <select
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-400 focus:outline-none transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  {['Spouse', 'Parent', 'Sibling', 'Guardian', 'Friend', 'Child', 'Other'].map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="flex-1 py-3.5 border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all"
            >
              Continue as Guest (Skip)
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl font-extrabold uppercase tracking-wider text-[10px] transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              Save & Initialize Portal <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
