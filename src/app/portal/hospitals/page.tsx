'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { Hospital } from '../../../lib/mockDatabase';
import { 
  Activity, 
  MapPin, 
  Clock, 
  Star, 
  BadgeIndianRupee, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  ShieldAlert,
  Flame,
  ArrowUpDown,
  Check,
  X,
  Plus,
  Heart,
  TrendingUp,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import HospitalCompareModal from '../../../components/hospital-compare';
import GoogleMap from '../../../components/google-map';

// Haversine formula to compute distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km
};

function HospitalRecommendationsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fastTrackParam = searchParams.get('fastTrack') === 'true';

  const { hospitals, triageResult, userLocation } = useHavenline();

  // Selected hospitals for comparison (max 3)
  const [selectedForCompare, setSelectedForCompare] = useState<Hospital[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Filters State
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [maxCost, setMaxCost] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'suitability' | 'distance' | 'wait' | 'cost'>('suitability');

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeCardDept, setActiveCardDept] = useState<string>('Global');

  // Sync selectedHospital and carousel position on filter changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedSpecialty, maxDistance, maxCost, selectedFacilities, sortBy]);

  // Sync activeCardDept when selectedSpecialty or carouselIndex shifts
  useEffect(() => {
    if (selectedSpecialty !== 'All') {
      setActiveCardDept(selectedSpecialty);
    } else {
      setActiveCardDept('Global');
    }
  }, [selectedSpecialty, carouselIndex]);

  // Pre-fill specialty filter if triage recommended one
  useEffect(() => {
    if (triageResult && selectedSpecialty === 'All') {
      setSelectedSpecialty(triageResult.department);
    }
  }, [triageResult]);

  // Compute travel times and suitability scores
  const getTravelTime = (distance: number) => {
    return Math.round(distance * 2.5); // 2.5 minutes per km average Delhi traffic
  };

  // Explainable AI scoring engine
  const computeScoredHospitals = () => {
    return hospitals.map((h) => {
      const dist = getDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
      const travelTime = getTravelTime(dist);
      const isCritical = fastTrackParam || (triageResult?.urgency === 'Critical');

      // 1. Distance score (closer is better, max 30km scale)
      const distScore = Math.max(0, 100 - dist * 3.3);

      // 2. Queue Wait time score (shorter wait is better, max 180 mins)
      const waitScore = Math.max(0, 100 - h.queue.waitTimeMinutes * 0.55);

      // 3. Rating score (5 stars scale)
      const ratingScore = h.rating * 20;

      // 4. Cost score (cheaper is better, scale max 2000 INR)
      const costScore = Math.max(0, 100 - (h.costs.consultation / 20));

      // 5. Specialization match
      const specMatch = triageResult && h.specializations.includes(triageResult.department);
      const specScore = specMatch ? 100 : 40;

      // 6. Critical Beds ratio (ICU + Emergency available / total)
      const icuTotal = h.beds.icu.total || 1;
      const icuAvail = h.beds.icu.available;
      const emergTotal = h.beds.emergency.total || 1;
      const emergAvail = h.beds.emergency.available;
      const bedScore = ((icuAvail / icuTotal) * 0.6 + (emergAvail / emergTotal) * 0.4) * 100;

      // Weighted combination score
      let weightedScore = 0;
      if (isCritical) {
        // Critical weighting: focus on wait times, proximity, and bed availability
        weightedScore = distScore * 0.35 + waitScore * 0.3 + bedScore * 0.25 + specScore * 0.1;
      } else {
        // Routine weighting: focus on specialty, cost, rating, and distance
        weightedScore = specScore * 0.3 + distScore * 0.2 + waitScore * 0.15 + ratingScore * 0.15 + costScore * 0.2;
      }

      const finalScore = Math.round(Math.min(99, Math.max(15, weightedScore)));

      // Generate explainable match justifications
      let whyText = '';
      if (isCritical) {
        if (dist < 4) {
          whyText = `Critical proximity. This hospital is only ${dist} km away, ensuring minimal transit time, combined with available ICU beds (${icuAvail}/${icuTotal}).`;
        } else if (icuAvail > 3) {
          whyText = `High critical care capacity. Currently hosting ${icuAvail} vacant ICU slots, reducing intake delay significantly for trauma triage cases.`;
        } else {
          whyText = `Optimal queue velocity. Despite distance, wait speed is clocked at ${h.queue.waitTimeMinutes} mins, bypassing congested local clinics.`;
        }
      } else {
        if (specMatch && h.rating >= 4.5) {
          whyText = `Perfect specialist match. Ranked highly for ${triageResult?.department} care (${h.rating} stars) with competitive packaging costs.`;
        } else if (h.costs.consultation <= 600) {
          whyText = `Cost-effective consultation. High priority match for budget parameters with standard diagnostics accessibility.`;
        } else {
          whyText = `Highly rated clinic. Preferred local specialist facility with low generalized waiting list volume.`;
        }
      }

      return {
        ...h,
        distance: dist,
        travelTime,
        suitabilityScore: finalScore,
        whyText
      };
    });
  };

  const scoredHospitals = computeScoredHospitals();

  // Apply filters and sorting
  const filteredHospitals = scoredHospitals.filter((h) => {
    // 1. Distance filter
    if (h.distance > maxDistance) return false;

    // 2. Cost filter
    if (h.costs.consultation > maxCost) return false;

    // 3. Specialty filter
    if (selectedSpecialty !== 'All' && !h.specializations.includes(selectedSpecialty)) return false;

    // 4. Facilities filter
    for (const fac of selectedFacilities) {
      if (!h.facilities.includes(fac as any)) return false;
    }

    return true;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === 'distance') return a.distance - b.distance;
    if (sortBy === 'wait') return a.queue.waitTimeMinutes - b.queue.waitTimeMinutes;
    if (sortBy === 'cost') return a.costs.consultation - b.costs.consultation;
    return b.suitabilityScore - a.suitabilityScore; // Default: suitability
  });

  const handleSelectForCompare = (h: Hospital) => {
    setSelectedForCompare((prev) => {
      const exists = prev.find((item) => item.id === h.id);
      if (exists) {
        return prev.filter((item) => item.id !== h.id);
      }
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, h];
    });
  };

  const toggleFacility = (fac: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  return (
    <div className="flex-1 bg-[#060a08] text-white min-h-screen py-8 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[8%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[8%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[30%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back and header status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[10px]">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
          >
            ← Back to Landing Page
          </button>
          <span className="text-white/40 uppercase tracking-widest font-black">
            Havenline Node Recommendations
          </span>
        </div>

        {/* Fast-Track Emergency Alert Banner */}
        {(fastTrackParam || triageResult?.urgency === 'Critical') && (
          <div className="bg-red-950/30 text-white rounded-2xl p-6 border border-red-500/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />
            <div className="space-y-1 font-mono">
              <h2 className="text-base font-black tracking-widest uppercase flex items-center gap-2 text-red-400">
                <Flame className="shrink-0 text-red-500" size={18} /> EMERGENCY FAST-TRACK ACTIVE
              </h2>
              <p className="text-xs opacity-90 max-w-xl font-sans leading-relaxed text-red-300">
                Bypassing standard appointment queues. Showing nearest Delhi NCR hospitals with active emergency wings, trauma surgeons, and vacant beds.
              </p>
            </div>
            <button
              onClick={() => {
                const nearest = sortedHospitals[0];
                if (nearest) {
                  router.push(`/portal/booking?hospitalId=${nearest.id}`);
                }
              }}
              className="px-6 py-3 bg-red-650 hover:bg-red-600 text-white rounded-xl font-black text-[10px] tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              Route to Best Emergency Wing <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-wider uppercase font-mono">AI Recommended Providers</h2>
            <p className="text-[10px] text-white/60 uppercase font-mono">
              Delhi NCR coordinates matched against specialized departments and current queue capacity.
            </p>
          </div>

          {/* Comparison floating button */}
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl font-black text-[10px] tracking-wider uppercase shadow-lg shadow-cyan-500/10 transition-all flex items-center gap-1.5 self-start md:self-auto"
            >
              Compare Providers ({selectedForCompare.length}/3)
            </button>
          )}
        </div>

        {/* Filter / List Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel filters: 3 cols */}
          <div className="lg:col-span-3 bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-5 space-y-6 shadow-xl backdrop-blur-xl font-mono text-xs text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider text-xs">
                <Sliders size={14} className="text-[#00B8D4]" /> Filter Criteria
              </h3>
              <button 
                onClick={() => {
                  setMaxDistance(30);
                  setMaxCost(2000);
                  setMinRating(0);
                  setSelectedFacilities([]);
                  setSelectedSpecialty('All');
                }}
                className="text-[9px] text-emerald-400 hover:text-emerald-350 hover:underline uppercase transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Specialized Department</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-400 focus:outline-none transition-all"
                style={{ colorScheme: 'dark' }}
              >
                <option value="All" className="bg-slate-900 text-white">All Specializations</option>
                <option value="Cardiology" className="bg-slate-900 text-white">Cardiology (Heart)</option>
                <option value="Pulmonology" className="bg-slate-900 text-white">Pulmonology (Lungs)</option>
                <option value="Neurology" className="bg-slate-900 text-white">Neurology (Brain)</option>
                <option value="Orthopedics" className="bg-slate-900 text-white">Orthopedics (Bones)</option>
                <option value="Pediatrics" className="bg-slate-900 text-white">Pediatrics (Children)</option>
                <option value="General Medicine" className="bg-slate-900 text-white">General Medicine</option>
                <option value="Dentistry" className="bg-slate-900 text-white">Dentistry (Dental)</option>
                <option value="Gynaecology" className="bg-slate-900 text-white">Gynaecology (Women Care)</option>
                <option value="Dermatology" className="bg-slate-900 text-white">Dermatology (Skin)</option>
                <option value="Ophthalmology" className="bg-slate-900 text-white">Ophthalmology (Eye)</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-wider font-bold">
                <span>Max Distance</span>
                <span className="text-emerald-400 font-bold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Consultation Cost Cap */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-wider font-bold">
                <span>Max Consultation Cost</span>
                <span className="text-emerald-400 font-bold">₹{maxCost}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxCost}
                onChange={(e) => setMaxCost(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Facilities required */}
            <div className="space-y-2.5">
              <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Required Facilities</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['ICU', 'MRI', 'CT Scan', 'Cath Lab', 'Ventilator', 'Emergency OT', 'NICU'].map((fac) => {
                  const active = selectedFacilities.includes(fac);
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`text-[9px] py-2 px-2.5 rounded-lg border text-left font-bold transition-all ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-450 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {fac}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting controls */}
            <div className="space-y-2.5 border-t border-white/10 pt-4">
              <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold block">Sort By</label>
              <div className="grid grid-cols-2 gap-1.5 font-bold">
                {[
                  { id: 'suitability', label: 'Suitability' },
                  { id: 'distance', label: 'Distance' },
                  { id: 'wait', label: 'Wait Time' },
                  { id: 'cost', label: 'Consult Fee' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id as any)}
                    className={`text-[9px] py-2 px-2 rounded-lg border text-center transition-all ${
                      sortBy === option.id
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel hospital listing: 9 cols */}
          <div className="lg:col-span-9 space-y-6">
            {sortedHospitals.length === 0 ? (
              <div className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl backdrop-blur-xl">
                <ShieldAlert className="w-12 h-12 text-white/40 mx-auto animate-pulse" />
                <h4 className="font-extrabold text-white font-mono uppercase tracking-wider text-xs">No Matching Providers</h4>
                <p className="text-[11px] text-white/60 max-w-sm mx-auto font-sans leading-relaxed">
                  Try broadening your distance slider or resetting your active diagnostic filters to see more recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                
                {/* Horizontal Navigation controls */}
                <div className="flex items-center justify-between gap-4 bg-[#0a0f0d]/40 border border-white/5 rounded-2xl p-3.5 backdrop-blur-md shadow-md">
                  <button
                    type="button"
                    disabled={carouselIndex === 0}
                    onClick={() => {
                      const newIdx = carouselIndex - 1;
                      setCarouselIndex(newIdx);
                      setSelectedHospital(sortedHospitals[newIdx]);
                    }}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md shrink-0 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider"
                  >
                    <ChevronLeft size={14} className="stroke-[3]" /> Prev Match
                  </button>

                  <div className="text-center font-mono text-[10px] tracking-widest text-emerald-400 font-extrabold uppercase animate-pulse">
                    // RECOMMENDATION {carouselIndex + 1} OF {sortedHospitals.length} //
                  </div>

                  <button
                    type="button"
                    disabled={carouselIndex === sortedHospitals.length - 1}
                    onClick={() => {
                      const newIdx = carouselIndex + 1;
                      setCarouselIndex(newIdx);
                      setSelectedHospital(sortedHospitals[newIdx]);
                    }}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md shrink-0 flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider"
                  >
                    Next Match <ChevronRight size={14} className="stroke-[3]" />
                  </button>
                </div>

                {/* Single Active Hospital Card viewport */}
                {(() => {
                  const h = sortedHospitals[carouselIndex];
                  if (!h) return null;
                  const inCompare = selectedForCompare.some(item => item.id === h.id);
                  const isFocused = selectedHospital?.id === h.id;
                  const isTopMatch = carouselIndex === 0 && sortBy === 'suitability';
                  const activeQueue = (activeCardDept !== 'Global' && h.departmentQueues && h.departmentQueues[activeCardDept])
                    ? h.departmentQueues[activeCardDept]
                    : h.queue;

                  return (
                    <div 
                      onClick={() => setSelectedHospital(h)}
                      className={`bg-[#0a0f0d]/75 border rounded-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 gap-0 relative cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                        isFocused
                          ? 'border-emerald-400 shadow-[0_10px_35px_rgba(52,211,153,0.2)]'
                          : isTopMatch
                            ? 'border-emerald-400/60 shadow-[0_10px_25px_rgba(52,211,153,0.1)]'
                            : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur text-white text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-md border border-white/10 font-mono uppercase">
                        {h.isClinic ? 'CLINIC' : 'HOSPITAL'} // RANK #{carouselIndex + 1}
                      </div>

                      {/* Image block: 3 cols */}
                      <div className="relative md:col-span-3 min-h-[160px] md:min-h-full bg-slate-900">
                        <img 
                          src={h.imageUrl} 
                          alt={h.name} 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d]/75 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0a0f0d]/75" />
                      </div>

                      {/* Content Block: 9 cols */}
                      <div className="p-5 md:col-span-9 flex flex-col justify-between space-y-4 text-white">
                        
                        {/* Name, rating, distance */}
                        <div className="space-y-1 text-xs">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h3 className="font-extrabold text-white tracking-tight text-base sm:text-md">
                              {h.name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto font-mono">
                              <span className="font-black text-slate-950 bg-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider shadow-[0_4px_10px_rgba(52,211,153,0.15)]">
                                SUITABILITY: {h.suitabilityScore}%
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/50 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-emerald-400" /> 
                              {h.distance} km away (~{h.travelTime} mins)
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star size={13} fill="#00B8D4" className="text-[#00B8D4]" />
                              <strong className="text-white">{h.rating}</strong> ({h.reviewsCount} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Bed availability status strip */}
                        <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/10 p-3 rounded-xl text-center font-mono">
                          <div>
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">ICU Beds</p>
                            <p className={`text-xs font-black mt-0.5 ${h.beds.icu.available > 0 ? 'text-emerald-400' : 'text-red-405'}`}>
                              {h.beds.icu.available} <span className="text-[9px] text-white/30 font-normal">/ {h.beds.icu.total}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Emergency</p>
                            <p className={`text-xs font-black mt-0.5 ${h.beds.emergency.available > 0 ? 'text-emerald-400' : 'text-red-405'}`}>
                              {h.beds.emergency.available} <span className="text-[9px] text-white/30 font-normal">/ {h.beds.emergency.total}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Gen Ward</p>
                            <p className="text-xs font-black mt-0.5 text-white/80">
                              {h.beds.general.available} <span className="text-[9px] text-white/30 font-normal">/ {h.beds.general.total}</span>
                            </p>
                          </div>
                        </div>

                        {/* Live Telemetry & Queue status strip */}
                        <div className="space-y-2.5 bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl font-mono">
                          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span className="text-[9px] text-emerald-450 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                              <Clock size={12} className="text-emerald-400" /> Live Queue Triage
                            </span>
                            <select
                              value={activeCardDept}
                              onChange={(e) => {
                                e.stopPropagation();
                                setActiveCardDept(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent card focus toggles
                              className="text-[9px] font-black uppercase tracking-wider rounded border border-white/10 bg-[#0a0f0d] text-white focus:border-emerald-450 focus:outline-none py-0.5 px-2 font-mono cursor-pointer"
                              style={{ colorScheme: 'dark' }}
                            >
                              <option value="Global">General / Global</option>
                              {h.specializations.map((spec) => (
                                <option key={spec} value={spec}>{spec} Dept</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
                            <div>
                              <p className="text-[9px] text-white/50 uppercase tracking-wider">Patients In Queue</p>
                              <p className="text-xs font-black mt-0.5 text-white">
                                {activeQueue.length} <span className="text-[9px] text-white/40 font-normal">waiting ahead</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/50 uppercase tracking-wider">Est. Turn Wait</p>
                              <p className="text-xs font-black mt-0.5 text-white">
                                ~{activeQueue.waitTimeMinutes} <span className="text-[9px] text-white/40 font-normal">minutes wait</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Explainable AI block */}
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-white leading-relaxed flex items-start gap-2">
                          <TrendingUp size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div className="font-sans text-[11px] text-white/90">
                            <strong className="text-emerald-400 font-mono tracking-wider text-[10px] uppercase block mb-0.5">Why recommended:</strong> {h.whyText}
                          </div>
                        </div>

                        {/* Review Summarizer */}
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <p className="text-white/40 uppercase tracking-widest font-black">AI Patient Sentiment</p>
                          <p className="text-white/70 leading-relaxed font-sans text-xs">{h.reviewSummary.summary}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[9px] uppercase tracking-wider font-bold font-mono">
                            <div className="flex items-center gap-1 text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Pros: {h.reviewSummary.positive[0]}
                            </div>
                            <div className="flex items-center gap-1 text-red-405">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Cons: {h.reviewSummary.negative[0]}
                            </div>
                          </div>
                        </div>

                        {/* Bottom row: Costs & CTAs */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/10 pt-4 gap-4">
                          
                          {/* Cost breakdown */}
                          <div className="space-y-1 font-mono text-xs">
                            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                              <BadgeIndianRupee size={12} /> Cost Breakdown
                            </p>
                            <div className="flex items-baseline gap-1.5 text-white/70">
                              <span className="text-sm font-black text-white">₹{h.costs.consultation}</span>
                              <span className="text-[10px] text-white/50">consult</span>
                              <span className="text-white/20">|</span>
                              <span className="text-xs font-bold text-emerald-400 font-black">₹{h.costs.consultation + h.costs.estDiagnostics + h.costs.estMedicines}</span>
                              <span className="text-[10px] text-white/50">pkg estimate</span>
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="flex items-center gap-2 w-full sm:w-auto font-mono">
                            
                            {/* Compare toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectForCompare(h);
                              }}
                              className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${
                                inCompare
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10'
                                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                              title="Add to side-by-side comparison"
                            >
                              {inCompare ? <Check size={14} className="stroke-[3]" /> : <Plus size={14} className="stroke-[3]" />}
                            </button>

                            {/* Book Appointment */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/portal/booking?hospitalId=${h.id}`);
                              }}
                              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-md shadow-emerald-500/10 text-center transition-colors"
                            >
                              Book Appointment
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Dashboard pagination indicator dots */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {sortedHospitals.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCarouselIndex(idx);
                        setSelectedHospital(sortedHospitals[idx]);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === carouselIndex 
                          ? 'w-6 bg-emerald-400' 
                          : 'w-2 bg-white/10 hover:bg-white/30'
                      }`}
                    />
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Map Panel is removed from the side grid */}

        </div>

        {/* Map Panel: Full Width at the Bottom */}
        <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0f0d]/75 p-[1px] mt-8 relative z-10">
          <GoogleMap
            hospitals={sortedHospitals}
            selectedHospital={selectedHospital}
            userLocation={userLocation}
            onSelectHospital={(h) => setSelectedHospital(h)}
          />
        </div>
      </div>

      {/* Hospital Comparison Modal Panel */}
      <HospitalCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        selectedHospitals={selectedForCompare}
        onRemove={handleSelectForCompare}
      />
    </div>
  );
}

export default function HospitalRecommendations() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 bg-[#060a08] min-h-screen">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HospitalRecommendationsList />
    </React.Suspense>
  );
}
