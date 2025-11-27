import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the Virtual Admissions Officer and Student Support Assistant for Greenville International College, a prestigious secondary school in Ikeja, Lagos, Nigeria.

Key Information about the school:
- **Location**: 12, Adeola Hope Street, Ikeja GRA, Lagos.
- **Motto**: "Knowledge, Integrity, Service".
- **Curriculum**: We offer a blend of the Nigerian National Curriculum (WAEC/NECO) and the British Curriculum (IGCSE).
- **Tuition**: 550,000 Naira per term for Day students; 950,000 Naira per term for Boarding students.
- **Next Session**: Resumes September 15th, 2024.
- **Facilities**: Olympic-sized swimming pool, STEM Robotics Lab, Modern Library, Air-conditioned classrooms.
- **Admissions**: Entrance examinations are held in May and July. Forms cost 10,000 Naira.

Your tone should be professional, welcoming, warm, and respectful, typical of a high-standard Nigerian educational institution.
Answer questions about admissions, fees, curriculum, and school life.
If asked about specific student data (grades, login), politely explain that you are a public assistant and cannot access private records, directing them to the school portal login page.
Keep answers concise (under 100 words) unless detailed explanation is requested.
`;

export const generateAssistantResponse = async (
  userMessage,
  history
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Create chat with history
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I apologize, but I couldn't process that request right now. Please contact the school administration directly.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the school's server. Please check your connection or try again later.";
  }
};