'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Activity, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle, 
  Flame, 
  Layers, 
  MessageSquareHeart, 
  TrendingDown, 
  Lock
} from 'lucide-react';
import SymptomPreviewWidget from '../components/symptom-preview';

const journeyCards = [
  { step: '01', label: 'Platform Core',    title: 'Symptom\nInput',            desc: 'Describe your symptoms naturally. Our intake model parses clinical language without medical jargon requirements.',             gradient: 'linear-gradient(145deg,#064e3b,#065f46,#047857)', glowColor: 'rgba(52,211,153,0.15)' },
  { step: '02', label: 'AI Triage',         title: 'AI Urgency\nClassification', desc: 'The AI assigns a triage level — critical, urgent, or routine — and recommends the right department and tests.',           gradient: 'linear-gradient(145deg,#065f46,#047857,#059669)', glowColor: 'rgba(52,211,153,0.15)' },
  { step: '03', label: 'Ranking System',    title: 'Hospital\nMatching',         desc: 'Ranked results show best-fit hospitals nearby — factoring travel time, specialist availability, and ICU capacity.',        gradient: 'linear-gradient(145deg,#047857,#059669,#10b981)', glowColor: 'rgba(52,211,153,0.15)' },
  { step: '04', label: 'Booking',           title: 'Secure Slot\nBooking',       desc: 'Concurrency-safe booking locks your slot instantly. Critical patients receive automatic fast-track priority bypass.',       gradient: 'linear-gradient(145deg,#059669,#10b981,#34d399)', glowColor: 'rgba(52,211,153,0.2)'  },
  { step: '05', label: 'Live Monitoring',   title: 'Live Queue\nTracking',       desc: 'Track your position in real time. Get push notifications when you are next — arrive just in time.',                       gradient: 'linear-gradient(145deg,#0d9488,#0f766e,#115e59)', glowColor: 'rgba(45,212,191,0.15)' },
  { step: '06', label: 'Consultation',      title: 'Doctor\nConsultation',       desc: 'Walk in prepared. Your pre-filled symptom report and recommended tests reach the doctor before you do.',                   gradient: 'linear-gradient(145deg,#134e4a,#115e59,#0f766e)', glowColor: 'rgba(45,212,191,0.15)' },
  { step: '07', label: 'Follow-up Care',    title: 'Post-Visit\nFollow-up',      desc: 'Receive discharge summaries, prescription reminders, and follow-up appointment suggestions automatically.',               gradient: 'linear-gradient(145deg,#022c22,#064e3b,#065f46)', glowColor: 'rgba(52,211,153,0.1)'  },
];



export default function LandingPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragAccum  = useRef(0);
  const isDragging = useRef(false);
  const n = journeyCards.length;

  const modIdx = useCallback((i: number) => ((i % n) + n) % n, [n]);

  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragAccum.current  = 0;
  };
  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = dragStartX.current - clientX;
    dragAccum.current += delta;
    dragStartX.current = clientX;
    if (dragAccum.current > 90)  { setActiveIdx(p => p + 1); dragAccum.current = 0; }
    if (dragAccum.current < -90) { setActiveIdx(p => p - 1); dragAccum.current = 0; }
  };
  const handleDragEnd = () => { isDragging.current = false; dragAccum.current = 0; };

  // Scroll logic and intersection observer for scroll-reveal animations
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrollOffset(offset);
      setIsScrolled(offset > 30);

      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0) {
        setScrollProgress((offset / height) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#C3FDBF]">
      {/* Floating Ambient Parallax Orbs (Modern Landing Page Accent) */}
      <div 
        className="absolute top-[8%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none transition-transform duration-200 ease-out z-0"
        style={{ transform: `translateY(${scrollOffset * 0.15}px)` }}
      />
      <div 
        className="absolute top-[35%] right-[-15%] w-[40vw] h-[40vw] rounded-full bg-cyan-400/10 blur-[130px] pointer-events-none transition-transform duration-200 ease-out z-0"
        style={{ transform: `translateY(${scrollOffset * -0.1}px)` }}
      />
      {/* Suspended Modern Floating Header */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
        <header className="w-full max-w-5xl rounded-2xl pointer-events-auto transition-all duration-500 flex items-center justify-between px-6 py-3.5 border border-white/10 relative overflow-hidden bg-[#0a0f0d]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          {/* Scroll Progress Indicator Line on the bottom edge */}
          <div 
            className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-100 ease-out z-50"
            style={{ width: `${scrollProgress}%` }}
          />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Heart size={16} fill="currentColor" />
            </div>
            <span className="font-black tracking-widest text-lg text-white font-mono uppercase">
              HAVEN<span className="text-emerald-400">LINE</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/60 font-mono">
            <a href="#features" className="hover:text-emerald-400 hover:scale-105 transition-all">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 hover:scale-105 transition-all">How It Works</a>
            <a href="#why-havenline" className="hover:text-emerald-400 hover:scale-105 transition-all">Why Havenline</a>
            <Link href="/network" className="hover:text-cyan-400 hover:scale-105 transition-all">Our Network</Link>
            <Link href="/pippy" className="hover:text-emerald-400 hover:scale-105 transition-all">Pippy's Capsule</Link>
          </nav>
          
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="text-[9px] px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all font-bold uppercase tracking-wider font-mono"
            >
              Hospital Panel
            </Link>
            <Link
              href="/portal/profile"
              className="text-[9px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 uppercase tracking-widest font-mono"
            >
              Get Started <ArrowRight size={12} className="stroke-[3]" />
            </Link>
          </div>
        </header>
      </div>

      {/* Main Hero */}
      <main className="flex-1">
        <section className="w-full min-h-[70vh] lg:h-[85vh] bg-transparent border-b border-slate-900/5 relative flex items-center overflow-hidden">
          {/* Background Spline Iframe wrapper - hidden on mobile */}
          <div className="hidden lg:block lg:absolute inset-0 w-full lg:h-full z-0 pointer-events-auto">
            <iframe
              src="https://my.spline.design/reededliquidglassprismherosectionconcept-swxMvxUaZwwFi8Bug4yX7t2d/"
              frameBorder="0"
              width="100%"
              height="100%"
              style={{ border: 'none', width: '100%', height: '100%' }}
              title="Spline 3D Hero Showcase"
              allow="autoplay; xr-spatial-tracking"
            />
          </div>

          {/* Content Overlay */}
          <div className="relative lg:absolute inset-0 z-10 w-full flex items-center pt-28 pb-16 lg:py-0 pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 w-full flex items-center">
              <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 pointer-events-auto animate-fade-in">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-semibold mx-auto lg:mx-0">
                  <Heart size={12} className="animate-pulse text-emerald-600 fill-emerald-600" />
                  <span>Intelligent Care Intake Companion</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] max-w-2xl">
                  Healthcare shouldn't begin with <span className="bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">waiting.</span>
                </h1>
                
                <p className="text-lg text-slate-800 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Havenline intelligently matches your symptoms to the right specialist doctor, coordinates live queues, and recommends nearby hospitals in Delhi NCR based on real-time availability and ICU beds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/portal/profile"
                    className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-900 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    Launch Patient Portal <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto text-center px-6 py-3 rounded-full border border-slate-900/10 bg-white/40 backdrop-blur-sm text-slate-800 hover:bg-white/60 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    Hospital Dashboard
                  </Link>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900/10 max-w-md mx-auto lg:mx-0 text-left">
                  <div>
                    <p className="text-2xl font-black text-slate-950">74%</p>
                    <p className="text-xs text-slate-700 font-semibold">Wait Time Saved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-950">97%</p>
                    <p className="text-xs text-slate-700 font-semibold">Triage Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-950">100%</p>
                    <p className="text-xs text-slate-700 font-semibold">Synced Queues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features + Patient Journey — shared blob background */}
        <div className="relative bg-[#0a0f0d] overflow-hidden">
          {/* Heartbeat blobs — spread across full height of both sections */}
          <div className="blob-hb-1 absolute top-[5%]  left-[10%]  w-[480px] h-[480px] bg-emerald-500/25 rounded-full pointer-events-none" />
          <div className="blob-hb-2 absolute top-[15%] right-[5%]  w-[380px] h-[380px] bg-cyan-500/20    rounded-full pointer-events-none" />
          <div className="blob-hb-3 absolute top-[40%] left-[30%]  w-[560px] h-[560px] bg-teal-500/18    rounded-full pointer-events-none" />
          <div className="blob-hb-4 absolute top-[55%] right-[20%] w-[420px] h-[420px] bg-emerald-400/22 rounded-full pointer-events-none" />
          <div className="blob-hb-5 absolute top-[70%] left-[5%]   w-[340px] h-[340px] bg-cyan-400/20    rounded-full pointer-events-none" />
          <div className="blob-hb-6 absolute top-[80%] right-[10%] w-[300px] h-[300px] bg-green-500/18   rounded-full pointer-events-none" />

        {/* Features Section */}
        <section id="features" className="pt-36 pb-28 px-6 relative">
          <div className="max-w-6xl mx-auto space-y-16 relative z-10">
            <div className="text-center space-y-4 max-w-xl mx-auto reveal-item">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Core Platform Architecture</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                We designed Havenline to bridge the information gap between emergency patients and hospital critical care departments in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group relative rounded-3xl overflow-hidden h-72 cursor-default hover:-translate-y-2 transition-all duration-500 ease-out reveal-item delay-100">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-emerald-400/20 group-hover:ring-emerald-300/40 transition-all duration-500" />
                <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-emerald-300/20 blur-xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-teal-400/10 blur-2xl" />
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-emerald-200/60 text-xs font-semibold tracking-widest uppercase">Platform Core</p>
                    <h3 className="text-2xl font-black text-white leading-tight">AI Care<br/>Navigator</h3>
                    <p className="text-white/60 text-xs leading-relaxed max-w-[200px]">
                      Classifies symptoms, determines urgency, and streamlines patient intake with clinical precision.
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="w-6 h-0.5 bg-emerald-300/50" />
                      <div className="w-4 h-0.5 bg-emerald-300/30" />
                      <div className="w-8 h-0.5 bg-emerald-300/15" />
                    </div>
                    <span className="text-6xl font-black text-white/20 leading-none select-none">01</span>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-3xl overflow-hidden h-72 cursor-default hover:-translate-y-2 transition-all duration-500 ease-out md:translate-y-4 reveal-item delay-200">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-cyan-700" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-green-400/20 group-hover:ring-green-300/40 transition-all duration-500" />
                <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-green-300/20 blur-xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl" />
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-green-200/60 text-xs font-semibold tracking-widest uppercase">Ranking System</p>
                    <h3 className="text-2xl font-black text-white leading-tight">Suitability<br/>Engine</h3>
                    <p className="text-white/60 text-xs leading-relaxed max-w-[200px]">
                      Ranks hospitals using travel time, specialist availability, ICU beds, cost, and queue speed.
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="w-6 h-0.5 bg-green-300/50" />
                      <div className="w-4 h-0.5 bg-green-300/30" />
                      <div className="w-8 h-0.5 bg-green-300/15" />
                    </div>
                    <span className="text-6xl font-black text-white/20 leading-none select-none">02</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-3xl overflow-hidden h-72 cursor-default hover:-translate-y-2 transition-all duration-500 ease-out md:translate-y-8 reveal-item delay-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-700 to-green-800" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-teal-400/20 group-hover:ring-teal-300/40 transition-all duration-500" />
                <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-teal-300/20 blur-xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-emerald-400/10 blur-2xl" />
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-teal-200/60 text-xs font-semibold tracking-widest uppercase">Live Coordination</p>
                    <h3 className="text-2xl font-black text-white leading-tight">Synced Queues<br/>& Booking</h3>
                    <p className="text-white/60 text-xs leading-relaxed max-w-[200px]">
                      Concurrency-safe slot booking with real-time queue tracking and emergency fast-track bypass.
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="w-6 h-0.5 bg-teal-300/50" />
                      <div className="w-4 h-0.5 bg-teal-300/30" />
                      <div className="w-8 h-0.5 bg-teal-300/15" />
                    </div>
                    <span className="text-6xl font-black text-white/20 leading-none select-none">03</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Arc Carousel */}
        <section id="how-it-works" className="py-28 overflow-hidden relative">
          <div className="max-w-7xl mx-auto space-y-14">
            <div className="text-center space-y-4 max-w-xl mx-auto px-6 reveal-item">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">The Patient Journey</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                From emergency symptom onset to doctor consultation, Havenline coordinates every step of your care.
              </p>
            </div>

            {/* Arc Carousel Stage */}
            <div
              className="relative select-none cursor-grab active:cursor-grabbing reveal-item delay-200"
              style={{ height: '420px' }}
              onMouseDown={(e) => handleDragStart(e.clientX)}
              onMouseMove={(e) => handleDragMove(e.clientX)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
              onTouchEnd={handleDragEnd}
            >
              {([-3, -2, -1, 0, 1, 2, 3] as const).map((pos) => {
                const card = journeyCards[modIdx(activeIdx + pos)];
                const absPos = Math.abs(pos);
                // Parabolic arc: y drops by pos^2 * factor
                const tx   = pos * 230;
                const ty   = absPos * absPos * 22;
                const rot  = pos * 7;
                const sc   = Math.max(0.62, 1.06 - absPos * 0.135);
                const op   = Math.max(0.18, 1   - absPos * 0.26);
                const zi   = 10 - absPos;
                const isCenter = pos === 0;

                return (
                  <div
                    key={card.step}
                    className="absolute top-0 left-1/2 w-52"
                    style={{
                      transform: `translateX(calc(-50% + ${tx}px)) translateY(${ty}px) rotate(${rot}deg) scale(${sc})`,
                      opacity: op,
                      zIndex: zi,
                      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                      transformOrigin: 'bottom center',
                      willChange: 'transform, opacity',
                    }}
                    onClick={() => !isDragging.current && setActiveIdx(p => p + pos)}
                  >
                    {/* Pulsing center back-glow */}
                    {isCenter && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 rounded-[2.2rem] blur-2xl opacity-75 -z-10 animate-pulse pointer-events-none" />
                    )}

                    {/* Card */}
                    <div
                      className={`rounded-[2rem] overflow-hidden relative h-72 group transition-all duration-300 ease-out hover:-translate-y-5 hover:scale-105 border ${
                        isCenter 
                          ? 'border-emerald-400/40 shadow-[0_0_40px_rgba(52,211,153,0.25)] ring-1 ring-white/10' 
                          : 'border-white/5 shadow-2xl'
                      }`}
                      style={{
                        background: card.gradient,
                      }}
                    >
                      {/* Dynamic Glare Sweep (automatically sweeps when card matches center spotlight) */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transition-transform duration-1000 ease-out pointer-events-none"
                        style={{
                          transform: isCenter ? 'translateX(180%)' : 'translateX(-180%)'
                        }}
                      />

                      {/* Glass shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent pointer-events-none" />
                      {/* Glow orb */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: card.glowColor }} />

                      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-white/40 text-[9px] font-bold tracking-[0.2em] uppercase">{card.label}</p>
                          <h3 className="text-base font-black text-white leading-tight whitespace-pre-line">{card.title}</h3>
                          <p className="text-white/55 text-[11px] leading-relaxed pt-1">{card.desc}</p>
                        </div>
                        <div className="flex items-end justify-between mt-3">
                          <div className="flex flex-col gap-[3px]">
                            <div className="w-5 h-[1.5px] bg-white/40 rounded" />
                            <div className="w-3 h-[1.5px] bg-white/25 rounded" />
                            <div className="w-6 h-[1.5px] bg-white/15 rounded" />
                          </div>
                          <span className="text-5xl font-black text-white/15 leading-none select-none">{card.step}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center items-center gap-2 pt-2">
              {journeyCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width:  modIdx(activeIdx) === i ? '28px' : '8px',
                    height: '8px',
                    background: modIdx(activeIdx) === i ? '#34d399' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setActiveIdx(p => p - 1)}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all flex items-center justify-center"
              >
                <ArrowRight size={16} className="rotate-180" />
              </button>
              <button
                onClick={() => setActiveIdx(p => p + 1)}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all flex items-center justify-center"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
        </div>{/* end shared blob wrapper */}

        {/* Benchmark — Brain Center Layout */}
        <section id="why-havenline" className="bg-[#0a0f0d] py-24 px-8">
          {/* Top label */}
          <div className="flex justify-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">AI-Powered Benchmarking</span>
            </div>
          </div>

          {/* 3-column: text | brain | stats */}
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_520px_1fr] gap-12 items-center">

            {/* LEFT — text content */}
            <div className="space-y-6 lg:pr-4 reveal-item">
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                How we benchmark against<br/>
                <span className="text-emerald-400">traditional booking</span>
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Traditional apps show basic doctor lists. Havenline layers real-time hospital data, AI triage, and concurrency-safe booking on top.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time synchronized hospital capacity updates',
                  'Explainable AI — know exactly why a hospital was chosen',
                  'Automatic Emergency Fast-Track for critical triage cases',
                  'Transparent cost breakdowns across consultation + diagnostics',
                  'Concurrency-safe slot locks — zero double bookings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CENTER — Brain (fully interactive, nothing on top) */}
            <div className="relative rounded-3xl overflow-hidden" style={{ height: '620px' }}>
              {/* Soft edge fades that don't block pointer events */}
              <div className="absolute top-0 left-0 right-0 h-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #0a0f0d, transparent)' }} />
              <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #0a0f0d, transparent)' }} />
              <div className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0a0f0d, transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #0a0f0d, transparent)' }} />
              {/* The brain — z-0, fully interactive */}
              <iframe
                src="https://my.spline.design/particleaibrain-uJC6LcfowrdX3fIqFj1o7F9t/"
                frameBorder="0"
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
                title="Particle AI Brain — Interactive"
              />
            </div>

            {/* RIGHT — stats glass card */}
            <div
              className="rounded-3xl p-6 space-y-5 border border-white/10 lg:ml-4 reveal-item delay-200"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
            >
              <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">Efficiency Overview</h3>
              <div className="space-y-5">
                {[
                  { label: 'WAITING ROOM REDUCTION', value: '74% DECREASE', pct: 74, color: '#34d399' },
                  { label: 'EMERGENCY REDIRECTION ACCURACY', value: '97% ALIGNED', pct: 97, color: '#34d399' },
                  { label: 'CONCURRENCY LOCK RELIABILITY', value: '100% COLLISION FREE', pct: 100, color: '#22d3ee' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[10px] font-bold tracking-widest mb-2">
                      <span className="text-white/40">{stat.label}</span>
                      <span style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${stat.pct}%`, background: `linear-gradient(to right, ${stat.color}99, ${stat.color})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini stat badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { num: '2.4×', label: 'Faster Intake' },
                  { num: '97%',  label: 'Match Rate' },
                  { num: '0ms',  label: 'Lock Conflicts' },
                ].map((badge) => (
                  <div key={badge.label} className="rounded-2xl text-center py-3 px-2 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-emerald-400 text-lg font-black">{badge.num}</p>
                    <p className="text-white/40 text-[10px] font-semibold tracking-wide mt-0.5">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0f0d] py-10 px-6 text-center text-xs text-white/55">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-white tracking-wider">HAVENLINE</span>
          </div>
          <p className="text-white/40">© 2026 Havenline AI Inc. All rights reserved. Platform mock clinical data is for demonstration purposes only.</p>
          <div className="flex gap-4">
            <a href="#" className="text-white/45 hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/45 hover:text-emerald-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
