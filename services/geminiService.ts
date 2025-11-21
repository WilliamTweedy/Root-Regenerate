import { GoogleGenAI, Type } from "@google/genai";
import { SoilDiagnosisInputs, PlantingPlanInputs, PlantingPlanResponse, DiagnosisResponse } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const apiKey = process.env.API_KEY;

// Initialize AI only if key exists, otherwise methods will throw
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = "gemini-2.5-flash";

export const generateSoilDiagnosis = async (inputs: SoilDiagnosisInputs): Promise<DiagnosisResponse> => {
  if (!ai || !apiKey) {
    throw new Error("API Key is missing. Please check your settings or .env file.");
  }

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
      
      Return the result in strictly valid JSON format matching the schema provided.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthTitle: { type: Type.STRING, description: "A short 3-5 word summary title of the soil condition" },
            healthScore: { type: Type.NUMBER, description: "A number 1-10 rating the soil health based on inputs" },
            diagnosisSummary: { type: Type.STRING, description: "A 2-3 sentence explanation of what is happening in the soil." },
            immediateActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            longTermStrategy: { type: Type.STRING, description: "Paragraph on maintaining fertility over seasons." },
            recommendedPlants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Cover Crop", "Vegetable", "Flower"] }
                }
              }
            }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up potential Markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as DiagnosisResponse;

  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw new Error("Failed to analyze soil data.");
  }
};

export const generatePlantingPlan = async (inputs: PlantingPlanInputs): Promise<PlantingPlanResponse> => {
  if (!ai || !apiKey) {
    throw new Error("API Key is missing. Please check your settings or .env file.");
  }

  try {
    const parts: any[] = [];

    // Add Images if available
    if (inputs.seedInputType === 'image' && inputs.seedImages.length > 0) {
       inputs.seedImages.forEach(img => {
         parts.push({
           inlineData: {
             mimeType: img.mimeType,
             data: img.base64
           }
         });
       });
       parts.push({ text: "These images show the seed packets or list of seeds I have available." });
    } else if (inputs.seedText) {
      parts.push({ text: `I have the following seeds: ${inputs.seedText}` });
    }

    // Construct the main prompt
    const promptText = `
      You are an expert market gardener specializing in **Succession Planting** and **Intercropping** (inspired by Huw Richards and Charles Dowding).
      
      User Parameters:
      - **Location:** ${inputs.location} (Use this to determine frost dates and growing season).
      - **Growing Space:** ${inputs.spaceSize} ${inputs.spaceUnit}.
      
      Based on the seeds provided (read from the images or text above), create a comprehensive planting plan.
      
      Return the result in strictly valid JSON format matching the schema provided.
      
      Fields:
      - seasonalStrategy: A brief, encouraging summary of the season ahead for this specific space.
      - schedule: An array of crops with specific dates for this location.
      - successionPlans: 2-3 specific suggestions for what to plant after a harvest.
      - spaceMaximizationTip: One killer tip for this space size.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seasonalStrategy: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cropName: { type: Type.STRING },
                  sowIndoors: { type: Type.STRING, description: "Date range or 'N/A'" },
                  sowOutdoors: { type: Type.STRING, description: "Date range or 'N/A'" },
                  transplant: { type: Type.STRING, description: "Date range or 'N/A'" },
                  harvest: { type: Type.STRING, description: "Estimated harvest month/time" },
                  notes: { type: Type.STRING, description: "Spacing or interplanting tip" }
                },
                required: ["cropName", "harvest", "notes"]
              }
            },
            successionPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalCrop: { type: Type.STRING },
                  followUpCrop: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            spaceMaximizationTip: { type: Type.STRING }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean up potential Markdown code blocks that Gemini sometimes adds despite responseMimeType
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as PlantingPlanResponse;

  } catch (error) {
    console.error("Error generating planting plan:", error);
    throw new Error("Failed to generate planting plan.");
  }
};