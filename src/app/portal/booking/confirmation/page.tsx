'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHavenline } from '../../../../context/HavenlineContext';
import { Appointment } from '../../../../lib/mockDatabase';
import { 
  CheckCircle2, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  BadgeIndianRupee, 
  ArrowRight, 
  ShieldCheck, 
  Printer, 
  Share2,
  Mail,
  Award
} from 'lucide-react';

function ConfirmationDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { appointments } = useHavenline();
  const [appt, setAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (appointmentId) {
      const matched = appointments.find((a) => a.id === appointmentId);
      if (matched) {
        setAppt(matched);
      }
    }
  }, [appointmentId, appointments]);

  if (!appt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#060a08] min-h-screen space-y-4 text-white font-mono text-xs">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-white/50 uppercase tracking-widest">Locating confirmation record...</p>
      </div>
    );
  }

  const totalCost = appt.consultationFee + (appt.consultationFee * 2) + (appt.consultationFee * 0.8);

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[#060a08] min-h-screen relative overflow-hidden text-white font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[15%] left-[12%] w-[360px] h-[360px] bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[15%] right-[12%] w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/20 to-emerald-400/15 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[45%] left-[30%] w-[310px] h-[310px] bg-gradient-to-tr from-teal-400/15 to-emerald-600/15 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-xl mb-6 flex items-center justify-between relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
        >
          ← Back to Landing Page
        </button>
        <span className="text-white/40 uppercase tracking-widest font-black">
          Havenline Confirmation
        </span>
      </div>

      <div className="w-full max-w-xl bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in z-10">
        
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent" />

        {/* Success Header */}
        <div className="text-center space-y-3 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={32} className="animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-black text-white tracking-widest uppercase">APPOINTMENT SECURED</h2>
            <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1 uppercase tracking-wider">
              <ShieldCheck size={14} /> TOKEN ID: {appt.token}
            </p>
            {appt.email && (
              <a 
                href={`/emails/booking_${appt.token}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-[#00B8D4] hover:text-cyan-300 font-bold bg-[#00B8D4]/10 hover:bg-[#00B8D4]/15 border border-[#00B8D4]/20 rounded-full px-3 py-1 inline-flex items-center gap-1.5 mx-auto mt-2 tracking-wider uppercase transition-all"
                title="Open simulated email inbox receipt"
              >
                <Mail size={11} /> Receipt Dispatched: Click to view inbox
              </a>
            )}
          </div>
        </div>

        {/* Pre-arrival Trauma Prep Banner */}
        {appt.urgency === 'Critical' && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-white space-y-1.5 font-mono animate-pulse">
            <div className="flex items-center gap-1.5 text-red-400 font-black uppercase tracking-widest text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>🚨 pre-arrival trauma alert active</span>
            </div>
            <p className="text-[11px] text-white/80 font-sans leading-relaxed">
              Havenline has automatically transmitted a critical alert to <strong>{appt.hospitalName.toUpperCase()}</strong>. Emergency beds, dynamic medical packages, and trauma physician rosters are being prepped in advance of your arrival.
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">RESERVATION SUMMARIES</h3>
          
          <div className="space-y-3.5 text-xs">
            {/* Hospital */}
            <div className="flex gap-3 items-start">
              <MapPin className="text-cyan-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">{appt.hospitalName}</p>
                <p className="text-[10px] text-white/50 mt-1 font-sans leading-relaxed">Narela - Delhi NCR Region Route</p>
              </div>
            </div>

            {/* Doctor */}
            <div className="flex gap-3 items-start">
              <User className="text-emerald-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">{appt.doctorName}</p>
                <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">{appt.department} Department</p>
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex gap-3 items-start">
              <Calendar className="text-white/40 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">{appt.timeSlot}</p>
                <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Confirmed Booking Slot</p>
              </div>
            </div>

            {/* Initial Queue Status */}
            <div className="flex gap-3 items-start">
              <Clock className="text-white/40 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">Queue Spot: #{appt.queuePosition}</p>
                <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Est. Waiting Room Time: ~{appt.estimatedWaitTime} mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Check-In Kiosk Skip-Desk Code */}
        <div className="p-5 bg-white/5 border border-[#00B8D4]/20 rounded-xl space-y-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00B8D4]/40 to-transparent animate-pulse" />
          <style>{`
            @keyframes scanline {
              0% { transform: translateY(0); }
              50% { transform: translateY(132px); }
              100% { transform: translateY(0); }
            }
          `}</style>
          <div className="space-y-1">
            <h4 className="text-[10px] text-white font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Award size={13} className="text-[#00B8D4]" /> QR Self Check-In Kiosk Ticket
            </h4>
            <p className="text-[9px] text-[#00B8D4] font-bold uppercase tracking-wider">
              Scan at hospital entrance to skip reception desk
            </p>
          </div>

          {/* SVG QR Code layout */}
          <div className="w-40 h-40 bg-white p-3 rounded-xl mx-auto shadow-inner relative overflow-hidden group cursor-default">
            {/* Scanner Line Effect */}
            <div 
              className="absolute left-3 right-3 h-[2px] bg-[#00B8D4]/60 top-3 pointer-events-none"
              style={{ animation: 'scanline 3s infinite linear' }}
            />
            
            <svg viewBox="0 0 100 100" className="w-full h-full text-black">
              {/* Position Anchors */}
              <rect x="0" y="0" width="25" height="25" fill="black" />
              <rect x="5" y="5" width="15" height="15" fill="white" />
              <rect x="9" y="9" width="7" height="7" fill="black" />
              
              <rect x="75" y="0" width="25" height="25" fill="black" />
              <rect x="80" y="5" width="15" height="15" fill="white" />
              <rect x="84" y="9" width="7" height="7" fill="black" />
              
              <rect x="0" y="75" width="25" height="25" fill="black" />
              <rect x="5" y="80" width="15" height="15" fill="white" />
              <rect x="9" y="84" width="7" height="7" fill="black" />
              
              <rect x="75" y="75" width="10" height="10" fill="black" />
              <rect x="78" y="78" width="4" height="4" fill="white" />
              <rect x="79" y="79" width="2" height="2" fill="black" />
              
              {/* Random Data Blocks */}
              <rect x="30" y="5" width="5" height="10" fill="black" />
              <rect x="40" y="0" width="10" height="5" fill="black" />
              <rect x="55" y="10" width="5" height="5" fill="black" />
              <rect x="65" y="5" width="5" height="15" fill="black" />
              <rect x="35" y="20" width="15" height="5" fill="black" />
              <rect x="55" y="25" width="10" height="5" fill="black" />
              <rect x="5" y="35" width="5" height="10" fill="black" />
              <rect x="20" y="30" width="10" height="15" fill="black" />
              <rect x="45" y="35" width="15" height="5" fill="black" />
              <rect x="70" y="30" width="5" height="10" fill="black" />
              <rect x="85" y="35" width="10" height="5" fill="black" />
              <rect x="10" y="50" width="20" height="5" fill="black" />
              <rect x="35" y="45" width="10" height="10" fill="black" />
              <rect x="60" y="50" width="15" height="5" fill="black" />
              <rect x="80" y="45" width="5" height="15" fill="black" />
              <rect x="0" y="60" width="10" height="5" fill="black" />
              <rect x="25" y="65" width="5" height="5" fill="black" />
              <rect x="40" y="60" width="15" height="10" fill="black" />
              <rect x="65" y="65" width="5" height="10" fill="black" />
              <rect x="35" y="80" width="10" height="5" fill="black" />
              <rect x="55" y="85" width="15" height="10" fill="black" />
              <rect x="70" y="80" width="5" height="5" fill="black" />
              <rect x="90" y="70" width="5" height="5" fill="black" />
            </svg>
          </div>

          <div className="text-[9px] text-white/50 leading-relaxed font-sans px-2">
            Scan this ticket code at the entrance kiosk. It will automatically check you in, notify Cabin doctors, and skip the manual reception desk queues!
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 text-xs text-white/70">
          <h4 className="text-[9px] text-white/50 font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-2">
            <BadgeIndianRupee size={12} className="text-emerald-400" /> Subsidized Financial Summary
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>OPD CONSULTATION FEE:</span>
              <span className="text-white font-bold">₹{appt.consultationFee}</span>
            </div>
            <div className="flex justify-between">
              <span>EST. DIAGNOSTICS (ECG/BLOOD):</span>
              <span className="text-white font-bold">₹{Math.round(appt.consultationFee * 2)}</span>
            </div>
            <div className="flex justify-between">
              <span>EST. MEDICATION PACK:</span>
              <span className="text-white font-bold">₹{Math.round(appt.consultationFee * 0.8)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2.5 font-black text-white">
              <span>ESTIMATED TOTAL OUTLAY:</span>
              <span className="text-emerald-400 font-black text-sm">₹{Math.round(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Quick actions print / share */}
        <div className="flex items-center justify-center gap-6 text-[10px] text-white/50 font-extrabold border-t border-white/10 pt-4 uppercase tracking-wider">
          <button 
            type="button" 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          >
            <Printer size={13} /> Print Ticket
          </button>
          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Confirmation link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          >
            <Share2 size={13} /> Share Stub
          </button>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={() => router.push('/portal/queue')}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
          >
            TRACK LIVE QUEUE PROGRESS <ArrowRight size={14} className="stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 bg-[#060a08] min-h-screen">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationDetail />
    </React.Suspense>
  );
}
