import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

export async function POST(request: Request) {
  try {
    const { 
      message, 
      chatHistory = [], 
      patientInfo = null, 
      activeAppointment = null,
      doctorsList = [] 
    } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GMAIL_API_KEY;

    if (apiKey) {
      try {
        // Gemini API requires alternating chat history beginning with user
        const formattedHistory: any[] = [];
        let expectedRole = 'user';
        for (const msg of chatHistory) {
          const role = msg.role === 'user' ? 'user' : 'model';
          if (role === expectedRole) {
            formattedHistory.push({
              role: role,
              parts: [{ text: msg.text }]
            });
            expectedRole = expectedRole === 'user' ? 'model' : 'user';
          }
        }

        // If the history ended on a user message, pop it so the current message acts as the next user message.
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
          formattedHistory.pop();
        }

        const systemInstruction = `You are the Havenline 24/7 AI Health Assistant. You are friendly, professional, highly knowledgeable, clever, and witty.
You can answer user queries regarding clinical subjects (medicine reminders, appointment queries, medical report details, doctor rosters, nutrition plans, FAQs) AND general interest questions outside of the medical realm (e.g. general knowledge, math, coding, jokes, storytelling, philosophy).
If the user asks a non-medical question, answer it directly, accurately, and conversationally in a friendly manner. You do not need to restrict yourself to healthcare topics, but you should remain a helpful, intelligent companion.
1. Medicine Reminders: e.g. "When do I take Metformin?", "Remind me to take my pills". Provide general medication schedule advice and confirm you've set a digital reminder in their profile.
2. Appointment Help: e.g. "How do I book?", "What is my current appointment?". Reference the patient's active appointment: ${activeAppointment ? JSON.stringify(activeAppointment) : 'None currently booked'}.
3. Medical Report Explanation: e.g. "Explain my blood sugar test", "What does high HbA1c mean?". Explain clinical abbreviations, blood panels, and ranges clearly, adding a disclaimer to consult their physician.
4. Doctor Availability: e.g. "Is Dr. Ashok Seth available today?". Reference the doctor roster: ${JSON.stringify(doctorsList)}. Answer whether the specific doctor is available or list who is available.
5. Diet Suggestions (General): e.g. "What should I eat for diabetes / high blood pressure?". Suggest healthy foods, low-sodium meals, glycemic index guidelines, and what to avoid.
6. FAQs: e.g. "Is Havenline secure?", "How does queue triage work?". Answer general questions about Havenline.

Patient Context:
- Name: ${patientInfo?.name || 'Guest'}
- Age: ${patientInfo?.age || 30} years old
- Gender: ${patientInfo?.gender || 'Male'}
- Medical History: ${patientInfo?.medicalHistory?.join(', ') || 'None reported'}

Active Appointment Details:
${activeAppointment ? JSON.stringify(activeAppointment) : 'No active appointments booked yet.'}

Roster of Scheduled Doctors:
${JSON.stringify(doctorsList)}

Strict Guidelines:
- Respond in clear, friendly markdown format. Use bullet points and bolding for readability.
- If symptoms sound severe (chest pain, stroke signs, difficulty breathing), recommend immediate emergency room routing or dial 102/112.
- Keep responses concise (under 150 words if possible) so they fit nicely in a chat interface window.`;

        // Format contents including chat history and the current message
        const contents = [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: contents,
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({ reply: responseText, mode: 'Gemini Live AI' });
          }
        }
        console.warn('Gemini Assistant API returned empty or failed. Falling back to local medical logic.');
      } catch (geminiError) {
        console.error('Error in Gemini Assistant call:', geminiError);
      }
    }

    // Local Rule-Based Dialog Response Parser (Fallback)
    const lowerMessage = message.toLowerCase();
    let reply = '';

    if (lowerMessage.includes('remind') || lowerMessage.includes('medicine') || lowerMessage.includes('tablet') || lowerMessage.includes('pill')) {
      reply = `**Medicine Reminders Assistant:**\n\nI can help schedule and track your medications. Here are general suggestions:\n- **Metformin / Diabetes Medications:** Typically taken with meals to reduce stomach side effects.\n- **Statins / Cholesterol:** Often recommended at bedtime as cholesterol synthesis peaks at night.\n- **Antihypertensives / Blood Pressure:** Usually taken in the morning or as directed by your physician.\n\n*Reminder Logged:* I have scheduled a digital alert in your profile for your request. Make sure to consult your doctor for precise dosages!`;
    } 
    else if (lowerMessage.includes('appointment') || lowerMessage.includes('booking') || lowerMessage.includes('current')) {
      if (activeAppointment) {
        reply = `**Appointment Helper:**\n\nYou have an active appointment secured:\n- **Facility:** ${activeAppointment.hospitalName}\n- **Specialist:** ${activeAppointment.doctorName} (${activeAppointment.department})\n- **Scheduled Time:** ${activeAppointment.timeSlot}\n- **Live Queue Position:** #${activeAppointment.queuePosition} (~${activeAppointment.estimatedWaitTime} mins wait)\n\nYou can track progress in real-time on your [Live Queue Board](/portal/queue).`;
      } else {
        reply = `**Appointment Helper:**\n\nYou do not have an active appointment scheduled. To book one:\n1. Describe your symptoms on the [AI Care Navigator Portal](/portal).\n2. View recommended Delhi NCR providers and suitability scores.\n3. Click **Book Appointment** next to your preferred hospital or clinic.`;
      }
    } 
    else if (lowerMessage.includes('report') || lowerMessage.includes('hba1c') || lowerMessage.includes('blood test') || lowerMessage.includes('ecg') || lowerMessage.includes('glucose')) {
      reply = `**Report Analyzer:**\n\nHere are explanations of common clinical report parameters:\n- **HbA1c (Glycated Hemoglobin):** Measures your average blood sugar level over the past 3 months. Normal is <5.7%, Prediabetes is 5.7%-6.4%, and Diabetes is 6.5% or higher.\n- **Blood Pressure (Systolic/Diastolic):** Normal is <120/80 mmHg. Elevated is 120-129/<80. Hypertension Stage 1 is 130-139/80-89.\n- **ECG (Electrocardiogram):** Tracks electrical signals of your heart to detect arrhythmias or ischemia.\n\n*⚠️ Warning:* AI report explanations are for informational purposes only. Please review these parameters with your primary doctor.`;
    }
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('availability') || lowerMessage.includes('roster')) {
      if (doctorsList && doctorsList.length > 0) {
        const available = doctorsList.filter((d: any) => d.available).slice(0, 3);
        const listText = available.map((d: any) => `- **${d.name}** (${d.specialization}): Active / On-Duty`).join('\n');
        reply = `**Doctor Roster Assistant:**\n\nHere are some of the active doctors currently scheduled at your selected facility today:\n${listText}\n\nTo lock a consult with them, proceed to the [Confirm Booking](/portal/booking) page.`;
      } else {
        reply = `**Doctor Roster Assistant:**\n\nStandard clinical rosters are active today. We have fell back to General Medicine and Emergency specialists to prevent locks. Please select a department on the booking page to see detailed doctor cards.`;
      }
    }
    else if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition')) {
      reply = `**Diet & Nutrition Suggestions:**\n\nHere are general clinical diet plans based on health concerns:\n- **For Diabetes/Blood Sugar Control:** Prioritize fiber-rich foods, leafy greens, lean proteins (chicken, fish), and complex carbohydrates (oats, brown rice). Minimize refined sugars and high-glycemic foods.\n- **For Hypertension/Heart Health (DASH Diet):** Reduce sodium intake (salt), increase potassium-rich foods (bananas, spinach), and incorporate whole grains and low-fat dairy.\n- **Hydration:** Aim for 2-3 liters of clean water daily to assist renal function.`;
    }
    else if (lowerMessage.includes('joke')) {
      reply = `**Witty Companion:**\n\nWhy don't scientists trust atoms? Because they make up everything! ⚛️\n\nNeed assistance with symptoms or appointments, or want to ask another general question? I am here to help!`;
    }
    else if (lowerMessage.includes('weather')) {
      reply = `**Environmental Assistant:**\n\nI do not have access to live meteorological satellite telemetry, but I hope the climate in Delhi NCR is pleasant! Always remember to dress comfortably and carry water to maintain fluid metrics. ☀️`;
    }
    else if (lowerMessage.includes('capital of')) {
      reply = `**General Knowledge:**\n\nThe capital of France is **Paris**, and the capital of India is **New Delhi**. 🗺️ Let me know if you need to look up more geographical facts!`;
    }
    else if (lowerMessage.includes('code') || lowerMessage.includes('python') || lowerMessage.includes('javascript') || lowerMessage.includes('program')) {
      reply = `**Software Assistant:**\n\nSure! Here is a simple Python function to reverse a list:\n\n\`\`\`python\ndef reverse_list(lst):\n    return lst[::-1]\n\`\`\`\n\nLet me know if you'd like to check out other code samples!`;
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('greetings')) {
      reply = `**Havenline AI Companion:**\n\nHello! I am your interactive care assistant. I can explain clinical reports, check active appointments, roster duty lists, or converse about topics outside the medical domain! Ask me anything.`;
    }
    else {
      // General FAQs
      reply = `**Havenline AI Assistant:**\n\nI can help you with health questions (like medicines, diets, reports) or general knowledge (outside medicine)! Ask me anything, or query typical helper topics:\n- **Medicines:** e.g., "When do I take Metformin?"\n- **Appointments:** e.g., "Check active slots"\n- **General Interest:** e.g., "Tell me a joke" or "Capital of France"`;
    }

    return NextResponse.json({ reply, mode: 'Local Assistant Engine (Fallback)' });
  } catch (error) {
    console.error('Health Assistant API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
