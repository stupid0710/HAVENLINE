'use client';

import React, { useState } from 'react';
import { Sparkles, Activity, ShieldAlert, HeartCrack, ChevronRight } from 'lucide-react';
import { simulateStreamingAI } from '../lib/aiEngine';
import { TriageResult } from '../context/HavenlineContext';

const PRESET_SYMPTOMS = [
  { text: 'Crushing chest pain radiating to left shoulder', label: 'Chest Pain' },
  { text: 'Severe fall with knee swelling and inability to bend leg', label: 'Severe Fall' },
  { text: 'Mild fever, dry cough, and running nose for 3 days', label: 'Mild Cold' }
];

export default function SymptomPreviewWidget() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleTestTriage = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setStreamedText('');

    try {
      const triage = await simulateStreamingAI(text, 35, (chunk) => {
        setStreamedText(chunk);
      });
      setResult(triage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200 shadow-red-100/50';
      case 'High':
        return 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-100/50';
      case 'Medium':
        return 'text-blue-600 bg-blue-50 border-blue-200 shadow-blue-100/50';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-100/50';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/80 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
          <Activity size={18} className="animate-pulse" />
        </div>
        <h3 className="font-semibold text-slate-800 tracking-tight text-lg">AI Triage Simulator</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Demo Mode</span>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Type a medical concern or select a preset below to see how Havenline determines department, urgency, and routing in real time.
      </p>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_SYMPTOMS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(preset.text);
              handleTestTriage(preset.text);
            }}
            disabled={isAnalyzing}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Group */}
      <div className="relative mb-5">
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isAnalyzing}
          placeholder="Describe symptoms naturally (e.g. difficulty breathing, stomach cramps)..."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 resize-none"
        />
        <button
          type="button"
          onClick={() => handleTestTriage(inputText)}
          disabled={isAnalyzing || !inputText.trim()}
          className="absolute right-3 bottom-3 p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:bg-slate-100 disabled:text-slate-400 shadow-sm shadow-emerald-500/20"
        >
          {isAnalyzing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
        </button>
      </div>

      {/* Stream console or output result */}
      {streamedText && (
        <div className="rounded-xl border border-slate-100 bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto mb-4 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-2 border-b border-slate-800 pb-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>HAVENLINE-TRIAGE-SERVICE // FEEDBACK</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-slate-300">{streamedText}</pre>
        </div>
      )}

      {/* Summary card output */}
      {result && !isAnalyzing && (
        <div className="animate-fade-in">
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${getUrgencyColor(result.urgency)}`}>
            {result.urgency === 'Critical' ? (
              <HeartCrack className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
            ) : (
              <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide uppercase">Urgency: {result.urgency}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 border border-current/20 font-semibold">
                  Conf: {result.confidenceScore}%
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                Route to: {result.department} Department
              </p>
              <p className="text-xs opacity-90 leading-relaxed mt-1 text-slate-600">
                {result.explanation}
              </p>

              {result.urgency === 'Critical' && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-100/50 border border-red-200 flex items-center justify-between text-red-800 font-medium">
                  <span className="text-xs">⚠️ FAST-TRACK TRIGGERED: Bypassing regular queue.</span>
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a
              href="/portal"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-semibold group transition-all"
            >
              Analyze Symptoms and Book Now
              <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
