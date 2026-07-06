'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { Hospital, Doctor } from '../../../lib/mockDatabase';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Star, 
  BadgeIndianRupee, 
  ChevronRight, 
  ShieldAlert, 
  Check, 
  Users, 
  User,
  Award,
  Terminal,
  Activity,
  Flame,
  ArrowLeft,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import GoogleMap from '../../../components/google-map';

export default function PartneredHospitalProfile() {
  const router = useRouter();
  const params = useParams();
  const hospitalId = params.id as string;
  const { hospitals, userLocation } = useHavenline();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [activeDept, setActiveDept] = useState<string>('Global');

  useEffect(() => {
    if (hospitalId && hospitals.length > 0) {
      const matched = hospitals.find((h) => h.id === hospitalId);
      if (matched) {
        setHospital(matched);
      }
    }
  }, [hospitalId, hospitals]);

  if (!hospital) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 bg-[#060a08] min-h-screen text-white font-mono text-xs">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-white/50 uppercase tracking-wider">Locating node profile...</p>
      </div>
    );
  }

  const totalBeds = hospital.beds.icu.total + hospital.beds.emergency.total + hospital.beds.general.total;
  const availBeds = hospital.beds.icu.available + hospital.beds.emergency.available + hospital.beds.general.available;
  const totalCost = hospital.costs.consultation + hospital.costs.estDiagnostics + hospital.costs.estMedicines;

  return (
    <div className="flex-1 bg-[#060a08] text-white min-h-screen py-8 px-4 sm:px-6 relative overflow-hidden font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[8%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[8%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[30%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back and status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/network')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold text-[10px]"
            >
              <ArrowLeft size={14} /> Back to Network Showcase
            </button>
            <span className="text-white/20">|</span>
            <Link 
              href="/"
              className="text-white/50 hover:text-white transition-colors uppercase tracking-wider font-extrabold text-[10px] flex items-center"
            >
              Back to Landing Page
            </Link>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-400 text-emerald-400 text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <Activity size={10} className="animate-pulse" /> NETWORK_NODE_ONLINE
          </span>
        </div>

        {/* Hospital Hero Card */}
        <div className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 h-64 bg-slate-950">
            <img 
              src={hospital.imageUrl} 
              alt={hospital.name} 
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/50 to-transparent" />
          </div>
          
          <div className="relative pt-36 p-6 sm:p-8 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-widest">
                <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/5">
                  {hospital.isClinic ? 'CLINIC PROFILE' : 'SUPER-SPECIALTY HOSPITAL'}
                </span>
                <span className="flex items-center gap-0.5 text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/5 border border-cyan-500/10">
                  <Star size={10} fill="currentColor" /> {hospital.rating} RATING
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight max-w-4xl">
                {hospital.name}
              </h1>
              <p className="text-xs text-white/60 font-sans flex items-start gap-1 max-w-3xl leading-relaxed">
                <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{hospital.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Workspace details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Live diagnostics, beds, doctors (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Queue and Core Telemetry */}
            {(() => {
              const activeQueue = (activeDept !== 'Global' && hospital.departmentQueues && hospital.departmentQueues[activeDept])
                ? hospital.departmentQueues[activeDept]
                : hospital.queue;

              return (
                <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal size={14} className="text-[#00B8D4]" /> Live Queue Triage Telemetry
                    </h2>
                    <select
                      value={activeDept}
                      onChange={(e) => setActiveDept(e.target.value)}
                      className="text-[9px] font-black uppercase tracking-wider rounded border border-white/10 bg-[#0a0f0d] text-white focus:border-[#00B8D4] focus:outline-none py-0.5 px-2 font-mono cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="Global">General / Global</option>
                      {hospital.specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec} Dept</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center animate-fade-in">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">Token Ticker</p>
                      <p className="text-sm font-black text-white mt-1">{activeQueue.currentToken || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">OPD Waiting List</p>
                      <p className="text-sm font-black text-white mt-1">{activeQueue.length} Patients</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">Queue velocity</p>
                      <p className="text-sm font-black text-emerald-400 mt-1">~{activeQueue.waitTimeMinutes} mins wait</p>
                    </div>
                  </div>

                  {activeQueue.patients && activeQueue.patients.length > 0 && (
                    <div className="space-y-2 border-t border-white/10 pt-4 animate-fade-in">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">Active Admissions Triage Queue</p>
                      <div className="space-y-1.5">
                        {activeQueue.patients.map((pat, idx) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-[11px] leading-tight">
                            <span className="font-bold text-white/90">Token #{pat.token} - {pat.name.toUpperCase()}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                                pat.urgency === 'High' ? 'bg-red-500/10 border border-red-400 text-red-400' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {pat.urgency}
                              </span>
                              <span className="text-[10px] text-white/40 font-mono">Spot #{pat.ahead}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Capacity Bed Inventory */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-3">
                <Activity size={14} className="text-emerald-400" /> Physical Capacity Dashboard
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between h-24">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">ICU Ward beds</p>
                  <p className={`text-base font-black ${hospital.beds.icu.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hospital.beds.icu.available} <span className="text-[10px] text-white/30 font-normal">/ {hospital.beds.icu.total}</span>
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between h-24">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">Emergency trauma beds</p>
                  <p className={`text-base font-black ${hospital.beds.emergency.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {hospital.beds.emergency.available} <span className="text-[10px] text-white/30 font-normal">/ {hospital.beds.emergency.total}</span>
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between h-24">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">General ward beds</p>
                  <p className="text-base font-black text-white/80">
                    {hospital.beds.general.available} <span className="text-[10px] text-white/30 font-normal">/ {hospital.beds.general.total}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Doctors Roster */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-3">
                <Users size={14} className="text-cyan-400" /> Connected Specialists Roster
              </h2>
              
              {hospital.doctors.length === 0 ? (
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center text-white/50">
                  No roster lists registered. Out-patient consulting remains open with duty physicians.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hospital.doctors.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/40">
                        <User size={14} />
                      </div>
                      <div className="leading-tight space-y-1">
                        <h4 className="font-extrabold text-[11px] text-white/90">{doc.name}</h4>
                        <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">{doc.specialization}</p>
                        <div className="flex items-center gap-1 pt-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-[8px] uppercase tracking-widest text-white/40">{doc.statusText}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Facilities, Pricing, AI Sentiments, Booking CTA (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Booking Call to Action */}
            <div className="bg-[#0a0f0d]/90 border border-emerald-500/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
              <div className="space-y-1">
                <p className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">Intake System</p>
                <h3 className="text-sm font-extrabold text-white">OPD SLOT RESERVATION</h3>
              </div>
              <p className="text-[10px] text-white/55 leading-relaxed font-sans">
                Secure your slot in the outpatient roster. If presenting severe chest or breathing indicators, trigger symptom triage navigator first.
              </p>
              <button
                onClick={() => router.push(`/portal/booking?hospitalId=${hospital.id}`)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-500/5"
              >
                Book Appointment Slot <ChevronRight size={14} />
              </button>
            </div>

            {/* Core Facilities */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-5 space-y-3">
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">Core Scan Capabilities</p>
              <div className="grid grid-cols-2 gap-2">
                {['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'].map((fac) => {
                  const hasIt = hospital.facilities.includes(fac as any);
                  return (
                    <div 
                      key={fac} 
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-bold ${
                        hasIt 
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400 shadow-sm' 
                          : 'bg-black/10 border-white/5 text-white/30'
                      }`}
                    >
                      <Check size={12} className={hasIt ? 'text-emerald-400' : 'text-white/20'} />
                      <span>{fac}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Outlay Packaging */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-5 space-y-3.5">
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-black flex items-center gap-1">
                <BadgeIndianRupee size={12} /> Financial Packages
              </p>
              
              <div className="space-y-2.5 text-white/70">
                <div className="flex justify-between">
                  <span>OPD Consultation:</span>
                  <span className="text-white font-bold">₹{hospital.costs.consultation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Diagnostics:</span>
                  <span className="text-white font-bold">₹{hospital.costs.estDiagnostics}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Medicines:</span>
                  <span className="text-white font-bold">₹{hospital.costs.estMedicines}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 font-black text-white">
                  <span>EST. TOTAL PACKAGE:</span>
                  <span className="text-emerald-400 font-black text-sm">₹{totalCost}</span>
                </div>
              </div>
            </div>

            {/* AI Review Summarizer */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-xl backdrop-blur-xl rounded-2xl p-5 space-y-4">
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">AI Patient Sentiment</p>
              <p className="text-white/70 leading-relaxed font-sans text-xs">{hospital.reviewSummary.summary}</p>
              
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-[9px] text-emerald-400 uppercase tracking-wider font-extrabold">Pros Insight</p>
                  {hospital.reviewSummary.positive.map((pos, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{pos}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-[9px] text-red-400 uppercase tracking-wider font-extrabold">Cons Insight</p>
                  {hospital.reviewSummary.negative.map((neg, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{neg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Map Panel: Full Width at the Bottom */}
        <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0f0d]/75 p-[1px] relative z-10">
          <GoogleMap
            hospitals={[hospital]}
            selectedHospital={hospital}
            userLocation={userLocation}
            onSelectHospital={() => {}}
          />
        </div>

      </div>
    </div>
  );
}
