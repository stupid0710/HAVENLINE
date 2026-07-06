import { TriageResult } from '../context/HavenlineContext';

// Basic offline rule-based triage fallback
export const localTriageSymptoms = (symptomsText: string, age?: number): TriageResult => {
  const query = symptomsText.toLowerCase();
  
  // Non-medical offline fallback detector
  const medicalKeywords = [
    'pain', 'ache', 'fever', 'cold', 'cough', 'sore', 'breath', 'throat', 'headache', 'dizzy', 'nausea', 'vomit',
    'diarrhea', 'constipat', 'injury', 'bleed', 'fracture', 'broken', 'dislocat', 'accident', 'fall', 'chest', 'heart',
    'cardiac', 'stroke', 'numb', 'paralysis', 'droop', 'slur', 'asthma', 'choke', 'symptom', 'ill', 'sick', 'doctor',
    'hospital', 'clinic', 'medicine', 'pill', 'tablet', 'dose', 'suture', 'wound', 'sprain', 'swell', 'inflam'
  ];

  const isMedicalQuery = medicalKeywords.some(kw => query.includes(kw));

  if (!isMedicalQuery) {
    let explanation = "I detected this is a general interest query outside the clinical medical realm. Ask me anything, and I will try my best to answer!";
    if (query.includes('capital of')) {
      explanation = "I don't have real-time access to the Web, but the capital of France is Paris, and the capital of India is New Delhi! 🗺️";
    } else if (query.includes('joke')) {
      explanation = "Why don't scientists trust atoms? Because they make up everything! ⚛️";
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      explanation = "Hello! I am your AI companion. I can help with clinical symptom assessments or answer any general questions you have!";
    } else if (query.includes('weather')) {
      explanation = "I don't have direct satellite access to live weather telemetry, but I hope it is sunny and pleasant where you are! ☀️";
    } else if (query.includes('code') || query.includes('python') || query.includes('javascript') || query.includes('program')) {
      explanation = "Sure! Here is a simple Python function to reverse a list:\n\n```python\ndef reverse_list(lst):\n    return lst[::-1]\n```\nLet me know if you need help with any other code snippets!";
    }

    return {
      urgency: 'Low',
      department: 'General Medicine',
      confidenceScore: 100,
      symptoms: symptomsText,
      explanation,
      suggestedTests: [],
      doctorQuestions: []
    };
  }
  
  // Critical emergencies
  if (
    query.includes('chest pain') ||
    query.includes('heart attack') ||
    query.includes('cardiac') ||
    query.includes('pressure in chest') ||
    query.includes('numbness in arm') ||
    query.includes('jaw pain')
  ) {
    return {
      urgency: 'Critical',
      department: 'Cardiology',
      confidenceScore: 97,
      symptoms: symptomsText,
      explanation: 'Symptoms indicate potential acute coronary syndrome or cardiac event. High risk of cardiovascular compromise.',
      suggestedTests: ['Electrocardiogram (ECG / EKG)', 'Troponin I/T blood markers', 'Echocardiogram', 'Chest X-Ray'],
      doctorQuestions: [
        'Does the pain radiate to your left arm, shoulder, jaw, or back?',
        'Is the pain accompanied by sweating, shortness of breath, or nausea?',
        'How long ago did this chest discomfort begin?'
      ]
    };
  }

  if (
    query.includes('stroke') ||
    query.includes('speech slur') ||
    query.includes('face droop') ||
    query.includes('paralysis') ||
    query.includes('numbness on one side') ||
    query.includes('difficulty speaking')
  ) {
    return {
      urgency: 'Critical',
      department: 'Neurology',
      confidenceScore: 95,
      symptoms: symptomsText,
      explanation: 'Acute neurological deficit pointing to a potential cerebrovascular accident (Stroke). Instant intervention required.',
      suggestedTests: ['Non-contrast Brain CT scan', 'Brain MRI', 'Carotid Doppler ultrasound', 'Blood glucose level'],
      doctorQuestions: [
        'When was the patient last seen normal?',
        'Is there sudden weakness in the arms, legs, or facial muscles?',
        'Does the patient have a history of high blood pressure or atrial fibrillation?'
      ]
    };
  }

  if (
    query.includes('difficulty breathing') ||
    query.includes('shortness of breath') ||
    query.includes('cannot breathe') ||
    query.includes('asthma attack') ||
    query.includes('choking')
  ) {
    const isPediatric = age && age < 12;
    return {
      urgency: 'Critical',
      department: isPediatric ? 'Pediatrics' : 'Pulmonology',
      confidenceScore: 92,
      symptoms: symptomsText,
      explanation: 'Acute respiratory distress. Impending airway closure or severe bronchospasm. Continuous monitoring required.',
      suggestedTests: ['Oxygen saturation levels (SpO2)', 'ABG (Arterial Blood Gas) analysis', 'Chest X-Ray', 'Pulmonary function test'],
      doctorQuestions: [
        'Is the patient wheezing or showing chest retractions?',
        'Does the patient have a history of severe asthma or anaphylaxis?',
        'Is there blue coloration around the lips or fingernails?'
      ]
    };
  }

  // Severe Trauma & Accidents (Critical Catastrophe)
  if (
    query.includes('accident') ||
    query.includes('crash') ||
    query.includes('unconscious') ||
    query.includes('severe bleeding') ||
    query.includes('head injury') ||
    query.includes('major trauma') ||
    query.includes('bleeding heavily') ||
    query.includes('severe fall') ||
    query.includes('collision')
  ) {
    return {
      urgency: 'Critical',
      department: 'Emergency Medicine',
      confidenceScore: 99,
      symptoms: symptomsText,
      explanation: 'Critical trauma or accident injury. High risk of systemic shock, internal bleeding, or neurological damage. Immediate triage bypass required.',
      suggestedTests: ['Whole-body Trauma CT Scan', 'Ultrasound FAST scan (internal bleeding check)', 'Blood grouping & cross-match', 'Complete spine X-Ray series'],
      doctorQuestions: [
        'Is the patient fully conscious and responding to voice/pain stimuli?',
        'Are there any visible head injuries, open fractures, or active arterial bleeding?',
        'Did the patient experience any loss of consciousness or vomiting since the incident?'
      ]
    };
  }

  // Orthopedics/Trauma
  if (
    query.includes('fracture') ||
    query.includes('broken bone') ||
    query.includes('joint dislocat') ||
    query.includes('fall')
  ) {
    return {
      urgency: 'High',
      department: 'Orthopedics',
      confidenceScore: 89,
      symptoms: symptomsText,
      explanation: 'Suspected skeletal fracture or joint injury. Requires immobilization, radiological scanning, and pain relief management.',
      suggestedTests: ['Targeted X-Ray of the injured limb', 'CT scan (for complex joint fractures)', 'Complete blood count (CBC)'],
      doctorQuestions: [
        'Are you able to bear weight or move the affected limb?',
        'Is there visible deformity, open skin wounds, or severe swelling?',
        'Is there any numbness or tingling below the site of injury?'
      ]
    };
  }

  // Gastroenterology
  if (
    query.includes('stomach pain') ||
    query.includes('vomit') ||
    query.includes('diarrhea') ||
    query.includes('food poison') ||
    query.includes('acidity') ||
    query.includes('nausea')
  ) {
    return {
      urgency: 'Medium',
      department: 'Gastroenterology',
      confidenceScore: 86,
      symptoms: symptomsText,
      explanation: 'Acute gastrointestinal inflammation, foodborne toxicity, or gastritis. Manage for dehydration and electrolyte balance.',
      suggestedTests: ['Abdominal Ultrasound', 'Serum electrolytes', 'Stool routine test', 'LFT (Liver Function Test)'],
      doctorQuestions: [
        'Is the pain sharp and localized (e.g. right lower quadrant for appendicitis)?',
        'Have you eaten any street food or expired items recently?',
        'Are you able to keep fluids down, or are you vomiting continuously?'
      ]
    };
  }

  // General Medicine/Pediatrics default fallback
  const isKid = age && age < 12;
  const isFever = query.includes('fever') || query.includes('cold') || query.includes('cough') || query.includes('sore throat');
  
  return {
    urgency: isFever ? 'Medium' : 'Low',
    department: isKid ? 'Pediatrics' : 'General Medicine',
    confidenceScore: 82,
    symptoms: symptomsText,
    explanation: isFever 
      ? 'Symptoms match standard upper respiratory infection or viral fever. Routine physical checkup and antipyretics advised.'
      : 'General symptomatic complaints. Non-emergency case, scheduled consultation is suitable.',
    suggestedTests: ['Complete Blood Count (CBC)', 'Urine analysis', 'CRP (C-Reactive Protein) blood check'],
    doctorQuestions: [
      'What is the highest temperature recorded on a thermometer?',
      'How many days have these symptoms persisted?',
      'Do you have any history of drug allergies?'
    ]
  };
};

// Streaming AI simulation helper
export const simulateStreamingAI = async (
  symptoms: string,
  age: number,
  onToken: (text: string) => void
): Promise<TriageResult> => {
  const result = localTriageSymptoms(symptoms, age);
  const fullText = `[ANALYZING SYMPTOMS]\n` +
    `Patient Symptoms: "${symptoms}"\n` +
    `Age Context: ${age} years\n\n` +
    `[TRIAGE DECISION]\n` +
    `* Urgency Rating: ${result.urgency.toUpperCase()}\n` +
    `* Recommended Department: ${result.department}\n` +
    `* Triage Confidence: ${result.confidenceScore}%\n\n` +
    `[CLINICAL EVALUATION]\n` +
    `${result.explanation}\n\n` +
    `[RECOMMENDED DIAGNOSTIC ACTIONS]\n` +
    `${result.suggestedTests.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}\n\n` +
    `[PHYSICIAN CLINICAL QUESTIONS]\n` +
    `${result.doctorQuestions.map((q, idx) => `- ${q}`).join('\n')}`;

  // Stream character by character
  let current = '';
  for (let i = 0; i < fullText.length; i += 3) {
    current += fullText.slice(i, i + 3);
    onToken(current);
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
  
  return result;
};
