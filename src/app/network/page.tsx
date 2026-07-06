'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHavenline } from '../../context/HavenlineContext';
import { Search, Heart, MapPin, Activity, ChevronRight, Sparkles, ShieldCheck, Stethoscope, Landmark } from 'lucide-react';

export default function NetworkShowcase() {
  const { hospitals } = useHavenline();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = 
      selectedSpecialty === 'All' || 
      h.specializations.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  const allSpecialties = Array.from(
    new Set(hospitals.flatMap((h) => h.specializations))
  ).sort();

  return (
    <div className="flex-1 bg-[#060a08] text-white min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[8%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[8%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[30%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back and header status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link 
            href="/"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold text-[10px]"
          >
            ← Back to Landing Page
          </Link>
          <span className="bg-emerald-500/10 border border-emerald-400 text-emerald-400 text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1">
            <Activity size={10} className="animate-pulse" /> CLOUD_SYNC_ACTIVE
          </span>
        </div>

        {/* Header Title */}
        <div className="border-b border-white/10 pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <Landmark size={20} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">PARTNERED HOSPITALS NETWORK</h1>
          </div>
          <p className="text-[11px] text-white/60 uppercase max-w-2xl leading-relaxed">
            Live telemetry integration and secure cloud sync for all Delhi NCR healthcare centers linked to the Havenline Secure Clinical Core.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f0d]/75 border border-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="md:col-span-8 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search partnered hospitals by name, area, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-400 focus:outline-none transition-all font-mono"
              style={{ colorScheme: 'dark' }}
            >
              <option value="All" className="bg-slate-900 text-white">All Specializations</option>
              {allSpecialties.map((spec) => (
                <option key={spec} value={spec} className="bg-slate-900 text-white">{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Network Count */}
        <div className="flex items-center justify-between text-[10px] text-white/50 uppercase tracking-widest font-black px-2">
          <span>Connected Nodes: {filteredHospitals.length} / {hospitals.length}</span>
          <span className="flex items-center gap-1.5 text-emerald-400 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Cloud Feed Connected
          </span>
        </div>

        {/* Network Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredHospitals.map((h) => {
            const totalBeds = h.beds.icu.total + h.beds.emergency.total + h.beds.general.total;
            const availBeds = h.beds.icu.available + h.beds.emergency.available + h.beds.general.available;
            
            return (
              <div 
                key={h.id}
                className="bg-[#0a0f0d]/75 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:translate-y-[-3px] hover:border-emerald-400/50"
              >
                
                {/* Photo Header */}
                <div className="relative h-44 bg-slate-900">
                  <img 
                    src={h.imageUrl} 
                    alt={h.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
                  
                  {/* Clinic vs Hospital tag */}
                  <span className="absolute top-3 left-3 bg-slate-900/90 border border-white/10 text-white text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-md">
                    {h.isClinic ? 'CLINIC NODE' : 'HOSPITAL NODE'}
                  </span>

                  {/* Connected status pill */}
                  <span className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-400 text-emerald-400 text-[8px] font-black tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                    <ShieldCheck size={10} /> CONNECTED
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                      {h.name}
                    </h3>
                    <p className="text-[10px] text-white/50 font-sans flex items-start gap-1 leading-normal">
                      <MapPin size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h.address}</span>
                    </p>
                  </div>

                  {/* Stats Strip */}
                  <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-3 rounded-xl text-center font-mono">
                    <div>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Queue wait</p>
                      <p className="text-xs font-black mt-0.5 text-white">{h.queue.waitTimeMinutes} mins</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Beds Available</p>
                      <p className="text-xs font-black mt-0.5 text-emerald-400">
                        {availBeds} <span className="text-[9px] text-white/30 font-normal">/ {totalBeds}</span>
                      </p>
                    </div>
                  </div>

                  {/* Specialties List */}
                  <div className="space-y-1.5">
                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Clinical Departments</p>
                    <div className="flex flex-wrap gap-1 font-sans">
                      {h.specializations.map((spec) => (
                        <span 
                          key={spec} 
                          className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/70"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Link action */}
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <Link
                      href={`/network/${h.id}`}
                      className="w-full py-3 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 transition-all"
                    >
                      Inspect Hospital Profile <ChevronRight size={14} />
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
