'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHavenline } from '../context/HavenlineContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  UserCheck, 
  Apple, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function HealthAssistant() {
  const { currentPatient, activeAppointment, hospitals } = useHavenline();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello! I am your 24/7 AI Health Assistant. I can help you with:\n\n- **Medicine Reminders** (e.g. scheduling/dosages)\n- **Appointment Help** (triage & bookings)\n- **Report Explanations** (understanding diagnostics)\n- **Doctor Availability** (active rosters)\n- **Diet Suggestions** (nutrition advice)\n- **FAQs** (general clinic operations)\n\nHow can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages list to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Collect doctor roster from context
    let doctorsList: any[] = [];
    if (hospitals && hospitals.length > 0) {
      doctorsList = hospitals.flatMap(h => h.doctors.map(d => ({
        ...d,
        hospitalName: h.name
      })));
    }

    try {
      const response = await fetch('/api/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            text: msg.text
          })),
          patientInfo: currentPatient ? {
            name: currentPatient.name,
            age: currentPatient.age,
            gender: currentPatient.gender,
            medicalHistory: currentPatient.medicalHistory
          } : null,
          activeAppointment: activeAppointment ? {
            hospitalName: activeAppointment.hospitalName,
            doctorName: activeAppointment.doctorName,
            timeSlot: activeAppointment.timeSlot,
            department: activeAppointment.department,
            queuePosition: activeAppointment.queuePosition,
            estimatedWaitTime: activeAppointment.estimatedWaitTime
          } : null,
          doctorsList
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        text: data.reply || "I couldn't process that response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "**System Error:** Connection failed. Please check your network and retry.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetQuery = (queryType: string) => {
    let prompt = '';
    switch (queryType) {
      case 'reminders':
        prompt = 'Explain medication schedule suggestions and set a Metformin reminder for me.';
        break;
      case 'appointment':
        prompt = 'Show my current appointment status and details.';
        break;
      case 'reports':
        prompt = 'What does a blood glucose HbA1c level of 6.2% mean? Explain my report.';
        break;
      case 'doctors':
        prompt = 'Is there a cardiologist available on active roster duty today?';
        break;
      case 'diet':
        prompt = 'What diet and nutrition modifications should I follow for diabetes?';
        break;
      case 'faq':
        prompt = 'Is Havenline secure and HIPAA-compliant?';
        break;
      default:
        prompt = 'Hello';
    }
    handleSendMessage(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl bg-[#00E676] hover:bg-[#00ff80] text-black shadow-xl shadow-[#00E676]/20 flex items-center justify-center transition-all duration-300 hover:scale-105 animate-bounce group relative border border-white/10"
        >
          <MessageSquare size={24} className="stroke-[2.5]" />
          {/* Pulsing indicator tag */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00E5FF] rounded-full border-2 border-[#060608] animate-pulse" />
        </button>
      )}

      {/* Sleek Cyberpunk Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-[#0C0C0E]/95 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in relative">
          
          {/* Top border line indicator */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00E676] to-[#00E5FF]" />

          {/* Window Header */}
          <div className="p-4 bg-[#0F0F12] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-ping" />
              <div className="leading-tight">
                <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-1">
                  <Sparkles size={12} className="text-[#00E676]" /> HAVENLINE_AI_BOT
                </h4>
                <p className="text-[8px] text-slate-500 uppercase">24/7 ONLINE HEALTHCARE BOT</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg border border-white/5 bg-[#16161A] text-slate-400 hover:text-white hover:border-white/10 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Scrollable messages container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin select-text">
            
            {/* Disclaimer header */}
            <div className="p-2.5 bg-[#15110A] border border-amber-500/20 rounded-xl text-[8px] text-amber-400 leading-normal uppercase">
              ⚠️ INFORMATION ONLY. NOT A SUBSTITUTE FOR CASUALTY ROOMS OR DIRECT MEDICAL DIAGNOSIS.
            </div>

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-[11px] leading-relaxed ${
                    isUser
                      ? 'bg-white/5 border border-white/10 text-white font-sans'
                      : 'bg-[#0A0A0C] border border-[#00E676]/10 text-slate-200'
                  }`}>
                    {/* Render message with line breaks and basic markdown bolding */}
                    <div className="whitespace-pre-line font-sans leading-relaxed text-xs">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Check for list bullets
                        if (line.startsWith('- **')) {
                          const boldText = line.substring(4, line.indexOf('**', 4));
                          const normalText = line.substring(line.indexOf('**', 4) + 2);
                          return (
                            <div key={lIdx} className="flex gap-1.5 ml-2 mt-1 align-top text-slate-300">
                              <span className="text-[#00E676]">•</span>
                              <p>
                                <strong className="text-white font-mono text-[10px] tracking-wider uppercase">{boldText}</strong>
                                {normalText}
                              </p>
                            </div>
                          );
                        }
                        
                        // Check for bold titles
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <p key={lIdx} className="font-mono text-[10px] font-black uppercase text-[#00E676] tracking-wider mt-2 border-b border-white/5 pb-1">
                              {line.replace(/\*\*/g, '')}
                            </p>
                          );
                        }

                        // Check for inline bolding
                        let processedLine = line;
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={lIdx} className="mt-1">
                              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white">{part}</strong> : part)}
                            </p>
                          );
                        }

                        return <p key={lIdx} className="mt-1">{processedLine}</p>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-ping" />
                  <span className="text-[9px] text-slate-500 uppercase">AI ANALYZING QUERY...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick preset queries chips bar */}
          <div className="px-4 py-2 border-t border-white/5 bg-[#0F0F12] flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            <button
              onClick={() => handlePresetQuery('reminders')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <Clock size={10} /> reminders
            </button>
            <button
              onClick={() => handlePresetQuery('appointment')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <Calendar size={10} /> my appointment
            </button>
            <button
              onClick={() => handlePresetQuery('reports')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <FileText size={10} /> reports
            </button>
            <button
              onClick={() => handlePresetQuery('doctors')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <UserCheck size={10} /> doctor availability
            </button>
            <button
              onClick={() => handlePresetQuery('diet')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <Apple size={10} /> diet
            </button>
            <button
              onClick={() => handlePresetQuery('faq')}
              className="px-2.5 py-1 bg-[#16161A] text-slate-400 hover:text-[#00E676] border border-white/5 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center gap-1"
            >
              <HelpCircle size={10} /> FAQ
            </button>
          </div>

          {/* Text Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-[#0A0A0C] border-t border-white/5 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything health-related..."
              className="flex-1 bg-[#16161A] border border-white/5 rounded-xl p-3 text-xs focus:border-[#00E676] focus:outline-none transition-all disabled:opacity-50 text-white font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-[#00E676] hover:bg-[#00ff80] disabled:bg-[#16161A] text-black disabled:text-slate-500 flex items-center justify-center transition-all shrink-0"
            >
              <Send size={14} className="stroke-[2.5]" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
