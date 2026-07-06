'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { Hospital, Doctor } from '../../../lib/mockDatabase';
import { 
  Calendar, 
  Clock, 
  User, 
  BadgeIndianRupee, 
  ChevronRight, 
  AlertTriangle,
  HeartPulse,
  Flame,
  CheckCircle2,
  Mail,
  UserCheck,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GoogleMap from '../../../components/google-map';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM'
];

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');

  const { 
    hospitals, 
    triageResult, 
    bookAppointment, 
    activeAppointment,
    userLocation
  } = useHavenline();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [email, setEmail] = useState('');
  
  // Loading & error states
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);



  // Initialize hospital details
  useEffect(() => {
    if (!hospitalId) {
      if (hospitals.length > 0) {
        router.replace(`/portal/booking?hospitalId=${hospitals[0].id}`);
      }
      return;
    }

    const matched = hospitals.find((h) => h.id === hospitalId);
    if (matched) {
      setHospital(matched);
      
      // Auto pre-fill recommended department from triage
      if (triageResult && triageResult.urgency === 'Critical' && matched.specializations.includes('Emergency Medicine')) {
        setSelectedDept('Emergency Medicine');
      } else if (triageResult && matched.specializations.includes(triageResult.department)) {
        setSelectedDept(triageResult.department);
      } else if (matched.specializations.length > 0) {
        setSelectedDept(matched.specializations[0]);
      }
    }
  }, [hospitalId, hospitals, triageResult, router]);

  // Sync doctors based on department selection
  useEffect(() => {
    if (!hospital) return;
    let docs = hospital.doctors.filter(d => d.specialization === selectedDept);
    if (docs.length === 0) {
      // Fallback to General Medicine / Emergency if specialist lacks roster
      docs = hospital.doctors.filter(d => d.specialization === 'General Medicine' || d.specialization === 'Emergency Medicine');
      if (docs.length === 0) {
        docs = hospital.doctors; // Absolute fallback
      }
    }
    setAvailableDoctors(docs);
    
    // Select first available doctor by default
    const firstAvail = docs.find(d => d.available) || docs[0] || null;
    setSelectedDoctor(firstAvail);
  }, [selectedDept, hospital]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital || !selectedDoctor || !selectedSlot) return;

    setIsBooking(true);
    setBookingError('');
    setSuggestedSlots([]);

    // Call concurrency-safe booking logic in context
    const res = await bookAppointment(
      hospital.id,
      selectedDoctor.name,
      selectedSlot,
      selectedDept,
      triageResult?.urgency || 'Low',
      triageResult?.symptoms || 'Routine clinical visit',
      triageResult?.explanation,
      triageResult?.suggestedTests,
      triageResult?.doctorQuestions,
      email
    );

    setIsBooking(false);

    if (res.success && res.appointment) {
      setBookingSuccess(true);
      
      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00C853', '#00B8D4', '#ffffff']
      });

      // Redirect to confirmation receipt page after 2 seconds
      setTimeout(() => {
        router.push(`/portal/booking/confirmation?appointmentId=${res.appointment?.id}`);
      }, 2000);
    } else {
      // Concurrency conflict occurred!
      setBookingError(res.error || 'The slot was booked. Please select another.');
      if (res.recommendedSlots) {
        setSuggestedSlots(res.recommendedSlots);
      }
    }
  };

  if (!hospital) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 bg-[#060a08] min-h-screen">
        <div className="w-5 h-5 border-2 border-emerald-505 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-6 py-12 bg-[#060a08] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[10%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[35%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-6xl mb-6 flex items-center justify-between relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
        >
          ← Back to Landing Page
        </button>
        <span className="text-white/40 uppercase tracking-widest font-black">
          Havenline Secure Booking
        </span>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-7 bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in text-white">
          
          {/* Top boundary element ornament */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent" />

          {/* Title */}
          <div className="space-y-1 font-mono">
            <h2 className="text-base font-black text-white tracking-widest uppercase flex items-center gap-2">
              <Calendar className="text-emerald-400" size={20} /> LOCK_RESERVATION
            </h2>
            <p className="text-[10px] text-white/50 uppercase font-bold">
              RESERVING APPOINTMENT KEY AT {hospital.name.toUpperCase()}
            </p>
          </div>

          {/* Success splash overlay */}
          {bookingSuccess && (
            <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-4 animate-fade-in font-mono text-xs text-white">
              <CheckCircle2 className="w-12 h-12 text-emerald-450 mx-auto animate-bounce" />
              <h3 className="font-extrabold uppercase tracking-wider text-emerald-400">Booking Secured!</h3>
              <p className="text-[11px] text-white/75 max-w-sm mx-auto leading-relaxed font-sans font-medium">
                Your appointment is locked, and your unique queue ticket token has been successfully generated. Redirecting to receipt stub...
              </p>
            </div>
          )}

          {!bookingSuccess && (
            <>
              {/* Concurrency Error Banner */}
              {bookingError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 space-y-3 text-xs text-white animate-fade-in font-mono">
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-red-400">
                    <AlertTriangle className="shrink-0 text-red-500 animate-pulse" size={16} />
                    <span>Slot Collision Detected</span>
                  </div>
                  <p className="opacity-90 leading-relaxed font-sans text-white/80">
                    {bookingError} Another patient secured the slot milliseconds before your request finalized.
                  </p>
                  {suggestedSlots.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-bold text-red-400 uppercase tracking-wider text-[9px]">Recommended alternate slots:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setBookingError('');
                              setSuggestedSlots([]);
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-red-500/25 bg-white/5 text-white font-bold hover:bg-white/10 hover:border-red-400 transition-all shadow-sm"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-6 font-mono text-xs">
                
                {/* Department selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Select Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-400 focus:outline-none transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    {hospital.specializations.map((spec) => (
                      <option key={spec} value={spec} className="bg-slate-900 text-white">{spec} Department</option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Available Roster Specialists</label>
                  {availableDoctors.length === 0 ? (
                    <div className="p-4 bg-white/5 border border-white/10 text-center rounded-xl text-white/60">
                      No roster lists mapped for this department. Try selecting another segment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableDoctors.map((doc) => {
                        const active = selectedDoctor?.id === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => doc.available && setSelectedDoctor(doc)}
                            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                              !doc.available 
                                ? 'opacity-40 cursor-not-allowed bg-black/20 border-white/5 text-white/40' 
                                : active
                                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 font-bold shadow-sm shadow-emerald-400/5'
                                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg border shrink-0 ${active ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/40'}`}>
                              <User size={14} />
                            </div>
                            <div className="leading-tight space-y-1">
                              <h4 className="font-extrabold text-[11px] tracking-tight">{doc.name}</h4>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${doc.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                <span className="text-[9px] uppercase tracking-wider font-mono text-white/40">{doc.statusText}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Time slots */}
                <div className="space-y-2.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Select Appointment Slot</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const active = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 rounded-xl border text-center text-[10px] tracking-wider uppercase font-bold transition-all ${
                            active
                              ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-sm shadow-emerald-400/5'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>                {/* Email Notifications */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Mail size={12} /> Contact Notification Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. anubhav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white placeholder-white/20 focus:border-emerald-400 focus:outline-none transition-all font-sans"
                  />
                  <p className="text-[8px] text-white/30 font-mono tracking-wide mt-1 uppercase">
                    * Simulates a transaction receipt ticket to the entered address.
                  </p>
                </div>

                {/* Costs estimation footer */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-[10px] text-white/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-extrabold uppercase tracking-wider text-white">Estimated Consult Fee</p>
                    <p className="text-[9px] text-white/40">Includes local tax calculations</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">₹{hospital.costs.consultation}</span>
                </div>

                {/* Submit Reservation */}
                <button
                  type="submit"
                  disabled={isBooking || !selectedDoctor || !selectedSlot}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl disabled:bg-white/5 disabled:text-white/30 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  {isBooking ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      RESERVING CONCURRENCY LOCK...
                    </>
                  ) : (
                    <>
                      Lock Clinical Appointment <ChevronRight size={14} />
                    </>
                  )}
                </button>

              </form>
            </>
          )}

        </div>

        {/* Right Column - Location Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-4 space-y-3 font-mono text-white">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
              <Award size={14} className="text-cyan-400" /> Clinic Location Coordinates
            </h3>
            <div className="h-[380px] rounded-xl overflow-hidden border border-white/10 bg-[#0a0f0d]/75 p-[1px]">
              <GoogleMap
                hospitals={[hospital]}
                selectedHospital={hospital}
                userLocation={userLocation}
                onSelectHospital={() => {}}
              />
            </div>
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-xs text-white/70">
              <p className="font-extrabold text-white uppercase tracking-wider">{hospital.name}</p>
              <p className="text-[11px] leading-relaxed font-sans text-white/55">{hospital.address}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 bg-[#060a08] min-h-screen">
        <div className="w-5 h-5 border-2 border-emerald-505 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </React.Suspense>
  );
}
