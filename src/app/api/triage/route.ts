import { NextResponse } from 'next/server';
import { localTriageSymptoms } from '../../../lib/aiEngine';

export async function POST(request: Request) {
  try {
    const { symptoms, age, gender, medicalHistory } = await request.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms description is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GMAIL_API_KEY;

    if (apiKey) {
      // Call live Gemini API
      try {
        const prompt = `You are a clinical triage AI assistant for Havenline. 
Analyze the patient symptoms and patient metadata below, then classify the urgency level, recommend a clinical department, explain the severity rationale, list 3 suggested diagnostic tests, and prepare 3 key questions the physician should ask.

Patient Demographics:
- Age: ${age || 30} years old
- Gender: ${gender || 'Male'}
- Medical History: ${medicalHistory && medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None reported'}

Patient Presenting Symptoms:
"${symptoms}"

You MUST respond with a single, valid JSON object containing exactly the following keys, with no additional text or Markdown wrapping (do NOT wrap in \`\`\`json):
{
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "department": "Cardiology" | "Neurology" | "Pulmonology" | "Pediatrics" | "Orthopedics" | "Gastroenterology" | "General Medicine" | "Emergency Medicine",
  "explanation": "A concise 2-3 sentence clinical explanation of the symptoms and urgency.",
  "confidenceScore": 80-100 (an integer),
  "suggestedTests": ["test 1", "test 2", "test 3"],
  "doctorQuestions": ["question 1", "question 2", "question 3"]
}

Guidelines for Urgency:
- Critical: Active chest pain, suspected heart attack/stroke, respiratory failure, severe trauma, car accidents, severe falls, heavy bleeding, or unconsciousness.
- High: Fractures, severe abdominal pain, high persistent fever with stiffness, breathing distress.
- Medium: Moderately high fever, tolerable stomach cramps, sprains, persistent cough.
- Low: Mild cold, minor skin scratch, minor throat itch.

Guidelines for Department Recommendation:
- If the patient was in an accident, car crash, fall, experienced severe trauma, or presents heavy bleeding/unconsciousness, recommend "Emergency Medicine" with "Critical" urgency.
- If patient age is < 12 and department is not cardiology/neurology/orthopedics/emergency medicine, recommend "Pediatrics".

Guidelines for General/Non-Medical Queries:
- If the user's input is a general query, code request, question, greeting, or conversation topic COMPLETELY outside the medical/healthcare realm (e.g., general knowledge, math, coding, jokes, storytelling, philosophy), do NOT force a medical diagnosis. Instead, answer their question directly, comprehensively, and conversationally in the "explanation" field. Set "urgency" to "Low", "department" to "General Medicine", "confidenceScore" to 100, "suggestedTests" to [], and "doctorQuestions" to [].`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText.trim());
            return NextResponse.json({ ...parsed, mode: 'Gemini Live AI' });
          }
        }
        
        console.error('Gemini API call failed or returned empty. Falling back to local AI.');
      } catch (geminiError) {
        console.error('Error invoking Gemini API:', geminiError);
        // Fall through to local simulation
      }
    }

    // Fallback: Local rule-based AI engine
    const localResult = localTriageSymptoms(symptoms, age);
    // Add artificial delay to simulate AI processing latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return NextResponse.json({
      ...localResult,
      mode: 'Local AI Engine (Simulated Fallback)'
    });
  } catch (error) {
    console.error('Triage API error:', error);
    return NextResponse.json({ error: 'Internal server error during triage.' }, { status: 500 });
  }
}
