'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { 
  Heart, 
  Clock, 
  User, 
  MapPin, 
  TrendingDown, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Award
} from 'lucide-react';

export default function QueueTracker() {
  const router = useRouter();
  const { activeAppointment, cancelAppointment } = useHavenline();
  const [pulseSync, setPulseSync] = useState(false);

  // Simulated logs state for the Live Kiosk Log Stream
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (activeAppointment) {
      const now = new Date();
      setLogs([
        `[${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Kiosk: Patient ${activeAppointment.token} check-in verified via QR scanner.`,
        `[${new Date(Date.now() - 50000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Cabin 2: Dr. SB Singh called Token T-184`,
        `[${new Date(Date.now() - 170000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Triage: Priority critical bypass alert for Ticket T-189`
      ]);
    }
  }, [activeAppointment?.token]);

  useEffect(() => {
    if (!activeAppointment) return;
    const logPool = [
      "Kiosk: New self check-in verified via QR scanner. Queue spot allocated.",
      "Triage: Routine wait time adjusted based on doctor speed index.",
      "Cabin 1: Patient T-182 completed consultation. Room clearing.",
      "Reception: General check-in handled. Bypassing manual entry.",
      "System: Live server handshake verified. Heartbeat tick OK."
    ];

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 2)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [activeAppointment]);

  // Trigger brief pulse animation when appointment details change (representing live ticks)
  useEffect(() => {
    if (activeAppointment) {
      setPulseSync(true);
      const timer = setTimeout(() => setPulseSync(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeAppointment?.queuePosition, activeAppointment?.estimatedWaitTime]);

  if (!activeAppointment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#060a08] min-h-screen space-y-5 font-mono text-xs text-white relative overflow-hidden">
        
        {/* Moving Lovely Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob-animate-1 absolute top-[15%] left-[10%] w-[360px] h-[360px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
          <div className="blob-animate-2 absolute bottom-[15%] right-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        </div>

        <div className="w-full max-w-xs flex items-center justify-between relative z-10 text-[10px]">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
          >
            ← Back to Landing Page
          </button>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner relative z-10">
          <Heart size={28} className="text-white/30 animate-pulse" />
        </div>
        <div className="text-center space-y-2 relative z-10">
          <h3 className="font-extrabold text-white uppercase tracking-wider">No Active Tickets</h3>
          <p className="text-[11px] text-white/50 max-w-xs mx-auto leading-relaxed font-sans font-medium">
            You do not currently have any active queue tickets. Input your clinical symptoms in the portal to book a recommended slot.
          </p>
        </div>
        <button
          onClick={() => router.push('/portal')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10 transition-all relative z-10"
        >
          Go to Symptom Analyzer
        </button>
      </div>
    );
  }

  const isNext = activeAppointment.queuePosition === 1 || activeAppointment.estimatedWaitTime === 0;

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[#060a08] min-h-screen relative overflow-hidden text-white font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[15%] left-[12%] w-[360px] h-[360px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[15%] right-[12%] w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[45%] left-[30%] w-[310px] h-[310px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-xl mb-6 flex items-center justify-between relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
        >
          ← Back to Landing Page
        </button>
        <span className="text-white/40 uppercase tracking-widest font-black">
          Havenline Queue ticket
        </span>
      </div>

      <div className="w-full max-w-xl bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in z-10">
        
        {/* Top border color indicator based on severity */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          activeAppointment.urgency === 'Critical' 
            ? 'bg-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.3)]' 
            : activeAppointment.urgency === 'High' 
              ? 'bg-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.3)]' 
              : 'bg-[#00C853] shadow-[0_4px_15px_rgba(52,211,153,0.3)]'
        }`} />

        {/* Sync Status Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${pulseSync ? 'animate-ping' : ''}`} />
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
              {pulseSync ? 'RECEIVING LIVE TICKS...' : 'LIVE CONNECTED TO BOARD'}
            </span>
          </div>
          <span className="text-[10px] font-black text-white/60 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
            TICKET: {activeAppointment.token}
          </span>
        </div>

        {/* Queue Progress Panel */}
        <div className="text-center py-6 space-y-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-xl rounded-full" />
          <div className="space-y-1">
            <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">Patients Ahead of You</p>
            <p className={`text-5xl font-black text-white tracking-tighter transition-all duration-500 ${
              pulseSync ? 'scale-110 text-emerald-400' : ''
            }`}>
              {activeAppointment.queuePosition}
            </p>
          </div>

          {/* Warning or Fast track status */}
          {activeAppointment.urgency === 'Critical' && (
            <div className="mx-6 p-2 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-[9px] font-extrabold flex items-center justify-center gap-1.5 animate-pulse uppercase tracking-wider">
              <Zap size={13} className="shrink-0 text-red-400" />
              <span>EMERGENCY BYPASS ACTIVE: INTAKE READY</span>
            </div>
          )}

          {/* Time tracker */}
          <div className="flex items-center justify-center gap-5 text-[10px] font-bold text-white/50 border-t border-white/10 pt-4 mx-6">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-emerald-400" />
              <span>EST_WAIT: <strong className="text-white">{activeAppointment.estimatedWaitTime} MINS</strong></span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-cyan-400" />
              <span>PRIORITY: <strong className="text-white uppercase">{activeAppointment.urgency}</strong></span>
            </div>
          </div>
        </div>

        {/* Live notification alerts */}
        {isNext && (
          <div className="p-4 rounded-xl bg-[#00B8D4]/10 border border-[#00B8D4]/30 text-[10px] text-white font-black uppercase tracking-widest text-center animate-pulse flex items-center justify-center gap-1.5 shadow-sm">
            <ShieldCheck size={16} className="text-[#00B8D4]" />
            <span>YOU ARE NEXT! SCAN QR AT SECTOR-4 KIOSK TO BYPASS RECEPTION AND ENTER THE CABIN directly.</span>
          </div>
        )}

        {/* Live Waiting Room Telemetry Board */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 text-xs text-white/70 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-[9px] text-white/50 font-black uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={12} className="text-[#00B8D4] animate-pulse" /> Live Waiting Room Status
            </h4>
            <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/20 border border-cyan-500/20 px-2 py-0.5 rounded">
              SECTOR-4 CABINS
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
              <span className="text-[7.5px] text-white/40 block font-black uppercase">CURRENTLY SERVING</span>
              <span className="text-xs font-black text-[#00B8D4]">T-{Math.max(101, parseInt(activeAppointment.token.split('-')[1] || '104') - 3)}</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
              <span className="text-[7.5px] text-white/40 block font-black uppercase">ROOM OCCUPANCY</span>
              <span className="text-xs font-black text-emerald-400">12 / 85%</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
              <span className="text-[7.5px] text-white/40 block font-black uppercase">AV. DOCTOR PACE</span>
              <span className="text-xs font-black text-amber-400">12m / pat</span>
            </div>
          </div>

          {/* Barcode & Digital Token scan-ready ticker */}
          <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] text-white/40 block font-black uppercase">DIGITAL TOKEN SPEC</span>
              <span className="text-xs font-extrabold text-white tracking-widest">{activeAppointment.token}</span>
            </div>
            {/* Barcode representation */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-end gap-[1px] h-6 bg-white/5 p-1 rounded">
                <div className="w-[1.5px] h-full bg-white/70" />
                <div className="w-[3px] h-full bg-white/70" />
                <div className="w-[1px] h-full bg-white/70" />
                <div className="w-[2px] h-full bg-white/70" />
                <div className="w-[1.5px] h-full bg-white/70" />
                <div className="w-[4px] h-full bg-white/70" />
                <div className="w-[1px] h-full bg-white/70" />
                <div className="w-[2.5px] h-full bg-white/70" />
                <div className="w-[1.5px] h-full bg-white/70" />
              </div>
              <span className="text-[7px] text-white/30 tracking-widest mt-1">CHECK-IN ACTIVE</span>
            </div>
          </div>

          {/* Kiosk Log Stream */}
          <div className="space-y-2 text-left">
            <span className="text-[8px] text-white/40 block font-black uppercase">LIVE KIOSK EVENT FEED</span>
            <div className="p-2.5 bg-black/50 border border-white/5 rounded-lg font-mono text-[9px] text-white/50 space-y-1.5 min-h-[60px] flex flex-col justify-start">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2 items-start animate-fade-in truncate">
                  <span className="text-cyan-400 font-bold shrink-0">{log.substring(0, 10)}</span>
                  <span className="text-white/70 font-sans leading-none">{log.substring(10)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Details card */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <h4 className="text-[9px] text-white/40 font-black uppercase tracking-widest">ADMISSION TELEMETRY</h4>
          
          <div className="space-y-3.5 text-xs">
            {/* Hospital details */}
            <div className="flex gap-3">
              <MapPin className="text-cyan-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">{activeAppointment.hospitalName}</p>
                <p className="text-white/50 text-[10px] mt-1 font-sans leading-relaxed">Narela - Delhi NCR Region Route</p>
              </div>
            </div>

            {/* Doctor details */}
            <div className="flex gap-3">
              <User className="text-emerald-400 shrink-0 mt-0.5" size={15} />
              <div>
                <p className="font-extrabold text-white uppercase tracking-wider">{activeAppointment.doctorName}</p>
                <p className="text-white/50 text-[10px] mt-1 uppercase tracking-wider font-bold">
                  SCHEDULED: {activeAppointment.timeSlot} // {activeAppointment.department}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Directions / ETA */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[10px] text-white/55">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>TRANSIT_ETA: <strong>~{activeAppointment.etaMinutes} MINS</strong></span>
          </div>
          <button
            onClick={() => router.push(`/portal/hospitals?fastTrack=${activeAppointment.urgency === 'Critical'}`)}
            className="text-[9px] text-cyan-455 hover:text-cyan-300 font-black uppercase tracking-wider flex items-center gap-0.5"
          >
            VIEW ROUTE MAP <ArrowRight size={10} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10 font-mono">
          <button
            onClick={() => cancelAppointment(activeAppointment.id)}
            className="flex-1 py-3.5 border border-red-500/25 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-450 rounded-xl font-bold uppercase tracking-wider text-[9px] transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle size={13} /> CANCEL TICKET
          </button>
          <button
            onClick={() => router.push('/portal')}
            className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[9px] transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            SYMPTOM PORTAL <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
}
