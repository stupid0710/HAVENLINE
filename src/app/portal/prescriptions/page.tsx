'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHavenline } from '../../../context/HavenlineContext';
import { 
  ArrowLeft, 
  ArrowRight,
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Printer, 
  Activity,
  Heart,
  FileText,
  Upload,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionRecord {
  id: string;
  phone: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  medicines: Medicine[];
}

interface MedicalRecord {
  id: string;
  phone: string;
  title: string;
  lab: string;
  date: string;
  fileName: string;
  fileSize: string;
  fileData: string; // Base64 data URI
}

export default function MedicineHistory() {
  const router = useRouter();
  const { currentPatient } = useHavenline();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'records'>('prescriptions');

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [checkedDoses, setCheckedDoses] = useState<{ [key: string]: boolean }>({});

  // Medical records state
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newLab, setNewLab] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Preview modal state
  const [previewingRecord, setPreviewingRecord] = useState<MedicalRecord | null>(null);

  // Sync prescriptions and records matching the logged-in patient phone number
  useEffect(() => {
    if (!currentPatient) return;

    // Prescriptions sync
    let storedRxStr = localStorage.getItem('havenline_medicine_history');
    if (!storedRxStr) {
      const defaultRx = [
        {
          id: 'rx-seed-1',
          phone: currentPatient.phone,
          patientName: currentPatient.name,
          doctorName: 'Dr. Ashok Seth',
          department: 'Cardiology',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          medicines: [
            {
              name: 'Amlodipine',
              dosage: '5mg',
              frequency: 'Once Daily (morning)',
              duration: '30 Days',
              instructions: 'Take with or without food. Monitor blood pressure weekly.'
            },
            {
              name: 'Atorvastatin',
              dosage: '10mg',
              frequency: 'Once Daily (bedtime)',
              duration: '30 Days',
              instructions: 'Take at night. Avoid grapefruit juice.'
            }
          ]
        }
      ];
      localStorage.setItem('havenline_medicine_history', JSON.stringify(defaultRx));
      storedRxStr = JSON.stringify(defaultRx);
    }

    try {
      const parsed: PrescriptionRecord[] = JSON.parse(storedRxStr);
      const matches = parsed.filter(
        (rx) => rx.phone.trim() === currentPatient.phone.trim()
      );
      matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPrescriptions(matches);
    } catch (e) {
      console.error('Failed to parse medicine history:', e);
    }

    // Medical records sync
    const storedRecStr = localStorage.getItem('havenline_medical_records');
    if (storedRecStr) {
      try {
        const parsed: MedicalRecord[] = JSON.parse(storedRecStr);
        const matches = parsed.filter(
          (rec) => rec.phone.trim() === currentPatient.phone.trim()
        );
        matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(matches);
      } catch (e) {
        console.error('Failed to parse medical records:', e);
      }
    }
  }, [currentPatient]);

  const toggleDose = (medKey: string) => {
    setCheckedDoses((prev) => ({
      ...prev,
      [medKey]: !prev[medKey]
    }));
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  // File to base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds the 2MB browser storage limit.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileBase64(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read document file.');
    };
    reader.readAsDataURL(file);
  };

  // Add new report handler
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!currentPatient) return;
    if (!newTitle.trim()) {
      setUploadError('Please provide a report title.');
      return;
    }
    if (!newLab.trim()) {
      setUploadError('Please specify the diagnostic laboratory.');
      return;
    }
    if (!fileBase64) {
      setUploadError('Please select a document file (PDF or Image) to upload.');
      return;
    }

    const fileSizeStr = selectedFile 
      ? `${(selectedFile.size / 1024).toFixed(0)} KB` 
      : '0 KB';

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      phone: currentPatient.phone,
      title: newTitle.trim(),
      lab: newLab.trim(),
      date: newDate,
      fileName: selectedFile?.name || 'document.pdf',
      fileSize: fileSizeStr,
      fileData: fileBase64
    };

    // Save record
    const storedRecStr = localStorage.getItem('havenline_medical_records');
    let allRecords: MedicalRecord[] = storedRecStr ? JSON.parse(storedRecStr) : [];
    allRecords.unshift(newRecord);
    localStorage.setItem('havenline_medical_records', JSON.stringify(allRecords));

    // Update state
    setRecords((prev) => [newRecord, ...prev]);

    // Clear form inputs
    setNewTitle('');
    setNewLab('');
    setSelectedFile(null);
    setFileBase64('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  // Delete record handler
  const handleDeleteRecord = (id: string) => {
    const storedRecStr = localStorage.getItem('havenline_medical_records');
    if (storedRecStr) {
      const allRecords: MedicalRecord[] = JSON.parse(storedRecStr);
      const filtered = allRecords.filter((rec) => rec.id !== id);
      localStorage.setItem('havenline_medical_records', JSON.stringify(filtered));
      setRecords((prev) => prev.filter((rec) => rec.id !== id));
    }
  };

  // Simulated document visual mock renderer based on report ID or content
  const renderSimulatedDocument = (rec: MedicalRecord) => {
    // If it is one of the preloaded demo reports:
    if (rec.id === 'rec-1') {
      return (
        <div className="space-y-4 font-mono text-[11px] leading-relaxed text-white/80">
          <div className="border border-white/10 p-4 rounded-xl bg-black/40 space-y-3">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-cyan-400">TEST DESCRIPTOR</span>
              <span className="font-extrabold text-white">OBSERVED VALUE</span>
              <span className="font-extrabold text-white/40">REFERENCE INTERVAL</span>
            </div>
            <div className="flex justify-between">
              <span>CHOLESTEROL, TOTAL:</span>
              <span className="font-black text-white">195 mg/dL</span>
              <span className="text-white/45">{"< 200 (Optimal)"}</span>
            </div>
            <div className="flex justify-between">
              <span>TRIGLYCERIDES:</span>
              <span className="font-black text-amber-400">160 mg/dL *</span>
              <span className="text-white/45">{"< 150 (Optimal)"}</span>
            </div>
            <div className="flex justify-between">
              <span>HDL CHOLESTEROL:</span>
              <span className="font-black text-emerald-400">48 mg/dL</span>
              <span className="text-white/45">{"> 40 (Normal)"}</span>
            </div>
            <div className="flex justify-between">
              <span>LDL CHOLESTEROL:</span>
              <span className="font-black text-amber-400">110 mg/dL *</span>
              <span className="text-white/45">{"< 100 (Optimal)"}</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-black text-cyan-455 tracking-widest uppercase">Consulting MD Interpretation:</span>
            <p className="text-[10px] text-white/60">
              Mild hyperlipidemia signature. Recommend reducing saturated fatty acids intake and introducing 30 minutes of daily aerobic exercise. Repeat lipid panel test in 4 weeks.
            </p>
          </div>
        </div>
      );
    }
    if (rec.id === 'rec-2') {
      return (
        <div className="space-y-4 font-mono text-[11px] leading-relaxed text-white/80">
          <div className="border border-white/10 p-4 rounded-xl bg-black/40 space-y-3">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-cyan-400">SPIROMETRY INDEX</span>
              <span className="font-extrabold text-white">OBSERVED VALUE</span>
              <span className="font-extrabold text-white/40">REF PREDICTED</span>
            </div>
            <div className="flex justify-between">
              <span>FEV1 (Liters):</span>
              <span className="font-black text-white">3.10 L (82%)</span>
              <span className="text-white/45">{"> 80% predicted"}</span>
            </div>
            <div className="flex justify-between">
              <span>FVC (Liters):</span>
              <span className="font-black text-white">3.65 L (85%)</span>
              <span className="text-white/45">{"> 80% predicted"}</span>
            </div>
            <div className="flex justify-between">
              <span>FEV1/FVC RATIO:</span>
              <span className="font-black text-amber-400">72% *</span>
              <span className="text-white/45">{"> 75% predicted"}</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-black text-cyan-455 tracking-widest uppercase">Consulting MD Interpretation:</span>
            <p className="text-[10px] text-white/60">
              Slight restrictive airflow layout matching medical history profile of mild asthma. Post-bronchodilator tests reflect reversibility. Maintain inhaler records on the Havenline queue tracking stubs.
            </p>
          </div>
        </div>
      );
    }
    if (rec.id === 'rec-3') {
      return (
        <div className="space-y-4 font-mono text-[11px] leading-relaxed text-white/80">
          <div className="border border-white/10 p-4 rounded-xl bg-black/40 space-y-3">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-cyan-400">ECG PARAMETERS</span>
              <span className="font-extrabold text-white">OBSERVED MEASUREMENT</span>
              <span className="font-extrabold text-white/40">REFERENCE STANDARD</span>
            </div>
            <div className="flex justify-between">
              <span>HEART RATE:</span>
              <span className="font-black text-emerald-400">72 BPM</span>
              <span className="text-white/45">60 - 100 BPM</span>
            </div>
            <div className="flex justify-between">
              <span>PR INTERVAL:</span>
              <span className="font-black text-white">160 ms</span>
              <span className="text-white/45">120 - 200 ms</span>
            </div>
            <div className="flex justify-between">
              <span>QRS DURATION:</span>
              <span className="font-black text-white">90 ms</span>
              <span className="text-white/45">{"< 120 ms"}</span>
            </div>
            <div className="flex justify-between">
              <span>QT/QTc INTERVAL:</span>
              <span className="font-black text-white">380/420 ms</span>
              <span className="text-white/45">{"< 440 ms (QTc)"}</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-black text-cyan-455 tracking-widest uppercase">Impression / Findings:</span>
            <p className="text-[10px] text-white/60">
              Normal Sinus Rhythm. No ST-T segment elevation or pathological Q-waves observed. Electrophysiological conductive pathways are fully intact and functional.
            </p>
          </div>
        </div>
      );
    }

    // For user-uploaded files:
    if (rec.fileData.startsWith('data:image')) {
      return (
        <div className="flex flex-col items-center justify-center p-2 bg-black/30 border border-white/10 rounded-xl">
          <img 
            src={rec.fileData} 
            alt={rec.title} 
            className="max-h-[50vh] object-contain rounded-lg shadow-lg border border-white/10" 
          />
          <span className="text-[8px] text-white/35 mt-2 font-mono">{rec.fileName}</span>
        </div>
      );
    }

    // Default uploaded PDF document visual mockup representation:
    return (
      <div className="space-y-4 font-mono text-[11px] leading-relaxed text-white/80">
        <div className="border border-white/10 p-6 rounded-xl bg-black/40 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#00B8D4] mx-auto animate-pulse" />
          <div className="space-y-1">
            <p className="font-extrabold text-white uppercase text-[12px]">{rec.title}</p>
            <p className="text-[9px] text-[#00B8D4] font-bold uppercase tracking-wider">{rec.lab}</p>
          </div>
          <p className="text-[10px] text-white/50 max-w-xs mx-auto font-sans leading-relaxed">
            This document ({rec.fileName}) was uploaded to your local browser storage.
          </p>
        </div>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-xl text-center">
          <a
            href={rec.fileData}
            download={rec.fileName}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all shadow-md inline-block"
          >
            Download Document File
          </a>
        </div>
      </div>
    );
  };

  // 1. Not Logged In View
  if (!currentPatient) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 bg-[#060a08] min-h-screen text-white font-mono text-xs relative overflow-hidden">
        
        {/* Moving Lovely Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="blob-animate-1 absolute top-[15%] left-[10%] w-[360px] h-[360px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
          <div className="blob-animate-2 absolute bottom-[15%] right-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner relative z-10">
          <AlertCircle size={28} className="text-cyan-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2 relative z-10 max-w-sm">
          <h3 className="font-extrabold text-white uppercase tracking-wider">Authentication Required</h3>
          <p className="text-[11px] text-white/50 leading-relaxed font-sans font-medium">
            No active patient profile is locked. Please enter your name and phone number on the onboarding page to load your clinical medicine history.
          </p>
        </div>
        <button
          onClick={() => router.push('/portal/profile')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10 transition-all relative z-10"
        >
          Setup Profile (Login) <ArrowRight size={12} className="inline ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#060a08] text-white min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden font-mono text-xs">
      
      {/* Moving Lovely Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-animate-1 absolute top-[10%] left-[8%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 rounded-full blur-[100px]" />
        <div className="blob-animate-2 absolute bottom-[10%] right-[8%] w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/15 to-emerald-400/12 rounded-full blur-[110px]" />
        <div className="blob-animate-3 absolute top-[40%] left-[30%] w-[320px] h-[320px] bg-gradient-to-tr from-teal-400/12 to-emerald-600/12 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation back and profile status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/portal')}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider font-extrabold text-[10px] self-start"
            >
              <ArrowLeft size={14} /> Back to Care Portal
            </button>
            <span className="text-white/20">|</span>
            <button 
              onClick={() => router.push('/')}
              className="text-white/50 hover:text-white transition-colors uppercase tracking-wider font-extrabold text-[10px]"
            >
              Back to Landing Page
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white/70">
            <User size={13} className="text-cyan-400" />
            <span>Active Login Profile: <strong>{currentPatient.name.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Tab Selector Headers */}
        <div className="flex border-b border-white/10 gap-4">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3.5 px-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'prescriptions'
                ? 'border-emerald-450 text-emerald-400'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <Heart size={15} /> Prescriptions History
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3.5 px-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'records'
                ? 'border-emerald-450 text-emerald-400'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <FileText size={15} /> Medical Reports Vault
          </button>
        </div>

        {activeTab === 'prescriptions' ? (
          
          // TAB 1: PRESCRIPTIONS LIST
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Stethoscope size={18} className="text-emerald-400" /> Medication Records History
              </h2>
              <p className="text-[10px] text-white/50 uppercase leading-relaxed">
                Consultation details and specialized regimens recommended by partner clinic roster doctors.
              </p>
            </div>

            {prescriptions.length === 0 ? (
              <div className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-12 text-center space-y-4 shadow-xl backdrop-blur-xl animate-fade-in">
                <Activity className="w-12 h-12 text-cyan-400/40 mx-auto animate-pulse" />
                <h4 className="font-extrabold text-white font-mono uppercase tracking-wider text-xs">No Medicine Logs Found</h4>
                <p className="text-[11px] text-white/50 max-w-sm mx-auto font-sans leading-relaxed">
                  We couldn't identify any previous prescription logs registered for the phone number <strong>{currentPatient.phone}</strong>. Once you check out from matching hospitals, prescriptions will be logged here.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const demoAarav = {
                        name: 'Aarav Tyagi',
                        phone: '9876543211',
                        age: 34,
                        gender: 'Male',
                        medicalHistory: ['Hypertension', 'Diabetes'],
                        emergencyContact: { name: 'Karan Tyagi', phone: '9876543219', relationship: 'Brother' }
                      };
                      localStorage.setItem('havenline_patient', JSON.stringify(demoAarav));
                      window.location.reload();
                    }}
                    className="px-4 py-2 border border-white/10 hover:border-emerald-450 bg-white/5 text-white/70 hover:text-white rounded-xl text-[9px] uppercase tracking-wider transition-all"
                  >
                    Test Demo Account: Log In as Aarav Tyagi (9876543211)
                  </button>
                </div>
              </div>
            ) : (
              prescriptions.map((rx) => (
                <div 
                  key={rx.id}
                  className="bg-[#0a0f0d]/75 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-2xl p-6 relative overflow-hidden animate-fade-in space-y-5"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[13px] text-white uppercase tracking-tight">
                          {rx.doctorName}
                        </h3>
                        <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                          {rx.department} Department Consulting
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end text-right font-mono text-[9px] uppercase text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-white/30" /> {formatDate(rx.date)}
                      </span>
                      <span className="text-[8px] tracking-wider text-white/30 mt-0.5">
                        REGIMEN_ID: {rx.id.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {rx.medicines.map((med, mIdx) => {
                      const doseKey = `${rx.id}-${mIdx}`;
                      const isTaken = checkedDoses[doseKey] || false;
                      
                      return (
                        <div 
                          key={mIdx}
                          className={`p-4 rounded-xl border transition-all ${
                            isTaken 
                              ? 'bg-emerald-500/5 border-emerald-500/35 text-white/70 shadow-sm' 
                              : 'bg-white/5 border-white/5 text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isTaken ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                                <h4 className="font-extrabold text-xs text-white tracking-tight">{med.name}</h4>
                                <span className="text-[9px] font-bold text-white/40">({med.dosage})</span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[10px] text-white/50 font-mono">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} className="text-white/30" /> {med.frequency}
                                </span>
                                <span className="text-white/20">|</span>
                                <span className="font-bold text-cyan-400">{med.duration} treatment</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleDose(doseKey)}
                              className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all ${
                                isTaken
                                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-sm'
                                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {isTaken ? '✓ Taken Today' : 'Mark Taken'}
                            </button>
                          </div>

                          <div className="mt-3 p-2.5 bg-black/20 border border-white/5 rounded-lg text-[10px] text-white/70 leading-relaxed">
                            <strong className="text-cyan-400 uppercase tracking-widest text-[8px] block mb-0.5">Instructions:</strong>
                            {med.instructions}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[9px] uppercase tracking-wider text-white/40">
                    <span className="flex items-center gap-1 font-sans">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Intake Verified by Havenline Core
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-bold"
                    >
                      <Printer size={12} /> Print Regimen Stub
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          
          // TAB 2: MEDICAL REPORTS VAULT
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <FileText size={18} className="text-[#00B8D4]" /> Digital Medical Reports Vault
              </h2>
              <p className="text-[10px] text-white/50 uppercase leading-relaxed">
                Store digital copies of lab panels, blood work, or clinical scan PDFs locally in your browser's secure data vault.
              </p>
            </div>

            {/* Upload Form Block */}
            <div className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase text-white/75 tracking-wider flex items-center gap-1 border-b border-white/5 pb-2">
                <Plus size={13} className="text-emerald-400" /> Upload Diagnostic Lab Report
              </h3>

              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-xl text-[10px] text-red-400 font-mono">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/25 rounded-xl text-[10px] text-emerald-400 font-mono">
                  ✓ Report successfully uploaded and encrypted locally in browser records list!
                </div>
              )}

              <form onSubmit={handleAddRecord} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Report Title</label>
                  <input
                    type="text"
                    placeholder="e.g. CBC Blood Panel Report"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-450 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Diagnostic Lab / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Diagnostics"
                    value={newLab}
                    onChange={(e) => setNewLab(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-450 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Date of Medical Test</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 p-3 bg-white/5 text-white focus:border-emerald-450 focus:outline-none font-sans"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Choose Report File (PDF / Image)</label>
                  <div className="relative w-full h-11 border border-white/10 rounded-xl bg-white/5 flex items-center px-3 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={14} className="text-white/40 mr-2 shrink-0" />
                    <span className="text-[10px] text-white/60 truncate font-sans font-medium">
                      {selectedFile ? `${selectedFile.name} (${(selectedFile.size/1024).toFixed(0)}KB)` : 'Select report file...'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Add Report to Clinical Vault
                  </button>
                </div>
              </form>
            </div>

            {/* Records List directory */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-black uppercase text-white/50 tracking-widest">Digital Vault Documents ({records.length})</h3>
              
              {records.length === 0 ? (
                <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center text-white/50 leading-relaxed font-sans font-medium">
                  Vault Empty. Upload your PDF test reports and digital lab panels to store them securely.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {records.map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-[#0a0f0d]/75 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4 relative overflow-hidden shadow-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00B8D4]/40 to-transparent" />
                      
                      <div className="space-y-1.5 font-mono text-[10px]">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-[11px] text-white uppercase tracking-tight leading-snug line-clamp-2">
                            {rec.title}
                          </h4>
                          
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-red-400 hover:bg-red-950/20 hover:border-red-500/25 transition-all shrink-0"
                            title="Delete file copy from local vault"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-cyan-400 font-bold uppercase tracking-wider">{rec.lab}</p>
                        <p className="text-[9px] text-white/40">Test Date: {rec.date}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[9px] uppercase tracking-wider">
                        <span className="text-white/35 font-sans font-semibold">
                          {rec.fileName} ({rec.fileSize})
                        </span>
                        
                        <button
                          onClick={() => setPreviewingRecord(rec)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <Eye size={12} /> Inspect File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Visual Clinical Report Document Preview Modal */}
      {previewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-lg bg-[#0a0f0d] border border-white/15 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden font-mono text-xs text-white p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#00B8D4]" />
                <div>
                  <h3 className="font-extrabold text-[11px] text-white uppercase tracking-wider">SECURE VAULT VIEW</h3>
                  <p className="text-[8px] text-white/40 font-bold">VERIFIED CLINICAL RECORD STUB</p>
                </div>
              </div>
              
              <button
                onClick={() => setPreviewingRecord(null)}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 uppercase tracking-widest text-[9px] font-black transition-all"
              >
                Close [ESC]
              </button>
            </div>

            {/* Document Details grid */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 rounded-xl p-3.5 text-[10px] text-white/55">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/30 mb-0.5">Patient Name:</span>
                <strong className="text-white uppercase">{currentPatient.name}</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/30 mb-0.5">Test Date:</span>
                <strong className="text-white">{previewingRecord.date}</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/30 mb-0.5">Report Title:</span>
                <strong className="text-white uppercase truncate block max-w-[180px]">{previewingRecord.title}</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/30 mb-0.5">Laboratory Source:</span>
                <strong className="text-white uppercase truncate block max-w-[180px]">{previewingRecord.lab}</strong>
              </div>
            </div>

            {/* Interactive Document Contents */}
            <div className="space-y-3 pt-2">
              <p className="text-[8px] text-white/35 uppercase tracking-widest font-black">Digital report document values:</p>
              {renderSimulatedDocument(previewingRecord)}
            </div>

            {/* Print or Download footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[9px] text-white/40">
              <span>Security status: LOCALHOST_LOCK</span>
              <button
                onClick={() => window.print()}
                className="hover:text-emerald-450 transition-all font-black uppercase flex items-center gap-1"
              >
                <Printer size={12} /> Print Report Page
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
