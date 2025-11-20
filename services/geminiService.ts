import { GoogleGenAI, Type } from "@google/genai";
import { SoilDiagnosisInputs } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const generateSoilDiagnosis = async (inputs: SoilDiagnosisInputs): Promise<string> => {
  try {
    const prompt = `
      You are an expert gardening consultant specializing in **Huw Richards' Minimal Disturbance Gardening** and **No-Dig** methods.
      
      The user has provided the following details about their garden soil:
      - **Texture:** ${inputs.texture}
      - **Compaction:** ${inputs.compaction}
      - **Drainage:** ${inputs.drainage}
      - **Biodiversity:** ${inputs.biodiversity}
      - **Surface Condition:** ${inputs.surface}
      - **Specific Concern:** ${inputs.specificConcern || "None provided"}

      Based strictly on **Minimal Disturbance** principles (No-Dig, keeping soil covered, keeping living roots in the ground, minimizing chemical use), provide a detailed diagnosis and action plan.
      
      Structure your response in Markdown with the following sections:
      1.  **Diagnosis**: Briefly explain what the current symptoms indicate about the soil health.
      2.  **Immediate Remediation (The No-Dig Way)**: Step-by-step instructions on how to fix this *without* turning the soil (e.g., using cardboard, compost, aeration without flipping).
      3.  **Long-term Maintenance**: How to maintain fertility and structure over the coming seasons.
      4.  **Recommended Plants**: Suggest 3-4 plants (cover crops or vegetables) that would help improve this specific condition (e.g., daikon radish for compaction, legumes for nitrogen).

      Tone: Encouraging, practical, and earthy.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Sorry, I couldn't generate a diagnosis at this time. Please try again.";
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw new Error("Failed to analyze soil data.");
  }
};