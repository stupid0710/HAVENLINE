'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHavenline } from '../../context/HavenlineContext';
import { Sparkles, Activity, ShieldAlert, HeartCrack, ChevronRight, User, AlertTriangle, ArrowRight, ShieldCheck, Terminal, Heart } from 'lucide-react';

export default function AIControlPortal() {
  const router = useRouter();
  const { currentPatient, triageResult, setTriageResult } = useHavenline();

  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Redirect to onboarding if no profile is found
  useEffect(() => {
    if (!currentPatient) {
      router.push('/portal/profile');
    }
  }, [currentPatient, router]);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setConsoleLogs([
      'Initializing connection to Havenline Triage System...',
      'Injecting patient demographic risk profiles...',
      `Age weight modifier: ${currentPatient?.age || 30} yrs`,
      `History risk tags: [${currentPatient?.medicalHistory.join(', ') || 'none'}]`
    ]);

    // Simulated log stream
    const logs = [
      'Tokenizing clinical keywords...',
      'Evaluating presenting cardiovascular indicators...',
      'Running explainable clinical decision-tree classification...',
      'Calculating department match values and confidence thresholds...',
      'Triage assessment complete.'
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logs.length) {
        setConsoleLogs((prev) => [...prev, logs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 250);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: currentPatient?.age || 30,
          gender: currentPatient?.gender || 'Male',
          medicalHistory: currentPatient?.medicalHistory || []
        })
      });

      if (!res.ok) throw new Error('API triage query failed.');

      const data = await res.json();
      clearInterval(logInterval);
      setTriageResult({
        urgency: data.urgency,
        department: data.department,
        explanation: data.explanation,
        confidenceScore: data.confidenceScore,
        symptoms,
        suggestedTests: data.suggestedTests || [],
        doctorQuestions: data.doctorQuestions || []
      });
    } catch (err) {
      console.error(err);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return {
          card: 'bg-red-950/30 border-red-500/30 text-white',
          badge: 'bg-red-600 text-white font-black animate-pulse',
          icon: <HeartCrack className="w-6 h-6 text-red-450 animate-bounce" />,
          glow: 'shadow-[0_10px_35px_rgba(239,68,68,0.15)] border-red-500/30',
          textClass: 'text-red-400 font-bold'
        };
      case 'High':
        return {
          card: 'bg-amber-950/30 border-amber-500/30 text-white',
          badge: 'bg-amber-500 text-slate-950 font-black',
          icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
          glow: 'shadow-[0_10px_35px_rgba(245,158,11,0.15)] border-amber-500/30',
          textClass: 'text-amber-400 font-bold'
        };
      case 'Medium':
        return {
          card: 'bg-cyan-950/30 border-cyan-500/30 text-white',
          badge: 'bg-[#00B8D4] text-slate-950 font-black',
          icon: <ShieldAlert className="w-6 h-6 text-cyan-400" />,
          glow: 'shadow-[0_10px_35px_rgba(6,182,212,0.15)] border-cyan-500/30',
          textClass: 'text-cyan-400 font-bold'
        };
      default:
        return {
          card: 'bg-emerald-950/30 border-emerald-500/30 text-white',
          badge: 'bg-emerald-500 text-slate-950 font-black',
          icon: <Activity className="w-6 h-6 text-emerald-400" />,
          glow: 'shadow-[0_10px_35px_rgba(16,185,129,0.15)] border-emerald-500/30',
          textClass: 'text-emerald-400 font-bold'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-[#060a08] min-h-screen py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[15%] left-[12%] w-[360px] h-[360px] bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[15%] right-[12%] w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/20 to-emerald-400/15 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[45%] left-[30%] w-[310px] h-[310px] bg-gradient-to-tr from-teal-400/15 to-emerald-600/15 rounded-full blur-[90px]" />
      </div>

      {/* Top Back Navigation */}
      <div className="w-full max-w-3xl mb-4 flex items-center justify-between z-10 font-mono text-[10px] text-white">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold"
        >
          ← Back to Landing Page
        </button>
        <span className="text-white/40 uppercase tracking-widest font-black">
          Havenline Triage Core
        </span>
      </div>

      {/* Top Patient Bar */}
      {currentPatient && (
        <div className="w-full max-w-3xl mb-8 flex items-center justify-between bg-[#0a0f0d]/75 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl z-10 font-mono text-xs text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <User size={16} />
            </div>
            <div>
              <h4 className="font-extrabold text-white">{currentPatient.name.toUpperCase()}</h4>
              <p className="text-[10px] text-white/50 uppercase font-bold">
                AGE: {currentPatient.age} // GENDER: {currentPatient.gender}
              </p>
            </div>
          </div>
          {currentPatient.medicalHistory.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[40%] justify-end font-sans">
              {currentPatient.medicalHistory.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-bold border border-white/10"
                >
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/portal/prescriptions')}
              className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors"
            >
              Medicine History
            </button>
            <span className="text-white/25">|</span>
            <button
              onClick={() => router.push('/portal/profile')}
              className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* Analyzer Main Form */}
      <div className="w-full max-w-3xl bg-[#0a0f0d]/75 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-fade-in z-10 text-white">
        
        {/* Title ornament line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent" />

        <div className="space-y-1">
          <h2 className="text-base font-black text-white tracking-widest uppercase font-mono flex items-center gap-2">
            <Sparkles className="text-emerald-400" size={20} /> AI Care Navigator
          </h2>
          <p className="text-[10px] text-white/60 font-mono font-bold">
            INPUT VERBATIM SYMPTOMS FOR COMPUTER-ASSISTED TRIAGING
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleTriageSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Presenting Symptoms Descriptor</label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={isAnalyzing}
              placeholder="Explain symptoms naturally (e.g. crushing pressure in my chest that goes to my arm and neck. Sweating and dizzy)..."
              className="w-full text-xs rounded-xl border border-white/10 bg-white/5 p-4 focus:border-emerald-400 focus:outline-none transition-all disabled:opacity-50 text-white placeholder-white/20 font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] text-white/40 flex items-center gap-1 font-bold">
              🔒 SECURE CLINICAL SECURED CORE
            </span>
            <button
              type="submit"
              disabled={isAnalyzing || !symptoms.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black uppercase text-[10px] tracking-widest disabled:bg-white/5 disabled:text-white/30 shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ANALYZING CORE...
                </>
              ) : (
                <>
                  Analyze Symptoms <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Diagnostics Console Logs */}
        {isAnalyzing && consoleLogs.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[10px] text-white/60 leading-relaxed max-h-48 overflow-y-auto space-y-1.5 animate-pulse relative">
            <div className="text-emerald-400 font-bold border-b border-white/10 pb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Terminal size={12} />
              <span>CLINICAL_CLASSIFIER_CONTAINER_STREAM</span>
            </div>
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-white/40">[{idx}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}

        {/* Triage Output Summary */}
        {triageResult && !isAnalyzing && (
          <div className="space-y-6 animate-fade-in border-t border-white/10 pt-6 font-mono text-xs">
            {/* Urgency Ribbon Card */}
            {(() => {
              const styles = getUrgencyStyles(triageResult.urgency);
              return (
                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start gap-5 shadow-lg relative overflow-hidden bg-white/5 ${styles.glow} ${styles.card}`}>
                  
                  {/* Decorative background logo backing */}
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-white">
                    <Heart size={120} fill="currentColor" />
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    {styles.icon}
                  </div>
                  <div className="space-y-3 flex-1 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black tracking-wider uppercase ${styles.badge}`}>
                        Urgency: {triageResult.urgency}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                        Match Confidence: {triageResult.confidenceScore}%
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white tracking-wide">
                      Routing Target: <span className={styles.textClass}>{triageResult.department.toUpperCase()}</span> Department
                    </h3>
                    
                    <p className="text-[11px] leading-relaxed text-white/70 font-sans">
                      {triageResult.explanation}
                    </p>

                    {/* Critical Fast-Track Action banner */}
                    {triageResult.urgency === 'Critical' ? (
                      <div className="mt-4 p-5 rounded-xl bg-red-950/40 text-white border border-red-500/25 space-y-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="animate-bounce shrink-0 text-red-500" size={16} />
                          <span className="text-[10px] font-black tracking-widest uppercase text-red-400">Emergency Fast-Track Redirect Activated</span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed font-sans text-red-300">
                          The triage engine has detected critical, life-threatening symptoms. Standard queue reservations are bypassed. You are pre-authorized for immediate emergency admission at the nearest hospital.
                        </p>
                        <button
                          onClick={() => router.push('/portal/hospitals?fastTrack=true')}
                          className="w-full text-center py-3 bg-red-600 text-white hover:bg-red-500 rounded-lg font-black text-[10px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          Find Nearest Emergency Hospital <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => router.push('/portal/hospitals')}
                          className="px-6 py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          Compare & Select Hospital <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Medical Disclaimer */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-[9px] text-white/50 text-center leading-relaxed font-sans">
              <strong>⚠️ MEDICAL DISCLAIMER:</strong> Havenline AI triage classifier offers information only and does NOT constitute formal medical advice, diagnosis, or clinical recommendations. In severe respiratory, physical, or cardiac emergencies, immediately dial national emergency dispatch numbers (102 / 112) or head to the nearest casualty room.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
