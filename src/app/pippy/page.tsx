'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ArrowLeft, 
  BookOpen, 
  Compass, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

interface NewsItem {
  id: string;
  category: 'Update' | 'News' | 'Alert';
  title: string;
  source: string;
  date: string;
  summary: string;
  content: string;
}

interface HealthTip {
  category: string;
  icon: string;
  tips: string[];
}

const MEDICAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    category: 'Alert',
    title: 'Delhi NCR Seasonal Influenza Advisory & Mitigation Guide',
    source: 'Department of Health & Family Welfare',
    date: 'July 5, 2026',
    summary: 'Preventive recommendations released to combat seasonal H1N1 surge in the NCR region.',
    content: 'Ensure surgical masks are worn in crowded transit sectors like Narela. Avoid direct contact with presenting symptomatic patients. Ensure yearly immunization records are up to date.'
  },
  {
    id: 'news-2',
    category: 'Update',
    title: 'AI Diagnostics Integration approved in Local Clinic Hubs',
    source: 'National Digital Health Mission',
    date: 'June 28, 2026',
    summary: 'Clinical triage algorithms successfully reduce outpatient waiting lines by 40% across Delhi NCR.',
    content: 'Intelligent triage models like Havenline are now officially recommended to pre-sort non-critical admissions, fast-tracking urgent trauma bookings to ICU beds dynamically.'
  },
  {
    id: 'news-3',
    category: 'News',
    title: 'WHO Releases New Guidelines for Cardiovascular Pacing',
    source: 'World Health Organization',
    date: 'June 15, 2026',
    summary: 'Updated daily exercise targets recommended for patients with early stage hypertension.',
    content: 'Recommends 45 minutes of moderate-intensity cardio spacing (like brisk walking or swimming) five times a week. Combined with reduced sodium, this shows a 12mmHg systolic drop.'
  },
  {
    id: 'news-4',
    category: 'Alert',
    title: 'Vector-Borne Dengue Prevention Action Plan 2026',
    source: 'Municipal Corporation of Delhi (MCD)',
    date: 'July 1, 2026',
    summary: 'Larval control protocols and public safety advisories implemented across residential sub-districts.',
    content: 'Ensure there is no stagnant water in cooler tanks, flower pots, or terrace areas. Use mosquito nets and apply repellents containing DEET or Picaridin when outdoors in early mornings and evenings.'
  },
  {
    id: 'news-5',
    category: 'Update',
    title: 'Pediatric Immunization Calendar Structural Adjustments',
    source: 'Indian Academy of Pediatrics (IAP)',
    date: 'May 18, 2026',
    summary: 'New guidelines for pneumococcal conjugate vaccine (PCV) scheduling sequences.',
    content: 'Standardizing the booster dose sequence at 9 months alongside MMR-1. This is proven to enhance immunological memory retention in infants by up to 25% against secondary respiratory distress.'
  },
  {
    id: 'news-6',
    category: 'News',
    title: 'Heatwave Triage Protocols for North India Regions',
    source: 'National Disaster Management Authority (NDMA)',
    date: 'April 30, 2026',
    summary: 'Preventive rules for clinical management of heat exhaustion and heatstroke in transit hubs.',
    content: 'Set up local hydration corners with ORS fluids. In case of presenting hyperthermia (body temp > 104°F) with altered mental state, initiate rapid evaporative cooling prior to hospital transit lock.'
  }
];

const HEALTH_TIPS: HealthTip[] = [
  { 
    category: 'Hydration', 
    icon: '💧', 
    tips: [
      'Drink at least 3.2 liters of water daily. Hydration regulates queue velocity indicators inside your cellular fluids!',
      'Sip room-temperature water. Avoid ice-cold drinks immediately after heavy workouts to prevent thermoregulatory shocks.',
      'Add a pinch of rock salt and lemon to your water on hot days to replenish electrolytes lost during outdoor transits.'
    ]
  },
  { 
    category: 'Heart', 
    icon: '❤️', 
    tips: [
      'Limit processed sodium intake to under 5g daily. Excess salt increases pressure load on arterial walls.',
      'Climb stairs instead of taking lifts to strengthen heart muscle cells and stimulate cardiopulmonary capacity.',
      'Measure your resting pulse occasionally. A standard resting heart rate between 60-100 BPM is healthy and normal.'
    ]
  },
  { 
    category: 'Breathing', 
    icon: '🌬️', 
    tips: [
      'Perform 4-7-8 breathing cycles when stressed: Inhale for 4s, hold for 7s, exhale slowly for 8s to calm heart rate spikes.',
      'Try Box Breathing: Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 4 times to regulate cortisol.',
      'Breathe through your nose! Nasal passages filter, warm, and humidify air before it reaches bronchial tubes.'
    ]
  },
  { 
    category: 'Sleep', 
    icon: '🌙', 
    tips: [
      'Unplug screens 45 minutes before bedtime. Melatonin synthesis thrives in darkness, assuring deep recovery.',
      'Keep your bedroom temperature around 18-20°C. A cooler body aids deep sleep induction cycles.',
      'Aim for 7.5 to 8 hours of sleep. Quality sleep repairs micro-tears and consolidates memory.'
    ]
  },
  { 
    category: 'Nutrition', 
    icon: '🥦', 
    tips: [
      'Incorporate anti-inflammatory spices like turmeric (curcumin) and ginger into your daily meals to assist in cellular repair.',
      'Include fiber-rich foods like oats and lentils. Dietary fiber feeds gut microbes, strengthening gut-barrier integrity.',
      'Chew your food 20 times before swallowing to aid salivation and stomach acid processing.'
    ]
  },
  { 
    category: 'Posture', 
    icon: '🧍', 
    tips: [
      'Follow the 20-20-20 rule: Every 20 minutes, look at an object 20 feet away for 20 seconds to prevent computer eye strain.',
      'Stand up and stretch your chest every 45 minutes to prevent slouch-back and neck fatigue.',
      'Adjust your screen height: the top of the monitor should be at or slightly below eye level.'
    ]
  },
  { 
    category: 'Exercise', 
    icon: '🏃', 
    tips: [
      'Take 250 steps every hour. Sedentary indicators raise cardiovascular risks; frequent micro-movements stimulate lymphatic flow.',
      'Walk 30 minutes daily. Aerobic movement raises HDL levels and lowers LDL.',
      'Do bodyweight squats during commercial breaks to pump blood from lower limbs back to your heart.'
    ]
  },
  { 
    category: 'Hygiene', 
    icon: '🧼', 
    tips: [
      'Wash hands for 20 seconds using soap. Clean fingers block 80% of common seasonal rhinovirus and influenza transmissions.',
      'Sanitize your phone screen once a day. Mobiles carry more pathogens than household surfaces!',
      'Cover your mouth with your elbow when coughing or sneezing to block droplet travel.'
    ]
  }
];

export default function PippyCapsule() {
  const router = useRouter();
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [pippySpeech, setPippySpeech] = useState<string>(
    "Hi! I'm Pippy, your interactive 3D care assistant! Click on any tip category below for a wellness boost, or move your cursor around the screen to look at me!"
  );
  const [pulseMascot, setPulseMascot] = useState(false);

  const handleMascotClick = () => {
    setPulseMascot(true);
    const audioRemarks = [
      "Keep eating those leafy greens! Your heart will thank you!",
      "Remember to take brief breaks if you're working at a screen all day!",
      "A 15-minute walk after meals does wonders for blood sugar levels!",
      "Have you checked your live queue spot ticket today? Stay healthy!",
      "Don't worry, Pippy is always here to keep your records safe!"
    ];
    const pick = audioRemarks[Math.floor(Math.random() * audioRemarks.length)];
    setPippySpeech(pick);
    setTimeout(() => setPulseMascot(false), 1000);
  };

  const handleTipCategory = (tip: HealthTip) => {
    setPulseMascot(true);
    const pick = tip.tips[Math.floor(Math.random() * tip.tips.length)];
    setPippySpeech(`[${tip.category} Tip]: ${pick}`);
    setTimeout(() => setPulseMascot(false), 800);
  };

  return (
    <div className="flex-1 bg-[#060a08] text-white min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs background overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[8%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[8%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[30%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-4 sm:px-6">
        
        {/* Navigation back and header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold text-[10px]"
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </button>
          
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            🏥 PIPPY'S CLINICAL VAULT v1
          </span>
        </div>

        {/* 2-Column Split-Pane Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Mascot Chat Core & Interactive Spline 3D Pippy (6 cols) */}
          <div className="lg:col-span-6 space-y-6 animate-fade-in">
            
            {/* Mascot Chat Core Subsystem */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
              <div className="absolute top-0 right-0 w-20 h-24 bg-[#00B8D4]/5 blur-xl rounded-full pointer-events-none" />
              
              {/* Glowing Processor Core button */}
              <button 
                onClick={handleMascotClick}
                className={`w-16 h-16 cursor-pointer transition-all duration-300 relative select-none shrink-0 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-cyan-400 shadow-inner ${
                  pulseMascot ? 'scale-110' : 'hover:scale-105'
                }`}
                title="Tap to sync with Pippy!"
              >
                <Activity size={20} className={`text-cyan-400 ${pulseMascot ? 'animate-bounce' : 'animate-pulse'}`} />
                <span className="text-[6px] font-black text-cyan-400 uppercase tracking-widest mt-1">PIP-CORE</span>
                <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
              </button>

              {/* Dialog Bubble */}
              <div className="flex-1 min-w-0">
                <div className="relative p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[10px] leading-relaxed text-white/90 font-mono">
                    {pippySpeech}
                  </p>
                </div>
              </div>
            </div>

            {/* Seamless & Unboxed 3D Interactive Mascot Viewport */}
            <div className="space-y-4">
              <div className="flex items-center border-b border-white/10 pb-2">
                <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00B8D4]" /> Pippy 3D Assistant //
                </h3>
              </div>

              {/* Interactive Spline Viewport */}
              <div className="relative w-full h-[550px] overflow-hidden rounded-2xl border border-white/5 bg-black/5">
                <iframe
                  src="https://my.spline.design/r4xbot-FtSf8T0yRkkfeevwN75QhCKe/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 w-full h-full border-none"
                  title="Pippy 3D Mascot Interactive Playground"
                  allow="autoplay; xr-spatial-tracking"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Tips & Updates Stack (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Pippy's Care Tips */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 border-b border-white/10 pb-3">
                <Compass size={14} /> Pippy's Care Tips
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {HEALTH_TIPS.map((tip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTipCategory(tip)}
                    className="p-3.5 bg-[#0a0f0d]/50 border border-white/5 hover:border-emerald-500/30 rounded-xl flex items-center justify-between text-left transition-all hover:bg-[#0a0f0d]/90 font-mono text-[9px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{tip.icon}</span>
                      <span className="font-extrabold text-[10px] text-white uppercase tracking-tight">{tip.category} Check</span>
                    </div>
                    <ChevronRight size={12} className="text-white/30" />
                  </button>
                ))}
              </div>
            </div>

            {/* Official Medical Updates & News */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#00B8D4] flex items-center gap-1.5 border-b border-white/10 pb-3">
                <BookOpen size={14} /> Official Medical Updates & News
              </h3>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {MEDICAL_NEWS.map((news) => (
                  <div 
                    key={news.id}
                    className="p-5 bg-[#0a0f0d]/75 border border-white/10 rounded-xl space-y-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                        news.category === 'Alert' 
                          ? 'bg-red-500/10 border border-red-500/35 text-red-400' 
                          : news.category === 'Update'
                            ? 'bg-cyan-500/10 border border-cyan-500/35 text-cyan-400'
                            : 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400'
                      }`}>
                        {news.category}
                      </span>
                      <span className="text-[9px] text-white/40">{news.date}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-tight leading-snug">
                        {news.title}
                      </h4>
                      <p className="text-[9px] text-white/35 font-semibold">Source: {news.source}</p>
                    </div>

                    <p className="text-[10px] text-white/60 leading-relaxed font-sans font-medium">
                      {news.summary}
                    </p>

                    {activeNews?.id === news.id ? (
                      <div className="pt-3 border-t border-white/5 text-[10px] text-white/80 leading-relaxed font-sans animate-fade-in space-y-3">
                        <p className="bg-black/35 p-3 rounded-lg border border-white/5">{news.content}</p>
                        <button
                          onClick={() => setActiveNews(null)}
                          className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest block font-mono"
                        >
                          [Minimize Details]
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveNews(news)}
                        className="text-[9px] font-black text-cyan-400 hover:text-cyan-350 uppercase tracking-wider flex items-center gap-0.5 font-mono pt-1"
                      >
                        Read official guidelines <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
