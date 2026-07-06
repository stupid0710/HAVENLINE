import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { symptoms, clinicalSummary, age, gender } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GMAIL_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are a clinical physician assistant for Havenline. Based on the patient details, generate a realistic medical prescription draft.
The draft should be clinically appropriate for the symptoms, but keep it clear and safe.

Patient Demographics:
- Age: ${age || 30} years old
- Gender: ${gender || 'Male'}
- Presenting Symptoms: "${symptoms}"
- Triage Summary: "${clinicalSummary || ''}"

You MUST respond with a single, valid JSON object containing exactly the following format. Output only raw JSON with no Markdown wrappers (do NOT wrap in \`\`\`json):
{
  "medicines": [
    {
      "name": "Medicine Name (e.g. Paracetamol)",
      "dosage": "Dosage (e.g. 500mg)",
      "frequency": "Frequency (e.g. Twice Daily)",
      "duration": "Duration (e.g. 5 Days)",
      "instructions": "Instructions (e.g. Take after meals)"
    }
  ],
  "lifestyleAdvice": "General dietary or recovery advice (e.g. Drink plenty of water and rest)",
  "followUp": "Follow-up instructions (e.g. Review if fever persists for 3 days)"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.3,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json(JSON.parse(responseText.trim()));
          }
        }
      } catch (geminiError) {
        console.error('Error calling Gemini for prescription:', geminiError);
      }
    }

    // Local Fallback logic
    const lowerSymptoms = (symptoms || '').toLowerCase();
    let medicines = [];
    let lifestyleAdvice = 'Rest and stay hydrated.';
    let followUp = 'Consult a primary care physician if symptoms worsen.';

    if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('heart') || lowerSymptoms.includes('breath')) {
      medicines = [
        {
          name: 'Aspirin (Acuprin)',
          dosage: '75mg',
          frequency: 'Once Daily',
          duration: '10 Days',
          instructions: 'Take in the morning after breakfast.'
        },
        {
          name: 'Atorvastatin (Lipitor)',
          dosage: '20mg',
          frequency: 'Once Daily',
          duration: '30 Days',
          instructions: 'Take at night before sleep.'
        }
      ];
      lifestyleAdvice = 'Strict low-sodium and low-cholesterol diet. Rest completely; avoid heavy physical activity.';
      followUp = 'Follow-up with cardiology specialist in 3 days.';
    } else if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('migraine') || lowerSymptoms.includes('fever')) {
      medicines = [
        {
          name: 'Paracetamol (Calpol)',
          dosage: '650mg',
          frequency: 'Thrice Daily',
          duration: '5 Days',
          instructions: 'Take after meals if temperature is above 99°F.'
        },
        {
          name: 'Ibuprofen (Combiflam)',
          dosage: '400mg',
          frequency: 'Twice Daily',
          duration: '3 Days',
          instructions: 'Take with milk/food only if pain is severe.'
        }
      ];
      lifestyleAdvice = 'Ensure fluid intake of at least 3 liters. Rest in a dark, quiet room.';
      followUp = 'Visit clinic if fever persists for more than 48 hours.';
    } else {
      medicines = [
        {
          name: 'Amoxicillin (Augmentin)',
          dosage: '625mg',
          frequency: 'Twice Daily',
          duration: '5 Days',
          instructions: 'Take after food. Complete the full 5-day course.'
        },
        {
          name: 'Cetirizine (Okacet)',
          dosage: '10mg',
          frequency: 'Once Daily',
          duration: '5 Days',
          instructions: 'Take at night. May cause mild drowsiness.'
        }
      ];
      lifestyleAdvice = 'Drink warm liquids, rest, and avoid cold foods.';
      followUp = 'Follow-up in 5 days if cough or cold persists.';
    }

    return NextResponse.json({ medicines, lifestyleAdvice, followUp });
  } catch (error) {
    console.error('Error generating prescription:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
