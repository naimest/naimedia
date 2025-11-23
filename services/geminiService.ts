import { GoogleGenAI, Type } from "@google/genai";
import { Account, Client } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseMasterAccountFromText = async (text: string): Promise<Partial<Account>[]> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Extract subscription Master Account details from the text.
    
    Return a JSON array where each object has:
    - 'serviceName' (e.g. Netflix, Spotify)
    - 'email'
    - 'password'
    - 'expiryDate' (Master billing expiry, YYYY-MM-DD). If relative (e.g. "1 month"), calculate from ${new Date().toISOString().split('T')[0]}.
    - 'totalSlots' (Number of slots available in this family plan. Default to 1 if not specified, 5 for Netflix Family, 6 for Spotify Family).
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            serviceName: { type: Type.STRING },
            email: { type: Type.STRING },
            password: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            totalSlots: { type: Type.INTEGER }
          },
          required: ["serviceName", "expiryDate", "totalSlots"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

export const draftRenewalMessage = async (client: Client, serviceName: string, expiryDate: string): Promise<string> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write a short, friendly WhatsApp renewal reminder for a client.
    
    Client Name: ${client.name}
    Service: ${serviceName}
    Expiry Date: ${expiryDate}
    
    Message should be concise, mention the date, and ask if they want to renew.`,
  });

  return response.text || "Could not generate message.";
};

export const checkBusinessInsights = async (accounts: Account[], clients: Client[]): Promise<string> => {
    const ai = getClient();
    
    const stats = {
        totalAccounts: accounts.length,
        totalClients: clients.length,
        slotsUsage: accounts.map(a => `${a.serviceName}: ${a.slots.filter(s => s.clientId).length}/${a.totalSlots} slots used`),
        masterHealth: accounts.map(a => ({ service: a.serviceName, status: a.status }))
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this subscription business data and give a 2-sentence summary of health and opportunities (e.g. "High utilization on Netflix, consider buying another family plan.").
        Data: ${JSON.stringify(stats)}`
    });
    return response.text || "No insights available.";
}