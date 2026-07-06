'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hospital } from '../lib/mockDatabase';
import { X, Check, ArrowRight, Sparkles, Star } from 'lucide-react';

interface HospitalCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHospitals: Hospital[];
  onRemove: (h: Hospital) => void;
}

export default function HospitalCompareModal({
  isOpen,
  onClose,
  selectedHospitals,
  onRemove
}: HospitalCompareModalProps) {
  const router = useRouter();

  if (!isOpen || selectedHospitals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              <Sparkles className="text-emerald-500" size={18} /> Side-by-Side Hospital Comparison
            </h3>
            <p className="text-xs text-slate-400">Compare live parameters, bed occupancies, and medical budgets.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="p-6 overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 text-xs font-bold text-slate-400 uppercase w-1/4">Metric</th>
                {selectedHospitals.map((h) => (
                  <th key={h.id} className="py-3 px-4 text-sm font-extrabold text-slate-800 w-1/4">
                    <div className="flex items-start justify-between gap-2">
                      <span>{h.name}</span>
                      <button
                        onClick={() => onRemove(h)}
                        className="text-[10px] text-red-500 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {/* Suitability Score */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">AI Suitability Score</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4 font-black text-slate-900 text-sm">
                    {h.suitabilityScore ? `${h.suitabilityScore}%` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Patient Rating</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                      <Star size={12} fill="#eab308" className="text-amber-500" />
                      {h.rating}
                    </span>
                    <span className="text-slate-400 ml-1">({h.reviewsCount})</span>
                  </td>
                ))}
              </tr>

              {/* Travel Distance / Time */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Distance & Time</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4 font-medium">
                    {h.distance ? `${h.distance} km` : 'Calculated in portal'} 
                    <span className="text-slate-400 font-normal ml-1">
                      ({h.travelTime ? `${h.travelTime} mins` : 'N/A'})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Waiting Room Queue */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Queue & Wait Time</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{h.queue.length} ahead</span>
                    <span className="text-slate-400 block mt-0.5">({h.queue.waitTimeMinutes} mins wait)</span>
                  </td>
                ))}
              </tr>

              {/* ICU Bed Capacity */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">ICU Bed Occupancy</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4">
                    <span className={`font-black ${h.beds.icu.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {h.beds.icu.available} available
                    </span>
                    <span className="text-slate-400 block mt-0.5">out of {h.beds.icu.total} total</span>
                  </td>
                ))}
              </tr>

              {/* Emergency Bed Capacity */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Emergency Beds</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4">
                    <span className={`font-black ${h.beds.emergency.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {h.beds.emergency.available} available
                    </span>
                    <span className="text-slate-400 block mt-0.5">out of {h.beds.emergency.total} total</span>
                  </td>
                ))}
              </tr>

              {/* Facilities List */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Equipment / Facilities</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {h.facilities.map((fac) => (
                        <span key={fac} className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded font-semibold">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Cost estimates */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Cost Packages</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Consultation:</span>
                      <span className="text-slate-800">₹{h.costs.consultation}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-slate-50 pt-1">
                      <span className="text-slate-400 font-bold">Est. Total:</span>
                      <span className="text-emerald-700 font-extrabold">
                        ₹{h.costs.consultation + h.costs.estDiagnostics + h.costs.estMedicines}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* AI Summarized reviews */}
              <tr>
                <td className="py-3.5 font-bold text-slate-500">Patient Sentiment</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-3.5 px-4 leading-relaxed text-[11px] text-slate-500 max-w-[200px]">
                    {h.reviewSummary.summary}
                  </td>
                ))}
              </tr>

              {/* CTAs row */}
              <tr>
                <td className="py-4 font-bold text-slate-500">Select Path</td>
                {selectedHospitals.map((h) => (
                  <td key={h.id} className="py-4 px-4">
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/portal/booking?hospitalId=${h.id}`);
                      }}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      Book Now <ArrowRight size={10} />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
